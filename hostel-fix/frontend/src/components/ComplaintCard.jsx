import React from "react";
import { Link } from "react-router-dom";
import { StatusBadge } from "./StatusBadge";
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
  Image as ImageIcon
} from "lucide-react";

export const ComplaintCard = ({ complaint }) => {
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
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffHours < 1) return "Just now";
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
      className={`group relative bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card cursor-pointer ${
        isOverdue 
          ? "border-rose-300/80 ring-1 ring-rose-200/50 shadow-xs" 
          : "border-slate-200/80 hover:border-slate-300/90 shadow-2xs"
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
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50/70 border border-indigo-100/80 px-2.5 py-1 rounded-xl transition-colors"
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
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 group-hover:translate-x-0.5 transition-all flex-shrink-0"
        >
          <span>Details</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
};

