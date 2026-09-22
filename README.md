# TRINAYORA — 3D Digital Health ID & Connected Hospital Network

**TRINAYORA** is a next-generation, HIPAA/GDPR-ready 3D digital medical ID and connected hospital telemetry network. 

It connects hospital registries, licensed medical practitioners (via National Medical Register verification), and patients through dynamic single-use QR tokens and physical RFID smart cards. 

**Zero health data is stored on the physical card** (only encrypted hardware tokens and temporary single-use QR strings). All clinical records remain encrypted and consent-governed in the backend EHR.

---

## 🌟 Key Capabilities & Highlights

1. **3D Interactive Homepage & Hospital Telemetry Grid**:
   - Classy hospital-grade light background (`#f8fafc`).
   - 3D rotating orbital telemetry network featuring a central **MEDICA Caduceus Core** and 7 orbiting super-speciality hospital nodes (**NARAYANA**, **APOLLO**, **FORTIS**, **ILS**, **MANIPAL**, **OHIO**, **ZENITH**).
2. **Dual-Theme Visual Architecture**:
   - **Homepage**: Clean porcelain slate hospital light theme.
   - **Portals (Doctor, Patient, Hospital Admin)**: Dynamic cyber dark glowing theme (`#0b0f19`) with neon ambient glows and frosted glass panels.
3. **Doctor Verification (National Medical Register - NMR)**:
   - 2-step authentication enforcing valid NMC / NMR registration IDs for all medical staff.
   - Integrated live webcam QR scanner, hardware RFID swiper simulator, and consultation recorder.
4. **Patient Privacy & Consent Engine**:
   - Dynamic 60-second self-rotating QR tokens.
   - Granular time-bound consent manager (2h, 12h, 24h, 7d access grants).
   - Real-time prescription and EHR timeline.
5. **Emergency Bypass Protocol**:
   - Emergency medical mode providing immediate access to critical life-saving metadata (Blood group, Allergies, Emergency Contacts) with full tamper-evident audit logging.
6. **Hospital Administration & Hardware Mapping**:
   - Physical RFID chip UID provisioning and patient-card binding.
   - Real-time security telemetry audit log.

---

## 🛠️ Technical Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS, Lucide Icons, html5-qrcode, qrcode.react
- **Backend**: Python 3.11+, FastAPI, SQLAlchemy ORM, SQLite / PostgreSQL, JWT Authentication, Bcrypt
- **Security**: Granular Role-Based Access Control (RBAC), National Medical Register (NMR) Validation, Consent Auditing
- **Deployment**: Multi-stage Docker & Docker Compose

---

## 🚀 Quick Start (Docker Compose)

Run the full stack (PostgreSQL Database, FastAPI Backend, Next.js Frontend) with a single command:

```bash
docker-compose up --build
```

- **TRINAYORA Web App**: [http://localhost:3000](http://localhost:3000)
- **FastAPI Interactive API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 💻 Local Development Setup

### 1. Backend Service
```bash
cd backend
python -m venv venv

# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Application
```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Default Demo Accounts

| Role | Username | Password | Identifier / Details |
| :--- | :--- | :--- | :--- |
| **Doctor** | `doctor1` | `doctorpassword` | NMR ID: `NMR-2024-883921` (Cardiology) |
| **Patient** | `patient1` | `patientpassword` | Health ID: `HID-2024-998811` (John Doe) |
| **System Admin** | `admin` | `adminpassword` | Hospital Provisioner & Audit Inspector |

---

## 📄 License
MIT License. Open-source healthcare innovation.
