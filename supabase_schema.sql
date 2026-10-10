-- ==============================================================================
-- SMARTHEALTH ID - SUPABASE POSTGRESQL SCHEMA & INITIAL SEED DATA
-- ==============================================================================
-- You can run this script directly in the Supabase Dashboard -> SQL Editor.
-- It initializes all core tables, constraints, foreign keys, indexes, and demo data.
-- ==============================================================================

-- Enable UUID extension if needed in future
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. USERS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- 'patient', 'doctor', 'hospital_admin', 'system_admin'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ------------------------------------------------------------------------------
-- 2. HOSPITALS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hospitals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    contact_number VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hospitals_name ON hospitals(name);

-- ------------------------------------------------------------------------------
-- 3. DOCTORS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS doctors (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    specialization VARCHAR(150) NOT NULL,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    nmr_id VARCHAR(100) UNIQUE,
    hospital_id INTEGER REFERENCES hospitals(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doctors_user_id ON doctors(user_id);
CREATE INDEX IF NOT EXISTS idx_doctors_license ON doctors(license_number);
CREATE INDEX IF NOT EXISTS idx_doctors_nmr ON doctors(nmr_id);

-- ------------------------------------------------------------------------------
-- 4. PATIENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    health_id VARCHAR(50) UNIQUE NOT NULL,
    date_of_birth VARCHAR(50),
    gender VARCHAR(20),
    blood_group VARCHAR(20),
    emergency_contact_name VARCHAR(150),
    emergency_contact_phone VARCHAR(50),
    address VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_health_id ON patients(health_id);

-- ------------------------------------------------------------------------------
-- 5. PREVIOUS PRESCRIPTIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS previous_prescriptions (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    doctor_name VARCHAR(150),
    prescription_date VARCHAR(50),
    source VARCHAR(50) DEFAULT 'local_storage', -- 'local_storage', 'phone_upload', 'google_drive'
    file_name VARCHAR(255),
    file_type VARCHAR(100),
    file_data TEXT,
    notes TEXT,
    medications_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prev_prescriptions_patient ON previous_prescriptions(patient_id);

-- ------------------------------------------------------------------------------
-- 6. RFID CARDS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rfid_cards (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    card_uid VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'revoked'
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    revoked_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_rfid_cards_patient ON rfid_cards(patient_id);
CREATE INDEX IF NOT EXISTS idx_rfid_cards_uid ON rfid_cards(card_uid);

-- ------------------------------------------------------------------------------
-- 7. QR TOKENS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS qr_tokens (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'revoked', 'expired'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_qr_tokens_patient ON qr_tokens(patient_id);
CREATE INDEX IF NOT EXISTS idx_qr_tokens_token ON qr_tokens(token);

-- ------------------------------------------------------------------------------
-- 8. MEDICAL RECORDS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS medical_records (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id INTEGER NOT NULL REFERENCES doctors(id),
    visit_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    symptoms TEXT,
    notes TEXT,
    handwritten_prescription TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_medical_records_patient ON medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_doctor ON medical_records(doctor_id);

-- ------------------------------------------------------------------------------
-- 9. DIAGNOSES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS diagnoses (
    id SERIAL PRIMARY KEY,
    medical_record_id INTEGER NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    description VARCHAR(255) NOT NULL,
    severity VARCHAR(50) DEFAULT 'moderate',
    diagnosed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_diagnoses_medical_record ON diagnoses(medical_record_id);

-- ------------------------------------------------------------------------------
-- 10. PRESCRIPTIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS prescriptions (
    id SERIAL PRIMARY KEY,
    medical_record_id INTEGER NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
    instructions TEXT,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prescriptions_medical_record ON prescriptions(medical_record_id);

-- ------------------------------------------------------------------------------
-- 11. MEDICATIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS medications (
    id SERIAL PRIMARY KEY,
    prescription_id INTEGER NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    duration VARCHAR(100) NOT NULL,
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_medications_prescription ON medications(prescription_id);

-- ------------------------------------------------------------------------------
-- 12. LAB REPORTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lab_reports (
    id SERIAL PRIMARY KEY,
    medical_record_id INTEGER NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
    test_name VARCHAR(200) NOT NULL,
    test_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'completed',
    file_url VARCHAR(500),
    result_summary TEXT
);

CREATE INDEX IF NOT EXISTS idx_lab_reports_medical_record ON lab_reports(medical_record_id);

-- ------------------------------------------------------------------------------
-- 13. VACCINATIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vaccinations (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    vaccine_name VARCHAR(200) NOT NULL,
    administered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    administered_by VARCHAR(150),
    next_due_date TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_vaccinations_patient ON vaccinations(patient_id);

-- ------------------------------------------------------------------------------
-- 14. SURGERIES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS surgeries (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    surgery_name VARCHAR(200) NOT NULL,
    surgery_date TIMESTAMP WITH TIME ZONE NOT NULL,
    surgeon_name VARCHAR(150),
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_surgeries_patient ON surgeries(patient_id);

-- ------------------------------------------------------------------------------
-- 15. CONSENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS consents (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    access_granted BOOLEAN DEFAULT TRUE,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_consents_patient ON consents(patient_id);
CREATE INDEX IF NOT EXISTS idx_consents_doctor ON consents(doctor_id);

-- ------------------------------------------------------------------------------
-- 16. AUDIT LOGS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    ip_address VARCHAR(50),
    details TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) & RESTRICTED ACCESS POLICIES
-- ==============================================================================
ALTER TABLE qr_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE previous_prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Allow public read of active QR token validity status for verification
CREATE POLICY "Allow public verification of active non-revoked QR tokens"
ON qr_tokens FOR SELECT
USING (status = 'active' AND (revoked_at IS NULL) AND expires_at > NOW());

-- Allow restricted medical history read for patient whose active QR token is validated
CREATE POLICY "Allow reading previous prescriptions for active valid QR tokens"
ON previous_prescriptions FOR SELECT
USING (
    patient_id IN (
        SELECT patient_id FROM qr_tokens 
        WHERE status = 'active' AND revoked_at IS NULL AND expires_at > NOW()
    )
);

-- ==============================================================================
-- REALTIME / PUBLICATION (Optional: enable Supabase Realtime on key tables)
-- ==============================================================================
-- alter publication supabase_realtime add table medical_records;
-- alter publication supabase_realtime add table qr_tokens;
-- alter publication supabase_realtime add table previous_prescriptions;

