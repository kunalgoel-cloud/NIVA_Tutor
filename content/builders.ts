// Small helpers that turn compact content into full activity configurations.
// Everything is still plain data: the Zod schema validates the output.
import type { ActivityInput } from "@/lib/games/schema";
import type { AgeBand, DomainSlug, WorldSlug } from "@/lib/curriculum/schema";
import { OBJECTIVES } from "@/content/objectives";

/** "🍎|apple" -> { visual: "🍎", alt: "apple" } */
const v = (s: string) => {
  const [visual, alt] = s.split("|");
  return { visual, alt: alt ?? visual };
};
const id = (i: number) => String.fromCharCode(97 + i);

type TOpts = { display?: string; hints?: string[]; explain?: string; acceptable?: number[]; open?: boolean; openReply?: string[]; study?: string[]; hideIndex?: number; hideLabel?: string };
/** Tap and Choose round. opts like "🍎|apple". correct = option indexes. */
export const T = (rid: string, prompt: string, opts: string[], correct: number[], o: TOpts = {}) => ({
  id: rid, prompt, display: o.display,
  study: o.study ? { items: o.study, hideIndex: o.hideIndex ?? o.study.length - 1, hideLabel: o.hideLabel } : undefined,
  options: opts.map((s, i) => ({ id: id(i), ...v(s) })),
  correctIds: correct.map(id), acceptableIds: (o.acceptable ?? []).map(id),
  openEnded: !!o.open, hints: o.hints ?? [], explain: o.explain,
  openReply: o.openReply ? Object.fromEntries(o.openReply.map((r, i) => [id(i), r])) : undefined,
});

/** Maze round. grid rows use '#' wall, '.' path, 'S' start, 'G' goal. */
export const MZ = (rid: string, prompt: string, grid: string[], mover: string, goal: string, hints: string[] = [
  "Tap the square next to you, or use the arrow buttons.", "The dark squares are walls. Follow the light path.", "Come to a dead end? Step back and try another way.",
]) => ({ id: rid, prompt, grid, mover, goal, hints });

/** One page of a story: shown and read aloud, and it cannot be left until it has been heard. */
export const PG = (rid: string, text: string, display?: string) => ({ id: rid, kind: "page" as const, prompt: text, display, hints: [] as string[] });
/** A question about the story. It needs the right answer before the story goes on. */
export const SQ = (rid: string, prompt: string, opts: string[], correct: number[], o: TOpts = {}) => ({ ...T(rid, prompt, opts, correct, o), kind: "question" as const });

/** Count round: tap each object, then pick the numeral. */
export const CNT = (rid: string, prompt: string, visual: string, total: number, choices: number[], hints: string[] = []) =>
  ({ id: rid, mode: "count" as const, prompt, visual, total, choices, hints });
/** Collect round: give exactly `target` of `total` to a character. */
export const GIVE = (rid: string, prompt: string, visual: string, total: number, target: number, to: string, hints: string[] = []) =>
  ({ id: rid, mode: "collect" as const, prompt, visual, total, target, collectTo: v(to), hints });

/** Pairs round: [["🐟|fish","🌊|water"], ...]. Prefix a right-hand visual with "~" to draw it as a shadow. */
export const PAIRS = (rid: string, prompt: string, pairs: [string, string][], hints: string[] = []) => ({
  id: rid, mode: "pairs" as const, prompt, hints,
  pairs: pairs.map(([l, r], i) => ({
    id: `p${i + 1}`,
    left: { id: `l${i + 1}`, ...v(l) },
    right: r.startsWith("~") ? { id: `r${i + 1}`, ...v(r.slice(1)), shadow: true } : { id: `r${i + 1}`, ...v(r) },
  })),
});
/** Sort round: bins ["🐘|big"], items [["🐭|mouse", binIndex]] */
export const SORT = (rid: string, prompt: string, bins: string[], items: [string, number][], hints: string[] = []) => ({
  id: rid, mode: "sort" as const, prompt, hints,
  bins: bins.map((b, i) => ({ id: `b${i + 1}`, ...v(b) })),
  items: items.map(([s, b], i) => ({ id: `i${i + 1}`, ...v(s), binId: `b${b + 1}` })),
});

