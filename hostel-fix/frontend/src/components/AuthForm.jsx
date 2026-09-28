import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, loginSchema } from "../schemas/zodSchemas";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, User, DoorOpen, Shield, ArrowRight, AlertCircle, Sparkles } from "lucide-react";

export const AuthForm = ({ initialMode = "login" }) => {
  const [mode, setMode] = useState(initialMode);
  const [serverError, setServerError] = useState("");
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

  // Quick Demo Login helper
  const handleDemoLogin = async (demoEmail) => {
    setServerError("");
    try {
      await login({ email: demoEmail, password: "password123" });
      navigate("/");
    } catch (err) {
      setServerError(err.message || "Demo login failed");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl p-8 shadow-xl border border-slate-200/80">
      {/* Title */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {isSignup ? "Create an Account" : "Welcome Back"}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {isSignup
            ? "Sign up to track hostel complaints with transparent accountability"
            : "Sign in to access your complaint board and resolution workflows"}
        </p>
      </div>

      {/* Demo Account Quick Switcher */}
      {!isSignup && (
        <div className="mb-6 p-3 bg-slate-50 border border-slate-200/70 rounded-2xl">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-500" />
            Quick Demo Accounts (One-Click Sign In)
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin("student@hostelfix.edu")}
              className="px-2 py-1.5 rounded-xl bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-600 text-xs font-semibold shadow-sm transition-all"
            >
              🎓 Student
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin("staff@hostelfix.edu")}
              className="px-2 py-1.5 rounded-xl bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-600 text-xs font-semibold shadow-sm transition-all"
            >
              🔧 Staff
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin("admin@hostelfix.edu")}
              className="px-2 py-1.5 rounded-xl bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-600 text-xs font-semibold shadow-sm transition-all"
            >
              🛡️ Warden
            </button>
          </div>
        </div>
      )}

      {serverError && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name for signup */}
        {isSignup && (
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. John Doe"
                {...register("full_name")}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            {errors.full_name && (
              <p className="mt-1 text-xs text-rose-600">{errors.full_name.message}</p>
            )}
          </div>
        )}

        {/* Email */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              placeholder="e.g. student@hostelfix.edu"
              {...register("email")}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
            />
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
            Password
          </label>
          <div className="relative">
            <input
              type="password"
              placeholder="••••••••"
              {...register("password")}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
            />
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>
          )}
        </div>

        {/* Role & Room selection for signup */}
        {isSignup && (
          <>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                Select Your Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["student", "staff", "admin"].map((r) => (
                  <label
                    key={r}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border cursor-pointer transition-all ${
                      selectedRole === r
                        ? "border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold"
                        : "border-slate-200 bg-slate-50 text-slate-600"
                    }`}
                  >
                    <input
                      type="radio"
                      value={r}
                      {...register("role")}
                      className="sr-only"
                    />
                    <span className="capitalize text-xs">{r}</span>
                  </label>
                ))}
              </div>
            </div>

            {selectedRole === "student" && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Room Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. A-102"
                    {...register("room_number")}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                  />
                  <DoorOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            )}
          </>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? (
            <span>Processing...</span>
          ) : (
            <>
              <span>{isSignup ? "Complete Registration" : "Sign In"}</span>
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
          }}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          {isSignup
            ? "Already have an account? Sign In"
            : "Don't have an account yet? Sign Up"}
        </button>
      </div>
    </div>
  );
};
