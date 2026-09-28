import React, { useState, useRef, useEffect } from "react";
import { ComplaintCard } from "./ComplaintCard";
import { Clock, Wrench, CheckCircle2, AlertTriangle, Search, Filter, ChevronDown } from "lucide-react";

export const KanbanBoard = ({
  complaints = [],
  categories = [],
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  myOnly,
  onMyOnlyToggle,
  isStudent,
  onRefresh,
}) => {
  // Columns partition:
  // Column 1: OPEN (OPEN + REOPENED)
  // Column 2: IN_PROGRESS
  // Column 3: RESOLVED / CLOSED (RESOLVED_PENDING + CLOSED)

  const openList = complaints.filter(
    (c) => c.status === "OPEN" || c.status === "REOPENED"
  );
  const inProgressList = complaints.filter((c) => c.status === "IN_PROGRESS");
  const resolvedList = complaints.filter(
    (c) => c.status === "RESOLVED_PENDING" || c.status === "CLOSED"
  );

  const escalatedTotal = complaints.filter((c) => c.escalation_level > 0).length;

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const currentCategory = categories.find((c) => String(c.id) === String(selectedCategory));
  const currentCategoryLabel = currentCategory
    ? currentCategory.name.charAt(0).toUpperCase() + currentCategory.name.slice(1)
    : "All Categories";

  return (
    <div className="space-y-6">
      {/* Escalation SLA Banner if any are active */}
      {escalatedTotal > 0 && (
        <div className="flex items-center justify-between p-4 bg-rose-50 border border-rose-200 rounded-2xl shadow-sm text-sm text-rose-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-600 text-white rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-rose-950">
                {escalatedTotal} Complaint{escalatedTotal > 1 ? "s" : ""} Overdue & Auto-Escalated!
              </p>
              <p className="text-xs text-rose-700">
                Complaints unresolved for over 24 hours have been escalated to Admin / Warden review.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Control Bar: Filters & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search complaints by description, keywords, or room..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Category Filter Dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentCategoryLabel}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isCategoryOpen ? "rotate-180" : ""}`} />
            </button>

            {isCategoryOpen && (
              <div className="absolute top-full left-0 mt-2 z-50 bg-white border border-slate-200 rounded-xl shadow-lg py-1 min-w-[180px]">
                <button
                  type="button"
                  onClick={() => {
                    onCategoryChange("");
                    setIsCategoryOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs font-medium transition-colors hover:bg-slate-50 cursor-pointer ${
                    !selectedCategory ? "text-indigo-600 bg-indigo-50/50 font-bold" : "text-slate-700"
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => {
                  const isSelected = String(selectedCategory) === String(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        onCategoryChange(cat.id);
                        setIsCategoryOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-medium transition-colors hover:bg-slate-50 cursor-pointer ${
                        isSelected ? "text-indigo-600 bg-indigo-50/50 font-bold" : "text-slate-700"
                      }`}
                    >
                      {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Student "My Complaints" toggle */}
          {isStudent && (
            <button
              type="button"
              onClick={onMyOnlyToggle}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                myOnly
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {myOnly ? "Showing: My Complaints" : "Show: My Complaints"}
            </button>
          )}
        </div>
      </div>

      {/* 3-Column Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Column 1: OPEN */}
        <div className="bg-slate-100/70 border border-slate-200/60 rounded-3xl p-4 flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-sky-500"></div>
              <h3 className="text-sm font-bold text-slate-900 tracking-wide">Open Queue</h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-white text-slate-700 text-xs font-bold shadow-sm border border-slate-200">
              {openList.length}
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto pr-1">
            {openList.length === 0 ? (
              <div className="h-40 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-300 rounded-2xl text-xs text-slate-400">
                <Clock className="w-6 h-6 mb-1 text-slate-300" />
                <span>No complaints awaiting pickup</span>
              </div>
            ) : (
              openList.map((c) => <ComplaintCard key={c.id} complaint={c} />)
            )}
          </div>
        </div>

        {/* Column 2: IN PROGRESS */}
        <div className="bg-slate-100/70 border border-slate-200/60 rounded-3xl p-4 flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
              <h3 className="text-sm font-bold text-slate-900 tracking-wide">In Progress</h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-white text-slate-700 text-xs font-bold shadow-sm border border-slate-200">
              {inProgressList.length}
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto pr-1">
            {inProgressList.length === 0 ? (
              <div className="h-40 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-300 rounded-2xl text-xs text-slate-400">
                <Wrench className="w-6 h-6 mb-1 text-slate-300" />
                <span>No tasks currently being worked on</span>
              </div>
            ) : (
              inProgressList.map((c) => <ComplaintCard key={c.id} complaint={c} />)
            )}
          </div>
        </div>

        {/* Column 3: RESOLVED / CLOSED */}
        <div className="bg-slate-100/70 border border-slate-200/60 rounded-3xl p-4 flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
              <h3 className="text-sm font-bold text-slate-900 tracking-wide">Resolved & Closed</h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-white text-slate-700 text-xs font-bold shadow-sm border border-slate-200">
              {resolvedList.length}
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto pr-1">
            {resolvedList.length === 0 ? (
              <div className="h-40 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-300 rounded-2xl text-xs text-slate-400">
                <CheckCircle2 className="w-6 h-6 mb-1 text-slate-300" />
                <span>No resolved complaints yet</span>
              </div>
            ) : (
              resolvedList.map((c) => <ComplaintCard key={c.id} complaint={c} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
