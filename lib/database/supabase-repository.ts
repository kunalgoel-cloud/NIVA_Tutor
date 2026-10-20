import type { SupabaseClient } from "@supabase/supabase-js";
import { ACTIVITIES } from "@/content";
import type { AgeBand } from "@/lib/curriculum/schema";
import type { ActivityAttempt } from "@/lib/learning/types";
import type { ParentSettings } from "@/lib/parent/settings";
import { buildDemoAttempts } from "./demo";
import { attemptFromRow, attemptToRow, profileFromRow, settingsFromRows, settingsToRow, type AttemptRow, type OverrideRow, type ProfileRow, type SettingsRow } from "./supabase-mapping";
import { StorageUnavailableError, type AppData, type ChildProfile, type Repository } from "./types";

const PAGE = 1000;
const activeKey = (userId: string) => `lww:active:${userId}`;

/**
 * Cloud persistence in Supabase (Postgres + Row Level Security). Every call runs as the signed-in parent, so the
 * database itself only ever returns that parent's rows. After each change we re-read, so the UI always shows stored truth.
 * Which child is "active" is a per-device choice and stays in this browser.
 */
export class SupabaseRepository implements Repository {
  readonly kind = "supabase" as const;
  constructor(private readonly db: SupabaseClient, private readonly userId: string, private readonly storage: () => Pick<Storage, "getItem" | "setItem" | "removeItem"> = () => window.localStorage) {}

  private fail(what: string, err: { message?: string } | null): never {
    // Log the operation, never row contents or keys.
    console.error(`Supabase ${what} failed:`, err?.message ?? "unknown error");
    throw new StorageUnavailableError("Could not reach cloud storage. Your child can keep playing; progress from this moment may not be saved.");
  }
  private async run<T = unknown>(what: string, q: PromiseLike<{ data: unknown; error: { message?: string } | null }>): Promise<T> {
    let res;
    try { res = await q; } catch (e) { this.fail(what, e as Error); }
    if (res.error) this.fail(what, res.error);
    return res.data as T;
  }

  private readActive(): string | null { try { return this.storage().getItem(activeKey(this.userId)); } catch { return null; } }
  private writeActive(id: string | null) {
    try {
      const s = this.storage() as Pick<Storage, "setItem" | "removeItem">;
      if (id) s.setItem(activeKey(this.userId), id); else s.removeItem(activeKey(this.userId));
    } catch { /* per-device convenience only */ }
  }

  async load(): Promise<AppData> {
    const [profiles, settingsRow, overrides] = await Promise.all([
      this.run<ProfileRow[]>("load profiles", this.db.from("child_profiles").select("id,nickname,age_band,is_demo,created_at").order("created_at", { ascending: true })),
      this.run<SettingsRow>("load settings", this.db.from("parent_settings").select("session_preferences,audio_preferences,ai_settings,privacy_settings").maybeSingle()),
      this.run<OverrideRow[]>("load overrides", this.db.from("parent_activity_overrides").select("activity_id,status,review_status")),
    ]);
    const attempts: AttemptRow[] = [];
    for (let from = 0; ; from += PAGE) {
      const page = await this.run<AttemptRow[]>("load attempts", this.db.from("activity_attempts")
        .select("id,child_profile_id,activity_id,activity_version,objective_id,outcome,hint_count,assistance_level,completion_status,occurred_at,duration_seconds,rounds,parent_note")
        .order("occurred_at", { ascending: true }).range(from, from + PAGE - 1));
      attempts.push(...page);
      if (page.length < PAGE) break;
    }
    const profs = (profiles ?? []).map(profileFromRow);
    const saved = this.readActive();
    return {
      schemaVersion: 1, profiles: profs,
      activeProfileId: profs.some((p) => p.id === saved) ? saved : profs[0]?.id ?? null,
      settings: settingsFromRows(settingsRow ?? null, overrides ?? []),
      attempts: attempts.map(attemptFromRow),
    };
  }

