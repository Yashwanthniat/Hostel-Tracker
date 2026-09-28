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
  User, 
  DoorOpen,
  ArrowRight,
  Image as ImageIcon
} from "lucide-react";

export const ComplaintCard = ({ complaint, onQuickAction }) => {
  const getCategoryIcon = (categoryName) => {
    switch (categoryName?.toLowerCase()) {
      case "electrical":
        return <Zap className="w-3.5 h-3.5 text-amber-500" />;
      case "plumbing":
        return <Droplet className="w-3.5 h-3.5 text-blue-500" />;
      case "mess":
        return <Utensils className="w-3.5 h-3.5 text-orange-500" />;
      case "cleaning":
        return <Sparkles className="w-3.5 h-3.5 text-teal-500" />;
      case "internet":
        return <Wifi className="w-3.5 h-3.5 text-purple-500" />;
      case "furniture":
        return <Armchair className="w-3.5 h-3.5 text-emerald-500" />;
      default:
        return <HelpCircle className="w-3.5 h-3.5 text-slate-500" />;
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

  return (
    <div
      className={`group relative bg-white rounded-2xl p-5 border transition-all duration-200 hover:shadow-lg ${
        isOverdue 
          ? "border-rose-300 ring-1 ring-rose-200/60" 
          : "border-slate-200/80 hover:border-slate-300"
      }`}
    >
      {/* Header Info */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold uppercase tracking-wider">
            {getCategoryIcon(complaint.category_name)}
            <span>{complaint.category_name || "General"}</span>
          </span>

          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100/70 text-slate-600 text-xs font-medium">
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
        <p className="text-sm font-medium text-slate-900 line-clamp-2 leading-relaxed mb-3">
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
            className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 bg-indigo-50/70 px-2 py-1 rounded-md"
          >
            <ImageIcon className="w-3 h-3" />
            <span>View Attachment</span>
          </a>
        </div>
      )}

      {/* Footer Info */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <User className="w-3 h-3 text-slate-400" />
            <span className="truncate max-w-[100px]">{complaint.student_name}</span>
          </span>
          <span className="inline-flex items-center gap-1 text-slate-400">
            <Clock className="w-3 h-3" />
            <span>{formatDate(complaint.created_at)}</span>
          </span>
        </div>

        <Link
          to={`/complaints/${complaint.id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-indigo-600 group-hover:translate-x-0.5 transition-all"
        >
          <span>Details</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
};
