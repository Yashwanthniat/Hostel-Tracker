import React, { useState } from "react";
import { CheckCircle2, RotateCcw, Wrench, Clock, Send, AlertCircle } from "lucide-react";

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
          color: "bg-amber-600 hover:bg-amber-700 text-white",
          prompt: "Provide details on action taken or parts ordered:",
        });
      }

      if (currentStatus === "IN_PROGRESS") {
        transitions.push({
          status: "RESOLVED_PENDING",
          label: "Mark Work Completed (Pending Verification)",
          icon: CheckCircle2,
          color: "bg-indigo-600 hover:bg-indigo-700 text-white",
          prompt: "Describe how the issue was fixed for the student's review:",
        });
        transitions.push({
          status: "OPEN",
          label: "Return to Open Queue",
          icon: Clock,
          color: "bg-slate-600 hover:bg-slate-700 text-white",
          prompt: "Explain why this ticket is being returned to open pool:",
        });
      }

      if (currentStatus === "REOPENED") {
        transitions.push({
          status: "IN_PROGRESS",
          label: "Re-Assign & Resume Work",
          icon: Wrench,
          color: "bg-amber-600 hover:bg-amber-700 text-white",
          prompt: "Note your updated resolution plan for this disputed complaint:",
        });
      }

      if (userRole === "admin") {
        // Administrative override capability
        if (currentStatus !== "CLOSED") {
          transitions.push({
            status: "CLOSED",
            label: "Admin Force Close",
            icon: CheckCircle2,
            color: "bg-emerald-700 hover:bg-emerald-800 text-white",
            prompt: "Administrative closure remarks:",
          });
        }
      }
    }

    // Student controls:
    // When complaint is RESOLVED_PENDING, student can CONFIRM (CLOSED) or DISPUTE (REOPENED)
    if (isOwnerStudent && currentStatus === "RESOLVED_PENDING") {
      transitions.push({
        status: "CLOSED",
        label: "Confirm Fixed & Close Ticket",
        icon: CheckCircle2,
        color: "bg-emerald-600 hover:bg-emerald-700 text-white",
        prompt: "Optional feedback for maintenance staff:",
      });
      transitions.push({
        status: "REOPENED",
        label: "Dispute Resolution (Reopen Ticket)",
        icon: RotateCcw,
        color: "bg-rose-600 hover:bg-rose-700 text-white",
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
      <div className="text-xs text-slate-500 italic p-3 bg-slate-50 border border-slate-200 rounded-xl">
        No state transitions currently available for your account on this complaint.
      </div>
    );
  }

  const selectedTransition = available.find((t) => t.status === targetStatus);

  return (
    <div>
      {/* Quick Action Buttons */}
      <div className="flex flex-wrap items-center gap-2.5">
        {available.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.status}
              type="button"
              disabled={isUpdating}
              onClick={() => handleOpenAction(t)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer ${t.color}`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Note & Confirmation Modal */}
      {isModalOpen && selectedTransition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-2xl ${selectedTransition.color}`}>
                <selectedTransition.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Update Status: {selectedTransition.status}
                </h3>
                <p className="text-xs text-slate-500">
                  This action will be permanently recorded in the complaint audit log.
                </p>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Audit Log Note & Remarks
                </label>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={selectedTransition.prompt || "Enter any relevant notes or updates..."}
                  className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isUpdating}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all ${selectedTransition.color}`}
                >
                  {isUpdating ? (
                    <span>Updating...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Confirm Transition</span>
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
