import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ComplaintForm } from "../components/ComplaintForm";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck, Sparkles, ArrowLeft, Clock } from "lucide-react";
import { Link } from "react-router-dom";

export const ReportComplaintPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.complaints
      .getCategories()
      .then((data) => setCategories(data || []))
      .catch((err) => console.error("Failed to load categories:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSuccess = (newComplaint) => {
    if (newComplaint?.id) {
      navigate(`/complaints/${newComplaint.id}`);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-slate-50 py-8 sm:py-12">
      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 space-y-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Complaint Board</span>
        </Link>

        {/* Card Header & Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-soft shadow-indigo-600/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Report a Hostel / Mess Issue
              </h1>
              <p className="text-xs text-slate-500">
                Submit maintenance issues with instant AI categorization & 24h SLA escalation.
              </p>
            </div>
          </div>

          {/* SLA Notice */}
          <div className="p-3 bg-indigo-50/70 border border-indigo-200/70 rounded-2xl flex items-center gap-2.5 text-xs text-indigo-900 shadow-2xs">
            <span className="relative flex h-2 w-2 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
            </span>
            <span className="leading-relaxed">
              <strong>Automated 24-Hour SLA:</strong> Tickets remaining unresolved beyond 24 hours are autonomously escalated to Warden oversight.
            </span>
          </div>

          {/* Form */}
          <div className="pt-2 border-t border-slate-100">
            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center space-y-2">
                <div className="h-7 w-7 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent"></div>
                <p className="text-xs text-slate-500">Loading categories...</p>
              </div>
            ) : (
              <ComplaintForm
                initialRoomNumber={user?.room_number || ""}
                categories={categories}
                onSubmitSuccess={handleSuccess}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

