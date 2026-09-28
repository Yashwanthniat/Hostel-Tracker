import React from "react";
import { useLocation } from "react-router-dom";
import { AuthForm } from "../components/AuthForm";
import { ShieldCheck, Sparkles, Clock, ArrowUpRight, CheckCircle2, Shield } from "lucide-react";

export const AuthPage = () => {
  const location = useLocation();
  const isSignup = location.pathname === "/signup";

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden bg-slate-50/60 bg-dot-grid">
      {/* Ambient background glow highlights */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Value Proposition Hero */}
        <div className="hidden md:flex md:col-span-6 lg:col-span-7 flex-col space-y-6 pr-2 lg:pr-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-indigo-200/60 text-indigo-700 text-xs font-semibold w-fit shadow-2xs backdrop-blur-md">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
            </span>
            <span className="tracking-tight">Campus Incident Operations · Automated SLA Enforcement</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              Zero-delay hostel resolution.{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 bg-clip-text text-transparent">
                Every issue tracked, escalated, and solved.
              </span>
            </h1>

            <p className="text-sm lg:text-base text-slate-600 leading-relaxed font-normal max-w-xl">
              Eliminate unstructured chat logs and undocumented complaints. An automated pipeline that prioritizes tickets, alerts wardens at 24h breach points, and guarantees audit trails.
            </p>
          </div>

          {/* Value Prop Feature Cards */}
          <div className="space-y-3 pt-2">
            {/* Card 1: 24-Hour SLA Trigger */}
            <div className="group relative p-3.5 rounded-2xl bg-white/70 hover:bg-white border border-slate-200/70 hover:border-slate-300 shadow-2xs hover:shadow-soft transition-all duration-200 flex items-start gap-3.5 backdrop-blur-sm">
              <div className="p-2.5 rounded-xl bg-indigo-50/80 border border-indigo-100/80 text-indigo-600 flex-shrink-0 group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-200">
                <Clock className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                  <span>24-Hour SLA Trigger</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 font-semibold border border-rose-200/60">
                    Auto-Escalate
                  </span>
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Deterministic 24h escalation guarantees unaddressed maintenance tickets reach warden-level oversight automatically.
                </p>
              </div>
            </div>

            {/* Card 2: AI-Assisted Triage */}
            <div className="group relative p-3.5 rounded-2xl bg-white/70 hover:bg-white border border-slate-200/70 hover:border-slate-300 shadow-2xs hover:shadow-soft transition-all duration-200 flex items-start gap-3.5 backdrop-blur-sm">
              <div className="p-2.5 rounded-xl bg-violet-50/80 border border-violet-100/80 text-violet-600 flex-shrink-0 group-hover:scale-105 group-hover:bg-violet-600 group-hover:text-white transition-all duration-200">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                  AI-Assisted Triage
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Extracts root cause, classifies urgency (Plumbing, Electrical, Mess), and flags recurring facility hotspots.
                </p>
              </div>
            </div>

            {/* Card 3: Immutable Audit Trail */}
            <div className="group relative p-3.5 rounded-2xl bg-white/70 hover:bg-white border border-slate-200/70 hover:border-slate-300 shadow-2xs hover:shadow-soft transition-all duration-200 flex items-start gap-3.5 backdrop-blur-sm">
              <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-100/80 text-emerald-600 flex-shrink-0 group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-200">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                  Immutable Audit Trail
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  End-to-end timeline transparency. Every assignment, status shift, and resolution note is verified.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Auth Form */}
        <div className="w-full md:col-span-6 lg:col-span-5">
          <AuthForm initialMode={isSignup ? "signup" : "login"} />
        </div>
      </div>
    </div>
  );
};

