import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { 
  Bell, 
  Check, 
  Clock, 
  Flame, 
  AlertTriangle, 
  Sparkles, 
  CheckCheck,
  ChevronRight,
  Inbox
} from "lucide-react";

export const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const popoverRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const data = await api.notifications.list();
      const sorted = (data.notifications || []).sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setNotifications(sorted);
      setUnreadCount(data.unread_count || 0);
    } catch (err) {
      console.warn("Failed to fetch notifications:", err.message);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    const handleRefresh = () => fetchNotifications();
    window.addEventListener("notification-refresh", handleRefresh);
    window.addEventListener("focus", handleRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener("notification-refresh", handleRefresh);
      window.removeEventListener("focus", handleRefresh);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    try {
      await api.notifications.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications read:", err);
    }
  };

  const handleNotificationClick = async (n) => {
    setIsOpen(false);
    if (!n.is_read) {
      try {
        await api.notifications.markRead(n.id);
        setNotifications((prev) =>
          prev.map((item) => (item.id === n.id ? { ...item, is_read: true, read: true } : item))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch (err) {
        console.warn("Error marking read:", err);
      }
    }
    if (n.complaint_id) {
      navigate(`/complaints/${n.complaint_id}`);
    }
  };

  const formatRelativeTime = (isoString) => {
    if (!isoString) return "Just now";
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case "SLA_BREACH":
        return {
          label: "SLA Breach",
          icon: Flame,
          color: "text-rose-600 bg-rose-50 border-rose-200/80",
        };
      case "TICKET_DISPUTED":
        return {
          label: "Disputed",
          icon: AlertTriangle,
          color: "text-amber-700 bg-amber-50 border-amber-200/80",
        };
      case "COMPLAINT_REGISTERED":
        return {
          label: "Registered",
          icon: Check,
          color: "text-emerald-700 bg-emerald-50 border-emerald-200/80",
        };
      case "NEW_INCIDENT":
      case "NEW_COMPLAINT":
      default:
        return {
          label: "New Incident",
          icon: Sparkles,
          color: "text-indigo-600 bg-indigo-50 border-indigo-200/80",
        };
    }
  };

  const handleToggle = () => {
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all duration-150 cursor-pointer"
        title="Incident Notifications"
        aria-label="Incident Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-600 text-[9px] font-bold text-white shadow-xs animate-in zoom-in-50 duration-150">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Slide-down Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="p-3.5 px-4 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 tracking-tight">
                Incident Operations Alerts
              </span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-md bg-indigo-100 text-indigo-700 text-[10px] font-bold">
                  {unreadCount} unread
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Alert List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 text-xs">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-slate-400 space-y-1">
                <Inbox className="w-6 h-6 mx-auto text-slate-300 mb-1" />
                <p className="text-xs font-semibold text-slate-600">No active alerts</p>
                <p className="text-[11px] text-slate-400">All campus maintenance tickets compliant.</p>
              </div>
            ) : (
              notifications.map((n) => {
                const badge = getTypeBadge(n.type);
                const BadgeIcon = badge.icon;
                return (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`p-3.5 px-4 transition-all duration-150 cursor-pointer flex items-start gap-3 hover:bg-slate-50/90 ${
                      !n.is_read ? "bg-indigo-50/25 font-medium" : "text-slate-600"
                    }`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      <span className={`inline-flex p-1.5 rounded-lg border ${badge.color}`}>
                        <BadgeIcon className="w-3.5 h-3.5" />
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-slate-900 truncate text-[11px]">
                          {n.title}
                        </span>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {formatRelativeTime(n.created_at)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                    </div>

                    {!n.is_read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2 flex-shrink-0" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 px-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>24h Autonomous SLA Engine</span>
            <span className="font-mono text-[10px]">Real-Time Sync</span>
          </div>
        </div>
      )}
    </div>
  );
};
