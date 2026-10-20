import type { Activity } from "@/lib/games/schema";
import type { Assistance } from "@/lib/games/hints";
import type { ActivityAttempt, Observation } from "./types";

export function summariseOutcome(obs: Observation[]): ActivityAttempt["outcome"] {
  if (obs.length === 0) return "none";
  if (obs.every((o) => o.outcome === "open-ended")) return "open-ended";
  if (obs.every((o) => o.outcome === "shown")) return "shown";
  if (obs.every((o) => o.outcome === "independent" || o.outcome === "open-ended")) return "independent";
  return "supported";
}

/** Builds the record stored for one play-through. Exiting early is allowed and never penalised. */
export function buildAttempt(args: {
  id: string; profileId: string; activity: Activity; observations: Observation[]; reachedEnd: boolean; startedAt: number; now: Date;
}): ActivityAttempt {
  const { activity, observations } = args;
  const maxHint = Math.max(0, ...observations.map((o) => o.hintsUsed));
  const assistance: Assistance = observations.some((o) => o.exampleShown) ? "example" : maxHint > 0 ? "hint" : "none";
  return {
    id: args.id, childProfileId: args.profileId, activityId: activity.id, activityVersion: activity.version, objectiveId: activity.objectiveIds[0],
    outcome: summariseOutcome(observations), hintCount: observations.reduce((n, o) => n + o.hintsUsed, 0), assistanceLevel: assistance,
    completionStatus: args.reachedEnd ? "completed" : "exited-early", occurredAt: args.now.toISOString(),
    durationSeconds: Math.max(0, Math.round((args.now.getTime() - args.startedAt) / 1000)), rounds: observations,
  };
}
