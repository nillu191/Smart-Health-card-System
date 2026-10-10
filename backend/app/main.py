from datetime import datetime, timedelta
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.database import Base, engine, SessionLocal
from backend.app.api.endpoints import router as api_router
from backend.app.models import models
from backend.app.schemas import schemas
from backend.app.crud import crud

from sqlalchemy import text

from sqlalchemy import text

# Create database tables
Base.metadata.create_all(bind=engine)

# Auto-migrate SQLite schema
try:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE doctors ADD COLUMN nmr_id VARCHAR"))
        conn.commit()
except Exception:
    pass

# Auto-migrate SQLite columns if missing
try:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE doctors ADD COLUMN nmr_id VARCHAR"))
        conn.commit()
except Exception:
    pass

try:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE medical_records ADD COLUMN handwritten_prescription TEXT"))
        conn.commit()
except Exception:
    pass

app = FastAPI(
    title="SmartHealth ID API",
    description="RFID + QR Digital Medical Record System Backend",
    version="1.0.0"
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Router
app.include_router(api_router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to SmartHealth ID API. Go to /docs for API Swagger documentation."}

# Startup Seeding Event
@app.on_event("startup")
def seed_data():
    db = SessionLocal()
    try:
        # Check if already seeded
        admin_user = crud.get_user_by_username(db, "admin")
        if admin_user:
            # Ensure existing doctors have NMR IDs populated
            docs = db.query(models.Doctor).all()
            for doc in docs:
                if not doc.nmr_id:
                    if doc.license_number == "LIC-883921":
                        doc.nmr_id = "NMR-2024-883921"
                    else:
                        doc.nmr_id = f"NMR-{doc.license_number.replace('LIC-', '')}"
            db.commit()
        if not admin_user:
            # 1. Create System Admin
            admin_schema = schemas.UserCreate(
                username="admin",
                email="admin@smarthealth.id",
                password="adminpassword",
                role="system_admin"
            )
            crud.create_user(db, admin_schema)

            # 2. Create Hospital
            hosp_schema = schemas.HospitalCreate(
                name="Metro General Hospital",
                address="456 Healthcare Blvd, New York, NY",
                contact_number="+1-555-0199"
            )
            hosp = crud.create_hospital(db, hosp_schema)

            # 3. Create Doctor
            doc_user_schema = schemas.UserCreate(
                username="doctor1",
                email="doctor1@smarthealth.id",
                password="doctorpassword",
                role="doctor"
            )
            doc_schema = schemas.DoctorCreate(
                specialization="Cardiology",
                license_number="LIC-883921",
                nmr_id="NMR-2024-883921",
                hospital_id=hosp.id,
                user=doc_user_schema
            )
            doctor = crud.create_doctor(db, doc_schema)

            # 4. Create Patient
            pat_user_schema = schemas.UserCreate(
                username="patient1",
                email="patient1@smarthealth.id",
                password="patientpassword",
                role="patient"
            )
            pat_schema = schemas.PatientCreate(
                date_of_birth="1990-05-15",
                gender="Male",
                blood_group="O-Positive",
                emergency_contact_name="Jane Doe",
                emergency_contact_phone="+1-555-0144",
                address="123 Maple St, Brooklyn, NY",
                user=pat_user_schema
            )
            patient = crud.create_patient(db, pat_schema)

            # 5. Issue sample QR Token
            qr_schema = schemas.QRTokenCreate(
                patient_id=patient.id,
                expires_in_hours=72
            )
            qr = crud.create_qr_token(db, qr_schema)
            # Create a second readable QR token for easy manual use/mocking: "MOCK_QR_TOKEN_123"
            mock_qr = models.QRToken(
                patient_id=patient.id,
                token="MOCK_QR_TOKEN_123",
                status="active",
                expires_at=qr.expires_at
            )
            db.add(mock_qr)
            db.commit()

            # 6. Issue sample RFID Card: "MOCK_RFID_UID_99"
            rfid_schema = schemas.RFIDCardCreate(
                patient_id=patient.id,
                card_uid="MOCK_RFID_UID_99"
            )
            crud.create_rfid_card(db, rfid_schema)

            # 7. Add sample medical records
            med_rec_in = schemas.MedicalRecordCreate(
                patient_id=patient.id,
                symptoms="Patient presented with mild chest discomfort and fatigue during physical activity.",
                notes="Patient has a peanut allergy. Advised to avoid nuts and carry an epinephrine autoinjector.",
                diagnoses=[
                    schemas.DiagnosisCreate(
                        code="I10",
                        description="Essential (primary) hypertension",
                        severity="moderate"
                    )
                ],
                prescriptions=[
                    schemas.PrescriptionCreate(
                        instructions="Take 1 tablet daily in the morning with water. Monitor blood pressure.",
                        medications=[
                            schemas.MedicationCreate(
                                name="Lisinopril",
                                dosage="10mg",
                                frequency="Once daily",
                                duration="30 days",
                                notes="Check blood pressure weekly."
                            )
                        ]
                    )
                ],
                lab_reports=[
                    schemas.LabReportCreate(
                        test_name="Lipid Panel",
                        status="completed",
                        result_summary="Cholesterol: 210 mg/dL (High), HDL: 45 mg/dL, LDL: 130 mg/dL.",
                        file_url="https://example.com/reports/lipid_panel_pat1.pdf"
                    )
                ]
            )
            crud.create_medical_record(db, med_rec_in, doctor.id)

            # 8. Add sample vaccination
            vac_in = schemas.VaccinationCreate(
                patient_id=patient.id,
                vaccine_name="Tetanus Toxoid Booster",
                administered_by="Dr. Stephen Strange",
                next_due_date=datetime.utcnow() + timedelta(days=365 * 10)
            )
            crud.create_vaccination(db, vac_in)

            # 10. Add sample previous prescriptions uploaded by patient
            prev_p1 = schemas.PreviousPrescriptionCreate(
                title="Cardiology & Hypertension Rx",
                doctor_name="Dr. Anil Kapoor (Apollo Cardiology)",
                prescription_date="2023-11-14",
                source="local_storage",
                file_name="apollo_prescription_nov2023.png",
                file_type="image/png",
                file_data="",
                notes="Prescribed after initial evaluation of mild hypertension. Advised low sodium diet.",
                medications_summary="Amlodipine 5mg (Once daily), Telmisartan 40mg (Morning)"
            )
            crud.create_previous_prescription(db, patient.id, prev_p1)

            prev_p2 = schemas.PreviousPrescriptionCreate(
                title="Allergy & Pulmonary Consultation",
                doctor_name="Dr. Sarah Jenkins (Metro Chest Clinic)",
                prescription_date="2024-02-10",
                source="google_drive",
                file_name="allergy_prescription_drive.pdf",
                file_type="link",
                file_data="https://drive.google.com/file/d/1A2B3C4D5E6F7G8H9_sample/view",
                notes="Seasonal allergy flare-up and wheezing. Peanut allergy confirmed.",
                medications_summary="Levocetirizine 5mg (Nightly), Salbutamol Inhaler 100mcg (PRN)"
            )
            crud.create_previous_prescription(db, patient.id, prev_p2)

            print("Database successfully seeded with demo accounts, records & previous prescriptions.")
    finally:
        db.close()
