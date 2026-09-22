import secrets
import string
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional, List
from backend.app.models import models
from backend.app.schemas import schemas
from backend.app.core import security

# User CRUD
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_pw = security.get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_pw,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Hospital CRUD
def create_hospital(db: Session, hospital: schemas.HospitalCreate):
    db_hosp = models.Hospital(**hospital.model_dump())
    db.add(db_hosp)
    db.commit()
    db.refresh(db_hosp)
    return db_hosp

def get_hospitals(db: Session):
    return db.query(models.Hospital).all()

# Doctor CRUD
def get_doctor_by_user_id(db: Session, user_id: int):
    return db.query(models.Doctor).filter(models.Doctor.user_id == user_id).first()

def get_doctor(db: Session, doctor_id: int):
    return db.query(models.Doctor).filter(models.Doctor.id == doctor_id).first()

def get_doctor_by_nmr_id(db: Session, nmr_id: str):
    clean_id = nmr_id.strip()
    return db.query(models.Doctor).filter(
        (models.Doctor.nmr_id.ilike(clean_id)) | (models.Doctor.license_number.ilike(clean_id))
    ).first()

def create_doctor(db: Session, doc_in: schemas.DoctorCreate):
    # First create User
    db_user = create_user(db, doc_in.user)
    # If nmr_id not explicitly provided, generate or default to license_number
    nmr_val = doc_in.nmr_id.strip() if doc_in.nmr_id else f"NMR-{doc_in.license_number.replace('LIC-', '')}"
    db_doc = models.Doctor(
        user_id=db_user.id,
        specialization=doc_in.specialization,
        license_number=doc_in.license_number,
        nmr_id=nmr_val,
        hospital_id=doc_in.hospital_id
    )
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)
    return db_doc

def get_doctors(db: Session):
    return db.query(models.Doctor).all()

# Patient CRUD
def get_patient_by_user_id(db: Session, user_id: int):
    return db.query(models.Patient).filter(models.Patient.user_id == user_id).first()

def get_patient(db: Session, patient_id: int):
    return db.query(models.Patient).filter(models.Patient.id == patient_id).first()

def get_patient_by_health_id(db: Session, health_id: str):
    return db.query(models.Patient).filter(models.Patient.health_id == health_id).first()

def generate_health_id(db: Session) -> str:
    while True:
        part1 = "".join(secrets.choice(string.digits) for _ in range(4))
        part2 = "".join(secrets.choice(string.digits) for _ in range(4))
        health_id = f"SH-{part1}-{part2}"
        if not get_patient_by_health_id(db, health_id):
            return health_id

def create_patient(db: Session, pat_in: schemas.PatientCreate):
    db_user = create_user(db, pat_in.user)
    health_id = generate_health_id(db)
    
    # We will exclude user fields from mapping
    pat_data = pat_in.model_dump(exclude={"user"})
    db_patient = models.Patient(
        user_id=db_user.id,
        health_id=health_id,
        **pat_data
    )
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient

def get_patients(db: Session):
    return db.query(models.Patient).all()

# RFID Card CRUD
def get_rfid_card_by_uid(db: Session, card_uid: str):
    return db.query(models.RFIDCard).filter(models.RFIDCard.card_uid == card_uid).first()

def create_rfid_card(db: Session, rfid_in: schemas.RFIDCardCreate):
    # Deactivate any active cards for this patient first
    db.query(models.RFIDCard).filter(
        models.RFIDCard.patient_id == rfid_in.patient_id, 
        models.RFIDCard.status == "active"
    ).update({"status": "revoked", "revoked_at": datetime.utcnow()})
    
    db_card = models.RFIDCard(
        patient_id=rfid_in.patient_id,
        card_uid=rfid_in.card_uid,
        status="active"
    )
    db.add(db_card)
    db.commit()
    db.refresh(db_card)
    return db_card

def revoke_rfid_card(db: Session, card_id: int):
    db_card = db.query(models.RFIDCard).filter(models.RFIDCard.id == card_id).first()
    if db_card:
        db_card.status = "revoked"
        db_card.revoked_at = datetime.utcnow()
        db.commit()
        db.refresh(db_card)
    return db_card

# QR Token CRUD
def get_qr_token_by_token(db: Session, token: str):
    return db.query(models.QRToken).filter(models.QRToken.token == token).first()

def create_qr_token(db: Session, qr_in: schemas.QRTokenCreate):
    # Revoke old tokens
    db.query(models.QRToken).filter(
        models.QRToken.patient_id == qr_in.patient_id,
        models.QRToken.status == "active"
    ).update({"status": "revoked"})

    token_str = "QR-" + secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=qr_in.expires_in_hours)

    db_token = models.QRToken(
        patient_id=qr_in.patient_id,
        token=token_str,
        status="active",
        expires_at=expires_at
    )
    db.add(db_token)
    db.commit()
    db.refresh(db_token)
    return db_token

