"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  HeartPulse, ArrowLeft, Mail, Phone, MapPin, Clock, 
  Send, CheckCircle2, AlertCircle, Building, Stethoscope, 
  ShieldCheck, Loader2, Sparkles, MessageSquare
} from "lucide-react";
import Footer from "@/components/Footer";

export default function ContactPage() {
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "general",
    organization: "",
    message: "",
  });

  // Form Validation & Status State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = "Please enter your full name.";
    if (!formData.email.trim() || !formData.email.includes("@")) {
      errs.email = "Please enter a valid email address.";
    }
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      errs.message = "Message must be at least 10 characters.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    // Simulate instantaneous cloud transmission
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmitted(true);
      // Redirect to thank-you page after brief delay or offer immediate view
      setTimeout(() => {
        router.push("/thank-you?source=contact&name=" + encodeURIComponent(formData.name));
      }, 1500);
    } catch (err) {
      alert("Error sending message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
                SUPPORT & CONTACT
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-sky-50 via-white to-slate-50 py-16 px-6 border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold border border-sky-300">
            <Phone className="h-4 w-4 text-sky-600" />
            <span>24/7 Global Medical Identity & Hospital Helpdesk</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900">
            Get in Touch With Our Team
          </h1>
          <p className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Have questions about digital health ID cards, hospital EHR integration, doctor NMR verification, or emergency triage? We are here to support you 24/7/365.
          </p>
        </div>
      </section>

      {/* Main Grid: Contact Cards & Interactive Form */}
      <main className="max-w-6xl mx-auto px-6 py-12 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Direct Info Cards (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Emergency Hotline Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-rose-900 via-slate-900 to-slate-950 text-white shadow-xl space-y-4 border border-rose-500/30">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  <Phone className="h-6 w-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Emergency 24/7 Medical Triage</h3>
                  <p className="text-xs text-rose-300">For urgent hospital QR / RFID lookup assistance</p>
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Toll-Free (Americas):</span>
                  <a href="tel:+18007627843" className="font-mono text-white font-bold hover:text-rose-300">
                    +1 (800) 762-7843
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Asia-Pacific Toll-Free:</span>
                  <a href="tel:+9118007627843" className="font-mono text-white font-bold hover:text-rose-300">
                    1800-SMART-HEALTH
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Emergency Desk Email:</span>
                  <a href="mailto:emergency@smarthealth.id" className="font-mono text-rose-400 font-bold hover:underline">
                    emergency@smarthealth.id
                  </a>
                </div>
              </div>
            </div>

            {/* Department Emails Card */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Mail className="h-4 w-4 text-sky-600" />
                Department Inboxes
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between">
                  <div>
                    <div className="font-bold text-slate-900">Patient & Health ID Inquiries</div>
                    <div className="text-slate-500 text-[11px]">Card replacement, token renewal & records</div>
                  </div>
                  <a href="mailto:support@smarthealth.id" className="text-sky-600 font-bold font-mono hover:underline">
                    support@smarthealth.id
                  </a>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between">
                  <div>
                    <div className="font-bold text-slate-900">Hospital & Health Network Setup</div>
                    <div className="text-slate-500 text-[11px]">EMR / EHR API integration & hardware readers</div>
                  </div>
                  <a href="mailto:hospitals@smarthealth.id" className="text-sky-600 font-bold font-mono hover:underline">
                    hospitals@smarthealth.id
                  </a>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between">
                  <div>
                    <div className="font-bold text-slate-900">Doctor NMR Verification Desk</div>
                    <div className="text-slate-500 text-[11px]">Medical license validation & clinician onboarding</div>
                  </div>
                  <a href="mailto:clinicians@smarthealth.id" className="text-sky-600 font-bold font-mono hover:underline">
                    clinicians@smarthealth.id
                  </a>
                </div>
              </div>
            </div>

            {/* Physical Headquarters */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-600" />
                Global Innovation Hubs
              </h3>

              <div className="space-y-3 text-xs text-slate-600">
                <div>
                  <div className="font-bold text-slate-900">North America HQ</div>
                  <p>450 Healthtech Way, Suite 800, Silicon Valley, CA 94025, USA</p>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <div className="font-bold text-slate-900">Asia-Pacific Tech Center</div>
                  <p>88 Outer Ring Road, Tech Corridor, Bengaluru 560103, Karnataka, India</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Contact Form (7 Cols) */}
          <div className="lg:col-span-7">
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-md space-y-6">
              
              <div>
                <h2 className="text-xl font-bold text-slate-900">Send an Inquiry or Feedback</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Our clinical response team reviews all incoming inquiries within 2 hours.
                </p>
              </div>

              {submitted ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-300 text-center space-y-3 animate-in zoom-in-95 duration-300">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <h3 className="text-base font-bold text-emerald-900">Inquiry Received Successfully!</h3>
                  <p className="text-xs text-emerald-700 max-w-md mx-auto">
                    Thank you, <strong>{formData.name}</strong>. A confirmation ticket has been dispatched to <strong>{formData.email}</strong>. Redirecting you to the confirmation portal...
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs" noValidate>
                  
                  {/* Name and Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-700 block">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Dr. Emily Watson / John Doe"
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value });
                          if (errors.name) setErrors({ ...errors, name: "" });
                        }}
                        className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 text-slate-900 focus:bg-white focus:outline-none transition-all ${
                          errors.name ? "border-rose-500 ring-2 ring-rose-200" : "border-slate-300 focus:border-sky-500"
                        }`}
                      />
                      {errors.name && (
                        <p className="text-rose-600 text-[11px] flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> {errors.name}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-700 block">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="name@hospital.org or personal email"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          if (errors.email) setErrors({ ...errors, email: "" });
                        }}
                        className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 text-slate-900 focus:bg-white focus:outline-none transition-all ${
                          errors.email ? "border-rose-500 ring-2 ring-rose-200" : "border-slate-300 focus:border-sky-500"
                        }`}
                      />
                      {errors.email && (
                        <p className="text-rose-600 text-[11px] flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Phone and Inquiry Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-700 block">Phone Number (Optional)</label>
                      <input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:bg-white focus:border-sky-500 focus:outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-700 block">Inquiry Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:bg-white focus:border-sky-500 focus:outline-none transition-all"
                      >
                        <option value="general">General Inquiry</option>
                        <option value="patient_card">Patient Health ID & Card Help</option>
                        <option value="doctor_nmr">Clinician NMR Verification</option>
                        <option value="hospital_onboard">Hospital EMR Network Onboarding</option>
                        <option value="security">Security & Privacy Audit</option>
                      </select>
                    </div>
                  </div>

                  {/* Organization / Hospital Name */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 block">
                      Hospital / Clinic / Organization (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Metro Health Network / City Medical Center"
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:bg-white focus:border-sky-500 focus:outline-none transition-all"
                    />
                  </div>

                  {/* Message Body */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 block">
                      Your Message / Details <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Describe your inquiry, request, or hospital network requirements..."
                      value={formData.message}
                      onChange={(e) => {
                        setFormData({ ...formData, message: e.target.value });
                        if (errors.message) setErrors({ ...errors, message: "" });
                      }}
                      className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 text-slate-900 focus:bg-white focus:outline-none transition-all resize-none ${
                        errors.message ? "border-rose-500 ring-2 ring-rose-200" : "border-slate-300 focus:border-sky-500"
                      }`}
                    />
                    {errors.message && (
                      <p className="text-rose-600 text-[11px] flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-600 via-blue-600 to-emerald-600 hover:from-sky-500 hover:to-emerald-500 text-white font-bold text-xs shadow-lg shadow-sky-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Transmitting Secure Dispatch...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Submit Secure Message</span>
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-center text-slate-400">
                    Protected by TRINAYORA 256-bit TLS transport encryption.
                  </p>
                </form>
              )}

            </div>
          </div>

        </div>
      </main>

      <Footer theme="light" />
    </div>
  );
}
