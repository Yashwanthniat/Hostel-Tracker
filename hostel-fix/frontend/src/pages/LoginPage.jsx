import React from "react";
import { AuthForm } from "../components/AuthForm";

export const LoginPage = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="w-full max-w-md">
        <AuthForm initialMode="login" />
      </div>
    </div>
  );
};

export default LoginPage;
