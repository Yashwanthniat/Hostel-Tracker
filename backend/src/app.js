import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cron from "node-cron";

import authRoutes from "./routes/auth.js";
import complaintRoutes from "./routes/complaints.js";
import aiRoutes from "./routes/ai.js";
import analyticsRoutes from "./routes/analytics.js";
import escalateRoutes from "./routes/escalate.js";
import { escalationService } from "./services/escalationService.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({ limit: "10mb" }));

// Request logger for auditability
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "hostel-fix-api",
    time: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/escalate", escalateRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("[Unhandled Error]:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

// Hourly Automatic Escalation Engine (Runs at minute 0 of every hour)
cron.schedule("0 * * * *", async () => {
  console.log("[Cron Job] Running automated hourly escalation sweep...");
  try {
    await escalationService.runEscalationSweep(24);
  } catch (err) {
    console.error("[Cron Job] Automated escalation sweep encountered an error:", err);
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Hostel Fix Backend running on http://localhost:${PORT}`);
  console.log(`⚡ Auto-Escalation Engine active (24h SLA monitoring)`);
  console.log(`🤖 Gemini AI Triage & Analytics endpoints ready`);
  console.log(`====================================================`);
});

export default app;
