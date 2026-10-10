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

def test_previous_prescriptions_flow(client, db):
    # 1. Register a new patient with previous prescriptions attached during signup
    signup_payload = {
        "date_of_birth": "1988-03-22",
        "gender": "Male",
        "blood_group": "A-Positive",
        "emergency_contact_name": "Alice Johnson",
        "emergency_contact_phone": "555-1122",
        "address": "789 Pine Ave",
        "user": {
            "username": "pat_with_rx",
            "email": "pat_with_rx@example.com",
            "password": "rxpassword123",
            "role": "patient"
        },
        "previous_prescriptions": [
            {
                "title": "Hypertension Baseline Rx",
                "doctor_name": "Dr. Miller",
                "prescription_date": "2023-08-15",
                "source": "local_storage",
                "file_name": "prior_bp_meds.jpg",
                "file_type": "image/jpeg",
                "file_data": "data:image/jpeg;base64,mockjpegdata123",
                "notes": "Diagnosed with stage 1 hypertension",
                "medications_summary": "Amlodipine 5mg"
            }
        ]
    }
    reg_res = client.post("/api/auth/register/patient", json=signup_payload)
    assert reg_res.status_code == 200
    pat_data = reg_res.json()
    health_id = pat_data["health_id"]

    # 2. Login as patient
    pat_token = client.post("/api/auth/login", data={"username": "pat_with_rx", "password": "rxpassword123"}).json()["access_token"]

    # 3. Fetch patient's own profile and check previous prescription
    profile_res = client.get("/api/patients/me/profile", headers={"Authorization": f"Bearer {pat_token}"})
    assert profile_res.status_code == 200
    profile_data = profile_res.json()
    assert len(profile_data["previous_prescriptions"]) == 1
    assert profile_data["previous_prescriptions"][0]["title"] == "Hypertension Baseline Rx"
    assert profile_data["previous_prescriptions"][0]["source"] == "local_storage"
    rx_id_1 = profile_data["previous_prescriptions"][0]["id"]

    # 4. Add another previous prescription from Google Drive via portal endpoint
    new_rx_res = client.post(
        "/api/patients/me/prescriptions",
        headers={"Authorization": f"Bearer {pat_token}"},
        json={
            "title": "Pulmonology Inhaler Drive Scan",
            "doctor_name": "Dr. Davis",
            "prescription_date": "2024-01-10",
            "source": "google_drive",
            "file_name": "pulm_rx.pdf",
            "file_type": "link",
            "file_data": "https://drive.google.com/file/d/sample123/view",
            "notes": "Asthma review",
            "medications_summary": "Albuterol Inhaler"
        }
    )
    assert new_rx_res.status_code == 200
    rx_id_2 = new_rx_res.json()["id"]

    # 5. Doctor logs in and accesses patient profile after consent
    doc_token = client.post("/api/auth/login", data={"username": "doc_test", "password": "docpassword"}).json()["access_token"]
    doctor_id = db.query(models.Doctor).join(models.User).filter(models.User.username == "doc_test").first().id

    # Grant consent
    client.post(
        f"/api/patients/{health_id}/consent",
        headers={"Authorization": f"Bearer {pat_token}"},
        json={"doctor_id": doctor_id, "expires_in_hours": 2}
    )

    # Doctor views patient profile
    doc_view_res = client.get(f"/api/patients/{health_id}", headers={"Authorization": f"Bearer {doc_token}"})
    assert doc_view_res.status_code == 200
    doc_view_data = doc_view_res.json()
    assert len(doc_view_data["previous_prescriptions"]) == 2
    titles = [p["title"] for p in doc_view_data["previous_prescriptions"]]
    assert "Hypertension Baseline Rx" in titles
    assert "Pulmonology Inhaler Drive Scan" in titles

    # 6. Delete a prescription
    del_res = client.delete(f"/api/patients/me/prescriptions/{rx_id_1}", headers={"Authorization": f"Bearer {pat_token}"})
    assert del_res.status_code == 200

    # Verify 1 remains
    profile_after = client.get("/api/patients/me/profile", headers={"Authorization": f"Bearer {pat_token}"}).json()
    assert len(profile_after["previous_prescriptions"]) == 1

