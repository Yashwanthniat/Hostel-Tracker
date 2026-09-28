import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  ShieldCheck, 
  PlusCircle, 
  LayoutDashboard, 
  Users, 
  Wrench, 
  LogOut, 
  Kanban,
  Sparkles
} from "lucide-react";

export const Navbar = () => {
  const { user, isAuthenticated, logout, isStudent, isStaff, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/75 backdrop-blur-xl border-b border-slate-200/70 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-soft shadow-indigo-500/20 ring-1 ring-white/30 group-hover:scale-105 transition-all duration-200">
            <ShieldCheck className="w-5 h-5 text-white" />
            <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 tracking-tight">Hostel Fix</span>
              <span className="px-1.5 py-0.5 rounded-full bg-indigo-50/80 text-indigo-700 text-[10px] font-semibold tracking-wider border border-indigo-200/50 uppercase">
                SLA Tracker
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium leading-none">Campus Incident Operations · SLA Enforced</p>
          </div>
        </Link>

        {/* Navigation Links */}
        {isAuthenticated && (
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60 shadow-2xs">
            <Link
              to="/"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold tracking-tight transition-all duration-150 ${
                isActive("/")
                  ? "bg-white text-indigo-600 shadow-soft font-bold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Complaint Board</span>
            </Link>

            {isStudent && (
              <Link
                to="/report"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold tracking-tight transition-all duration-150 ${
                  isActive("/report")
                    ? "bg-white text-indigo-600 shadow-soft font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Report Issue</span>
              </Link>
            )}

            {(isStaff || isAdmin) && (
              <Link
                to="/staff/queue"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold tracking-tight transition-all duration-150 ${
                  isActive("/staff/queue")
                    ? "bg-white text-indigo-600 shadow-soft font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Maintenance Queue</span>
              </Link>
            )}

            {isAdmin && (
              <>
                <Link
                  to="/admin/dashboard"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold tracking-tight transition-all duration-150 ${
                    isActive("/admin/dashboard")
                      ? "bg-white text-indigo-600 shadow-soft font-bold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Warden Analytics</span>
                </Link>

                <Link
                  to="/admin/users"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold tracking-tight transition-all duration-150 ${
                    isActive("/admin/users")
                      ? "bg-white text-indigo-600 shadow-soft font-bold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Users</span>
                </Link>
              </>
            )}
          </nav>
        )}

        {/* User profile & Auth Controls */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-2.5">
              {/* Profile Pill */}
              <Link
                to="/profile"
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl bg-white/70 hover:bg-white border border-slate-200/80 shadow-2xs hover:shadow-soft transition-all duration-150"
              >
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {user?.full_name?.charAt(0) || "U"}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-slate-800 leading-tight">
                    {user?.full_name?.split(" ")[0]}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-indigo-600 capitalize">
                      {user?.role}
                    </span>
                    {user?.room_number && (
                      <span className="text-[10px] text-slate-400 font-medium">
                        • {user.room_number}
                      </span>
                    )}
                  </div>
                </div>
              </Link>

              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50/80 rounded-xl transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-100/70 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-soft shadow-indigo-600/20 transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

