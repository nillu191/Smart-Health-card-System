"use client";

import React from "react";
import Link from "next/link";
import { 
  HeartPulse, ArrowLeft, Cookie, ShieldCheck, Lock, Database, 
  Settings2, Check, RefreshCw
} from "lucide-react";
import Footer from "@/components/Footer";

export default function CookiePolicyPage() {
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
                COOKIES
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-bold border border-cyan-300">
            <Cookie className="h-4 w-4 text-cyan-600" />
            <span>Transparent Storage & Telemetry Protocol</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900">
            Cookie & Local Storage Policy
          </h1>
          <p className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Understand exactly how TRINAYORA uses local tokens, session cookies, and encrypted state storage to deliver rapid clinical health ID access while respecting your digital privacy.
          </p>
          <div className="pt-2 text-xs font-mono text-slate-500">
            Effective Date: March 2026 • Compliant with EU ePrivacy Directive & California CCPA
          </div>
        </div>
      </section>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 space-y-10 flex-1 text-sm text-slate-700 leading-relaxed">
        
        {/* What are cookies */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2">
            1. What Are Cookies and Web Storage?
          </h2>
          <p>
            Cookies and browser LocalStorage are small cryptographic data packets stored directly on your computer or mobile device when you interact with our web applications. In TRINAYORA, these storage mechanisms allow you to remain securely logged into your clinical dashboard, store digital pen strokes locally during consultation, and retain emergency offline tokens.
          </p>
        </section>

        {/* Categories of Cookies Table */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2">
            2. Detailed Breakdown of Storage Types
          </h2>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-900 font-bold">
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Key Identifiers</th>
                  <th className="p-3.5">Purpose & Function</th>
                  <th className="p-3.5">Duration</th>
                  <th className="p-3.5">Requirement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-3.5 font-bold text-slate-900 flex items-center gap-1.5">
                    <Lock className="h-4 w-4 text-emerald-600" />
                    Strictly Necessary
                  </td>
                  <td className="p-3.5 font-mono text-[11px] text-slate-600">token, user</td>
                  <td className="p-3.5 text-slate-600">Maintains JWT clinician / patient authentication and secure API authorization headers.</td>
                  <td className="p-3.5 text-slate-600">24 Hours / Session</td>
                  <td className="p-3.5"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">Mandatory</span></td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-sky-600" />
                    Consent Preference
                  </td>
                  <td className="p-3.5 font-mono text-[11px] text-slate-600">trinayora_cookie_consent</td>
                  <td className="p-3.5 text-slate-600">Stores your user cookie banner preferences and opt-in/opt-out status.</td>
                  <td className="p-3.5 text-slate-600">12 Months</td>
                  <td className="p-3.5"><span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-bold">Essential</span></td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-slate-900 flex items-center gap-1.5">
                    <Database className="h-4 w-4 text-purple-600" />
                    Functional Offline
                  </td>
                  <td className="p-3.5 font-mono text-[11px] text-slate-600">offline_qr_cache, pen_state</td>
                  <td className="p-3.5 text-slate-600">Caches emergency QR tokens and handwritten smart pen canvas data in case of clinic network drop.</td>
                  <td className="p-3.5 text-slate-600">Session</td>
                  <td className="p-3.5"><span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">Optional</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* How to manage cookies */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2">
            3. How to Manage or Reset Cookie Preferences
          </h2>
          <p>
            You can modify your cookie preferences at any time by clicking the Cookie Banner settings in the footer, or by configuring your web browser to block or alert you about cookies.
          </p>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="font-bold text-slate-900 text-xs">Reset Local Storage & Consent in 1 Click</div>
              <p className="text-xs text-slate-500">Purges local tokens and re-prompts the consent dialogue.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem("trinayora_cookie_consent");
                alert("Cookie consent preferences cleared. Refreshing page...");
                window.location.reload();
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reset Cookie Settings</span>
            </button>
          </div>
        </section>

      </main>

      <Footer theme="light" />
    </div>
  );
}
