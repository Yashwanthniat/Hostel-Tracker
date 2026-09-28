import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShieldAlert } from "lucide-react";

export const RoleGuard = ({ children, allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return (
      <div className="mx-auto max-w-lg mt-16 p-8 bg-white rounded-2xl shadow-card border border-rose-100 text-center">
        <div className="mx-auto w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
        <p className="mt-2 text-slate-600 text-sm">
          This section is strictly reserved for{" "}
          <span className="font-semibold text-slate-800 capitalize">
            {allowedRoles.join(" or ")}
          </span>{" "}
          roles. Your current role is{" "}
          <span className="font-semibold text-rose-600 capitalize">{user?.role}</span>.
        </p>
      </div>
    );
  }

  return children;
};
