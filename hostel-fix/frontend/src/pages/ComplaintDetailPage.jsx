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
  AlertCircle
} from "lucide-react";

export const ComplaintDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

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

  useEffect(() => {
    loadComplaint();
  }, [id]);

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
      note = "Student verified repair and accepted resolution.";
    } else if (newStatus === "REOPENED") {
      const reason = window.prompt("Please state why you are disputing this resolution (min 5 characters):");
      if (reason === null) return;
      note = reason.trim() || "Student disputed resolution: Issue persists.";
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

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
        <p className="text-xs font-semibold text-slate-500">Fetching complaint audit record...</p>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-3xl border border-rose-200 text-center shadow-sm">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Complaint Not Found</h2>
        <p className="text-xs text-slate-600 mt-1">{error || "The requested ticket does not exist or has been archived."}</p>
        <Link
          to="/"
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Board</span>
        </Link>
      </div>
    );
  }

  const isOwnerStudent = user?.role === "student" && complaint.student_id === user?.id;
  const isPendingVerification = complaint.status === "RESOLVED_PENDING";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
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
        <div className="p-6 bg-indigo-50 border-2 border-indigo-200 rounded-3xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping"></span>
              <h3 className="font-extrabold text-indigo-950 text-sm">
                Maintenance Marked This Ticket Resolved
              </h3>
            </div>
            <p className="text-xs text-indigo-800">
              Please inspect the repair in your room. If it's satisfactory, confirm closure. If not, dispute to reopen the ticket.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => handleStudentAction("CLOSED")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Accept & Resolve</span>
            </button>
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => handleStudentAction("REOPENED")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Dispute Issue</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Complaint Overview Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        {/* Top Badges & Meta */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wider">
              {complaint.category_name}
            </span>

            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold">
              <DoorOpen className="w-3.5 h-3.5 text-slate-400" />
              <span>Room {complaint.room_number || "Unassigned"}</span>
            </span>

            <span className="text-xs text-slate-400 font-mono">
              ID: {complaint.id.substring(0, 8)}...
            </span>
          </div>

          <StatusBadge
            status={complaint.status}
            escalationLevel={complaint.escalation_level}
          />
        </div>

        {/* Complaint Description */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Description
          </h2>
          <p className="text-base text-slate-900 leading-relaxed font-medium whitespace-pre-wrap">
            {complaint.description}
          </p>
        </div>

        {/* Photo Attachment if present */}
        {complaint.photo_url && (
          <div className="pt-4 border-t border-slate-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Attached Evidence</span>
            </h2>
            <div className="rounded-2xl overflow-hidden border border-slate-200 max-w-md bg-slate-50">
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

        {/* Key Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-slate-400 block font-medium">Filed By</span>
            <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
              <User className="w-3.5 h-3.5 text-indigo-500" />
              {complaint.student_name}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-slate-400 block font-medium">Responsible Unit</span>
            <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
              <Wrench className="w-3.5 h-3.5 text-amber-500" />
              {complaint.default_staff_group || "General Operations"}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-slate-400 block font-medium">Submitted At</span>
            <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {new Date(complaint.created_at).toLocaleString()}
            </span>
          </div>
        </div>

        {/* State Action Section */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              State Machine Controls
            </h3>
            <p className="text-xs text-slate-400">
              Update status in accordance with the hostel accountability protocol.
            </p>
          </div>

          {user?.role === "student" && complaint.status === "RESOLVED_PENDING" ? (
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleStudentAction("CLOSED")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Accept & Resolve</span>
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleStudentAction("REOPENED")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Dispute Issue</span>
              </button>
            </div>
          ) : (
            <StatusUpdateDropdown
              complaint={complaint}
              currentUser={user}
              onStatusUpdate={handleStatusUpdate}
              isUpdating={isUpdating}
            />
          )}
        </div>
      </div>

      {/* Immutable Audit Trail Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Immutable Status History & Audit Trail
              </h2>
              <p className="text-xs text-slate-500">
                Permanent record of every state transition, actor attribution, and notes.
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-lg text-slate-600">
            {complaint.status_logs?.length || 0} Events
          </span>
        </div>

        <AuditTrail logs={complaint.status_logs || []} />
      </div>
    </div>
  );
};
