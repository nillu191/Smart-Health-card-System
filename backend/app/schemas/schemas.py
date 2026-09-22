from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    username: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

# User Schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Hospital Schemas
class HospitalBase(BaseModel):
    name: str
    address: Optional[str] = None
    contact_number: Optional[str] = None

class HospitalCreate(HospitalBase):
    pass

class HospitalResponse(HospitalBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Doctor Schemas
class DoctorBase(BaseModel):
    specialization: str
    license_number: str
    nmr_id: Optional[str] = None
    hospital_id: Optional[int] = None

class DoctorCreate(DoctorBase):
    user: UserCreate

class DoctorResponse(BaseModel):
    id: int
    user_id: int
    specialization: str
    license_number: str
    nmr_id: Optional[str] = None
    hospital_id: Optional[int] = None
    created_at: datetime
    user: UserResponse
    hospital: Optional[HospitalResponse] = None

    class Config:
        from_attributes = True

# Doctor NMR Authentication Schemas
class DoctorNMRVerifyRequest(BaseModel):
    nmr_id: str

class DoctorNMRVerifyResponse(BaseModel):
    valid: bool
    nmr_id: str
    doctor_id: Optional[int] = None
    doctor_name: Optional[str] = None
    username: Optional[str] = None
    email: Optional[str] = None
    specialization: Optional[str] = None
    license_number: Optional[str] = None
    hospital_name: Optional[str] = None
    message: str

class DoctorNMRLoginRequest(BaseModel):
    nmr_id: str
    password: str

# Patient Schemas
class PatientBase(BaseModel):
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    address: Optional[str] = None

class PatientCreate(PatientBase):
    user: UserCreate

class PatientResponse(BaseModel):
    id: int
    user_id: int
    health_id: str
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    address: Optional[str] = None
    created_at: datetime
    user: UserResponse

    class Config:
        from_attributes = True

# RFID Card Schemas
class RFIDCardBase(BaseModel):
    card_uid: str

class RFIDCardCreate(RFIDCardBase):
    patient_id: int

class RFIDCardResponse(RFIDCardBase):
    id: int
    patient_id: int
    status: str
    issued_at: datetime
    revoked_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# QR Token Schemas
class QRTokenBase(BaseModel):
    pass

class QRTokenCreate(QRTokenBase):
    patient_id: int
    expires_in_hours: Optional[int] = 24

class QRTokenResponse(BaseModel):
    id: int
    patient_id: int
    token: str
    status: str
    created_at: datetime
    expires_at: datetime

    class Config:
        from_attributes = True

# Medication Schemas
class MedicationBase(BaseModel):
    name: str
    dosage: str
    frequency: str
    duration: str
    notes: Optional[str] = None

class MedicationCreate(MedicationBase):
    pass

class MedicationResponse(MedicationBase):
    id: int
    prescription_id: int

    class Config:
        from_attributes = True

# Prescription Schemas
class PrescriptionBase(BaseModel):
    instructions: Optional[str] = None

class PrescriptionCreate(PrescriptionBase):
    medications: List[MedicationCreate] = []

class PrescriptionResponse(PrescriptionBase):
    id: int
    medical_record_id: int
    issued_at: datetime
    medications: List[MedicationResponse] = []

    class Config:
        from_attributes = True

# Diagnosis Schemas
class DiagnosisBase(BaseModel):
    code: str
    description: str
    severity: Optional[str] = "moderate"

class DiagnosisCreate(DiagnosisBase):
    pass

class DiagnosisResponse(DiagnosisBase):
    id: int
    medical_record_id: int
    diagnosed_at: datetime

    class Config:
        from_attributes = True

# Lab Report Schemas
class LabReportBase(BaseModel):
    test_name: str
    status: Optional[str] = "completed"
    file_url: Optional[str] = None
    result_summary: Optional[str] = None

class LabReportCreate(LabReportBase):
    pass

class LabReportResponse(LabReportBase):
    id: int
    medical_record_id: int
    test_date: datetime

    class Config:
        from_attributes = True

# Medical Record Schemas
class MedicalRecordBase(BaseModel):
    symptoms: Optional[str] = None
    notes: Optional[str] = None

class MedicalRecordCreate(MedicalRecordBase):
    patient_id: int
    diagnoses: List[DiagnosisCreate] = []
    prescriptions: List[PrescriptionCreate] = []
    lab_reports: List[LabReportCreate] = []

class MedicalRecordResponse(MedicalRecordBase):
    id: int
    patient_id: int
    doctor_id: int
    visit_date: datetime
    created_at: datetime
    diagnoses: List[DiagnosisResponse] = []
    prescriptions: List[PrescriptionResponse] = []
    lab_reports: List[LabReportResponse] = []
    doctor_name: Optional[str] = None

    class Config:
        from_attributes = True

# Vaccination Schemas
class VaccinationBase(BaseModel):
    vaccine_name: str
    administered_by: Optional[str] = None
    next_due_date: Optional[datetime] = None

class VaccinationCreate(VaccinationBase):
    patient_id: int
    administered_at: Optional[datetime] = None

class VaccinationResponse(VaccinationBase):
    id: int
    patient_id: int
    administered_at: datetime

    class Config:
        from_attributes = True

# Surgery Schemas
class SurgeryBase(BaseModel):
    surgery_name: str
    surgery_date: datetime
    surgeon_name: Optional[str] = None
    notes: Optional[str] = None

class SurgeryCreate(SurgeryBase):
    patient_id: int

class SurgeryResponse(SurgeryBase):
    id: int
    patient_id: int

    class Config:
        from_attributes = True

# Consent Schemas
class ConsentCreate(BaseModel):
    doctor_id: int
    expires_in_hours: Optional[int] = 2

class ConsentResponse(BaseModel):
    id: int
    patient_id: int
    doctor_id: int
    access_granted: bool
    granted_at: datetime
    expires_at: datetime

    class Config:
        from_attributes = True

# Audit Log Schemas
class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    action: str
    ip_address: Optional[str] = None
    details: Optional[str] = None
    timestamp: datetime
    username: Optional[str] = None

    class Config:
        from_attributes = True

# Patient Profile Response including all details
class EmergencyProfile(BaseModel):
    health_id: str
    blood_group: Optional[str] = None
    allergies: Optional[str] = None  # We will map allergies to patient notes or custom field. Let's make sure it's in the response
    critical_conditions: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    current_medications: List[str] = []

class PatientFullProfile(BaseModel):
    patient: PatientResponse
    medical_records: List[MedicalRecordResponse] = []
    vaccinations: List[VaccinationResponse] = []
    surgeries: List[SurgeryResponse] = []
    rfid_cards: List[RFIDCardResponse] = []
    qr_tokens: List[QRTokenResponse] = []
    consents: List[ConsentResponse] = []
