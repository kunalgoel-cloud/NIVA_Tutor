import type { Observation } from "@/lib/learning/types";
import type { RoundOutcome } from "@/lib/games/hints";

let n = 0;
/** Build an observation. `day` is days after 2026-01-01 so tests can control spacing. */
export function obs(p: Partial<Observation> & { outcome: RoundOutcome; day?: number }): Observation {
  const { day = 0, ...rest } = p;
  n++;
  const at = new Date(Date.UTC(2026, 0, 1 + day, 9, n % 60)).toISOString();
  return { activityId: "a1", activityVersion: 1, roundId: `r${n}`, objectiveId: "MATH-CNT-01", hintsUsed: 0, exampleShown: false, attempts: 1, optionCount: 3, at, ...rest };
}
