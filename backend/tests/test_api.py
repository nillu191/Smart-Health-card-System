import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta

from backend.app.core.database import Base, get_db
from backend.app.main import app
from backend.app.crud import crud
from backend.app.models import models

# Use a test SQLite database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_smarthealth.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="module")
def db():
    Base.metadata.create_all(bind=engine)
    db_session = TestingSessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="module")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()

def test_patient_registration_and_login(client):
    # Register patient
    payload = {
        "date_of_birth": "1992-12-01",
        "gender": "Female",
        "blood_group": "B-Positive",
        "emergency_contact_name": "Bob Smith",
        "emergency_contact_phone": "555-9876",
        "address": "456 Oak Rd",
        "user": {
            "username": "pat_test",
            "email": "pat_test@gmail.com",
            "password": "testpassword",
            "role": "patient"
        }
    }
    response = client.post("/api/auth/register/patient", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["health_id"].startswith("SH-")
    assert data["user"]["username"] == "pat_test"

    # Login
    login_payload = {
        "username": "pat_test",
        "password": "testpassword"
    }
    login_response = client.post("/api/auth/login", data=login_payload)
    assert login_response.status_code == 200
    login_data = login_response.json()
    assert "access_token" in login_data
    assert login_data["role"] == "patient"

def test_doctor_registration_and_login(client):
    # Register doctor with NMR ID
    payload = {
        "specialization": "Pediatrics",
        "license_number": "LIC-TEST-1",
        "nmr_id": "NMR-2024-TEST-1",
        "hospital_id": None,
        "user": {
            "username": "doc_test",
            "email": "doc_test@gmail.com",
            "password": "docpassword",
            "role": "doctor"
        }
    }
    response = client.post("/api/auth/register/doctor", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["specialization"] == "Pediatrics"
    assert data["nmr_id"] == "NMR-2024-TEST-1"

    # Step 1: Verify Doctor NMR ID
    verify_res = client.post("/api/auth/doctor/verify-nmr", json={"nmr_id": "NMR-2024-TEST-1"})
    assert verify_res.status_code == 200
    verify_data = verify_res.json()
    assert verify_data["valid"] is True
    assert verify_data["specialization"] == "Pediatrics"

    # Verify invalid NMR ID fails
    invalid_res = client.post("/api/auth/doctor/verify-nmr", json={"nmr_id": "NON-EXISTENT-NMR"})
    assert invalid_res.status_code == 404

    # Step 2: Login via NMR ID & Password
    nmr_login_res = client.post("/api/auth/doctor/login-nmr", json={
        "nmr_id": "NMR-2024-TEST-1",
        "password": "docpassword"
    })
    assert nmr_login_res.status_code == 200
    nmr_login_data = nmr_login_res.json()
    assert "access_token" in nmr_login_data
    assert nmr_login_data["role"] == "doctor"
    assert nmr_login_data["nmr_id"] == "NMR-2024-TEST-1"

    # Standard OAuth2 Login also works
    login_payload = {
        "username": "doc_test",
        "password": "docpassword"
    }
    login_response = client.post("/api/auth/login", data=login_payload)
    assert login_response.status_code == 200

def test_consent_and_emergency_access(client, db):
    # Get tokens
    pat_token = client.post("/api/auth/login", data={"username": "pat_test", "password": "testpassword"}).json()["access_token"]
    doc_token = client.post("/api/auth/login", data={"username": "doc_test", "password": "docpassword"}).json()["access_token"]

    # Get patient profile using patient credentials
    pat_profile = client.get("/api/patients/me/profile", headers={"Authorization": f"Bearer {pat_token}"}).json()
    health_id = pat_profile["patient"]["health_id"]
    doctor_id = db.query(models.Doctor).join(models.User).filter(models.User.username == "doc_test").first().id

    # Doctor tries to access patient record (expected 403 Access Denied)
    res_unauth = client.get(f"/api/patients/{health_id}", headers={"Authorization": f"Bearer {doc_token}"})
    assert res_unauth.status_code == 403
    assert res_unauth.json()["detail"] == "ACCESS_DENIED_CONSENT_REQUIRED"

    # Access emergency card (expected 200 and limited emergency details)
    res_emerg = client.get(f"/api/patients/{health_id}/emergency")
    assert res_emerg.status_code == 200
    emerg_data = res_emerg.json()
    assert emerg_data["blood_group"] == "B-Positive"
    assert emerg_data["emergency_contact_phone"] == "555-9876"
    assert "current_medications" in emerg_data

    # Patient grants doctor consent
    consent_res = client.post(
        f"/api/patients/{health_id}/consent",
        headers={"Authorization": f"Bearer {pat_token}"},
        json={"doctor_id": doctor_id, "expires_in_hours": 1}
    )
    assert consent_res.status_code == 200

    # Doctor tries to access patient record again (expected 200)
    res_auth = client.get(f"/api/patients/{health_id}", headers={"Authorization": f"Bearer {doc_token}"})
    assert res_auth.status_code == 200
    assert res_auth.json()["patient"]["health_id"] == health_id
