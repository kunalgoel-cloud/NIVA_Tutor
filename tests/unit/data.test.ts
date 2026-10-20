import { describe, expect, it } from "vitest";
import { LocalRepository, STORAGE_KEY, type StorageLike } from "@/lib/database/local-repository";
import { addProfile, emptyData, parseStored, pruneAttempts, removeDemo, removeProfile, withAttempt } from "@/lib/database/data";
import { StorageUnavailableError } from "@/lib/database/types";
import { buildExport, EXPORT_FORMAT } from "@/lib/privacy/export";
import { filterAttempts, summarise } from "@/lib/parent/summary";
import { ACTIVITIES } from "@/content";
import { buildAttempt } from "@/lib/learning/attempt";
import { hashPin } from "@/lib/parent/gate";
import { ParentSettingsSchema } from "@/lib/parent/settings";
import { obs } from "../helpers";

const mem = (): StorageLike & { map: Map<string, string> } => {
  const map = new Map<string, string>();
  return { map, getItem: (k) => map.get(k) ?? null, setItem: (k, v) => void map.set(k, v), removeItem: (k) => void map.delete(k) };
};
const act = ACTIVITIES[0];
const attemptFor = (profileId: string, when = new Date("2026-03-01T10:00:00Z"), activity = act) =>
  buildAttempt({ id: `a${Math.random()}`, profileId, activity, observations: [obs({ activityId: activity.id, objectiveId: activity.objectiveIds[0], outcome: "independent" })], reachedEnd: true, startedAt: when.getTime() - 90_000, now: when });

describe("local repository", () => {
  it("round-trips profiles, attempts and settings", async () => {
    const s = mem(); const repo = new LocalRepository(() => s);
    let d = await repo.createProfile({ nickname: "Little Star", ageBand: "little-explorer" });
    const pid = d.profiles[0].id;
    d = await repo.recordAttempt(attemptFor(pid));
    const fresh = await new LocalRepository(() => s).load();
    expect(fresh.profiles[0].nickname).toBe("Little Star");
    expect(fresh.attempts).toHaveLength(1);
    expect(fresh.activeProfileId).toBe(pid);
  });
  it("persists progress across sessions (activity completion -> stored evidence)", async () => {
    const s = mem(); const repo = new LocalRepository(() => s);
    const d = await repo.createProfile({ nickname: "A", ageBand: "little-explorer" });
    await repo.recordAttempt(attemptFor(d.profiles[0].id));
    expect(JSON.parse(s.map.get(STORAGE_KEY)!).attempts[0].rounds).toHaveLength(1);
  });
  it("turns storage failures into a controlled error, never a crash", async () => {
    const broken: StorageLike = { getItem: () => { throw new Error("denied"); }, setItem: () => { throw new Error("quota"); }, removeItem: () => {} };
    const repo = new LocalRepository(() => broken);
    await expect(repo.load()).rejects.toBeInstanceOf(StorageUnavailableError);
    await expect(repo.createProfile({ nickname: "A", ageBand: "little-explorer" })).rejects.toBeInstanceOf(StorageUnavailableError);
  });
  it("recovers from corrupt stored data with an empty state", async () => {
    const s = mem(); s.setItem(STORAGE_KEY, "{not json");
    expect((await new LocalRepository(() => s).load()).profiles).toEqual([]);
    s.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: 99 }));
    expect((await new LocalRepository(() => s).load()).profiles).toEqual([]);
  });
  it("drops attempts for unknown profiles", () => {
    expect(withAttempt(emptyData(), attemptFor("ghost")).attempts).toEqual([]);
  });
  it("defaults the nickname to a non-identifying one and caps its length", () => {
    expect(addProfile(emptyData(), { nickname: "   ", ageBand: "little-explorer" }).profiles[0].nickname).toBe("Little Explorer");
    expect(addProfile(emptyData(), { nickname: "x".repeat(80), ageBand: "little-explorer" }).profiles[0].nickname).toHaveLength(24);
  });
  it("migrates settings safely: unknown or missing fields fall back to defaults", () => {
    const d = parseStored({ schemaVersion: 1, profiles: [], activeProfileId: null, attempts: [], settings: { audio: { volume: 7 } } });
    expect(d.settings.audio.volume).toBe(0.8);
    expect(d.settings.ai.enabled).toBe(false);
    expect(d.settings.speech.microphoneEnabled).toBe(false);
  });
  it("has privacy-protective defaults (AI and microphone off)", () => {
    const s = ParentSettingsSchema.parse({});
    expect(s.ai.enabled).toBe(false);
    expect(s.speech.microphoneEnabled).toBe(false);
    expect(s.privacy.retentionDays).toBe(730);
  });
});

