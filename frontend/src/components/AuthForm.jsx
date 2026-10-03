import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, loginSchema } from "../schemas/zodSchemas";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, User, DoorOpen, ArrowRight, AlertCircle, Sparkles, Check, Shield } from "lucide-react";

export const AuthForm = ({ initialMode = "login" }) => {
  const [mode, setMode] = useState(initialMode);
  const [serverError, setServerError] = useState("");
  const [activeDemo, setActiveDemo] = useState(null);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const isSignup = mode === "signup";
  const activeSchema = isSignup ? signupSchema : loginSchema;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(activeSchema),
    defaultValues: {
      email: "",
      password: "",
      full_name: "",
      role: "student",
      room_number: "",
    },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data) => {
    setServerError("");
    try {
      if (isSignup) {
        await signup(data);
      } else {
        await login({ email: data.email, password: data.password });
      }
      navigate("/");
    } catch (err) {
      setServerError(err.message || "Authentication failed");
    }
  };

  // Quick Demo Simulation: explicitly populate form fields first, then authenticate
  const handleSelectDemoRole = async (demoEmail, roleKey) => {
    setActiveDemo(roleKey);
    setServerError("");
    // 1. Explicitly populate form fields
    setValue("email", demoEmail, { shouldValidate: true });
    setValue("password", "password123", { shouldValidate: true });

    // 2. Perform authenticated sign-in via demo handler
    try {
      await login({ email: demoEmail, password: "password123" });
      navigate("/");
    } catch (err) {
      setServerError(err.message || "Role simulation failed");
      setActiveDemo(null);
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto bg-white rounded-3xl p-7 sm:p-8 shadow-sm border border-slate-200/80 transition-all">
      {/* Title */}
      <div className="text-left mb-6">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider mb-2">
          <span>{isSignup ? "New Registration" : "Account Access"}</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          {isSignup ? "Create your account" : "Welcome back"}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {isSignup
            ? "Get transparent visibility into hostel repair tracking"
            : "Sign in to access your complaint board and resolution workflows"}
        </p>
      </div>

      {/* One-Click Role Simulation */}
      {!isSignup && (
        <div className="mb-6 p-3 bg-slate-50/80 border border-slate-200/70 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              One-Click Role Simulation
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Auto-Fill & Auth</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-200/50 rounded-xl">
            <button
              type="button"
              onClick={() => handleSelectDemoRole("student@hostelfix.edu", "student")}
              className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeDemo === "student"
                  ? "bg-white text-indigo-700 shadow-soft"
                  : "text-slate-700 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <span>🎓 Student</span>
            </button>
            <button
              type="button"
              onClick={() => handleSelectDemoRole("staff@hostelfix.edu", "staff")}
              className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeDemo === "staff"
                  ? "bg-white text-indigo-700 shadow-soft"
                  : "text-slate-700 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <span>🔧 Staff</span>
            </button>
            <button
              type="button"
              onClick={() => handleSelectDemoRole("admin@hostelfix.edu", "admin")}
              className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeDemo === "admin"
                  ? "bg-white text-indigo-700 shadow-soft"
                  : "text-slate-700 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              <span>🛡️ Warden</span>
            </button>
          </div>
        </div>
      )}

      {serverError && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-rose-50 border border-rose-200/80 rounded-2xl text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name for signup */}
        {isSignup && (
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Yashwanth"
                {...register("full_name")}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white font-medium transition-all"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            {errors.full_name && (
              <p className="mt-1 text-xs text-rose-600 font-medium">{errors.full_name.message}</p>
            )}
          </div>
        )}

        {/* Email */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              placeholder="e.g. student@hostelfix.edu"
              {...register("email")}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white font-medium transition-all"
            />
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-rose-600 font-medium">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
            Password
          </label>
          <div className="relative">
            <input
              type="password"
              placeholder="••••••••"
              {...register("password")}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white font-medium transition-all"
            />
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-rose-600 font-medium">{errors.password.message}</p>
          )}
        </div>

        {/* Role & Room selection for signup */}
        {isSignup && (
          <>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Select Your Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "student", label: "Student", icon: "🎓" },
                  { id: "staff", label: "Staff", icon: "🔧" },
                  { id: "admin", label: "Warden", icon: "🛡️" },
                ].map((r) => (
                  <label
                    key={r.id}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border cursor-pointer transition-all ${
                      selectedRole === r.id
                        ? "border-indigo-500 bg-indigo-50/70 text-indigo-900 font-bold shadow-2xs"
                        : "border-slate-200/80 bg-slate-50 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      value={r.id}
                      {...register("role")}
                      className="sr-only"
                    />
                    <span className="text-base mb-0.5">{r.icon}</span>
                    <span className="capitalize text-xs">{r.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {selectedRole === "student" && (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Room Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. B-204"
                    {...register("room_number")}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white font-medium transition-all"
                  />
                  <DoorOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            )}
          </>
        )}

        {/* RBAC Security Microcopy */}
        <div className="pt-0.5">
          <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            <span>Protected by role-based access control (RBAC).</span>
          </p>
        </div>

        {/* Submit with hover micro-animation */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="group w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-soft shadow-indigo-600/25 transition-all duration-200 disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? (
            <span>Processing...</span>
          ) : (
            <>
              <span>{isSignup ? "Create Account" : "Sign In to Dashboard"}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      {/* Switch between Login and Signup */}
      <div className="mt-6 pt-4 border-t border-slate-100 text-center">
        <button
          type="button"
          onClick={() => {
            setMode(isSignup ? "login" : "signup");
            setServerError("");
          }}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          {isSignup
            ? "Already have an account? Sign In"
            : "Don't have an account yet? Create one"}
        </button>
      </div>
    </div>
  );
};

