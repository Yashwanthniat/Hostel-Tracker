import express from "express";
import { dbService } from "../services/dbService.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { complaintSchema, statusUpdateSchema } from "../schemas/zodSchemas.js";

const router = express.Router();

// GET /api/categories - list all categories
router.get("/categories", authenticate, async (req, res) => {
  try {
    const categories = await dbService.getCategories();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// POST /api/complaints - Create complaint (Student role)
router.post("/", authenticate, validate(complaintSchema), async (req, res) => {
  try {
    const { category_id, description, room_number, photo_url } = req.body;
    const student_id = req.user.id;

    // Use student profile room_number if not explicitly provided in body
    const room = room_number || req.user.room_number || "Unassigned";

    const complaint = await dbService.createComplaint({
      student_id,
      category_id: category_id || null,
      description,
      photo_url,
      room_number: room,
    });

    res.status(201).json(complaint);
  } catch (err) {
    res.status(400).json({ error: err.message || "Failed to create complaint" });
  }
});

// GET /api/complaints - List complaints (RLS / role aware)
router.get("/", authenticate, async (req, res) => {
  try {
    const { status, category_id, search, my_only } = req.query;

    const complaints = await dbService.getComplaints({
      user: {
        id: req.user.id,
        role: req.user.role,
        myOnly: my_only === "true",
      },
      status: status || null,
      category_id: category_id || null,
      search: search || null,
    });

    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch complaints" });
  }
});

// GET /api/complaints/:id - Detail + StatusLog history
router.get("/:id", authenticate, async (req, res) => {
  try {
    const complaint = await dbService.getComplaintById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    // Students can only view their own if strict isolation is applied, or view all on public board
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch complaint details" });
  }
});

// PATCH /api/complaints/:id/status - Update status with state machine enforcement & atomic log
router.patch("/:id/status", authenticate, validate(statusUpdateSchema), async (req, res) => {
  try {
    const { new_status, note, assigned_staff_id } = req.body;
    const complaintId = req.params.id;

    const updated = await dbService.updateComplaintStatus({
      complaint_id: complaintId,
      new_status,
      changed_by: req.user.id,
      note,
      assigned_staff_id: assigned_staff_id || (req.user.role === "staff" ? req.user.id : undefined),
      userRole: req.user.role,
    });

    res.json({
      message: `Status updated to ${new_status}`,
      complaint: updated,
    });
  } catch (err) {
    res.status(400).json({ error: err.message || "Failed to update complaint status" });
  }
});

export default router;
