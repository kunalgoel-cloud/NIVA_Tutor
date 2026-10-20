import { z } from "zod";
import {
  AgeBandSchema,
  DomainSlugSchema,
  FrameworkMappingSchema,
  PublicationStatusSchema,
  ReviewStatusSchema,
  WorldSlugSchema,
} from "@/lib/curriculum/schema";

export const ENGINE_TYPES = ["tap-choose", "count-collect", "match-pair", "complete-pattern", "listen-respond"] as const;
export const EngineTypeSchema = z.enum(ENGINE_TYPES);
export type EngineType = z.infer<typeof EngineTypeSchema>;

/** Planned engines. They are reserved names only; activities may not use them yet. */
export const PLANNED_ENGINES = ["arrange-story", "solve-puzzle", "explore-discover", "create-something", "ai-conversation"] as const;

// A "visual" is an emoji / short glyph string drawn by the UI. No HTML, no URLs.
const Visual = z.string().min(1).max(60);
const Label = z.string().min(1).max(60);
const Hints = z.array(z.string().min(1).max(160)).max(4);
const RoundId = z.string().regex(/^[a-z0-9-]+$/);

const OptionSchema = z.object({
  id: z.string().min(1),
  visual: Visual,
  label: Label.optional(),
  alt: z.string().min(1).max(80), // accessible name (screen readers + non-colour cues)
});
export type ChoiceOption = z.infer<typeof OptionSchema>;

// ---- 1. Tap and Choose -------------------------------------------------------
export const TapChooseRoundSchema = z
  .object({
    id: RoundId,
    prompt: z.string().min(1).max(320),
    display: Visual.optional(), // big picture shown above the options
    /** Memory variant: show these, then the child taps "Hide them" and answers. */
    study: z.object({ items: z.array(Visual).min(2).max(8), hideIndex: z.number().int().min(0).optional(), hideLabel: Label.optional() }).optional(),
    options: z.array(OptionSchema).min(2).max(6),
    correctIds: z.array(z.string()).default([]),
    acceptableIds: z.array(z.string()).default([]), // accepted as correct alternatives
    openEnded: z.boolean().default(false), // no single right answer; any option is welcomed
    hints: Hints.default([]),
    explain: z.string().max(200).optional(), // shown after success
    openReply: z.record(z.string(), z.string().max(200)).optional(), // per-option reflections for open-ended rounds
  })
  .superRefine((r, ctx) => {
    const ids = new Set(r.options.map((o) => o.id));
    if (ids.size !== r.options.length) ctx.addIssue({ code: "custom", message: "duplicate option ids" });
    for (const id of [...r.correctIds, ...r.acceptableIds])
      if (!ids.has(id)) ctx.addIssue({ code: "custom", message: `answer id "${id}" is not an option` });
    if (!r.openEnded && r.correctIds.length === 0) ctx.addIssue({ code: "custom", message: "closed round needs correctIds" });
  });
export type TapChooseRound = z.infer<typeof TapChooseRoundSchema>;

// ---- 2. Count and Collect ----------------------------------------------------
export const CountCollectRoundSchema = z
  .object({
    id: RoundId,
    mode: z.enum(["count", "collect"]),
    prompt: z.string().min(1).max(160),
    visual: Visual, // the object that is counted
    total: z.number().int().min(1).max(12), // objects on screen
    target: z.number().int().min(0).max(12).optional(), // collect: how many to give
    choices: z.array(z.number().int().min(0).max(20)).min(2).max(5).optional(), // count: numeral options
    collectTo: z.object({ visual: Visual, alt: Label }).optional(), // e.g. the dinosaur
    hints: Hints.default([]),
  })
  .superRefine((r, ctx) => {
    if (r.mode === "count" && !(r.choices && r.choices.includes(r.total)))
      ctx.addIssue({ code: "custom", message: "count rounds need choices that include the total" });
    if (r.mode === "collect") {
      if (r.target === undefined) ctx.addIssue({ code: "custom", message: "collect rounds need a target" });
      else if (r.target > r.total) ctx.addIssue({ code: "custom", message: "target exceeds total" });
      if (!r.collectTo) ctx.addIssue({ code: "custom", message: "collect rounds need collectTo" });
    }
  });
export type CountCollectRound = z.infer<typeof CountCollectRoundSchema>;

// ---- 3. Match the Pair (pairs or sort into bins) -----------------------------
const Card = z.object({ id: z.string().min(1), visual: Visual, alt: Label, shadow: z.boolean().optional() });
export const MatchPairRoundSchema = z
  .object({
    id: RoundId,
    mode: z.enum(["pairs", "sort"]),
    prompt: z.string().min(1).max(160),
    pairs: z.array(z.object({ id: z.string().min(1), left: Card, right: Card })).max(5).default([]),
    bins: z.array(Card).max(3).default([]),
    items: z.array(Card.extend({ binId: z.string().min(1) })).max(8).default([]),
    hints: Hints.default([]),
  })
  .superRefine((r, ctx) => {
    if (r.mode === "pairs" && r.pairs.length < 2) ctx.addIssue({ code: "custom", message: "pairs mode needs 2+ pairs" });
    if (r.mode === "sort") {
      if (r.bins.length < 2) ctx.addIssue({ code: "custom", message: "sort mode needs 2+ bins" });
      const binIds = new Set(r.bins.map((b) => b.id));
      if (r.items.length < 2) ctx.addIssue({ code: "custom", message: "sort mode needs 2+ items" });
      for (const it of r.items) if (!binIds.has(it.binId)) ctx.addIssue({ code: "custom", message: `item ${it.id} has unknown bin` });
    }
  });
export type MatchPairRound = z.infer<typeof MatchPairRoundSchema>;

