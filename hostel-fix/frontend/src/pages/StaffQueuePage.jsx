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
  RotateCcw,
  Sparkles,
  Flame,
  Activity,
  Layers
} from "lucide-react";

export const StaffQueuePage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all_active"); // "all_active", "open", "in_progress", "disputed"
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

  const handleQuickStatus = async (complaintId, newStatus, defaultNote) => {
    setUpdatingId(complaintId);
    try {
      await api.complaints.updateStatus(complaintId, {
        new_status: newStatus,
        note: defaultNote,
      });
      await loadQueue();
    } catch (err) {
      alert(err.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  // Metrics for Technician Metric Strip
  const activeJobs = complaints.filter((c) =>
    ["OPEN", "IN_PROGRESS", "REOPENED"].includes(c.status)
  ).length;

  const overdueJobs = complaints.filter(
    (c) => ["OPEN", "IN_PROGRESS", "REOPENED"].includes(c.status) && c.escalation_level > 0
  ).length;

  const disputedJobs = complaints.filter((c) => c.status === "REOPENED").length;

  const activeComplaints = complaints.filter((c) => {
    if (activeTab === "open") return c.status === "OPEN";
    if (activeTab === "in_progress") return c.status === "IN_PROGRESS";
    if (activeTab === "disputed") return c.status === "REOPENED";
    return ["OPEN", "IN_PROGRESS", "REOPENED"].includes(c.status);
  });

  const getCategoryBadge = (name) => {
    switch (name?.toLowerCase()) {
      case "electrical":
        return { icon: "⚡", label: "Electrical", color: "bg-amber-50 text-amber-800 border-amber-200" };
      case "furniture":
        return { icon: "🪑", label: "Furniture", color: "bg-emerald-50 text-emerald-800 border-emerald-200" };
      case "mess":
        return { icon: "🧺", label: "Mess / Dining", color: "bg-orange-50 text-orange-800 border-orange-200" };
      case "laundry":
        return { icon: "🧺", label: "Laundry", color: "bg-orange-50 text-orange-800 border-orange-200" };
      case "plumbing":
        return { icon: "🚿", label: "Plumbing", color: "bg-sky-50 text-sky-800 border-sky-200" };
      case "internet":
        return { icon: "🌐", label: "Internet", color: "bg-purple-50 text-purple-800 border-purple-200" };
      case "cleaning":
        return { icon: "🧹", label: "Cleaning", color: "bg-teal-50 text-teal-800 border-teal-200" };
      default:
        return { icon: "🔧", label: name || "General", color: "bg-slate-50 text-slate-800 border-slate-200" };
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-slate-50 py-8 sm:py-10">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
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
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-sm transition-all duration-150 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-indigo-600" : ""}`} />
            <span>Refresh Queue</span>
          </button>
        </div>

        {/* 1. Technician Metric Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Active Jobs */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Active Jobs
              </span>
              <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{activeJobs}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Open pool & in-progress</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
          </div>

          {/* Overdue Escalations (>24h) */}
          <div className="bg-white p-5 rounded-2xl border border-rose-200/90 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block mb-1 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-rose-500" />
                Overdue Escalations (&gt;24h)
              </span>
              <p className="text-2xl font-extrabold text-rose-700 tracking-tight">{overdueJobs}</p>
              <p className="text-[11px] text-rose-600/80 mt-0.5">Breached 24h SLA target</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

          {/* Disputed Re-checks */}
          <div className="bg-white p-5 rounded-2xl border border-amber-200/90 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block mb-1 flex items-center gap-1">
                <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                Disputed Re-checks
              </span>
              <p className="text-2xl font-extrabold text-amber-800 tracking-tight">{disputedJobs}</p>
              <p className="text-[11px] text-amber-700/80 mt-0.5">Student rejected prior fix</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter Tabs Bar */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 rounded-2xl border border-slate-200/70 w-fit shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab("all_active")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-tight transition-all duration-150 cursor-pointer ${
              activeTab === "all_active"
                ? "bg-white text-indigo-700 shadow-sm font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
            }`}
          >
            All Active ({activeJobs})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("open")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-tight transition-all duration-150 cursor-pointer ${
              activeTab === "open"
                ? "bg-white text-indigo-700 shadow-sm font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
            }`}
          >
            Open for Pickup ({complaints.filter((c) => c.status === "OPEN").length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("in_progress")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-tight transition-all duration-150 cursor-pointer ${
              activeTab === "in_progress"
                ? "bg-white text-indigo-700 shadow-sm font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
            }`}
          >
            In Progress ({complaints.filter((c) => c.status === "IN_PROGRESS").length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("disputed")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-tight transition-all duration-150 cursor-pointer ${
              activeTab === "disputed"
                ? "bg-white text-amber-800 shadow-sm font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
            }`}
          >
            Disputed ({disputedJobs})
          </button>
        </div>

        {/* 2. Distinct Visual Cards */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-2">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent"></div>
            <p className="text-xs text-slate-500">Updating maintenance queue...</p>
          </div>
        ) : activeComplaints.length === 0 ? (
          <div className="p-14 text-center bg-white rounded-3xl border border-slate-200/80 shadow-sm">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h2 className="text-base font-bold text-slate-800">Queue is Clear</h2>
            <p className="text-xs text-slate-500 mt-1">No active maintenance tasks matching this filter.</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {activeComplaints.map((c) => {
              const isOverdue = c.escalation_level > 0;
              const isDisputed = c.status === "REOPENED";
              const isOpen = c.status === "OPEN";
              const isInProgress = c.status === "IN_PROGRESS";

              // Priority Border Logic:
              // border-l-4 border-l-rose-500 for Overdue
              // border-l-4 border-l-amber-500 for Disputed
              // border-l-4 border-l-indigo-500 for normal open
              let borderClass = "border-slate-200/80 hover:border-slate-300";
              if (isOverdue) {
                borderClass = "border-slate-200/80 border-l-4 border-l-rose-500 ring-1 ring-rose-100/60";
              } else if (isDisputed) {
                borderClass = "border-slate-200/80 border-l-4 border-l-amber-500 ring-1 ring-amber-100/60";
              } else {
                borderClass = "border-slate-200/80 border-l-4 border-l-indigo-400";
              }

              const catInfo = getCategoryBadge(c.category_name);

              return (
                <div
                  key={c.id}
                  className={`p-5 bg-white rounded-2xl border transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg ${borderClass}`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Complaint Core Info */}
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Category tag with matching icon prefix */}
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${catInfo.color}`}>
                          <span>{catInfo.icon}</span>
                          <span>{catInfo.label}</span>
                        </span>

                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100/80 text-slate-700 text-[11px] font-semibold border border-slate-200/50">
                          <DoorOpen className="w-3.5 h-3.5 text-slate-400" />
                          <span>Room {c.room_number || "N/A"}</span>
                        </span>

                        <StatusBadge status={c.status} escalationLevel={c.escalation_level} size="sm" />

                        <span className="text-[11px] text-slate-400">
                          Reported by <strong className="text-slate-700">{c.student_name}</strong>
                        </span>

                        {isOverdue && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-bold flex items-center gap-1">
                            <Flame className="w-3 h-3 text-rose-600" />
                            <span>Escalation Level {c.escalation_level}</span>
                          </span>
                        )}
                      </div>

                      <Link
                        to={`/complaints/${c.id}`}
                        className="block text-sm font-semibold text-slate-900 hover:text-indigo-600 transition-colors leading-relaxed"
                      >
                        {c.description}
                      </Link>
                    </div>

                    {/* Contextual CTA Buttons */}
                    <div className="flex items-center gap-2.5 flex-shrink-0 flex-wrap">
                      {isOpen && (
                        <button
                          type="button"
                          disabled={updatingId === c.id}
                          onClick={() => handleQuickStatus(c.id, "IN_PROGRESS", "Technician picked up task from queue")}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold shadow-soft shadow-indigo-600/20 transition-all cursor-pointer"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          <span>🔧 Pick Up Task</span>
                        </button>
                      )}

                      {isInProgress && (
                        <button
                          type="button"
                          disabled={updatingId === c.id}
                          onClick={() => handleQuickStatus(c.id, "RESOLVED_PENDING", "Technician completed work, submitted for student room verification")}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold shadow-soft shadow-emerald-600/20 transition-all cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>✅ Submit for Verification</span>
                        </button>
                      )}

                      {isDisputed && (
                        <button
                          type="button"
                          disabled={updatingId === c.id}
                          onClick={() => handleQuickStatus(c.id, "IN_PROGRESS", "Technician commenced urgent re-inspection of disputed repair")}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-bold shadow-soft shadow-amber-600/20 transition-all cursor-pointer"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>⚠️ Inspect Disputed Work</span>
                        </button>
                      )}

                      <Link
                        to={`/complaints/${c.id}`}
                        className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                      >
                        <span>Details & Audit</span>
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
