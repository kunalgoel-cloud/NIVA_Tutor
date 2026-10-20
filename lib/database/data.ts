// Pure reducers over AppData. Used by the repository and directly unit-tested.
import { defaultSettings, ParentSettingsSchema, type ParentSettings } from "@/lib/parent/settings";
import type { AgeBand } from "@/lib/curriculum/schema";
import type { ActivityAttempt } from "@/lib/learning/types";
import type { AppData, ChildProfile } from "./types";

export const emptyData = (): AppData => ({ schemaVersion: 1, profiles: [], activeProfileId: null, settings: defaultSettings(), attempts: [] });

export function parseStored(raw: unknown): AppData {
  if (!raw || typeof raw !== "object") return emptyData();
  const r = raw as Partial<AppData>;
  if (r.schemaVersion !== 1) return emptyData();
  const settings = ParentSettingsSchema.safeParse(r.settings);
  return {
    schemaVersion: 1,
    profiles: Array.isArray(r.profiles) ? r.profiles : [],
    activeProfileId: typeof r.activeProfileId === "string" ? r.activeProfileId : null,
    settings: settings.success ? settings.data : defaultSettings(),
    attempts: Array.isArray(r.attempts) ? r.attempts : [],
  };
}

let counter = 0;
export const newId = (prefix: string) => `${prefix}_${Date.now().toString(36)}${(counter++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export function addProfile(d: AppData, input: { nickname: string; ageBand: AgeBand; isDemo?: boolean }, now = new Date()): AppData {
  const nickname = input.nickname.trim().slice(0, 24) || (input.isDemo ? "Demo Explorer" : "Little Explorer");
  const profile: ChildProfile = { id: newId("child"), nickname, ageBand: input.ageBand, isDemo: !!input.isDemo, createdAt: now.toISOString() };
  return { ...d, profiles: [...d.profiles, profile], activeProfileId: d.activeProfileId ?? profile.id };
}

export function removeProfile(d: AppData, id: string): AppData {
  const profiles = d.profiles.filter((p) => p.id !== id);
  return { ...d, profiles, attempts: d.attempts.filter((a) => a.childProfileId !== id), activeProfileId: d.activeProfileId === id ? profiles[0]?.id ?? null : d.activeProfileId };
}

export function removeDemo(d: AppData): AppData {
  const demoIds = new Set(d.profiles.filter((p) => p.isDemo).map((p) => p.id));
  return {
    ...d,
    profiles: d.profiles.filter((p) => !p.isDemo),
    attempts: d.attempts.filter((a) => !demoIds.has(a.childProfileId)),
    activeProfileId: d.activeProfileId && demoIds.has(d.activeProfileId) ? d.profiles.find((p) => !p.isDemo)?.id ?? null : d.activeProfileId,
  };
}

export const withAttempt = (d: AppData, a: ActivityAttempt): AppData =>
  d.profiles.some((p) => p.id === a.childProfileId) ? { ...d, attempts: [...d.attempts, a] } : d;

export const withNote = (d: AppData, attemptId: string, note: string): AppData => ({
  ...d, attempts: d.attempts.map((a) => (a.id === attemptId ? { ...a, parentNote: note.trim().slice(0, 300) || undefined } : a)),
});

export const withSettings = (d: AppData, s: ParentSettings): AppData => ({ ...d, settings: s });

/** Data minimisation: drop attempts older than the retention window. */
export function pruneAttempts(d: AppData, now: Date, days: number): AppData {
  const cutoff = now.getTime() - days * 86_400_000;
  return { ...d, attempts: d.attempts.filter((a) => new Date(a.occurredAt).getTime() >= cutoff) };
}

export const withProfilePatch = (d: AppData, id: string, patch: Partial<Pick<ChildProfile, "nickname" | "ageBand">>): AppData => ({
  ...d,
  profiles: d.profiles.map((p) => (p.id === id ? { ...p, ...(patch.nickname !== undefined ? { nickname: patch.nickname.trim().slice(0, 24) || p.nickname } : {}), ...(patch.ageBand ? { ageBand: patch.ageBand } : {}) } : p)),
});
