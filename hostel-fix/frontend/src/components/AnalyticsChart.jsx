import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const CATEGORY_COLORS = {
  electrical: "#f59e0b",
  plumbing: "#3b82f6",
  mess: "#f97316",
  cleaning: "#14b8a6",
  internet: "#a855f7",
  furniture: "#10b981",
  other: "#64748b",
};

const STATUS_COLORS = {
  Open: "#f59e0b",
  "In Progress": "#3b82f6",
  "Pending Review": "#6366f1",
  Closed: "#10b981",
  Reopened: "#f43f5e",
};

export const AnalyticsChart = ({ data }) => {
  if (!data) return null;

  // Transform Category Volume
  const categoryData = Object.entries(data.categoryVolume || {}).map(([name, count]) => ({
    category: name.charAt(0).toUpperCase() + name.slice(1),
    count,
    color: CATEGORY_COLORS[name] || "#64748b",
  }));

  // Transform Status Totals
  const statusData = [
    { name: "Open", value: data.totals?.open || 0 },
    { name: "In Progress", value: data.totals?.inProgress || 0 },
    { name: "Pending Review", value: data.totals?.resolvedPending || 0 },
    { name: "Closed", value: data.totals?.closed || 0 },
    { name: "Reopened", value: data.totals?.reopened || 0 },
  ].filter((item) => item.value > 0);

  const ALL_CATEGORIES = [
    "electrical",
    "plumbing",
    "mess",
    "cleaning",
    "internet",
    "furniture",
    "other",
  ];

  const categoryKeys = Array.from(
    new Set([
      ...ALL_CATEGORIES,
      ...Object.keys(data.categoryVolume || {}),
      ...Object.keys(data.avgResolutionHoursByCategory || {}),
    ])
  );

  const resolutionData = categoryKeys.map((cat) => {
    const rawHours = data.avgResolutionHoursByCategory?.[cat];
    const hours = typeof rawHours === "number" && rawHours > 0 ? Math.round(rawHours * 10) / 10 : 0;
    return {
      category: cat.charAt(0).toUpperCase() + cat.slice(1),
      hours,
      color: CATEGORY_COLORS[cat.toLowerCase()] || "#4f46e5",
    };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Category Volume Bar Chart */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-0.5 tracking-tight">Complaint Volume by Category</h3>
        <p className="text-xs text-slate-500 mb-4 font-normal">Total issue frequency logged per category</p>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <XAxis dataKey="category" tick={{ fontSize: 11, fill: "#64748b" }} interval={0} angle={-25} textAnchor="end" />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f172a", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "12px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)" }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status Distribution Donut Chart */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-0.5 tracking-tight">Status Distribution</h3>
        <p className="text-xs text-slate-500 mb-4 font-normal">Current state breakdown of all hostel tickets</p>
        <div className="h-64 w-full flex items-center justify-center">
          {statusData.length === 0 ? (
            <p className="text-xs text-slate-400">No status telemetry available</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || "#64748b"} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "12px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)" }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-2 text-xs">
          {statusData.map((item) => (
            <div key={item.name} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200/60 shadow-2xs">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[item.name] || "#64748b" }} />
              <span className="text-slate-700 font-medium text-[11px]">{item.name}: <strong className="text-slate-900">{item.value}</strong></span>
            </div>
          ))}
        </div>
      </div>

      {/* Average Resolution Time by Category */}
      <div className="bg-white/90 backdrop-blur-xl p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-card lg:col-span-2">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">Mean Resolution Turnaround by Category</h3>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/70">
            Target SLA: &lt; 24h
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-4 font-normal">Mean elapsed hours from ticket submission to verified resolution</p>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={resolutionData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
              <XAxis
                dataKey="category"
                tick={{ fontSize: 11, fill: "#64748b" }}
                interval={0}
                angle={-25}
                textAnchor="end"
              />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} unit="h" allowDecimals={false} domain={[0, "auto"]} />
              <Tooltip
                formatter={(val) => [val === 0 ? "0 hours (no resolved tickets)" : `${val} hours`, "Mean Resolution"]}
                contentStyle={{ backgroundColor: "#0f172a", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "12px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)" }}
              />
              <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
                {resolutionData.map((entry, index) => (
                  <Cell key={`res-cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

