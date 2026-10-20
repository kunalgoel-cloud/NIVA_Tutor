// Conversation service: validates input, calls a provider with a timeout, validates output,
// and ALWAYS returns something safe (falls back to the built-in responder).
import { activityById, characterById } from "@/content";
import { objectiveById } from "@/content/objectives";
import { ConversationRequestSchema, ConversationResponseSchema, MAX_HISTORY_TURNS } from "./schema";
import { isOutputSafe, questionCount, redactChildInput } from "./safety";
import { localRespond } from "./local";
import { buildSystemPrompt } from "./prompt";
import type { ConversationProvider, ConversationResult } from "./types";
import { isChildVisible } from "@/lib/validation/publication";

export type ServiceError = { error: "invalid-request" | "unknown-activity"; message: string };

export async function runConversation(
  rawRequest: unknown,
  provider: ConversationProvider | null,
  opts: { timeoutMs: number }
): Promise<ConversationResult | ServiceError> {
  const parsed = ConversationRequestSchema.safeParse(rawRequest);
  if (!parsed.success) return { error: "invalid-request", message: "That request was not understood." };
  const req = parsed.data;

  const activity = activityById(req.activityId);
  if (!activity || activity.engine !== "listen-respond" || !isChildVisible(activity)) return { error: "unknown-activity", message: "Unknown conversation activity." };
  const round = activity.rounds.find((r) => r.id === req.roundId);
  if (!round) return { error: "unknown-activity", message: "Unknown conversation round." };

  const childMessage = redactChildInput(req.childMessage);
  const local = (source: "local" | "fallback", safety = false): ConversationResult => ({ ...localRespond(round, childMessage, req.turnIndex), safetyFallback: safety, source });

  if (!provider || !provider.isConfigured()) return local("local");
  if (!childMessage) return local("local");

  const character = characterById(activity.characterId);
  const objective = objectiveById(activity.objectiveIds[0]);
  const system = buildSystemPrompt({ persona: character, objectiveTitle: objective?.title ?? activity.title, roundPrompt: round.prompt, ageBand: req.ageBand, turnIndex: req.turnIndex, maxTurns: round.maxTurns });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs);
  try {
    const raw = await provider.respond({ system, history: req.history.slice(-MAX_HISTORY_TURNS), childMessage, ageBand: req.ageBand, timeoutMs: opts.timeoutMs }, controller.signal);
    const checked = ConversationResponseSchema.safeParse(raw);
    if (!checked.success) return local("fallback");
    const r = checked.data;
    const texts = [r.spokenResponse, r.displayText ?? "", r.nextPrompt ?? ""];
    if (!texts.every(isOutputSafe) || questionCount(r.spokenResponse) > 1) return local("fallback", true);
    // Past the final turn, force a graceful end regardless of what the model asked.
    if (req.turnIndex + 1 >= round.maxTurns) return { ...r, state: "wrap-up", endActivity: true, nextPrompt: undefined, safetyFallback: false, source: "provider" };
    return { ...r, safetyFallback: false, source: "provider" };
  } catch {
    return local("fallback"); // timeout, network error or provider error: the child never sees an error
  } finally {
    clearTimeout(timer);
  }
}
