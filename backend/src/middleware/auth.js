import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { supabase, isSupabaseConfigured } from "../services/supabaseClient.js";
import { dbService } from "../services/dbService.js";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "hostelfix_super_secret_jwt_key_2026";

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authorization token required" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // 1. If Supabase is configured, verify with Supabase Auth
    if (isSupabaseConfigured && supabase) {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        return res.status(401).json({ error: "Invalid or expired Supabase token" });
      }

      // Fetch profile from DB to get role & room
      const profile = await dbService.getUserById(user.id);
      req.user = {
        id: user.id,
        email: user.email,
        role: profile?.role || "student",
        room_number: profile?.room_number || null,
        full_name: profile?.full_name || user.email,
      };
      return next();
    }

    // 2. Local JWT verification
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await dbService.getUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "User profile not found" });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      room_number: user.room_number,
      full_name: user.full_name,
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired authorization token" });
  }
};
