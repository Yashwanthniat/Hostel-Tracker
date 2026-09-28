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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Complaint Board</span>
      </Link>

      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Report a Hostel / Mess Issue
            </h1>
            <p className="text-xs text-slate-500">
              Submit your maintenance or dining grievance. An immutable audit record will be created.
            </p>
          </div>
        </div>

        {/* SLA Notice */}
        <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-center gap-2.5 text-xs text-indigo-900">
          <Clock className="w-4 h-4 text-indigo-600 flex-shrink-0" />
          <span>
            <strong>24-Hour Resolution SLA:</strong> Complaints not addressed within 24 hours are automatically escalated to the Warden.
          </span>
        </div>

        {/* Form */}
        <div className="pt-4 border-t border-slate-100">
          {loading ? (
            <div className="py-12 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
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
  );
};
