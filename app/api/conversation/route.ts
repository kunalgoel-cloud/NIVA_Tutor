import { NextResponse } from "next/server";
import { aiConfigStatus, readServerEnv } from "@/lib/env";
import { createAnthropicProvider } from "@/lib/ai/anthropic";
import { createRateLimiter } from "@/lib/ai/rate-limit";
import { runConversation } from "@/lib/ai/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 4096;
let limiter: ReturnType<typeof createRateLimiter> | null = null;

export async function POST(req: Request) {
  const status = aiConfigStatus();
  if (!status.ok) {
    // Not an error for the child: the client falls back to the built-in conversation.
    return NextResponse.json({ error: "ai-not-configured", message: status.message, missing: status.missing }, { status: 503 });
  }
  const env = readServerEnv();
  limiter ??= createRateLimiter(env.AI_RATE_LIMIT_PER_HOUR, 3_600_000);
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = limiter.check(ip);
  if (!rl.allowed) return NextResponse.json({ error: "rate-limited", message: "Too many replies for now." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });

  const text = await req.text();
  if (text.length > MAX_BODY_BYTES) return NextResponse.json({ error: "invalid-request", message: "Request too large." }, { status: 413 });
  let body: unknown;
  try { body = JSON.parse(text); } catch { return NextResponse.json({ error: "invalid-request", message: "Invalid JSON." }, { status: 400 }); }

  const provider = createAnthropicProvider({ apiKey: env.AI_API_KEY, model: env.AI_MODEL });
  const result = await runConversation(body, provider, { timeoutMs: env.AI_TIMEOUT_MS });
  if ("error" in result) return NextResponse.json(result, { status: 400 });
  return NextResponse.json(result);
}
