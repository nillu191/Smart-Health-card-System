from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False)  # 'patient', 'doctor', 'hospital_admin', 'system_admin'
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    patient_profile = relationship("Patient", back_populates="user", uselist=False)
    doctor_profile = relationship("Doctor", back_populates="user", uselist=False)
    audit_logs = relationship("AuditLog", back_populates="user")

class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    address = Column(String, nullable=True)
    contact_number = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    doctors = relationship("Doctor", back_populates="hospital")

class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    specialization = Column(String, nullable=False)
    license_number = Column(String, unique=True, nullable=False)
    nmr_id = Column(String, unique=True, index=True, nullable=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="doctor_profile")
    hospital = relationship("Hospital", back_populates="doctors")
    medical_records = relationship("MedicalRecord", back_populates="doctor")
    consents = relationship("Consent", back_populates="doctor")

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    health_id = Column(String, unique=True, index=True, nullable=False)  # e.g., SH-1234-5678
    date_of_birth = Column(String, nullable=True)
    gender = Column(String, nullable=True)
    blood_group = Column(String, nullable=True)
    emergency_contact_name = Column(String, nullable=True)
    emergency_contact_phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="patient_profile")
    rfid_cards = relationship("RFIDCard", back_populates="patient")
    qr_tokens = relationship("QRToken", back_populates="patient")
    medical_records = relationship("MedicalRecord", back_populates="patient")
    vaccinations = relationship("Vaccination", back_populates="patient")
    surgeries = relationship("Surgery", back_populates="patient")
    consents = relationship("Consent", back_populates="patient")

class RFIDCard(Base):
    __tablename__ = "rfid_cards"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    card_uid = Column(String, unique=True, index=True, nullable=False)
    status = Column(String, default="active")  # 'active', 'revoked'
    issued_at = Column(DateTime, default=datetime.utcnow)
    revoked_at = Column(DateTime, nullable=True)

    # Relationships
    patient = relationship("Patient", back_populates="rfid_cards")

class QRToken(Base):
    __tablename__ = "qr_tokens"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    token = Column(String, unique=True, index=True, nullable=False)
    status = Column(String, default="active")  # 'active', 'revoked', 'expired'
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)

    # Relationships
    patient = relationship("Patient", back_populates="qr_tokens")

class MedicalRecord(Base):
    __tablename__ = "medical_records"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    visit_date = Column(DateTime, default=datetime.utcnow)
    symptoms = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    patient = relationship("Patient", back_populates="medical_records")
    doctor = relationship("Doctor", back_populates="medical_records")
    diagnoses = relationship("Diagnosis", back_populates="medical_record")
    prescriptions = relationship("Prescription", back_populates="medical_record")
    lab_reports = relationship("LabReport", back_populates="medical_record")

class Diagnosis(Base):
    __tablename__ = "diagnoses"

    id = Column(Integer, primary_key=True, index=True)
    medical_record_id = Column(Integer, ForeignKey("medical_records.id"), nullable=False)
    code = Column(String, nullable=False)  # e.g., ICD-10
    description = Column(String, nullable=False)
    severity = Column(String, default="moderate")  # 'mild', 'moderate', 'severe'
    diagnosed_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    medical_record = relationship("MedicalRecord", back_populates="diagnoses")

class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, index=True)
    medical_record_id = Column(Integer, ForeignKey("medical_records.id"), nullable=False)
    instructions = Column(Text, nullable=True)
    issued_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    medical_record = relationship("MedicalRecord", back_populates="prescriptions")
    medications = relationship("Medication", back_populates="prescription")

class Medication(Base):
    __tablename__ = "medications"

    id = Column(Integer, primary_key=True, index=True)
    prescription_id = Column(Integer, ForeignKey("prescriptions.id"), nullable=False)
    name = Column(String, nullable=False)
    dosage = Column(String, nullable=False)  # e.g., 500mg
    frequency = Column(String, nullable=False)  # e.g., Twice daily
    duration = Column(String, nullable=False)  # e.g., 7 days
    notes = Column(Text, nullable=True)

    # Relationships
    prescription = relationship("Prescription", back_populates="medications")

class LabReport(Base):
    __tablename__ = "lab_reports"

    id = Column(Integer, primary_key=True, index=True)
    medical_record_id = Column(Integer, ForeignKey("medical_records.id"), nullable=False)
    test_name = Column(String, nullable=False)
    test_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="completed")  # 'pending', 'completed'
    file_url = Column(String, nullable=True)  # Mock cloud storage URL
    result_summary = Column(Text, nullable=True)

    # Relationships
    medical_record = relationship("MedicalRecord", back_populates="lab_reports")

class Vaccination(Base):
    __tablename__ = "vaccinations"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    vaccine_name = Column(String, nullable=False)
    administered_at = Column(DateTime, default=datetime.utcnow)
    administered_by = Column(String, nullable=True)
    next_due_date = Column(DateTime, nullable=True)

    # Relationships
    patient = relationship("Patient", back_populates="vaccinations")

class Surgery(Base):
    __tablename__ = "surgeries"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    surgery_name = Column(String, nullable=False)
    surgery_date = Column(DateTime, nullable=False)
    surgeon_name = Column(String, nullable=True)
    notes = Column(Text, nullable=True)

    # Relationships
    patient = relationship("Patient", back_populates="surgeries")

class Consent(Base):
    __tablename__ = "consents"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    access_granted = Column(Boolean, default=True)
    granted_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)

    # Relationships
    patient = relationship("Patient", back_populates="consents")
    doctor = relationship("Doctor", back_populates="consents")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Nullable for system tasks or guest access
    action = Column(String, nullable=False)  # 'LOGIN', 'QR_SCAN', 'VIEW_RECORDS', 'ADD_RECORD', etc.
    ip_address = Column(String, nullable=True)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="audit_logs")
