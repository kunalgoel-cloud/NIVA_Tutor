// Deterministic FICTIONAL demo history. Only ever attached to a profile flagged isDemo.
import type { Activity } from "@/lib/games/schema";
import type { ActivityAttempt, Observation } from "@/lib/learning/types";
import type { RoundOutcome } from "@/lib/games/hints";

export function buildDemoAttempts(profileId: string, activities: Activity[], now: Date): ActivityAttempt[] {
  const chosen = activities.filter((a) => a.ageBand === "little-explorer").slice(0, 14);
  const out: ActivityAttempt[] = [];
  chosen.forEach((a, idx) => {
    const daysAgo = 10 - Math.floor(idx * 0.7);
    const at = new Date(now.getTime() - daysAgo * 86_400_000 + idx * 600_000);
    const open = a.engine === "listen-respond";
    const rounds: Observation[] = a.rounds.map((r, ri) => {
      const outcome: RoundOutcome = open ? "open-ended" : (idx + ri) % 4 === 0 ? "supported" : "independent";
      return {
        activityId: a.id, activityVersion: a.version, roundId: r.id, objectiveId: a.objectiveIds[0], outcome,
        hintsUsed: outcome === "supported" ? 1 : 0, exampleShown: false, attempts: outcome === "supported" ? 2 : 1,
        optionCount: open ? 0 : 3, at: new Date(at.getTime() + ri * 40_000).toISOString(),
      };
    });
    out.push({
      id: `demo_${a.id}_${idx}`, childProfileId: profileId, activityId: a.id, activityVersion: a.version, objectiveId: a.objectiveIds[0],
      outcome: rounds.some((r) => r.outcome === "supported") ? "supported" : open ? "open-ended" : "independent",
      hintCount: rounds.reduce((n, r) => n + r.hintsUsed, 0), assistanceLevel: rounds.some((r) => r.hintsUsed) ? "hint" : "none",
      completionStatus: "completed", occurredAt: at.toISOString(), durationSeconds: 120 + idx * 10, rounds,
    });
  });
  return out;
}
