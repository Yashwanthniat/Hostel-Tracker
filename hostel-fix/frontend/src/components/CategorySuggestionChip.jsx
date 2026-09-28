import React from "react";
import { Sparkles, X, Check, ArrowRight } from "lucide-react";

export const CategorySuggestionChip = ({
  category,
  confidence,
  onApply,
  onDismiss,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2.5 p-3 bg-indigo-50/80 border border-indigo-200/60 rounded-2xl text-xs text-indigo-700 animate-pulse">
        <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
        <span className="font-medium">Gemini AI is analyzing complaint context...</span>
      </div>
    );
  }

  if (!category) return null;

  const confidencePct = Math.round((confidence || 0.85) * 100);

  return (
    <div className="relative overflow-hidden flex items-center justify-between gap-3 p-3 bg-gradient-to-r from-indigo-50/90 via-violet-50/90 to-indigo-50/90 border border-indigo-200/80 rounded-2xl shadow-soft text-xs animate-fadeIn">
      {/* Top subtle border shine */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent" />

      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-2xs flex-shrink-0">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
        <div className="truncate">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-slate-800">Gemini Triage Suggestion:</span>
            <span className="font-extrabold text-indigo-700 uppercase tracking-wide px-2 py-0.5 bg-white/90 border border-indigo-200/70 rounded-md shadow-2xs">
              {category}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">({confidencePct}% match)</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Click Apply to set category and assign maintenance queue.</p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          type="button"
          onClick={onApply}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold rounded-xl shadow-soft shadow-indigo-600/20 transition-all cursor-pointer text-xs"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Apply</span>
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white/60 rounded-xl transition-colors cursor-pointer"
          title="Dismiss suggestion"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

