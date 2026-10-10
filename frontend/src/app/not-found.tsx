"use client";

import React from "react";
import Link from "next/link";
import { 
  HeartPulse, ArrowLeft, Search, QrCode, Stethoscope, 
  Users, Home, AlertOctagon, Phone, ShieldCheck 
} from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-slate-100 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500/15 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-rose-500/15 blur-[140px] pointer-events-none" />

      {/* Top Header */}
      <header className="px-6 py-4 border-b border-white/10 flex items-center justify-between z-10">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="bg-gradient-to-tr from-cyan-500 via-blue-600 to-emerald-400 p-2 rounded-xl text-white shadow-lg">
            <HeartPulse className="h-5 w-5 animate-pulse" />
          </div>
          <span className="text-lg font-black tracking-tight bg-gradient-to-r from-cyan-300 via-blue-400 to-emerald-300 bg-clip-text text-transparent">
            TRINAYORA
          </span>
        </Link>

        <Link
          href="/"
          className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-all"
        >
          <Home className="h-3.5 w-3.5" />
          <span>Home</span>
        </Link>
      </header>

      {/* Main 404 Hero Area */}
      <main className="flex-1 flex items-center justify-center p-6 z-10">
        <div className="max-w-xl w-full text-center space-y-6">
          
          {/* Glowing 404 Hologram Badge */}
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-3xl bg-slate-900 border border-cyan-500/40 mx-auto flex items-center justify-center text-cyan-400 shadow-2xl shadow-cyan-950 glow-cyan">
              <AlertOctagon className="h-12 w-12 text-rose-500 animate-pulse" />
            </div>
            <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500 text-white shadow">
              CODE 404
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
              Medical Route Not Found
            </h1>
            <p className="text-xs md:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              The clinical pathway, patient token, or page you requested does not exist or has expired from the cache.
            </p>
          </div>

          {/* Quick Route Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left text-xs">
            <Link
              href="/"
              className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-white/10 hover:border-cyan-500/50 transition-all flex items-center gap-3 group"
            >
              <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 group-hover:scale-110 transition-transform">
                <Home className="h-5 w-5" />
              </div>
              <div>
                <div className="font-bold text-white">Main Workspace</div>
                <div className="text-[11px] text-slate-400">Return to interactive 3D showcase</div>
              </div>
            </Link>

            <Link
              href="/scan"
              className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-white/10 hover:border-rose-500/50 transition-all flex items-center gap-3 group"
            >
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-300 group-hover:scale-110 transition-transform">
                <QrCode className="h-5 w-5" />
              </div>
              <div>
                <div className="font-bold text-white">Emergency Scanner</div>
                <div className="text-[11px] text-slate-400">Scan QR token or RFID UID</div>
              </div>
            </Link>

            <Link
              href="/?auth=signup&role=patient"
              className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-white/10 hover:border-emerald-500/50 transition-all flex items-center gap-3 group"
            >
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 group-hover:scale-110 transition-transform">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <div className="font-bold text-white">Get Health ID</div>
                <div className="text-[11px] text-slate-400">Register new patient profile</div>
              </div>
            </Link>

            <Link
              href="/contact"
              className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-white/10 hover:border-purple-500/50 transition-all flex items-center gap-3 group"
            >
              <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 group-hover:scale-110 transition-transform">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <div className="font-bold text-white">24/7 Support Desk</div>
                <div className="text-[11px] text-slate-400">Speak with hospital support</div>
              </div>
            </Link>
          </div>

          <div className="pt-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-white font-bold text-xs shadow-xl shadow-cyan-950 transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Take Me Back Home</span>
            </Link>
          </div>

        </div>
      </main>

      {/* Subtle Bottom Bar */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-white/5 z-10">
        TRINAYORA Error Diagnostic Protocol • HTTP 404
      </footer>
    </div>
  );
}
