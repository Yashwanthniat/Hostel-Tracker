import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { complaintSchema } from "../schemas/zodSchemas";
import { CategorySuggestionChip } from "./CategorySuggestionChip";
import { api } from "../lib/api";
import { Send, Upload, Sparkles, AlertCircle, CheckCircle2, X, ArrowRight, DoorOpen } from "lucide-react";
import confetti from "canvas-confetti";

export const ComplaintForm = ({
  initialRoomNumber = "",
  categories = [],
  onSubmitSuccess,
}) => {
  const [suggestion, setSuggestion] = useState(null);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [dismissedSuggestion, setDismissedSuggestion] = useState(false);
  const [serverError, setServerError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const debounceTimerRef = useRef(null);
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      room_number: initialRoomNumber || "",
      category_id: null,
      description: "",
      photo_url: "",
    },
  });

  const watchedCategory = watch("category_id");
  const watchedDescription = watch("description");

  // AI Category Suggestion Debounce
  useEffect(() => {
    if (watchedCategory || dismissedSuggestion || !watchedDescription || watchedDescription.length < 8) {
      setSuggestion(null);
      setIsSuggesting(false);
      return;
    }

    clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        setIsSuggesting(true);
        const result = await api.ai.suggestCategory(watchedDescription);
        if (result && result.category && !watchedCategory) {
          setSuggestion(result);
        }
      } catch (err) {
        // Non-blocking
      } finally {
        setIsSuggesting(false);
      }
    }, 600);

    return () => clearTimeout(debounceTimerRef.current);
  }, [watchedDescription, watchedCategory, dismissedSuggestion]);

  const handleApplySuggestion = () => {
    if (suggestion) {
      const match = categories.find(
        (c) => c.name.toLowerCase() === suggestion.category.toLowerCase()
      );
      if (match) {
        setValue("category_id", match.id, { shouldValidate: true });
      }
      setSuggestion(null);
    }
  };

  const handleDismissSuggestion = () => {
    setDismissedSuggestion(true);
    setSuggestion(null);
  };

  const processFile = (file) => {
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result;
      setPreviewUrl(dataUrl);
      setValue("photo_url", dataUrl, { shouldValidate: true });
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    setValue("photo_url", "", { shouldValidate: true });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onFormSubmit = async (data) => {
    setServerError("");
    try {
      const payload = {
        description: data.description,
        room_number: data.room_number,
        category_id: data.category_id ? Number(data.category_id) : null,
        photo_url: data.photo_url || null,
      };

      const result = await api.complaints.create(payload);
      
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (e) {}

      reset();
      setSelectedFile(null);
      setPreviewUrl("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      if (onSubmitSuccess) {
        onSubmitSuccess(result);
      }
    } catch (err) {
      setServerError(err.message || "Failed to submit complaint");
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
      {serverError && (
        <div className="flex items-center gap-2.5 p-3.5 bg-rose-50 border border-rose-200/80 rounded-2xl text-xs text-rose-700 shadow-2xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Room Number & Category Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Room Number */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
            Room Number <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. B-204"
              {...register("room_number")}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all font-semibold"
            />
            <DoorOpen className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          {errors.room_number && (
            <p className="mt-1 text-xs text-rose-600 font-medium">{errors.room_number.message}</p>
          )}
        </div>

        {/* Category Dropdown (Optional with AI assist) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Category <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <span className="text-[11px] text-indigo-600 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              AI auto-triage
            </span>
          </div>
          <select
            {...register("category_id")}
            className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/90 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all font-medium text-slate-800 cursor-pointer"
          >
            <option value="">Let Gemini AI Triage It</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)} — {cat.default_staff_group}
              </option>
            ))}
          </select>
          {errors.category_id && (
            <p className="mt-1 text-xs text-rose-600 font-medium">{errors.category_id.message}</p>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            Issue Description <span className="text-rose-500">*</span>
          </label>
          <span className="text-[11px] text-slate-400 font-medium">Min 10 characters</span>
        </div>
        <textarea
          rows={4}
          placeholder="Please be specific: What is broken? Where is it located? Is water or electricity involved?"
          {...register("description")}
          className="w-full p-4 bg-slate-50/70 border border-slate-200/90 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all leading-relaxed placeholder:text-slate-400"
        />
        {errors.description && (
          <p className="mt-1 text-xs text-rose-600 font-medium">{errors.description.message}</p>
        )}
      </div>

      {/* Real-Time AI Category Suggestion Advisory Chip */}
      {(isSuggesting || suggestion) && (
        <CategorySuggestionChip
          category={suggestion?.category}
          confidence={suggestion?.confidence}
          isLoading={isSuggesting}
          onApply={handleApplySuggestion}
          onDismiss={handleDismissSuggestion}
        />
      )}

      {/* Photo Evidence Dropzone/Input */}
      <div>
        <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
          Photo Evidence <span className="text-slate-400 font-normal">(Optional)</span>
        </label>

        {previewUrl ? (
          <div className="relative flex items-center gap-3 p-3 bg-slate-50/80 border border-slate-200 rounded-2xl shadow-2xs">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-200 flex-shrink-0 border border-slate-300">
              <img
                src={previewUrl}
                alt="Upload preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate">
                {selectedFile?.name || "Attached Photo Evidence"}
              </p>
              <p className="text-[11px] text-slate-400">
                {selectedFile?.size ? `${Math.round(selectedFile.size / 1024)} KB` : "Image preview"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleRemoveFile}
              className="p-1.5 rounded-lg bg-slate-200/70 hover:bg-rose-100 hover:text-rose-600 text-slate-600 transition-colors cursor-pointer"
              title="Remove photo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2 group ${
              isDragging
                ? "border-indigo-500 bg-indigo-50/50"
                : "border-slate-200/90 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="p-2.5 rounded-xl bg-indigo-50/80 border border-indigo-100/80 text-indigo-600 group-hover:scale-105 transition-all">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700">
                <span className="text-indigo-600 hover:underline">Click to upload</span> or drag and drop
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, or WEBP (Max 5MB)</p>
            </div>
          </div>
        )}

        {errors.photo_url && (
          <p className="mt-1 text-xs text-rose-600 font-medium">{errors.photo_url.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="group w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:from-indigo-700 text-white font-semibold text-sm shadow-soft shadow-indigo-600/25 transition-all duration-200 disabled:opacity-50 cursor-pointer"
      >
        {isSubmitting ? (
          <span>Filing Grievance & Starting 24h SLA...</span>
        ) : (
          <>
            <span>Submit Grievance to Board</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>
    </form>
  );
};