// ---- 4. Complete the Pattern (complete a sequence, or put steps in order) ----
export const CompletePatternRoundSchema = z
  .object({
    id: RoundId,
    mode: z.enum(["complete", "order"]),
    prompt: z.string().min(1).max(160),
    sequence: z.array(Visual).max(10).default([]), // complete: use "?" for the blank
    options: z.array(OptionSchema).max(5).default([]),
    correctIds: z.array(z.string()).default([]),
    steps: z.array(Card).max(6).default([]), // order: listed in the correct order
    acceptableOrders: z.array(z.array(z.string())).default([]), // other valid orders
    hints: Hints.default([]),
  })
  .superRefine((r, ctx) => {
    if (r.mode === "complete") {
      if (!r.sequence.includes("?")) ctx.addIssue({ code: "custom", message: 'sequence needs a "?" blank' });
      if (r.options.length < 2) ctx.addIssue({ code: "custom", message: "needs 2+ options" });
      const ids = new Set(r.options.map((o) => o.id));
      if (r.correctIds.length === 0 || r.correctIds.some((c) => !ids.has(c)))
        ctx.addIssue({ code: "custom", message: "correctIds must reference options" });
    } else {
      if (r.steps.length < 2) ctx.addIssue({ code: "custom", message: "order mode needs 2+ steps" });
      const ids = new Set(r.steps.map((s) => s.id));
      for (const o of r.acceptableOrders)
        if (o.length !== ids.size || o.some((x) => !ids.has(x))) ctx.addIssue({ code: "custom", message: "acceptableOrders must permute steps" });
    }
  });
export type CompletePatternRound = z.infer<typeof CompletePatternRoundSchema>;

// ---- 5. Listen and Respond (spoken / conversational) -------------------------
export const ListenRespondRoundSchema = z
  .object({
    id: RoundId,
    prompt: z.string().min(1).max(320), // the character says this
    display: Visual.optional(),
    /** Meaning-based evaluation: a response matches a concept if any keyword appears. */
    concepts: z
      .array(
        z.object({
          id: z.string().min(1),
          keywords: z.array(z.string().min(1)).min(1),
          reply: z.string().min(1).max(200), // character's context-aware reply
          followUp: z.string().max(200).optional(),
        })
      )
      .default([]),
    /** Tap-based alternatives, so speech is never required. */
    quickReplies: z.array(z.object({ id: z.string(), visual: Visual, say: z.string().min(1).max(80), conceptId: z.string().optional() })).min(2).max(6),
    modelSentence: z.string().max(160).optional(), // richer sentence gently modelled back
    fallbackReply: z.string().min(1).max(200).default("Thank you for telling me! That is interesting."),
    followUps: z.array(z.string().max(200)).max(3).default([]), // generic follow-up questions (one per turn)
    maxTurns: z.number().int().min(1).max(4).default(2),
    hints: Hints.default([]),
  })
  .superRefine((r, ctx) => {
    const cids = new Set(r.concepts.map((c) => c.id));
    for (const q of r.quickReplies) if (q.conceptId && !cids.has(q.conceptId)) ctx.addIssue({ code: "custom", message: `quick reply concept ${q.conceptId} missing` });
  });
export type ListenRespondRound = z.infer<typeof ListenRespondRoundSchema>;

// ---- Activity ---------------------------------------------------------------
const base = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).max(60),
  description: z.string().min(1).max(200),
  world: WorldSlugSchema, // navigation category
  domain: DomainSlugSchema, // curriculum category (separate concept)
  objectiveIds: z.array(z.string()).min(1), // first = primary
  ageBand: AgeBandSchema,
  difficulty: z.number().int().min(1).max(3),
  instructions: z.string().min(1).max(200),
  audioInstructions: z.string().min(1).max(240),
  estimatedMinutes: z.number().min(1).max(15),
  feedback: z.object({
    correct: z.array(z.string().min(1)).min(1),
    encourage: z.array(z.string().min(1)).min(1),
    complete: z.array(z.string().min(1)).min(1),
  }),
  accessibility: z.object({
    requiresSpeech: z.boolean().default(false),
    tapAlternative: z.boolean().default(true),
    reducedMotionSafe: z.boolean().default(true),
  }),
  media: z.array(z.object({ type: z.enum(["image", "audio"]), src: z.string().startsWith("/"), alt: z.string().optional() })).default([]),
  completion: z.object({ minRoundsCompleted: z.number().int().min(1) }),
  frameworkMappings: z.array(FrameworkMappingSchema).default([]),
  characterId: z.string().default("pip"),
  tags: z.array(z.string()).default([]),
  adultSupervision: z.string().optional(), // shown when a task needs an adult
  realWorldMission: z.string().max(240).optional(),
  status: PublicationStatusSchema,
  reviewStatus: ReviewStatusSchema,
  version: z.number().int().min(1),
});

const withRounds = <E extends string, R extends z.ZodType>(engine: E, round: R) =>
  base.extend({ engine: z.literal(engine), rounds: z.array(round).min(1).max(6) });

export const ActivitySchema = z.discriminatedUnion("engine", [
  withRounds("tap-choose", TapChooseRoundSchema),
  withRounds("count-collect", CountCollectRoundSchema),
  withRounds("match-pair", MatchPairRoundSchema),
  withRounds("complete-pattern", CompletePatternRoundSchema),
  withRounds("listen-respond", ListenRespondRoundSchema),
]);
export type Activity = z.infer<typeof ActivitySchema>;
export type ActivityInput = z.input<typeof ActivitySchema>;

export const isFrameworkMapping = (x: unknown) => FrameworkMappingSchema.safeParse(x).success;
export { PublicationStatusSchema };
