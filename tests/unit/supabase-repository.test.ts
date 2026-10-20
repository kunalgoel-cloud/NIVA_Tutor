// Tests OUR adapter against an in-memory stand-in (tests/fake-supabase.ts). Not a live Supabase test.
import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseRepository } from "@/lib/database/supabase-repository";
import { attemptFromRow, attemptToRow, settingsFromRows, settingsToRow } from "@/lib/database/supabase-mapping";
import { StorageUnavailableError } from "@/lib/database/types";
import { defaultSettings } from "@/lib/parent/settings";
import { buildAttempt } from "@/lib/learning/attempt";
import { ACTIVITIES } from "@/content";
import { hashPin } from "@/lib/parent/gate";
import { createFakeSupabase } from "../fake-supabase";
import { obs } from "../helpers";

const mem = () => { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k) }; };
const setup = (opts = {}) => { const f = createFakeSupabase(opts); const store = mem(); return { ...f, repo: new SupabaseRepository(f.client as unknown as SupabaseClient, "user-1", () => store), store }; };
const act = ACTIVITIES[0];
const attempt = (profileId: string, at = new Date()) => buildAttempt({ id: "x", profileId, activity: act, observations: [obs({ activityId: act.id, objectiveId: act.objectiveIds[0], outcome: "independent" })], reachedEnd: true, startedAt: at.getTime() - 60_000, now: at });

describe("row mapping", () => {
  it("round-trips an attempt (the database assigns the id)", () => {
    const a = { ...attempt("p1"), parentNote: "tried hard" };
    const row = attemptToRow(a);
    expect("id" in row).toBe(false);
    const back = attemptFromRow({ ...row, id: "uuid-1" } as never);
    expect(back).toMatchObject({ id: "uuid-1", childProfileId: "p1", activityId: act.id, outcome: a.outcome, parentNote: "tried hard" });
    expect(back.rounds).toEqual(a.rounds);
  });
  it("round-trips settings across the four jsonb columns, including interests, microphone and the PIN hash", async () => {
    const s = { ...defaultSettings(), interests: ["fruit"], speech: { microphoneEnabled: true }, ai: { enabled: true, dailyReplyLimit: 5 }, parentPin: await hashPin("1234") };
    s.session = { ...s.session, adventureLength: 3 };
    const back = settingsFromRows(settingsToRow(s), []);
    expect(back).toEqual({ ...s, statusOverrides: {} });
  });
  it("falls back to safe defaults for missing or corrupt settings (AI and mic off)", () => {
    expect(settingsFromRows(null, []).ai.enabled).toBe(false);
    const broken = settingsFromRows({ session_preferences: { adventureLength: "lots" }, audio_preferences: {}, ai_settings: {}, privacy_settings: {} }, []);
    expect(broken.speech.microphoneEnabled).toBe(false);
    expect(broken.ai.enabled).toBe(false);
  });
  it("maps publication overrides", () => {
    const s = settingsFromRows(null, [{ activity_id: "a", status: "retired", review_status: null }]);
    expect(s.statusOverrides).toEqual({ a: { status: "retired" } });
  });
});

