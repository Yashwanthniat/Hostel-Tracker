import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
let aiClient = null;

if (apiKey && apiKey !== "placeholder_gemini_api_key" && apiKey.trim().length > 0) {
  aiClient = new GoogleGenAI({ apiKey });
}

const SYSTEM_PROMPT = `You are an operations analyst for a college hostel. You review complaint data and produce clear, factual summaries for hostel administration. You never invent data not present in the input. You flag patterns (repeat rooms, categories with rising volume, slow resolution categories) plainly and concisely, in plain English suitable for a warden with no data background.`;

const VALID_CATEGORIES = [
  "electrical",
  "plumbing",
  "mess",
  "cleaning",
  "internet",
  "furniture",
  "other",
];

// Heuristic fallback for category triage if API key is not configured or in offline test mode
function fallbackTriage(description) {
  const desc = description.toLowerCase();
  if (desc.match(/fan|light|wire|switch|socket|power|shock|spark|mcb|electricity|bulb/)) {
    return { category: "electrical", confidence: 0.92 };
  }
  if (desc.match(/water|pipe|leak|tap|faucet|basin|drain|flush|toilet|shower|bathroom/)) {
    return { category: "plumbing", confidence: 0.94 };
  }
  if (desc.match(/food|mess|meal|dinner|lunch|breakfast|dal|roti|rice|cook|taste|hygiene|canteen/)) {
    return { category: "mess", confidence: 0.91 };
  }
  if (desc.match(/clean|dust|sweep|mop|garbage|trash|smell|dirty|corridor|litter/)) {
    return { category: "cleaning", confidence: 0.89 };
  }
  if (desc.match(/wifi|wi-fi|internet|lan|router|ethernet|network|ping|disconnect|signal/)) {
    return { category: "internet", confidence: 0.95 };
  }
  if (desc.match(/bed|chair|table|desk|door|cupboard|almirah|window|hinge|lock|furniture/)) {
    return { category: "furniture", confidence: 0.88 };
  }
  return { category: "other", confidence: 0.5 };
}

// Fallback weekly summary generator based purely on factual source data
function fallbackWeeklySummary(complaints) {
  const count = complaints.length;
  if (count === 0) {
    return {
      headline: "No complaints filed in the past 7 days across the hostel.",
      top_issues: ["Zero complaints reported this week."],
      hot_rooms: [],
      avg_resolution_hours_by_category: {
        electrical: 0,
        plumbing: 0,
        mess: 0,
        cleaning: 0,
        internet: 0,
        furniture: 0,
        other: 0,
      },
      recommendation: "Maintain routine preventative maintenance checks during this quiet period.",
    };
  }

  // Count by category
  const catCounts = {};
  const roomCounts = {};
  const resHoursByCat = {};

  complaints.forEach((c) => {
    catCounts[c.category] = (catCounts[c.category] || 0) + 1;
    if (c.room_number && c.room_number !== "Unknown" && c.room_number !== "Unspecified") {
      roomCounts[c.room_number] = (roomCounts[c.room_number] || 0) + 1;
    }
    if (c.resolved_at && c.created_at) {
      const hrs = (new Date(c.resolved_at) - new Date(c.created_at)) / 3600000;
      if (hrs >= 0) {
        if (!resHoursByCat[c.category]) resHoursByCat[c.category] = [];
        resHoursByCat[c.category].push(hrs);
      }
    }
  });

  const sortedCats = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);
  const topCategory = sortedCats[0] ? sortedCats[0][0] : "general";

  const top_issues = sortedCats.slice(0, 3).map(([cat, cnt]) => `${cat.toUpperCase()}: ${cnt} complaint${cnt > 1 ? "s" : ""}`);

  const hot_rooms = Object.entries(roomCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([room, cnt]) => `${room}: ${cnt}`);

  const avg_resolution_hours_by_category = {
    electrical: 0,
    plumbing: 0,
    mess: 0,
    cleaning: 0,
    internet: 0,
    furniture: 0,
    other: 0,
  };

  Object.entries(resHoursByCat).forEach(([cat, times]) => {
    if (times.length > 0) {
      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      avg_resolution_hours_by_category[cat] = Number(avg.toFixed(1));
    }
  });

  return {
    headline: `Total of ${count} complaint${count > 1 ? "s" : ""} recorded in the past 7 days, led primarily by ${topCategory} issues.`,
    top_issues,
    hot_rooms,
    avg_resolution_hours_by_category,
    recommendation: `Deploy primary maintenance staff to address ${topCategory} backlog and audit rooms with repeat tickets.`,
  };
}

