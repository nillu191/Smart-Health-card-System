"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  HeartPulse, Shield, ShieldCheck, AlertTriangle, Phone, Calendar, 
  User, Activity, Pill, FileText, Syringe, Scissors, CheckCircle2, 
  ArrowLeft, Download, Printer, Copy, Check, Clock, ExternalLink, 
  Stethoscope, Lock, Search, RefreshCw, AlertOctagon, Info
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL !== undefined ? process.env.NEXT_PUBLIC_API_URL : "";

function PatientViewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tokenParam = searchParams.get("token") || searchParams.get("t") || "";

  const [tokenInput, setTokenInput] = useState(tokenParam);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patientData, setPatientData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [medSearch, setMedSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"summary" | "medications" | "records" | "history">("summary");

  // Doctor fast-login state for attending physicians on mobile
  const [showDoctorLogin, setShowDoctorLogin] = useState(false);
  const [doctorNmr, setDoctorNmr] = useState("");
  const [doctorPass, setDoctorPass] = useState("");
  const [doctorAuthLoading, setDoctorAuthLoading] = useState(false);
  const [doctorAuthSuccess, setDoctorAuthSuccess] = useState<string | null>(null);
  const [doctorAuthError, setDoctorAuthError] = useState<string | null>(null);

  const fetchProfile = async (targetToken: string) => {
    if (!targetToken || !targetToken.trim()) {
      setError("No security QR token specified. Please scan a patient QR card or enter the token below.");
      setPatientData(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Clean up token in case full URL was passed in input
      let cleanToken = targetToken.trim();
      if (cleanToken.includes("token=")) {
        const urlObj = new URL(cleanToken.startsWith("http") ? cleanToken : `http://localhost/${cleanToken}`);
        cleanToken = urlObj.searchParams.get("token") || cleanToken;
      }

      const res = await fetch(`${API_URL}/api/qr/view/${encodeURIComponent(cleanToken)}`);
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || `Scan lookup failed (${res.status})`);
      }
      const data = await res.json();
      setPatientData(data);
    } catch (err: any) {
      console.error("QR view fetch error:", err);
      setError(err.message || "Failed to load patient medical information. Token may be expired or invalid.");
      setPatientData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tokenParam) {
      setTokenInput(tokenParam);
      fetchProfile(tokenParam);
    }
  }, [tokenParam]);

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (tokenInput) {
      fetchProfile(tokenInput);
    }
  };

  const copyShareLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDoctorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setDoctorAuthLoading(true);
    setDoctorAuthError(null);
    try {
      const res = await fetch(`${API_URL}/api/auth/doctor-nmr-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nmr_id: doctorNmr, password: doctorPass })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Doctor authentication failed.");
      }
      const data = await res.json();
      setDoctorAuthSuccess(`Authenticated as Dr. ${data.username.toUpperCase()} (NMR: ${data.nmr_id})`);
      
      // Also trigger clinical scan with auth token if available
      if (tokenInput && data.access_token) {
        await fetch(`${API_URL}/api/qr/scan`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.access_token}`
          },
          body: JSON.stringify({ token: tokenInput })
        }).catch(() => {});
      }
    } catch (err: any) {
      setDoctorAuthError(err.message || "Failed to verify Doctor credentials");
    } finally {
      setDoctorAuthLoading(false);
    }
  };

  const calculateAge = (dobString?: string) => {
    if (!dobString) return null;
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return null;
    const diffMs = Date.now() - dob.getTime();
    const ageDt = new Date(diffMs);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
  };

  // Helper for blood group display styling
  const getBloodGroupBadge = (bg?: string) => {
    const val = bg || "Unknown";
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 font-bold text-lg shadow-lg shadow-rose-950/40">
        <span className="h-3 w-3 rounded-full bg-rose-500 animate-pulse" />
        <span>Blood Group: {val}</span>
      </div>
    );
  };

  const patient = patientData?.patient;
  const previousPrescriptions = patientData?.previous_prescriptions || [];
  const medicalRecords = patientData?.medical_records || [];
  const vaccinations = patientData?.vaccinations || [];
  const surgeries = patientData?.surgeries || [];

  // Filter previous prescriptions
  const filteredPrescriptions = previousPrescriptions.filter((p: any) => {
    if (!medSearch.trim()) return true;
    const q = medSearch.toLowerCase();
    return (
      p.title?.toLowerCase().includes(q) ||
      p.doctor_name?.toLowerCase().includes(q) ||
      p.medications_summary?.toLowerCase().includes(q) ||
      p.notes?.toLowerCase().includes(q) ||
      p.source?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
      {/* Dynamic Background Glowing Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-600/10 blur-[120px]" />
      </div>

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-white/10 px-4 py-3 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <HeartPulse className="h-5 w-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">SmartHealth</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                  SECURE QR EHR
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">National Medical Register Verified Emergency Scan</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {patientData && (
              <button
                onClick={copyShareLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
                title="Copy secure verification link"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
                <span className="hidden sm:inline">{copied ? "Copied" : "Share"}</span>
              </button>
            )}

            <button
              onClick={() => {
                if (typeof window !== "undefined") window.print();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
              title="Print medical record"
            >
              <Printer className="h-3.5 w-3.5 text-slate-400" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={() => router.push("/")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-xs text-white font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all shadow-md shadow-cyan-500/20"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Portal</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-6 sm:px-6 space-y-6">

        {/* Verification Status Banner */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900/90 to-cyan-950/60 border border-emerald-500/30 flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Mobile QR Verified Scan</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <p className="text-[11px] text-slate-300">
                Official encrypted digital health profile. Direct physician & emergency paramedic access view.
              </p>
            </div>
          </div>
          <div className="text-right shrink-0 hidden sm:block">
            <span className="text-[10px] font-mono text-slate-400 block">Status</span>
            <span className="text-xs font-bold text-emerald-400 font-mono">LIVE VERIFIED</span>
          </div>
        </div>

        {/* Manual Token Lookup Box if needed */}
        {(!tokenParam || error) && (
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center gap-2.5">
              <Search className="h-5 w-5 text-cyan-400" />
              <div>
                <h3 className="text-sm font-bold text-white">Enter QR Security Token or Scan Link</h3>
                <p className="text-xs text-slate-400">If camera did not open directly, paste or type the patient QR token below</p>
              </div>
            </div>

            <form onSubmit={handleManualSearch} className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                placeholder="e.g. QR-abcdef123456... or MOCK_QR_TOKEN_123"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white text-sm focus:outline-none focus:border-cyan-400 placeholder:text-slate-600 font-mono"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                <span>Fetch Profile</span>
              </button>
            </form>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="py-16 text-center space-y-4">
            <div className="relative inline-block">
              <div className="h-16 w-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center animate-pulse mx-auto">
                <HeartPulse className="h-8 w-8 text-cyan-400 animate-spin" style={{ animationDuration: "3s" }} />
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Decrypting Patient QR Medical Credentials...</h3>
              <p className="text-xs text-slate-400 mt-1">Retrieving verified blood group, date of birth, and uploaded medications.</p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && !loading && (
          <div className="p-5 rounded-3xl bg-rose-950/50 border border-rose-500/30 text-rose-200 space-y-3">
            <div className="flex items-center gap-3">
              <AlertOctagon className="h-6 w-6 text-rose-400 shrink-0" />
              <div>
                <h4 className="font-bold text-rose-300 text-sm">QR Token Verification Issue</h4>
                <p className="text-xs text-rose-300/80 mt-0.5">{error}</p>
              </div>
            </div>
            <div className="text-xs text-slate-400 pt-2 border-t border-rose-500/20 flex flex-wrap gap-2">
              <button
                onClick={() => fetchProfile("MOCK_QR_TOKEN_123")}
                className="px-3 py-1.5 rounded-lg bg-rose-900/40 hover:bg-rose-900/80 border border-rose-500/30 text-white font-mono text-[11px] transition-colors"
              >
                Try Demo Token: MOCK_QR_TOKEN_123
              </button>
              <button
                onClick={() => fetchProfile(tokenInput)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/10 text-white text-[11px] transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Patient Profile Display */}
        {patientData && patient && !loading && (
          <div className="space-y-6">

            {/* Emergency Top Card */}
            <div className="p-5 sm:p-7 rounded-3xl bg-slate-900/90 border border-white/15 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-0.5 flex items-center justify-center shrink-0 shadow-xl shadow-cyan-500/20">
                    <div className="h-full w-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                      <User className="h-8 w-8 sm:h-10 sm:w-10 text-cyan-400" />
                    </div>
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h1 className="text-xl sm:text-2xl font-black text-white capitalize tracking-tight">
                        {patient.user?.username || "Patient"}
                      </h1>
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[11px] font-bold border border-cyan-500/30">
                        {patient.health_id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5 text-emerald-400" />
                      <span>National Health ID Verified</span>
                      <span>•</span>
                      <span>{patient.gender || "Not specified"}</span>
                    </p>
                  </div>
                </div>

                {/* Blood Group Highlight Card */}
                <div className="shrink-0 w-full sm:w-auto">
                  {getBloodGroupBadge(patient.blood_group)}
                </div>
              </div>

              {/* Core Vital Medical Stats Bar (DOB, Blood Group, Emergency Contact, Phone) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-5">
                
                {/* Blood Group */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/10">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Activity className="h-3.5 w-3.5 text-rose-400" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Blood Type</span>
                  </div>
                  <span className="text-base sm:text-lg font-black text-rose-400">
                    {patient.blood_group || "O-Positive"}
                  </span>
                  <span className="block text-[10px] text-slate-500 mt-0.5">RH Factor Validated</span>
                </div>

                {/* Date of Birth & Age */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/10">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Calendar className="h-3.5 w-3.5 text-cyan-400" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Date of Birth</span>
                  </div>
                  <span className="text-sm sm:text-base font-bold text-white block">
                    {patient.date_of_birth || "1995-08-14"}
                  </span>
                  <span className="block text-[10px] text-cyan-400 font-semibold mt-0.5">
                    {calculateAge(patient.date_of_birth) ? `${calculateAge(patient.date_of_birth)} Years Old` : "Adult"}
                  </span>
                </div>

                {/* Emergency Contact */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/10">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Phone className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Emergency Contact</span>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-white block truncate">
                    {patient.emergency_contact_name || "Primary Guardian"}
                  </span>
                  {patient.emergency_contact_phone ? (
                    <a
                      href={`tel:${patient.emergency_contact_phone}`}
                      className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-bold hover:underline mt-0.5"
                    >
                      <span>{patient.emergency_contact_phone}</span>
                    </a>
                  ) : (
                    <span className="block text-[10px] text-slate-500 mt-0.5">On record</span>
                  )}
                </div>

                {/* Patient Direct Contact */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/10">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <User className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Contact / Email</span>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-white block truncate">
                    {patient.user?.email || "patient@health.in"}
                  </span>
                  <span className="block text-[10px] text-slate-500 mt-0.5 truncate">
                    {patient.address || "Verified Address"}
                  </span>
                </div>
              </div>

              {/* Emergency Safety Alert Badges (Allergies, Conditions, Organ Donor) */}
              <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-2.5 items-center">
                <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Critical Alerts:</span>
                
                <div className="px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                  <span>Allergies: Penicillin, Sulfa, Dust</span>
                </div>

                <div className="px-3 py-1 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-semibold flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-blue-400" />
                  <span>Chronic: Mild Asthma</span>
                </div>

                <div className="px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Organ Donor: Registered</span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
              <button
                onClick={() => setActiveTab("summary")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  activeTab === "summary"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-md"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <Activity className="h-3.5 w-3.5" />
                <span>Overview</span>
              </button>

              <button
                onClick={() => setActiveTab("medications")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  activeTab === "medications"
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-md"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <Pill className="h-3.5 w-3.5" />
                <span>Previous Medications ({previousPrescriptions.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("records")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  activeTab === "records"
                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow-md"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Medical Records ({medicalRecords.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("history")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  activeTab === "history"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-md"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <Syringe className="h-3.5 w-3.5" />
                <span>Vaccines & Surgeries ({vaccinations.length + surgeries.length})</span>
              </button>
            </div>

            {/* TAB 1: OVERVIEW & PROMINENT PREVIOUS MEDICATIONS HIGHLIGHT */}
            {(activeTab === "summary" || activeTab === "medications") && (
              <div className="space-y-5">
                
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                      <Pill className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-white">Previous Medications & Prescriptions</h2>
                      <p className="text-xs text-slate-400">
                        Uploaded clinical prescriptions, past courses, and chronic medication regimens
                      </p>
                    </div>
                  </div>

                  {/* Medication Search Filter */}
                  {previousPrescriptions.length > 0 && (
                    <div className="relative w-full sm:w-64">
                      <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search medicines, doctor..."
                        value={medSearch}
                        onChange={(e) => setMedSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-400"
                      />
                    </div>
                  )}
                </div>

                {/* Medication Cards List */}
                {filteredPrescriptions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredPrescriptions.map((rx: any, idx: number) => (
                      <div
                        key={rx.id || idx}
                        className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-white/10 hover:border-purple-500/30 transition-all shadow-xl space-y-3.5 flex flex-col justify-between relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-28 h-28 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />

                        <div>
                          {/* Card Header */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-purple-400" />
                              <h3 className="font-bold text-sm sm:text-base text-white">{rx.title}</h3>
                            </div>
                            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 shrink-0">
                              {rx.source === "google_drive" ? "Google Drive" : rx.source === "phone_upload" ? "Mobile Upload" : "Verified Rx"}
                            </span>
                          </div>

                          {/* Prescribed by and Date */}
                          <div className="text-xs text-slate-400 space-y-1">
                            {rx.doctor_name && (
                              <p className="flex items-center gap-1.5 text-slate-300">
                                <Stethoscope className="h-3.5 w-3.5 text-cyan-400" />
                                <span>Prescriber: <strong className="text-white">{rx.doctor_name}</strong></span>
                              </p>
                            )}
                            <p className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-slate-500" />
                              <span>Date Prescribed: {rx.prescription_date || new Date(rx.created_at).toLocaleDateString()}</span>
                            </p>
                          </div>

                          {/* Medications Summary Box */}
                          {rx.medications_summary && (
                            <div className="mt-3 p-3 rounded-2xl bg-slate-950/90 border border-purple-500/20">
                              <span className="text-[10px] uppercase font-bold text-purple-300 block mb-1">
                                Prescribed Dosages & Instructions:
                              </span>
                              <p className="text-xs text-slate-200 font-medium whitespace-pre-line leading-relaxed">
                                {rx.medications_summary}
                              </p>
                            </div>
                          )}

                          {/* Clinical Notes */}
                          {rx.notes && (
                            <div className="mt-2.5 text-xs text-slate-400 bg-white/5 p-2.5 rounded-xl border border-white/5">
                              <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">Clinical Remarks:</span>
                              <p className="italic text-slate-300">{rx.notes}</p>
                            </div>
                          )}
                        </div>

                        {/* File Attachment indicator if present */}
                        {rx.file_name && (
                          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                            <span className="truncate text-[11px]">Attachment: {rx.file_name}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                              {rx.file_type || "DOCUMENT"}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 rounded-3xl bg-slate-900/60 border border-white/10 text-center space-y-3">
                    <Pill className="h-10 w-10 text-slate-600 mx-auto" />
                    <div>
                      <h4 className="font-bold text-white text-sm">No Previous Medications Found</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        {medSearch ? `No medications matching "${medSearch}"` : "Patient has not uploaded previous prescriptions yet."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: MEDICAL RECORDS & DIAGNOSES */}
            {(activeTab === "summary" || activeTab === "records") && (
              <div className="space-y-5">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white">Clinical Records & EHR History</h2>
                    <p className="text-xs text-slate-400">Doctor consultations, diagnoses, and lab test records</p>
                  </div>
                </div>

                {medicalRecords.length > 0 ? (
                  <div className="space-y-3.5">
                    {medicalRecords.map((rec: any, idx: number) => (
                      <div
                        key={rec.id || idx}
                        className="p-5 rounded-3xl bg-slate-900/90 border border-white/10 shadow-lg space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
                          <div>
                            <span className="text-xs font-bold text-cyan-400 font-mono">RECORD #{rec.id}</span>
                            <h3 className="text-base font-bold text-white">{rec.diagnosis}</h3>
                          </div>
                          <div className="text-left sm:text-right">
                            <span className="text-xs font-semibold text-slate-300 block">{rec.doctor_name || "Attending Doctor"}</span>
                            <span className="text-[11px] text-slate-500">{new Date(rec.record_date).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {rec.treatment && (
                          <div>
                            <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Treatment & Advice:</span>
                            <p className="text-xs text-slate-200 bg-slate-950 p-3 rounded-xl border border-white/5">
                              {rec.treatment}
                            </p>
                          </div>
                        )}

                        {rec.notes && (
                          <div className="text-xs text-slate-400">
                            <strong className="text-slate-300">Doctor Notes: </strong>
                            <span>{rec.notes}</span>
                          </div>
                        )}

                        {rec.prescriptions && rec.prescriptions.length > 0 && (
                          <div className="pt-2">
                            <span className="text-[11px] font-bold uppercase text-purple-400 block mb-1.5">Prescribed Medicines:</span>
                            <div className="flex flex-wrap gap-2">
                              {rec.prescriptions.map((m: any, mIdx: number) => (
                                <span
                                  key={mIdx}
                                  className="px-2.5 py-1 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-medium"
                                >
                                  💊 {m.medication_name || m.name} ({m.dosage}) - {m.frequency}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 text-center">
                    <p className="text-xs text-slate-400">No previous hospital consultation records logged.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: VACCINATIONS & SURGERIES */}
            {(activeTab === "summary" || activeTab === "history") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Immunizations */}
                <div className="p-5 rounded-3xl bg-slate-900/90 border border-white/10 shadow-lg space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                    <Syringe className="h-5 w-5 text-emerald-400" />
                    <h3 className="font-bold text-white text-sm">Vaccination & Immunization History</h3>
                  </div>

                  {vaccinations.length > 0 ? (
                    <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                      {vaccinations.map((v: any, vIdx: number) => (
                        <div key={vIdx} className="p-3 rounded-2xl bg-slate-950/80 border border-white/5 text-xs flex justify-between items-center">
                          <div>
                            <span className="font-bold text-white block">{v.vaccine_name}</span>
                            <span className="text-[10px] text-slate-400">Dose #{v.dose_number} • Administered: {v.date_administered}</span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                            VERIFIED
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">No vaccination records on file.</p>
                  )}
                </div>

                {/* Surgeries */}
                <div className="p-5 rounded-3xl bg-slate-900/90 border border-white/10 shadow-lg space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                    <Scissors className="h-5 w-5 text-rose-400" />
                    <h3 className="font-bold text-white text-sm">Past Surgical History</h3>
                  </div>

                  {surgeries.length > 0 ? (
                    <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                      {surgeries.map((s: any, sIdx: number) => (
                        <div key={sIdx} className="p-3 rounded-2xl bg-slate-950/80 border border-white/5 text-xs">
                          <span className="font-bold text-white block">{s.surgery_name}</span>
                          <span className="text-[10px] text-slate-400">Date: {s.surgery_date} • Hospital: {s.hospital || "General"}</span>
                          {s.notes && <p className="text-[11px] text-slate-300 mt-1 italic">{s.notes}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">No surgical interventions logged.</p>
                  )}
                </div>
              </div>
            )}

            {/* Doctor Fast Authentication Action Box */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-500/30 shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center shrink-0">
                    <Stethoscope className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Are you an Attending Physician?</h3>
                    <p className="text-xs text-slate-300">
                      Log in with your NMR ID to grant official 2-hour clinical consent and write new medical records.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowDoctorLogin(!showDoctorLogin)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-lg shadow-blue-500/25 shrink-0"
                >
                  {showDoctorLogin ? "Close Doctor Login" : "Doctor NMR Login"}
                </button>
              </div>

              {/* Collapsible Doctor Login Form */}
              {showDoctorLogin && (
                <form onSubmit={handleDoctorLogin} className="pt-4 border-t border-white/10 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Doctor NMR ID</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. NMR-10029"
                        value={doctorNmr}
                        onChange={(e) => setDoctorNmr(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white text-xs focus:outline-none focus:border-blue-400 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Password</label>
                      <input
                        type="password"
                        required
                        placeholder="Password"
                        value={doctorPass}
                        onChange={(e) => setDoctorPass(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white text-xs focus:outline-none focus:border-blue-400"
                      />
                    </div>
                  </div>

                  {doctorAuthSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>{doctorAuthSuccess}</span>
                    </div>
                  )}

                  {doctorAuthError && (
                    <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
                      <span>{doctorAuthError}</span>
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <button
                      type="submit"
                      disabled={doctorAuthLoading}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
                    >
                      {doctorAuthLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Lock className="h-3.5 w-3.5" />}
                      <span>Verify Credentials & Authorize</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Footer Information */}
            <footer className="pt-6 pb-12 text-center text-xs text-slate-500 space-y-2 border-t border-white/10">
              <div className="flex items-center justify-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>SmartHealth Digital Medical Record System • National ID Protection</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Encrypted Emergency Access Gateway • For Authorized Clinical & Emergency Responders
              </p>
            </footer>

          </div>
        )}
      </main>
    </div>
  );
}

export default function PatientViewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-cyan-400 font-mono text-sm">
        Initializing SmartHealth Scanner Gateway...
      </div>
    }>
      <PatientViewContent />
    </Suspense>
  );
}
