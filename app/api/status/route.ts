import { NextResponse } from "next/server";
import { aiConfigStatus, supabaseConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

/** Configuration status for the parent settings screen. Reports names of missing variables only, never values. */
export async function GET() {
  const ai = aiConfigStatus();
  return NextResponse.json({
    ai: ai.ok ? { configured: true } : { configured: false, missing: ai.missing, message: ai.message },
    supabase: { configured: supabaseConfigured(), note: "Supabase storage is not wired into the app yet; progress is stored on this device." },
  });
}
