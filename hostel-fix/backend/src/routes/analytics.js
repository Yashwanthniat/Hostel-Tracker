import express from "express";
import { dbService } from "../services/dbService.js";
import { authenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/roleGuard.js";

const router = express.Router();

// GET /api/analytics/overview - Admin & Staff dashboard analytics
router.get("/overview", authenticate, requireRole("admin", "staff"), async (req, res) => {
  try {
    const overview = await dbService.getAnalyticsOverview();
    res.json(overview);
  } catch (err) {
    res.status(500).json({ error: "Failed to generate analytics overview" });
  }
});

export default router;