export const geminiService = {
  /**
   * Suggest category from complaint description using Gemini
   */
  async suggestCategory(description) {
    if (!description || typeof description !== "string") {
      return { category: "other", confidence: 0.5 };
    }

    if (!aiClient) {
      console.warn("[Gemini] API key not configured or invalid, using smart heuristic triage");
      return fallbackTriage(description);
    }

    try {
      const prompt = `Given this complaint description: "${description}", classify it into exactly one of: electrical, plumbing, mess, cleaning, internet, furniture, other.
Return JSON only: {"category": "...", "confidence": 0.0-1.0}`;

      const response = await aiClient.models.generateContent({
        model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      });

      const text = response?.text?.trim();
      if (!text) {
        return fallbackTriage(description);
      }

      const parsed = JSON.parse(text);
      const category = VALID_CATEGORIES.includes(parsed.category?.toLowerCase())
        ? parsed.category.toLowerCase()
        : "other";

      const confidence = typeof parsed.confidence === "number"
        ? Math.min(1.0, Math.max(0.0, parsed.confidence))
        : 0.85;

      return { category, confidence };
    } catch (err) {
      console.error("[Gemini] Suggest category call failed, falling back:", err?.message || err);
      return fallbackTriage(description);
    }
  },

  /**
   * Generate weekly summary of complaints for warden
   */
  async generateWeeklySummary(complaints) {
    if (!aiClient) {
      console.warn("[Gemini] API key not configured, generating analytical digest from source data");
      return fallbackWeeklySummary(complaints);
    }

    try {
      const complaints_json = JSON.stringify(
        complaints.map((c) => ({
          category: c.category,
          description: c.description,
          status: c.status,
          escalation_level: c.escalation_level,
          room_number: c.room_number,
          created_at: c.created_at,
          resolved_at: c.resolved_at,
        }))
      );

      const prompt = `Given this JSON array of complaints from the past 7 days: ${complaints_json}
Produce a summary. Return JSON only:
{
  "headline": "one sentence overview",
  "top_issues": ["...", "..."],
  "hot_rooms": ["room_number: complaint_count"],
  "avg_resolution_hours_by_category": {"electrical": 12.5, ...},
  "recommendation": "one actionable sentence for the warden"
}`;

      const response = await aiClient.models.generateContent({
        model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const text = response?.text?.trim();
      if (!text) {
        return fallbackWeeklySummary(complaints);
      }

      const parsed = JSON.parse(text);

      // Verify schema conformity
      return {
        headline: typeof parsed.headline === "string" ? parsed.headline : "Weekly hostel maintenance digest.",
        top_issues: Array.isArray(parsed.top_issues) ? parsed.top_issues : [],
        hot_rooms: Array.isArray(parsed.hot_rooms) ? parsed.hot_rooms : [],
        avg_resolution_hours_by_category: typeof parsed.avg_resolution_hours_by_category === "object" && parsed.avg_resolution_hours_by_category !== null
          ? parsed.avg_resolution_hours_by_category
          : {},
        recommendation: typeof parsed.recommendation === "string" ? parsed.recommendation : "Review open tickets with maintenance staff.",
      };
    } catch (err) {
      console.error("[Gemini] Weekly summary call failed, using source data digest:", err?.message || err);
      return fallbackWeeklySummary(complaints);
    }
  },
};
