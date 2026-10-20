// Built-in conversation responder. Needs no network or API key, so every conversation activity always works.
import type { ListenRespondRound } from "@/lib/games/schema";
import { evaluateResponse } from "@/lib/games/evaluate";
import type { ConversationResponse } from "./schema";

const CLOSING = ["Thank you for chatting with me!", "I loved hearing your ideas!", "What a good talker you are!"];

export function localRespond(round: ListenRespondRound, childMessage: string, turnIndex: number): ConversationResponse {
  const ev = evaluateResponse(round, childMessage);
  const isLast = turnIndex + 1 >= round.maxTurns;
  if (!ev.understood) {
    return { spokenResponse: "I am listening. You can tap a picture too!", state: "continue", needsClarification: true, endActivity: false, safetyFallback: false };
  }
  const parts = [ev.reply];
  if (ev.needsModelSentence && round.modelSentence) parts.push(`You could say: ${round.modelSentence}`);
  if (isLast) {
    parts.push(CLOSING[turnIndex % CLOSING.length]);
    return { spokenResponse: parts.join(" ").slice(0, 260), state: "wrap-up", needsClarification: false, endActivity: true, safetyFallback: false };
  }
  const next = ev.followUp ?? round.followUps[turnIndex] ?? undefined;
  return { spokenResponse: parts.join(" ").slice(0, 260), nextPrompt: next, state: "continue", needsClarification: false, endActivity: false, safetyFallback: false };
}
