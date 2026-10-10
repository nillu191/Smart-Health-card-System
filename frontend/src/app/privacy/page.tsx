"use client";

import React from "react";
import Link from "next/link";
import { 
  ShieldCheck, Lock, HeartPulse, ArrowLeft, FileText, CheckCircle2, 
  AlertCircle, Eye, RefreshCw, KeyRound, Database, UserCheck, Mail, Phone
} from "lucide-react";
import Footer from "@/components/Footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="bg-gradient-to-tr from-cyan-500 via-blue-600 to-emerald-400 p-2 rounded-xl text-white shadow-md">
              <HeartPulse className="h-5 w-5" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black tracking-tight bg-gradient-to-r from-sky-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent">
                TRINAYORA
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-700 border border-sky-200">
                PRIVACY
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Application</span>
          </Link>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-sky-50 via-white to-slate-50 py-16 px-6 border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>HIPAA, GDPR & DISHA Compliant Architecture</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900">
            Privacy Policy & Data Sovereign Charter
          </h1>
          <p className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Your medical records, biometric IDs, RFID signals, and QR cryptographic credentials belong exclusively to you. Learn how TRINAYORA safeguards patient health sovereignty.
          </p>
          <div className="pt-2 text-xs font-mono text-slate-500">
            Effective Date: March 1, 2026 • Last Reviewed: October 2026 • Version 3.4.0
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-6 py-12 space-y-12 flex-1 leading-relaxed text-sm text-slate-700">
        
        {/* Core Principles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="p-2.5 rounded-xl bg-sky-100 text-sky-700 w-fit">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900">Zero-Knowledge Storage</h3>
            <p className="text-xs text-slate-600">
              Prescriptions and diagnoses are secured at rest with AES-256 GCM encryption and isolated tenant schemas.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 w-fit">
              <KeyRound className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900">Patient-Led Consent</h3>
            <p className="text-xs text-slate-600">
              Doctors cannot access your clinical history without your physical RFID tap, timed QR token, or explicit permission.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="p-2.5 rounded-xl bg-purple-100 text-purple-700 w-fit">
              <RefreshCw className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900">Single-Use Token Expiry</h3>
            <p className="text-xs text-slate-600">
              Dynamic QR tokens automatically expire within 15–72 hours or upon a single clinical scanning event.
            </p>
          </div>
        </div>

        {/* Section 1: Information Collected */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-600 text-white text-xs font-bold">1</span>
            Categories of Information We Collect
          </h2>
          <p>
            TRINAYORA operates strictly as an identity protocol and encrypted health record gateway. We process the following categories of data:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-xs md:text-sm">
            <li>
              <strong>Patient Identity Data:</strong> Full name, date of birth, blood group, emergency contact details, and system-assigned unique Health ID (e.g., <code>SH-1234-5678</code>).
            </li>
            <li>
              <strong>Clinical Electronic Health Records (EHR):</strong> Diagnoses (ICD-10 coded), prescription instructions, active medications, laboratory reports, digital handwritten smart pen prescriptions, and immunization schedules.
            </li>
            <li>
              <strong>Hardware Card Identifiers:</strong> Non-personal Mifare / NFC RFID card Unique Identifiers (UIDs) mapped to encrypted patient references.
            </li>
            <li>
              <strong>Clinician Authentication Data:</strong> National Medical Register (NMR) IDs, state medical council registration numbers, clinical specialization, and hospital affiliations.
            </li>
            <li>
              <strong>Cryptographic Audit Trails:</strong> Timestamped immutable logs recording which certified clinician accessed a record, duration of session, and consent origin (QR, RFID, or Emergency Bypass).
            </li>
          </ul>
        </section>

        {/* Section 2: How Medical Data is Used */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-600 text-white text-xs font-bold">2</span>
            How We Use Your Medical Information
          </h2>
          <p>
            Your Protected Health Information (PHI) is processed strictly for clinical care delivery and emergency triage. We <strong>never sell, monetize, or broker patient medical data</strong> to third-party pharmaceutical companies, advertisers, or data brokers.
          </p>
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs md:text-sm flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Emergency Override Protocol:</strong> In life-threatening emergencies, licensed doctors can query critical blood group and allergy alerts via the Emergency Bypass. Every emergency access event triggers an immediate alert and a permanent audit log entry.
            </div>
          </div>
        </section>

        {/* Section 3: Supabase Cloud Security & Infrastructure */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-600 text-white text-xs font-bold">3</span>
            Cloud Storage & Infrastructure Architecture
          </h2>
          <p>
            TRINAYORA’s cloud backend is powered by <strong>Supabase (Managed Enterprise PostgreSQL)</strong> with strict Row-Level Security (RLS) policies, end-to-end TLS 1.3 encryption in transit, and multi-region database redundancy with automated point-in-time recovery.
          </p>
        </section>

        {/* Section 4: Patient Rights */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-600 text-white text-xs font-bold">4</span>
            Your Sovereign Rights Under GDPR & HIPAA
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white border border-slate-200">
              <div className="font-bold text-slate-900 mb-1">✓ Right to Access & Portability</div>
              <p className="text-slate-600">Export your entire prescription timeline, lab PDFs, and diagnosis history in machine-readable JSON or PDF format.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-slate-200">
              <div className="font-bold text-slate-900 mb-1">✓ Right to Revoke Consent</div>
              <p className="text-slate-600">Instantly revoke active doctor consultation permissions or disable lost RFID physical cards in 1 tap from your Patient Portal.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-slate-200">
              <div className="font-bold text-slate-900 mb-1">✓ Right to Erasure</div>
              <p className="text-slate-600">Request complete account de-identification or purging in compliance with local medical retention statutes.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-slate-200">
              <div className="font-bold text-slate-900 mb-1">✓ Right to Audit Inspection</div>
              <p className="text-slate-600">View real-time access logs identifying every hospital, doctor, and terminal that opened your record.</p>
            </div>
          </div>
        </section>

        {/* Section 5: Data Protection Officer Contact */}
        <section className="p-6 rounded-3xl bg-slate-900 text-white space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Contact Our Data Protection Officer (DPO)</h3>
              <p className="text-xs text-slate-400">For privacy inquiries, audit records, or compliance requests</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
            <div>
              <span className="text-slate-400 block">DPO Email:</span>
              <a href="mailto:privacy@smarthealth.id" className="font-mono text-cyan-400 font-bold hover:underline">
                privacy@smarthealth.id
              </a>
            </div>
            <div>
              <span className="text-slate-400 block">Global Compliance Hotline:</span>
              <span className="font-mono text-white font-bold">+1 (800) 762-7843 (Ext. 402)</span>
            </div>
            <div className="md:col-span-2 text-slate-400">
              Mailing Address: TRINAYORA Privacy & Legal Governance, 450 Healthtech Way, Suite 800, Silicon Valley, CA 94025, USA.
            </div>
          </div>
        </section>

      </main>

      <Footer theme="light" />
    </div>
  );
}
