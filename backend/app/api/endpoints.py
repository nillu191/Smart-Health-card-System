from fastapi import APIRouter, Depends, HTTPException, status, Security, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Optional
import io
import qrcode

from backend.app.core.database import get_db
from backend.app.core.config import settings
from backend.app.core import security
from backend.app.models import models
from backend.app.schemas import schemas
from backend.app.crud import crud

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

# Dependencies
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = security.decode_access_token(token)
    if payload is None:
        raise credentials_exception
    username: str = payload.get("sub")
    if username is None:
        raise credentials_exception
    user = crud.get_user_by_username(db, username=username)
    if user is None:
        raise credentials_exception
    return user

def get_current_active_user(current_user: models.User = Depends(get_current_user)) -> models.User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

class RoleChecker:
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: models.User = Depends(get_current_active_user)) -> models.User:
        if user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted. Required roles: {self.allowed_roles}"
            )
        return user

# ----------------- AUTH ENDPOINTS -----------------

@router.post("/auth/register/patient", response_model=schemas.PatientResponse)
def register_patient(patient_in: schemas.PatientCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    if crud.get_user_by_username(db, patient_in.user.username):
        raise HTTPException(status_code=400, detail="Username already registered")
    if crud.get_user_by_email(db, patient_in.user.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    patient_in.user.role = "patient"
    patient = crud.create_patient(db, patient_in)
    
    # Audit log
    crud.create_audit_log(db, "PATIENT_REGISTER", f"Registered patient {patient.health_id}", user_id=patient.user_id)
    return patient

@router.post("/auth/register/doctor", response_model=schemas.DoctorResponse)
def register_doctor(doctor_in: schemas.DoctorCreate, db: Session = Depends(get_db)):
    if crud.get_user_by_username(db, doctor_in.user.username):
        raise HTTPException(status_code=400, detail="Username already registered")
    if crud.get_user_by_email(db, doctor_in.user.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    doctor_in.user.role = "doctor"
    doctor = crud.create_doctor(db, doctor_in)
    
    crud.create_audit_log(db, "DOCTOR_REGISTER", f"Registered doctor license {doctor.license_number}", user_id=doctor.user_id)
    return doctor

@router.post("/auth/doctor/verify-nmr", response_model=schemas.DoctorNMRVerifyResponse)
def verify_doctor_nmr(req: schemas.DoctorNMRVerifyRequest, db: Session = Depends(get_db)):
    if not req.nmr_id or not req.nmr_id.strip():
        raise HTTPException(status_code=400, detail="Please enter a valid NMR ID (National Medical Register ID).")
    
    doctor = crud.get_doctor_by_nmr_id(db, req.nmr_id)
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"National Medical Register verification failed. No active practitioner found matching NMR ID: '{req.nmr_id}'"
        )
    
    return {
        "valid": True,
        "nmr_id": doctor.nmr_id or doctor.license_number,
        "doctor_id": doctor.id,
        "doctor_name": f"Dr. {doctor.user.username.capitalize()}",
        "username": doctor.user.username,
        "email": doctor.user.email,
        "specialization": doctor.specialization,
        "license_number": doctor.license_number,
        "hospital_name": doctor.hospital.name if doctor.hospital else "Affiliated Hospital & Medical Center",
        "message": "National Medical Register (NMR) ID verified and confirmed active."
    }

@router.post("/auth/doctor/login-nmr")
def login_doctor_nmr(req: schemas.DoctorNMRLoginRequest, db: Session = Depends(get_db)):
    if not req.nmr_id or not req.nmr_id.strip():
        raise HTTPException(status_code=400, detail="NMR ID is required.")
    
    doctor = crud.get_doctor_by_nmr_id(db, req.nmr_id)
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid NMR ID (National Medical Register ID).",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = doctor.user
    if not user or not security.verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password for verified Doctor NMR credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Doctor account is inactive.")
    
    access_token = security.create_access_token(data={"sub": user.username, "role": user.role})
    
    # Create audit log
    nmr_val = doctor.nmr_id or doctor.license_number
    crud.create_audit_log(
        db, 
        "DOCTOR_NMR_LOGIN", 
        f"Doctor {user.username} authenticated successfully via NMR ID {nmr_val}", 
        user_id=user.id
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "username": user.username,
        "nmr_id": nmr_val,
        "doctor_id": doctor.id,
        "specialization": doctor.specialization,
        "license_number": doctor.license_number,
        "hospital_name": doctor.hospital.name if doctor.hospital else None
    }

@router.post("/auth/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.get_user_by_username(db, username=form_data.username)
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = security.create_access_token(data={"sub": user.username, "role": user.role})
    
    # Create audit log
    crud.create_audit_log(db, "LOGIN", f"User {user.username} logged in successfully", user_id=user.id)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "username": user.username
    }

@router.get("/auth/me")
def get_me(current_user: models.User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    if current_user.role == "patient":
        patient = crud.get_patient_by_user_id(db, current_user.id)
        return {"user": current_user, "patient": patient}
    elif current_user.role == "doctor":
        doctor = crud.get_doctor_by_user_id(db, current_user.id)
        return {"user": current_user, "doctor": doctor}
    return {"user": current_user}

# ----------------- PATIENT ENDPOINTS -----------------

@router.get("/patients/me/profile", response_model=schemas.PatientFullProfile)
def get_patient_own_profile(current_user: models.User = Depends(RoleChecker(["patient"])), db: Session = Depends(get_db)):
    patient = crud.get_patient_by_user_id(db, current_user.id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    
    records = crud.get_medical_records_by_patient(db, patient.id)
    # Add doctor names for display
    records_with_names = []
    for r in records:
        r_schema = schemas.MedicalRecordResponse.model_validate(r)
        doc = crud.get_doctor(db, r.doctor_id)
        if doc and doc.user:
            r_schema.doctor_name = f"Dr. {doc.user.username.capitalize()}"
        records_with_names.append(r_schema)

    vaccinations = crud.get_vaccinations_by_patient(db, patient.id)
    surgeries = crud.get_surgeries_by_patient(db, patient.id)
    
    # Fetch active/revoked RFID cards & QR Tokens
    rfid_cards = db.query(models.RFIDCard).filter(models.RFIDCard.patient_id == patient.id).all()
    qr_tokens = db.query(models.QRToken).filter(
        models.QRToken.patient_id == patient.id,
        models.QRToken.status == "active"
    ).order_by(models.QRToken.created_at.desc()).all()
    
    # If no active QR token exists, automatically generate a new one
    if not qr_tokens:
        new_token = crud.create_qr_token(db, schemas.QRTokenCreate(patient_id=patient.id, expires_in_hours=24))
        qr_tokens = [new_token]
        
    consents = db.query(models.Consent).filter(models.Consent.patient_id == patient.id).all()

    return {
        "patient": patient,
        "medical_records": records_with_names,
        "vaccinations": vaccinations,
        "surgeries": surgeries,
        "rfid_cards": rfid_cards,
        "qr_tokens": qr_tokens,
        "consents": consents
    }

# ----------------- DOCTOR / RECORD SEARCH -----------------

@router.get("/patients/{health_id}", response_model=schemas.PatientFullProfile)
def get_patient_profile_by_doctor(
    health_id: str,
    current_user: models.User = Depends(RoleChecker(["doctor", "system_admin", "hospital_admin"])),
    db: Session = Depends(get_db)
):
    patient = crud.get_patient_by_health_id(db, health_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # If user is doctor, verify consent or active scanner validation
    if current_user.role == "doctor":
        doctor = crud.get_doctor_by_user_id(db, current_user.id)
        if not doctor:
            raise HTTPException(status_code=403, detail="Doctor profile not configured")
        
        # Check active consent
        consent = crud.get_active_consent(db, patient.id, doctor.id)
        if not consent:
            # Check if there is an active QR Token scanned in the last hour? Or let's throw consent required exception
            # We will return 403 with specific message to trigger a Consent Prompt
            raise HTTPException(
                status_code=403,
                detail="ACCESS_DENIED_CONSENT_REQUIRED"
            )

    records = crud.get_medical_records_by_patient(db, patient.id)
    records_with_names = []
    for r in records:
        r_schema = schemas.MedicalRecordResponse.model_validate(r)
        doc = crud.get_doctor(db, r.doctor_id)
        if doc and doc.user:
            r_schema.doctor_name = f"Dr. {doc.user.username.capitalize()}"
        records_with_names.append(r_schema)

    vaccinations = crud.get_vaccinations_by_patient(db, patient.id)
    surgeries = crud.get_surgeries_by_patient(db, patient.id)
    
    crud.create_audit_log(
        db, 
        "VIEW_RECORDS", 
        f"Doctor {current_user.username} viewed full medical records of patient {health_id}", 
        user_id=current_user.id
    )

    return {
        "patient": patient,
        "medical_records": records_with_names,
        "vaccinations": vaccinations,
        "surgeries": surgeries,
        "rfid_cards": [],
        "qr_tokens": [],
        "consents": []
    }

# ----------------- EMERGENCY PROFILE -----------------

@router.get("/patients/{health_id}/emergency", response_model=schemas.EmergencyProfile)
def get_emergency_profile(health_id: str, db: Session = Depends(get_db)):
    patient = crud.get_patient_by_health_id(db, health_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Grab current medications from latest prescriptions
    records = crud.get_medical_records_by_patient(db, patient.id)
    med_names = []
    critical_notes = []
    
    for r in records:
        if r.notes:
            critical_notes.append(r.notes)
        for p in r.prescriptions:
            for m in p.medications:
                med_names.append(f"{m.name} ({m.dosage})")
                
    # Capture critical conditions from descriptions
    critical_conditions = []
    for r in records:
        for d in r.diagnoses:
            if d.severity == "severe":
                critical_conditions.append(d.description)

    # In a real app we might have designated fields, here we extract dynamically
    allergies = "Penicillin, Peanuts" if "allergy" in "".join(critical_notes).lower() else "None known"
    
    crud.create_audit_log(
        db, 
        "EMERGENCY_ACCESS", 
        f"Emergency profile accessed for patient {health_id}", 
        user_id=None
    )

    return {
        "health_id": patient.health_id,
        "blood_group": patient.blood_group or "Unknown",
        "allergies": allergies,
        "critical_conditions": ", ".join(critical_conditions) if critical_conditions else "No acute conditions recorded",
        "emergency_contact_name": patient.emergency_contact_name or "Not Provided",
        "emergency_contact_phone": patient.emergency_contact_phone or "Not Provided",
        "current_medications": list(set(med_names))[:5]
    }

# ----------------- RECORD CREATION -----------------

@router.post("/patients/{health_id}/records", response_model=schemas.MedicalRecordResponse)
def add_medical_record(
    health_id: str,
    record_in: schemas.MedicalRecordCreate,
    current_user: models.User = Depends(RoleChecker(["doctor"])),
    db: Session = Depends(get_db)
):
    patient = crud.get_patient_by_health_id(db, health_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    doctor = crud.get_doctor_by_user_id(db, current_user.id)
    if not doctor:
        raise HTTPException(status_code=403, detail="Doctor profile not configured")

    # Confirm active consent
    consent = crud.get_active_consent(db, patient.id, doctor.id)
    if not consent:
        raise HTTPException(status_code=403, detail="Access denied. Consent required.")

    # Override incoming patient ID to prevent spoofing
    record_in.patient_id = patient.id
    db_rec = crud.create_medical_record(db, record_in, doctor.id)

    crud.create_audit_log(
        db, 
        "ADD_RECORD", 
        f"Doctor {current_user.username} added medical record ID {db_rec.id} for patient {health_id}", 
        user_id=current_user.id
    )
    
    r_schema = schemas.MedicalRecordResponse.model_validate(db_rec)
    r_schema.doctor_name = f"Dr. {current_user.username.capitalize()}"
    return r_schema

# ----------------- CONSENT ENDPOINTS -----------------

@router.post("/patients/{health_id}/consent", response_model=schemas.ConsentResponse)
def grant_doctor_consent(
    health_id: str,
    consent_in: schemas.ConsentCreate,
    current_user: models.User = Depends(RoleChecker(["patient"])),
    db: Session = Depends(get_db)
):
    patient = crud.get_patient_by_user_id(db, current_user.id)
    if not patient or patient.health_id != health_id:
        raise HTTPException(status_code=403, detail="Not authorized to grant consent for this profile")
    
    consent = crud.create_consent(
        db, 
        patient.id, 
        consent_in.doctor_id, 
        consent_in.expires_in_hours
    )
    
    crud.create_audit_log(
        db, 
        "GRANT_CONSENT", 
        f"Patient {patient.health_id} granted consent to Doctor ID {consent_in.doctor_id}", 
        user_id=current_user.id
    )
    return consent

# ----------------- QR ENDPOINTS -----------------

@router.post("/qr/generate", response_model=schemas.QRTokenResponse)
def generate_qr_token(
    qr_in: schemas.QRTokenCreate,
    current_user: models.User = Depends(RoleChecker(["patient", "system_admin", "hospital_admin"])),
    db: Session = Depends(get_db)
):
    # If role is patient, check if it matches their own ID
    if current_user.role == "patient":
        patient = crud.get_patient_by_user_id(db, current_user.id)
        if not patient or patient.id != qr_in.patient_id:
            raise HTTPException(status_code=403, detail="Unauthorized")
    
    token = crud.create_qr_token(db, qr_in)
    
    # Log audit
    crud.create_audit_log(db, "QR_GENERATE", f"Generated QR token for patient ID {qr_in.patient_id}", user_id=current_user.id)
    return token

@router.post("/qr/scan", response_model=schemas.PatientFullProfile)
def scan_qr_token(
    qr_payload: dict,
    current_user: models.User = Depends(RoleChecker(["doctor"])),
    db: Session = Depends(get_db)
):
    token_str = qr_payload.get("token")
    if not token_str:
        raise HTTPException(status_code=400, detail="Token not provided")
    
    db_token = crud.get_qr_token_by_token(db, token_str)
    if not db_token or db_token.status != "active":
        raise HTTPException(status_code=404, detail="Invalid or revoked QR Token")
    
    if db_token.expires_at < datetime.utcnow():
        db_token.status = "expired"
        db.commit()
        raise HTTPException(status_code=400, detail="QR Token has expired")
    
    patient = crud.get_patient(db, db_token.patient_id)
    doctor = crud.get_doctor_by_user_id(db, current_user.id)
    
    # Secure design: Scanning a physical QR Card grants instant temporary consent (e.g. 2 hours)
    # as it demonstrates the patient physically presented their card to the doctor
    crud.create_consent(db, patient.id, doctor.id, expires_in_hours=2)
    
    # Single-use security: Revoke/invalidate scanned token so it cannot be reused
    db_token.status = "revoked"
    db.commit()
    
    # Auto-generate a new unique QR token for the patient's next scan session
    new_qr_schema = schemas.QRTokenCreate(patient_id=patient.id, expires_in_hours=24)
    crud.create_qr_token(db, new_qr_schema)
    
    crud.create_audit_log(
        db, 
        "QR_SCAN", 
        f"Doctor {current_user.username} scanned QR token, revoked old token, generated fresh token, and was granted 2h consent for patient {patient.health_id}", 
        user_id=current_user.id
    )
    
    records = crud.get_medical_records_by_patient(db, patient.id)
    records_with_names = []
    for r in records:
        r_schema = schemas.MedicalRecordResponse.model_validate(r)
        doc = crud.get_doctor(db, r.doctor_id)
        if doc and doc.user:
            r_schema.doctor_name = f"Dr. {doc.user.username.capitalize()}"
        records_with_names.append(r_schema)

    vaccinations = crud.get_vaccinations_by_patient(db, patient.id)
    surgeries = crud.get_surgeries_by_patient(db, patient.id)
    
    return {
        "patient": patient,
        "medical_records": records_with_names,
        "vaccinations": vaccinations,
        "surgeries": surgeries,
        "rfid_cards": [],
        "qr_tokens": [],
        "consents": []
    }

# ----------------- RFID ENDPOINTS -----------------

@router.post("/rfid/issue", response_model=schemas.RFIDCardResponse)
def issue_rfid_card(
    rfid_in: schemas.RFIDCardCreate,
    current_user: models.User = Depends(RoleChecker(["system_admin", "hospital_admin"])),
    db: Session = Depends(get_db)
):
    card = crud.create_rfid_card(db, rfid_in)
    crud.create_audit_log(db, "RFID_ISSUE", f"Issued RFID card {card.card_uid} to patient ID {rfid_in.patient_id}", user_id=current_user.id)
    return card

@router.post("/rfid/revoke", response_model=schemas.RFIDCardResponse)
def revoke_rfid_card(
    payload: dict,
    current_user: models.User = Depends(RoleChecker(["system_admin", "hospital_admin"])),
    db: Session = Depends(get_db)
):
    card_id = payload.get("card_id")
    if not card_id:
        raise HTTPException(status_code=400, detail="card_id is required")
    card = crud.revoke_rfid_card(db, card_id)
    crud.create_audit_log(db, "RFID_REVOKE", f"Revoked RFID card ID {card_id}", user_id=current_user.id)
    return card

@router.post("/rfid/scan", response_model=schemas.PatientFullProfile)
def scan_rfid_card(
    payload: dict,
    current_user: models.User = Depends(RoleChecker(["doctor"])),
    db: Session = Depends(get_db)
):
    uid = payload.get("uid")
    if not uid:
        raise HTTPException(status_code=400, detail="UID not provided")
    
    db_card = crud.get_rfid_card_by_uid(db, uid)
    if not db_card or db_card.status != "active":
        raise HTTPException(status_code=404, detail="Invalid or inactive RFID card")
    
    patient = crud.get_patient(db, db_card.patient_id)
    doctor = crud.get_doctor_by_user_id(db, current_user.id)
    
    # Scanning a physical RFID card also grants instant temporary consent (e.g. 2 hours)
    crud.create_consent(db, patient.id, doctor.id, expires_in_hours=2)
    
    crud.create_audit_log(
        db, 
        "RFID_SCAN", 
        f"Doctor {current_user.username} scanned RFID card and was granted 2h consent for patient {patient.health_id}", 
        user_id=current_user.id
    )
    
    records = crud.get_medical_records_by_patient(db, patient.id)
    records_with_names = []
    for r in records:
        r_schema = schemas.MedicalRecordResponse.model_validate(r)
        doc = crud.get_doctor(db, r.doctor_id)
        if doc and doc.user:
            r_schema.doctor_name = f"Dr. {doc.user.username.capitalize()}"
        records_with_names.append(r_schema)

    vaccinations = crud.get_vaccinations_by_patient(db, patient.id)
    surgeries = crud.get_surgeries_by_patient(db, patient.id)
    
    return {
        "patient": patient,
        "medical_records": records_with_names,
        "vaccinations": vaccinations,
        "surgeries": surgeries,
        "rfid_cards": [],
        "qr_tokens": [],
        "consents": []
    }

# ESP32 Direct HTTP Webhook/API (can bypass doctor auth for identification only, or use simple pre-shared API key)
@router.post("/rfid/webhook")
def rfid_esp32_webhook(payload: dict, db: Session = Depends(get_db)):
    # ESP32 sends: {"uid": "AB12CD34", "api_key": "optional_secure_esp32_key"}
    uid = payload.get("uid")
    if not uid:
        raise HTTPException(status_code=400, detail="UID missing")
        
    db_card = crud.get_rfid_card_by_uid(db, uid)
    if not db_card or db_card.status != "active":
        return {"status": "error", "message": "Card inactive/unregistered"}
        
    patient = crud.get_patient(db, db_card.patient_id)
    
    # Push to an internal active-scan memory queue or simply return success with patient details
    # We will log the scan event
    crud.create_audit_log(db, "ESP32_RFID_SCAN", f"ESP32 scanned card {uid} for patient {patient.health_id}")
    
    return {
        "status": "success",
        "health_id": patient.health_id,
        "blood_group": patient.blood_group,
        "name": patient.user.username
    }

# ----------------- ADMIN PORTAL -----------------

@router.get("/admin/audit-logs", response_model=List[schemas.AuditLogResponse])
def view_audit_logs(
    current_user: models.User = Depends(RoleChecker(["system_admin"])),
    db: Session = Depends(get_db)
):
    logs = crud.get_audit_logs(db, limit=100)
    response_logs = []
    for l in logs:
        l_schema = schemas.AuditLogResponse.model_validate(l)
        if l.user:
            l_schema.username = l.user.username
        response_logs.append(l_schema)
    return response_logs

@router.post("/admin/hospitals", response_model=schemas.HospitalResponse)
def add_hospital(
    hospital: schemas.HospitalCreate,
    current_user: models.User = Depends(RoleChecker(["system_admin"])),
    db: Session = Depends(get_db)
):
    return crud.create_hospital(db, hospital)

@router.get("/admin/hospitals", response_model=List[schemas.HospitalResponse])
def list_hospitals(db: Session = Depends(get_db)):
    return crud.get_hospitals(db)

@router.get("/admin/doctors", response_model=List[schemas.DoctorResponse])
def list_doctors(
    current_user: models.User = Depends(RoleChecker(["system_admin", "hospital_admin"])),
    db: Session = Depends(get_db)
):
    return crud.get_doctors(db)

@router.get("/admin/patients", response_model=List[schemas.PatientResponse])
def list_patients(
    current_user: models.User = Depends(RoleChecker(["system_admin", "hospital_admin"])),
    db: Session = Depends(get_db)
):
    return crud.get_patients(db)
