// Pure answer-evaluation functions. No React, no I/O: easy to test.
import type {
  CompletePatternRound,
  CountCollectRound,
  ListenRespondRound,
  MatchPairRound,
  TapChooseRound,
} from "./schema";

export type TapResult = { kind: "correct" | "incorrect" | "open"; reflection?: string };

export function evaluateTapChoose(round: TapChooseRound, optionId: string): TapResult {
  if (!round.options.some((o) => o.id === optionId)) return { kind: "incorrect" };
  if (round.openEnded) return { kind: "open", reflection: round.openReply?.[optionId] };
  const ok = round.correctIds.includes(optionId) || round.acceptableIds.includes(optionId);
  return { kind: ok ? "correct" : "incorrect" };
}

export function evaluateCountAnswer(round: CountCollectRound, answer: number): "correct" | "incorrect" {
  return answer === round.total ? "correct" : "incorrect";
}

export function evaluateCollect(round: CountCollectRound, given: number): "correct" | "too-few" | "too-many" {
  const target = round.target ?? 0;
  if (given === target) return "correct";
  return given < target ? "too-few" : "too-many";
}

export function isPairMatch(round: MatchPairRound, leftId: string, rightId: string): boolean {
  const left = round.pairs.find((p) => p.left.id === leftId);
  const right = round.pairs.find((p) => p.right.id === rightId);
  return !!left && !!right && left.id === right.id;
}

export function isSortedCorrectly(round: MatchPairRound, itemId: string, binId: string): boolean {
  return round.items.find((i) => i.id === itemId)?.binId === binId;
}

export function evaluateOrder(round: CompletePatternRound, orderedIds: string[]): boolean {
  const canonical = round.steps.map((s) => s.id);
  const same = (a: string[], b: string[]) => a.length === b.length && a.every((x, i) => x === b[i]);
  return same(orderedIds, canonical) || round.acceptableOrders.some((o) => same(orderedIds, o));
}

export function evaluateComplete(round: CompletePatternRound, optionId: string): boolean {
  return round.correctIds.includes(optionId);
}

// ---- Spoken / typed responses: judged by meaning, never by exact string -------
export function normaliseText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\s']/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function countWords(text: string): number {
  const n = normaliseText(text);
  return n ? n.split(" ").length : 0;
}

/** True if any keyword (or an inflection such as "mangoes" for "mango") appears. */
export function matchesKeyword(text: string, keyword: string): boolean {
  const t = normaliseText(text);
  const k = normaliseText(keyword);
  if (!k) return false;
  if (k.includes(" ")) return t.includes(k);
  return t.split(" ").some((tok) => tok === k || (k.length >= 3 && tok.startsWith(k)));
}

export type ResponseEvaluation = {
  understood: boolean; // the child said something we could accept
  conceptId: string | null;
  reply: string;
  followUp?: string;
  wordCount: number;
  needsModelSentence: boolean; // very short answers get a richer sentence modelled, gently
};

export function evaluateResponse(round: ListenRespondRound, text: string): ResponseEvaluation {
  const wordCount = countWords(text);
  if (wordCount === 0) {
    return { understood: false, conceptId: null, reply: "I am listening. You can tap a picture too!", wordCount, needsModelSentence: false };
  }
  const hit = round.concepts.find((c) => c.keywords.some((k) => matchesKeyword(text, k)));
  return {
    understood: true,
    conceptId: hit?.id ?? null,
    reply: hit?.reply ?? round.fallbackReply,
    followUp: hit?.followUp,
    wordCount,
    needsModelSentence: wordCount <= 2 && !!round.modelSentence,
  };
}

/** True if `orderedIds` is a valid beginning of the canonical order or any accepted alternative. */
export function isValidOrderPrefix(round: CompletePatternRound, orderedIds: string[]): boolean {
  const canonical = round.steps.map((s) => s.id);
  return [canonical, ...round.acceptableOrders].some((o) => orderedIds.every((id, i) => o[i] === id));
}

import type { Activity } from "./schema";
/** How many choices the child had for a round (0 = open/none). Used to discount lucky guesses in progress. */
export function optionCountOf(activity: Activity, roundIndex: number): number {
  const r = activity.rounds[roundIndex];
  switch (activity.engine) {
    case "tap-choose": { const t = r as TapChooseRound; return t.openEnded ? 0 : t.options.length; }
    case "count-collect": { const c = r as CountCollectRound; return c.mode === "count" ? (c.choices?.length ?? 0) : 0; }
    case "match-pair": { const m = r as MatchPairRound; return m.mode === "pairs" ? Math.max(m.pairs.length - 1, 0) + 1 : m.bins.length; }
    case "complete-pattern": { const p = r as CompletePatternRound; return p.mode === "complete" ? p.options.length : 0; }
    default: return 0;
  }
}
