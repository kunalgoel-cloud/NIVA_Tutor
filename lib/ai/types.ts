import type { ConversationResponse } from "./schema";
import type { AgeBand } from "@/lib/curriculum/schema";
import type { Turn } from "./schema";

/** Everything a provider is allowed to know. Deliberately contains no child profile data. */
export type ProviderInput = {
  system: string; // safety + persona + objective, built by buildSystemPrompt()
  history: Turn[];
  childMessage: string;
  ageBand: AgeBand;
  timeoutMs: number;
};

/**
 * Provider abstraction: implement this to plug in any language-model API.
 * `respond` returns UNTRUSTED data (usually parsed JSON); the service validates it with Zod.
 */
export interface ConversationProvider {
  readonly id: string;
  isConfigured(): boolean;
  respond(input: ProviderInput, signal: AbortSignal): Promise<unknown>;
}

export type ConversationResult = ConversationResponse & { source: "local" | "provider" | "fallback" };
