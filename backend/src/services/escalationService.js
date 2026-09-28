import { dbService } from "./dbService.js";

export const escalationService = {
  /**
   * Run the escalation sweep across all active complaints
   * @param {number} hoursThreshold Hours of inactivity before escalating (default 24h)
   */
  async runEscalationSweep(hoursThreshold = 24) {
    console.log(`[Escalation Engine] Starting sweep for tickets inactive > ${hoursThreshold} hours...`);
    const overdueComplaints = await dbService.getComplaintsForEscalation(hoursThreshold);

    const results = [];
    for (const complaint of overdueComplaints) {
      try {
        const updated = await dbService.escalateComplaint(complaint.id);
        results.push({
          id: complaint.id,
          previousLevel: complaint.escalation_level || 0,
          newLevel: updated.escalation_level,
          description: complaint.description.substring(0, 40) + "...",
        });
      } catch (err) {
        console.error(`[Escalation Engine] Failed to escalate complaint ${complaint.id}:`, err);
      }
    }

    console.log(`[Escalation Engine] Sweep completed. Escalated ${results.length} complaint(s).`);
    return {
      timestamp: new Date().toISOString(),
      evaluated: overdueComplaints.length,
      escalatedCount: results.length,
      escalated: results,
    };
  },
};
