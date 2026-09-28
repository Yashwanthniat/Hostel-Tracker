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
  Send,
  Sparkles
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

  const activeComplaints = complaints.filter((c) => {
    if (activeTab === "open") return c.status === "OPEN" || c.status === "REOPENED";
    if (activeTab === "in_progress") return c.status === "IN_PROGRESS";
    return c.status === "OPEN" || c.status === "IN_PROGRESS" || c.status === "REOPENED";
  });

  const escalatedCount = complaints.filter(
    (c) => (c.status === "OPEN" || c.status === "IN_PROGRESS") && c.escalation_level > 0
  ).length;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-slate-50/50 bg-dot-grid py-8 sm:py-10">
      <div className="ambient-gradient-radial absolute inset-0 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Maintenance Triage Queue
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200/70 shadow-2xs">
                Technician Portal
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl font-normal">
              Pick up assigned complaints, advance repair states, and submit completed work for student verification.
            </p>
          </div>

          <button
            type="button"
            onClick={loadQueue}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/90 hover:bg-white border border-slate-200/90 text-slate-700 text-xs font-semibold shadow-2xs hover:shadow-soft transition-all duration-150 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-indigo-600" : ""}`} />
            <span>Refresh Queue</span>
          </button>
        </div>

        {/* Escalation Warning Banner */}
        {escalatedCount > 0 && (
          <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200/80 flex items-center justify-between text-xs text-rose-900 shadow-2xs">
            <div className="flex items-center gap-2.5 font-medium">
              <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
              </span>
              <span>
                <strong>SLA Alert:</strong> {escalatedCount} ticket(s) in this queue are overdue (&gt;24h) and flagged with Warden escalation pulse warnings.
              </span>
            </div>
          </div>
        )}

        {/* Segmented Tabs Bar */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 rounded-2xl border border-slate-200/70 w-fit shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab("all_active")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-tight transition-all duration-150 cursor-pointer ${
              activeTab === "all_active"
                ? "bg-white text-indigo-700 shadow-soft font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
            }`}
          >
            All Active ({complaints.filter((c) => ["OPEN", "IN_PROGRESS", "REOPENED"].includes(c.status)).length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("open")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-tight transition-all duration-150 cursor-pointer ${
              activeTab === "open"
                ? "bg-white text-indigo-700 shadow-soft font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
            }`}
          >
            Open for Pickup ({complaints.filter((c) => ["OPEN", "REOPENED"].includes(c.status)).length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("in_progress")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-tight transition-all duration-150 cursor-pointer ${
              activeTab === "in_progress"
                ? "bg-white text-indigo-700 shadow-soft font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
            }`}
          >
            In Progress ({complaints.filter((c) => c.status === "IN_PROGRESS").length})
          </button>
        </div>

        {/* Complaints List */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-2">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent"></div>
            <p className="text-xs text-slate-500">Updating maintenance queue...</p>
          </div>
        ) : activeComplaints.length === 0 ? (
          <div className="p-14 text-center bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-2xs">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h2 className="text-base font-bold text-slate-800">Queue is Clear</h2>
            <p className="text-xs text-slate-500 mt-1">No active complaints matching the selected filter.</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {activeComplaints.map((c) => {
              const isEscalated = c.escalation_level > 0;
              const isPickup = c.status === "OPEN" || c.status === "REOPENED";
              const isInProgress = c.status === "IN_PROGRESS";

              return (
                <div
                  key={c.id}
                  className={`p-5 bg-white/90 backdrop-blur-sm rounded-3xl border transition-all duration-150 ${
                    isEscalated
                      ? "border-rose-300/80 ring-1 ring-rose-100 shadow-xs"
                      : "border-slate-200/80 hover:border-slate-300/90 shadow-2xs hover:shadow-soft"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Complaint Core Info */}
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[11px] font-bold uppercase tracking-wider border border-slate-200/60">
                          {c.category_name}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100/80 text-slate-700 text-[11px] font-semibold border border-slate-200/50">
                          <DoorOpen className="w-3.5 h-3.5 text-slate-400" />
                          <span>Room {c.room_number || "N/A"}</span>
                        </span>
                        <StatusBadge status={c.status} escalationLevel={c.escalation_level} size="sm" />
                        <span className="text-[11px] text-slate-400">
                          Submitted by <strong className="text-slate-700">{c.student_name}</strong>
                        </span>
                      </div>

                      <Link
                        to={`/complaints/${c.id}`}
                        className="block text-sm font-semibold text-slate-900 hover:text-indigo-600 transition-colors leading-relaxed"
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
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-bold shadow-soft shadow-amber-600/20 transition-all cursor-pointer"
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
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold shadow-soft shadow-indigo-600/20 transition-all cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Resolved</span>
                        </button>
                      )}

                      <Link
                        to={`/complaints/${c.id}`}
                        className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-slate-100/80 hover:bg-slate-200/70 text-slate-700 text-xs font-semibold transition-colors"
                      >
                        <span>Audit Log</span>
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
    </div>
  );
};

