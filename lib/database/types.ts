import type { AgeBand } from "@/lib/curriculum/schema";
import type { ActivityAttempt } from "@/lib/learning/types";
import type { ParentSettings } from "@/lib/parent/settings";

export type ChildProfile = {
  id: string;
  nickname: string; // non-identifying by design. Never ask for a full name.
  ageBand: AgeBand;
  isDemo: boolean; // demo data is always labelled and never mixed with real data
  createdAt: string;
};

export type AppData = {
  schemaVersion: 1;
  profiles: ChildProfile[];
  activeProfileId: string | null;
  settings: ParentSettings;
  attempts: ActivityAttempt[];
};

/**
 * Persistence contract. Today only `LocalRepository` (browser localStorage) implements it.
 * A Supabase implementation maps each method to the tables in supabase/migrations
 * (child_profiles, activity_attempts, parent_settings, ...) and is NOT implemented yet.
 */
export interface Repository {
  readonly kind: "local" | "supabase";
  load(): Promise<AppData>;
  saveSettings(settings: ParentSettings): Promise<AppData>;
  createProfile(input: { nickname: string; ageBand: AgeBand; isDemo?: boolean }): Promise<AppData>;
  updateProfile(id: string, patch: Partial<Pick<ChildProfile, "nickname" | "ageBand">>): Promise<AppData>;
  setActiveProfile(id: string | null): Promise<AppData>;
  deleteProfile(id: string): Promise<AppData>;
  recordAttempt(attempt: ActivityAttempt): Promise<AppData>;
  addNote(attemptId: string, note: string): Promise<AppData>;
  resetDemo(): Promise<AppData>;
  seedDemoHistory(profileId: string): Promise<AppData>;
  applyRetention(now: Date): Promise<AppData>;
}

export class StorageUnavailableError extends Error {
  constructor(message = "This browser is not allowing the app to save progress (private browsing or blocked storage).") {
    super(message);
    this.name = "StorageUnavailableError";
  }
}
