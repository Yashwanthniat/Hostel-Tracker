import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
 import { api } from "../lib/api";
 import { useAuth } from "../context/AuthContext";
 import { StatusBadge } from "../components/StatusBadge";
 import { StatusUpdateDropdown } from "../components/StatusUpdateDropdown";
 import { AuditTrail } from "../components/AuditTrail";
 import { 
   ArrowLeft, 
   DoorOpen, 
   User, 
   Calendar, 
   Wrench, 
   ShieldCheck, 
   CheckCircle2, 
   RotateCcw,
   Image as ImageIcon,
   AlertCircle,
   Clock
 } from "lucide-react";

export const ComplaintDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const [isSupervising, setIsSupervising] = useState(false);
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [priorityModalOpen, setPriorityModalOpen] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [selectedPriority, setSelectedPriority] = useState(1);
  const [supervisoryNote, setSupervisoryNote] = useState("");

  const loadComplaint = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.complaints.get(id);
      setComplaint(data);
    } catch (err) {
      setError(err.message || "Failed to load complaint details");
    } finally {
      setLoading(false);
    }
  };

  const loadStaffList = async () => {
    try {
      const users = await api.auth.getAllUsers();
      const staffOnly = (users || []).filter((u) => u.role === "staff");
      setStaffList(staffOnly);
      if (staffOnly.length > 0) setSelectedStaffId(staffOnly[0].id);
    } catch (e) {
      console.warn("Unable to fetch staff list:", e);
    }
  };

  useEffect(() => {
    loadComplaint();
    if (user?.role === "admin") {
      loadStaffList();
    }
  }, [id, user?.role]);

  const handleStatusUpdate = async ({ new_status, note }) => {
    setIsUpdating(true);
    try {
      const res = await api.complaints.updateStatus(id, { new_status, note });
      setComplaint(res.complaint);
    } catch (err) {
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStudentAction = async (newStatus) => {
    let note = "";
    if (newStatus === "CLOSED") {
      note = "Student verified repair in room and confirmed successful resolution.";
    } else if (newStatus === "REOPENED") {
      const reason = window.prompt("Please state why you are disputing this resolution (min 5 characters):");
      if (reason === null) return;
      note = reason.trim() || "Student disputed resolution: Issue persists in room.";
      if (note.length < 5) {
        alert("Please provide at least 5 characters for the dispute reason.");
        return;
      }
    }

    try {
      await handleStatusUpdate({ new_status: newStatus, note });
    } catch (err) {
      alert(err.message || "Failed to update complaint status");
    }
  };

  const handleStaffReinspect = async () => {
    try {
      await handleStatusUpdate({
        new_status: "IN_PROGRESS",
        note: "Technician commenced urgent re-inspection of disputed work in room.",
      });
    } catch (err) {
      alert(err.message || "Failed to start re-inspection");
    }
  };

  const handleWardenReassignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStaffId) return;
    setIsSupervising(true);
    try {
      const res = await api.complaints.reassign(id, {
        staff_id: selectedStaffId,
        note: supervisoryNote.trim() || "Warden reallocated ticket for expedited technical handling.",
      });
      setComplaint(res.complaint);
      setReassignModalOpen(false);
      setSupervisoryNote("");
    } catch (err) {
      alert(err.message || "Reassignment failed");
    } finally {
      setIsSupervising(false);
    }
  };

  const handleWardenOverridePrioritySubmit = async (e) => {
    e.preventDefault();
    setIsSupervising(true);
    try {
      const res = await api.complaints.overridePriority(id, {
        escalation_level: Number(selectedPriority),
        note: supervisoryNote.trim() || `Warden prioritized escalation level to ${selectedPriority}.`,
      });
      setComplaint(res.complaint);
      setPriorityModalOpen(false);
      setSupervisoryNote("");
    } catch (err) {
      alert(err.message || "Priority override failed");
    } finally {
      setIsSupervising(false);
    }
  };

  const handleWardenForceClose = async () => {
    const reason = window.prompt("Enter administrative closure remarks (min 5 characters):");
    if (reason === null) return;
    const note = reason.trim();
    if (note.length < 5) {
      alert("Please provide at least 5 characters for administrative remarks.");
      return;
    }
    setIsSupervising(true);
    try {
      const res = await api.complaints.forceClose(id, { note });
      setComplaint(res.complaint);
    } catch (err) {
      alert(err.message || "Force closure failed");
    } finally {
      setIsSupervising(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent"></div>
        <p className="text-xs font-semibold text-slate-500">Fetching complaint audit record...</p>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white/90 backdrop-blur-md rounded-3xl border border-rose-200/80 text-center shadow-card">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Complaint Not Found</h2>
        <p className="text-xs text-slate-600 mt-1">{error || "The requested ticket does not exist or has been archived."}</p>
        <Link
          to="/"
          className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Board</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-slate-50 py-8 sm:py-10">
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Back Navigation */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Complaint Board</span>
        </Link>

        {/* Student Action Alert when complaint is in RESOLVED_PENDING */}
        {user?.role === "student" && complaint.status === "RESOLVED_PENDING" && (
          <div className="p-5 sm:p-6 bg-white border border-indigo-200/90 rounded-3xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600"></span>
                </span>
                <h3 className="font-bold text-indigo-950 text-sm">
                  Maintenance Marked This Repair Completed
                </h3>
              </div>
              <p className="text-xs text-indigo-800 leading-relaxed max-w-xl">
                Please verify the repair in your room. If satisfactory, confirm resolution. If inadequate or broken again, dispute to reopen the ticket.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleStudentAction("CLOSED")}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-soft shadow-emerald-600/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>✅ Confirm Fix & Close Ticket</span>
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleStudentAction("REOPENED")}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-soft shadow-rose-600/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>⚠️ Dispute Work</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Complaint Overview Card */}
        {/* Main Complaint Overview Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-7 space-y-6">
          {/* Top Badges & Meta */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wider border border-slate-200/60">
                {complaint.category_name}
              </span>

              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100/80 text-slate-700 text-xs font-semibold border border-slate-200/50">
                <DoorOpen className="w-3.5 h-3.5 text-slate-400" />
                <span>Room {complaint.room_number || "Unassigned"}</span>
              </span>

              <span className="text-xs text-slate-400 font-mono">
                ID: {complaint.id.substring(0, 8)}...
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge
                status={complaint.status}
                escalationLevel={complaint.escalation_level}
                createdAt={complaint.created_at}
              />
            </div>
          </div>

          {/* Complaint Description */}
          <div>
            <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Complaint Description
            </h2>
            <p className="text-base sm:text-lg text-slate-900 leading-relaxed font-semibold whitespace-pre-wrap">
              {complaint.description}
            </p>
          </div>

          {/* Visual State Progress Stepper */}
          <div className="py-4 px-3 sm:px-5 bg-slate-50 border border-slate-200/70 rounded-2xl">
            <div className="flex items-center justify-between relative">
              {/* Background Connecting Line */}
              <div className="absolute top-4 left-8 right-8 h-0.5 bg-slate-200 -z-0 hidden sm:block" />
              {/* Filled Progress Line */}
              <div
                className="absolute top-4 left-8 h-0.5 bg-indigo-600 transition-all duration-500 -z-0 hidden sm:block"
                style={{
                  width:
                    complaint.status === "OPEN"
                      ? "0%"
                      : complaint.status === "IN_PROGRESS" || complaint.status === "REOPENED"
                      ? "33.3%"
                      : complaint.status === "RESOLVED_PENDING"
                      ? "66.6%"
                      : "100%",
                }}
              />

              {/* 4 Steps */}
              {[
                {
                  num: 1,
                  title: "Logged / Open",
                  desc: "Ticket received",
                  active: complaint.status === "OPEN",
                  done: ["IN_PROGRESS", "RESOLVED_PENDING", "CLOSED", "REOPENED"].includes(complaint.status),
                },
                {
                  num: 2,
                  title: complaint.status === "REOPENED" ? "Dispute Re-Review" : "Assigned & In Progress",
                  desc: complaint.status === "REOPENED" ? "Priority re-inspection" : "Staff investigating",
                  active: complaint.status === "IN_PROGRESS" || complaint.status === "REOPENED",
                  done: ["RESOLVED_PENDING", "CLOSED"].includes(complaint.status),
                },
                {
                  num: 3,
                  title: "Student Verification",
                  desc: "Pending room sign-off",
                  active: complaint.status === "RESOLVED_PENDING",
                  done: complaint.status === "CLOSED",
                },
                {
                  num: 4,
                  title: "Closed & Resolved",
                  desc: "Verified complete",
                  active: complaint.status === "CLOSED",
                  done: complaint.status === "CLOSED",
                },
              ].map((step, idx) => {
                const isCurrent = step.active;
                const isDone = step.done && !isCurrent;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center text-center relative z-10 px-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                        isDone
                          ? "bg-indigo-600 text-white shadow-soft shadow-indigo-600/25"
                          : isCurrent
                          ? "bg-indigo-600 text-white ring-4 ring-indigo-100 shadow-soft shadow-indigo-600/30"
                          : "bg-white border-2 border-slate-300 text-slate-400"
                      }`}
                    >
                      {isDone ? <CheckCircle2 className="w-4 h-4" /> : step.num}
                    </div>
                    <span
                      className={`mt-2 text-[11px] sm:text-xs font-semibold tracking-tight transition-colors line-clamp-1 ${
                        isCurrent
                          ? "text-indigo-600 font-bold"
                          : isDone
                          ? "text-slate-800"
                          : "text-slate-400"
                      }`}
                    >
                      {step.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium hidden sm:inline-block mt-0.5">
                      {step.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Photo Attachment if present */}
          {complaint.photo_url && (
            <div className="pt-4 border-t border-slate-100">
              <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Attached Photographic Evidence</span>
              </h2>
              <div className="rounded-2xl overflow-hidden border border-slate-200/80 max-w-md bg-slate-50 shadow-2xs">
                <img
                  src={complaint.photo_url}
                  alt="Complaint attachment"
                  className="w-full h-auto object-cover max-h-80"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            </div>
          )}

          {/* Key Details Grid with High-Contrast Typography */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-4 border-t border-slate-100 text-xs">
            <div className="p-3.5 bg-slate-50 border border-slate-200/60 rounded-xl shadow-2xs">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Reported By</span>
              <span className="font-bold text-slate-900 flex items-center gap-1.5 mt-1 text-xs">
                <User className="w-3.5 h-3.5 text-slate-400" />
                {complaint.student_name}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200/60 rounded-xl shadow-2xs">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Assigned Unit</span>
              <span className="font-bold text-slate-900 flex items-center gap-1.5 mt-1 text-xs">
                <Wrench className="w-3.5 h-3.5 text-slate-400" />
                {complaint.default_staff_group || "General Operations"}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200/60 rounded-xl shadow-2xs">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Created At</span>
              <span className="font-bold text-slate-900 flex items-center gap-1.5 mt-1 text-xs">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {new Date(complaint.created_at).toLocaleString()}
              </span>
            </div>
          </div>

          {/* State Action Section */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                State Machine Controls
              </h3>
              <p className="text-xs text-slate-400">
                Authorized state transitions are strictly recorded in the immutable audit log.
              </p>
            </div>

            {/* Contextual Actions based on Role and Status */}
            {user?.role === "student" && complaint.status === "RESOLVED_PENDING" ? (
              /* Stage 3: Student Verification Controls */
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleStudentAction("CLOSED")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-soft shadow-emerald-600/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>✅ Confirm Fix & Close Ticket</span>
                </button>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleStudentAction("REOPENED")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-soft shadow-rose-600/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>⚠️ Dispute Work</span>
                </button>
              </div>
            ) : complaint.status === "REOPENED" && user?.role === "staff" ? (
              /* Stage 2: Staff Dispute Re-Inspection */
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={handleStaffReinspect}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-soft shadow-indigo-600/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>🔧 Start Re-Inspection</span>
                </button>
              </div>
            ) : complaint.status === "REOPENED" && user?.role === "admin" ? (
              /* Stage 2: Warden Dispute Supervisory Actions */
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  disabled={isSupervising}
                  onClick={() => setReassignModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-soft shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>⚡ Reassign Unit</span>
                </button>
                <button
                  type="button"
                  disabled={isSupervising}
                  onClick={handleWardenForceClose}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-soft shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Administrative Override & Resolve</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                {user?.role === "admin" && (
                  <>
                    <button
                      type="button"
                      disabled={isSupervising}
                      onClick={() => setReassignModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                    >
                      <Wrench className="w-3.5 h-3.5 text-slate-500" />
                      <span>Reassign Technician</span>
                    </button>
                    <button
                      type="button"
                      disabled={isSupervising}
                      onClick={() => setPriorityModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                    >
                      <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
                      <span>Override Priority</span>
                    </button>
                  </>
                )}
                <StatusUpdateDropdown
                  complaint={complaint}
                  currentUser={user}
                  onStatusUpdate={handleStatusUpdate}
                  isUpdating={isUpdating}
                />
              </div>
            )}
          </div>
        </div>

        {/* Modal: Warden Reassign Technician */}
        {reassignModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">Reassign Maintenance Technician</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setReassignModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleWardenReassignSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Technician
                  </label>
                  <select
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {staffList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.full_name} ({s.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Supervisory Instructions / Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide specific directives for the assigned technician..."
                    value={supervisoryNote}
                    onChange={(e) => setSupervisoryNote(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReassignModalOpen(false)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSupervising}
                    className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-soft disabled:opacity-50"
                  >
                    Confirm Reassignment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Warden Override Priority */}
        {priorityModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">Override Escalation Priority</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setPriorityModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleWardenOverridePrioritySubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Escalation Level
                  </label>
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={0}>Level 0 - Normal Priority (Standard SLA)</option>
                    <option value={1}>Level 1 - High Priority (Breached &gt;24h)</option>
                    <option value={2}>Level 2 - Critical Warden Sweep</option>
                    <option value={3}>Level 3 - Immediate Executive Intervention</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Supervisory Audit Remarks
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter audit explanation for overriding priority..."
                    value={supervisoryNote}
                    onChange={(e) => setSupervisoryNote(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setPriorityModalOpen(false)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSupervising}
                    className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-soft disabled:opacity-50"
                  >
                    Apply Priority Override
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Immutable Audit Trail Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Status History & Audit Trail
                </h2>
                <p className="text-xs text-slate-500">
                  Permanent record of every state transition, actor attribution, and technician notes.
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-xl text-slate-600 border border-slate-200/60 shadow-2xs">
              {complaint.status_logs?.length || 0} Events
            </span>
          </div>

          <AuditTrail logs={complaint.status_logs || []} />
        </div>
      </div>
    </div>
  );
};

