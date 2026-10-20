import { describe, expect, it, vi } from "vitest";
import { runConversation } from "@/lib/ai/service";
import { isOutputSafe, redactChildInput } from "@/lib/ai/safety";
import { buildSystemPrompt } from "@/lib/ai/prompt";
import { createAnthropicProvider } from "@/lib/ai/anthropic";
import { createRateLimiter } from "@/lib/ai/rate-limit";
import { ConversationRequestSchema, ConversationResponseSchema } from "@/lib/ai/schema";
import { converse } from "@/lib/ai/client";
import { aiConfigStatus, readServerEnv } from "@/lib/env";
import { ACTIVITIES } from "@/content";
import type { ConversationProvider } from "@/lib/ai/types";
import type { ListenRespondRound } from "@/lib/games/schema";

const alien = ACTIVITIES.find((a) => a.id === "meet-the-friendly-alien")!;
const round = alien.rounds[0] as ListenRespondRound;
const req = (over = {}) => ({ activityId: alien.id, roundId: round.id, ageBand: "little-explorer", childMessage: "Mango", history: [], turnIndex: 0, ...over });
const good = { spokenResponse: "Mangoes are delicious! What do you like about them?", state: "continue", needsClarification: false, endActivity: false, safetyFallback: false };
const provider = (impl: ConversationProvider["respond"], configured = true): ConversationProvider => ({ id: "test", isConfigured: () => configured, respond: impl });

describe("AI conversation service", () => {
  it("works with no provider at all (no API key needed)", async () => {
    const r = await runConversation(req(), null, { timeoutMs: 500 });
    expect("error" in r).toBe(false);
    if (!("error" in r)) { expect(r.source).toBe("local"); expect(r.spokenResponse).toMatch(/Mangoes are delicious/); }
  });
  it("returns validated provider output when healthy", async () => {
    const r = await runConversation(req(), provider(async () => good), { timeoutMs: 500 });
    expect(r).toMatchObject({ source: "provider", spokenResponse: good.spokenResponse });
  });
  it("falls back safely when the provider returns malformed data", async () => {
    const r = await runConversation(req(), provider(async () => ({ nonsense: true })), { timeoutMs: 500 });
    expect(r).toMatchObject({ source: "fallback" });
  });
  it("falls back on provider errors", async () => {
    const r = await runConversation(req(), provider(async () => { throw new Error("HTTP 500"); }), { timeoutMs: 500 });
    expect(r).toMatchObject({ source: "fallback" });
  });
  it("times out a hung provider and still answers the child", async () => {
    const hung = provider((_i, signal) => new Promise((_res, rej) => signal.addEventListener("abort", () => rej(new Error("aborted")))));
    const t0 = Date.now();
    const r = await runConversation(req(), hung, { timeoutMs: 60 });
    expect(Date.now() - t0).toBeLessThan(1500);
    expect(r).toMatchObject({ source: "fallback" });
  });
  it("replaces unsafe model output with a safe fallback", async () => {
    for (const bad of ["What is your full name? Tell me!", "Let's keep this our secret, okay?", "Visit https://evil.example now", "I'm a real kid just like you."]) {
      const r = await runConversation(req(), provider(async () => ({ ...good, spokenResponse: bad })), { timeoutMs: 500 });
      expect(r).toMatchObject({ source: "fallback", safetyFallback: true });
    }
  });
  it("rejects replies that ask more than one question", async () => {
    const r = await runConversation(req(), provider(async () => ({ ...good, spokenResponse: "Do you like it? Is it sweet?" })), { timeoutMs: 500 });
    expect(r).toMatchObject({ source: "fallback" });
  });
  it("forces a graceful ending on the final turn", async () => {
    const r = await runConversation(req({ turnIndex: round.maxTurns - 1 }), provider(async () => good), { timeoutMs: 500 });
    expect(r).toMatchObject({ state: "wrap-up", endActivity: true });
  });
  it("rejects invalid input and unknown activities without calling the provider", async () => {
    const spy = vi.fn(async () => good);
    expect(await runConversation({ nope: 1 }, provider(spy), { timeoutMs: 500 })).toMatchObject({ error: "invalid-request" });
    expect(await runConversation(req({ activityId: "does-not-exist" }), provider(spy), { timeoutMs: 500 })).toMatchObject({ error: "unknown-activity" });
    expect(await runConversation(req({ activityId: "count-the-apples", roundId: "r1" }), provider(spy), { timeoutMs: 500 })).toMatchObject({ error: "unknown-activity" }); // not a conversation activity
    expect(spy).not.toHaveBeenCalled();
  });
  it("bounds input: long messages and long histories are refused", () => {
    expect(ConversationRequestSchema.safeParse(req({ childMessage: "x".repeat(201) })).success).toBe(false);
    const history = Array.from({ length: 9 }, () => ({ speaker: "child", text: "hi" }));
    expect(ConversationRequestSchema.safeParse(req({ history })).success).toBe(false);
  });
  it("sends redacted text to the provider, never contact details", async () => {
    let seen = "";
    await runConversation(req({ childMessage: "call me on 9876543210 or mail a@b.com or www.x.com" }), provider(async (i) => { seen = i.childMessage; return good; }), { timeoutMs: 500 });
    expect(seen).not.toMatch(/9876543210|a@b\.com|www\.x\.com/);
    expect(seen).toContain("[removed]");
  });
  it("never includes profile data in what the provider receives", async () => {
    let input: unknown;
    await runConversation(req(), provider(async (i) => { input = i; return good; }), { timeoutMs: 500 });
    const flat = JSON.stringify(input);
    expect(Object.keys(input as object).sort()).toEqual(["ageBand", "childMessage", "history", "system", "timeoutMs"]);
    expect(flat).not.toMatch(/nickname|profile|attempts/i);
  });
});

