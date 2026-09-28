import React from "react";
import { Sparkles, X, Check } from "lucide-react";

export const CategorySuggestionChip = ({
  category,
  confidence,
  onApply,
  onDismiss,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-2.5 bg-indigo-50/80 border border-indigo-100 rounded-xl text-xs text-indigo-700 animate-pulse">
        <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
        <span>Gemini AI is analyzing complaint context...</span>
      </div>
    );
  }

  if (!category) return null;

  const confidencePct = Math.round((confidence || 0.85) * 100);

  return (
    <div className="flex items-center justify-between gap-3 p-2.5 bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 border border-indigo-200/80 rounded-xl shadow-sm text-xs">
      <div className="flex items-center gap-2 min-w-0">
        <div className="p-1 bg-indigo-600 text-white rounded-lg shadow-sm flex-shrink-0">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
        <div className="truncate">
          <span className="font-semibold text-indigo-950">AI Advisory: </span>
          <span className="text-slate-700">Classified as </span>
          <span className="font-bold text-indigo-700 uppercase tracking-wide px-1.5 py-0.5 bg-indigo-100 rounded-md">
            {category}
          </span>
          <span className="text-slate-500 ml-1">({confidencePct}% match)</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          type="button"
          onClick={onApply}
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <Check className="w-3 h-3" />
          <span>Apply</span>
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors cursor-pointer"
          title="Dismiss suggestion"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
