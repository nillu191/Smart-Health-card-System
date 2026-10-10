"use client";

import React, { useEffect, useState, use } from "react";
import { 
  Pill, 
  FileText, 
  Clock, 
  User, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Calendar, 
  Stethoscope, 
  Eye, 
  Download, 
  X, 
  RefreshCw, 
  CheckCircle2, 
  Lock,
  ChevronRight,
  Sparkles,
  ExternalLink
} from "lucide-react";

interface MedicationItem {
  id?: number;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string | null;
}

interface PreviousPrescription {
  id: number;
  patient_id: number;
  title: string;
  doctor_name?: string | null;
  prescription_date?: string | null;
  source?: string;
  file_name?: string | null;
  file_type?: string | null;
  file_data?: string | null;
  notes?: string | null;
  medications_summary?: string | null;
  created_at: string;
}

interface ClinicalPrescription {
  id: number;
  doctor_name?: string | null;
  issued_at?: string | null;
  instructions?: string | null;
  medications: MedicationItem[];
}

interface MedicalHistoryData {
  patient_name: string;
  health_id: string;
  token_status: string;
  token_expires_at: string;
  previous_prescriptions: PreviousPrescription[];
  clinical_prescriptions: ClinicalPrescription[];
}

type PageStatus = "loading" | "valid" | "invalid" | "expired" | "revoked" | "patient_not_found" | "error";

