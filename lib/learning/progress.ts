// Transparent, rules-based evidence model. No machine learning.
//
// Principles
//  - One correct answer is never mastery.
//  - The SAME question repeated counts once (guards against memorised answers).
//  - Successes with few choices (<= 2 options) are discounted (guessing).
//  - Hints and shown answers lower the evidence category, they never count as independent.
//  - Open-ended rounds record exposure ("introduced/practising") but never "mastery".
import type { EvidenceCategory, Observation, ObjectiveProgress } from "./types";

const RECENT_WINDOW = 6;
const DAY_MS = 86_400_000;

type Scored = Observation & { weight: number; success: "independent" | "supported" | "none" | "open" };

function score(o: Observation): Scored {
  if (o.outcome === "open-ended") return { ...o, weight: 0, success: "open" };
  if (o.outcome === "shown") return { ...o, weight: 0, success: "none" };
  const guessy = o.optionCount > 0 && o.optionCount <= 2;
  if (o.outcome === "independent") return { ...o, weight: guessy ? 0.5 : 1, success: "independent" };
  return { ...o, weight: 0.5, success: "supported" };
}

/** Keep one observation per distinct question (activity + round): the best recent one. */
function distinctQuestions(obs: Scored[]): Scored[] {
  const byKey = new Map<string, Scored>();
  for (const o of obs) {
    const k = `${o.activityId}:${o.roundId}`;
    const prev = byKey.get(k);
    if (!prev || o.weight > prev.weight || (o.weight === prev.weight && o.at > prev.at)) byKey.set(k, o);
  }
  return [...byKey.values()];
}

const day = (iso: string) => iso.slice(0, 10);

export function categorise(observations: Observation[]): EvidenceCategory {
  if (observations.length === 0) return "not-introduced";
  const sorted = [...observations].sort((a, b) => a.at.localeCompare(b.at));
  const scored = sorted.map(score);
  const closed = scored.filter((s) => s.success !== "open");
  if (closed.length === 0) return scored.length >= 3 ? "practising" : "introduced";

  const distinct = distinctQuestions(closed);
  const indepD = distinct.filter((s) => s.success === "independent");
  const suppD = distinct.filter((s) => s.success === "supported" || s.success === "independent");
  const recent = closed.slice(-RECENT_WINDOW);
  const recentIndep = recent.filter((s) => s.success === "independent").length;
  const indepWeight = indepD.reduce((n, s) => n + s.weight, 0);
  const indepActivities = new Set(indepD.map((s) => s.activityId)).size;
  const indepDays = new Set(indepD.map((s) => day(s.at))).size;

  if (
    indepWeight >= 4 &&
    indepD.length >= 4 &&
    indepActivities >= 2 &&
    indepDays >= 2 &&
    recent.length >= 4 &&
    recentIndep / recent.length >= 0.75
  )
    return "ready-for-challenge";

  if (indepWeight >= 3 && indepActivities >= 2 && recent.length >= 3 && recentIndep / recent.length >= 0.6) return "independent";

  if (suppD.length >= 2 && closed.slice(-4).filter((s) => s.success !== "none").length >= 2) return "supported";

  if (closed.length >= 3) return "practising";
  return "introduced";
}

/** Gentle spaced review: stronger evidence waits longer. Never a deadline for the child. */
export function nextReviewDate(category: EvidenceCategory, lastPractisedAt: string | null): string | null {
  if (!lastPractisedAt || category === "not-introduced") return null;
  const gapDays: Record<EvidenceCategory, number> = {
    "not-introduced": 0,
    introduced: 1,
    practising: 2,
    supported: 4,
    independent: 10,
    "ready-for-challenge": 21,
  };
  return new Date(new Date(lastPractisedAt).getTime() + gapDays[category] * DAY_MS).toISOString();
}

export function progressFor(objectiveId: string, all: Observation[]): ObjectiveProgress {
  const obs = all.filter((o) => o.objectiveId === objectiveId);
  const category = categorise(obs);
  const last = obs.length ? obs.map((o) => o.at).sort().at(-1)! : null;
  return {
    objectiveId,
    category,
    independentSuccesses: obs.filter((o) => o.outcome === "independent").length,
    supportedSuccesses: obs.filter((o) => o.outcome === "supported").length,
    observations: obs.length,
    lastPractisedAt: last,
    nextReviewAt: nextReviewDate(category, last),
  };
}

export function progressMap(objectiveIds: string[], all: Observation[]): Record<string, ObjectiveProgress> {
  return Object.fromEntries(objectiveIds.map((id) => [id, progressFor(id, all)]));
}
