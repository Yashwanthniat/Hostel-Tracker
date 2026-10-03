import React, { useState, useEffect } from "react";
import { api } from "../lib/api";
import { Users, Shield, User, DoorOpen, Mail, Calendar, Check, AlertCircle, Sparkles } from "lucide-react";

export const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.auth.getAllUsers();
      setUsers(data || []);
    } catch (err) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingUserId(userId);
    setSuccessMessage("");
    try {
      await api.auth.updateUserRole(userId, newRole);
      setSuccessMessage(`Role updated to ${newRole}`);
      await loadUsers();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      alert(err.message || "Failed to update role");
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-slate-50 py-8 sm:py-10">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Hostel Directory & Role Governance
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 text-xs font-bold border border-indigo-200/70 shadow-2xs">
                Access Control
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl font-normal">
              Manage student registrations, technician authorizations, and administrative warden privileges.
            </p>
          </div>
        </div>

        {successMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-2xl text-xs text-emerald-800 flex items-center gap-2 shadow-sm">
            <Check className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200/80 rounded-2xl text-xs text-rose-700 shadow-sm">
            {error}
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-2">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent"></div>
              <p className="text-xs text-slate-500">Retrieving user roster...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3.5 font-semibold">User</th>
                    <th className="pb-3.5 font-semibold">Email</th>
                    <th className="pb-3.5 font-semibold">Room Number</th>
                    <th className="pb-3.5 font-semibold">Current Role</th>
                    <th className="pb-3.5 font-semibold text-right">Assign Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 font-bold text-slate-900 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                          {u.full_name?.charAt(0) || "U"}
                        </div>
                        <span>{u.full_name}</span>
                      </td>
                      <td className="py-3.5 text-slate-600">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {u.email}
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-700">
                        {u.room_number ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200/60">
                            <DoorOpen className="w-3 h-3 text-slate-400" />
                            {u.room_number}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">—</span>
                        )}
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize border shadow-2xs ${
                            u.role === "admin"
                              ? "bg-purple-50 text-purple-800 border-purple-200"
                              : u.role === "staff"
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : "bg-blue-50 text-blue-800 border-blue-200"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            u.role === "admin" ? "bg-purple-500" : u.role === "staff" ? "bg-amber-500" : "bg-blue-500"
                          }`} />
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <select
                          value={u.role}
                          disabled={updatingUserId === u.id}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="px-3 py-1.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer shadow-2xs"
                        >
                          <option value="student">Student</option>
                          <option value="staff">Staff</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

