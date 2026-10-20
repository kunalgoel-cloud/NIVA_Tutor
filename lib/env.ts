// Environment validation at the integration boundary. Error messages name variables, never values.
import { z } from "zod";

const ServerEnvSchema = z.object({
  AI_ENABLED: z.enum(["true", "false"]).default("false"),
  AI_PROVIDER: z.enum(["local", "anthropic"]).default("local"),
  AI_API_KEY: z.string().optional(),
  AI_MODEL: z.string().optional(),
  AI_RATE_LIMIT_PER_HOUR: z.coerce.number().int().min(1).max(10_000).default(60),
  AI_TIMEOUT_MS: z.coerce.number().int().min(1000).max(30_000).default(8000),
});

export type ServerEnv = z.infer<typeof ServerEnvSchema>;

export type AiConfigStatus =
  | { ok: true; provider: "anthropic" }
  | { ok: false; missing: string[]; message: string };

export function readServerEnv(source: Record<string, string | undefined> = process.env): ServerEnv {
  return ServerEnvSchema.parse({
    AI_ENABLED: source.AI_ENABLED || undefined,
    AI_PROVIDER: source.AI_PROVIDER || undefined,
    AI_API_KEY: source.AI_API_KEY || undefined,
    AI_MODEL: source.AI_MODEL || undefined,
    AI_RATE_LIMIT_PER_HOUR: source.AI_RATE_LIMIT_PER_HOUR || undefined,
    AI_TIMEOUT_MS: source.AI_TIMEOUT_MS || undefined,
  });
}

export function aiConfigStatus(source: Record<string, string | undefined> = process.env): AiConfigStatus {
  let env: ServerEnv;
  try { env = readServerEnv(source); } catch { return { ok: false, missing: [], message: "AI settings in the environment are invalid. Check .env.local against .env.example." }; }
  const missing: string[] = [];
  if (env.AI_ENABLED !== "true") missing.push("AI_ENABLED=true");
  if (env.AI_PROVIDER !== "anthropic") missing.push("AI_PROVIDER=anthropic");
  if (!env.AI_API_KEY) missing.push("AI_API_KEY");
  if (!env.AI_MODEL) missing.push("AI_MODEL");
  if (missing.length) return { ok: false, missing, message: "AI chat is not set up. Games and built-in conversations still work. See docs/deployment.md to add an AI provider." };
  return { ok: true, provider: "anthropic" };
}

export const supabaseConfigured = (source: Record<string, string | undefined> = process.env) =>
  !!source.NEXT_PUBLIC_SUPABASE_URL && !!source.NEXT_PUBLIC_SUPABASE_ANON_KEY;
