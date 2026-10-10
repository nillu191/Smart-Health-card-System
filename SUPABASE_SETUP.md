# 🚀 Supabase Cloud Database Integration Guide

This guide walks you through connecting your **SmartHealth ID** system to a cloud-hosted **Supabase PostgreSQL** database.

---

## 📋 Step 1: Create a Free Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **"New Project"**.
3. Choose an organization, enter a **Project Name** (e.g., `smarthealth-cloud`), and set a **Database Password** (make sure to remember or save this password).
4. Select a region close to you and click **"Create new project"**.

---

## 🔑 Step 2: Get your Database Connection String
1. In your Supabase project dashboard, navigate to **Project Settings** (gear icon in the sidebar) ➔ **Database**.
2. Scroll down to **Connection parameters** / **Connection string**.
3. Select the **URI** tab:
   - **Mode: Session** (Port 5432) or **Transaction** (Port 6543, recommended for serverless/cloud):
   ```text
   postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require
   ```
4. Copy the connection URI and replace `[YOUR-PASSWORD]` with your actual Supabase database password.

---

## ⚙️ Step 3: Configure Backend `.env`
Open [`backend/.env`](file:///c:/Users/majum/OneDrive/Desktop/healthcard%20project/backend/.env) and set `DATABASE_URL` with your Supabase URI:

```env
SECRET_KEY=supersecretjwtkeychangeinproduction12345!
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Supabase Cloud Database URL:
DATABASE_URL=postgresql://postgres.yourprojectref:YourPassword123@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require

# Supabase API (Found under Project Settings ➔ API):
SUPABASE_URL=https://yourprojectref.supabase.co
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

---

## 🗄️ Step 4: Initialize Schema & Tables

You have two simple options:

### Option A: Automatic Startup Migration (Fastest)
When you run the FastAPI backend, SQLAlchemy automatically creates all 16 tables, relations, and initial demo seed data (Admin, Doctor, Patient, RFID UID `MOCK_RFID_UID_99`, QR Token `MOCK_QR_TOKEN_123`, medical records) on the Supabase database.

### Option B: Run the SQL Script in Supabase Dashboard
1. Open [`supabase_schema.sql`](file:///c:/Users/majum/OneDrive/Desktop/healthcard%20project/supabase_schema.sql) in this repository.
2. Go to your **Supabase Dashboard** ➔ **SQL Editor**.
3. Paste the entire SQL content and click **Run**.
4. All tables, indexes, constraints, and demo rows will be created in Supabase.

---

## ▶️ Step 5: Start the Application

### 1. Install dependencies:
```powershell
# In backend/
pip install -r requirements.txt
```

### 2. Run the Backend:
```powershell
uvicorn backend.app.main:app --reload --port 8000
```

### 3. Run the Frontend:
```powershell
cd frontend
npm run dev
```

---

## ☁️ Features Enabled with Supabase Cloud
- **Anywhere Realtime Access**: Patients, Doctors, Hospitals, and Admins can query and write records directly across machines or cloud instances.
- **Persistent Cloud Storage**: Safe medical records, diagnoses, prescriptions, and encrypted tokens stored in PostgreSQL with high availability.
- **Resilient Connection Pooling**: Built-in `pool_pre_ping` and connection recycling prevent cloud timeouts.
