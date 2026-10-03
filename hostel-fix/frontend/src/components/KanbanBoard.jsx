import React, { useState, useRef, useEffect } from "react";
import { ComplaintCard } from "./ComplaintCard";
import { 
  Clock, 
  Wrench, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Filter, 
  ChevronDown, 
  ShieldAlert, 
  TrendingUp, 
  Activity, 
  Layers,
  Sparkles,
  Command,
  X
} from "lucide-react";

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

  const escalatedList = complaints.filter((c) => c.escalation_level > 0);
  const escalatedTotal = escalatedList.length;

  // Key metrics calculation
  const totalActive = openList.length + inProgressList.length;
  const slaComplianceRate = totalActive === 0 
    ? 100 
    : Math.max(0, Math.round(((totalActive - escalatedTotal) / totalActive) * 100));

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
      {/* Executive KPI Metric Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Active Escalations */}
        <div className={`p-4 rounded-2xl bg-white border transition-all ${
          escalatedTotal > 0 
            ? "border-rose-200/90 shadow-sm" 
            : "border-slate-200/80 shadow-sm"
        }`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Active Escalations
            </span>
            {escalatedTotal > 0 ? (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
              </span>
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold tracking-tight ${
              escalatedTotal > 0 ? "text-rose-600" : "text-slate-900"
            }`}>
              {escalatedTotal}
            </span>
            <span className={`text-[11px] font-medium ${
              escalatedTotal > 0 ? "text-rose-600" : "text-emerald-600"
            }`}>
              {escalatedTotal > 0 ? "SLA Overdue >24h" : "Zero Breaches"}
            </span>
          </div>
        </div>

        {/* Metric 2: 24h SLA Compliance Rate */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              SLA Compliance
            </span>
            <ShieldAlert className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {slaComplianceRate}%
            </span>
            <span className="text-[11px] font-medium text-slate-500">
              Standard: 24h
            </span>
          </div>
        </div>

        {/* Metric 3: Active In-Flight Tickets */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Active Queue
            </span>
            <Activity className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {totalActive}
            </span>
            <span className="text-[11px] font-medium text-slate-500">
              {openList.length} open • {inProgressList.length} in progress
            </span>
          </div>
        </div>

        {/* Metric 4: Total Resolved */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Resolved & Closed
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {resolvedList.length}
            </span>
            <span className="text-[11px] font-medium text-slate-500">
              Audited & Complete
            </span>
          </div>
        </div>
      </div>

      {/* Unified Floating Filter & Search Bar */}
      <div className="p-2 sm:p-2.5 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
        {/* Search with Keyboard Shortcut Indicator */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search issues, keywords, or room (e.g. B-204)..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-14 py-2 text-xs sm:text-sm bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searchQuery ? (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="p-1 hover:bg-slate-200 rounded-md text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-slate-200 bg-white text-[10px] font-bold text-slate-400 shadow-2xs">
                <span>⌘</span>
                <span>K</span>
              </span>
            )}
          </div>
        </div>

        {/* Filters Group */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Category Filter Dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 transition-all cursor-pointer shadow-2xs"
            >
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentCategoryLabel}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isCategoryOpen ? "rotate-180" : ""}`} />
            </button>

            {isCategoryOpen && (
              <div className="absolute top-full left-0 mt-2 z-50 bg-white border border-slate-200/90 rounded-2xl shadow-xl py-1.5 min-w-[200px] animate-fadeIn">
                <button
                  type="button"
                  onClick={() => {
                    onCategoryChange("");
                    setIsCategoryOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs font-semibold transition-colors hover:bg-slate-50 cursor-pointer ${
                    !selectedCategory ? "text-indigo-600 bg-indigo-50 font-bold" : "text-slate-700"
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
                      className={`w-full text-left px-3.5 py-2 text-xs font-semibold transition-colors hover:bg-slate-50 cursor-pointer ${
                        isSelected ? "text-indigo-600 bg-indigo-50 font-bold" : "text-slate-700"
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
              className={`px-3 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all cursor-pointer shadow-2xs ${
                myOnly
                  ? "bg-indigo-600 text-white font-bold shadow-sm"
                  : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {myOnly ? "Showing: My Complaints" : "Show: My Complaints"}
            </button>
          )}
        </div>
      </div>

      {/* 3-Column Framed Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Column 1: OPEN QUEUE */}
        <div className="bg-slate-100/60 border border-slate-200/80 rounded-3xl p-4 flex flex-col min-h-[520px] transition-all shadow-xs">
          <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-200/80">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Open Queue
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-white text-slate-700 text-xs font-semibold shadow-xs border border-slate-200/80">
              {openList.length}
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
            {openList.length === 0 ? (
              <div className="h-44 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 rounded-2xl text-xs text-slate-400 bg-white/60">
                <Clock className="w-6 h-6 mb-1 text-slate-300" />
                <span>No complaints awaiting pickup</span>
              </div>
            ) : (
              openList.map((c) => <ComplaintCard key={c.id} complaint={c} />)
            )}
          </div>
        </div>

        {/* Column 2: IN PROGRESS */}
        <div className="bg-slate-100/60 border border-slate-200/80 rounded-3xl p-4 flex flex-col min-h-[520px] transition-all shadow-xs">
          <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-200/80">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                In Progress
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-white text-slate-700 text-xs font-semibold shadow-xs border border-slate-200/80">
              {inProgressList.length}
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
            {inProgressList.length === 0 ? (
              <div className="h-44 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 rounded-2xl text-xs text-slate-400 bg-white/60">
                <Wrench className="w-6 h-6 mb-1 text-slate-300" />
                <span>No tasks currently being worked on</span>
              </div>
            ) : (
              inProgressList.map((c) => <ComplaintCard key={c.id} complaint={c} />)
            )}
          </div>
        </div>

        {/* Column 3: RESOLVED / CLOSED */}
        <div className="bg-slate-100/60 border border-slate-200/80 rounded-3xl p-4 flex flex-col min-h-[520px] transition-all shadow-xs">
          <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-200/80">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Resolved & Verified
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-white text-slate-700 text-xs font-semibold shadow-xs border border-slate-200/80">
              {resolvedList.length}
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
            {resolvedList.length === 0 ? (
              <div className="h-44 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 rounded-2xl text-xs text-slate-400 bg-white/60">
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

