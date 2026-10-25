import express from "express";
import rateLimit from "express-rate-limit";
import crypto from "crypto";
import { geminiService } from "../services/geminiService.js";
import { dbService } from "../services/dbService.js";
import { authenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/roleGuard.js";
import { validate } from "../middleware/validate.js";
import { suggestCategorySchema } from "../schemas/zodSchemas.js";

const router = express.Router();

// Rate limiting for AI endpoints: generous allowance
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many AI requests. Please wait a minute before requesting triage or analysis again.",
  },
});

router.use(aiLimiter);

// POST /api/ai/suggest-category - Gemini triage classification
router.post("/suggest-category", authenticate, validate(suggestCategorySchema), async (req, res) => {
  try {
    const { description } = req.body;
    const result = await geminiService.suggestCategory(description);

    // Map category name to category_id
    const category = await dbService.getCategoryByName(result.category);

    res.json({
      category: result.category,
      category_id: category?.id || null,
      confidence: result.confidence,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate category suggestion" });
  }
});

// GET /api/ai/weekly-summary - Gemini weekly digest for warden with intelligent server-side caching
router.get("/weekly-summary", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const forceRefresh = req.query.force === "true";
    const pastWeekComplaints = await dbService.getPastWeekComplaints();

    // Compute deterministic ticket hash to invalidate cache if new escalation/dispute occurred
    const hashInput = pastWeekComplaints
      .map((c) => `${c.id}:${c.status}:${c.escalation_level}:${c.updated_at || c.created_at}`)
      .join("|");
    const ticketHash = crypto.createHash("md5").update(hashInput || "hostelfix_empty").digest("hex");

    if (!forceRefresh) {
      const cached = await dbService.getCachedWeeklySummary(ticketHash);
      if (cached) {
        return res.json({
          ...cached,
          complaint_sample_size: pastWeekComplaints.length,
          cached: true,
          ticket_hash: ticketHash,
        });
      }
    }

    const summary = await geminiService.generateWeeklySummary(pastWeekComplaints);
    const result = {
      ...summary,
      complaint_sample_size: pastWeekComplaints.length,
      generated_at: new Date().toISOString(),
      ticket_hash: ticketHash,
      cached: false,
    };

    // Cache in db
    await dbService.setCachedWeeklySummary(ticketHash, result);

    res.json(result);
  } catch (err) {
    console.error("Weekly AI summary error:", err);
    res.status(500).json({ error: "Failed to generate weekly AI summary" });
  }
});

export default router;
