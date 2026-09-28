import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { dbService } from "../services/dbService.js";
import { validate } from "../middleware/validate.js";
import { signupSchema, loginSchema } from "../schemas/zodSchemas.js";
import { authenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/roleGuard.js";

dotenv.config();
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "hostelfix_super_secret_jwt_key_2026";

// Signup
router.post("/signup", validate(signupSchema), async (req, res) => {
  try {
    const { email, password, full_name, role, room_number } = req.body;
    const user = await dbService.createUser({
      email,
      password,
      full_name,
      role,
      room_number: role === "student" ? room_number : null,
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Account created successfully",
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        room_number: user.room_number,
      },
    });
  } catch (err) {
    res.status(400).json({ error: err.message || "Failed to create account" });
  }
});

// Login
router.post("/login", validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await dbService.verifyPassword(email, password);

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        room_number: user.room_number,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

// Current User Profile
router.get("/me", authenticate, async (req, res) => {
  try {
    const user = await dbService.getUserById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      room_number: user.room_number,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Update Profile (e.g. room number)
router.patch("/profile", authenticate, async (req, res) => {
  try {
    const { full_name, room_number } = req.body;
    const updated = await dbService.updateUserProfile(req.user.id, { full_name, room_number });
    res.json({
      id: updated.id,
      email: updated.email,
      full_name: updated.full_name,
      role: updated.role,
      room_number: updated.room_number,
    });
  } catch (err) {
    res.status(400).json({ error: err.message || "Failed to update profile" });
  }
});

// Admin: Get all users
router.get("/users", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const users = await dbService.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Admin: Update user role
router.patch("/users/:id/role", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const { role } = req.body;
    if (!["student", "staff", "admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }
    const updated = await dbService.updateUserRole(req.params.id, role);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message || "Failed to update role" });
  }
});

export default router;
