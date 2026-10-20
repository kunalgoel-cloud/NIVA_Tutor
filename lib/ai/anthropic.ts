// Anthropic Messages API adapter (server-side only). Implemented and unit-tested with a mocked fetch;
// NOT yet exercised against the live API in this repository's CI. See docs/known-limitations.md.
import type { ConversationProvider, ProviderInput } from "./types";

export function createAnthropicProvider(opts: { apiKey?: string; model?: string; fetchImpl?: typeof fetch }): ConversationProvider {
  const f = opts.fetchImpl ?? fetch;
  return {
    id: "anthropic",
    isConfigured: () => !!opts.apiKey && !!opts.model,
    async respond(input: ProviderInput, signal: AbortSignal) {
      if (!opts.apiKey || !opts.model) throw new Error("provider not configured");
      const messages = [
        ...input.history.map((t) => ({ role: t.speaker === "child" ? ("user" as const) : ("assistant" as const), content: t.text })),
        { role: "user" as const, content: input.childMessage || "(the child said nothing)" },
      ];
      const res = await f("https://api.anthropic.com/v1/messages", {
        method: "POST", signal,
        headers: { "content-type": "application/json", "x-api-key": opts.apiKey, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: opts.model, max_tokens: 300, system: input.system, messages }),
      });
      if (!res.ok) throw new Error(`provider HTTP ${res.status}`); // status only, never the key or body
      const body = (await res.json()) as { content?: { type: string; text?: string }[] };
      const text = body.content?.find((c) => c.type === "text")?.text ?? "";
      const start = text.indexOf("{"), end = text.lastIndexOf("}");
      if (start < 0 || end <= start) throw new Error("provider returned no JSON");
      return JSON.parse(text.slice(start, end + 1));
    },
  };
}
