import React from "react";
import { Clock, ShieldCheck, User, ArrowRight, FileText, AlertTriangle } from "lucide-react";
import { StatusBadge } from "./StatusBadge";

export const AuditTrail = ({ logs = [] }) => {
  if (!logs || logs.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-400 bg-slate-50/70 border border-slate-200/70 rounded-2xl">
        No status audit entries recorded yet.
      </div>
    );
  }

  const formatTimestamp = (ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200/80">
      {logs.map((log, index) => {
        const isAutoEscalation = log.note?.includes("[AUTO-ESCALATION]");
        const isStudentDispute = log.new_status === "REOPENED";

        return (
          <div key={log.id || index} className="relative group">
            {/* Timeline Dot Indicator */}
            <div
              className={`absolute -left-6 top-2 w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs flex items-center justify-center ${
                isAutoEscalation
                  ? "bg-rose-600 ring-2 ring-rose-200"
                  : isStudentDispute
                  ? "bg-amber-600 ring-2 ring-amber-200"
                  : log.new_status === "CLOSED"
                  ? "bg-emerald-600 ring-2 ring-emerald-200"
                  : "bg-indigo-600 ring-2 ring-indigo-200"
              }`}
            />

            {/* Audit Entry Card */}
            <div
              className={`p-4 rounded-2xl border transition-all duration-150 ${
                isAutoEscalation
                  ? "bg-rose-50/60 border-rose-200/90 shadow-2xs"
                  : isStudentDispute
                  ? "bg-amber-50/50 border-amber-200/90 shadow-2xs"
                  : "bg-white/90 border-slate-200/80 hover:border-slate-300 shadow-2xs"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                {/* Transition Header */}
                <div className="flex items-center gap-2 flex-wrap">
                  {log.old_status !== "NONE" ? (
                    <>
                      <StatusBadge status={log.old_status} size="sm" />
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      <StatusBadge status={log.new_status} size="sm" />
                    </>
                  ) : (
                    <StatusBadge status={log.new_status} size="sm" />
                  )}
                </div>

                {/* Timestamp */}
                <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{formatTimestamp(log.timestamp)}</span>
                </div>
              </div>

              {/* Note / Remarks */}
              {log.note && (
                <div className="text-xs text-slate-700 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 flex items-start gap-2 my-2 font-normal leading-relaxed">
                  <FileText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>{log.note}</span>
                </div>
              )}

              {/* Actor attribution */}
              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-700">
                    {log.changer_name?.charAt(0) || "U"}
                  </div>
                  <span className="font-semibold text-slate-800">{log.changer_name || "System"}</span>
                  <span className="capitalize px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold border border-slate-200/60">
                    {log.changer_role || "system"}
                  </span>
                </div>

                {isAutoEscalation && (
                  <span className="text-rose-600 font-bold flex items-center gap-1 text-[11px]">
                    <AlertTriangle className="w-3 h-3 text-rose-500" />
                    Autonomous Escalation Sweep
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

