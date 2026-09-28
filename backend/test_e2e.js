// Comprehensive End-to-End Test Suite for Hostel Fix
const API_URL = "http://127.0.0.1:5000";

async function runTests() {
  console.log("====================================================");
  console.log("🧪 Running Hostel Fix End-to-End Verification Suite");
  console.log("====================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Health check
  try {
    const healthRes = await fetch(`${API_URL}/api/health`);
    const health = await healthRes.json();
    assert(health.status === "healthy", "Backend health endpoint returns healthy");
  } catch (e) {
    assert(false, `Health check failed: ${e.message}`);
  }

  // 2. Student Authentication
  let studentToken = "";
  let studentUser = null;
  try {
    const loginRes = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "student@hostelfix.edu", password: "password123" }),
    });
    const loginData = await loginRes.json();
    studentToken = loginData.token;
    studentUser = loginData.user;
    assert(Boolean(studentToken), "Student successfully authenticated with JWT");
    assert(studentUser.role === "student", "Student role is verified");
  } catch (e) {
    assert(false, `Student auth failed: ${e.message}`);
  }

  // 3. Staff & Admin Authentication
  let staffToken = "";
  let adminToken = "";
  try {
    const staffRes = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "staff@hostelfix.edu", password: "password123" }),
    });
    staffToken = (await staffRes.json()).token;
    assert(Boolean(staffToken), "Staff token obtained");

    const adminRes = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@hostelfix.edu", password: "password123" }),
    });
    adminToken = (await adminRes.json()).token;
    assert(Boolean(adminToken), "Admin token obtained");
  } catch (e) {
    assert(false, `Staff/Admin auth failed: ${e.message}`);
  }

  // 4. Zod Form Validation Rejection Test
  try {
    const badRes = await fetch(`${API_URL}/api/complaints`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({ description: "Too short", room_number: "" }),
    });
    assert(badRes.status === 400, "Zod middleware rejects descriptions < 10 characters and empty room");
    const badJson = await badRes.json();
    assert(badJson.error === "Validation failed", "Returns structured Zod validation error details");
  } catch (e) {
    assert(false, `Zod validation test failed: ${e.message}`);
  }

  // 5. Gemini Category Triage Suggestion
  try {
    const triageRes = await fetch(`${API_URL}/api/ai/suggest-category`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({ description: "The toilet pipe in bathroom is broken and flooding water" }),
    });
    const triage = await triageRes.json();
    assert(triage.category === "plumbing", `Gemini correctly classified water/pipe issue as plumbing (got ${triage.category})`);
    assert(typeof triage.confidence === "number" && triage.confidence > 0.5, `Confidence score returned: ${triage.confidence}`);
  } catch (e) {
    assert(false, `Gemini triage failed: ${e.message}`);
  }

  // 6. Student Files Complaint
  let createdComplaint = null;
  try {
    const createRes = await fetch(`${API_URL}/api/complaints`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        description: "Study table leg collapsed and computer desk is wobbly",
        category_id: 6, // furniture
        room_number: "B-204",
      }),
    });
    assert(createRes.status === 201, "Complaint successfully created with status 201");
    createdComplaint = await createRes.json();
    assert(createdComplaint.status === "OPEN", "Initial complaint status is OPEN");
    assert(createdComplaint.escalation_level === 0, "Initial escalation level is 0");
    assert(createdComplaint.status_logs?.length >= 1, "Initial StatusLog row created automatically");
  } catch (e) {
    assert(false, `Create complaint failed: ${e.message}`);
  }

  // 7. State Machine Enforcement: Staff Picks Up Ticket (OPEN -> IN_PROGRESS)
  try {
    const patchRes = await fetch(`${API_URL}/api/complaints/${createdComplaint.id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${staffToken}`,
      },
      body: JSON.stringify({
        new_status: "IN_PROGRESS",
        note: "Carpenter assigned with replacement leg kit.",
      }),
    });
    assert(patchRes.status === 200, "Staff successfully transitioned ticket from OPEN to IN_PROGRESS");
    const updated = (await patchRes.json()).complaint;
    assert(updated.status === "IN_PROGRESS", "Complaint status is now IN_PROGRESS");
    assert(updated.status_logs.length === 2, "StatusLog contains exactly 2 audit entries now");
  } catch (e) {
    assert(false, `Staff pickup transition failed: ${e.message}`);
  }

  // 8. Invalid Transition Block: Staff tries to jump directly to CLOSED
  try {
    const invalidRes = await fetch(`${API_URL}/api/complaints/${createdComplaint.id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${staffToken}`,
      },
      body: JSON.stringify({
        new_status: "CLOSED",
      }),
    });
    assert(invalidRes.status === 400, "State Machine rejects illegal transition from IN_PROGRESS directly to CLOSED");
  } catch (e) {
    assert(false, `State machine constraint test failed: ${e.message}`);
  }

  // 9. Staff Marks Resolved Pending (IN_PROGRESS -> RESOLVED_PENDING)
  try {
    const resPending = await fetch(`${API_URL}/api/complaints/${createdComplaint.id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${staffToken}`,
      },
      body: JSON.stringify({
        new_status: "RESOLVED_PENDING",
        note: "Table leg repaired and bolted to wall for safety.",
      }),
    });
    assert(resPending.status === 200, "Staff successfully transitioned to RESOLVED_PENDING");
  } catch (e) {
    assert(false, `Staff mark resolved pending failed: ${e.message}`);
  }

  // 10. Student Disputes Resolution (RESOLVED_PENDING -> REOPENED)
  try {
    const disputeRes = await fetch(`${API_URL}/api/complaints/${createdComplaint.id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        new_status: "REOPENED",
        note: "Table still wobbles violently when placing books.",
      }),
    });
    assert(disputeRes.status === 200, "Student successfully disputed resolution and moved status to REOPENED");
    const reopened = (await disputeRes.json()).complaint;
    assert(reopened.status === "REOPENED", "Status confirmed as REOPENED");
    assert(reopened.status_logs.some((l) => l.note.includes("Table still wobbles")), "Student dispute note persisted in StatusLog");
  } catch (e) {
    assert(false, `Student dispute workflow failed: ${e.message}`);
  }

  // 11. Auto-Escalation Engine Sweep
  try {
    // Run sweep with threshold of 0 hours to test auto-escalation trigger immediately
    const sweepRes = await fetch(`${API_URL}/api/escalate/run?hours=0`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    assert(sweepRes.status === 200, "Escalation engine sweep executed successfully");
    const sweep = await sweepRes.json();
    assert(sweep.escalatedCount > 0, `Auto-escalation engine evaluated and escalated ${sweep.escalatedCount} overdue ticket(s)`);
  } catch (e) {
    assert(false, `Auto-escalation engine sweep failed: ${e.message}`);
  }

  // 12. Admin Analytics Overview & Hot Rooms
  try {
    const analyticsRes = await fetch(`${API_URL}/api/analytics/overview`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(analyticsRes.status === 200, "Admin successfully fetched analytics overview");
    const analytics = await analyticsRes.json();
    assert(typeof analytics.totals.total === "number", "Analytics totals computed");
    assert(typeof analytics.totals.escalationRate === "number", "Escalation rate calculated");
    assert(Array.isArray(analytics.hotRooms), "Hot rooms array generated");
    assert(typeof analytics.categoryVolume === "object", "Category volume aggregated");
  } catch (e) {
    assert(false, `Analytics overview failed: ${e.message}`);
  }

  // 13. Admin Gemini Weekly Digest
  try {
    const summaryRes = await fetch(`${API_URL}/api/ai/weekly-summary`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(summaryRes.status === 200, "Admin successfully fetched Gemini Weekly Digest");
    const summary = await summaryRes.json();
    assert(typeof summary.headline === "string", "Gemini returned valid headline");
    assert(Array.isArray(summary.top_issues), "Gemini returned top_issues array");
    assert(Array.isArray(summary.hot_rooms), "Gemini returned hot_rooms array");
    assert(typeof summary.avg_resolution_hours_by_category === "object", "Gemini returned resolution hours map");
    assert(typeof summary.recommendation === "string", "Gemini returned actionable warden recommendation");
  } catch (e) {
    assert(false, `Gemini weekly digest failed: ${e.message}`);
  }

  console.log("====================================================");
  console.log(`🏁 Test Results: ${passed} passed, ${failed} failed`);
  console.log("====================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
