import React, { useState } from "react";
import { Link } from "react-router-dom";
import { StatusBadge } from "./StatusBadge";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { 
  Zap, 
  Droplet, 
  Utensils, 
  Sparkles, 
  Wifi, 
  Armchair, 
  HelpCircle,
  Clock, 
  DoorOpen,
  ArrowRight,
  Image as ImageIcon,
  Wrench,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";

export const ComplaintCard = ({ complaint, onRefresh }) => {
  const { isAdmin } = useAuth();
  const [isSupervising, setIsSupervising] = useState(false);

  const handleQuickReassign = async () => {
    try {
      const users = await api.auth.getAllUsers();
      const staffMembers = (users || []).filter((u) => u.role === "staff");
      if (staffMembers.length === 0) {
        alert("No technician accounts found in database.");
        return;
      }
      const optionsText = staffMembers
        .map((s, idx) => `${idx + 1}. ${s.name || s.full_name} (${s.assigned_unit || "Operations"})`)
        .join("\n");
      const choice = window.prompt(
        `Select Technician to Reassign:\n${optionsText}\n\nEnter number (1-${staffMembers.length}):`,
        "1"
      );
      if (!choice) return;
      const selected = staffMembers[parseInt(choice, 10) - 1];
      if (!selected) {
        alert("Invalid selection number.");
        return;
      }
      const note = window.prompt(
        "Supervisory Note for Reassignment:",
        "Warden reallocated ticket for expedited technical handling."
      );
      if (note === null) return;
      setIsSupervising(true);
      await api.complaints.reassign(complaint.id, {
        staff_id: selected.id,
        note: note.trim() || undefined,
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message || "Reassignment failed");
    } finally {
      setIsSupervising(false);
    }
  };

  const handleQuickOverridePriority = async () => {
    try {
      const choice = window.prompt(
        "Override Escalation Priority:\n1: Standard (Level 1)\n2: High Escalation (Level 2)\n3: Critical Emergency (Level 3)\n\nEnter 1, 2, or 3:",
        "2"
      );
      if (!choice) return;
      const level = parseInt(choice, 10);
      if (![1, 2, 3].includes(level)) {
        alert("Invalid level. Choose 1, 2, or 3.");
        return;
      }
      const note = window.prompt(
        "Supervisory Note for Priority Override:",
        `Warden elevated escalation to Level ${level}.`
      );
      if (note === null) return;
      setIsSupervising(true);
      await api.complaints.overridePriority(complaint.id, {
        escalation_level: level,
        note: note.trim() || undefined,
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message || "Priority override failed");
    } finally {
      setIsSupervising(false);
    }
  };

  const handleQuickForceClose = async () => {
    try {
      const reason = window.prompt(
        "Enter administrative closure remarks (min 5 characters):",
        "Warden administrative resolution verified on-site."
      );
      if (reason === null) return;
      const note = reason.trim();
      if (note.length < 5) {
        alert("Please provide at least 5 characters for administrative remarks.");
        return;
      }
      setIsSupervising(true);
      await api.complaints.forceClose(complaint.id, { note });
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message || "Force closure failed");
    } finally {
      setIsSupervising(false);
    }
  };
  const getCategoryConfig = (categoryName) => {
    switch (categoryName?.toLowerCase()) {
      case "electrical":
        return {
          icon: Zap,
          bg: "bg-amber-50 text-amber-800 border-amber-200/60",
          iconColor: "text-amber-500",
        };
      case "plumbing":
        return {
          icon: Droplet,
          bg: "bg-sky-50 text-sky-800 border-sky-200/60",
          iconColor: "text-sky-500",
        };
      case "mess":
        return {
          icon: Utensils,
          bg: "bg-orange-50 text-orange-800 border-orange-200/60",
          iconColor: "text-orange-500",
        };
      case "cleaning":
        return {
          icon: Sparkles,
          bg: "bg-teal-50 text-teal-800 border-teal-200/60",
          iconColor: "text-teal-500",
        };
      case "internet":
        return {
          icon: Wifi,
          bg: "bg-purple-50 text-purple-800 border-purple-200/60",
          iconColor: "text-purple-500",
        };
      case "furniture":
        return {
          icon: Armchair,
          bg: "bg-emerald-50 text-emerald-800 border-emerald-200/60",
          iconColor: "text-emerald-500",
        };
      default:
        return {
          icon: HelpCircle,
          bg: "bg-slate-50 text-slate-700 border-slate-200/60",
          iconColor: "text-slate-400",
        };
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const isOverdue = complaint.escalation_level > 0;
  const catConfig = getCategoryConfig(complaint.category_name);
  const CatIcon = catConfig.icon;

  const studentInitial = complaint.student_name ? complaint.student_name.trim().charAt(0).toUpperCase() : "S";

  return (
    <div
      className={`group relative bg-white rounded-2xl overflow-hidden p-4 sm:p-5 border transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-slate-300 cursor-pointer ${
        isOverdue 
          ? "border-rose-200 border-l-4 border-l-rose-500 ring-1 ring-rose-100/60 shadow-sm" 
          : "border-slate-200/80 shadow-sm"
      }`}
    >
      {/* Header Info */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Category Pill */}
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold tracking-tight ${catConfig.bg}`}>
            <CatIcon className={`w-3 h-3 ${catConfig.iconColor}`} />
            <span className="capitalize">{complaint.category_name || "General"}</span>
          </span>

          {/* Room Pill */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100/80 text-slate-600 text-[11px] font-medium border border-slate-200/50">
            <DoorOpen className="w-3 h-3 text-slate-400" />
            <span>Room {complaint.room_number || "N/A"}</span>
          </span>
        </div>

        <StatusBadge 
          status={complaint.status} 
          escalationLevel={complaint.escalation_level} 
          createdAt={complaint.created_at}
          size="sm" 
        />
      </div>

      {/* Description */}
      <Link to={`/complaints/${complaint.id}`} className="block group-hover:text-indigo-600 transition-colors">
        <p className="text-sm font-semibold text-slate-800 line-clamp-2 leading-relaxed mb-3">
          {complaint.description}
        </p>
      </Link>

      {/* Optional Photo Attachment Indicator */}
      {complaint.photo_url && (
        <div className="mb-3">
          <a
            href={complaint.photo_url}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50/70 border border-indigo-100/80 px-2.5 py-1 rounded-xl transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-2xs active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-indigo-500"
          >
            <ImageIcon className="w-3 h-3" />
            <span>View Attachment Evidence</span>
          </a>
        </div>
      )}

      {/* Footer Info */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center text-[10px] font-bold shadow-2xs flex-shrink-0">
              {studentInitial}
            </div>
            <span className="truncate max-w-[110px] font-medium text-slate-700 text-[11px]">
              {complaint.student_name}
            </span>
          </div>

          <span className="text-slate-300">•</span>

          <span className="inline-flex items-center gap-1 text-slate-400 text-[11px]">
            <Clock className="w-3 h-3 text-slate-300" />
            <span>{formatDate(complaint.created_at)}</span>
          </span>
        </div>

        <Link
          to={`/complaints/${complaint.id}`}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-indigo-500 rounded px-1 py-0.5 flex-shrink-0"
        >
          <span>Details</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-150" />
        </Link>
      </div>

      {/* Warden Supervisory Action Bar */}
      {isAdmin && (
        <div 
          className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1 text-[11px]" 
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Warden:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              disabled={isSupervising}
              onClick={(e) => {
                e.preventDefault();
                handleQuickReassign();
              }}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-semibold border border-indigo-200/60 transition-colors disabled:opacity-50 cursor-pointer"
              title="Reassign Technician"
            >
              <Wrench className="w-3 h-3 text-indigo-500" />
              <span>Reassign</span>
            </button>

            <button
              type="button"
              disabled={isSupervising}
              onClick={(e) => {
                e.preventDefault();
                handleQuickOverridePriority();
              }}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-semibold border border-amber-200/60 transition-colors disabled:opacity-50 cursor-pointer"
              title="Override Priority"
            >
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              <span>Priority</span>
            </button>

            {complaint.status !== "CLOSED" && (
              <button
                type="button"
                disabled={isSupervising}
                onClick={(e) => {
                  e.preventDefault();
                  handleQuickForceClose();
                }}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-semibold border border-rose-200/60 transition-colors disabled:opacity-50 cursor-pointer"
                title="Force Close with Note"
              >
                <CheckCircle2 className="w-3 h-3 text-rose-600" />
                <span>Force Close</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

