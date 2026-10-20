// Pure row <-> app mapping for the Supabase tables (see supabase/migrations). Kept separate so it can be unit-tested.
import { ParentSettingsSchema, defaultSettings, type ParentSettings } from "@/lib/parent/settings";
import type { AgeBand } from "@/lib/curriculum/schema";
import type { ActivityAttempt } from "@/lib/learning/types";
import type { ChildProfile } from "./types";

export type ProfileRow = { id: string; nickname: string; age_band: AgeBand; is_demo: boolean; created_at: string };
export type AttemptRow = {
  id: string; child_profile_id: string; activity_id: string; activity_version: number; objective_id: string; outcome: ActivityAttempt["outcome"];
  hint_count: number; assistance_level: ActivityAttempt["assistanceLevel"]; completion_status: ActivityAttempt["completionStatus"];
  occurred_at: string; duration_seconds: number; rounds: ActivityAttempt["rounds"]; parent_note: string | null;
};
export type SettingsRow = {
  session_preferences: Record<string, unknown>; audio_preferences: Record<string, unknown>; ai_settings: Record<string, unknown>; privacy_settings: Record<string, unknown>;
} | null;
export type OverrideRow = { activity_id: string; status: string | null; review_status: string | null };

export const profileFromRow = (r: ProfileRow): ChildProfile => ({ id: r.id, nickname: r.nickname, ageBand: r.age_band, isDemo: r.is_demo, createdAt: r.created_at });

export const attemptFromRow = (r: AttemptRow): ActivityAttempt => ({
  id: r.id, childProfileId: r.child_profile_id, activityId: r.activity_id, activityVersion: r.activity_version, objectiveId: r.objective_id,
  outcome: r.outcome, hintCount: r.hint_count, assistanceLevel: r.assistance_level, completionStatus: r.completion_status,
  occurredAt: r.occurred_at, durationSeconds: r.duration_seconds, rounds: Array.isArray(r.rounds) ? r.rounds : [], ...(r.parent_note ? { parentNote: r.parent_note } : {}),
});

/** The id is deliberately omitted: the database assigns a uuid. */
export const attemptToRow = (a: ActivityAttempt) => ({
  child_profile_id: a.childProfileId, activity_id: a.activityId, activity_version: a.activityVersion, objective_id: a.objectiveId, outcome: a.outcome,
  hint_count: a.hintCount, assistance_level: a.assistanceLevel, completion_status: a.completionStatus, occurred_at: a.occurredAt,
  duration_seconds: a.durationSeconds, rounds: a.rounds, parent_note: a.parentNote ?? null,
});

/** Spread the app's settings over the four jsonb columns. The PIN is a salted hash, never the PIN itself. */
export function settingsToRow(s: ParentSettings) {
  return {
    session_preferences: { ...s.session, interests: s.interests },
    audio_preferences: { ...s.audio, speech: s.speech },
    ai_settings: s.ai,
    privacy_settings: { ...s.privacy, parentPin: s.parentPin },
  };
}

export function settingsFromRows(row: SettingsRow, overrides: OverrideRow[]): ParentSettings {
  const statusOverrides: Record<string, { status?: string; reviewStatus?: string }> = {};
  for (const o of overrides) statusOverrides[o.activity_id] = { ...(o.status ? { status: o.status } : {}), ...(o.review_status ? { reviewStatus: o.review_status } : {}) };
  if (!row) return ParentSettingsSchema.parse({ statusOverrides });
  const { interests, ...session } = row.session_preferences as { interests?: string[] };
  const { speech, ...audio } = row.audio_preferences as { speech?: unknown };
  const { parentPin, ...privacy } = row.privacy_settings as { parentPin?: unknown };
  const parsed = ParentSettingsSchema.safeParse({ session, audio, speech, ai: row.ai_settings, privacy, interests: interests ?? [], parentPin: parentPin ?? null, statusOverrides });
  return parsed.success ? parsed.data : { ...defaultSettings(), statusOverrides: statusOverrides as ParentSettings["statusOverrides"] };
}