describe("demo data safety", () => {
  it("never seeds sample history into a real profile", async () => {
    const store = mem();
    const repo = new LocalRepository(() => store);
    const d = await repo.createProfile({ nickname: "Real", ageBand: "little-explorer" });
    expect(d.profiles[0].isDemo).toBe(false);
    const after = await repo.seedDemoHistory(d.profiles[0].id);
    expect(after.attempts).toEqual([]);
  });
  it("seeds a demo profile with fictional history", async () => {
    const store = mem();
    const repo = new LocalRepository(() => store);
    const d = await repo.createProfile({ nickname: "Demo Explorer", ageBand: "little-explorer", isDemo: true });
    const after = await repo.seedDemoHistory(d.profiles[0].id);
    expect(after.attempts.length).toBeGreaterThan(5);
    expect(after.attempts.every((a) => a.childProfileId === d.profiles[0].id)).toBe(true);
  });
  it("resetting demo data leaves real profiles and their history untouched", () => {
    let d = addProfile(emptyData(), { nickname: "Real", ageBand: "little-explorer" });
    d = addProfile(d, { nickname: "Demo", ageBand: "little-explorer", isDemo: true });
    const [real, demo] = d.profiles;
    d = withAttempt(withAttempt(d, attemptFor(real.id)), attemptFor(demo.id));
    const out = removeDemo(d);
    expect(out.profiles.map((p) => p.id)).toEqual([real.id]);
    expect(out.attempts.every((a) => a.childProfileId === real.id)).toBe(true);
    expect(out.attempts).toHaveLength(1);
  });
});

describe("export, deletion and retention", () => {
  it("exports one child's data and never the PIN hash", async () => {
    let d = addProfile(emptyData(), { nickname: "A", ageBand: "little-explorer" });
    d = addProfile(d, { nickname: "B", ageBand: "little-explorer" });
    const [a, b] = d.profiles;
    d = withAttempt(withAttempt(d, attemptFor(a.id)), attemptFor(b.id));
    d = { ...d, settings: { ...d.settings, parentPin: await hashPin("4321") } };
    const out = buildExport(d, a.id)!;
    expect(out.format).toBe(EXPORT_FORMAT);
    expect(out.attempts).toHaveLength(1);
    expect(out.profile.id).toBe(a.id);
    const text = JSON.stringify(out);
    expect(text).not.toContain(d.settings.parentPin!.hash);
    expect(out.settings.parentPinSet).toBe(true);
    expect(buildExport(d, "missing")).toBeNull();
  });
  it("deleting a profile removes its attempts and keeps others", () => {
    let d = addProfile(emptyData(), { nickname: "A", ageBand: "little-explorer" });
    d = addProfile(d, { nickname: "B", ageBand: "little-explorer" });
    const [a, b] = d.profiles;
    d = withAttempt(withAttempt(d, attemptFor(a.id)), attemptFor(b.id));
    const out = removeProfile(d, a.id);
    expect(out.profiles.map((p) => p.id)).toEqual([b.id]);
    expect(out.attempts.every((x) => x.childProfileId === b.id)).toBe(true);
    expect(out.activeProfileId).toBe(b.id);
    expect(removeProfile(out, b.id).activeProfileId).toBeNull();
  });
  it("applies the retention window", async () => {
    const s = mem(); const repo = new LocalRepository(() => s);
    let d = await repo.createProfile({ nickname: "A", ageBand: "little-explorer" });
    const pid = d.profiles[0].id;
    await repo.recordAttempt(attemptFor(pid, new Date("2020-01-01T00:00:00Z")));
    d = await repo.recordAttempt(attemptFor(pid, new Date()));
    expect(d.attempts).toHaveLength(2);
    expect((await repo.applyRetention(new Date())).attempts).toHaveLength(1);
    expect(pruneAttempts(d, new Date(), 3650).attempts).toHaveLength(2);
  });
});

describe("parent summaries and filters", () => {
  const when = (d: string) => new Date(`${d}T10:00:00`);
  const a1 = ACTIVITIES.find((a) => a.id === "count-the-apples")!;
  const a2 = ACTIVITIES.find((a) => a.id === "find-the-odd-one-out")!;
  const attempts = [attemptFor("p", when("2026-03-01"), a1), attemptFor("p", when("2026-03-05"), a2)];
  it("filters by date, area, activity and outcome", () => {
    expect(filterAttempts(attempts, ACTIVITIES, {})).toHaveLength(2);
    expect(filterAttempts(attempts, ACTIVITIES, { from: "2026-03-04" })).toHaveLength(1);
    expect(filterAttempts(attempts, ACTIVITIES, { to: "2026-03-02" })).toHaveLength(1);
    expect(filterAttempts(attempts, ACTIVITIES, { domain: "mathematics" })[0].activityId).toBe(a1.id);
    expect(filterAttempts(attempts, ACTIVITIES, { activityId: a2.id })).toHaveLength(1);
    expect(filterAttempts(attempts, ACTIVITIES, { outcome: "shown" })).toHaveLength(0);
  });
  it("summarises the week and domains, newest first", () => {
    const s = summarise(attempts, ACTIVITIES, new Date("2026-03-06T10:00:00"));
    expect(s.attemptsThisWeek).toBe(2);
    expect(s.domains.get("mathematics")).toBe(1);
    expect(s.recent[0].activityId).toBe(a2.id);
    expect(summarise(attempts, ACTIVITIES, new Date("2026-04-30T10:00:00")).attemptsThisWeek).toBe(0);
  });
});
