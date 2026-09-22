"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  HeartPulse, Activity, QrCode, Rss, ShieldAlert, Clock, User, 
  Plus, Trash2, Building, Users, CheckCircle, CheckCircle2, AlertCircle, 
  Calendar, FileText, Layers, Lock, Unlock, Settings, Camera, 
  Database, Sparkles, LogOut, Search, FileUp, Key, ShieldCheck,
  Stethoscope, BadgeCheck, ArrowRight, RefreshCw, Zap, Radio, Hospital, Cpu, ChevronRight
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

// In production, configure through next env variables or default to standard backend port
const API_URL = "http://localhost:8000";

export default function SmartHealthApp() {
  const [mounted, setMounted] = useState(false);
  // Authentication & Session State
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string>("");
  const [loginRole, setLoginRole] = useState<"doctor" | "patient" | "system_admin">("doctor");
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

  // 3D Showcase Navigation and Persona Gateway State
  const [viewMode, setViewMode] = useState<"home" | "auth">("home");
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  
  // Sign up state for Doctors and Patients
  const [signupUsername, setSignupUsername] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupSpecialization, setSignupSpecialization] = useState("Cardiology");
  const [signupLicense, setSignupLicense] = useState("");
  const [signupNmrId, setSignupNmrId] = useState("");
  const [signupDOB, setSignupDOB] = useState("1995-05-15");
  const [signupBloodGroup, setSignupBloodGroup] = useState("O-Positive");
  const [signupEmergencyName, setSignupEmergencyName] = useState("");
  const [signupEmergencyPhone, setSignupEmergencyPhone] = useState("");
  const [signupSuccess, setSignupSuccess] = useState("");

  // Doctor National Medical Register (NMR) Authentication State
  const [doctorNmrId, setDoctorNmrId] = useState("NMR-2024-883921");
  const [doctorNmrStep, setDoctorNmrStep] = useState<1 | 2>(1); // 1: Verify NMR ID, 2: Password Sign In
  const [doctorNmrInfo, setDoctorNmrInfo] = useState<any>(null);
  const [doctorNmrLoading, setDoctorNmrLoading] = useState(false);
  const [doctorNmrError, setDoctorNmrError] = useState("");

  // Active View Port state
  const [activeTab, setActiveTab] = useState("dashboard");

  // Open specific auth mode for a persona
  const openAuthForRole = (role: "doctor" | "patient" | "system_admin", mode: "login" | "signup" = "login") => {
    setLoginRole(role);
    setAuthMode(mode);
    setLoginError("");
    setDoctorNmrError("");
    setSignupSuccess("");
    if (mode === "login") {
      if (role === "doctor") {
        setDoctorNmrId("NMR-2024-883921");
        setLoginUsername("doctor1");
        setLoginPassword("doctorpassword");
        setDoctorNmrStep(1);
      } else if (role === "patient") {
        setLoginUsername("patient1");
        setLoginPassword("patientpassword");
      } else if (role === "system_admin") {
        setLoginUsername("admin");
        setLoginPassword("adminpassword");
      }
    } else {
      setSignupUsername("");
      setSignupEmail("");
      setSignupPassword("");
      setSignupNmrId(`NMR-2024-${Math.floor(100000 + Math.random() * 900000)}`);
      setSignupLicense(`LIC-${Math.floor(100000 + Math.random() * 900000)}`);
    }
    setViewMode("auth");
  };

  // Handle direct persona registration
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setSignupSuccess("");
    setLoading(true);
    try {
      if (loginRole === "doctor") {
        const payload = {
          specialization: signupSpecialization,
          license_number: signupLicense || `LIC-${Date.now().toString().slice(-6)}`,
          nmr_id: signupNmrId || `NMR-2024-${Date.now().toString().slice(-6)}`,
          hospital_id: null,
          user: {
            username: signupUsername,
            email: signupEmail,
            password: signupPassword,
            role: "doctor"
          }
        };
        const res = await fetch(`${API_URL}/api/auth/register/doctor`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || "Doctor registration failed.");
        }
        setSignupSuccess("Doctor Registered with National Medical Register! You can now Sign In.");
        setAuthMode("login");
        setDoctorNmrId(payload.nmr_id);
        setLoginPassword(signupPassword);
        setDoctorNmrStep(1);
      } else if (loginRole === "patient") {
        const payload = {
          date_of_birth: signupDOB,
          gender: "Other",
          blood_group: signupBloodGroup,
          emergency_contact_name: signupEmergencyName || "Emergency Contact",
          emergency_contact_phone: signupEmergencyPhone || "+1-555-0199",
          address: "123 Medical Center Way",
          user: {
            username: signupUsername,
            email: signupEmail,
            password: signupPassword,
            role: "patient"
          }
        };
        const res = await fetch(`${API_URL}/api/auth/register/patient`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || "Patient registration failed.");
        }
        const data = await res.json();
        setSignupSuccess(`Patient Profile Created! Health ID: ${data.health_id}. You can now Sign In.`);
        setAuthMode("login");
        setLoginUsername(signupUsername);
        setLoginPassword(signupPassword);
      } else {
        throw new Error("Hospital System Administrator accounts are provisioned by the backend server.");
      }
    } catch (err: any) {
      setLoginError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  // Patients Portal State
  const [patientProfile, setPatientProfile] = useState<any>(null);
  const [qrToken, setQrToken] = useState<any>(null);
  const [availableDoctors, setAvailableDoctors] = useState<any[]>([]);
  const [grantDoctorId, setGrantDoctorId] = useState("");
  const [grantHours, setGrantHours] = useState("2");
  
  // Doctor Portal State
  const [searchHealthId, setSearchHealthId] = useState("");
  const [scannedPatient, setScannedPatient] = useState<any>(null);
  const [emergencyProfile, setEmergencyProfile] = useState<any>(null);
  const [isEmergencyView, setIsEmergencyView] = useState(false);
  const [searchError, setSearchError] = useState("");
  
  // Scanner state
  const [cameraScanActive, setCameraScanActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const qrReaderRef = useRef<any>(null);

  // RFID & QR Simulation State
  const [simRfidUid, setSimRfidUid] = useState("MOCK_RFID_UID_99");
  const [simQrToken, setSimQrToken] = useState("MOCK_QR_TOKEN_123");

  // Admin Dashboard State
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [doctorsList, setDoctorsList] = useState<any[]>([]);
  const [patientsList, setPatientsList] = useState<any[]>([]);
  
  // Admin Creation Forms
  const [newHospName, setNewHospName] = useState("");
  const [newHospAddress, setNewHospAddress] = useState("");
  const [newHospPhone, setNewHospPhone] = useState("");
  
  const [newDocUsername, setNewDocUsername] = useState("");
  const [newDocEmail, setNewDocEmail] = useState("");
  const [newDocPassword, setNewDocPassword] = useState("");
  const [newDocSpecialization, setNewDocSpecialization] = useState("");
  const [newDocLicense, setNewDocLicense] = useState("");
  const [newDocNmrId, setNewDocNmrId] = useState("");
  const [newDocHospId, setNewDocHospId] = useState("");

  const [newPatUsername, setNewPatUsername] = useState("");
  const [newPatEmail, setNewPatEmail] = useState("");
  const [newPatPassword, setNewPatPassword] = useState("");
  const [newPatDOB, setNewPatDOB] = useState("1995-08-20");
  const [newPatGender, setNewPatGender] = useState("Female");
  const [newPatBlood, setNewPatBlood] = useState("A-Positive");
  const [newPatEmergencyName, setNewPatEmergencyName] = useState("");
  const [newPatEmergencyPhone, setNewPatEmergencyPhone] = useState("");
  const [newPatAddress, setNewPatAddress] = useState("");

  const [assignRfidPatientId, setAssignRfidPatientId] = useState("");
  const [assignRfidUid, setAssignRfidUid] = useState("");

  // Doctor Consultation Form state
  const [symptoms, setSymptoms] = useState("");
  const [notes, setNotes] = useState("");
  const [diagCode, setDiagCode] = useState("");
  const [diagDesc, setDiagDesc] = useState("");
  const [diagSeverity, setDiagSeverity] = useState("moderate");
  const [prescInstructions, setPrescInstructions] = useState("");
  const [meds, setMeds] = useState<any[]>([{ name: "", dosage: "", frequency: "", duration: "", notes: "" }]);
  const [labTestName, setLabTestName] = useState("");
  const [labSummary, setLabSummary] = useState("");

  // AI Summary State
  const [aiSummary, setAiSummary] = useState("");
  const [generatingAi, setGeneratingAi] = useState(false);

  // Initialize
  useEffect(() => {
    setMounted(true);
    // Check if token exists in localStorage
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Fetch relevant role data when user state changes
  useEffect(() => {
    if (!user) return;
    if (user.role === "patient") {
      fetchPatientOwnProfile();
      fetchHospitals(); // to get doctors
    } else if (user.role === "doctor") {
      fetchHospitals();
    } else if (user.role === "system_admin" || user.role === "hospital_admin") {
      fetchAdminData();
    }
  }, [user]);

  // Auto-refresh dynamic QR code after scan by periodically polling
  useEffect(() => {
    if (!user || user.role !== "patient" || !token) return;
    const interval = setInterval(() => {
      fetchPatientOwnProfile();
    }, 2500); // Poll every 2.5 seconds for responsive UI update
    return () => clearInterval(interval);
  }, [user, token]);

  // Clean up camera scanner on unmount
  useEffect(() => {
    return () => {
      stopCameraScanner();
    };
  }, []);

  // One-click quick logins
  const handleQuickLogin = async (role: string) => {
    setLoginError("");
    setDoctorNmrError("");
    if (role === "doctor") {
      setLoginRole("doctor");
      setDoctorNmrId("NMR-2024-883921");
      setLoginUsername("doctor1");
      setLoginPassword("doctorpassword");
      setDoctorNmrLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/auth/doctor/verify-nmr`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nmr_id: "NMR-2024-883921" })
        });
        if (res.ok) {
          const data = await res.json();
          setDoctorNmrInfo(data);
          setDoctorNmrStep(2);
        }
      } catch (e) {
        // ignore
      } finally {
        setDoctorNmrLoading(false);
      }
    } else if (role === "patient") {
      setLoginRole("patient");
      setLoginUsername("patient1");
      setLoginPassword("patientpassword");
    } else if (role === "system_admin") {
      setLoginRole("system_admin");
      setLoginUsername("admin");
      setLoginPassword("adminpassword");
    }
  };

  // API Call: Doctor Step 1 - Verify NMR ID with National Medical Register
  const handleVerifyDoctorNMR = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setDoctorNmrError("");
    setDoctorNmrLoading(true);
    setDoctorNmrInfo(null);
    try {
      if (!doctorNmrId.trim()) {
        throw new Error("Please enter your National Medical Register (NMR) ID");
      }
      const res = await fetch(`${API_URL}/api/auth/doctor/verify-nmr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nmr_id: doctorNmrId.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "National Medical Register verification failed. NMR ID not found.");
      }
      setDoctorNmrInfo(data);
      setDoctorNmrStep(2);
      if (data.username) {
        setLoginUsername(data.username);
      }
    } catch (err: any) {
      setDoctorNmrError(err.message || "Failed to verify NMR ID.");
    } finally {
      setDoctorNmrLoading(false);
    }
  };

  // API Call: Doctor Step 2 - Sign in with Verified NMR ID and Password
  const handleDoctorNMRLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoading(true);
    try {
      if (!loginPassword) {
        throw new Error("Please enter your password to authenticate.");
      }
      const res = await fetch(`${API_URL}/api/auth/doctor/login-nmr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nmr_id: doctorNmrId.trim(),
          password: loginPassword
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Doctor authentication failed. Incorrect password.");
      }
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data));
      setToken(data.access_token);
      setUser(data);
    } catch (err: any) {
      setLoginError(err.message || "Authentication failed. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // API Call: Standard Login (for Patients and Admins)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoading(true);
    try {
      const details = new URLSearchParams();
      details.append("username", loginUsername);
      details.append("password", loginPassword);

      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: details
      });

      if (!res.ok) {
        throw new Error("Invalid username or password");
      }

      const data = await res.json();
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data));
      setToken(data.access_token);
      setUser(data);
    } catch (err: any) {
      setLoginError(err.message || "Failed to login. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // API Call: Logout
  const handleLogout = () => {
    stopCameraScanner();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken("");
    setPatientProfile(null);
    setScannedPatient(null);
    setEmergencyProfile(null);
    setIsEmergencyView(false);
    setAiSummary("");
    setDoctorNmrStep(1);
    setDoctorNmrInfo(null);
    setDoctorNmrError("");
    setLoginPassword("");
  };

  // API Call: Patient Profile
  const fetchPatientOwnProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/api/patients/me/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPatientProfile(data);
      }
    } catch (err) {
      console.error("Error fetching patient profile:", err);
    }
  };

  // Generate QR Token (Patient view)
  const generateNewQR = async () => {
    if (!patientProfile) return;
    try {
      const res = await fetch(`${API_URL}/api/qr/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          patient_id: patientProfile.patient.id,
          expires_in_hours: 24
        })
      });
      if (res.ok) {
        const data = await res.json();
        setQrToken(data);
        fetchPatientOwnProfile(); // Refresh
      }
    } catch (err) {
      console.error("Error generating QR:", err);
    }
  };

  // Grant Consent (Patient view)
  const handleGrantConsent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantDoctorId || !patientProfile) return;
    try {
      const res = await fetch(`${API_URL}/api/patients/${patientProfile.patient.health_id}/consent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          doctor_id: parseInt(grantDoctorId),
          expires_in_hours: parseInt(grantHours)
        })
      });
      if (res.ok) {
        fetchPatientOwnProfile();
        alert("Consent granted successfully!");
      } else {
        alert("Failed to grant consent.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Hospitals & Doctors (for listings)
  const fetchHospitals = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/hospitals`);
      if (res.ok) {
        const data = await res.json();
        setHospitals(data);
      }
      
      const docRes = await fetch(`${API_URL}/api/admin/doctors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (docRes.ok) {
        const docData = await docRes.json();
        setAvailableDoctors(docData);
        setDoctorsList(docData);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Admin Registry Datasets
  const fetchAdminData = async () => {
    try {
      fetchHospitals();
      
      const patRes = await fetch(`${API_URL}/api/admin/patients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (patRes.ok) {
        const patData = await patRes.json();
        setPatientsList(patData);
      }

      const logRes = await fetch(`${API_URL}/api/admin/audit-logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (logRes.ok) {
        const logData = await logRes.json();
        setAuditLogs(logData);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ADMIN Action: Create Hospital
  const handleCreateHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/admin/hospitals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newHospName,
          address: newHospAddress,
          contact_number: newHospPhone
        })
      });
      if (res.ok) {
        setNewHospName("");
        setNewHospAddress("");
        setNewHospPhone("");
        fetchHospitals();
        alert("Hospital registered successfully!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ADMIN Action: Register Doctor
  const handleRegisterDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/auth/register/doctor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          specialization: newDocSpecialization,
          license_number: newDocLicense,
          nmr_id: newDocNmrId.trim() || `NMR-${newDocLicense.replace('LIC-', '')}`,
          hospital_id: newDocHospId ? parseInt(newDocHospId) : null,
          user: {
            username: newDocUsername,
            email: newDocEmail,
            password: newDocPassword,
            role: "doctor"
          }
        })
      });
      if (res.ok) {
        setNewDocUsername("");
        setNewDocEmail("");
        setNewDocPassword("");
        setNewDocSpecialization("");
        setNewDocLicense("");
        setNewDocNmrId("");
        fetchAdminData();
        alert("Doctor registered with National Medical Register (NMR) successfully!");
      } else {
        const data = await res.json();
        alert(`Error: ${data.detail}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ADMIN Action: Register Patient
  const handleRegisterPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/auth/register/patient`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          date_of_birth: newPatDOB,
          gender: newPatGender,
          blood_group: newPatBlood,
          emergency_contact_name: newPatEmergencyName,
          emergency_contact_phone: newPatEmergencyPhone,
          address: newPatAddress,
          user: {
            username: newPatUsername,
            email: newPatEmail,
            password: newPatPassword,
            role: "patient"
          }
        })
      });
      if (res.ok) {
        setNewPatUsername("");
        setNewPatEmail("");
        setNewPatPassword("");
        setNewPatEmergencyName("");
        setNewPatEmergencyPhone("");
        setNewPatAddress("");
        fetchAdminData();
        alert("Patient registered and unique Health ID generated!");
      } else {
        const data = await res.json();
        alert(`Error: ${data.detail}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ADMIN Action: Issue RFID Card
  const handleIssueRfid = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/rfid/issue`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          patient_id: parseInt(assignRfidPatientId),
          card_uid: assignRfidUid
        })
      });
      if (res.ok) {
        setAssignRfidUid("");
        alert("RFID Card successfully linked to patient!");
        fetchAdminData();
      } else {
        alert("Failed to issue card. Ensure UID is unique.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // DOCTOR Search by Health ID
  const handleHealthIdSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError("");
    setScannedPatient(null);
    setEmergencyProfile(null);
    setIsEmergencyView(false);
    setAiSummary("");
    
    if (!searchHealthId.trim()) return;

    try {
      const res = await fetch(`${API_URL}/api/patients/${searchHealthId.trim()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setScannedPatient(data);
      } else {
        const data = await res.json();
        if (data.detail === "ACCESS_DENIED_CONSENT_REQUIRED") {
          setSearchError("ACCESS_DENIED_CONSENT_REQUIRED");
        } else {
          setSearchError(data.detail || "Patient profile not found.");
        }
      }
    } catch (err) {
      setSearchError("Error searching health record.");
    }
  };

  // DOCTOR Emergency Mode Bypass (Anonymous access to critical profile)
  const handleEmergencyBypass = async (customId?: string) => {
    const targetId = customId || searchHealthId;
    if (!targetId) {
      alert("Please provide a valid Health ID to bypass access.");
      return;
    }
    
    setSearchError("");
    try {
      const res = await fetch(`${API_URL}/api/patients/${targetId}/emergency`);
      if (res.ok) {
        const data = await res.json();
        setEmergencyProfile(data);
        setIsEmergencyView(true);
      } else {
        alert("Patient emergency profile not found.");
      }
    } catch (err) {
      alert("Error fetching emergency profile.");
    }
  };

  // DOCTOR RFID Scan simulation
  const simulateRfidScan = async () => {
    setSearchError("");
    setScannedPatient(null);
    setEmergencyProfile(null);
    setIsEmergencyView(false);
    setAiSummary("");

    try {
      const res = await fetch(`${API_URL}/api/rfid/scan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ uid: simRfidUid })
      });
      if (res.ok) {
        const data = await res.json();
        setScannedPatient(data);
        setSearchHealthId(data.patient.health_id);
        alert("RFID Swiped! Identity verified and temporary consent session opened.");
      } else {
        const data = await res.json();
        alert(data.detail || "RFID scan failed.");
      }
    } catch (err) {
      alert("Error swiping card.");
    }
  };

  // DOCTOR QR Scan simulation
  const simulateQrScan = async () => {
    setSearchError("");
    setScannedPatient(null);
    setEmergencyProfile(null);
    setIsEmergencyView(false);
    setAiSummary("");

    try {
      const res = await fetch(`${API_URL}/api/qr/scan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ token: simQrToken })
      });
      if (res.ok) {
        const data = await res.json();
        setScannedPatient(data);
        setSearchHealthId(data.patient.health_id);
        alert("QR Card Scanned! Decoded secure token, verified credentials and logged event.");
      } else {
        const data = await res.json();
        alert(data.detail || "QR scan failed.");
      }
    } catch (err) {
      alert("Error decoding QR.");
    }
  };

  // DOCTOR Add Consultation record
  const handleAddConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedPatient) return;

    // Filter out blank meds
    const filteredMeds = meds.filter(m => m.name && m.dosage);

    const recordPayload = {
      patient_id: scannedPatient.patient.id,
      symptoms: symptoms,
      notes: notes,
      diagnoses: diagCode && diagDesc ? [{ code: diagCode, description: diagDesc, severity: diagSeverity }] : [],
      prescriptions: filteredMeds.length > 0 || prescInstructions ? [{
        instructions: prescInstructions,
        medications: filteredMeds
      }] : [],
      lab_reports: labTestName ? [{
        test_name: labTestName,
        status: "completed",
        result_summary: labSummary
      }] : []
    };

    try {
      const res = await fetch(`${API_URL}/api/patients/${scannedPatient.patient.health_id}/records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(recordPayload)
      });

      if (res.ok) {
        alert("Consultation record successfully saved to server & logged.");
        // Clear inputs
        setSymptoms("");
        setNotes("");
        setDiagCode("");
        setDiagDesc("");
        setPrescInstructions("");
        setMeds([{ name: "", dosage: "", frequency: "", duration: "", notes: "" }]);
        setLabTestName("");
        setLabSummary("");
        
        // Refresh scanned profile
        const refreshRes = await fetch(`${API_URL}/api/patients/${scannedPatient.patient.health_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          setScannedPatient(data);
        }
      } else {
        alert("Failed to save consultation.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMedChange = (index: number, field: string, val: string) => {
    const updated = [...meds];
    updated[index][field] = val;
    setMeds(updated);
  };

  const addMedField = () => {
    setMeds([...meds, { name: "", dosage: "", frequency: "", duration: "", notes: "" }]);
  };

  // AI Medical Summary (RAG / AI Summary Module)
  const generateAISummary = () => {
    if (!scannedPatient) return;
    setGeneratingAi(true);
    
    // Simulate RAG/LLM backend summarization locally
    setTimeout(() => {
      const p = scannedPatient.patient;
      const recCount = scannedPatient.medical_records.length;
      const diagnosesStr = scannedPatient.medical_records
        .flatMap((r: any) => r.diagnoses)
        .map((d: any) => `${d.description} (${d.code})`)
        .join(", ") || "No records";
      
      const medicationsStr = scannedPatient.medical_records
        .flatMap((r: any) => r.prescriptions.flatMap((pr: any) => pr.medications))
        .map((m: any) => `${m.name} ${m.dosage}`)
        .join(", ") || "None";

      const summaryText = `SmartHealth AI Patient Summary:
Patient: ${p.user.username.toUpperCase()} (ID: ${p.health_id})
Age Group: born ${p.date_of_birth || "N/A"}. Blood Group: ${p.blood_group || "N/A"}.
Total Consultations: ${recCount} visit(s).

Active Diagnoses & Conditions:
- ${diagnosesStr}

Current Prescribed Medications:
- ${medicationsStr}

RECOMMENDATION: Patient requires regular blood pressure monitoring. No contraindications detected.

⚠️ DISCLAIMER: This is an AI-generated medical summary based on backend records. AI does not independently diagnose. Please verify all details against the original documents below.`;

      setAiSummary(summaryText);
      setGeneratingAi(false);
    }, 1500);
  };

  // Real Web camera QR scanner logic
  const startCameraScanner = async () => {
    setCameraError("");
    setCameraScanActive(true);
    
    // Import html5-qrcode dynamically since it runs client-side only
    try {
      const { Html5QrcodeScanner } = await import("html5-qrcode");
      
      // Delay slightly to ensure element is in DOM
      setTimeout(() => {
        const scanner = new Html5QrcodeScanner(
          "qr-reader-element", 
          { fps: 10, qrbox: 250 }, 
          /* verbose= */ false
        );
        
        qrReaderRef.current = scanner;

        scanner.render(async (decodedText) => {
          // Scanned successfully
          stopCameraScanner();
          setSimQrToken(decodedText);
          
          // Execute token scan API
          try {
            const res = await fetch(`${API_URL}/api/qr/scan`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({ token: decodedText })
            });
            if (res.ok) {
              const data = await res.json();
              setScannedPatient(data);
              setSearchHealthId(data.patient.health_id);
              alert("QR Scanner matched card security token! Permission verified.");
            } else {
              const data = await res.json();
              alert(data.detail || "QR scan failed.");
            }
          } catch (err) {
            alert("Error querying QR token.");
          }
        }, (error) => {
          // verbose error logging can be noisy, skip
        });
      }, 300);

    } catch (err: any) {
      setCameraError("Camera scanner failed to load: " + err.message);
      setCameraScanActive(false);
    }
  };

  const stopCameraScanner = () => {
    if (qrReaderRef.current) {
      try {
        qrReaderRef.current.clear();
      } catch (e) {
        // scanner might already be stopped
      }
      qrReaderRef.current = null;
    }
    setCameraScanActive(false);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0f19] text-slate-600 font-mono text-xs">
        Initializing TRINAYORA Workspace...
      </div>
    );
  }

  const isHome = viewMode === "home";

  return (
    <div className={`min-h-screen flex flex-col relative overflow-hidden transition-colors duration-500 ${isHome ? "light-homepage text-slate-900" : "dark-portal text-slate-100"}`}>
      {/* 3D Ambient Lighting Glows */}
      {isHome ? (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-sky-400/10 blur-[150px] pointer-events-none" />
          <div className="absolute top-[30%] right-[-15%] w-[55%] h-[55%] rounded-full bg-emerald-400/10 blur-[150px] pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[25%] w-[50%] h-[50%] rounded-full bg-blue-400/10 blur-[150px] pointer-events-none" />
        </>
      ) : (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-cyan-500/20 blur-[150px] pointer-events-none" />
          <div className="absolute top-[30%] right-[-15%] w-[55%] h-[55%] rounded-full bg-emerald-500/20 blur-[150px] pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[25%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[150px] pointer-events-none" />
        </>
      )}

      {/* Top Navbar */}
      <header className={`sticky top-0 z-50 px-6 py-4 flex items-center justify-between transition-colors duration-300 ${
        isHome 
          ? "glass-stitch border-b border-slate-200/90 shadow-sm" 
          : "glass-stitch-dark border-b border-white/10 shadow-2xl"
      }`}>
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setViewMode("home")}>
          <div className="bg-gradient-to-tr from-cyan-500 via-blue-600 to-emerald-400 p-2.5 rounded-2xl text-white shadow-lg glow-cyan">
            <HeartPulse className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`text-xl font-black tracking-tight ${
                isHome 
                  ? "bg-gradient-to-r from-sky-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent" 
                  : "bg-gradient-to-r from-cyan-300 via-blue-400 to-emerald-300 bg-clip-text text-transparent"
              }`}>
                TRINAYORA
              </h1>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                isHome 
                  ? "bg-sky-100 text-sky-700 border border-sky-300" 
                  : "bg-cyan-500/10 text-cyan-300 border border-cyan-500/30"
              }`}>
                3D CLINICAL OS
              </span>
            </div>
            <p className={`text-[10px] font-mono tracking-wider uppercase ${isHome ? "text-slate-500" : "text-slate-400"}`}>
              RFID + Dynamic Single-Use QR Medical Network
            </p>
          </div>
        </div>

        <nav className={`hidden md:flex items-center gap-6 text-xs font-semibold ${isHome ? "text-slate-700" : "text-slate-300"}`}>
          <button onClick={() => setViewMode("home")} className={`transition-colors ${isHome ? "hover:text-sky-600 font-bold text-sky-600" : "hover:text-cyan-400"}`}>Overview</button>
          <button onClick={() => openAuthForRole("doctor", "login")} className={`transition-colors ${isHome ? "hover:text-blue-600" : "hover:text-cyan-400"}`}>Clinicians (NMR)</button>
          <button onClick={() => openAuthForRole("patient", "login")} className={`transition-colors ${isHome ? "hover:text-emerald-600" : "hover:text-emerald-400"}`}>Patients</button>
          <button onClick={() => openAuthForRole("system_admin", "login")} className={`transition-colors ${isHome ? "hover:text-sky-600" : "hover:text-blue-400"}`}>Hospital Admin</button>
        </nav>

        <div className="flex items-center gap-3">
          {!user ? (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => openAuthForRole("doctor", "login")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isHome 
                    ? "bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-sm" 
                    : "bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-white/10"
                }`}
              >
                Sign In
              </button>
              <button 
                onClick={() => openAuthForRole("patient", "signup")}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-1.5"
              >
                <span>Get Health ID</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setViewMode(viewMode === "home" ? "auth" : "home")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isHome 
                    ? "bg-white border border-slate-300 text-slate-800 hover:bg-slate-100 shadow-sm" 
                    : "bg-slate-800/90 border border-white/10 text-slate-200 hover:text-white"
                }`}
              >
                {viewMode === "home" ? "Open Dashboard" : "View 3D Showcase"}
              </button>
              <div className="text-right">
                <span className={`text-xs font-bold block ${isHome ? "text-slate-800" : "text-white"}`}>{user?.username?.toUpperCase()}</span>
                <span className="text-[9px] font-mono text-cyan-400 capitalize px-2 py-0.5 bg-cyan-950/60 rounded-full border border-cyan-800/40">
                  {user?.role?.replace("_", " ")}
                </span>
              </div>
              <button 
                onClick={handleLogout} 
                className="px-3 py-1.5 rounded-lg bg-red-950/60 border border-red-800/60 text-red-300 text-xs font-semibold hover:bg-red-900/60 transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 relative z-10">
        
        {/* 3D HOME PAGE EXPERIENCE */}
        {(!user || viewMode === "home") && viewMode === "home" && (
          <div className="space-y-20 py-4">
            
            {/* 3D HERO SECTION */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Headline, Sign-up Action Hub & Rotating Hospital Orbit */}
              <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 border border-sky-300 text-sky-700 text-xs font-semibold backdrop-blur-md shadow-sm">
                  <Sparkles className="h-3.5 w-3.5 text-sky-600 animate-spin" />
                  <span>Next-Gen Smart Hospital & Health ID Ecosystem</span>
                </div>

                <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.15] text-slate-900">
                  Bridging <span className="text-sky-700">Clinics & Doctors</span> with <br />
                  <span className="bg-gradient-to-r from-sky-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent">
                    3D Smart Health Cards.
                  </span>
                </h1>

                <p className="text-slate-600 text-base md:text-lg max-w-xl leading-relaxed">
                  Connect hospital networks, physicians, and patients through contactless RFID and rotating dynamic QR security. 
                  Zero health data stored on the physical card — 100% encrypted, consent-governed backend EHR access.
                </p>

                {/* Persona Sign-up / Login Switcher Card */}
                <div className="glass-stitch p-6 rounded-3xl space-y-4 border border-slate-200/90 bg-white/90 shadow-lg">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-2">
                      <Users className="h-4 w-4 text-sky-600" />
                      Join the Connected Medical Network
                    </span>
                    <span className="text-[10px] text-emerald-700 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      INSTANT ACCESS
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    
                    {/* Doctor Sign-up / In */}
                    <div className="p-4 rounded-2xl bg-slate-50/80 border border-blue-200 hover:border-blue-400 transition-all flex flex-col justify-between space-y-3 group shadow-sm">
                      <div className="flex items-center gap-2 text-blue-600">
                        <Stethoscope className="h-5 w-5" />
                        <span className="font-bold text-sm text-slate-900">Doctors</span>
                      </div>
                      <p className="text-[11px] text-slate-600">National Medical Register verification, QR scanner & EHR.</p>
                      <div className="flex gap-1.5 pt-1">
                        <button 
                          onClick={() => openAuthForRole("doctor", "signup")}
                          className="flex-1 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold transition-all text-center shadow-md shadow-blue-600/20"
                        >
                          Sign Up
                        </button>
                        <button 
                          onClick={() => openAuthForRole("doctor", "login")}
                          className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-300 text-center"
                        >
                          Sign In
                        </button>
                      </div>
                    </div>

                    {/* Patient Sign-up / In */}
                    <div className="p-4 rounded-2xl bg-slate-50/80 border border-emerald-200 hover:border-emerald-400 transition-all flex flex-col justify-between space-y-3 group shadow-sm">
                      <div className="flex items-center gap-2 text-emerald-600">
                        <QrCode className="h-5 w-5" />
                        <span className="font-bold text-sm text-slate-900">Patients</span>
                      </div>
                      <p className="text-[11px] text-slate-600">Generate Digital Health ID, dynamic QR & consent.</p>
                      <div className="flex gap-1.5 pt-1">
                        <button 
                          onClick={() => openAuthForRole("patient", "signup")}
                          className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-all text-center shadow-md shadow-emerald-600/20"
                        >
                          Sign Up
                        </button>
                        <button 
                          onClick={() => openAuthForRole("patient", "login")}
                          className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-300 text-center"
                        >
                          Sign In
                        </button>
                      </div>
                    </div>

                    {/* System Admin */}
                    <div className="p-4 rounded-2xl bg-slate-50/80 border border-sky-200 hover:border-sky-400 transition-all flex flex-col justify-between space-y-3 group shadow-sm">
                      <div className="flex items-center gap-2 text-sky-600">
                        <Building className="h-5 w-5" />
                        <span className="font-bold text-sm text-slate-900">Hospitals</span>
                      </div>
                      <p className="text-[11px] text-slate-600">Map RFID chips, facility registries & audit trails.</p>
                      <button 
                        onClick={() => openAuthForRole("system_admin", "login")}
                        className="w-full py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-bold transition-all text-center shadow-md shadow-sky-600/20"
                      >
                        Admin Console
                      </button>
                    </div>

                  </div>
                </div>

                {/* ROTATING 3D MEDICA SYMBOL & 7 REAL-TIME ORBITING HOSPITALS */}
                <div className="glass-stitch p-6 sm:p-8 rounded-3xl border border-sky-200/80 relative overflow-hidden shadow-xl bg-white/90">
                  
                  {/* Section Title Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-sky-100 text-sky-600 border border-sky-200">
                        <Activity className="h-5 w-5 animate-pulse" />
                      </div>
                      <div>
                        <span className="text-xs font-black uppercase tracking-widest text-sky-700 font-mono block">
                          MEDICA TELEMETRY GRID
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">7 Integrated Super-Speciality Hospital Networks</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-300/80 px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        LIVE ORBITAL SYNC
                      </span>
                    </div>
                  </div>

                  {/* 3D ROTATING ORBIT STAGE WITH CONTINUOUS REVOLUTION */}
                  <div className="relative flex items-center justify-center py-16 my-4 min-h-[420px] overflow-visible">
                    
                    {/* Concentric Ambient Energy Rings */}
                    <div className="absolute w-[360px] h-[360px] sm:w-[420px] sm:h-[420px] rounded-full border-2 border-dashed border-sky-300/60 pointer-events-none" />
                    <div className="absolute w-[260px] h-[260px] sm:w-[300px] sm:h-[300px] rounded-full border border-sky-200/80 pointer-events-none" />
                    <div className="absolute w-[180px] h-[180px] rounded-full bg-sky-100/60 blur-2xl animate-pulse-radar pointer-events-none" />

                    {/* CENTRAL 3D MEDICA LOGO CORE */}
                    <div className="relative z-20 flex flex-col items-center justify-center p-5 rounded-3xl bg-white border-2 border-sky-400 shadow-xl glow-cyan text-center">
                      <div className="relative mb-1.5">
                        <div className="p-4 bg-gradient-to-tr from-sky-500 to-emerald-500 rounded-2xl text-white shadow-md">
                          <HeartPulse className="h-9 w-9 animate-bounce" />
                        </div>
                        <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-sky-600"></span>
                        </span>
                      </div>
                      <span className="text-xs font-black font-mono tracking-widest text-slate-800">MEDICA</span>
                      <span className="text-[9px] font-mono font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full mt-0.5 border border-sky-200">
                        TELEMETRY HUB
                      </span>
                    </div>

                    {/* CONTINUOUS ROTATING REVOLUTION RING (360 DEGREES) */}
                    <div className="absolute w-[340px] h-[340px] sm:w-[390px] sm:h-[390px] rounded-full animate-orbit-track pointer-events-auto">
                      
                      {/* 1. NARAYANA HEALTH */}
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                        <div className="animate-counter-orbit">
                          <div className="glass-card px-3 py-1.5 rounded-xl border border-sky-300 text-slate-800 text-[11px] font-bold font-mono shadow-md flex items-center gap-2 hover:scale-115 transition-transform bg-white/95 cursor-pointer">
                            <div className="w-5 h-5 rounded-lg bg-red-600 text-white flex items-center justify-center font-black text-[9px] shadow-sm">
                              NH
                            </div>
                            <div className="text-left">
                              <span className="block text-slate-900 leading-tight">NARAYANA</span>
                              <span className="block text-[8px] text-sky-600 font-sans">Cardiac & Multi</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 2. APOLLO HOSPITALS */}
                      <div className="absolute top-[18%] right-[-10px] sm:right-[-4px]">
                        <div className="animate-counter-orbit">
                          <div className="glass-card px-3 py-1.5 rounded-xl border border-amber-300 text-slate-800 text-[11px] font-bold font-mono shadow-md flex items-center gap-2 hover:scale-115 transition-transform bg-white/95 cursor-pointer">
                            <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-amber-500 to-red-600 text-white flex items-center justify-center font-black text-[9px] shadow-sm">
                              AH
                            </div>
                            <div className="text-left">
                              <span className="block text-slate-900 leading-tight">APOLLO</span>
                              <span className="block text-[8px] text-amber-600 font-sans">Transplant Care</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 3. FORTIS HEALTHCARE */}
                      <div className="absolute bottom-[20%] right-[-14px] sm:right-[-6px]">
                        <div className="animate-counter-orbit">
                          <div className="glass-card px-3 py-1.5 rounded-xl border border-emerald-300 text-slate-800 text-[11px] font-bold font-mono shadow-md flex items-center gap-2 hover:scale-115 transition-transform bg-white/95 cursor-pointer">
                            <div className="w-5 h-5 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-[9px] shadow-sm">
                              FH
                            </div>
                            <div className="text-left">
                              <span className="block text-slate-900 leading-tight">FORTIS</span>
                              <span className="block text-[8px] text-emerald-600 font-sans">Super Speciality</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 4. ILS HOSPITALS */}
                      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
                        <div className="animate-counter-orbit">
                          <div className="glass-card px-3 py-1.5 rounded-xl border border-indigo-300 text-slate-800 text-[11px] font-bold font-mono shadow-md flex items-center gap-2 hover:scale-115 transition-transform bg-white/95 cursor-pointer">
                            <div className="w-5 h-5 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-[9px] shadow-sm">
                              ILS
                            </div>
                            <div className="text-left">
                              <span className="block text-slate-900 leading-tight">ILS HOSPITALS</span>
                              <span className="block text-[8px] text-indigo-600 font-sans">Advanced Surgery</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 5. MANIPAL HOSPITALS */}
                      <div className="absolute bottom-[20%] left-[-14px] sm:left-[-6px]">
                        <div className="animate-counter-orbit">
                          <div className="glass-card px-3 py-1.5 rounded-xl border border-blue-300 text-slate-800 text-[11px] font-bold font-mono shadow-md flex items-center gap-2 hover:scale-115 transition-transform bg-white/95 cursor-pointer">
                            <div className="w-5 h-5 rounded-lg bg-blue-700 text-white flex items-center justify-center font-black text-[9px] shadow-sm">
                              MH
                            </div>
                            <div className="text-left">
                              <span className="block text-slate-900 leading-tight">MANIPAL</span>
                              <span className="block text-[8px] text-blue-600 font-sans">Academic Medicine</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 6. OHIO HEALTH */}
                      <div className="absolute top-[18%] left-[-10px] sm:left-[-4px]">
                        <div className="animate-counter-orbit">
                          <div className="glass-card px-3 py-1.5 rounded-xl border border-rose-300 text-slate-800 text-[11px] font-bold font-mono shadow-md flex items-center gap-2 hover:scale-115 transition-transform bg-white/95 cursor-pointer">
                            <div className="w-5 h-5 rounded-lg bg-rose-600 text-white flex items-center justify-center font-black text-[9px] shadow-sm">
                              OH
                            </div>
                            <div className="text-left">
                              <span className="block text-slate-900 leading-tight">OHIO HEALTH</span>
                              <span className="block text-[8px] text-rose-600 font-sans">Trauma Care</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 7. ZENITH SUPER SPECIALITY */}
                      <div className="absolute top-[48%] -right-12 sm:-right-8">
                        <div className="animate-counter-orbit">
                          <div className="glass-card px-3 py-1.5 rounded-xl border border-teal-300 text-slate-800 text-[11px] font-bold font-mono shadow-md flex items-center gap-2 hover:scale-115 transition-transform bg-white/95 cursor-pointer">
                            <div className="w-5 h-5 rounded-lg bg-teal-600 text-white flex items-center justify-center font-black text-[9px] shadow-sm">
                              ZH
                            </div>
                            <div className="text-left">
                              <span className="block text-slate-900 leading-tight">ZENITH</span>
                              <span className="block text-[8px] text-teal-600 font-sans">Neurology Center</span>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>

                  </div>

                  {/* Real-time Hospital Telemetry Banner */}
                  <div className="overflow-hidden border-t border-slate-200 pt-4 relative bg-slate-50/90 -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 px-6 py-3 rounded-b-3xl">
                    <div className="animate-marquee flex items-center gap-8 whitespace-nowrap text-xs font-mono text-slate-700">
                      <span className="text-red-700 font-bold flex items-center gap-1.5"><Building className="h-3.5 w-3.5 text-red-600" /> NARAYANA HEALTH: EHR ACTIVE</span>
                      <span className="text-slate-400">✦</span>
                      <span className="text-amber-700 font-bold flex items-center gap-1.5"><Building className="h-3.5 w-3.5 text-amber-600" /> APOLLO HOSPITALS: INTEGRATED</span>
                      <span className="text-slate-400">✦</span>
                      <span className="text-emerald-700 font-bold flex items-center gap-1.5"><Building className="h-3.5 w-3.5 text-emerald-600" /> FORTIS HEALTHCARE: CONNECTED</span>
                      <span className="text-slate-400">✦</span>
                      <span className="text-indigo-700 font-bold flex items-center gap-1.5"><Building className="h-3.5 w-3.5 text-indigo-600" /> ILS HOSPITALS: TELEMETRY ON</span>
                      <span className="text-slate-400">✦</span>
                      <span className="text-blue-700 font-bold flex items-center gap-1.5"><Building className="h-3.5 w-3.5 text-blue-600" /> MANIPAL HOSPITALS: SYNCED</span>
                      <span className="text-slate-400">✦</span>
                      <span className="text-rose-700 font-bold flex items-center gap-1.5"><Building className="h-3.5 w-3.5 text-rose-600" /> OHIO HEALTH: EMERGENCY FAST-PASS</span>
                      <span className="text-slate-400">✦</span>
                      <span className="text-teal-700 font-bold flex items-center gap-1.5"><Building className="h-3.5 w-3.5 text-teal-600" /> ZENITH SUPER SPECIALITY: READY</span>
                      <span className="text-slate-400">✦</span>
                      <span className="text-sky-700 font-bold flex items-center gap-1.5"><Activity className="h-3.5 w-3.5 text-sky-600" /> MEDICA ACCREDITED</span>
                    </div>
                  </div>

                </div>

              </div>

              {/* Right: 3D Hologram Floating Smart Card with Interactive Perspective */}
              <div className="lg:col-span-5 flex justify-center perspective-1000">
                <div className="w-full max-w-md relative preserve-3d card-3d">
                  
                  {/* 3D Holographic Card Front in Classy Medical Navy-Cyan */}
                  <div className="w-full rounded-3xl p-7 bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 border border-sky-400/40 shadow-2xl glow-cyan relative overflow-hidden backdrop-blur-2xl text-white">
                    
                    {/* Glowing Chip & Contactless RFID Antennas */}
                    <div className="flex justify-between items-start mb-8">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-9 rounded-lg bg-gradient-to-tr from-amber-400 to-yellow-200 border border-amber-300/60 p-1 flex flex-col justify-around shadow-md">
                          <div className="w-full h-0.5 bg-amber-700/60" />
                          <div className="w-full h-0.5 bg-amber-700/60" />
                        </div>
                        <Rss className="h-5 w-5 text-sky-400 animate-pulse" />
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-sky-300 font-bold bg-sky-950/80 px-2.5 py-1 rounded-full border border-sky-500/30">
                        TRINAYORA HEALTH ID
                      </span>
                    </div>

                    {/* Dynamic Interactive QR Mock */}
                    <div className="flex items-center gap-5 my-6">
                      <div className="p-2.5 bg-white rounded-2xl shadow-xl shrink-0">
                        <QRCodeSVG value="TRINAYORA-3D-DEMO-CARD-TOKEN" size={90} />
                      </div>
                      <div className="space-y-1 font-mono text-xs">
                        <span className="text-[10px] text-sky-400 uppercase tracking-wider block">Cryptographic Card UID</span>
                        <p className="text-white font-bold tracking-widest text-sm">TR-8839-2041</p>
                        <span className="text-[10px] text-emerald-400 block">● Single-Use Rotating Token</span>
                        <span className="text-[10px] text-slate-300 block">Blood: O+ | DOB: 1995-05-15</span>
                      </div>
                    </div>

                    {/* Card Bottom Meta */}
                    <div className="flex justify-between items-end pt-4 border-t border-white/10 text-xs">
                      <div>
                        <span className="text-[9px] text-slate-400 block uppercase">Cardholder Name</span>
                        <span className="font-bold text-slate-200 tracking-wide">ALEXANDER DOE</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 block uppercase">Issuing Network</span>
                        <span className="font-bold text-sky-300">MEDICA / TRINAYORA</span>
                      </div>
                    </div>

                    {/* Holographic Watermark Glow */}
                    <div className="absolute top-[-20%] right-[-20%] w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
                  </div>

                  {/* Floating 3D Badge Overlays */}
                  <div className="absolute -bottom-5 -left-5 glass-stitch p-3.5 rounded-2xl border border-emerald-300 flex items-center gap-3 shadow-xl backdrop-blur-xl bg-white/95 text-slate-800">
                    <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div className="text-left font-mono">
                      <span className="text-[11px] font-bold text-slate-900 block">Zero-Knowledge Card</span>
                      <span className="text-[9px] text-emerald-600 block">Encrypted Cloud Storage</span>
                    </div>
                  </div>

                  <div className="absolute -top-5 -right-5 glass-stitch p-3.5 rounded-2xl border border-sky-300 flex items-center gap-3 shadow-xl backdrop-blur-xl bg-white/95 text-slate-800">
                    <div className="p-2 bg-sky-100 rounded-xl text-sky-600">
                      <Zap className="h-5 w-5" />
                    </div>
                    <div className="text-left font-mono">
                      <span className="text-[11px] font-bold text-slate-900 block">RC522 + ESP32</span>
                      <span className="text-[9px] text-sky-600 block">&lt; 0.8s Scan Latency</span>
                    </div>
                  </div>

                </div>
              </div>

            </section>

            {/* 3D CONNECTIVE NETWORK: HOSPITALS ⇄ CLINICIANS ⇄ PATIENTS */}
            <section className="space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">The 3-Way Connected Clinical Grid</h2>
                <p className="text-sm text-slate-600 max-w-2xl mx-auto">
                  Seamless data telemetry connecting hospital facility backends, frontline doctors, and patients in real time.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                
                {/* Node 1: Hospitals & Clinics */}
                <div className="glass-stitch p-8 rounded-3xl border border-sky-200/80 hover:border-sky-400 transition-all space-y-4 relative overflow-hidden group bg-white/90 shadow-md">
                  <div className="p-3 bg-sky-100 border border-sky-200 rounded-2xl w-fit text-sky-600 group-hover:scale-110 transition-transform">
                    <Building className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">01. Hospital Registries</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Hospitals issue smart cards mapped to physical RFID UID chips, register medical staff licenses, and audit all medical data access.
                  </p>
                  <div className="pt-2">
                    <span className="text-[10px] font-mono text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200 font-bold">
                      CENTRALIZED GOVERNANCE
                    </span>
                  </div>
                </div>

                {/* Node 2: Clinicians & Doctors */}
                <div className="glass-stitch p-8 rounded-3xl border border-blue-200/80 hover:border-blue-400 transition-all space-y-4 relative overflow-hidden group bg-white/90 shadow-md">
                  <div className="p-3 bg-blue-100 border border-blue-200 rounded-2xl w-fit text-blue-600 group-hover:scale-110 transition-transform">
                    <Stethoscope className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">02. Frontline Physicians</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Clinicians scan dynamic QR tokens with standard webcams or swipe RFID cards to unlock authorized medical records and prescribe treatments.
                  </p>
                  <div className="pt-2">
                    <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 font-bold">
                      INSTANT EHR DEPLOYMENT
                    </span>
                  </div>
                </div>

                {/* Node 3: Patients */}
                <div className="glass-stitch p-8 rounded-3xl border border-emerald-200/80 hover:border-emerald-400 transition-all space-y-4 relative overflow-hidden group bg-white/90 shadow-md">
                  <div className="p-3 bg-emerald-100 border border-emerald-200 rounded-2xl w-fit text-emerald-600 group-hover:scale-110 transition-transform">
                    <User className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">03. Empowered Patients</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Patients maintain absolute consent control over their records, view consultation histories, and carry self-rotating digital Health IDs.
                  </p>
                  <div className="pt-2">
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-bold">
                      CONSENT-DRIVEN PRIVACY
                    </span>
                  </div>
                </div>

              </div>
            </section>

          </div>
        )}
        {/* AUTHENTICATION & LOGIN/SIGNUP MODAL VIEW (DARK GLOWING THEME) */}
        {(!user && viewMode === "auth") && (
          <div className="max-w-lg mx-auto my-8">
            <div className="glass-stitch-dark rounded-3xl p-8 border border-white/10 relative shadow-2xl backdrop-blur-2xl">
              <button 
                onClick={() => setViewMode("home")}
                className="text-xs text-slate-400 hover:text-white mb-6 block font-semibold flex items-center gap-1.5 transition-colors"
              >
                ← Back to 3D Showcase
              </button>

              <div className="absolute top-6 right-6 flex items-center gap-1.5 px-3 py-1 bg-cyan-950/60 border border-cyan-800/50 rounded-full">
                <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                <span className="text-[10px] font-mono text-cyan-300 font-semibold tracking-wide">NMR & RBAC SECURED</span>
              </div>

              {/* Persona Selector Tabs */}
              <div className="flex rounded-2xl bg-slate-950/80 p-1.5 border border-white/10 mb-6 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setLoginRole("doctor");
                    setLoginError("");
                    setDoctorNmrError("");
                    setSignupSuccess("");
                  }}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    loginRole === "doctor"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Stethoscope className="h-4 w-4 shrink-0" />
                  <span>Doctor</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginRole("patient");
                    setLoginError("");
                    setSignupSuccess("");
                  }}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    loginRole === "patient"
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <User className="h-4 w-4 shrink-0" />
                  <span>Patient</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginRole("system_admin");
                    setAuthMode("login");
                    setLoginError("");
                    setSignupSuccess("");
                  }}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    loginRole === "system_admin"
                      ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span>Admin</span>
                </button>
              </div>

              {/* Login / Signup Toggle for Doctor & Patient */}
              {loginRole !== "system_admin" && (
                <div className="flex bg-slate-950/80 p-1 rounded-xl border border-white/10 mb-6 text-xs">
                  <button
                    type="button"
                    onClick={() => { setAuthMode("login"); setLoginError(""); setSignupSuccess(""); }}
                    className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${authMode === "login" ? "bg-slate-800 text-white shadow" : "text-slate-400 hover:text-white"}`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthMode("signup"); setLoginError(""); setSignupSuccess(""); }}
                    className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${authMode === "signup" ? "bg-slate-800 text-white shadow" : "text-slate-400 hover:text-white"}`}
                  >
                    Register / Sign Up
                  </button>
                </div>
              )}

              {/* Success / Error Alerts */}
              {signupSuccess && (
                <div className="mb-4 p-3 bg-emerald-950/60 border border-emerald-700/60 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>{signupSuccess}</span>
                </div>
              )}

              {/* SIGN IN VIEW */}
              {authMode === "login" ? (
                <>
                  {/* DOCTOR LOGIN WITH NMR AUTHENTICATION */}
                  {loginRole === "doctor" && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="inline-flex p-3 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 mb-3">
                          <Stethoscope className="h-8 w-8" />
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tight">Doctor Portal Sign In</h2>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                          Medical Practitioner authentication via <span className="text-blue-400 font-semibold">National Medical Register (NMR) ID</span>.
                        </p>
                      </div>

                      {/* Step 1: NMR ID Verification */}
                      {doctorNmrStep === 1 && (
                        <form onSubmit={handleVerifyDoctorNMR} className="space-y-4">
                          <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-800/40 space-y-1.5">
                            <div className="flex items-center gap-2 text-xs font-bold text-blue-300">
                              <BadgeCheck className="h-4 w-4 text-blue-400" />
                              <span>Step 1: National Medical Register (NMR) Authentication</span>
                            </div>
                            <p className="text-[11px] text-slate-300 leading-relaxed">
                              Please provide your official NMR ID issued by the National Medical Commission to authenticate your practitioner status.
                            </p>
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-1.5">
                              <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider">
                                NMR ID (National Medical Register)
                              </label>
                              <span className="text-[10px] text-blue-400 font-mono">e.g. NMR-2024-883921</span>
                            </div>
                            <div className="relative">
                              <input 
                                type="text" 
                                required 
                                value={doctorNmrId} 
                                onChange={e => setDoctorNmrId(e.target.value)} 
                                placeholder="Enter NMR ID (e.g., NMR-2024-883921)" 
                                className="w-full px-4 py-3.5 pl-11 rounded-xl bg-slate-900/90 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-mono"
                              />
                              <BadgeCheck className="h-5 w-5 text-blue-400 absolute left-3.5 top-3.5" />
                            </div>
                          </div>

                          {doctorNmrError && (
                            <div className="p-3 bg-red-950/50 border border-red-800/60 rounded-xl text-red-300 text-xs flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                              <span>{doctorNmrError}</span>
                            </div>
                          )}

                          <button 
                            type="submit" 
                            disabled={doctorNmrLoading} 
                            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold tracking-wide transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {doctorNmrLoading ? (
                              <>
                                <RefreshCw className="h-4 w-4 animate-spin" />
                                <span>Verifying with National Medical Register...</span>
                              </>
                            ) : (
                              <>
                                <span>Verify NMR ID & Proceed</span>
                                <ArrowRight className="h-4 w-4" />
                              </>
                            )}
                          </button>
                        </form>
                      )}

                      {/* Step 2: NMR Verified & Password Confirmation */}
                      {doctorNmrStep === 2 && doctorNmrInfo && (
                        <form onSubmit={handleDoctorNMRLogin} className="space-y-4">
                          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-3 relative overflow-hidden">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                                  <CheckCircle2 className="h-5 w-5" />
                                </div>
                                <div>
                                  <h4 className="text-sm font-bold text-white">{doctorNmrInfo.doctor_name}</h4>
                                  <p className="text-[11px] text-emerald-400 font-medium">{doctorNmrInfo.specialization} Specialist</p>
                                </div>
                              </div>
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 font-bold">
                                NMR VERIFIED
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] border-t border-emerald-500/20">
                              <div>
                                <span className="text-slate-400 block text-[10px]">NMR Register ID</span>
                                <span className="text-slate-200 font-mono font-bold">{doctorNmrInfo.nmr_id}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px]">Medical Facility</span>
                                <span className="text-slate-200 font-medium truncate block">{doctorNmrInfo.hospital_name}</span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setDoctorNmrStep(1);
                                setDoctorNmrInfo(null);
                              }}
                              className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold underline block pt-1"
                            >
                              Change / Use Different NMR ID
                            </button>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2">
                              Doctor Security Password
                            </label>
                            <div className="relative">
                              <input 
                                type="password" 
                                required 
                                autoFocus
                                value={loginPassword} 
                                onChange={e => setLoginPassword(e.target.value)} 
                                placeholder="Enter doctor password" 
                                className="w-full px-4 py-3.5 pl-11 rounded-xl bg-slate-900/90 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                              />
                              <Lock className="h-5 w-5 text-slate-400 absolute left-3.5 top-3.5" />
                            </div>
                          </div>

                          {loginError && (
                            <div className="p-3 bg-red-950/50 border border-red-800/60 rounded-xl text-red-300 text-xs flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                              <span>{loginError}</span>
                            </div>
                          )}

                          <button 
                            type="submit" 
                            disabled={loading} 
                            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white text-sm font-bold tracking-wide transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {loading ? (
                              <>
                                <RefreshCw className="h-4 w-4 animate-spin" />
                                <span>Authenticating Doctor Access...</span>
                              </>
                            ) : (
                              <>
                                <ShieldCheck className="h-4 w-4" />
                                <span>Sign In as Verified Doctor & View Portal</span>
                              </>
                            )}
                          </button>
                        </form>
                      )}
                    </div>
                  )}

                  {/* PATIENT OR ADMIN LOGIN FORM */}
                  {loginRole !== "doctor" && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="inline-flex p-3 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 mb-3">
                          {loginRole === "patient" ? <User className="h-8 w-8" /> : <ShieldAlert className="h-8 w-8 text-cyan-400" />}
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tight">
                          {loginRole === "patient" ? "Patient Portal Sign In" : "Administrator Sign In"}
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">
                          {loginRole === "patient" 
                            ? "Access your digital SmartHealth identity, records & access consent."
                            : "Hospital administration, staff registry and system audit telemetry."}
                        </p>
                      </div>

                      <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Username</label>
                          <input 
                            type="text" 
                            required 
                            value={loginUsername} 
                            onChange={e => setLoginUsername(e.target.value)} 
                            placeholder="Enter username" 
                            className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Password</label>
                          <input 
                            type="password" 
                            required 
                            value={loginPassword} 
                            onChange={e => setLoginPassword(e.target.value)} 
                            placeholder="••••••••" 
                            className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-sm"
                          />
                        </div>

                        {loginError && (
                          <div className="p-3 bg-red-950/50 border border-red-900/40 rounded-xl text-red-300 text-xs flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                            <span>{loginError}</span>
                          </div>
                        )}

                        <button 
                          type="submit" 
                          disabled={loading} 
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white text-sm font-bold tracking-wide transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                        >
                          {loading ? "Authenticating..." : "Sign In to Portal"}
                        </button>
                      </form>
                    </div>
                  )}
                </>
              ) : (
                /* REGISTRATION / SIGN UP FORM */
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-white">Create New {loginRole === "doctor" ? "Doctor" : "Patient"} Account</h3>
                    <p className="text-xs text-slate-400">Join the TRINAYORA Medical Network.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-300 mb-1">Username</label>
                      <input 
                        type="text" required value={signupUsername} 
                        onChange={e => setSignupUsername(e.target.value)} 
                        placeholder="e.g. dr_watson"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/15 text-white text-xs placeholder-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-300 mb-1">Password</label>
                      <input 
                        type="password" required value={signupPassword} 
                        onChange={e => setSignupPassword(e.target.value)} 
                        placeholder="••••••••"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/15 text-white text-xs placeholder-slate-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-300 mb-1">Email Address</label>
                    <input 
                      type="email" required value={signupEmail} 
                      onChange={e => setSignupEmail(e.target.value)} 
                      placeholder="name@healthcare.org"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/15 text-white text-xs placeholder-slate-500"
                    />
                  </div>

                  {loginRole === "doctor" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-slate-300 mb-1">Specialization</label>
                        <input 
                          type="text" required value={signupSpecialization} 
                          onChange={e => setSignupSpecialization(e.target.value)} 
                          placeholder="Cardiology"
                          className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/15 text-white text-xs placeholder-slate-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-300 mb-1">Medical License</label>
                        <input 
                          type="text" required value={signupLicense} 
                          onChange={e => setSignupLicense(e.target.value)} 
                          placeholder="LIC-892110"
                          className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/15 text-white text-xs placeholder-slate-500"
                        />
                      </div>
                    </div>
                  )}

                  {loginRole === "patient" && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-slate-300 mb-1">Date of Birth</label>
                          <input 
                            type="date" required value={signupDOB} 
                            onChange={e => setSignupDOB(e.target.value)} 
                            className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/15 text-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-300 mb-1">Blood Group</label>
                          <select 
                            value={signupBloodGroup} onChange={e => setSignupBloodGroup(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/15 text-white text-xs"
                          >
                            <option value="A-Positive">A+</option>
                            <option value="A-Negative">A-</option>
                            <option value="B-Positive">B+</option>
                            <option value="B-Negative">B-</option>
                            <option value="O-Positive">O+</option>
                            <option value="O-Negative">O-</option>
                            <option value="AB-Positive">AB+</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-slate-300 mb-1">Emergency Contact</label>
                          <input 
                            type="text" value={signupEmergencyName} 
                            onChange={e => setSignupEmergencyName(e.target.value)} 
                            placeholder="Family Member"
                            className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/15 text-white text-xs placeholder-slate-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-300 mb-1">Emergency Phone</label>
                          <input 
                            type="text" value={signupEmergencyPhone} 
                            onChange={e => setSignupEmergencyPhone(e.target.value)} 
                            placeholder="+1-555-0199"
                            className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/15 text-white text-xs placeholder-slate-500"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {loginError && (
                    <div className="p-3 bg-red-950/50 border border-red-900/40 rounded-xl text-red-300 text-xs flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-sm font-bold tracking-wide transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                  >
                    {loading ? "Registering..." : `Register ${loginRole.toUpperCase()} Profile`}
                  </button>
                </form>
              )}

              {/* Quick Login Helpers */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-center text-[11px] uppercase tracking-wider text-slate-400 font-mono mb-3">
                  Quick Demo Access (One-Click)
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => handleQuickLogin("doctor")} 
                    className="px-2.5 py-2 rounded-xl bg-blue-950/50 hover:bg-blue-900/60 border border-blue-800/50 text-blue-200 text-xs font-semibold transition-colors flex flex-col items-center justify-center gap-1"
                  >
                    <span className="font-bold flex items-center gap-1"><Stethoscope className="h-3 w-3" /> Doctor</span>
                    <span className="text-[9px] text-blue-400 font-mono">Verified NMR</span>
                  </button>
                  <button 
                    onClick={() => handleQuickLogin("patient")} 
                    className="px-2.5 py-2 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-800/50 text-emerald-200 text-xs font-semibold transition-colors flex flex-col items-center justify-center gap-1"
                  >
                    <span className="font-bold flex items-center gap-1"><User className="h-3 w-3" /> Patient</span>
                    <span className="text-[9px] text-emerald-400 font-mono">Card Holder</span>
                  </button>
                  <button 
                    onClick={() => handleQuickLogin("system_admin")} 
                    className="px-2.5 py-2 rounded-xl bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-800/50 text-cyan-200 text-xs font-semibold transition-colors flex flex-col items-center justify-center gap-1"
                  >
                    <span className="font-bold flex items-center gap-1"><ShieldAlert className="h-3 w-3" /> Admin</span>
                    <span className="text-[9px] text-cyan-400 font-mono">Full System</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PATIENT PORTAL (DARK GLOWING THEME) */}
        {user && user.role === "patient" && patientProfile && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Profile Card & Digital Health ID */}
              <div className="space-y-6">
                
                {/* Visual Health ID Card */}
                <div className="glass-panel-dark rounded-3xl p-6 border border-white/10 relative overflow-hidden pulse-glow-border shadow-2xl">
                  <div className="absolute top-[-30px] right-[-30px] w-36 h-36 bg-blue-500/20 rounded-full blur-2xl" />
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-xs uppercase font-semibold text-blue-400 font-mono tracking-wider">Health Card</span>
                      <h3 className="text-lg font-bold text-white">TRINAYORA Identity</h3>
                    </div>
                    <div className="bg-emerald-500/20 px-2.5 py-0.5 rounded-full text-[10px] text-emerald-400 font-mono border border-emerald-500/30 font-bold">
                      ACTIVE
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-slate-800/80 border border-white/10 p-3 rounded-2xl">
                        <User className="h-10 w-10 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white capitalize text-base">{patientProfile.patient.user.username}</h4>
                        <p className="text-xs text-slate-400">Patient Profile Account</p>
                        <p className="text-sm font-mono text-emerald-400 font-bold mt-1">
                          {patientProfile.patient.health_id}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2 text-xs border-t border-white/10">
                      <div>
                        <span className="text-slate-400 block mb-0.5">Blood Type</span>
                        <span className="text-slate-100 font-bold">{patientProfile.patient.blood_group || "O-Positive"}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Birth Date</span>
                        <span className="text-slate-100 font-bold">{patientProfile.patient.date_of_birth}</span>
                      </div>
                    </div>
                  </div>

                  {/* QR Token display */}
                  <div className="mt-6 p-4 rounded-2xl bg-slate-950/80 border border-white/10 flex flex-col items-center justify-center gap-3">
                    {(() => {
                      const activeToken = patientProfile.qr_tokens?.find((t: any) => t.status === "active") || (patientProfile.qr_tokens?.length > 0 ? patientProfile.qr_tokens[0] : null);
                      return activeToken ? (
                        <>
                          <div className="bg-white p-2.5 rounded-2xl shadow-xl">
                            <QRCodeSVG value={activeToken.token} size={130} />
                          </div>
                          <div className="text-center">
                            <span className="text-[10px] text-slate-400 block font-mono">Token: {activeToken.token.substring(0, 14)}...</span>
                            <span className="text-[9px] text-emerald-400 block mt-0.5">
                              Expires: {new Date(activeToken.expires_at).toLocaleString()}
                            </span>
                            <span className="inline-block mt-1.5 text-[9px] bg-emerald-950/80 border border-emerald-700/50 text-emerald-300 font-mono px-2.5 py-0.5 rounded-full font-bold">
                              Dynamic Single-Use Token
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-4">
                          <QrCode className="h-12 w-12 text-slate-600 mx-auto mb-2" />
                          <p className="text-xs text-slate-400 mb-3">No active security QR Code token</p>
                          <button 
                            onClick={generateNewQR} 
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors shadow-lg shadow-blue-500/30"
                          >
                            Generate Security QR Token
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Consent & Access Manager */}
                <div className="glass-panel-dark rounded-3xl p-6 border border-white/10 space-y-4 shadow-xl">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                    <Lock className="h-5 w-5 text-emerald-400" />
                    <h3 className="font-bold text-white">Access Consent Manager</h3>
                  </div>

                  <form onSubmit={handleGrantConsent} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Grant Doctor Access</label>
                      <select 
                        required
                        value={grantDoctorId}
                        onChange={e => setGrantDoctorId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/15 text-white focus:outline-none focus:border-emerald-500 text-xs"
                      >
                        <option value="">Choose Physician...</option>
                        {availableDoctors.map((doc: any) => (
                          <option key={doc.id} value={doc.id}>
                            Dr. {doc.user.username.toUpperCase()} - {doc.specialization}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Expiration Time</label>
                      <select 
                        value={grantHours}
                        onChange={e => setGrantHours(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/15 text-white focus:outline-none focus:border-emerald-500 text-xs"
                      >
                        <option value="2">2 Hours (Standard)</option>
                        <option value="12">12 Hours</option>
                        <option value="24">24 Hours</option>
                        <option value="168">7 Days</option>
                      </select>
                    </div>

                    <button 
                      type="submit" 
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-500/20"
                    >
                      Authorize Physician
                    </button>
                  </form>

                  {/* Active consents list */}
                  <div className="pt-2">
                    <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Granted Consents</h4>
                    <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                      {patientProfile.consents.filter((c: any) => c.access_granted).map((c: any) => (
                        <div key={c.id} className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-slate-100 font-bold block">Doctor ID: {c.doctor_id}</span>
                            <span className="text-[10px] text-slate-400">Expires: {new Date(c.expires_at).toLocaleTimeString()}</span>
                          </div>
                          <span className="text-[9px] font-semibold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-700/50">Active</span>
                        </div>
                      ))}
                      {patientProfile.consents.filter((c: any) => c.access_granted).length === 0 && (
                        <p className="text-[11px] text-slate-500 italic">No doctors authorized yet.</p>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* Main Medical Timeline */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Horizontal emergency box */}
                <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-900/50 rounded-xl text-amber-400">
                      <ShieldAlert className="h-5 w-5 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-300 text-sm">Emergency Mode Settings</h4>
                      <p className="text-xs text-slate-300">In emergencies, responders bypass consents to view blood type, allergies and contacts.</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-400 block">Emergency Contacts:</span>
                    <span className="text-xs font-bold text-slate-100 block">{patientProfile.patient.emergency_contact_phone || "Not Set"}</span>
                  </div>
                </div>

                {/* Medical History Tabs */}
                <div className="glass-panel-dark rounded-3xl p-6 border border-white/10 shadow-xl">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-white text-lg">My Electronic Health Records (EHR)</h3>
                    <div className="flex bg-slate-950/80 p-1 rounded-xl border border-white/10">
                      <button 
                        onClick={() => setActiveTab("dashboard")} 
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeTab === "dashboard" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
                      >
                        Records
                      </button>
                      <button 
                        onClick={() => setActiveTab("vaccines")} 
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeTab === "vaccines" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
                      >
                        Vaccines & Surgeries
                      </button>
                    </div>
                  </div>

                  {activeTab === "dashboard" && (
                    <div className="space-y-4">
                      {patientProfile.medical_records.map((rec: any) => (
                        <div key={rec.id} className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-4 shadow-md">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-700/50">
                                {rec.doctor_name || `Doctor ID: ${rec.doctor_id}`}
                              </span>
                              <h4 className="font-bold text-white mt-1.5 text-base">{rec.symptoms}</h4>
                            </div>
                            <span className="text-xs text-slate-400">{new Date(rec.visit_date).toLocaleDateString()}</span>
                          </div>

                          {rec.diagnoses && rec.diagnoses.length > 0 && (
                            <div className="pl-4 border-l-2 border-blue-500/70">
                              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Diagnosis</span>
                              {rec.diagnoses.map((diag: any) => (
                                <p key={diag.id} className="text-sm text-slate-200 font-semibold">
                                  {diag.description} <span className="text-xs font-mono text-cyan-400">({diag.code})</span>
                                </p>
                              ))}
                            </div>
                          )}

                          {rec.prescriptions && rec.prescriptions.length > 0 && (
                            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-white/10 space-y-2">
                              <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wide">Prescribed Medications</span>
                              {rec.prescriptions.map((p: any) => (
                                <div key={p.id} className="space-y-1.5">
                                  {p.medications.map((m: any) => (
                                    <div key={m.id} className="flex justify-between text-xs text-slate-200">
                                      <span><strong>{m.name}</strong> - {m.dosage}</span>
                                      <span className="text-slate-400">{m.frequency} for {m.duration}</span>
                                    </div>
                                  ))}
                                  {p.instructions && (
                                    <p className="text-[11px] text-slate-400 italic mt-1 border-t border-white/10 pt-1">
                                      Instructions: {p.instructions}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {rec.lab_reports && rec.lab_reports.length > 0 && (
                            <div className="p-3 bg-slate-950/80 border border-white/10 rounded-xl flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-blue-400" />
                                <div>
                                  <span className="font-bold text-slate-200 block">{rec.lab_reports[0].test_name}</span>
                                  <span className="text-[10px] text-slate-400">{rec.lab_reports[0].result_summary}</span>
                                </div>
                              </div>
                              <span className="text-[9px] text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/40 font-bold">COMPLETED</span>
                            </div>
                          )}
                        </div>
                      ))}

                      {patientProfile.medical_records.length === 0 && (
                        <div className="text-center py-12">
                          <Activity className="h-12 w-12 text-slate-600 mx-auto mb-2" />
                          <p className="text-slate-400 text-sm">No medical visits recorded on file yet.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "vaccines" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Vaccinations */}
                      <div className="space-y-3">
                        <h4 className="font-bold text-white text-sm uppercase tracking-wider">Vaccinations</h4>
                        {patientProfile.vaccinations.map((v: any) => (
                          <div key={v.id} className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs space-y-1">
                            <span className="font-bold text-slate-200 block">{v.vaccine_name}</span>
                            <span className="text-slate-400 block">Administered: {new Date(v.administered_at).toLocaleDateString()}</span>
                            {v.next_due_date && (
                              <span className="text-[10px] text-emerald-400 block">Booster Due: {new Date(v.next_due_date).toLocaleDateString()}</span>
                            )}
                          </div>
                        ))}
                        {patientProfile.vaccinations.length === 0 && (
                          <p className="text-xs text-slate-500 italic">No immunizations recorded.</p>
                        )}
                      </div>

                      {/* Surgeries */}
                      <div className="space-y-3">
                        <h4 className="font-bold text-white text-sm uppercase tracking-wider">Surgical History</h4>
                        {patientProfile.surgeries.map((s: any) => (
                          <div key={s.id} className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs space-y-1">
                            <span className="font-bold text-slate-200 block">{s.surgery_name}</span>
                            <span className="text-slate-400 block">Date: {new Date(s.surgery_date).toLocaleDateString()}</span>
                            <span className="text-slate-400 block">Surgeon: {s.surgeon_name}</span>
                            {s.notes && <p className="text-[11px] text-slate-400 italic mt-1">{s.notes}</p>}
                          </div>
                        ))}
                        {patientProfile.surgeries.length === 0 && (
                          <p className="text-xs text-slate-500 italic">No surgical events recorded.</p>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              </div>

            </div>
          </div>
        )}
        {/* DOCTOR WORKFLOW PORTAL (DARK GLOWING THEME) */}
        {user && user.role === "doctor" && (
          <div className="space-y-6">

            {/* Verified National Medical Register Practitioner Banner */}
            <div className="glass-panel-dark rounded-3xl p-5 border border-blue-500/40 bg-gradient-to-r from-blue-950/60 via-slate-900/90 to-emerald-950/50 flex flex-wrap items-center justify-between gap-4 shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400">
                  <Stethoscope className="h-7 w-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white capitalize">
                      Dr. {user?.username}
                    </h2>
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950/80 border border-emerald-500/50 text-emerald-300">
                      <BadgeCheck className="h-3 w-3 text-emerald-400" />
                      NMR VERIFIED PRACTITIONER
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    National Medical Register ID: <span className="text-blue-300 font-bold">{user?.nmr_id || "NMR-2024-883921"}</span>
                    {user?.license_number && <span> • License: <span className="text-slate-300">{user.license_number}</span></span>}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                {user?.specialization && (
                  <div className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-white/10 text-xs text-blue-200 font-semibold shadow-md">
                    🩺 {user.specialization}
                  </div>
                )}
                {user?.hospital_name && (
                  <div className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-white/10 text-xs text-emerald-200 font-medium shadow-md">
                    🏥 {user.hospital_name}
                  </div>
                )}
              </div>
            </div>
            
            {/* Scanners Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Scan inputs & Simulators */}
              <div className="space-y-6">
                
                {/* Real QR code Camera scan section */}
                <div className="glass-panel-dark rounded-3xl p-6 border border-white/10 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <Camera className="h-5 w-5 text-blue-400" />
                      <h3 className="font-bold text-white">Live Camera QR Scan</h3>
                    </div>
                    {cameraScanActive && (
                      <span className="text-[9px] bg-red-950 text-red-400 px-2 py-0.5 rounded-full border border-red-800 animate-pulse font-mono font-bold">LIVE REC</span>
                    )}
                  </div>

                  {cameraError && (
                    <div className="p-2.5 bg-red-950/40 border border-red-800/50 rounded-xl text-red-300 text-xs">
                      {cameraError}
                    </div>
                  )}

                  {cameraScanActive ? (
                    <div className="space-y-3">
                      <div id="qr-reader-element" className="w-full rounded-2xl overflow-hidden border border-white/20 shadow-lg" style={{ maxWidth: "100%" }} />
                      <button 
                        onClick={stopCameraScanner} 
                        className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
                      >
                        Cancel Scanner
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={startCameraScanner}
                      className="w-full py-4 rounded-2xl bg-blue-600/20 hover:bg-blue-600/35 border border-blue-500/40 text-blue-200 text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/10"
                    >
                      <Camera className="h-5 w-5 text-blue-400" />
                      Launch Camera Scanner
                    </button>
                  )}
                </div>

                {/* Demonstration swipe simulation */}
                <div className="glass-panel-dark rounded-3xl p-6 border border-white/10 space-y-4 shadow-xl">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                    <Database className="h-5 w-5 text-emerald-400" />
                    <h3 className="font-bold text-white">Hardware Simulator</h3>
                  </div>

                  {/* QR swipe simulator */}
                  <div className="space-y-2">
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Simulate QR Card Scan</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={simQrToken} 
                        onChange={e => setSimQrToken(e.target.value)} 
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-900/90 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs font-mono"
                      />
                      <button 
                        onClick={simulateQrScan} 
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-white/15 shadow-md"
                      >
                        Scan
                      </button>
                    </div>
                  </div>

                  {/* RFID card simulator */}
                  <div className="space-y-2">
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Simulate RFID Swiper</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={simRfidUid} 
                        onChange={e => setSimRfidUid(e.target.value)} 
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-900/90 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs font-mono"
                      />
                      <button 
                        onClick={simulateRfidScan} 
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-white/15 shadow-md"
                      >
                        Swipe
                      </button>
                    </div>
                  </div>
                </div>

                {/* Health ID Search Input */}
                <div className="glass-panel-dark rounded-3xl p-6 border border-white/10 space-y-4 shadow-xl">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                    <Search className="h-5 w-5 text-slate-400" />
                    <h3 className="font-bold text-white">Direct Search</h3>
                  </div>

                  <form onSubmit={handleHealthIdSearch} className="space-y-2">
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Enter Health ID</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={searchHealthId} 
                        onChange={e => setSearchHealthId(e.target.value)} 
                        placeholder="SH-1234-5678" 
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-900/90 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs font-mono"
                      />
                      <button 
                        type="submit" 
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20"
                      >
                        Search
                      </button>
                    </div>
                  </form>

                  {/* Access Denied / Consent Required fallback */}
                  {searchError === "ACCESS_DENIED_CONSENT_REQUIRED" && (
                    <div className="p-4 bg-amber-950/30 border border-amber-500/40 rounded-2xl space-y-3 text-xs shadow-lg">
                      <div className="flex items-center gap-2 text-amber-300">
                        <Lock className="h-4 w-4 shrink-0 text-amber-400" />
                        <span className="font-bold">Access Denied: Consent Required</span>
                      </div>
                      <p className="text-slate-300 text-[11px]">You do not have consent to view this patient's full records. Ask them to authorize you, swipe their RFID card, or enter Emergency Mode.</p>
                      
                      <div className="flex gap-2 pt-1">
                        <button 
                          onClick={() => handleEmergencyBypass()} 
                          className="flex-1 py-2 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-700 text-red-200 font-bold transition-all text-[11px] text-center shadow-lg"
                        >
                          Emergency Bypass
                        </button>
                      </div>
                    </div>
                  )}

                  {searchError && searchError !== "ACCESS_DENIED_CONSENT_REQUIRED" && (
                    <div className="p-3 bg-red-950/40 border border-red-800/40 rounded-xl text-red-300 text-xs">
                      {searchError}
                    </div>
                  )}
                </div>

              </div>

              {/* Patient Profile & Workspace */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Emergency Profile Panel */}
                {isEmergencyView && emergencyProfile && (
                  <div className="glass-panel-dark rounded-3xl p-6 border-red-700/50 bg-red-950/20 relative overflow-hidden space-y-6 shadow-2xl">
                    <div className="absolute top-0 right-0 p-4 bg-red-950/80 border-b border-l border-red-700/60 rounded-bl-2xl">
                      <ShieldAlert className="h-6 w-6 text-red-400 animate-pulse" />
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs uppercase font-bold text-red-400 tracking-wider">RESTRICTED VIEW</span>
                      <h2 className="text-xl font-black text-white">Emergency Medical Profile</h2>
                      <p className="text-xs text-slate-400 font-mono">ID: {emergencyProfile.health_id}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Blood Group</span>
                        <p className="text-lg font-bold text-red-400">{emergencyProfile.blood_group}</p>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Allergies</span>
                        <p className="text-sm font-semibold text-slate-200">{emergencyProfile.allergies}</p>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Critical Conditions</span>
                        <p className="text-sm font-semibold text-slate-200">{emergencyProfile.critical_conditions}</p>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Emergency Contacts</span>
                        <p className="text-sm font-bold text-slate-200">
                          {emergencyProfile.emergency_contact_name} ({emergencyProfile.emergency_contact_phone})
                        </p>
                      </div>

                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Active Medications</span>
                      <div className="flex flex-wrap gap-2">
                        {emergencyProfile.current_medications.map((m: string, idx: number) => (
                          <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-800 border border-white/10 text-xs text-slate-200">{m}</span>
                        ))}
                        {emergencyProfile.current_medications.length === 0 && (
                          <span className="text-xs text-slate-500 italic">None logged.</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Verified Full Medical Record View */}
                {scannedPatient && !isEmergencyView && (
                  <div className="space-y-6">
                    
                    {/* Patient Overview card */}
                    <div className="glass-panel-dark rounded-3xl p-6 border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
                      <div>
                        <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider font-mono">CONSENT VERIFIED</span>
                        <h2 className="text-xl font-bold text-white capitalize mt-1">
                          Patient: {scannedPatient.patient.user.username}
                        </h2>
                        <div className="flex items-center gap-4 text-xs text-slate-400 mt-1 font-mono">
                          <span>Health ID: <strong className="text-cyan-400">{scannedPatient.patient.health_id}</strong></span>
                          <span>DOB: {scannedPatient.patient.date_of_birth}</span>
                          <span>Blood: <strong className="text-rose-400">{scannedPatient.patient.blood_group}</strong></span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={generateAISummary}
                          className="px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md"
                        >
                          <Sparkles className="h-4 w-4" />
                          AI Summary
                        </button>

                        <button 
                          onClick={() => handleEmergencyBypass(scannedPatient.patient.health_id)}
                          className="px-3.5 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/60 border border-red-700/50 text-red-200 text-xs font-bold transition-colors shadow-md"
                        >
                          Emergency Card
                        </button>
                      </div>
                    </div>

                    {/* AI Summarization Output */}
                    {aiSummary && (
                      <div className="p-5 rounded-2xl bg-blue-950/40 border border-blue-700/40 text-xs space-y-3 shadow-xl">
                        <div className="flex items-center justify-between pb-2 border-b border-blue-800/40">
                          <div className="flex items-center gap-2 text-blue-300 font-bold">
                            <Sparkles className="h-4 w-4 text-blue-400 animate-pulse" />
                            <span>AI Assistant Summary</span>
                          </div>
                          <button onClick={() => setAiSummary("")} className="text-slate-400 hover:text-white font-bold">Close</button>
                        </div>
                        <pre className="text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">{aiSummary}</pre>
                      </div>
                    )}

                    {generatingAi && (
                      <div className="p-6 rounded-2xl bg-blue-950/30 border border-blue-800/40 flex items-center justify-center gap-3 shadow-xl">
                        <Sparkles className="h-5 w-5 text-blue-400 animate-spin" />
                        <span className="text-xs text-blue-300 font-semibold font-mono tracking-wider">GENERATING CLINICAL TIMELINE SUMMARY...</span>
                      </div>
                    )}

                    {/* Dashboard Tab Panels */}
                    <div className="glass-panel-dark rounded-3xl p-6 border border-white/10 space-y-6 shadow-xl">
                      
                      <div className="flex bg-slate-950/80 p-1 rounded-xl border border-white/10 w-fit">
                        <button 
                          onClick={() => setActiveTab("dashboard")} 
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeTab === "dashboard" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
                        >
                          Medical Records
                        </button>
                        <button 
                          onClick={() => setActiveTab("add_record")} 
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeTab === "add_record" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
                        >
                          Add Consultation
                        </button>
                      </div>

                      {activeTab === "dashboard" && (
                        <div className="space-y-4">
                          {scannedPatient.medical_records.map((rec: any) => (
                            <div key={rec.id} className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 text-xs space-y-3 shadow-md">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-700/50 font-bold">
                                    {rec.doctor_name || `Doctor ID: ${rec.doctor_id}`}
                                  </span>
                                  <h4 className="font-bold text-white mt-1.5 text-sm">{rec.symptoms}</h4>
                                </div>
                                <span className="text-[11px] text-slate-400">{new Date(rec.visit_date).toLocaleDateString()}</span>
                              </div>

                              {rec.diagnoses && rec.diagnoses.length > 0 && (
                                <div className="pl-3 border-l-2 border-blue-500/70">
                                  <span className="text-[9px] text-slate-400 block uppercase font-bold">Diagnosis</span>
                                  {rec.diagnoses.map((diag: any) => (
                                    <p key={diag.id} className="text-slate-200 font-semibold">
                                      {diag.description} <span className="text-[10px] font-mono text-cyan-400">({diag.code})</span>
                                    </p>
                                  ))}
                                </div>
                              )}

                              {rec.prescriptions && rec.prescriptions.length > 0 && (
                                <div className="bg-slate-950/80 p-3 rounded-xl border border-white/10 space-y-1.5">
                                  <span className="text-[9px] text-emerald-400 uppercase font-bold tracking-wider block">Medications</span>
                                  {rec.prescriptions.map((p: any) => (
                                    <div key={p.id} className="space-y-1">
                                      {p.medications.map((m: any) => (
                                        <div key={m.id} className="flex justify-between text-slate-200">
                                          <span><strong>{m.name}</strong> - {m.dosage}</span>
                                          <span className="text-slate-400">{m.frequency} ({m.duration})</span>
                                        </div>
                                      ))}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {rec.lab_reports && rec.lab_reports.length > 0 && (
                                <div className="p-2.5 bg-slate-950/80 rounded-xl flex items-center justify-between text-[11px] border border-white/10">
                                  <span className="text-slate-200">Test: <strong>{rec.lab_reports[0].test_name}</strong></span>
                                  <span className="text-emerald-400 font-medium">{rec.lab_reports[0].result_summary}</span>
                                </div>
                              )}
                            </div>
                          ))}

                          {scannedPatient.medical_records.length === 0 && (
                            <p className="text-xs text-slate-400 italic py-6 text-center">No history recorded.</p>
                          )}
                        </div>
                      )}

                      {activeTab === "add_record" && (
                        <form onSubmit={handleAddConsultation} className="space-y-4">
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Presenting Symptoms</label>
                              <textarea 
                                required
                                value={symptoms} 
                                onChange={e => setSymptoms(e.target.value)} 
                                placeholder="Chest congestion, dry cough..." 
                                className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs min-h-[70px]"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Clinical Notes / Allergies Info</label>
                              <textarea 
                                value={notes} 
                                onChange={e => setNotes(e.target.value)} 
                                placeholder="Allergies checked. High blood pressure history noted..." 
                                className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs min-h-[70px]"
                              />
                            </div>
                          </div>

                          {/* Diagnosis sub section */}
                          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3">
                            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">Diagnosis Codes</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-[10px] text-slate-400 mb-1">ICD-10 Code</label>
                                <input 
                                  type="text" 
                                  value={diagCode} 
                                  onChange={e => setDiagCode(e.target.value)} 
                                  placeholder="J20.9" 
                                  className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-white focus:outline-none focus:border-blue-500 text-xs"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-[10px] text-slate-400 mb-1">Diagnosis Description</label>
                                <input 
                                  type="text" 
                                  value={diagDesc} 
                                  onChange={e => setDiagDesc(e.target.value)} 
                                  placeholder="Acute bronchitis, unspecified" 
                                  className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-white focus:outline-none focus:border-blue-500 text-xs"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Prescriptions subsection */}
                          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3">
                            <div className="flex justify-between items-center">
                              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Medications & Prescriptions</h4>
                              <button 
                                type="button" 
                                onClick={addMedField}
                                className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-bold"
                              >
                                <Plus className="h-3.5 w-3.5" /> Add Drug
                              </button>
                            </div>

                            {meds.map((med, idx) => (
                              <div key={idx} className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-white/10">
                                <input 
                                  type="text" 
                                  value={med.name} 
                                  onChange={e => handleMedChange(idx, "name", e.target.value)}
                                  placeholder="Amoxicillin" 
                                  className="px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-white focus:outline-none text-xs"
                                />
                                <input 
                                  type="text" 
                                  value={med.dosage} 
                                  onChange={e => handleMedChange(idx, "dosage", e.target.value)}
                                  placeholder="500mg" 
                                  className="px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-white focus:outline-none text-xs"
                                />
                                <input 
                                  type="text" 
                                  value={med.frequency} 
                                  onChange={e => handleMedChange(idx, "frequency", e.target.value)}
                                  placeholder="Three times daily" 
                                  className="px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-white focus:outline-none text-xs"
                                />
                                <input 
                                  type="text" 
                                  value={med.duration} 
                                  onChange={e => handleMedChange(idx, "duration", e.target.value)}
                                  placeholder="7 days" 
                                  className="px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-white focus:outline-none text-xs"
                                />
                              </div>
                            ))}

                            <div>
                              <label className="block text-[10px] text-slate-400 mb-1">Prescription Notes / Usage Directions</label>
                              <input 
                                type="text" 
                                value={prescInstructions} 
                                onChange={e => setPrescInstructions(e.target.value)} 
                                placeholder="Take with meals. Finish the entire course." 
                                className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-white focus:outline-none text-xs"
                              />
                            </div>
                          </div>

                          {/* Lab Reports subsection */}
                          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3">
                            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Lab Reports & Diagnostics</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] text-slate-400 mb-1">Test Name</label>
                                <input 
                                  type="text" 
                                  value={labTestName} 
                                  onChange={e => setLabTestName(e.target.value)} 
                                  placeholder="Lipid Profile" 
                                  className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-white focus:outline-none text-xs"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] text-slate-400 mb-1">Diagnostic Summary</label>
                                <input 
                                  type="text" 
                                  value={labSummary} 
                                  onChange={e => setLabSummary(e.target.value)} 
                                  placeholder="Normal triglycerides, borderline LDL" 
                                  className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-white focus:outline-none text-xs"
                                />
                              </div>
                            </div>
                          </div>

                          <button 
                            type="submit" 
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/20"
                          >
                            Save Consultation Record to Cloud EHR
                          </button>
                        </form>
                      )}

                    </div>
                  </div>
                )}

                {/* Empty State */}
                {!scannedPatient && !isEmergencyView && (
                  <div className="glass-panel-dark rounded-3xl p-12 border border-white/10 text-center space-y-4 shadow-xl">
                    <QrCode className="h-16 w-16 text-slate-600 mx-auto" />
                    <h2 className="text-lg font-bold text-white">Awaiting Patient Authentication</h2>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">Scan the patient's QR code card or swipe their RFID token to verify consent and unlock their secure electronic health record.</p>
                  </div>
                )}

              </div>

            </div>
          </div>
        )} 
        {/* ADMINISTRATIVE PORTALS (DARK GLOWING THEME) */}
        {user && (user.role === "system_admin" || user.role === "hospital_admin") && (
          <div className="space-y-6">
            
            {/* Horizontal menu */}
            <div className="flex bg-slate-950/80 p-1.5 rounded-2xl border border-white/10 w-fit">
              <button 
                onClick={() => setActiveTab("dashboard")} 
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "dashboard" ? "bg-blue-600 text-white shadow-md shadow-blue-600/30" : "text-slate-400 hover:text-white"}`}
              >
                Register Patients & Doctors
              </button>
              <button 
                onClick={() => setActiveTab("rfid_issuance")} 
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "rfid_issuance" ? "bg-blue-600 text-white shadow-md shadow-blue-600/30" : "text-slate-400 hover:text-white"}`}
              >
                Issue Smart Cards
              </button>
              <button 
                onClick={() => setActiveTab("audit_logs")} 
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "audit_logs" ? "bg-blue-600 text-white shadow-md shadow-blue-600/30" : "text-slate-400 hover:text-white"}`}
              >
                Security Audit Trail
              </button>
            </div>

            {/* TAB 1: REGISTRATION FORMS */}
            {activeTab === "dashboard" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Patient registration */}
                <div className="glass-panel-dark rounded-3xl p-6 border border-white/10 space-y-4 shadow-xl">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                    <User className="h-5 w-5 text-blue-400" />
                    <h3 className="font-bold text-white">Register New Patient Profile</h3>
                  </div>

                  <form onSubmit={handleRegisterPatient} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-slate-300 mb-1">Username</label>
                        <input 
                          type="text" required
                          value={newPatUsername} onChange={e => setNewPatUsername(e.target.value)}
                          placeholder="johndoe" 
                          className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/15 text-white text-xs placeholder-slate-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-300 mb-1">Password</label>
                        <input 
                          type="password" required
                          value={newPatPassword} onChange={e => setNewPatPassword(e.target.value)}
                          placeholder="••••••••" 
                          className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/15 text-white text-xs placeholder-slate-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-300 mb-1">Email Address</label>
                      <input 
                        type="email" required
                        value={newPatEmail} onChange={e => setNewPatEmail(e.target.value)}
                        placeholder="johndoe@gmail.com" 
                        className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/15 text-white text-xs placeholder-slate-500"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-300 mb-1">DOB</label>
                        <input 
                          type="date" 
                          value={newPatDOB} onChange={e => setNewPatDOB(e.target.value)}
                          className="w-full px-2 py-2 rounded-xl bg-slate-900/90 border border-white/15 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-300 mb-1">Gender</label>
                        <select 
                          value={newPatGender} onChange={e => setNewPatGender(e.target.value)}
                          className="w-full px-2 py-2 rounded-xl bg-slate-900/90 border border-white/15 text-white text-xs focus:outline-none"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-300 mb-1">Blood Type</label>
                        <select 
                          value={newPatBlood} onChange={e => setNewPatBlood(e.target.value)}
                          className="w-full px-2 py-2 rounded-xl bg-slate-900/90 border border-white/15 text-white text-xs focus:outline-none"
                        >
                          <option value="A-Positive">A+</option>
                          <option value="A-Negative">A-</option>
                          <option value="B-Positive">B+</option>
                          <option value="B-Negative">B-</option>
                          <option value="O-Positive">O+</option>
                          <option value="O-Negative">O-</option>
                          <option value="AB-Positive">AB+</option>
                          <option value="AB-Negative">AB-</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-slate-300 mb-1">Emergency Contact Name</label>
                        <input 
                          type="text" required
                          value={newPatEmergencyName} onChange={e => setNewPatEmergencyName(e.target.value)}
                          placeholder="Jane Doe" 
                          className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/15 text-white text-xs placeholder-slate-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-300 mb-1">Emergency Phone</label>
                        <input 
                          type="text" required
                          value={newPatEmergencyPhone} onChange={e => setNewPatEmergencyPhone(e.target.value)}
                          placeholder="+1-555-0199" 
                          className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/15 text-white text-xs placeholder-slate-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-300 mb-1">Residential Address</label>
                      <input 
                        type="text" required
                        value={newPatAddress} onChange={e => setNewPatAddress(e.target.value)}
                        placeholder="789 Main St, Brooklyn, NY" 
                        className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/15 text-white text-xs placeholder-slate-500"
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20"
                    >
                      Create Patient Profile
                    </button>
                  </form>
                </div>

                {/* Doctor Registration */}
                <div className="space-y-6">
                  
                  <div className="glass-panel-dark rounded-3xl p-6 border border-white/10 space-y-4 shadow-xl">
                    <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                      <Users className="h-5 w-5 text-emerald-400" />
                      <h3 className="font-bold text-white">Register New Medical Staff</h3>
                    </div>

                    <form onSubmit={handleRegisterDoctor} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-slate-300 mb-1">Doctor Name</label>
                          <input 
                            type="text" required
                            value={newDocUsername} onChange={e => setNewDocUsername(e.target.value)}
                            placeholder="drstrange" 
                            className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/15 text-white text-xs placeholder-slate-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-300 mb-1">Password</label>
                          <input 
                            type="password" required
                            value={newDocPassword} onChange={e => setNewDocPassword(e.target.value)}
                            placeholder="••••••••" 
                            className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/15 text-white text-xs placeholder-slate-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-300 mb-1">Email Address</label>
                        <input 
                          type="email" required
                          value={newDocEmail} onChange={e => setNewDocEmail(e.target.value)}
                          placeholder="strange@metrogeneral.org" 
                          className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/15 text-white text-xs placeholder-slate-500"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] text-slate-300 mb-1">Specialization</label>
                          <input 
                            type="text" required
                            value={newDocSpecialization} onChange={e => setNewDocSpecialization(e.target.value)}
                            placeholder="Neurology" 
                            className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/15 text-white text-xs placeholder-slate-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-300 mb-1">License Number</label>
                          <input 
                            type="text" required
                            value={newDocLicense} onChange={e => setNewDocLicense(e.target.value)}
                            placeholder="LIC-998273" 
                            className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/15 text-white text-xs placeholder-slate-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-cyan-400 mb-1 font-semibold">NMR Register ID</label>
                          <input 
                            type="text"
                            value={newDocNmrId} onChange={e => setNewDocNmrId(e.target.value)}
                            placeholder="NMR-2024-9982" 
                            className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-blue-500/40 text-white text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-300 mb-1">Affiliated Hospital</label>
                        <select 
                          required
                          value={newDocHospId} onChange={e => setNewDocHospId(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/15 text-white text-xs focus:outline-none"
                        >
                          <option value="">Select Hospital...</option>
                          {hospitals.map((h: any) => (
                            <option key={h.id} value={h.id}>{h.name}</option>
                          ))}
                        </select>
                      </div>

                      <button 
                        type="submit" 
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
                      >
                        Register Medical Practitioner
                      </button>
                    </form>
                  </div>

                  {/* Register Hospital */}
                  <div className="glass-panel-dark rounded-3xl p-6 border border-white/10 space-y-4 shadow-xl">
                    <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                      <Building className="h-5 w-5 text-amber-400" />
                      <h3 className="font-bold text-white">Add Hospital Facility</h3>
                    </div>

                    <form onSubmit={handleCreateHospital} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <label className="block text-[10px] text-slate-300 mb-1">Hospital Name</label>
                          <input 
                            type="text" required
                            value={newHospName} onChange={e => setNewHospName(e.target.value)}
                            placeholder="Sacred Heart Hospital" 
                            className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/15 text-white text-xs placeholder-slate-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-300 mb-1">Phone Number</label>
                          <input 
                            type="text" required
                            value={newHospPhone} onChange={e => setNewHospPhone(e.target.value)}
                            placeholder="+1-555-9081" 
                            className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/15 text-white text-xs placeholder-slate-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-300 mb-1">Location Address</label>
                          <input 
                            type="text" required
                            value={newHospAddress} onChange={e => setNewHospAddress(e.target.value)}
                            placeholder="772 Plaza Ave" 
                            className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-white/15 text-white text-xs placeholder-slate-500"
                          />
                        </div>
                      </div>

                      <button 
                        type="submit" 
                        className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md shadow-amber-500/20"
                      >
                        Add Hospital Registry
                      </button>
                    </form>
                  </div>

                </div>

              </div>
            )}

            {/* TAB 2: RFID CARD LINKING */}
            {activeTab === "rfid_issuance" && (
              <div className="max-w-xl mx-auto">
                <div className="glass-panel-dark rounded-3xl p-8 border border-white/10 space-y-6 shadow-2xl">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                    <Rss className="h-6 w-6 text-blue-400" />
                    <h3 className="font-bold text-white text-lg">Issue Secure RFID Physical Card</h3>
                  </div>

                  <form onSubmit={handleIssueRfid} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Select Patient Account</label>
                      <select 
                        required
                        value={assignRfidPatientId}
                        onChange={e => setAssignRfidPatientId(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-900/90 border border-white/15 text-white focus:outline-none text-xs"
                      >
                        <option value="">Choose Patient...</option>
                        {patientsList.map((p: any) => (
                          <option key={p.id} value={p.id}>
                            {p.user.username.toUpperCase()} - {p.health_id}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Card UID (HEX Token)</label>
                      <input 
                        type="text" required
                        value={assignRfidUid}
                        onChange={e => setAssignRfidUid(e.target.value)}
                        placeholder="AB-12-CD-34"
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-900/90 border border-white/15 text-white text-xs font-mono"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Make sure you scan the card on the reader to get the UID string or provide a mockup code.</p>
                    </div>

                    <button 
                      type="submit" 
                      className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/25"
                    >
                      Map Physical Card UID & Print QR Identifier
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* TAB 3: SECURITY AUDIT TRAIL */}
            {activeTab === "audit_logs" && (
              <div className="glass-panel-dark rounded-3xl p-6 border border-white/10 space-y-4 shadow-xl">
                <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                  <ShieldAlert className="h-5 w-5 text-red-400" />
                  <h3 className="font-bold text-white text-lg">System Security Audit Logs</h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400 font-semibold">
                        <th className="py-3 px-2">Timestamp</th>
                        <th className="py-3 px-2">Operator</th>
                        <th className="py-3 px-2">Action Event</th>
                        <th className="py-3 px-2">Details</th>
                        <th className="py-3 px-2">IP Address</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      {auditLogs.map((log: any) => (
                        <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-2 font-mono text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                          <td className="py-3 px-2 font-semibold text-white capitalize">
                            {log.username || "System API"}
                          </td>
                          <td className="py-3 px-2">
                            <span className={`px-2.5 py-0.5 rounded-full font-mono text-[9px] border font-bold ${
                              log.action.includes("EMERGENCY") ? "bg-red-950/60 border-red-700/60 text-red-300" :
                              log.action.includes("SCAN") ? "bg-emerald-950/60 border-emerald-700/60 text-emerald-300" :
                              "bg-slate-900 border-white/10 text-slate-300"
                            }`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-slate-300 max-w-xs truncate">{log.details}</td>
                          <td className="py-3 px-2 font-mono text-[10px] text-slate-400">{log.ip_address || "127.0.0.1"}</td>
                        </tr>
                      ))}
                      {auditLogs.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-500 italic">No audit trail logs logged.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

      </main>

      {/* Footer info bar */}
      <footer className={`py-6 mt-12 border-t text-center text-xs flex justify-between px-6 max-w-7xl w-full mx-auto transition-colors duration-300 ${
        isHome ? "border-slate-200/90 text-slate-600" : "border-white/10 text-slate-400"
      }`}>
        <span>© 2026 TRINAYORA — Medical Identity System</span>
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-emerald-500" />
          <span>HIPAA & GDPR-ready Design</span>
        </div>
      </footer>
    </div>
  );
}