/** Complete the sequence: use "?" for the blank. */
export const PAT = (rid: string, prompt: string, sequence: string[], opts: string[], correct: number, hints: string[] = []) =>
  ({ id: rid, mode: "complete" as const, prompt, sequence, options: opts.map((s, i) => ({ id: id(i), ...v(s) })), correctIds: [id(correct)], hints });
/** Order round: steps are given in the CORRECT order; the UI shuffles them. */
export const ORD = (rid: string, prompt: string, steps: string[], hints: string[] = []) =>
  ({ id: rid, mode: "order" as const, prompt, hints, steps: steps.map((s, i) => ({ id: `s${i + 1}`, ...v(s) })) });

type LOpts = {
  display?: string;
  concepts?: [conceptId: string, keywords: string[], reply: string, followUp?: string][];
  quick: [visual: string, say: string, conceptId?: string][];
  model?: string; fallback?: string; followUps?: string[]; maxTurns?: number; hints?: string[];
};
/** Listen and Respond round (spoken, typed or tap). */
export const LR = (rid: string, prompt: string, o: LOpts) => ({
  id: rid, prompt, display: o.display,
  concepts: (o.concepts ?? []).map(([cid, keywords, reply, followUp]) => ({ id: cid, keywords, reply, followUp })),
  quickReplies: o.quick.map(([visual, say, conceptId], i) => ({ id: `q${i + 1}`, visual, say, conceptId })),
  modelSentence: o.model, fallbackReply: o.fallback ?? "Thank you for telling me! That is interesting.",
  followUps: o.followUps ?? [], maxTurns: o.maxTurns ?? 2, hints: o.hints ?? [],
});

type Meta = {
  id: string; title: string; description: string; world: WorldSlug; domain: DomainSlug; obj: string[];
  band?: AgeBand; difficulty?: 1 | 2 | 3; instructions: string; audio?: string; minutes?: number; character?: string;
  tags?: string[]; mission?: string; adult?: string; speech?: boolean; words?: boolean;
  correct?: string[]; encourage?: string[]; complete?: string[]; status?: "draft" | "validated" | "published" | "retired"; review?: "unreviewed" | "reviewed";
};

const CORRECT = ["Good thinking!", "You noticed something interesting!", "Lovely work!", "Yes, you did it!"];
const ENCOURAGE = ["Let's try together.", "Would you like a little hint?", "Let's look at it another way.", "Nice try! One more go."];
const COMPLETE = ["You worked hard on that.", "What a wonderful adventure!", "Thank you for playing with me."];

const primaryMappings = (obj: string[]) => {
  const o = OBJECTIVES.find((x) => x.id === obj[0]);
  return o ? o.frameworkMappings : [];
};

export function activity<E extends ActivityInput["engine"]>(m: Meta, engine: E, rounds: unknown[]): ActivityInput {
  return {
    id: m.id, title: m.title, description: m.description, world: m.world, domain: m.domain, objectiveIds: m.obj,
    ageBand: m.band ?? "little-explorer", difficulty: m.difficulty ?? 1, engine, rounds,
    instructions: m.instructions, audioInstructions: m.audio ?? m.instructions, estimatedMinutes: m.minutes ?? 3,
    feedback: { correct: m.correct ?? CORRECT, encourage: m.encourage ?? ENCOURAGE, complete: m.complete ?? COMPLETE },
    accessibility: { requiresSpeech: !!m.speech, tapAlternative: true, reducedMotionSafe: true },
    media: [], completion: { minRoundsCompleted: Math.max(1, Math.min(rounds.length, 2)) },
    frameworkMappings: primaryMappings(m.obj), characterId: m.character ?? "pip", tags: m.tags ?? [],
    adultSupervision: m.adult, realWorldMission: m.mission,
    status: m.status ?? "published", reviewStatus: m.review ?? "reviewed", version: 1, presentation: m.words ? "words" : "pictures",
  } as ActivityInput;
}