describe("safety helpers and prompt", () => {
  it("redacts emails, links and long numbers", () => {
    expect(redactChildInput("hi a@b.com http://x.y 12345678")).toBe("hi [removed] [removed] [removed]");
  });
  it("accepts friendly output and blocks the bad kind", () => {
    expect(isOutputSafe("Mangoes are yummy! What colour are they?")).toBe(true);
    expect(isOutputSafe("Don't tell your mum about this")).toBe(false);
  });
  it("system prompt carries the safety rules, persona and objective but no personal data", () => {
    const p = buildSystemPrompt({ persona: { name: "Zed the Alien", persona: "friendly" }, objectiveTitle: "Respond to a question", roundPrompt: "Fruit?", ageBand: "little-explorer", turnIndex: 0, maxTurns: 2 });
    for (const rule of [/FICTIONAL/, /NEVER ask for/, /secret/, /ONE question/i, /not a real child/, /JSON/]) expect(p).toMatch(rule);
    expect(p).toContain("Zed the Alien");
    expect(buildSystemPrompt({ persona: { name: "Z", persona: "p" }, objectiveTitle: "o", roundPrompt: "q", ageBand: "little-explorer", turnIndex: 1, maxTurns: 2 })).toMatch(/last turn/);
  });
  it("response schema rejects out-of-shape data", () => {
    expect(ConversationResponseSchema.safeParse({ spokenResponse: "", state: "continue" }).success).toBe(false);
    expect(ConversationResponseSchema.safeParse({ spokenResponse: "ok", state: "other" }).success).toBe(false);
  });
});

