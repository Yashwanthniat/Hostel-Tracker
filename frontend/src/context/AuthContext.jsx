import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../lib/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    const token = localStorage.getItem("hostelfix_token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const profile = await api.auth.getMe();
      setUser(profile);
    } catch (err) {
      console.warn("Session expired or invalid token:", err.message);
      localStorage.removeItem("hostelfix_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const login = async (credentials) => {
    const data = await api.auth.login(credentials);
    localStorage.setItem("hostelfix_token", data.token);
    setUser(data.user);
    return data.user;
  };

  const signup = async (userData) => {
    const data = await api.auth.signup(userData);
    localStorage.setItem("hostelfix_token", data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("hostelfix_token");
    setUser(null);
  };

  const refreshUser = async () => {
    await fetchProfile();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        refreshUser,
        isAuthenticated: Boolean(user),
        isStudent: user?.role === "student",
        isStaff: user?.role === "staff",
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
