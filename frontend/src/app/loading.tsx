import React from "react";
import { HeartPulse, Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b0f19] text-white p-6 relative overflow-hidden">
      {/* Dynamic Background Glow */}
      <div className="absolute w-72 h-72 rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none animate-pulse" />
      
      {/* 3D Pulse Loading Core */}
      <div className="relative z-10 flex flex-col items-center space-y-4 text-center">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-emerald-400 p-3.5 text-white shadow-2xl glow-cyan flex items-center justify-center animate-bounce">
            <HeartPulse className="h-9 w-9 animate-pulse" />
          </div>
          <div className="absolute -inset-2 rounded-3xl border border-cyan-500/40 animate-ping opacity-30" />
        </div>

        <div className="space-y-1">
          <h2 className="text-base font-bold tracking-tight bg-gradient-to-r from-cyan-300 via-blue-400 to-emerald-300 bg-clip-text text-transparent">
            TRINAYORA CLINICAL CLOUD
          </h2>
          <p className="text-xs font-mono text-slate-400 flex items-center justify-center gap-1.5">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" />
            <span>Establishing Secure Cloud Pipeline...</span>
          </p>
        </div>

        <div className="w-48 h-1.5 rounded-full bg-slate-800 overflow-hidden mt-2">
          <div className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 rounded-full animate-[marquee-flow_2s_ease-in-out_infinite] w-2/3" />
        </div>
      </div>
    </div>
  );
}
