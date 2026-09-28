import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { StatusBadge } from "../components/StatusBadge";
import { 
  Wrench, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  DoorOpen, 
  ArrowRight,
  Filter,
  RefreshCw,
  Send
} from "lucide-react";

export const StaffQueuePage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all_active"); // "all_active", "open", "in_progress"
  const [quickNote, setQuickNote] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const { user } = useAuth();

  const loadQueue = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.complaints.list();
      setComplaints(data || []);
    } catch (err) {
      setError(err.message || "Failed to load maintenance queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const handleQuickStatus = async (complaintId, newStatus, note) => {
    setUpdatingId(complaintId);
    try {
      await api.complaints.updateStatus(complaintId, {
        new_status: newStatus,
        note: note || (newStatus === "IN_PROGRESS" ? "Picked up by maintenance technician" : "Work completed, submitted for student verification"),
      });
      await loadQueue();
    } catch (err) {
      alert(err.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter complaints based on tab
  const activeComplaints = complaints.filter((c) => {
    if (activeTab === "open") return c.status === "OPEN" || c.status === "REOPENED";
    if (activeTab === "in_progress") return c.status === "IN_PROGRESS";
    return c.status === "OPEN" || c.status === "IN_PROGRESS" || c.status === "REOPENED";
  });

  const escalatedCount = complaints.filter(
    (c) => (c.status === "OPEN" || c.status === "IN_PROGRESS") && c.escalation_level > 0
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Maintenance Triage & Dispatch Queue
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
              Staff Operations
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pick up incoming complaints, update work status, and submit completed repairs for student verification.
          </p>
        </div>

        <button
          type="button"
          onClick={loadQueue}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-indigo-600" : ""}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Escalation Warning Banner */}
      {escalatedCount > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs text-rose-900">
          <div className="flex items-center gap-2.5 font-medium">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>
              <strong>Attention:</strong> {escalatedCount} ticket(s) in this queue are overdue (&gt;24h) and flagged for Warden escalation.
            </span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("all_active")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "all_active"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          All Active ({complaints.filter((c) => ["OPEN", "IN_PROGRESS", "REOPENED"].includes(c.status)).length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("open")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "open"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Open for Pickup ({complaints.filter((c) => ["OPEN", "REOPENED"].includes(c.status)).length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("in_progress")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "in_progress"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Currently In Progress ({complaints.filter((c) => c.status === "IN_PROGRESS").length})
        </button>
      </div>

      {/* Complaints List */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
        </div>
      ) : activeComplaints.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          <h2 className="text-base font-bold text-slate-800">Queue is Clear</h2>
          <p className="text-xs text-slate-500 mt-1">No active complaints matching the selected filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeComplaints.map((c) => {
            const isEscalated = c.escalation_level > 0;
            const isPickup = c.status === "OPEN" || c.status === "REOPENED";
            const isInProgress = c.status === "IN_PROGRESS";

            return (
              <div
                key={c.id}
                className={`p-5 bg-white rounded-3xl border transition-all ${
                  isEscalated
                    ? "border-rose-300 ring-1 ring-rose-100"
                    : "border-slate-200/80 hover:border-slate-300 shadow-sm"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Complaint Core Info */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider">
                        {c.category_name}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                        <DoorOpen className="w-3.5 h-3.5 text-slate-400" />
                        <span>Room {c.room_number || "N/A"}</span>
                      </span>
                      <StatusBadge status={c.status} escalationLevel={c.escalation_level} size="sm" />
                      <span className="text-[11px] text-slate-400">
                        Submitted by <strong className="text-slate-600">{c.student_name}</strong>
                      </span>
                    </div>

                    <Link
                      to={`/complaints/${c.id}`}
                      className="block text-sm font-semibold text-slate-900 hover:text-indigo-600 transition-colors"
                    >
                      {c.description}
                    </Link>
                  </div>

                  {/* Fast Action Buttons */}
                  <div className="flex items-center gap-2.5 flex-shrink-0 flex-wrap">
                    {isPickup && (
                      <button
                        type="button"
                        disabled={updatingId === c.id}
                        onClick={() => handleQuickStatus(c.id, "IN_PROGRESS")}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Pick Up Issue</span>
                      </button>
                    )}

                    {isInProgress && (
                      <button
                        type="button"
                        disabled={updatingId === c.id}
                        onClick={() => handleQuickStatus(c.id, "RESOLVED_PENDING")}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Resolved</span>
                      </button>
                    )}

                    <Link
                      to={`/complaints/${c.id}`}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                    >
                      <span>Audit & History</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
