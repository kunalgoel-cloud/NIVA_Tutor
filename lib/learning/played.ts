import type { ActivityAttempt } from "./types";

/**
 * Activities a child has finished since the grown-up last pressed "Reset all games".
 * Stopping early never counts, so a game left half-way is still new. Learning evidence is untouched:
 * this only decides what counts as "already played" for suggestions and the child's lists.
 */
export function playedActivityIds(attempts: ActivityAttempt[], resetAt?: string | null): Set<string> {
  const out = new Set<string>();
  for (const a of attempts) {
    if (a.completionStatus !== "completed") continue;
    if (resetAt && a.occurredAt <= resetAt) continue;
    out.add(a.activityId);
  }
  return out;
}
