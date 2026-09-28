import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { KanbanBoard } from "../components/KanbanBoard";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { PlusCircle, RefreshCw, Layers } from "lucide-react";

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
    // Simple client side filter + reload
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Hostel Complaint Board
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-200/80 text-slate-700 text-xs font-bold">
              Live Feed
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time public tracker with automated 24-hour SLA monitoring and resolution workflows.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 shadow-sm transition-all cursor-pointer"
            title="Refresh Board"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-600" : ""}`} />
          </button>

          {isStudent && (
            <Link
              to="/report"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Issue</span>
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700">
          {error}
        </div>
      )}

      {loading && complaints.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-xs font-semibold text-slate-500">Loading complaint board...</p>
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
  );
};
