import type { Assistance, RoundOutcome } from "@/lib/games/hints";

export type EvidenceCategory =
  | "not-introduced"
  | "introduced"
  | "practising"
  | "supported"
  | "independent"
  | "ready-for-challenge";

export const EVIDENCE_ORDER: EvidenceCategory[] = ["not-introduced", "introduced", "practising", "supported", "independent", "ready-for-challenge"];

export const EVIDENCE_LABEL: Record<EvidenceCategory, string> = {
  "not-introduced": "Not introduced",
  introduced: "Introduced",
  practising: "Practising",
  supported: "Demonstrated with support",
  independent: "Demonstrated independently",
  "ready-for-challenge": "Ready for further challenge",
};

/** One piece of learning evidence: a single round of an activity for one objective. */
export type Observation = {
  activityId: string;
  activityVersion: number;
  roundId: string;
  objectiveId: string;
  outcome: RoundOutcome;
  hintsUsed: number; // highest hint level reached
  exampleShown: boolean;
  attempts: number; // taps/tries in the round
  optionCount: number; // how many choices the child had (guess-chance control); 0 = open
  at: string; // ISO timestamp
};

export type CompletionStatus = "completed" | "exited-early";

/** One play-through of an activity. Matches the activity_attempts table. */
export type ActivityAttempt = {
  id: string;
  childProfileId: string;
  activityId: string;
  activityVersion: number;
  objectiveId: string; // primary objective
  outcome: "independent" | "supported" | "shown" | "open-ended" | "none";
  hintCount: number;
  assistanceLevel: Assistance;
  completionStatus: CompletionStatus;
  occurredAt: string;
  durationSeconds: number;
  rounds: Observation[];
  parentNote?: string;
};

export type ObjectiveProgress = {
  objectiveId: string;
  category: EvidenceCategory;
  independentSuccesses: number;
  supportedSuccesses: number;
  observations: number;
  lastPractisedAt: string | null;
  nextReviewAt: string | null;
};
