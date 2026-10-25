import React, { useState, useEffect } from "react";
import { api } from "../lib/api";
import { AIWeeklySummaryCard } from "../components/AIWeeklySummaryCard";
import { AnalyticsChart } from "../components/AnalyticsChart";
import { 
  Flame, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  RefreshCw,
  DoorOpen,
  ArrowUpRight,
  FileSpreadsheet,
  FileCode,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";

export const AdminDashboardPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [weeklySummary, setWeeklySummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [sweepLoading, setSweepLoading] = useState(false);
  const [sweepResult, setSweepResult] = useState(null);
  const [error, setError] = useState("");

  const loadDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const overview = await api.analytics.getOverview();
      setAnalytics(overview);

      // Load AI summary
      loadAiSummary();
    } catch (err) {
      setError(err.message || "Failed to load admin analytics");
    } finally {
      setLoading(false);
    }
  };

  const loadAiSummary = async (force = false) => {
    setAiLoading(true);
    try {
      const summary = await api.ai.getWeeklySummary(force);
      setWeeklySummary(summary);
    } catch (err) {
      console.error("AI summary error:", err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleRunEscalationSweep = async () => {
    setSweepLoading(true);
    setSweepResult(null);
    try {
      const res = await api.escalate.runSweep(24);
      setSweepResult(res);
      const updatedOverview = await api.analytics.getOverview();
      setAnalytics(updatedOverview);
    } catch (err) {
      alert(err.message || "Escalation sweep failed");
    } finally {
      setSweepLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const complaints = await api.complaints.list();
      if (!complaints || complaints.length === 0) {
        alert("No complaints available to export.");
        return;
      }

      const headers = [
        "Complaint ID",
        "Category",
        "Room Number",
        "Student Name",
        "Assigned Technician",
        "Status",
        "Escalation Level",
        "Created At",
        "Resolved At",
        "SLA Compliant"
      ];

      const rows = complaints.map((c) => {
        const isSlaBreached = c.escalation_level > 0;
        return [
          `"${c.id}"`,
          `"${c.category_name || "General"}"`,
          `"${c.room_number || "Unspecified"}"`,
          `"${c.student_name || "Anonymous"}"`,
          `"${c.assigned_staff_name || "Unassigned"}"`,
          `"${c.status}"`,
          c.escalation_level || 0,
          `"${c.created_at || ""}"`,
          `"${c.resolved_at || "Open"}"`,
          `"${isSlaBreached ? "NO (Breached)" : "YES (Compliant)"}"`
        ];
      });

      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `hostelfix_sla_compliance_audit_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert(err.message || "CSV Export failed");
    }
  };

  const handleExportJSON = async () => {
    try {
      const complaints = await api.complaints.list();
      const exportData = {
        exportDate: new Date().toISOString(),
        totalRecorded: complaints.length,
        analyticsSummary: analytics?.totals || {},
        complaints: complaints || [],
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `hostelfix_telemetry_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      alert(err.message || "JSON Export failed");
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const totals = analytics?.totals || {};
  const categorySlaDetails = analytics?.categorySlaDetails || {};

  const ALL_CATEGORIES = [
    { key: "electrical", label: "Electrical", icon: "⚡" },
    { key: "plumbing", label: "Plumbing", icon: "🚿" },
    { key: "cleaning", label: "Cleaning", icon: "🧹" },
    { key: "furniture", label: "Furniture", icon: "🪑" },
    { key: "laundry", label: "Laundry", icon: "🧺" },
    { key: "internet", label: "Internet", icon: "🌐" },
    { key: "mess", label: "Mess / Food", icon: "🍽️" },
    { key: "other", label: "General", icon: "🔧" },
  ];

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-slate-50 py-8 sm:py-10">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Module 3: Header & Clean Action Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Hostel Operations & Executive Analytics
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 text-xs font-bold border border-indigo-200/70 shadow-2xs">
                Executive Overview
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl font-normal">
              Autonomous SLA telemetry, grievance resolution rates, and campus facility audit controls.
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={handleRunEscalationSweep}
              disabled={sweepLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-900 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-900 text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              title="Execute autonomous background 24-hour SLA audit"
            >
              <Zap className={`w-3.5 h-3.5 text-amber-500 ${sweepLoading ? "animate-spin" : ""}`} />
              <span>{sweepLoading ? "Auditing Campus..." : "⚡ Trigger Campus Maintenance Audit"}</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer shadow-2xs"
              title="Export SLA compliance audit in CSV format"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export CSV Report</span>
            </button>

            <button
              type="button"
              onClick={handleExportJSON}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer shadow-2xs"
              title="Export SLA telemetry in JSON format"
            >
              <FileCode className="w-3.5 h-3.5 text-indigo-600" />
              <span>Export JSON</span>
            </button>

            <button
              type="button"
              onClick={loadDashboardData}
              disabled={loading}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 shadow-2xs transition-all cursor-pointer"
              title="Refresh Dashboard"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-indigo-600" : ""}`} />
            </button>
          </div>
        </div>

        {/* Audit Confirmation Toast Banner */}
        {sweepResult && (
          <div className="p-4 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex items-center justify-between text-xs text-emerald-900 shadow-sm animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                <strong>Campus Maintenance Audit Completed:</strong> Evaluated {sweepResult.evaluated} active tickets.{" "}
                {sweepResult.escalatedCount > 0
                  ? `Escalated ${sweepResult.escalatedCount} overdue ticket(s) breaching 24h SLA.`
                  : "All active campus grievances are compliant with 24h resolution targets."}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSweepResult(null)}
              className="text-emerald-700 font-bold hover:underline ml-4 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Executive KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Total Recorded
            </span>
            <p className="text-2xl font-bold text-slate-900 tracking-tight">{totals.total || 0}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-600 block mb-1">
              Open Pool
            </span>
            <p className="text-2xl font-bold text-sky-700 tracking-tight">{totals.open || 0}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 block mb-1">
              In Progress
            </span>
            <p className="text-2xl font-bold text-amber-700 tracking-tight">{totals.inProgress || 0}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 block mb-1">
              Student Review
            </span>
            <p className="text-2xl font-bold text-indigo-700 tracking-tight">{totals.resolvedPending || 0}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 block mb-1">
              Closed & Verified
            </span>
            <p className="text-2xl font-bold text-emerald-700 tracking-tight">{totals.closed || 0}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-rose-200/80 shadow-sm">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-600 block mb-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-rose-500" />
              SLA Breach Rate
            </span>
            <p className="text-2xl font-bold text-rose-700 tracking-tight">{totals.escalationRate || 0}%</p>
          </div>
        </div>

        {/* Gemini AI Operations Intelligence Digest Card */}
        <AIWeeklySummaryCard
          summary={weeklySummary}
          isLoading={aiLoading}
          onRefresh={() => loadAiSummary(true)}
        />

        {/* Module 3: Category Mean Resolution SLA (Rolling 30 Days) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-2xs">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Category Mean Resolution SLA (Rolling 30 Days)
                </h2>
                <p className="text-xs text-slate-500">
                  Turnaround telemetry calculated strictly for completed repairs in the past 30 days.
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200/60 shadow-2xs">
              Target SLA: &lt; 24h
            </span>
          </div>

          {/* Category SLA Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {ALL_CATEGORIES.map((cat) => {
              const slaInfo = categorySlaDetails[cat.key] || {
                hasCompleted: false,
                meanHours: null,
                openCount: 0,
                statusPill: "No Active Tickets",
                subtext: "Queue clear",
              };

              return (
                <div
                  key={cat.key}
                  className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl transition-all duration-150 hover:bg-white hover:shadow-xs space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 capitalize flex items-center gap-1.5">
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      30d SLA
                    </span>
                  </div>

                  <div>
                    {slaInfo.hasCompleted ? (
                      <div className="space-y-1">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-2xl font-extrabold text-slate-900">
                            {slaInfo.meanHours}h
                          </span>
                          <span className="text-[11px] font-semibold text-emerald-600">
                            mean
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {slaInfo.subtext}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="pt-0.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 text-[11px] font-bold shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            <span>{slaInfo.openCount > 0 ? "Active (Awaiting Fix)" : "No Active Tickets"}</span>
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {slaInfo.openCount > 0 ? `${slaInfo.openCount} open in queue` : "0 in queue"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Visual Analytics Charts */}
        {analytics && <AnalyticsChart data={analytics} />}

        {/* Hot Rooms Section (3+ complaints in 30 days) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shadow-2xs">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Hot Rooms & Repeat Issue Hotspots
                </h2>
                <p className="text-xs text-slate-500">
                  Rooms generating 3 or more complaints in the rolling 30-day monitoring window.
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-rose-50 text-rose-700 rounded-xl border border-rose-200/60 shadow-2xs">
              {analytics?.hotRooms?.length || 0} Hotspots Flagged
            </span>
          </div>

          {!analytics?.hotRooms || analytics.hotRooms.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-slate-50/70 border border-dashed border-slate-200 rounded-2xl">
              🎉 Excellent! No hostel rooms currently exceed the 3-complaint repeat threshold.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Room Number</th>
                    <th className="pb-3 font-semibold">30-Day Complaint Count</th>
                    <th className="pb-3 font-semibold">Severity Rating</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {analytics.hotRooms.map((room) => (
                    <tr key={room.room_number} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 font-bold text-slate-900 flex items-center gap-2">
                        <DoorOpen className="w-4 h-4 text-indigo-500" />
                        <span>Room {room.room_number}</span>
                      </td>
                      <td className="py-3.5">
                        <span className="font-extrabold text-rose-600">{room.complaint_count}</span> complaints
                      </td>
                      <td className="py-3.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-800 font-bold text-[10px]">
                          {room.complaint_count >= 5 ? "Critical Repeat" : "High Volume"}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <Link
                          to={`/?search=${encodeURIComponent(room.room_number)}`}
                          className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800"
                        >
                          <span>Inspect Room Tickets</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
