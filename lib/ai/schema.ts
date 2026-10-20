import { z } from "zod";
import { AgeBandSchema } from "@/lib/curriculum/schema";

export const MAX_HISTORY_TURNS = 8;
export const MAX_CHILD_MESSAGE = 200;

export const TurnSchema = z.object({ speaker: z.enum(["child", "character"]), text: z.string().min(1).max(240) });
export type Turn = z.infer<typeof TurnSchema>;

/** What the browser may send. No profile data: no name, no age in years, no history across activities. */
export const ConversationRequestSchema = z.object({
  activityId: z.string().regex(/^[a-z0-9-]+$/).max(80),
  roundId: z.string().regex(/^[a-z0-9-]+$/).max(40),
  ageBand: AgeBandSchema,
  childMessage: z.string().max(MAX_CHILD_MESSAGE),
  history: z.array(TurnSchema).max(MAX_HISTORY_TURNS).default([]),
  turnIndex: z.number().int().min(0).max(10).default(0),
});
export type ConversationRequest = z.infer<typeof ConversationRequestSchema>;

/** The only shape the UI will ever display. Anything else is rejected and replaced by a safe fallback. */
export const ConversationResponseSchema = z.object({
  spokenResponse: z.string().min(1).max(260),
  displayText: z.string().max(100).optional(),
  state: z.enum(["continue", "wrap-up"]),
  nextPrompt: z.string().max(160).optional(),
  needsClarification: z.boolean().default(false),
  endActivity: z.boolean().default(false),
  safetyFallback: z.boolean().default(false),
});
export type ConversationResponse = z.infer<typeof ConversationResponseSchema>;
