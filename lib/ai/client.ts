// Browser-side conversation helper. Uses the built-in responder unless the parent enabled AI AND the server
// is configured; any failure silently falls back so the child is never stuck.
import type { ListenRespondRound } from "@/lib/games/schema";
import type { AgeBand } from "@/lib/curriculum/schema";
import { localRespond } from "./local";
import { ConversationResponseSchema, MAX_HISTORY_TURNS, type Turn } from "./schema";
import type { ConversationResult } from "./types";

const usageKey = () => `lww:ai-usage:${new Date().toISOString().slice(0, 10)}`;
function readUsage(): number { try { return Number(localStorage.getItem(usageKey()) ?? "0") || 0; } catch { return 0; } }
function bumpUsage() { try { localStorage.setItem(usageKey(), String(readUsage() + 1)); } catch { /* ignore */ } }
export const aiRepliesToday = readUsage;

export async function converse(args: {
  activityId: string; round: ListenRespondRound; text: string; history: Turn[]; turnIndex: number; ageBand: AgeBand;
  aiEnabled: boolean; dailyLimit: number; fetchImpl?: typeof fetch; timeoutMs?: number;
}): Promise<ConversationResult> {
  const local = (): ConversationResult => ({ ...localRespond(args.round, args.text, args.turnIndex), source: "local" });
  if (!args.aiEnabled || args.dailyLimit <= 0 || readUsage() >= args.dailyLimit || !args.text.trim()) return local();
  const f = args.fetchImpl ?? fetch;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), args.timeoutMs ?? 9000);
  try {
    const res = await f("/api/conversation", {
      method: "POST", headers: { "content-type": "application/json" }, signal: controller.signal,
      body: JSON.stringify({ activityId: args.activityId, roundId: args.round.id, ageBand: args.ageBand, childMessage: args.text.slice(0, 200), history: args.history.slice(-MAX_HISTORY_TURNS), turnIndex: args.turnIndex }),
    });
    if (!res.ok) return { ...local(), source: "fallback" };
    const json = await res.json();
    const parsed = ConversationResponseSchema.safeParse(json);
    if (!parsed.success) return { ...local(), source: "fallback" };
    bumpUsage();
    return { ...parsed.data, source: json.source === "provider" ? "provider" : "local" };
  } catch {
    return { ...local(), source: "fallback" };
  } finally {
    clearTimeout(timer);
  }
}
