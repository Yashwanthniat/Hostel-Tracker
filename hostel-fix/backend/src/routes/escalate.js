import express from "express";
import { escalationService } from "../services/escalationService.js";
import { authenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/roleGuard.js";

const router = express.Router();

// POST /api/escalate/run - Trigger an immediate escalation sweep (Admin or cron)
router.post("/run", authenticate, requireRole("admin", "staff"), async (req, res) => {
  try {
    const hours = req.query.hours ? Number(req.query.hours) : 24;
    const report = await escalationService.runEscalationSweep(hours);
    res.json({
      message: `Escalation sweep completed successfully`,
      ...report,
    });
  } catch (err) {
    res.status(500).json({ error: "Escalation sweep failed to execute" });
  }
});

export default router;
