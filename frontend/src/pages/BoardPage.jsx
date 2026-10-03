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
  const [myOnly, setMyOnly] = useState(false);

  const { isStudent } = useAuth();

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
    <div className="relative min-h-[calc(100vh-4rem)] bg-slate-50 py-8 sm:py-10">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Incident Operations Board
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/60 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Live SLA Monitoring</span>
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
              className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-sm transition-all duration-150 cursor-pointer"
              title="Refresh Board"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-600" : ""}`} />
            </button>

            {isStudent && (
              <Link
                to="/report"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-all duration-150 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Report Issue</span>
              </Link>
            )}
          </div>
        </div>

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