def revoke_qr_token(db: Session, qr_id: int):
    db_qr = db.query(models.QRToken).filter(models.QRToken.id == qr_id).first()
    if db_qr:
        db_qr.status = "revoked"
        db.commit()
        db.refresh(db_qr)
    return db_qr

# Medical Records CRUD
def create_medical_record(db: Session, rec_in: schemas.MedicalRecordCreate, doctor_id: int):
    # Create main Medical Record
    db_rec = models.MedicalRecord(
        patient_id=rec_in.patient_id,
        doctor_id=doctor_id,
        symptoms=rec_in.symptoms,
        notes=rec_in.notes
    )
    db.add(db_rec)
    db.commit()
    db.refresh(db_rec)

    # Add Diagnoses
    for diag in rec_in.diagnoses:
        db_diag = models.Diagnosis(
            medical_record_id=db_rec.id,
            **diag.model_dump()
        )
        db.add(db_diag)

    # Add Prescriptions & Medications
    for pres in rec_in.prescriptions:
        db_pres = models.Prescription(
            medical_record_id=db_rec.id,
            instructions=pres.instructions
        )
        db.add(db_pres)
        db.commit()
        db.refresh(db_pres)

        for med in pres.medications:
            db_med = models.Medication(
                prescription_id=db_pres.id,
                **med.model_dump()
            )
            db.add(db_med)

    # Add Lab Reports
    for report in rec_in.lab_reports:
        db_report = models.LabReport(
            medical_record_id=db_rec.id,
            **report.model_dump()
        )
        db.add(db_report)

    db.commit()
    db.refresh(db_rec)
    return db_rec

def get_medical_records_by_patient(db: Session, patient_id: int):
    return db.query(models.MedicalRecord).filter(models.MedicalRecord.patient_id == patient_id).order_by(models.MedicalRecord.visit_date.desc()).all()

# Vaccinations
def create_vaccination(db: Session, vac_in: schemas.VaccinationCreate):
    db_vac = models.Vaccination(
        patient_id=vac_in.patient_id,
        vaccine_name=vac_in.vaccine_name,
        administered_by=vac_in.administered_by,
        administered_at=vac_in.administered_at or datetime.utcnow(),
        next_due_date=vac_in.next_due_date
    )
    db.add(db_vac)
    db.commit()
    db.refresh(db_vac)
    return db_vac

def get_vaccinations_by_patient(db: Session, patient_id: int):
    return db.query(models.Vaccination).filter(models.Vaccination.patient_id == patient_id).all()

# Surgeries
def create_surgery(db: Session, surg_in: schemas.SurgeryCreate):
    db_surg = models.Surgery(**surg_in.model_dump())
    db.add(db_surg)
    db.commit()
    db.refresh(db_surg)
    return db_surg

def get_surgeries_by_patient(db: Session, patient_id: int):
    return db.query(models.Surgery).filter(models.Surgery.patient_id == patient_id).all()

# Consents
def get_active_consent(db: Session, patient_id: int, doctor_id: int):
    return db.query(models.Consent).filter(
        models.Consent.patient_id == patient_id,
        models.Consent.doctor_id == doctor_id,
        models.Consent.access_granted == True,
        models.Consent.expires_at > datetime.utcnow()
    ).first()

def create_consent(db: Session, patient_id: int, doctor_id: int, expires_in_hours: int = 2):
    # Deactivate existing active consents first
    db.query(models.Consent).filter(
        models.Consent.patient_id == patient_id,
        models.Consent.doctor_id == doctor_id,
        models.Consent.access_granted == True
    ).update({"access_granted": False})

    expires_at = datetime.utcnow() + timedelta(hours=expires_in_hours)
    db_consent = models.Consent(
        patient_id=patient_id,
        doctor_id=doctor_id,
        access_granted=True,
        expires_at=expires_at
    )
    db.add(db_consent)
    db.commit()
    db.refresh(db_consent)
    return db_consent

def revoke_consent(db: Session, consent_id: int):
    db_consent = db.query(models.Consent).filter(models.Consent.id == consent_id).first()
    if db_consent:
        db_consent.access_granted = False
        db.commit()
        db.refresh(db_consent)
    return db_consent

# Audit Log
def create_audit_log(db: Session, action: str, details: str, user_id: Optional[int] = None, ip_address: Optional[str] = None):
    db_log = models.AuditLog(
        user_id=user_id,
        action=action,
        details=details,
        ip_address=ip_address
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

def get_audit_logs(db: Session, limit: int = 100):
    return db.query(models.AuditLog).order_by(models.AuditLog.timestamp.desc()).limit(limit).all()
