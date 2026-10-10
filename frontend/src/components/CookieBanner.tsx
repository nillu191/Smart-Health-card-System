"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, ShieldCheck, Check, Settings2, X, ChevronRight, Lock } from "lucide-react";

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // always required
    functional: true,
    analytics: false,
    security: true,
  });

  useEffect(() => {
    // Check if user has already made a cookie choice
    const savedConsent = localStorage.getItem("trinayora_cookie_consent");
    if (!savedConsent) {
      // Small delay for smooth entry
      const timer = setTimeout(() => setShowBanner(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const consent = {
      necessary: true,
      functional: true,
      analytics: true,
      security: true,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("trinayora_cookie_consent", JSON.stringify(consent));
    setShowBanner(false);
  };

  const handleEssentialOnly = () => {
    const consent = {
      necessary: true,
      functional: false,
      analytics: false,
      security: true,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("trinayora_cookie_consent", JSON.stringify(consent));
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    const consent = {
      ...preferences,
      necessary: true,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("trinayora_cookie_consent", JSON.stringify(consent));
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-6 duration-500">
      <div className="p-5 rounded-3xl bg-slate-900/95 backdrop-blur-xl border border-cyan-500/30 text-white shadow-2xl shadow-cyan-950/50 space-y-4">
        {/* Banner Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <Cookie className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                Privacy & Cookie Consent
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  HIPAA / GDPR
                </span>
              </h4>
              <p className="text-[11px] text-slate-400">TRINAYORA Clinical Identity</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleEssentialOnly}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg transition-colors"
            title="Dismiss with Essential only"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Banner Body */}
        {!showCustomize ? (
          <p className="text-xs text-slate-300 leading-relaxed">
            We use encrypted local session tokens and security cookies to securely authenticate hospital clinicians, verify patient RFID/QR tokens, and comply with clinical privacy regulations.
          </p>
        ) : (
          <div className="space-y-2.5 pt-1 border-t border-white/10 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/80 border border-white/5">
              <div className="flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-emerald-400" />
                <div>
                  <div className="font-semibold text-slate-200 text-xs">Essential & Security</div>
                  <div className="text-[10px] text-slate-400">Required for token signing & login sessions</div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold px-2 py-0.5 bg-emerald-950/60 rounded">Always On</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/80 border border-white/5">
              <div>
                <div className="font-semibold text-slate-200 text-xs">Offline Diagnostics</div>
                <div className="text-[10px] text-slate-400">Local emergency cache & smart pen canvas state</div>
              </div>
              <input
                type="checkbox"
                checked={preferences.functional}
                onChange={(e) => setPreferences({ ...preferences, functional: e.target.checked })}
                className="rounded accent-cyan-500 h-4 w-4 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/80 border border-white/5">
              <div>
                <div className="font-semibold text-slate-200 text-xs">Anonymous Performance</div>
                <div className="text-[10px] text-slate-400">Aggregate telemetry to optimize QR scan latency</div>
              </div>
              <input
                type="checkbox"
                checked={preferences.analytics}
                onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                className="rounded accent-cyan-500 h-4 w-4 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Links & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-3 text-[11px] text-cyan-400">
            <Link href="/cookies" className="hover:underline flex items-center gap-0.5">
              Cookie Policy
            </Link>
            <span className="text-slate-600">•</span>
            <Link href="/privacy" className="hover:underline">
              Privacy Policy
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setShowCustomize(!showCustomize)}
            className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors underline"
          >
            <Settings2 className="h-3 w-3" />
            <span>{showCustomize ? "Simple View" : "Preferences"}</span>
          </button>
        </div>

        {/* Button Row */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {showCustomize ? (
            <>
              <button
                type="button"
                onClick={handleEssentialOnly}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
              >
                Reject Non-Essential
              </button>
              <button
                type="button"
                onClick={handleSavePreferences}
                className="px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-cyan-500/20"
              >
                Save Preferences
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleEssentialOnly}
                className="px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all border border-white/5"
              >
                Essential Only
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-1"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Accept All</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
