import React from "react";
import { AlertTriangle, CheckCircle2, Clock, RotateCcw, Wrench } from "lucide-react";

export const StatusBadge = ({ status, escalationLevel = 0, size = "md" }) => {
  const getStatusConfig = () => {
    switch (status) {
      case "OPEN":
        return {
          label: "Open Queue",
          dotColor: "bg-sky-500",
          pillBg: "bg-sky-50/70 border-sky-200/70 text-sky-800",
          icon: Clock,
        };
      case "IN_PROGRESS":
        return {
          label: "In Progress",
          dotColor: "bg-amber-500",
          pillBg: "bg-amber-50/70 border-amber-200/70 text-amber-800",
          icon: Wrench,
        };
      case "RESOLVED_PENDING":
        return {
          label: "Pending Review",
          dotColor: "bg-indigo-500",
          pillBg: "bg-indigo-50/70 border-indigo-200/70 text-indigo-800",
          icon: CheckCircle2,
        };
      case "CLOSED":
        return {
          label: "Resolved",
          dotColor: "bg-emerald-500",
          pillBg: "bg-emerald-50/70 border-emerald-200/70 text-emerald-800",
          icon: CheckCircle2,
        };
      case "REOPENED":
        return {
          label: "Disputed",
          dotColor: "bg-rose-500",
          pillBg: "bg-rose-50/70 border-rose-200/70 text-rose-800",
          icon: RotateCcw,
        };
      default:
        return {
          label: status || "Unknown",
          dotColor: "bg-slate-400",
          pillBg: "bg-slate-50 border-slate-200 text-slate-700",
          icon: Clock,
        };
    }
  };

  const config = getStatusConfig();
  const isEscalated = escalationLevel > 0;

  const isSmall = size === "sm";

  return (
    <div className="inline-flex items-center gap-1.5 flex-wrap">
      <span
        className={`inline-flex items-center rounded-full border font-medium tracking-tight shadow-2xs transition-all ${
          isSmall ? "px-2 py-0.5 text-[11px] gap-1.5" : "px-2.5 py-1 text-xs gap-1.5"
        } ${config.pillBg}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor} flex-shrink-0`} />
        <span>{config.label}</span>
      </span>

      {isEscalated && (
        <span
          className={`inline-flex items-center rounded-full border border-rose-200/90 bg-rose-50 text-rose-800 font-semibold tracking-tight shadow-xs ${
            isSmall ? "px-2 py-0.5 text-[11px] gap-1" : "px-2.5 py-1 text-xs gap-1.5"
          }`}
          title={`Complaint unresolved for >24h. Escalation Level ${escalationLevel}`}
        >
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
          </span>
          <span className="font-bold">Lvl {escalationLevel} Overdue</span>
        </span>
      )}
    </div>
  );
};

