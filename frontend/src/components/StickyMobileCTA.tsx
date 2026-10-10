"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { QrCode, UserPlus, Stethoscope } from "lucide-react";

interface StickyMobileCTAProps {
  onOpenPatientSignup?: () => void;
  onOpenDoctorLogin?: () => void;
  onOpenScanner?: () => void;
}

export default function StickyMobileCTA({
  onOpenPatientSignup,
  onOpenDoctorLogin,
}: StickyMobileCTAProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky mobile CTA after user scrolls slightly or immediately on mobile screens
      if (window.scrollY > 80 || window.innerWidth < 768) {
        setIsVisible(true);
      }
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[99999] md:hidden p-2.5 pb-3 bg-slate-950/95 backdrop-blur-2xl border-t border-cyan-500/40 shadow-2xl shadow-cyan-950 animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-center gap-2 max-w-lg mx-auto">
        {/* Emergency Scan Link */}
        <Link
          href="/scan"
          className="flex-1 min-h-[44px] py-2.5 px-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-rose-900/40 active:scale-95 transition-all touch-manipulation select-none cursor-pointer"
        >
          <QrCode className="h-4 w-4 shrink-0 animate-pulse" />
          <span className="truncate">Emergency Scan</span>
        </Link>

        {/* Instant Patient Sign Up */}
        {onOpenPatientSignup ? (
          <button
            type="button"
            onClick={onOpenPatientSignup}
            className="flex-1 min-h-[44px] py-2.5 px-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/30 active:scale-95 transition-all touch-manipulation select-none cursor-pointer"
          >
            <UserPlus className="h-4 w-4 shrink-0" />
            <span className="truncate">Get Health ID</span>
          </button>
        ) : (
          <Link
            href="/?auth=signup&role=patient"
            className="flex-1 min-h-[44px] py-2.5 px-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/30 active:scale-95 transition-all touch-manipulation select-none cursor-pointer"
          >
            <UserPlus className="h-4 w-4 shrink-0" />
            <span className="truncate">Get Health ID</span>
          </Link>
        )}

        {/* Doctor Login */}
        {onOpenDoctorLogin ? (
          <button
            type="button"
            onClick={onOpenDoctorLogin}
            className="min-h-[44px] min-w-[44px] p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-white/15 text-cyan-300 text-xs font-semibold flex items-center justify-center active:scale-95 transition-all touch-manipulation select-none cursor-pointer"
            title="Clinician Portal (NMR ID)"
          >
            <Stethoscope className="h-4 w-4" />
          </button>
        ) : (
          <Link
            href="/?auth=login&role=doctor"
            className="min-h-[44px] min-w-[44px] p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-white/15 text-cyan-300 text-xs font-semibold flex items-center justify-center active:scale-95 transition-all touch-manipulation select-none cursor-pointer"
            title="Clinician Portal (NMR ID)"
          >
            <Stethoscope className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
