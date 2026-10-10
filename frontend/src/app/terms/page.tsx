"use client";

import React from "react";
import Link from "next/link";
import { 
  HeartPulse, ArrowLeft, FileCheck, Stethoscope, AlertTriangle, 
  ShieldAlert, Scale, CheckCircle2, UserCheck, HelpCircle
} from "lucide-react";
import Footer from "@/components/Footer";

export default function TermsAndConditionsPage() {
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
                TERMS
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold border border-blue-300">
            <Scale className="h-4 w-4 text-blue-600" />
            <span>Clinical Master Service Agreement</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900">
            Terms & Conditions of Service
          </h1>
          <p className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Welcome to TRINAYORA. These terms govern the issuance of SmartHealth IDs, digital RFID credentials, dynamic QR single-use tokens, and National Medical Register (NMR) clinician verification.
          </p>
          <div className="pt-2 text-xs font-mono text-slate-500">
            Version 4.1.0 • Effective: January 2026 • Governed by Digital Health Act & Applicable Law
          </div>
        </div>
      </section>

      {/* Main Terms Sections */}
      <main className="max-w-4xl mx-auto px-6 py-12 space-y-10 flex-1 text-sm text-slate-700 leading-relaxed">
        
        {/* Section 1: Acceptance */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-600 text-white text-xs font-bold">1</span>
            Acceptance of Terms
          </h2>
          <p>
            By registering a Patient Health ID, accessing the Clinician National Medical Register (NMR) Portal, scanning a dynamic QR credential, or issuing an RFID physical smart card, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions and our Privacy Policy.
          </p>
        </section>

        {/* Section 2: Clinician Verification */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-600 text-white text-xs font-bold">2</span>
            Doctor Credentialing & National Medical Register (NMR) Mandate
          </h2>
          <p>
            All healthcare practitioners utilizing TRINAYORA for prescribing or retrieving patient clinical charts must maintain a verified registration with the National Medical Register (NMR) or recognized State Medical Council.
          </p>
          <ul className="list-disc pl-6 space-y-1.5 text-xs md:text-sm">
            <li>Clinicians are strictly prohibited from sharing their NMR digital identity credentials or password.</li>
            <li>Digital smart pen handwritten prescriptions submitted via TRINAYORA carry the legal equivalent of a physical written prescription under the Telemedicine Practice Guidelines.</li>
            <li>Any attempt to fabricate medical records or impersonate a registered doctor is subject to immediate credential revocation and criminal prosecution.</li>
          </ul>
        </section>

        {/* Section 3: Patient Responsibilities */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-600 text-white text-xs font-bold">3</span>
            Patient Account Security & Physical RFID Care
          </h2>
          <p>
            As a patient user, you are responsible for maintaining the confidentiality of your credentials. In the event of a lost, misplaced, or compromised physical RFID smart card, you must immediately report or deactivate the card through the Patient Portal to generate a replacement UID.
          </p>
        </section>

        {/* Section 4: Emergency Access & Disclaimers */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-600 text-white text-xs font-bold">4</span>
            Emergency Medical Disclaimer
          </h2>
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 text-xs md:text-sm space-y-2">
            <div className="flex items-center gap-2 font-bold text-rose-800">
              <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
              <span>Not a Substitute for Primary Emergency Response</span>
            </div>
            <p>
              While TRINAYORA facilitates instant cloud EHR triage during critical care, it does not provide medical diagnoses or replace emergency paramedic services. If you are experiencing a life-threatening medical event, call 911 / 112 / 108 or proceed immediately to the nearest emergency department.
            </p>
          </div>
        </section>

        {/* Section 5: Service Availability */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-600 text-white text-xs font-bold">5</span>
            Uptime SLA & Cloud Persistence
          </h2>
          <p>
            TRINAYORA aims for 99.9% uptime across our Supabase Cloud infrastructure and Edge gateway networks. Scheduled maintenance windows will be communicated in advance via the system administrator status board.
          </p>
        </section>

        {/* Section 6: Inquiries & Legal Representation */}
        <section className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-900 text-base">Questions Regarding These Terms?</h3>
          <p className="text-xs text-slate-600">
            For contractual agreements, hospital network licensing, or enterprise SLAs, contact our legal counsel:
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <a href="mailto:legal@smarthealth.id" className="text-sky-600 font-bold hover:underline">
              legal@smarthealth.id
            </a>
            <span className="text-slate-300">•</span>
            <span className="text-slate-700">+1 (800) 762-7843 (Ext. 101)</span>
          </div>
        </section>

      </main>

      <Footer theme="light" />
    </div>
  );
}
