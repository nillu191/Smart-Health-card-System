"use client";

import React, { Suspense } from "react";
import PatientViewPage from "../patient-view/page";

export default function ScanPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-cyan-400 p-8">Loading Scanner...</div>}>
      <PatientViewPage />
    </Suspense>
  );
}
