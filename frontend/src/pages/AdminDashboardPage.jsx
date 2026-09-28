import React, { useState, useEffect } from "react";
import { api } from "../lib/api";
import { AIWeeklySummaryCard } from "../components/AIWeeklySummaryCard";
import { AnalyticsChart } from "../components/AnalyticsChart";
import { 
  LayoutDashboard, 
  Flame, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Play, 
  RefreshCw,
  DoorOpen,
  ArrowUpRight,
  TrendingUp,
  ShieldAlert
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

  const loadAiSummary = async () => {
    setAiLoading(true);
    try {
      const summary = await api.ai.getWeeklySummary();
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
      // Reload analytics overview to reflect new escalation levels
      const updatedOverview = await api.analytics.getOverview();
      setAnalytics(updatedOverview);
    } catch (err) {
      alert(err.message || "Escalation sweep failed");
    } finally {
      setSweepLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const totals = analytics?.totals || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Warden Administration & AI Analytics
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold">
              Admin Portal
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time hostel grievance intelligence, automated escalation triggers, and repeat complaint hotspots.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRunEscalationSweep}
            disabled={sweepLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all disabled:opacity-50 cursor-pointer"
            title="Force run 24-hour escalation engine sweep"
          >
            <Play className={`w-3.5 h-3.5 ${sweepLoading ? "animate-spin" : ""}`} />
            <span>{sweepLoading ? "Running Sweep..." : "Run Escalation Sweep"}</span>
          </button>

          <button
            type="button"
            onClick={loadDashboardData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 shadow-sm transition-all cursor-pointer"
            title="Refresh Analytics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* Sweep Result Banner */}
      {sweepResult && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              <strong>Sweep Completed:</strong> Checked {sweepResult.evaluated} active complaints.{" "}
              {sweepResult.escalatedCount > 0
                ? `Auto-escalated ${sweepResult.escalatedCount} overdue complaint(s).`
                : "No new tickets exceeded the 24-hour SLA limit."}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSweepResult(null)}
            className="text-emerald-700 font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Total Tickets
          </span>
          <p className="text-2xl font-extrabold text-slate-900">{totals.total || 0}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 block mb-1">
            Open Queue
          </span>
          <p className="text-2xl font-extrabold text-sky-700">{totals.open || 0}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block mb-1">
            In Progress
          </span>
          <p className="text-2xl font-extrabold text-amber-700">{totals.inProgress || 0}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 block mb-1">
            Pending Review
          </span>
          <p className="text-2xl font-extrabold text-indigo-700">{totals.resolvedPending || 0}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block mb-1">
            Closed
          </span>
          <p className="text-2xl font-extrabold text-emerald-700">{totals.closed || 0}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 block mb-1 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-rose-500" />
            Escalation Rate
          </span>
          <p className="text-2xl font-extrabold text-rose-700">{totals.escalationRate || 0}%</p>
        </div>
      </div>

      {/* Gemini AI Weekly Summary Digest Card */}
      <AIWeeklySummaryCard
        summary={weeklySummary}
        isLoading={aiLoading}
        onRefresh={loadAiSummary}
      />

      {/* Visual Analytics Charts */}
      {analytics && <AnalyticsChart data={analytics} />}

      {/* Hot Rooms Section (3+ complaints in 30 days) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Hot Rooms & Repeat Grievance Hotspots
              </h2>
              <p className="text-xs text-slate-500">
                Rooms generating 3 or more complaints in the rolling 30-day monitoring window.
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-rose-50 text-rose-700 rounded-lg border border-rose-100">
            {analytics?.hotRooms?.length || 0} Hotspots Flagged
          </span>
        </div>

        {!analytics?.hotRooms || analytics.hotRooms.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
            🎉 Excellent! No rooms currently exceed the 3-complaint hotspot threshold.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Room Number</th>
                  <th className="pb-3 font-semibold">30-Day Complaint Count</th>
                  <th className="pb-3 font-semibold">Severity Rating</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analytics.hotRooms.map((room) => (
                  <tr key={room.room_number} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 font-bold text-slate-900 flex items-center gap-2">
                      <DoorOpen className="w-4 h-4 text-indigo-500" />
                      <span>Room {room.room_number}</span>
                    </td>
                    <td className="py-3">
                      <span className="font-extrabold text-rose-600">{room.complaint_count}</span> complaints
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
                        {room.complaint_count >= 5 ? "Critical Repeat" : "High Volume"}
                      </span>
                    </td>
                    <td className="py-3 text-right">
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
  );
};
