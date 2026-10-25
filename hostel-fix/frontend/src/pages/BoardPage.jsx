import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { KanbanBoard } from "../components/KanbanBoard";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { PlusCircle, RefreshCw, Layers, Sparkles } from "lucide-react";

export const BoardPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { user, isStudent, isAdmin } = useAuth();
  const [myOnly, setMyOnly] = useState(isStudent);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [cats, compList] = await Promise.all([
        api.complaints.getCategories(),
        api.complaints.list({
          category_id: selectedCategory || undefined,
          search: searchQuery || undefined,
          my_only: myOnly || undefined,
        }),
      ]);
      setCategories(cats || []);
      setComplaints(compList || []);
    } catch (err) {
      setError(err.message || "Failed to load board complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, myOnly]);

  const handleSearchSubmit = (query) => {
    setSearchQuery(query);
    api.complaints
      .list({
        category_id: selectedCategory || undefined,
        search: query || undefined,
        my_only: myOnly || undefined,
      })
      .then((data) => setComplaints(data || []))
      .catch((err) => console.error(err));
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-slate-50 pt-8 pb-12 sm:pt-10 sm:pb-14">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {isAdmin ? "Incident Operations Command Board" : isStudent ? "Hostel Complaint Board" : "Technician Operations Board"}
              </h1>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200 tracking-tight shadow-xs transition-all duration-200">
                <span className="relative flex h-2 w-2 flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="font-semibold">Live AI Monitoring</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl font-normal">
              Campus incident operations pipeline. Every ticket tracked, deterministically escalated at 24h breach points, and verified with immutable audit records.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md active:scale-95 transition-transform duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 cursor-pointer"
              title="Refresh Board"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-600" : ""}`} />
            </button>

            {isStudent && (
              <Link
                to="/report"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md active:scale-95 transition-transform duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Report Issue</span>
              </Link>
            )}
          </div>
        </div>

        {/* Student Campus Notice & Filter Strip */}
        {isStudent && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-50/90 via-violet-50/70 to-slate-50 border border-indigo-200/70 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider">
                  Campus Notice
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  Autonomous 24-Hour SLA Protocol Active · Daily Sweeps at 09:00 & 16:00
                </h3>
              </div>
              <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
                Every grievance filed has an immutable digital record. Technicians must address open tickets within 24 hours. If unsatisfied with completed work, you can dispute the resolution for immediate senior re-review.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => setMyOnly(!myOnly)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  myOnly 
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs" 
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {myOnly ? "✓ Showing My Complaints" : "Show: My Complaints Only"}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-50/80 border border-rose-200/80 rounded-2xl text-xs text-rose-700 shadow-2xs">
            {error}
          </div>
        )}

        {loading && complaints.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center space-y-3">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent"></div>
            <p className="text-xs font-semibold text-slate-500">Syncing live complaint telemetry...</p>
          </div>
        ) : (
          <KanbanBoard
            complaints={complaints}
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            searchQuery={searchQuery}
            onSearchChange={handleSearchSubmit}
            myOnly={myOnly}
            onMyOnlyToggle={() => setMyOnly(!myOnly)}
            isStudent={isStudent}
            onRefresh={loadData}
          />
        )}
      </div>
    </div>
  );
};

