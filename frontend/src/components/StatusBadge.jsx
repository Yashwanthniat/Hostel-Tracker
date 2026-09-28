import React from "react";
import { AlertTriangle, CheckCircle2, Clock, RotateCcw, Wrench } from "lucide-react";

export const StatusBadge = ({ status, escalationLevel = 0, size = "md" }) => {
  const getStatusConfig = () => {
    switch (status) {
      case "OPEN":
        return {
          label: "Open",
          bg: "bg-sky-50",
          text: "text-sky-700",
          border: "border-sky-200",
          icon: Clock,
        };
      case "IN_PROGRESS":
        return {
          label: "In Progress",
          bg: "bg-amber-50",
          text: "text-amber-700",
          border: "border-amber-200",
          icon: Wrench,
        };
      case "RESOLVED_PENDING":
        return {
          label: "Pending Verification",
          bg: "bg-indigo-50",
          text: "text-indigo-700",
          border: "border-indigo-200",
          icon: CheckCircle2,
        };
      case "CLOSED":
        return {
          label: "Closed & Resolved",
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          border: "border-emerald-200",
          icon: CheckCircle2,
        };
      case "REOPENED":
        return {
          label: "Reopened / Disputed",
          bg: "bg-rose-50",
          text: "text-rose-700",
          border: "border-rose-200",
          icon: RotateCcw,
        };
      default:
        return {
          label: status || "Unknown",
          bg: "bg-slate-50",
          text: "text-slate-700",
          border: "border-slate-200",
          icon: Clock,
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;
  const isEscalated = escalationLevel > 0;

  const sizeClasses = size === "sm"
    ? "px-2 py-0.5 text-xs gap-1"
    : "px-2.5 py-1 text-xs font-semibold gap-1.5";

  return (
    <div className="inline-flex items-center gap-1.5 flex-wrap">
      <span
        className={`inline-flex items-center rounded-full border ${sizeClasses} ${config.bg} ${config.text} ${config.border}`}
      >
        <Icon className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
        <span>{config.label}</span>
      </span>

      {isEscalated && (
        <span
          className={`inline-flex items-center rounded-full border border-rose-300 bg-rose-100 text-rose-800 font-bold ${sizeClasses} escalated-pulse`}
          title={`Complaint unresolved for >24h. Escalation Level ${escalationLevel}`}
        >
          <AlertTriangle className={size === "sm" ? "w-3 h-3 text-rose-600" : "w-3.5 h-3.5 text-rose-600"} />
          <span>Lvl {escalationLevel} Escalated</span>
        </span>
      )}
    </div>
  );
};