def test_qr_scanner_token_verification_and_active_status(client, db):
    # 1. Login doctor
    doc_token = client.post("/api/auth/login", data={"username": "doc_test", "password": "docpassword"}).json()["access_token"]
    
    # 2. Get patient and create a QR token
    patient = db.query(models.Patient).first()
    assert patient is not None
    
    token_str = "QR-TEST-VERIFY-ACTIVE-123"
    expires_at = datetime.utcnow() + timedelta(hours=24)
    db_token = models.QRToken(
        patient_id=patient.id,
        token=token_str,
        status="pending",  # initially pending or newly issued
        expires_at=expires_at
    )
    db.add(db_token)
    db.commit()
    db.refresh(db_token)

    # 3. Doctor scans the patient's QR code in instant patient identification pipeline
    scan_res = client.post(
        "/api/qr/scan",
        headers={"Authorization": f"Bearer {doc_token}"},
        json={"token": token_str}
    )
    assert scan_res.status_code == 200
    scan_data = scan_res.json()
    assert scan_data["patient"]["health_id"] == patient.health_id

    # 4. Verify in the database that the QR code token status is active
    db.expire_all()
    queried_token = db.query(models.QRToken).filter(models.QRToken.token == token_str).first()
    assert queried_token is not None
    assert queried_token.status == "active"
    
    # 5. Verify the active qr token is returned in profile response
    active_tokens = [t["token"] for t in scan_data["qr_tokens"]]
    assert token_str in active_tokens

def test_public_qr_view_for_mobile_scanners(client, db):
    patient = db.query(models.Patient).first()
    assert patient is not None
    
    # Generate a QR token for the patient
    token_str = "QR-PUBLIC-MOBILE-SCAN-456"
    expires_at = datetime.utcnow() + timedelta(hours=24)
    db_token = models.QRToken(
        patient_id=patient.id,
        token=token_str,
        status="active",
        expires_at=expires_at
    )
    db.add(db_token)
    db.commit()

    # Public phone scan without login token
    res = client.get(f"/api/qr/view/{token_str}")
    assert res.status_code == 200
    data = res.json()
    assert data["patient"]["blood_group"] == patient.blood_group
    assert data["patient"]["date_of_birth"] == patient.date_of_birth
    assert "previous_prescriptions" in data

def test_restricted_medical_history_qr_scan_flow(client, db):
    patient = db.query(models.Patient).first()
    assert patient is not None

    # 1. Valid Active Token
    valid_token = "QR-SECURE-MED-HIST-789"
    db_token = models.QRToken(
        patient_id=patient.id,
        token=valid_token,
        status="active",
        expires_at=datetime.utcnow() + timedelta(hours=24)
    )
    db.add(db_token)
    db.commit()

    res = client.get(f"/api/medical-history/{valid_token}")
    assert res.status_code == 200
    data = res.json()
    assert data["health_id"] == patient.health_id
    assert "previous_prescriptions" in data
    assert "clinical_prescriptions" in data
    assert "blood_group" not in data
    assert "emergency_contact_phone" not in data

    # 2. Invalid Token -> 404
    res_invalid = client.get("/api/medical-history/NON_EXISTENT_TOKEN_999")
    assert res_invalid.status_code == 404

    # 3. Expired Token -> 410
    expired_token = "QR-EXPIRED-TOKEN-001"
    db_expired = models.QRToken(
        patient_id=patient.id,
        token=expired_token,
        status="active",
        expires_at=datetime.utcnow() - timedelta(hours=1)
    )
    db.add(db_expired)
    db.commit()

    res_exp = client.get(f"/api/medical-history/{expired_token}")
    assert res_exp.status_code == 410

    # 4. Revoked Token -> 410
    revoked_token = "QR-REVOKED-TOKEN-002"
    db_revoked = models.QRToken(
        patient_id=patient.id,
        token=revoked_token,
        status="revoked",
        expires_at=datetime.utcnow() + timedelta(hours=24),
        revoked_at=datetime.utcnow()
    )
    db.add(db_revoked)
    db.commit()

    res_rev = client.get(f"/api/medical-history/{revoked_token}")
    assert res_rev.status_code == 410



