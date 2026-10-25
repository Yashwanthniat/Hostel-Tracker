import express from "express";
import { dbService } from "../services/dbService.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// GET /api/notifications - List in-portal notifications with unread count
router.get("/", authenticate, async (req, res) => {
  try {
    const data = await dbService.getNotifications({
      userId: req.user.id,
      role: req.user.role,
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// PATCH /api/notifications/read-all - Mark all notifications as read
router.patch("/read-all", authenticate, async (req, res) => {
  try {
    const result = await dbService.markAllNotificationsRead(req.user.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to mark notifications read" });
  }
});

// PATCH /api/notifications/:id/read - Mark specific notification as read
router.patch("/:id/read", authenticate, async (req, res) => {
  try {
    const result = await dbService.markNotificationRead(req.params.id, req.user.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to mark notification read" });
  }
});

export default router;
