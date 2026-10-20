import { ACTIVITIES } from "@/content";
import { addProfile, emptyData, newId, parseStored, pruneAttempts, removeDemo, removeProfile, withAttempt, withNote, withProfilePatch, withSettings } from "./data";
import { buildDemoAttempts } from "./demo";
import { StorageUnavailableError, type AppData, type Repository } from "./types";

export const STORAGE_KEY = "lww:v1";
export type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

/**
 * Browser-only persistence. LIMITATIONS (also in docs/privacy.md): data lives in this one browser on this
 * one device, is not backed up or synchronised, and is lost if site data is cleared.
 */
export class LocalRepository implements Repository {
  readonly kind = "local" as const;
  constructor(private readonly storage: () => StorageLike = () => window.localStorage) {}

  private read(): AppData {
    let raw: string | null;
    try { raw = this.storage().getItem(STORAGE_KEY); } catch { throw new StorageUnavailableError(); }
    if (!raw) return emptyData();
    try { return parseStored(JSON.parse(raw)); } catch { return emptyData(); } // corrupt data is never allowed to crash the app
  }
  private write(d: AppData): AppData {
    try { this.storage().setItem(STORAGE_KEY, JSON.stringify(d)); } catch { throw new StorageUnavailableError(); }
    return d;
  }
  private mutate(fn: (d: AppData) => AppData): Promise<AppData> {
    try { return Promise.resolve(this.write(fn(this.read()))); } catch (e) { return Promise.reject(e); }
  }

  load() { try { return Promise.resolve(this.read()); } catch (e) { return Promise.reject(e); } }
  saveSettings(s: AppData["settings"]) { return this.mutate((d) => withSettings(d, s)); }
  createProfile(input: Parameters<Repository["createProfile"]>[0]) { return this.mutate((d) => addProfile(d, input)); }
  updateProfile(id: string, patch: Parameters<Repository["updateProfile"]>[1]) { return this.mutate((d) => withProfilePatch(d, id, patch)); }
  setActiveProfile(id: string | null) { return this.mutate((d) => ({ ...d, activeProfileId: id })); }
  deleteProfile(id: string) { return this.mutate((d) => removeProfile(d, id)); }
  recordAttempt(a: Parameters<Repository["recordAttempt"]>[0]) { return this.mutate((d) => withAttempt(d, { ...a, id: a.id || newId("att") })); }
  addNote(attemptId: string, note: string) { return this.mutate((d) => withNote(d, attemptId, note)); }
  resetDemo() { return this.mutate(removeDemo); }
  seedDemoHistory(profileId: string) {
    return this.mutate((d) => {
      const p = d.profiles.find((x) => x.id === profileId);
      if (!p || !p.isDemo) return d; // never writes sample data into a real profile
      const keep = d.attempts.filter((a) => a.childProfileId !== profileId);
      return { ...d, attempts: [...keep, ...buildDemoAttempts(profileId, ACTIVITIES, new Date())] };
    });
  }
  applyRetention(now: Date) { return this.mutate((d) => pruneAttempts(d, now, d.settings.privacy.retentionDays)); }
}
