"use client";

import React from "react";
import Link from "next/link";
import { 
  HeartPulse, ShieldCheck, Lock, Phone, Mail, MapPin, 
  ExternalLink, QrCode, Stethoscope, Users, Building, Activity,
  FileText, ShieldAlert, Cpu
} from "lucide-react";

interface FooterProps {
  theme?: "light" | "dark";
}

export default function Footer({ theme = "light" }: FooterProps) {
  const isLight = theme === "light";

  return (
    <footer className={`mt-auto border-t transition-colors duration-300 ${
      isLight 
        ? "bg-slate-50/90 border-slate-200/90 text-slate-700" 
        : "bg-slate-950/95 border-white/10 text-slate-400"
    }`}>
      {/* Top Banner / Trust Badges */}
      <div className={`border-b ${isLight ? "border-slate-200/70 bg-white/60" : "border-white/5 bg-slate-900/40"} py-4 px-6`}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className={isLight ? "text-slate-800 font-semibold" : "text-slate-200 font-semibold"}>
                Supabase Cloud DB & Services: Operational
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <Lock className="h-3.5 w-3.5 text-sky-500" />
              <span>AES-256 End-to-End Encrypted</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>HIPAA & DISHA Compliant</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-slate-400">24/7 Medical Hotline:</span>
            <a 
              href="tel:+18007627843" 
              className="text-xs font-bold font-mono text-sky-600 hover:text-sky-700 dark:text-sky-400 flex items-center gap-1"
            >
              <Phone className="h-3 w-3" />
              +1 (800) 762-7843
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Col 1 & 2: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="bg-gradient-to-tr from-cyan-500 via-blue-600 to-emerald-400 p-2 rounded-xl text-white shadow-md">
                <HeartPulse className="h-5 w-5" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-lg font-black tracking-tight ${
                  isLight ? "text-slate-900" : "text-white"
                }`}>
                  TRINAYORA
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
                  HEALTH ID
                </span>
              </div>
            </Link>

            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 max-w-sm">
              Next-generation RFID + dynamic single-use QR digital medical identity and clinical records platform. Empowering patients with sovereign consent and equipping clinicians with instantaneous verified EHR access.
            </p>

            <div className="pt-2 space-y-2 text-xs">
              <div className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                <MapPin className="h-4 w-4 text-sky-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Headquarters:</strong> 450 Healthtech Way, Silicon Valley, CA 94025, USA
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Mail className="h-4 w-4 text-sky-500 shrink-0" />
                <a href="mailto:support@smarthealth.id" className="hover:underline">
                  support@smarthealth.id
                </a>
                <span className="text-slate-400">•</span>
                <a href="mailto:emergency@smarthealth.id" className="hover:underline text-rose-500 dark:text-rose-400 font-semibold">
                  emergency@smarthealth.id
                </a>
              </div>
            </div>
          </div>

          {/* Col 3: Quick Platform Links */}
          <div className="space-y-3">
            <h4 className={`text-xs font-bold uppercase tracking-wider ${
              isLight ? "text-slate-900" : "text-white"
            }`}>
              Platform Portals
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/?auth=signup&role=patient" className="hover:text-sky-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-sky-500" />
                  <span>Patient Health ID Signup</span>
                </Link>
              </li>
              <li>
                <Link href="/?auth=login&role=doctor" className="hover:text-sky-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  <Stethoscope className="h-3.5 w-3.5 text-cyan-500" />
                  <span>Clinician NMR Verification</span>
                </Link>
              </li>
              <li>
                <Link href="/scan" className="hover:text-sky-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  <QrCode className="h-3.5 w-3.5 text-rose-500" />
                  <span className="font-semibold text-rose-600 dark:text-rose-400">Emergency QR & RFID Scan</span>
                </Link>
              </li>
              <li>
                <Link href="/?auth=login&role=system_admin" className="hover:text-sky-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Hospital System Admin</span>
                </Link>
              </li>
              <li>
                <Link href="/thank-you" className="hover:text-sky-600 dark:hover:text-cyan-400 transition-colors">
                  Registration Confirmation
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal & Policies */}
          <div className="space-y-3">
            <h4 className={`text-xs font-bold uppercase tracking-wider ${
              isLight ? "text-slate-900" : "text-white"
            }`}>
              Legal & Trust
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/privacy" className="hover:text-sky-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-slate-400" />
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-sky-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-slate-400" />
                  <span>Terms & Conditions</span>
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-sky-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-slate-400" />
                  <span>Cookie Policy</span>
                </Link>
              </li>
              <li>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  <ShieldCheck className="h-3 w-3" /> Zero-Knowledge Consent
                </span>
              </li>
            </ul>
          </div>

          {/* Col 5: Contact & Support */}
          <div className="space-y-3">
            <h4 className={`text-xs font-bold uppercase tracking-wider ${
              isLight ? "text-slate-900" : "text-white"
            }`}>
              Support & Network
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/contact" className="hover:text-sky-600 dark:hover:text-cyan-400 transition-colors font-semibold text-sky-600 dark:text-sky-400 flex items-center gap-1">
                  <span>Contact Our Team</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </li>
              <li>
                <a href="mailto:hospitals@smarthealth.id" className="hover:text-sky-600 dark:hover:text-cyan-400 transition-colors">
                  Hospital Onboarding
                </a>
              </li>
              <li>
                <a href="mailto:security@smarthealth.id" className="hover:text-sky-600 dark:hover:text-cyan-400 transition-colors">
                  Security Bug Bounty
                </a>
              </li>
              <li>
                <a href="tel:+9118007627843" className="hover:text-sky-600 dark:hover:text-cyan-400 transition-colors">
                  Asia-Pacific Support: 1800-SMART-HEALTH
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className={`mt-10 pt-6 border-t flex flex-col md:flex-row items-center justify-between gap-4 text-xs ${
          isLight ? "border-slate-200 text-slate-500" : "border-white/10 text-slate-500"
        }`}>
          <div>
            © {new Date().getFullYear()} TRINAYORA Medical Identity Systems Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:underline">Terms</Link>
            <span>•</span>
            <Link href="/cookies" className="hover:underline">Cookies</Link>
            <span>•</span>
            <Link href="/contact" className="hover:underline">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
