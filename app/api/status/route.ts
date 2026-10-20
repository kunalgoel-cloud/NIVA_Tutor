import { NextResponse } from "next/server";
import { aiConfigStatus, supabaseConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

/** Configuration status for the parent settings screen. Reports names of missing variables only, never values. */
export async function GET() {
  const ai = aiConfigStatus();
  return NextResponse.json({
    ai: ai.ok ? { configured: true } : { configured: false, missing: ai.missing, message: ai.message },
    supabase: { configured: supabaseConfigured(), note: "When configured, parents can sign in to store progress in Supabase; otherwise progress stays on this device." },
  });
}
