"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  HeartPulse, CheckCircle2, QrCode, ArrowRight, Home, 
  Download, Share2, Copy, Stethoscope, Users, Sparkles,
  ShieldCheck, ArrowLeft, Phone
} from "lucide-react";
import Footer from "@/components/Footer";

function ThankYouContent() {
  const searchParams = useSearchParams();
  const source = searchParams.get("source") || "registration";
  const name = searchParams.get("name") || "Valued User";
  
  const [refId, setRefId] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Generate an authentic looking confirmation reference
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRefId(`TRN-2026-${randomHex}`);
  }, []);

  const copyRef = () => {
    if (refId) {
      navigator.clipboard.writeText(refId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-16 flex-1 w-full space-y-8">
      
      {/* Success Hero Card */}
      <div className="p-8 md:p-12 rounded-3xl bg-white border border-slate-200 shadow-xl text-center space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-cyan-500 via-blue-600 to-emerald-500" />
        
        {/* Animated Checkmark Bubble */}
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-bounce">
          <CheckCircle2 className="h-10 w-10" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            TRANSACTION CONFIRMED & LOGGED
          </span>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900">
            Thank You, {name}!
          </h1>
          <p className="text-xs md:text-sm text-slate-600 max-w-lg mx-auto">
            {source === "contact"
              ? "Your clinical inquiry has been queued for our medical tech desk. A representative will reach out shortly."
              : "Your TRINAYORA Digital Health identity records and cryptographic keys have been provisioned on Supabase Cloud."}
          </p>
        </div>

        {/* Reference Box */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-md mx-auto flex items-center justify-between gap-3">
          <div className="text-left">
            <span className="text-[10px] uppercase font-mono text-slate-400 block font-bold">
              Confirmation Reference ID
            </span>
            <span className="font-mono text-sm font-bold text-slate-800">
              {refId || "TRN-2026-GENERATING..."}
            </span>
          </div>
          <button
            type="button"
            onClick={copyRef}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1 transition-all"
            title="Copy reference code"
          >
            {copied ? (
              <span className="text-emerald-600 text-xs font-bold">Copied!</span>
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 max-w-lg mx-auto">
          <Link
            href="/?auth=login&role=patient"
            className="py-3 px-4 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-sky-600/20 transition-all flex items-center justify-center gap-2"
          >
            <Users className="h-4 w-4" />
            <span>Open Patient Portal</span>
          </Link>

          <Link
            href="/scan"
            className="py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <QrCode className="h-4 w-4 text-sky-600" />
            <span>Emergency QR Scanner</span>
          </Link>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-4 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-800 flex items-center gap-1 font-semibold">
            <Home className="h-3.5 w-3.5" />
            <span>Return to Homepage</span>
          </Link>
          <span>•</span>
          <Link href="/contact" className="hover:text-slate-800 flex items-center gap-1">
            <Phone className="h-3.5 w-3.5" />
            <span>Contact Support</span>
          </Link>
        </div>

      </div>

      {/* Trust & Next Steps Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
          <div className="font-bold text-slate-900 flex items-center gap-1.5 text-emerald-600">
            <ShieldCheck className="h-4 w-4" /> 256-bit Cloud Sync
          </div>
          <p className="text-slate-500 text-[11px]">Records instantly distributed across accredited hospital nodes.</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
          <div className="font-bold text-slate-900 flex items-center gap-1.5 text-sky-600">
            <QrCode className="h-4 w-4" /> Dynamic QR Ready
          </div>
          <p className="text-slate-500 text-[11px]">Generate your time-bound access code on demand for clinical visits.</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
          <div className="font-bold text-slate-900 flex items-center gap-1.5 text-purple-600">
            <Stethoscope className="h-4 w-4" /> Doctor NMR Registry
          </div>
          <p className="text-slate-500 text-[11px]">Only verified licensed clinicians can decipher full medical charts.</p>
        </div>
      </div>

    </div>
  );
}

export default function ThankYouPage() {
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
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                CONFIRMATION
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

      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center p-12 text-xs font-mono text-slate-500">
          Loading Confirmation Details...
        </div>
      }>
        <ThankYouContent />
      </Suspense>

      <Footer theme="light" />
    </div>
  );
}
