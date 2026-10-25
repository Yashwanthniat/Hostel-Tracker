import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, loginSchema } from "../schemas/zodSchemas";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Lock,
  Mail,
  User,
  DoorOpen,
  ArrowRight,
  AlertCircle,
  Shield,
  Eye,
  EyeOff,
  CheckCircle2,
  KeyRound,
  X,
  Loader2,
} from "lucide-react";

const DEMO_ACCOUNTS = [
  {
    role: "student",
    label: "Student",
    icon: "🎓",
    email: "student@hostelfix.edu",
    password: "password123",
  },
  {
    role: "staff",
    label: "Staff",
    icon: "🔧",
    email: "staff@hostelfix.edu",
    password: "password123",
  },
  {
    role: "admin",
    label: "Warden",
    icon: "🛡️",
    email: "admin@hostelfix.edu",
    password: "password123",
  },
];

export const AuthForm = ({ initialMode = "login" }) => {
  const [mode, setMode] = useState(initialMode);
  const [serverError, setServerError] = useState("");
  const [prefilledRole, setPrefilledRole] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const isSignup = mode === "signup";
  const activeSchema = isSignup ? signupSchema : loginSchema;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    clearErrors,
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

  // Pure credential pre-fill helper: NEVER automatically authenticates or redirects
  const handlePrefillCredentials = (account) => {
    setServerError("");
    setPrefilledRole(account);

    // Strictly populate form fields only
    setValue("email", account.email, { shouldValidate: true, shouldDirty: true });
    setValue("password", account.password, { shouldValidate: true, shouldDirty: true });
    clearErrors(["email", "password"]);
  };

  const onSubmit = async (data) => {
    setServerError("");
    try {
      if (isSignup) {
        await signup({
          email: data.email.trim().toLowerCase(),
          password: data.password,
          full_name: data.full_name.trim(),
          role: data.role,
          room_number: data.role === "student" ? data.room_number?.trim() : null,
        });
      } else {
        // Strict dispatch to backend POST /api/auth/login
        await login({
          email: data.email.trim().toLowerCase(),
          password: data.password,
        });
      }
      navigate("/");
    } catch (err) {
      setServerError(
        err.message || "Authentication failed. Please verify your credentials and try again."
      );
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl border border-slate-200/90 shadow-sm p-7 sm:p-9 transition-all">
      {/* Header with Google / Vercel minimalist style */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium tracking-tight mb-3">
          <KeyRound className="w-3 h-3 text-slate-500" />
          <span>Credential Authentication</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          {isSignup ? "Create an account" : "Sign in to Hostel Fix"}
        </h2>
        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
          {isSignup
            ? "Enter your academic credentials to register on the platform"
            : "Enter your verified credentials to access your complaint board"}
        </p>
      </div>

      {/* Role Credential Helpers (Pure Fill Form - No Auto Login) */}
      {!isSignup && (
        <div className="mb-6 p-3.5 bg-slate-50/90 border border-slate-200/80 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
              <span>Select an account to pre-fill test credentials</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Fill only</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {DEMO_ACCOUNTS.map((acc) => {
              const isSelected = prefilledRole?.role === acc.role;
              return (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handlePrefillCredentials(acc)}
                  className={`py-2 px-2 rounded-lg text-xs font-medium transition-all text-center cursor-pointer border ${
                    isSelected
                      ? "bg-white border-slate-400 text-slate-900 shadow-xs"
                      : "bg-white/60 border-slate-200/90 text-slate-600 hover:bg-white hover:text-slate-900 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 font-semibold">
                    <span>{acc.icon}</span>
                    <span>{acc.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Crisp Error Banner (Google/Vercel Style) */}
      {serverError && (
        <div
          role="alert"
          className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start justify-between gap-2.5 animate-in fade-in duration-150"
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold text-rose-900">Authentication Failed</p>
              <p className="text-rose-700 leading-relaxed">{serverError}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setServerError("")}
            className="text-rose-500 hover:text-rose-700 p-0.5 rounded cursor-pointer transition-colors"
            aria-label="Dismiss error"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Authentication Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Full Name (Sign Up Only) */}
        {isSignup && (
          <div>
            <label
              htmlFor="full_name"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Full Name
            </label>
            <div className="relative">
              <input
                id="full_name"
                type="text"
                placeholder="e.g. Yashwanth"
                {...register("full_name")}
                className={`w-full pl-9 pr-3.5 py-2.5 bg-white border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 placeholder:text-slate-400 font-normal ${
                  errors.full_name
                    ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500"
                    : "border-slate-300 focus:ring-slate-900/10 focus:border-slate-900"
                }`}
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {errors.full_name && (
              <p className="mt-1 text-xs text-rose-600 font-medium">{errors.full_name.message}</p>
            )}
          </div>
        )}

        {/* Email Address */}
        <div>
          <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1">
            Email Address
          </label>
          <div className="relative">
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="e.g. student@hostelfix.edu"
              {...register("email")}
              className={`w-full pl-9 pr-3.5 py-2.5 bg-white border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 placeholder:text-slate-400 font-normal ${
                errors.email
                  ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500"
                  : "border-slate-300 focus:ring-slate-900/10 focus:border-slate-900"
              }`}
            />
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-rose-600 font-medium">{errors.email.message}</p>
          )}
        </div>

        {/* Password with Eye Toggle */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="password" className="block text-xs font-semibold text-slate-700">
              Password
            </label>
            {!isSignup && (
              <span className="text-[11px] text-slate-400">Default demo: password123</span>
            )}
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete={isSignup ? "new-password" : "current-password"}
              placeholder="••••••••"
              {...register("password")}
              className={`w-full pl-9 pr-10 py-2.5 bg-white border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 placeholder:text-slate-400 font-normal ${
                errors.password
                  ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500"
                  : "border-slate-300 focus:ring-slate-900/10 focus:border-slate-900"
              }`}
            />
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-rose-600 font-medium">{errors.password.message}</p>
          )}
        </div>

        {/* Role & Room Selection (Sign Up Only) */}
        {isSignup && (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Designated Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "student", label: "Student", icon: "🎓" },
                  { id: "staff", label: "Staff", icon: "🔧" },
                  { id: "admin", label: "Warden", icon: "🛡️" },
                ].map((r) => (
                  <label
                    key={r.id}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-lg border cursor-pointer transition-all ${
                      selectedRole === r.id
                        ? "border-slate-900 bg-slate-900 text-white font-semibold shadow-xs"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      value={r.id}
                      {...register("role")}
                      className="sr-only"
                    />
                    <span className="text-sm mb-0.5">{r.icon}</span>
                    <span className="text-xs">{r.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {selectedRole === "student" && (
              <div>
                <label
                  htmlFor="room_number"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Hostel Room Number
                </label>
                <div className="relative">
                  <input
                    id="room_number"
                    type="text"
                    placeholder="e.g. B-204"
                    {...register("room_number")}
                    className={`w-full pl-9 pr-3.5 py-2.5 bg-white border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 placeholder:text-slate-400 font-normal ${
                      errors.room_number
                        ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500"
                        : "border-slate-300 focus:ring-slate-900/10 focus:border-slate-900"
                    }`}
                  />
                  <DoorOpen className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {errors.room_number && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">
                    {errors.room_number.message}
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {/* Security Policy Microcopy */}
        <div className="pt-1">
          <p className="text-[11px] text-slate-400 flex items-center gap-1.5 font-normal">
            <Shield className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span>Strict RBAC: Tokens issued only upon valid server verification.</span>
          </p>
        </div>

        {/* Submit Button (Vercel / Google style) */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-2 py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 active:bg-black text-white font-medium text-sm transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Verifying credentials...</span>
            </>
          ) : (
            <>
              <span>{isSignup ? "Create Account" : "Sign In to Dashboard"}</span>
              <ArrowRight className="w-4 h-4" />
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
            setPrefilledRole(null);
          }}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          {isSignup
            ? "Already have an account? Sign in"
            : "Need an account? Register new user"}
        </button>
      </div>
    </div>
  );
};