describe("SupabaseRepository", () => {
  it("creates, loads and selects profiles; first one becomes active per device", async () => {
    const { repo } = setup();
    let d = await repo.createProfile({ nickname: "  Little Star  ", ageBand: "little-explorer" });
    expect(d.profiles).toHaveLength(1);
    expect(d.profiles[0]).toMatchObject({ nickname: "Little Star", isDemo: false });
    expect(d.activeProfileId).toBe(d.profiles[0].id);
    d = await repo.createProfile({ nickname: "B", ageBand: "curious-thinker" });
    expect(d.activeProfileId).toBe(d.profiles[0].id);
    d = await repo.setActiveProfile(d.profiles[1].id);
    expect(d.activeProfileId).toBe(d.profiles[1].id);
  });
  it("records an attempt and reads it back with its evidence", async () => {
    const { repo } = setup();
    const d = await repo.createProfile({ nickname: "A", ageBand: "little-explorer" });
    const after = await repo.recordAttempt(attempt(d.profiles[0].id));
    expect(after.attempts).toHaveLength(1);
    expect(after.attempts[0].rounds[0].outcome).toBe("independent");
    expect(after.attempts[0].id).not.toBe("x");
  });
  it("saves a note and clears it when blank", async () => {
    const { repo } = setup();
    let d = await repo.createProfile({ nickname: "A", ageBand: "little-explorer" });
    d = await repo.recordAttempt(attempt(d.profiles[0].id));
    d = await repo.addNote(d.attempts[0].id, "  counted well  ");
    expect(d.attempts[0].parentNote).toBe("counted well");
    d = await repo.addNote(d.attempts[0].id, "   ");
    expect(d.attempts[0].parentNote).toBeUndefined();
  });
  it("persists settings and publication overrides, and removes dropped overrides", async () => {
    const { repo, tables } = setup();
    const s = { ...defaultSettings(), statusOverrides: { "count-the-apples": { status: "retired" as const }, "shape-detective": { reviewStatus: "reviewed" as const } } };
    let d = await repo.saveSettings(s);
    expect(d.settings.statusOverrides["count-the-apples"]).toEqual({ status: "retired" });
    expect(tables.parent_settings).toHaveLength(1);
    d = await repo.saveSettings({ ...s, statusOverrides: { "shape-detective": { reviewStatus: "reviewed" } } });
    expect(Object.keys(d.settings.statusOverrides)).toEqual(["shape-detective"]);
    d = await repo.saveSettings({ ...d.settings, ai: { enabled: true, dailyReplyLimit: 9 } });
    expect(tables.parent_settings).toHaveLength(1); // upsert, not duplicate
    expect(d.settings.ai).toEqual({ enabled: true, dailyReplyLimit: 9 });
  });
  it("deleting a profile removes its attempts (cascade) and resets the active pointer", async () => {
    const { repo } = setup();
    let d = await repo.createProfile({ nickname: "A", ageBand: "little-explorer" });
    d = await repo.createProfile({ nickname: "B", ageBand: "little-explorer" });
    const [a, b] = d.profiles;
    await repo.recordAttempt(attempt(a.id)); d = await repo.recordAttempt(attempt(b.id));
    d = await repo.deleteProfile(a.id);
    expect(d.profiles.map((p) => p.id)).toEqual([b.id]);
    expect(d.attempts.every((x) => x.childProfileId === b.id)).toBe(true);
    expect(d.activeProfileId).toBe(b.id);
  });
  it("demo reset only removes demo profiles", async () => {
    const { repo } = setup();
    await repo.createProfile({ nickname: "Real", ageBand: "little-explorer" });
    const d = await repo.createProfile({ nickname: "Demo", ageBand: "little-explorer", isDemo: true });
    const out = await repo.resetDemo();
    expect(out.profiles.map((p) => p.nickname)).toEqual(["Real"]);
    expect(d.profiles).toHaveLength(2);
  });
  it("seeds fictional history only into demo profiles", async () => {
    const { repo } = setup();
    let d = await repo.createProfile({ nickname: "Real", ageBand: "little-explorer" });
    d = await repo.createProfile({ nickname: "Demo", ageBand: "little-explorer", isDemo: true });
    const [real, demo] = d.profiles;
    expect((await repo.seedDemoHistory(real.id)).attempts).toEqual([]);
    const seeded = await repo.seedDemoHistory(demo.id);
    expect(seeded.attempts.length).toBeGreaterThan(5);
    expect(seeded.attempts.every((a) => a.childProfileId === demo.id)).toBe(true);
    expect((await repo.seedDemoHistory(demo.id)).attempts.length).toBe(seeded.attempts.length); // re-seeding does not duplicate
  });
  it("applies the retention window", async () => {
    const { repo } = setup();
    let d = await repo.createProfile({ nickname: "A", ageBand: "little-explorer" });
    await repo.recordAttempt(attempt(d.profiles[0].id, new Date("2020-01-01T00:00:00Z")));
    d = await repo.recordAttempt(attempt(d.profiles[0].id, new Date()));
    expect(d.attempts).toHaveLength(2);
    expect((await repo.applyRetention(new Date())).attempts).toHaveLength(1);
  });
  it("imports real on-device profiles and history, never demo data, re-keyed to new ids", async () => {
    const { repo } = setup();
    const local = {
      schemaVersion: 1 as const, activeProfileId: "L1", settings: defaultSettings(),
      profiles: [{ id: "L1", nickname: "Real", ageBand: "little-explorer" as const, isDemo: false, createdAt: "2026-01-01T00:00:00Z" }, { id: "L2", nickname: "Demo", ageBand: "little-explorer" as const, isDemo: true, createdAt: "2026-01-01T00:00:00Z" }],
      attempts: [attempt("L1"), attempt("L1"), attempt("L2")],
    };
    expect(await repo.importLocal(local)).toEqual({ profiles: 1, attempts: 2 });
    const d = await repo.load();
    expect(d.profiles.map((p) => p.nickname)).toEqual(["Real"]);
    expect(d.attempts).toHaveLength(2);
    expect(d.attempts.every((a) => a.childProfileId === d.profiles[0].id)).toBe(true);
  });
  it("turns a cloud failure into a controlled, parent-readable error (play continues in memory)", async () => {
    const { repo } = setup({ failOn: "child_profiles" });
    await expect(repo.load()).rejects.toBeInstanceOf(StorageUnavailableError);
    await expect(repo.createProfile({ nickname: "A", ageBand: "little-explorer" })).rejects.toThrow(/cloud storage/i);
  });
  it("only ever sends the signed-in parent's id on writes", async () => {
    const { repo, tables } = setup();
    await repo.createProfile({ nickname: "A", ageBand: "little-explorer" });
    await repo.saveSettings(defaultSettings());
    expect(tables.child_profiles.every((r) => r.parent_user_id === "user-1")).toBe(true);
    expect(tables.parent_settings.every((r) => r.parent_user_id === "user-1")).toBe(true);
  });
});
