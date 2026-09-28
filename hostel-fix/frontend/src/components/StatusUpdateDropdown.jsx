import React, { useState } from "react";
import { CheckCircle2, RotateCcw, Wrench, Clock, Send, AlertCircle, X } from "lucide-react";

export const StatusUpdateDropdown = ({
  complaint,
  currentUser,
  onStatusUpdate,
  isUpdating = false,
}) => {
  const [targetStatus, setTargetStatus] = useState("");
  const [note, setNote] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");

  const currentStatus = complaint.status;
  const userRole = currentUser?.role;
  const isOwnerStudent = userRole === "student" && complaint.student_id === currentUser?.id;

  // Determine available transitions according to state machine:
  const getAvailableTransitions = () => {
    const transitions = [];

    if (userRole === "staff" || userRole === "admin") {
      if (currentStatus === "OPEN") {
        transitions.push({
          status: "IN_PROGRESS",
          label: "Pick Up & Start Work",
          icon: Wrench,
          color: "bg-amber-600 hover:bg-amber-700 text-white shadow-soft shadow-amber-600/20",
          prompt: "Provide details on action taken or parts ordered:",
        });
      }

      if (currentStatus === "IN_PROGRESS") {
        transitions.push({
          status: "RESOLVED_PENDING",
          label: "Mark Work Completed",
          icon: CheckCircle2,
          color: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-soft shadow-indigo-600/20",
          prompt: "Describe how the issue was fixed for the student's review:",
        });
        transitions.push({
          status: "OPEN",
          label: "Return to Open Pool",
          icon: Clock,
          color: "bg-slate-700 hover:bg-slate-800 text-white shadow-soft",
          prompt: "Explain why this ticket is being returned to open pool:",
        });
      }

      if (currentStatus === "REOPENED") {
        transitions.push({
          status: "IN_PROGRESS",
          label: "Re-Assign & Resume Work",
          icon: Wrench,
          color: "bg-amber-600 hover:bg-amber-700 text-white shadow-soft shadow-amber-600/20",
          prompt: "Note your updated resolution plan for this disputed complaint:",
        });
      }

      if (userRole === "admin") {
        if (currentStatus !== "CLOSED") {
          transitions.push({
            status: "CLOSED",
            label: "Admin Force Close",
            icon: CheckCircle2,
            color: "bg-emerald-700 hover:bg-emerald-800 text-white shadow-soft shadow-emerald-700/20",
            prompt: "Administrative closure remarks:",
          });
        }
      }
    }

    if (isOwnerStudent && currentStatus === "RESOLVED_PENDING") {
      transitions.push({
        status: "CLOSED",
        label: "Confirm Fixed & Close Ticket",
        icon: CheckCircle2,
        color: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-soft shadow-emerald-600/20",
        prompt: "Optional feedback for maintenance staff:",
      });
      transitions.push({
        status: "REOPENED",
        label: "Dispute Resolution (Reopen)",
        icon: RotateCcw,
        color: "bg-rose-600 hover:bg-rose-700 text-white shadow-soft shadow-rose-600/20",
        prompt: "Please explain why the issue is not yet resolved:",
      });
    }

    return transitions;
  };

  const available = getAvailableTransitions();

  const handleOpenAction = (transition) => {
    setTargetStatus(transition.status);
    setNote("");
    setError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!targetStatus) return;

    if (targetStatus === "REOPENED" && (!note || note.trim().length < 5)) {
      setError("Please provide a brief reason why you are disputing this resolution (min 5 characters).");
      return;
    }

    try {
      await onStatusUpdate({
        new_status: targetStatus,
        note: note.trim() || undefined,
      });
      setIsModalOpen(false);
      setTargetStatus("");
      setNote("");
    } catch (err) {
      setError(err.message || "Failed to update status");
    }
  };

  if (available.length === 0) {
    return (
      <div className="text-xs text-slate-500 p-3 bg-slate-50/80 border border-slate-200/70 rounded-2xl">
        No state transitions currently available for your account on this complaint.
      </div>
    );
  }

  const selectedTransition = available.find((t) => t.status === targetStatus);

  return (
    <div>
      {/* Quick Action Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {available.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.status}
              type="button"
              disabled={isUpdating}
              onClick={() => handleOpenAction(t)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all cursor-pointer ${t.color}`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Note & Confirmation Modal */}
      {isModalOpen && selectedTransition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-elevated border border-slate-200/80 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-2xl ${selectedTransition.color}`}>
                  <selectedTransition.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Update Status: {selectedTransition.status}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Recorded in permanent complaint audit log.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200/80 rounded-2xl text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Audit Remarks & Technical Notes
                </label>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={selectedTransition.prompt || "Enter any relevant notes or updates..."}
                  className="w-full p-3.5 text-xs sm:text-sm bg-slate-50/70 border border-slate-200/90 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isUpdating}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${selectedTransition.color}`}
                >
                  {isUpdating ? (
                    <span>Updating...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Confirm State Change</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

