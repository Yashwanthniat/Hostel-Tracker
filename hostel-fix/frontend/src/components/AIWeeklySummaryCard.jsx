import React, { useState, useEffect } from "react";
import { Sparkles, RefreshCw, Flame, Lightbulb, AlertCircle, Clock, CheckCircle2, ShieldAlert } from "lucide-react";

export const AIWeeklySummaryCard = ({
  summary,
  isLoading = false,
  onRefresh,
}) => {
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleTriggerRefresh = () => {
    if (cooldown > 0 || isLoading) return;
    setCooldown(30); // 30-second cooldown
    if (onRefresh) onRefresh();
  };

  return (
    <div className="relative overflow-hidden bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm text-slate-900 transition-all">
      {/* Top subtle AI glow gradient line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 text-white flex items-center justify-center shadow-soft shadow-indigo-600/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Gemini Operations Intelligence
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider border border-indigo-200/60 shadow-2xs">
                Weekly Digest
              </span>
              {summary?.cached && (
                <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[9px] font-mono border border-slate-200">
                  Cached
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Natural-language synthesis of 7-day complaint trends, bottlenecks, and repeat incidents.
            </p>
          </div>
        </div>

        {/* Action Button with Cooldown Timer */}
        <button
          type="button"
          onClick={handleTriggerRefresh}
          disabled={isLoading || cooldown > 0}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200/80 text-xs font-semibold text-slate-700 transition-all disabled:opacity-60 cursor-pointer shadow-2xs"
          title={cooldown > 0 ? `Please wait ${cooldown}s before regenerating` : "Regenerate AI analysis"}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-indigo-600" : ""}`} />
          <span>
            {isLoading
              ? "Synthesizing Telemetry..."
              : cooldown > 0
              ? `Cooldown (${cooldown}s)`
              : "Regenerate Analysis"}
          </span>
        </button>
      </div>

      {/* Interactive Skeleton Loader during AI synthesis */}
      {isLoading ? (
        <div className="mt-6 space-y-5 animate-pulse">
          {/* Skeleton Executive Banner */}
          <div className="p-5 rounded-2xl bg-slate-100/80 border border-slate-200/60 space-y-2">
            <div className="h-3 w-32 bg-slate-200 rounded-md" />
            <div className="h-5 w-4/5 bg-slate-300 rounded-md" />
          </div>

          {/* Skeleton 2-column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-3">
              <div className="h-3 w-28 bg-slate-200 rounded" />
              <div className="space-y-2">
                <div className="h-3 w-full bg-slate-200 rounded" />
                <div className="h-3 w-3/4 bg-slate-200 rounded" />
                <div className="h-3 w-5/6 bg-slate-200 rounded" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-3">
              <div className="h-3 w-32 bg-slate-200 rounded" />
              <div className="flex gap-2">
                <div className="h-6 w-16 bg-slate-200 rounded-lg" />
                <div className="h-6 w-20 bg-slate-200 rounded-lg" />
                <div className="h-6 w-16 bg-slate-200 rounded-lg" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 py-2 text-slate-400 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
            <span>Correlating telemetry, SLA turnaround benchmarks, and campus room clusters...</span>
          </div>
        </div>
      ) : !summary ? (
        <div className="py-14 text-center">
          <p className="text-sm text-slate-500">Click "Regenerate Analysis" to generate this week's AI operations report.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {/* Executive Headline */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-50/80 to-violet-50/60 border border-indigo-100 shadow-2xs">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 mb-1">
              Executive Synthesis Headline
            </h3>
            <p className="text-base sm:text-lg font-bold text-slate-900 leading-snug tracking-tight">
              "{summary.headline}"
            </p>
          </div>

          {/* Grid: Top Issues & Hot Rooms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Issues */}
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/40 border border-amber-100 shadow-2xs">
              <div className="flex items-center gap-2 mb-3 text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <h4 className="text-[10px] font-bold uppercase tracking-wider">Top Incident Drivers</h4>
              </div>
              <ul className="space-y-2 text-xs text-slate-700 font-medium">
                {summary.top_issues?.length > 0 ? (
                  summary.top_issues.map((issue, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0"></span>
                      <span>{issue}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-400 italic">No recurring issues flagged this week.</li>
                )}
              </ul>
            </div>

            {/* Hot Rooms */}
            <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/40 border border-rose-100 shadow-2xs">
              <div className="flex items-center gap-2 mb-3 text-rose-900">
                <Flame className="w-4 h-4 text-rose-600" />
                <h4 className="text-[10px] font-bold uppercase tracking-wider">Recurring Room Hotspots</h4>
              </div>
              {summary.hot_rooms?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {summary.hot_rooms.map((room, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-xl bg-white border border-rose-200 text-rose-800 text-xs font-bold shadow-2xs"
                    >
                      Room {room}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No rooms with anomalous complaint clustering this week.</p>
              )}
            </div>
          </div>

          {/* Resolution times */}
          {summary.avg_resolution_hours_by_category && (
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 shadow-2xs">
              <div className="flex items-center gap-2 mb-3 text-slate-700">
                <Clock className="w-4 h-4 text-indigo-600" />
                <h4 className="text-[10px] font-bold uppercase tracking-wider">
                  Category Mean Resolution SLA (Hours)
                </h4>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5 text-center">
                {Object.entries(summary.avg_resolution_hours_by_category).map(([cat, hours]) => (
                  <div key={cat} className="p-2.5 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                      {cat}
                    </span>
                    <span className="text-sm font-extrabold text-slate-900 mt-1 block">
                      {hours > 0 ? `${hours}h` : "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actionable Directive Recommendation */}
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 shadow-2xs flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 flex-shrink-0 mt-0.5">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 mb-0.5">
                Warden Action Directive
              </h4>
              <p className="text-xs sm:text-sm font-semibold text-emerald-950 leading-relaxed">
                {summary.recommendation}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