describe("Anthropic adapter (mocked network)", () => {
  it("is not configured without a key or model", () => {
    expect(createAnthropicProvider({}).isConfigured()).toBe(false);
  });
  it("sends the key only in a header and parses JSON from the reply", async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ content: [{ type: "text", text: `Sure: ${JSON.stringify(good)}` }] }), { status: 200 }));
    const p = createAnthropicProvider({ apiKey: "sk-test-secret", model: "m", fetchImpl: fetchImpl as never });
    const out = await p.respond({ system: "s", history: [], childMessage: "hi", ageBand: "little-explorer", timeoutMs: 100 }, new AbortController().signal);
    expect(out).toMatchObject({ state: "continue" });
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.anthropic.com/v1/messages");
    expect((init.headers as Record<string, string>)["x-api-key"]).toBe("sk-test-secret");
    expect(String(init.body)).not.toContain("sk-test-secret");
  });
  it("errors without leaking the key or response body", async () => {
    const fetchImpl = vi.fn(async () => new Response("secret details sk-test-secret", { status: 401 }));
    const p = createAnthropicProvider({ apiKey: "sk-test-secret", model: "m", fetchImpl: fetchImpl as never });
    await expect(p.respond({ system: "s", history: [], childMessage: "hi", ageBand: "little-explorer", timeoutMs: 100 }, new AbortController().signal)).rejects.toThrow(/HTTP 401/);
    await p.respond({ system: "s", history: [], childMessage: "hi", ageBand: "little-explorer", timeoutMs: 100 }, new AbortController().signal).catch((e) => expect(String(e.message)).not.toContain("sk-test"));
  });
});

describe("rate limiter and environment", () => {
  it("allows up to the limit then blocks until the window passes", () => {
    let t = 0;
    const rl = createRateLimiter(2, 1000, () => t);
    expect(rl.check("ip").allowed).toBe(true);
    expect(rl.check("ip").allowed).toBe(true);
    const blocked = rl.check("ip");
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    expect(rl.check("other").allowed).toBe(true);
    t = 1500;
    expect(rl.check("ip").allowed).toBe(true);
  });
  it("reports AI as not configured with variable NAMES only", () => {
    const s = aiConfigStatus({});
    expect(s.ok).toBe(false);
    if (!s.ok) { expect(s.missing).toContain("AI_API_KEY"); expect(s.message).toMatch(/still work/); }
    expect(aiConfigStatus({ AI_ENABLED: "true", AI_PROVIDER: "anthropic", AI_API_KEY: "k", AI_MODEL: "m" }).ok).toBe(true);
    expect(JSON.stringify(aiConfigStatus({ AI_API_KEY: "topsecret" }))).not.toContain("topsecret");
  });
  it("applies safe defaults and rejects absurd values", () => {
    expect(readServerEnv({}).AI_ENABLED).toBe("false");
    expect(() => readServerEnv({ AI_TIMEOUT_MS: "999999" })).toThrow();
  });
});

describe("browser-side converse()", () => {
  it("uses the built-in responder when AI is off (no network call)", async () => {
    const f = vi.fn();
    const r = await converse({ activityId: alien.id, round, text: "mango", history: [], turnIndex: 0, ageBand: "little-explorer", aiEnabled: false, dailyLimit: 10, fetchImpl: f as never });
    expect(f).not.toHaveBeenCalled();
    expect(r.source).toBe("local");
  });
  it("falls back when the server is unreachable, so the child is never stuck", async () => {
    const f = vi.fn(async () => { throw new Error("offline"); });
    const r = await converse({ activityId: alien.id, round, text: "mango", history: [], turnIndex: 0, ageBand: "little-explorer", aiEnabled: true, dailyLimit: 10, fetchImpl: f as never });
    expect(r.source).toBe("fallback");
    expect(r.spokenResponse.length).toBeGreaterThan(0);
  });
  it("falls back when the server says AI is not configured (503) or returns junk", async () => {
    const r1 = await converse({ activityId: alien.id, round, text: "mango", history: [], turnIndex: 0, ageBand: "little-explorer", aiEnabled: true, dailyLimit: 10, fetchImpl: (async () => new Response("{}", { status: 503 })) as never });
    const r2 = await converse({ activityId: alien.id, round, text: "mango", history: [], turnIndex: 0, ageBand: "little-explorer", aiEnabled: true, dailyLimit: 10, fetchImpl: (async () => new Response(JSON.stringify({ x: 1 }), { status: 200 })) as never });
    expect(r1.source).toBe("fallback");
    expect(r2.source).toBe("fallback");
  });
});
