import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { RoleGuard } from "./components/RoleGuard";
import { Navbar } from "./components/Navbar";

// Pages
import { AuthPage } from "./pages/AuthPage";
import { BoardPage } from "./pages/BoardPage";
import { ReportComplaintPage } from "./pages/ReportComplaintPage";
import { ComplaintDetailPage } from "./pages/ComplaintDetailPage";
import { StaffQueuePage } from "./pages/StaffQueuePage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { AdminUsersPage } from "./pages/AdminUsersPage";
import { ProfilePage } from "./pages/ProfilePage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-indigo-500 selection:text-white">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<AuthPage />} />
              <Route path="/signup" element={<AuthPage />} />

              {/* Public Authenticated Complaint Board */}
              <Route
                path="/"
                element={
                  <RoleGuard>
                    <BoardPage />
                  </RoleGuard>
                }
              />

              {/* Student Complaint Submission */}
              <Route
                path="/report"
                element={
                  <RoleGuard allowedRoles={["student"]}>
                    <ReportComplaintPage />
                  </RoleGuard>
                }
              />

              {/* Complaint Detail & Full Audit Trail */}
              <Route
                path="/complaints/:id"
                element={
                  <RoleGuard>
                    <ComplaintDetailPage />
                  </RoleGuard>
                }
              />

              {/* Staff & Admin Maintenance Queue */}
              <Route
                path="/staff/queue"
                element={
                  <RoleGuard allowedRoles={["staff", "admin"]}>
                    <StaffQueuePage />
                  </RoleGuard>
                }
              />

              {/* Admin Analytics & AI Weekly Summary */}
              <Route
                path="/admin/dashboard"
                element={
                  <RoleGuard allowedRoles={["admin"]}>
                    <AdminDashboardPage />
                  </RoleGuard>
                }
              />

              {/* Admin User Management */}
              <Route
                path="/admin/users"
                element={
                  <RoleGuard allowedRoles={["admin"]}>
                    <AdminUsersPage />
                  </RoleGuard>
                }
              />

              {/* Profile Settings */}
              <Route
                path="/profile"
                element={
                  <RoleGuard>
                    <ProfilePage />
                  </RoleGuard>
                }
              />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