export default function MedicalHistoryPage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = use(params);
  const token = resolvedParams?.token || "";

  const [status, setStatus] = useState<PageStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [historyData, setHistoryData] = useState<MedicalHistoryData | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<PreviousPrescription | null>(null);
  const [activeTab, setActiveTab] = useState<"prescriptions" | "medications">("prescriptions");

  const fetchMedicalHistory = async (tokenStr: string) => {
    if (!tokenStr) {
      setStatus("invalid");
      setErrorMessage("No security token provided in QR scan URL.");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL !== undefined ? process.env.NEXT_PUBLIC_API_URL : "";
      const endpoint = `${apiUrl}/api/medical-history/${encodeURIComponent(tokenStr.trim())}`;
      
      const res = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Bypass-Tunnel-Reminder": "true"
        },
        cache: "no-store"
      });

      if (res.status === 404) {
        const errJson = await res.json().catch(() => ({}));
        if (errJson.detail && errJson.detail.includes("Patient record")) {
          setStatus("patient_not_found");
          setErrorMessage(errJson.detail);
        } else {
          setStatus("invalid");
          setErrorMessage(errJson.detail || "Invalid or unrecognized QR token.");
        }
        return;
      }

      if (res.status === 410) {
        const errJson = await res.json().catch(() => ({}));
        if (errJson.detail && errJson.detail.toLowerCase().includes("revoked")) {
          setStatus("revoked");
          setErrorMessage(errJson.detail);
        } else {
          setStatus("expired");
          setErrorMessage(errJson.detail || "This QR code has expired.");
        }
        return;
      }

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || `Server error (${res.status})`);
      }

      const data: MedicalHistoryData = await res.json();
      setHistoryData(data);
      setStatus("valid");
    } catch (err: any) {
      console.error("Error fetching medical history:", err);
      setStatus("error");
      setErrorMessage(err.message || "Failed to load medical history. Please check your network connection.");
    }
  };

  useEffect(() => {
    if (token) {
      fetchMedicalHistory(token);
    } else {
      setStatus("invalid");
      setErrorMessage("Missing security token parameter.");
    }
  }, [token]);

  // Aggregate all medications from clinical prescriptions and medication summaries
  const allMedications: Array<MedicationItem & { doctor_name?: string; date?: string; source_title?: string }> = [];

  if (historyData) {
    // Clinical prescriptions
    historyData.clinical_prescriptions?.forEach((rx) => {
      rx.medications?.forEach((med) => {
        allMedications.push({
          ...med,
          doctor_name: rx.doctor_name || "Attending Physician",
          date: rx.issued_at ? new Date(rx.issued_at).toLocaleDateString() : undefined,
          source_title: "Clinical EHR Prescription"
        });
      });
    });

    // Previous prescription text summaries if parsed
    historyData.previous_prescriptions?.forEach((prev) => {
      if (prev.medications_summary) {
        const lines = prev.medications_summary.split(/[\n,;]+/).map(s => s.trim()).filter(Boolean);
        lines.forEach(line => {
          allMedications.push({
            name: line,
            dosage: "As prescribed",
            frequency: "See prescription notes",
            duration: prev.prescription_date || "Historical",
            doctor_name: prev.doctor_name || "Attending Physician",
            date: prev.prescription_date || new Date(prev.created_at).toLocaleDateString(),
            source_title: prev.title
          });
        });
      }
    });
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-cyan-500 selection:text-white pb-16">
      {/* Top Banner - Restricted Security Scope */}
      <div className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-cyan-500/20 px-4 py-3 shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-sky-400 p-0.5 shadow-md shadow-cyan-500/20 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-slate-950" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-cyan-400 font-bold uppercase block leading-none">
                TRINAYORA SECURE EHR
              </span>
              <h1 className="text-xs font-bold text-slate-200 tracking-tight leading-snug">
                Restricted Medical History
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-semibold shadow-inner">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>QR Verified</span>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-5">
        {/* State 1: Loading State */}
        {status === "loading" && (
          <div className="space-y-4 pt-8 text-center">
            <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
              <Lock className="h-6 w-6 text-cyan-400 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-white tracking-wide">
                Validating Cryptographic QR Token...
              </h2>
              <p className="text-xs text-slate-400">
                Retrieving patient medical history records from Supabase
              </p>
            </div>

            {/* Skeleton Cards */}
            <div className="space-y-3 pt-4">
              <div className="h-24 bg-slate-900/60 rounded-2xl border border-white/5 animate-pulse p-4" />
              <div className="h-32 bg-slate-900/60 rounded-2xl border border-white/5 animate-pulse p-4" />
              <div className="h-32 bg-slate-900/60 rounded-2xl border border-white/5 animate-pulse p-4" />
            </div>
          </div>
        )}

        {/* State 2: Invalid QR Token */}
        {status === "invalid" && (
          <div className="mt-8 p-6 rounded-3xl bg-rose-950/40 border border-rose-500/40 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto text-rose-400">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-white">Invalid QR Security Token</h2>
              <p className="text-xs text-rose-300/80 leading-relaxed">
                {errorMessage || "The scanned QR code is unrecognized or has an invalid cryptographic signature."}
              </p>
            </div>
            <div className="p-3 bg-slate-950/80 rounded-2xl border border-white/5 text-[11px] text-slate-400 text-left font-mono space-y-1">
              <p>● Ensure you scanned an authentic TRINAYORA Patient QR card.</p>
              <p>● Ask the patient to re-open their active QR token from their portal.</p>
            </div>
            <button
              onClick={() => fetchMedicalHistory(token)}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-950/50"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry Verification
            </button>
          </div>
        )}

        {/* State 3: Expired QR Code */}
        {status === "expired" && (
          <div className="mt-8 p-6 rounded-3xl bg-amber-950/40 border border-amber-500/40 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400">
              <Clock className="h-8 w-8" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-white">QR Code Expired</h2>
              <p className="text-xs text-amber-300/80 leading-relaxed">
                {errorMessage || "For patient privacy and clinical security, this dynamic QR code has expired."}
              </p>
            </div>
            <div className="p-3 bg-slate-950/80 rounded-2xl border border-white/5 text-[11px] text-slate-400 text-left space-y-1">
              <p className="font-semibold text-slate-300">Action for Attending Doctor:</p>
              <p>Ask the patient to open their TRINAYORA portal and click <strong>&quot;Generate New QR&quot;</strong> on their smart health card.</p>
            </div>
          </div>
        )}

        {/* State 4: Revoked QR Code */}
        {status === "revoked" && (
          <div className="mt-8 p-6 rounded-3xl bg-slate-900 border border-rose-500/40 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto text-rose-400">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-white">QR Token Revoked</h2>
              <p className="text-xs text-rose-300/80 leading-relaxed">
                {errorMessage || "This QR token was revoked by the patient or hospital system and cannot be used."}
              </p>
            </div>
            <p className="text-[11px] text-slate-400">
              Please request an active, freshly generated QR token from the patient.
            </p>
          </div>
        )}

        {/* State 5: Patient Not Found */}
        {status === "patient_not_found" && (
          <div className="mt-8 p-6 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <User className="h-8 w-8" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-white">Patient Record Not Found</h2>
              <p className="text-xs text-slate-400">
                The token is valid but the associated patient record could not be retrieved.
              </p>
            </div>
          </div>
        )}

        {/* State 6: General Error */}
        {status === "error" && (
          <div className="mt-8 p-6 rounded-3xl bg-slate-900 border border-rose-500/30 text-center space-y-4">
            <AlertTriangle className="h-10 w-10 text-rose-400 mx-auto" />
            <h2 className="text-base font-bold text-white">Connection Error</h2>
            <p className="text-xs text-slate-400">{errorMessage}</p>
            <button
              onClick={() => fetchMedicalHistory(token)}
              className="py-2 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all"
            >
              Retry
            </button>
          </div>
        )}

        {/* State 7: Valid Medical History View (Mobile-First) */}
        {status === "valid" && historyData && (
          <div className="space-y-4">
            {/* Patient Header Card */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-500/30 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-cyan-400 font-bold block mb-1">
                    PATIENT IDENTIFIER
                  </span>
                  <h2 className="text-xl font-black text-white tracking-tight">
                    {historyData.patient_name}
                  </h2>
                </div>

                <div className="text-right">
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-mono">
                    Smart Health ID
                  </span>
                  <span className="inline-block mt-0.5 px-2.5 py-1 rounded-lg bg-cyan-950 border border-cyan-500/40 font-mono font-bold text-xs text-cyan-300 shadow-inner">
                    {historyData.health_id}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Restricted Prescription View</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <Clock className="h-3 w-3 text-cyan-400" />
                  <span>Expires: {new Date(historyData.token_expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>

            {/* Quick Navigation Tabs (Prescriptions vs Medications) */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900/90 rounded-2xl border border-white/5">
              <button
                onClick={() => setActiveTab("prescriptions")}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "prescriptions"
                    ? "bg-cyan-600 text-white shadow-md shadow-cyan-950"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Prescriptions ({historyData.previous_prescriptions.length + historyData.clinical_prescriptions.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("medications")}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "medications"
                    ? "bg-cyan-600 text-white shadow-md shadow-cyan-950"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Pill className="h-3.5 w-3.5" />
                <span>Medications ({allMedications.length})</span>
              </button>
            </div>

            {/* TAB 1: PRESCRIPTIONS LIST */}
            {activeTab === "prescriptions" && (
              <div className="space-y-3">
                {/* Clinical Prescriptions from Attending Doctors */}
                {historyData.clinical_prescriptions?.map((rx) => (
                  <div
                    key={`clin-${rx.id}`}
                    className="p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/20 shadow-md space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                          <Stethoscope className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-white">
                            {rx.doctor_name || "Prescribing Physician"}
                          </h3>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-cyan-400" />
                            {rx.issued_at ? new Date(rx.issued_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : "Date unspecified"}
                          </span>
                        </div>
                      </div>

                      <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                        EHR Record
                      </span>
                    </div>

                    {rx.instructions && (
                      <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 text-[11px] text-slate-300">
                        <span className="text-[10px] text-cyan-400 font-semibold uppercase block mb-0.5">Clinical Instructions:</span>
                        {rx.instructions}
                      </div>
                    )}

                    {/* Medications list */}
                    {rx.medications && rx.medications.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Prescribed Medications:
                        </span>
                        <div className="space-y-1.5">
                          {rx.medications.map((med, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-xl bg-slate-950/90 border border-white/5 flex items-start justify-between text-xs"
                            >
                              <div className="space-y-0.5">
                                <div className="font-bold text-white flex items-center gap-1.5">
                                  <Pill className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                                  <span>{med.name}</span>
                                </div>
                                <div className="text-[11px] text-slate-400 font-mono">
                                  <span>Dosage: <strong className="text-slate-200">{med.dosage}</strong></span>
                                  <span className="mx-1.5 text-slate-600">|</span>
                                  <span>Freq: <strong className="text-slate-200">{med.frequency}</strong></span>
                                </div>
                                {med.notes && (
                                  <p className="text-[10px] text-slate-500 italic mt-0.5">{med.notes}</p>
                                )}
                              </div>

                              <div className="text-right shrink-0">
                                <span className="inline-block px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-mono text-cyan-300 font-semibold">
                                  {med.duration}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Uploaded / Historical Previous Prescriptions */}
                {historyData.previous_prescriptions?.map((prev) => (
                  <div
                    key={`prev-${prev.id}`}
                    className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 shadow-md space-y-3 hover:border-cyan-500/30 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-slate-800 text-slate-300 border border-white/5">
                          <FileText className="h-4 w-4 text-cyan-400" />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-white leading-tight">
                            {prev.title || "Previous Prescription"}
                          </h3>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                            {prev.doctor_name && (
                              <span className="text-slate-300">Dr. {prev.doctor_name}</span>
                            )}
                            {prev.prescription_date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-2.5 w-2.5 text-cyan-400" />
                                {prev.prescription_date}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/5">
                        {prev.source === "google_drive" ? "Drive" : prev.source === "phone_upload" ? "Upload" : "Historical"}
                      </span>
                    </div>

                    {/* Medications summary snippet */}
                    {prev.medications_summary && (
                      <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/5 text-[11px] text-slate-300">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Medications / Rx:</span>
                        <p className="whitespace-pre-line font-mono text-[11px] text-cyan-200/90">{prev.medications_summary}</p>
                      </div>
                    )}

                    {prev.notes && (
                      <p className="text-[11px] text-slate-400 italic bg-slate-950/40 p-2 rounded-lg">
                        Notes: {prev.notes}
                      </p>
                    )}

                    {/* Document / File Preview Button if file attached */}
                    {(prev.file_data || prev.file_name) && (
                      <div className="pt-1">
                        <button
                          onClick={() => setSelectedDoc(prev)}
                          className="w-full py-2 px-3 rounded-xl bg-cyan-950 hover:bg-cyan-900/80 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View Prescription Document</span>
                          {prev.file_type && (
                            <span className="text-[9px] font-mono uppercase text-cyan-400/70">
                              ({prev.file_type.includes("pdf") ? "PDF" : "IMG"})
                            </span>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {/* Empty State */}
                {historyData.clinical_prescriptions.length === 0 && historyData.previous_prescriptions.length === 0 && (
                  <div className="p-8 text-center bg-slate-900/40 rounded-3xl border border-white/5 space-y-2">
                    <FileText className="h-8 w-8 text-slate-600 mx-auto" />
                    <h3 className="text-xs font-bold text-slate-300">No Prescriptions on File</h3>
                    <p className="text-[11px] text-slate-500">
                      No previous uploaded prescriptions or clinical prescriptions found for this patient.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: MEDICATIONS LIST */}
            {activeTab === "medications" && (
              <div className="space-y-2.5">
                {allMedications.length > 0 ? (
                  allMedications.map((med, idx) => (
                    <div
                      key={`med-${idx}`}
                      className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 shadow-sm space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                            <Pill className="h-4 w-4" />
                          </div>
                          <div>
                            <h3 className="text-xs font-bold text-white">{med.name}</h3>
                            <span className="text-[10px] text-slate-400 font-mono block">
                              Prescribed by: {med.doctor_name || "Doctor"}
                            </span>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-cyan-300 text-[10px] font-mono font-bold">
                          {med.duration}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-mono">
                        <div className="p-2 rounded-xl bg-slate-950/80 border border-white/5">
                          <span className="text-[9px] text-slate-500 uppercase block">Dosage</span>
                          <span className="text-slate-200 font-bold">{med.dosage}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-950/80 border border-white/5">
                          <span className="text-[9px] text-slate-500 uppercase block">Frequency</span>
                          <span className="text-slate-200 font-bold">{med.frequency}</span>
                        </div>
                      </div>

                      {med.notes && (
                        <p className="text-[10px] text-slate-400 bg-slate-950/40 p-1.5 rounded-lg">
                          {med.notes}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center bg-slate-900/40 rounded-3xl border border-white/5 space-y-2">
                    <Pill className="h-8 w-8 text-slate-600 mx-auto" />
                    <h3 className="text-xs font-bold text-slate-300">No Medications Recorded</h3>
                    <p className="text-[11px] text-slate-500">
                      No active or historical medications recorded for this patient.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Privacy & Security Notice Footer */}
            <div className="mt-6 p-3 rounded-2xl bg-slate-900/60 border border-white/5 text-[10px] text-slate-400 text-center space-y-1">
              <div className="flex items-center justify-center gap-1 text-slate-400 font-medium">
                <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                <span>Restricted Medical Access Protocol</span>
              </div>
              <p className="text-[9px] text-slate-500">
                Displaying only previous prescriptions and medications. Full medical records, diagnoses, and administrative controls remain strictly isolated and protected.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Document / Prescription Viewer Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 rounded-3xl border border-cyan-500/30 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-cyan-400" />
                <div>
                  <h3 className="text-xs font-bold text-white truncate max-w-[220px]">
                    {selectedDoc.title || "Prescription Document"}
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    {selectedDoc.doctor_name ? `Dr. ${selectedDoc.doctor_name}` : "Attending Doctor"} • {selectedDoc.prescription_date || "Historical"}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedDoc(null)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-slate-950/60">
              {selectedDoc.file_data ? (
                selectedDoc.file_type && selectedDoc.file_type.includes("pdf") ? (
                  <iframe
                    src={selectedDoc.file_data}
                    className="w-full h-96 rounded-xl border border-white/10"
                    title="PDF Prescription View"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedDoc.file_data}
                    alt={selectedDoc.title}
                    className="max-w-full max-h-96 object-contain rounded-xl border border-white/10 shadow-lg"
                  />
                )
              ) : selectedDoc.file_name ? (
                <div className="text-center p-8 space-y-3">
                  <FileText className="h-12 w-12 text-cyan-400 mx-auto" />
                  <p className="text-xs text-slate-300 font-bold">{selectedDoc.file_name}</p>
                  <p className="text-[11px] text-slate-400">Prescription document referenced on external secure storage.</p>
                </div>
              ) : (
                <div className="text-center p-8 space-y-2">
                  <FileText className="h-10 w-10 text-slate-500 mx-auto" />
                  <p className="text-xs text-slate-400">No digital image attached to this prescription entry.</p>
                </div>
              )}

              {selectedDoc.medications_summary && (
                <div className="w-full mt-4 p-3 rounded-xl bg-slate-900 border border-white/10 text-left">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase block mb-1">Medications Summary:</span>
                  <p className="text-xs text-slate-200 font-mono whitespace-pre-line">{selectedDoc.medications_summary}</p>
                </div>
              )}

              {selectedDoc.notes && (
                <div className="w-full mt-2 p-2.5 rounded-xl bg-slate-900/50 border border-white/5 text-left">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Notes:</span>
                  <p className="text-[11px] text-slate-300">{selectedDoc.notes}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-white/10 bg-slate-950 flex justify-end">
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
