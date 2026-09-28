import React from "react";
import { Sparkles, RefreshCw, Flame, Lightbulb, AlertCircle, Clock } from "lucide-react";

export const AIWeeklySummaryCard = ({
  summary,
  isLoading = false,
  onRefresh,
}) => {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Gemini Operations Intelligence
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider border border-indigo-100">
                Weekly Digest
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Natural-language synthesis of 7-day complaint trends, bottlenecks, and repeat incidents.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 border border-slate-200 text-xs font-semibold text-slate-700 transition-all disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-indigo-600" : ""}`} />
          <span>{isLoading ? "Analyzing Data..." : "Regenerate Digest"}</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-sm font-semibold text-slate-700">
            Synthesizing weekly complaint telemetry with Gemini...
          </p>
          <p className="text-xs text-slate-500 max-w-sm">
            Evaluating category volume, resolution times, and hot rooms across the hostel.
          </p>
        </div>
      ) : !summary ? (
        <div className="py-12 text-center">
          <p className="text-sm text-slate-500">Click "Regenerate Digest" to generate this week's AI report.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {/* Executive Headline */}
          <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-1">
              Executive Overview
            </h3>
            <p className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              "{summary.headline}"
            </p>
          </div>

          {/* Grid: Top Issues & Hot Rooms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Issues */}
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/40 border border-amber-100">
              <div className="flex items-center gap-2 mb-3 text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Top Issue Drivers</h4>
              </div>
              <ul className="space-y-2 text-xs text-slate-700 font-medium">
                {summary.top_issues?.map((issue, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0"></span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Hot Rooms */}
            <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/40 border border-rose-100">
              <div className="flex items-center gap-2 mb-3 text-rose-800">
                <Flame className="w-4 h-4 text-rose-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Recurring Room Hotspots</h4>
              </div>
              {summary.hot_rooms?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {summary.hot_rooms.map((room, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-rose-100 border border-rose-200 text-rose-800 text-xs font-bold"
                    >
                      {room}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No rooms with abnormal complaint frequency this week.</p>
              )}
            </div>
          </div>

          {/* Resolution times */}
          {summary.avg_resolution_hours_by_category && (
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2 mb-3 text-slate-700">
                <Clock className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  Avg Resolution SLA (Hours)
                </h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {Object.entries(summary.avg_resolution_hours_by_category).map(([cat, hours]) => (
                  <div key={cat} className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                    <p className="text-slate-500 capitalize">{cat}</p>
                    <p className="text-base font-extrabold text-slate-900 mt-0.5">
                      {hours > 0 ? `${hours} hrs` : "N/A"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actionable Recommendation */}
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-start gap-3">
            <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg flex-shrink-0 mt-0.5">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-0.5">
                Warden Action Directive
              </h4>
              <p className="text-xs sm:text-sm text-emerald-950 font-medium leading-relaxed">
                {summary.recommendation}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
