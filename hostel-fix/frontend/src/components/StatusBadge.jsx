import React from "react";
import { AlertTriangle, CheckCircle2, Clock, RotateCcw, Wrench } from "lucide-react";

export const StatusBadge = ({ status, escalationLevel = 0, createdAt = null, size = "md" }) => {
  const getStatusConfig = () => {
    switch (status) {
      case "OPEN":
        return {
          label: "Open Queue",
          dotColor: "bg-amber-400",
          pillBg: "bg-amber-50/90 border-amber-200/80 text-amber-800",
          icon: Clock,
        };
      case "IN_PROGRESS":
        return {
          label: "In Progress",
          dotColor: "bg-blue-400",
          pillBg: "bg-blue-50/90 border-blue-200/80 text-blue-800",
          icon: Wrench,
        };
      case "RESOLVED_PENDING":
        return {
          label: "Pending Review",
          dotColor: "bg-indigo-400",
          pillBg: "bg-indigo-50/90 border-indigo-200/80 text-indigo-800",
          icon: CheckCircle2,
        };
      case "CLOSED":
        return {
          label: "Resolved",
          dotColor: "bg-emerald-400",
          pillBg: "bg-emerald-50/90 border-emerald-200/80 text-emerald-800",
          icon: CheckCircle2,
        };
      case "REOPENED":
        return {
          label: "Disputed",
          dotColor: "bg-rose-400",
          pillBg: "bg-rose-50/90 border-rose-200/80 text-rose-800",
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

  // Calculate elapsed time beyond the 24-hour SLA deadline
  const getBreachWindow = () => {
    if (!createdAt) {
      const fallbackHours = Math.max(1, escalationLevel * 12);
      if (fallbackHours >= 24) {
        return `Overdue by ${Math.floor(fallbackHours / 24)}d`;
      }
      return `Overdue by ${fallbackHours}h`;
    }

    const createdTime = new Date(createdAt).getTime();
    const elapsedHours = (Date.now() - createdTime) / (1000 * 60 * 60);
    const breachHours = Math.max(1, Math.floor(elapsedHours - 24));

    if (breachHours >= 24) {
      const breachDays = Math.floor(breachHours / 24);
      return `Overdue by ${breachDays}d`;
    }
    return `Overdue by ${breachHours}h`;
  };

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
          className={`inline-flex items-center rounded-full border border-rose-200 bg-rose-50 text-rose-700 font-semibold tracking-tight shadow-xs transition-all ${
            isSmall ? "px-2 py-0.5 text-[11px] gap-1.5" : "px-2.5 py-1 text-xs gap-1.5"
          }`}
          title="24h SLA breached. Priority escalation active."
        >
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
          </span>
          <span className="font-bold">{getBreachWindow()}</span>
        </span>
      )}
    </div>
  );
};

