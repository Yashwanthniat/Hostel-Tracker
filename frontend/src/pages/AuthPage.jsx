import React from "react";
import { useLocation } from "react-router-dom";
import { AuthForm } from "../components/AuthForm";
import { ShieldCheck, Sparkles, Clock, AlertTriangle } from "lucide-react";

export const AuthPage = () => {
  const location = useLocation();
  const isSignup = location.pathname === "/signup";

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left Value Proposition Hero */}
        <div className="hidden md:flex flex-col space-y-6 pr-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold w-fit">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>AI Operations & Accountability</span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Fixing hostel issues with complete transparency.
          </h1>

          <p className="text-sm text-slate-600 leading-relaxed">
            Replace chaotic WhatsApp chats and verbal complaints. Track maintenance tickets from submission to resolution with automated 24-hour escalation and AI summaries.
          </p>

          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-sky-100 text-sky-700 flex-shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-slate-800">24-Hour Auto-Escalation</h2>
                <p className="text-xs text-slate-500">Unresolved complaints automatically advance to warden review.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700 flex-shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-slate-800">Gemini AI Triage & Digest</h2>
                <p className="text-xs text-slate-500">Automatic categorization and recurring hotspot detection.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 flex-shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-slate-800">Immutable Audit Trail</h2>
                <p className="text-xs text-slate-500">Every single status change is recorded with timestamps and notes.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Auth Form */}
        <div className="w-full">
          <AuthForm initialMode={isSignup ? "signup" : "login"} />
        </div>
      </div>
    </div>
  );
};