  async saveSettings(s: ParentSettings): Promise<AppData> {
    await this.run("save settings", this.db.from("parent_settings").upsert({ parent_user_id: this.userId, ...settingsToRow(s) }, { onConflict: "parent_user_id" }));
    const existing = await this.run<{ activity_id: string }[]>("read overrides", this.db.from("parent_activity_overrides").select("activity_id"));
    const wanted = Object.entries(s.statusOverrides);
    const removed = (existing ?? []).map((r) => r.activity_id).filter((id) => !(id in s.statusOverrides));
    if (removed.length) await this.run("remove overrides", this.db.from("parent_activity_overrides").delete().in("activity_id", removed));
    if (wanted.length)
      await this.run("save overrides", this.db.from("parent_activity_overrides").upsert(
        wanted.map(([activity_id, o]) => ({ parent_user_id: this.userId, activity_id, status: o.status ?? null, review_status: o.reviewStatus ?? null })), { onConflict: "parent_user_id,activity_id" }));
    return this.load();
  }

  async createProfile(input: { nickname: string; ageBand: AgeBand; isDemo?: boolean }): Promise<AppData> {
    const nickname = input.nickname.trim().slice(0, 24) || (input.isDemo ? "Demo Explorer" : "Little Explorer");
    const rows = await this.run<{ id: string }[]>("create profile", this.db.from("child_profiles")
      .insert({ parent_user_id: this.userId, nickname, age_band: input.ageBand, is_demo: !!input.isDemo }).select("id"));
    if (!this.readActive() && rows?.[0]) this.writeActive(rows[0].id);
    return this.load();
  }

  async updateProfile(id: string, patch: Partial<Pick<ChildProfile, "nickname" | "ageBand">>): Promise<AppData> {
    const row: Record<string, string> = {};
    if (patch.nickname !== undefined && patch.nickname.trim()) row.nickname = patch.nickname.trim().slice(0, 24);
    if (patch.ageBand) row.age_band = patch.ageBand;
    if (Object.keys(row).length) await this.run("update profile", this.db.from("child_profiles").update(row).eq("id", id));
    return this.load();
  }

  async setActiveProfile(id: string | null): Promise<AppData> { this.writeActive(id); return this.load(); }

  async deleteProfile(id: string): Promise<AppData> {
    await this.run("delete profile", this.db.from("child_profiles").delete().eq("id", id)); // cascades to attempts and progress
    if (this.readActive() === id) this.writeActive(null);
    return this.load();
  }

  async recordAttempt(a: ActivityAttempt): Promise<AppData> {
    await this.run("record attempt", this.db.from("activity_attempts").insert(attemptToRow(a)));
    return this.load();
  }

  async addNote(attemptId: string, note: string): Promise<AppData> {
    await this.run("save note", this.db.from("activity_attempts").update({ parent_note: note.trim().slice(0, 300) || null }).eq("id", attemptId));
    return this.load();
  }

  async resetDemo(): Promise<AppData> {
    await this.run("reset demo", this.db.from("child_profiles").delete().eq("is_demo", true)); // real profiles are never touched
    return this.load();
  }

  async seedDemoHistory(profileId: string): Promise<AppData> {
    const current = await this.load();
    const p = current.profiles.find((x) => x.id === profileId);
    if (!p || !p.isDemo) return current; // never writes sample data into a real profile
    await this.run("clear demo history", this.db.from("activity_attempts").delete().eq("child_profile_id", profileId));
    await this.run("seed demo history", this.db.from("activity_attempts").insert(buildDemoAttempts(profileId, ACTIVITIES, new Date()).map(attemptToRow)));
    return this.load();
  }

  async applyRetention(now: Date): Promise<AppData> {
    const current = await this.load();
    const cutoff = new Date(now.getTime() - current.settings.privacy.retentionDays * 86_400_000).toISOString();
    await this.run("apply retention", this.db.from("activity_attempts").delete().lt("occurred_at", cutoff));
    return current.attempts.some((a) => a.occurredAt < cutoff) ? this.load() : current;
  }

  /** One-way copy of on-device data into the cloud account (real profiles only; demo data is never uploaded). */
  async importLocal(local: AppData): Promise<{ profiles: number; attempts: number }> {
    let profiles = 0, attempts = 0;
    for (const p of local.profiles.filter((x) => !x.isDemo)) {
      const [created] = await this.run<{ id: string }[]>("import profile", this.db.from("child_profiles").insert({ parent_user_id: this.userId, nickname: p.nickname, age_band: p.ageBand, is_demo: false }).select("id"));
      profiles++;
      const rows = local.attempts.filter((a) => a.childProfileId === p.id).map((a) => attemptToRow({ ...a, childProfileId: created.id }));
      for (let i = 0; i < rows.length; i += 200) await this.run("import attempts", this.db.from("activity_attempts").insert(rows.slice(i, i + 200)));
      attempts += rows.length;
    }
    return { profiles, attempts };
  }
}
