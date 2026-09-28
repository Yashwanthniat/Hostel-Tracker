import express from "express";
import rateLimit from "express-rate-limit";
import { geminiService } from "../services/geminiService.js";
import { dbService } from "../services/dbService.js";
import { authenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/roleGuard.js";
import { validate } from "../middleware/validate.js";
import { suggestCategorySchema } from "../schemas/zodSchemas.js";

const router = express.Router();

// Rate limiting for AI endpoints: 10 requests per minute per IP / User
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20, // generous allowance for typing debounce
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

// GET /api/ai/weekly-summary - Gemini weekly digest for warden (Admin only)
router.get("/weekly-summary", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const pastWeekComplaints = await dbService.getPastWeekComplaints();
    const summary = await geminiService.generateWeeklySummary(pastWeekComplaints);
    res.json({
      ...summary,
      complaint_sample_size: pastWeekComplaints.length,
      generated_at: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate weekly AI summary" });
  }
});

export default router;
