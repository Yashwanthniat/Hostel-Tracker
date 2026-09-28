import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { User, Mail, DoorOpen, Shield, Check, AlertCircle, Save, Sparkles, Key } from "lucide-react";

export const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [roomNumber, setRoomNumber] = useState(user?.room_number || "");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");
    setError("");
    try {
      await api.auth.updateProfile({
        full_name: fullName,
        room_number: roomNumber || null,
      });
      await refreshUser();
      setMessage("Profile successfully updated");
      setTimeout(() => setMessage(""), 3500);
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-slate-50/60 bg-dot-grid py-12 px-4 sm:px-6">
      {/* Ambient background glow */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[520px] h-[320px] ambient-gradient-radial -z-10 pointer-events-none" />

      <div className="max-w-xl mx-auto space-y-6">
        {/* Main Card */}
        <div className="glass-panel rounded-3xl p-8 shadow-card border border-slate-200/80 relative overflow-hidden">
          {/* Subtle top accent bar */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-400" />

          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-6 border-b border-slate-100">
            <div className="relative group">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white flex items-center justify-center font-bold text-2xl shadow-soft shadow-indigo-600/30 ring-4 ring-white">
                {user?.full_name?.charAt(0) || "U"}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full ring-2 ring-white" title="Active Account" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight truncate">
                  {user?.full_name}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200/70 text-indigo-700 text-[11px] font-semibold uppercase tracking-wider">
                  <Shield className="w-3 h-3 text-indigo-600" />
                  {user?.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {user?.email}
              </p>
            </div>
          </div>

          {/* Toast Notification States */}
          {message && (
            <div className="mt-6 p-3.5 bg-emerald-50/90 border border-emerald-200/80 rounded-2xl text-xs text-emerald-800 flex items-center gap-2.5 shadow-sm animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 text-emerald-700" />
              </div>
              <span className="font-medium">{message}</span>
            </div>
          )}

          {error && (
            <div className="mt-6 p-3.5 bg-rose-50/90 border border-rose-200/80 rounded-2xl text-xs text-rose-800 flex items-center gap-2.5 shadow-sm animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <AlertCircle className="w-3.5 h-3.5 text-rose-700" />
              </div>
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Display Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Your full name"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Room / Unit Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="e.g. B-204"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                />
                <DoorOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                <span>Room is pre-filled automatically when lodging new maintenance tickets.</span>
              </p>
            </div>

            {/* Read-only system metadata */}
            <div className="p-3.5 bg-slate-50/60 rounded-2xl border border-slate-200/60 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span className="text-slate-400 text-[11px]">System Role</span>
                <span className="font-mono font-medium text-slate-700 capitalize">{user?.role}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span className="text-slate-400 text-[11px]">Authentication Provider</span>
                <span className="font-mono text-slate-500 text-[11px]">Local JWT / Supabase Auth</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="group relative w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-sm shadow-soft shadow-indigo-600/25 hover:shadow-glow transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span>{isSaving ? "Saving Changes..." : "Save Settings"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

