# Hostel Fix — AI-Powered Hostel Complaint & Accountability Tracker

> **Accountability Made Visible**: Replace informal, untracked complaint channels (WhatsApp groups, paper registers, verbal reports) with an immutable, transparent system where every hostel grievance has a permanent record, an explicit state machine, an automatic 24-hour escalation engine, and server-side Gemini AI operational intelligence.

---

## 🌟 Key Capabilities

1. **Role-Based Workflows**:
   - **Student**: File complaints with auto-filled room numbers, receive real-time Gemini category suggestions, view public Kanban board, and confirm or dispute resolution outcomes.
   - **Staff (Maintenance)**: View assigned triage queue, pick up open complaints (`IN_PROGRESS`), and mark repairs completed (`RESOLVED_PENDING`) with mandatory audit notes.
   - **Admin (Warden)**: Access high-level analytics, trigger manual escalation sweeps, promote user roles, and generate weekly Gemini operational intelligence digests.

2. **Explicit State Machine**:
   - `OPEN` → `IN_PROGRESS` → `RESOLVED_PENDING` → `CLOSED`
   - Disputed resolution: `RESOLVED_PENDING` → `REOPENED` (resets to `OPEN`, maintains escalation level, flags repeat issue).
   - Administrative overrides supported.

3. **Immutable Audit Trail (`status_log`)**:
   - Every single status change records previous status, new status, actor ID, actor role, timestamp, and audit notes.

4. **24-Hour Auto-Escalation Engine**:
   - Runs automatically on an hourly cron schedule (`0 * * * *`) and on-demand via `POST /api/escalate/run`.
   - Any ticket left in `OPEN` or `IN_PROGRESS` for > 24 hours without an update has its `escalation_level` incremented and is flagged with visual pulse warnings.

5. **Server-Side Gemini AI Integration (`@google/genai`)**:
   - **Category Triage Suggestion**: Classifies student descriptions into `electrical`, `plumbing`, `mess`, `cleaning`, `internet`, `furniture`, `other` with confidence scores.
   - **Weekly Operations Digest**: Synthesizes 7-day complaint telemetry into an executive headline, top issues, recurring room hotspots, category turnaround SLAs, and actionable warden directives.

6. **Defense-in-Depth Security**:
   - Supabase Row Level Security (RLS) policies at the database layer.
   - Express JWT authentication and role-guard middlewares.
   - Rate limiting on AI triage routes.
   - Server-side only Gemini API key.

---

## 🚀 Quick Start (Running Locally)

The application includes an embedded zero-configuration database mode so that you can run both backend and frontend immediately without waiting for Supabase credentials.

### 1. Start the Backend API
```bash
cd hostel-fix/backend
npm install
npm run dev
```
Backend will start on: **`http://localhost:5000`**

### 2. Start the Frontend App
```bash
cd hostel-fix/frontend
npm install
npm run dev
```
Frontend will start on: **`http://localhost:3000`**

---

## 🔑 Pre-Seeded Test Credentials

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Student** | `student@hostelfix.edu` | `password123` | Room B-204 (Alex Turner) |
| **Staff** | `staff@hostelfix.edu` | `password123` | Maintenance Technician (Marcus Vance) |
| **Admin (Warden)** | `admin@hostelfix.edu` | `password123` | Chief Warden (Dr. Sarah Jenkins) |

*(One-click demo login buttons are also available directly on the `/login` screen).*

---

## 🗄️ Supabase PostgreSQL Setup & Migrations

To connect to your hosted Supabase PostgreSQL project:
1. Open the Supabase SQL Editor.
2. Execute [`supabase/migrations/01_schema.sql`](file:///c:/Users/DELL/Desktop/New%20folder/hostel-fix/supabase/migrations/01_schema.sql).
3. Execute [`supabase/migrations/02_rls.sql`](file:///c:/Users/DELL/Desktop/New%20folder/hostel-fix/supabase/migrations/02_rls.sql).
4. Update `hostel-fix/backend/.env`:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   GEMINI_API_KEY=your_gemini_api_key
   ```
5. Update `hostel-fix/frontend/.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

---

## 📡 Backend API Reference

| Method | Endpoint | Role | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Public | Register student, staff, or admin |
| `POST` | `/api/auth/login` | Public | Authenticate and obtain JWT |
| `GET` | `/api/auth/me` | Authenticated | Fetch current profile |
| `GET` | `/api/complaints` | Authenticated | List complaints (with status/category/search filters) |
| `POST` | `/api/complaints` | Student | File a complaint (Zod validated) |
| `GET` | `/api/complaints/:id` | Authenticated | Complaint detail + full audit log |
| `PATCH` | `/api/complaints/:id/status` | Staff, Admin, Student | Update status, enforce state machine, append `status_log` |
| `POST` | `/api/ai/suggest-category` | Student | Gemini category triage suggestion |
| `GET` | `/api/ai/weekly-summary` | Admin | Gemini 7-day operational intelligence summary |
| `GET` | `/api/analytics/overview` | Admin, Staff | Aggregated volume, resolution SLAs, hot rooms |
| `POST` | `/api/escalate/run` | Admin, Staff | Trigger immediate 24-hour escalation engine sweep |
