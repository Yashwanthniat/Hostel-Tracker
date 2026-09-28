import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { supabase, isSupabaseConfigured } from "./supabaseClient.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, "../../data/hostel_db.json");

// Ensure data directory exists
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initial seed categories
const INITIAL_CATEGORIES = [
  { id: 1, name: "electrical", default_staff_group: "Electrical Maintenance" },
  { id: 2, name: "plumbing", default_staff_group: "Plumbing & Water Supply" },
  { id: 3, name: "mess", default_staff_group: "Mess & Food Quality Committee" },
  { id: 4, name: "cleaning", default_staff_group: "Sanitation & Housekeeping" },
  { id: 5, name: "internet", default_staff_group: "IT & Network Support" },
  { id: 6, name: "furniture", default_staff_group: "Carpentry & Facilities" },
  { id: 7, name: "other", default_staff_group: "General Operations" },
];

const INITIAL_USERS = [
  {
    id: "d0000000-0000-0000-0000-000000000001",
    email: "student@hostelfix.edu",
    password_hash: bcrypt.hashSync("password123", 10),
    full_name: "Alex Turner",
    role: "student",
    room_number: "B-204",
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: "d0000000-0000-0000-0000-000000000002",
    email: "staff@hostelfix.edu",
    password_hash: bcrypt.hashSync("password123", 10),
    full_name: "Marcus Vance",
    role: "staff",
    room_number: null,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: "d0000000-0000-0000-0000-000000000003",
    email: "admin@hostelfix.edu",
    password_hash: bcrypt.hashSync("password123", 10),
    full_name: "Dr. Sarah Jenkins (Warden)",
    role: "admin",
    room_number: "Warden Office",
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
];

const INITIAL_COMPLAINTS = [
  {
    id: "c0000000-0000-0000-0000-000000000001",
    student_id: "d0000000-0000-0000-0000-000000000001",
    category_id: 1,
    description: "Ceiling fan sparking and vibrating dangerously on speed 3",
    photo_url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
    status: "IN_PROGRESS",
    escalation_level: 0,
    assigned_staff_id: "d0000000-0000-0000-0000-000000000002",
    created_at: new Date(Date.now() - 18 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 3600000).toISOString(),
    resolved_at: null,
  },
  {
    id: "c0000000-0000-0000-0000-000000000002",
    student_id: "d0000000-0000-0000-0000-000000000001",
    category_id: 2,
    description: "Wash basin pipe leaking continuously under sink, soaking floor",
    photo_url: null,
    status: "OPEN",
    escalation_level: 1,
    assigned_staff_id: null,
    created_at: new Date(Date.now() - 36 * 3600000).toISOString(), // > 24h old (escalated)
    updated_at: new Date(Date.now() - 36 * 3600000).toISOString(),
    resolved_at: null,
  },
  {
    id: "c0000000-0000-0000-0000-000000000003",
    student_id: "d0000000-0000-0000-0000-000000000001",
    category_id: 3,
    description: "Dinner dal was served cold and undercooked with sour smell",
    photo_url: null,
    status: "RESOLVED_PENDING",
    escalation_level: 0,
    assigned_staff_id: "d0000000-0000-0000-0000-000000000002",
    created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    resolved_at: new Date(Date.now() - 4 * 3600000).toISOString(),
  },
  {
    id: "c0000000-0000-0000-0000-000000000004",
    student_id: "d0000000-0000-0000-0000-000000000001",
    category_id: 5,
    description: "Wi-Fi access point in 2nd floor corridor dropping packets every 2 minutes",
    photo_url: null,
    status: "CLOSED",
    escalation_level: 0,
    assigned_staff_id: "d0000000-0000-0000-0000-000000000002",
    created_at: new Date(Date.now() - 96 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    resolved_at: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
];

const INITIAL_STATUS_LOGS = [
  {
    id: "s0000000-0000-0000-0000-000000000001",
    complaint_id: "c0000000-0000-0000-0000-000000000001",
    old_status: "NONE",
    new_status: "OPEN",
    changed_by: "d0000000-0000-0000-0000-000000000001",
    note: "Complaint submitted by student",
    timestamp: new Date(Date.now() - 18 * 3600000).toISOString(),
  },
  {
    id: "s0000000-0000-0000-0000-000000000002",
    complaint_id: "c0000000-0000-0000-0000-000000000001",
    old_status: "OPEN",
    new_status: "IN_PROGRESS",
    changed_by: "d0000000-0000-0000-0000-000000000002",
    note: "Assigned to Marcus Vance. Replacement capacitor requested.",
    timestamp: new Date(Date.now() - 10 * 3600000).toISOString(),
  },
  {
    id: "s0000000-0000-0000-0000-000000000003",
    complaint_id: "c0000000-0000-0000-0000-000000000002",
    old_status: "NONE",
    new_status: "OPEN",
    changed_by: "d0000000-0000-0000-0000-000000000001",
    note: "Submitted by student",
    timestamp: new Date(Date.now() - 36 * 3600000).toISOString(),
  },
  {
    id: "s0000000-0000-0000-0000-000000000004",
    complaint_id: "c0000000-0000-0000-0000-000000000002",
    old_status: "OPEN",
    new_status: "OPEN",
    changed_by: "d0000000-0000-0000-0000-000000000003",
    note: "[AUTO-ESCALATION] Complaint remained unresolved >24h. Escalation Level 1.",
    timestamp: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
  {
    id: "s0000000-0000-0000-0000-000000000005",
    complaint_id: "c0000000-0000-0000-0000-000000000003",
    old_status: "NONE",
    new_status: "OPEN",
    changed_by: "d0000000-0000-0000-0000-000000000001",
    note: "Submitted by student",
    timestamp: new Date(Date.now() - 48 * 3600000).toISOString(),
  },
  {
    id: "s0000000-0000-0000-0000-000000000006",
    complaint_id: "c0000000-0000-0000-0000-000000000003",
    old_status: "OPEN",
    new_status: "RESOLVED_PENDING",
    changed_by: "d0000000-0000-0000-0000-000000000002",
    note: "Mess contractor informed and head cook issued warning.",
    timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
  },
];

// Helper to read local data
function readData() {
  if (!fs.existsSync(DATA_FILE)) {
    const initial = {
      categories: INITIAL_CATEGORIES,
      users: INITIAL_USERS,
      complaints: INITIAL_COMPLAINTS,
      status_logs: INITIAL_STATUS_LOGS,
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), "utf8");
    return initial;
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading data file, reinitializing", err);
    const initial = {
      categories: INITIAL_CATEGORIES,
      users: INITIAL_USERS,
      complaints: INITIAL_COMPLAINTS,
      status_logs: INITIAL_STATUS_LOGS,
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), "utf8");
    return initial;
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

export const dbService = {
  // ----------------------------------------------------
  // CATEGORIES
  // ----------------------------------------------------
  async getCategories() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from("categories").select("*").order("id");
      if (!error && data?.length) return data;
    }
    const db = readData();
    return db.categories;
  },

  async getCategoryByName(name) {
    const categories = await this.getCategories();
    return categories.find((c) => c.name.toLowerCase() === name.toLowerCase()) || null;
  },

  // ----------------------------------------------------
  // USERS & PROFILES
  // ----------------------------------------------------
  async getUserByEmail(email) {
    const db = readData();
    return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async getUserById(id) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single();
      if (!error && data) return data;
    }
    const db = readData();
    return db.users.find((u) => u.id === id) || null;
  },

  async createUser({ email, password, full_name, role, room_number }) {
    if (isSupabaseConfigured) {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name, role, room_number },
      });
      if (!authError && authData?.user) {
        await supabase.from("profiles").upsert({
          id: authData.user.id,
          full_name,
          role,
          room_number: role === "student" ? room_number : null,
        });
        return {
          id: authData.user.id,
          email,
          full_name,
          role,
          room_number,
        };
      }
    }

    const db = readData();
    const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error("User with this email already exists");
    }

    const newUser = {
      id: crypto.randomUUID(),
      email,
      password_hash: bcrypt.hashSync(password, 10),
      full_name,
      role,
      room_number: role === "student" ? room_number : null,
      created_at: new Date().toISOString(),
    };

    db.users.push(newUser);
    writeData(db);
    return newUser;
  },

  async verifyPassword(email, password) {
    const db = readData();
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return null;
    const match = bcrypt.compareSync(password, user.password_hash);
    if (!match) return null;
    return user;
  },

  async getAllUsers() {
    if (isSupabaseConfigured) {
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (data) return data;
    }
    const db = readData();
    return db.users.map(({ password_hash, ...u }) => u);
  },

  async updateUserRole(userId, newRole) {
    if (isSupabaseConfigured) {
      await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
    }
    const db = readData();
    const user = db.users.find((u) => u.id === userId);
    if (!user) throw new Error("User not found");
    user.role = newRole;
    writeData(db);
    return user;
  },

  async updateUserProfile(userId, { full_name, room_number }) {
    if (isSupabaseConfigured) {
      await supabase.from("profiles").update({ full_name, room_number }).eq("id", userId);
    }
    const db = readData();
    const user = db.users.find((u) => u.id === userId);
    if (!user) throw new Error("User not found");
    if (full_name !== undefined) user.full_name = full_name;
    if (room_number !== undefined) user.room_number = room_number;
    writeData(db);
    return user;
  },

  // ----------------------------------------------------
  // COMPLAINTS
  // ----------------------------------------------------
  async getComplaints({ user, status, category_id, search, limit = 100 }) {
    // Note: Public board is visible to all authenticated users as per requirements.
    // If student queries with my_only=true, filter to their complaints.
    const db = readData();
    let complaints = [...db.complaints];

    // Filter by student if requested or required
    if (user?.role === "student" && user?.myOnly) {
      complaints = complaints.filter((c) => c.student_id === user.id);
    }

    if (status) {
      complaints = complaints.filter((c) => c.status === status);
    }

    if (category_id) {
      complaints = complaints.filter((c) => c.category_id === Number(category_id));
    }

    if (search) {
      const q = search.toLowerCase();
      complaints = complaints.filter((c) => c.description.toLowerCase().includes(q));
    }

    // Sort descending by updated_at / created_at
    complaints.sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at));

    // Hydrate joined data (category, student, staff)
    const hydrated = complaints.slice(0, limit).map((c) => {
      const student = db.users.find((u) => u.id === c.student_id);
      const staff = db.users.find((u) => u.id === c.assigned_staff_id);
      const category = db.categories.find((cat) => cat.id === c.category_id);
      return {
        ...c,
        student_name: student?.full_name || "Anonymous Student",
        room_number: student?.room_number || "Unspecified",
        assigned_staff_name: staff?.full_name || null,
        category_name: category?.name || "other",
        default_staff_group: category?.default_staff_group || "General Operations",
      };
    });

    return hydrated;
  },

  async getComplaintById(id) {
    const db = readData();
    const complaint = db.complaints.find((c) => c.id === id);
    if (!complaint) return null;

    const student = db.users.find((u) => u.id === complaint.student_id);
    const staff = db.users.find((u) => u.id === complaint.assigned_staff_id);
    const category = db.categories.find((cat) => cat.id === complaint.category_id);

    // Get logs for this complaint sorted by timestamp asc
    const logs = db.status_logs
      .filter((l) => l.complaint_id === id)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .map((l) => {
        const changer = db.users.find((u) => u.id === l.changed_by);
        return {
          ...l,
          changer_name: changer?.full_name || "System",
          changer_role: changer?.role || "system",
        };
      });

    return {
      ...complaint,
      student_name: student?.full_name || "Unknown Student",
      room_number: student?.room_number || "Unspecified",
      student_email: student?.email || "",
      assigned_staff_name: staff?.full_name || null,
      category_name: category?.name || "other",
      default_staff_group: category?.default_staff_group || "General Operations",
      status_logs: logs,
    };
  },

  async createComplaint({ student_id, category_id, description, photo_url, room_number }) {
    const db = readData();
    const student = db.users.find((u) => u.id === student_id);
    if (room_number && student && (!student.room_number || student.room_number !== room_number)) {
      student.room_number = room_number;
    }

    const complaintId = crypto.randomUUID();
    const now = new Date().toISOString();

    const newComplaint = {
      id: complaintId,
      student_id,
      category_id: category_id ? Number(category_id) : 7, // default to 'other' if unassigned
      description,
      photo_url: photo_url || null,
      status: "OPEN",
      escalation_level: 0,
      assigned_staff_id: null,
      created_at: now,
      updated_at: now,
      resolved_at: null,
    };

    const initialLog = {
      id: crypto.randomUUID(),
      complaint_id: complaintId,
      old_status: "NONE",
      new_status: "OPEN",
      changed_by: student_id,
      note: "Complaint submitted by student",
      timestamp: now,
    };

    db.complaints.unshift(newComplaint);
    db.status_logs.push(initialLog);
    writeData(db);

    return this.getComplaintById(complaintId);
  },

  // State Machine Validation & Atomic Update
  async updateComplaintStatus({ complaint_id, new_status, changed_by, note, assigned_staff_id, userRole }) {
    const db = readData();
    const complaint = db.complaints.find((c) => c.id === complaint_id);
    if (!complaint) {
      throw new Error("Complaint not found");
    }

    const currentStatus = complaint.status;

    // Validate State Machine:
    // OPEN -> IN_PROGRESS
    // IN_PROGRESS -> RESOLVED_PENDING
    // RESOLVED_PENDING -> CLOSED (Student confirm or Admin override)
    // RESOLVED_PENDING -> REOPENED (Student dispute; resets to OPEN)
    // REOPENED -> IN_PROGRESS
    // Admin can perform administrative overrides
    const validTransitions = {
      OPEN: ["IN_PROGRESS"],
      IN_PROGRESS: ["RESOLVED_PENDING", "OPEN"],
      RESOLVED_PENDING: ["CLOSED", "REOPENED", "IN_PROGRESS"],
      CLOSED: ["REOPENED"],
      REOPENED: ["IN_PROGRESS", "OPEN"],
    };

    const allowed = validTransitions[currentStatus] || [];
    if (userRole !== "admin" && !allowed.includes(new_status)) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${new_status}`);
    }

    // Role specific constraints
    if (userRole === "student") {
      // Students can only dispute (REOPENED) or confirm (CLOSED) from RESOLVED_PENDING on their own complaint
      if (complaint.student_id !== changed_by) {
        throw new Error("Students can only modify their own complaints");
      }
      if (!["CLOSED", "REOPENED"].includes(new_status)) {
        throw new Error("Students can only confirm (CLOSED) or dispute (REOPENED) resolved complaints");
      }
    }

    const now = new Date().toISOString();
    const oldStatus = complaint.status;

    // Apply status change
    complaint.status = new_status;
    complaint.updated_at = now;

    if (assigned_staff_id !== undefined) {
      complaint.assigned_staff_id = assigned_staff_id;
    }

    // Timestamp handling
    if (new_status === "RESOLVED_PENDING" || new_status === "CLOSED") {
      if (!complaint.resolved_at) {
        complaint.resolved_at = now;
      }
    } else if (new_status === "REOPENED" || new_status === "IN_PROGRESS" || new_status === "OPEN") {
      complaint.resolved_at = null;
    }

    // Create Status Log
    const statusLog = {
      id: crypto.randomUUID(),
      complaint_id,
      old_status: oldStatus,
      new_status,
      changed_by,
      note: note || (new_status === "REOPENED" ? "Student disputed resolution. Ticket reopened." : `Status changed to ${new_status}`),
      timestamp: now,
    };

    db.status_logs.push(statusLog);
    writeData(db);

    return this.getComplaintById(complaint_id);
  },

  // ----------------------------------------------------
  // AUTO-ESCALATION ENGINE LOGIC
  // ----------------------------------------------------
  async getComplaintsForEscalation(hoursThreshold = 24) {
    const db = readData();
    const cutoff = new Date(Date.now() - hoursThreshold * 3600000);

    // Eligible complaints: OPEN or IN_PROGRESS where updated_at < cutoff
    return db.complaints.filter((c) => {
      if (c.status !== "OPEN" && c.status !== "IN_PROGRESS") return false;
      const lastUpdated = new Date(c.updated_at || c.created_at);
      return lastUpdated < cutoff;
    });
  },

  async escalateComplaint(complaintId, systemUserId = "d0000000-0000-0000-0000-000000000003") {
    const db = readData();
    const complaint = db.complaints.find((c) => c.id === complaintId);
    if (!complaint) return null;

    complaint.escalation_level = (complaint.escalation_level || 0) + 1;
    const now = new Date().toISOString();
    complaint.updated_at = now;

    const log = {
      id: crypto.randomUUID(),
      complaint_id: complaintId,
      old_status: complaint.status,
      new_status: complaint.status,
      changed_by: systemUserId,
      note: `[AUTO-ESCALATION] Unresolved for >24h without update. Escalated to Level ${complaint.escalation_level}. Flagged for Admin Warden.`,
      timestamp: now,
    };

    db.status_logs.push(log);
    writeData(db);
    return complaint;
  },

  // ----------------------------------------------------
  // ANALYTICS & PAST 7 DAYS (FOR AI DIGEST)
  // ----------------------------------------------------
  async getPastWeekComplaints() {
    const db = readData();
    const oneWeekAgo = new Date(Date.now() - 7 * 86400000);

    const complaints = db.complaints.filter((c) => new Date(c.created_at) >= oneWeekAgo);

    return complaints.map((c) => {
      const student = db.users.find((u) => u.id === c.student_id);
      const category = db.categories.find((cat) => cat.id === c.category_id);
      return {
        id: c.id,
        category: category?.name || "other",
        description: c.description,
        status: c.status,
        escalation_level: c.escalation_level,
        room_number: student?.room_number || "Unknown",
        created_at: c.created_at,
        resolved_at: c.resolved_at,
      };
    });
  },

  async getAnalyticsOverview() {
    const db = readData();
    const complaints = db.complaints;
    const now = Date.now();
    const thirtyDaysAgo = new Date(now - 30 * 86400000);

    // Total counts
    const total = complaints.length;
    const open = complaints.filter((c) => c.status === "OPEN").length;
    const inProgress = complaints.filter((c) => c.status === "IN_PROGRESS").length;
    const resolvedPending = complaints.filter((c) => c.status === "RESOLVED_PENDING").length;
    const closed = complaints.filter((c) => c.status === "CLOSED").length;
    const reopened = complaints.filter((c) => c.status === "REOPENED").length;
    const escalated = complaints.filter((c) => c.escalation_level > 0).length;

    // Volume by category
    const categoryVolume = {};
    db.categories.forEach((cat) => {
      categoryVolume[cat.name] = 0;
    });

    // Resolution times in hours by category
    const categoryResolutionTimes = {};
    db.categories.forEach((cat) => {
      categoryResolutionTimes[cat.name] = [];
    });

    // Room complaint counts in rolling 30 days for Hot Rooms detection (3+ complaints)
    const roomCounts30Days = {};

    complaints.forEach((c) => {
      const cat = db.categories.find((cat) => cat.id === c.category_id);
      const catName = cat?.name || "other";
      categoryVolume[catName] = (categoryVolume[catName] || 0) + 1;

      if (c.resolved_at && c.created_at) {
        const hours = (new Date(c.resolved_at) - new Date(c.created_at)) / 3600000;
        if (hours >= 0 && hours < 720) {
          if (!categoryResolutionTimes[catName]) categoryResolutionTimes[catName] = [];
          categoryResolutionTimes[catName].push(hours);
        }
      }

      if (new Date(c.created_at) >= thirtyDaysAgo) {
        const student = db.users.find((u) => u.id === c.student_id);
        const room = student?.room_number;
        if (room) {
          roomCounts30Days[room] = (roomCounts30Days[room] || 0) + 1;
        }
      }
    });

    const avgResolutionHoursByCategory = {};
    Object.entries(categoryResolutionTimes).forEach(([cat, times]) => {
      if (times.length > 0) {
        const avg = times.reduce((a, b) => a + b, 0) / times.length;
        avgResolutionHoursByCategory[cat] = Number(avg.toFixed(1));
      } else {
        avgResolutionHoursByCategory[cat] = 0;
      }
    });

    // Hot rooms (3+ complaints in rolling 30 days)
    const hotRooms = Object.entries(roomCounts30Days)
      .filter(([_, count]) => count >= 3)
      .map(([room_number, count]) => ({ room_number, complaint_count: count }))
      .sort((a, b) => b.complaint_count - a.complaint_count);

    return {
      totals: {
        total,
        open,
        inProgress,
        resolvedPending,
        closed,
        reopened,
        escalated,
        escalationRate: total > 0 ? Number(((escalated / total) * 100).toFixed(1)) : 0,
      },
      categoryVolume,
      avgResolutionHoursByCategory,
      hotRooms,
      recentActivity: db.status_logs.slice(-10).reverse(),
    };
  },
};
