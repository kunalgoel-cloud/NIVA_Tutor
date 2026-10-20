"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { MotionConfig } from "motion/react";
import { ACTIVITIES, OBJECTIVES, OFFLINE_MISSIONS } from "@/content";
import type { Activity } from "@/lib/games/schema";
import type { AgeBand } from "@/lib/curriculum/schema";
import { addProfile, emptyData, removeDemo, removeProfile, withAttempt, withNote, withProfilePatch, withSettings } from "@/lib/database/data";
import { LocalRepository } from "@/lib/database/local-repository";
import type { AppData, ChildProfile } from "@/lib/database/types";
import type { ActivityAttempt } from "@/lib/learning/types";
import type { ParentSettings } from "@/lib/parent/settings";
import { effectiveActivity, isChildVisible } from "@/lib/validation/publication";
import { recommend, type Recommendation } from "@/lib/recommendations/recommend";
import { planAdventure, type AdventurePlan } from "@/lib/recommendations/adventure";
import { Speaker } from "@/lib/speech/synthesis";
import { playChime, type Chime } from "@/lib/speech/chime";

type Ctx = {
  ready: boolean;
  storageError: string | null;
  data: AppData;
  profile: ChildProfile | null;
  settings: ParentSettings;
  attempts: ActivityAttempt[]; // active profile only
  allActivities: Activity[]; // with parent publication overrides applied
  visibleActivities: Activity[]; // what a child may see
  createProfile: (nickname: string, ageBand: AgeBand, isDemo?: boolean) => Promise<void>;
  updateProfile: (id: string, patch: Partial<Pick<ChildProfile, "nickname" | "ageBand">>) => Promise<void>;
  setActiveProfile: (id: string) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  recordAttempt: (a: ActivityAttempt) => Promise<void>;
  addNote: (attemptId: string, note: string) => Promise<void>;
  saveSettings: (s: ParentSettings) => Promise<void>;
  resetDemo: () => Promise<void>;
  seedDemoHistory: (profileId: string) => Promise<void>;
  recommendations: (domains?: Activity["domain"][]) => Recommendation[];
  adventure: () => AdventurePlan;
  say: (text: string) => Promise<void>;
  stopSpeaking: () => void;
  chime: (kind: Chime) => void;
  speechSupported: boolean;
};

const AppCtx = createContext<Ctx | null>(null);
export const useApp = () => {
  const c = useContext(AppCtx);
  if (!c) throw new Error("useApp must be used inside AppProvider");
  return c;
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const repo = useMemo(() => new LocalRepository(), []);
  const [data, setData] = useState<AppData>(emptyData());
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const speaker = useRef<Speaker | null>(null);
  const [speechSupported, setSpeechSupported] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const d = await repo.applyRetention(new Date());
        if (!cancelled) setData(d);
      } catch (e) {
        if (!cancelled) { setStorageError(e instanceof Error ? e.message : "Storage is unavailable."); setData(emptyData()); }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    speaker.current = new Speaker();
    setSpeechSupported(speaker.current.supported);
    return () => { cancelled = true; };
  }, [repo]);

  /** Runs a repo operation. If storage fails, the change still applies in memory so play continues. */
  const run = useCallback(async (op: () => Promise<AppData>, fallback: (d: AppData) => AppData) => {
    try { setData(await op()); setStorageError(null); }
    catch (e) {
      setData((d) => fallback(d));
      setStorageError(e instanceof Error ? e.message : "Could not save.");
    }
  }, []);

  const settings = data.settings;
  const profile = data.profiles.find((p) => p.id === data.activeProfileId) ?? null;
  const attempts = useMemo(() => data.attempts.filter((a) => a.childProfileId === profile?.id), [data.attempts, profile?.id]);
  const allActivities = useMemo(() => ACTIVITIES.map((a) => effectiveActivity(a, settings.statusOverrides)), [settings.statusOverrides]);
  const visibleActivities = useMemo(() => allActivities.filter(isChildVisible), [allActivities]);

  const recommendations = useCallback((domains?: Activity["domain"][]) =>
    recommend({ activities: visibleActivities, objectives: OBJECTIVES, attempts, ageBand: profile?.ageBand ?? "little-explorer", now: new Date(), interests: settings.interests, domains }),
  [visibleActivities, attempts, profile?.ageBand, settings.interests]);
  const adventure = useCallback(() =>
    planAdventure({ activities: visibleActivities, objectives: OBJECTIVES, attempts, ageBand: profile?.ageBand ?? "little-explorer", now: new Date(), interests: settings.interests }, OFFLINE_MISSIONS, settings.session.adventureLength),
  [visibleActivities, attempts, profile?.ageBand, settings.interests, settings.session.adventureLength]);

  const say = useCallback((text: string) => {
    if (!settings.audio.speakInstructions) return Promise.resolve();
    return speaker.current?.speak(text, { volume: settings.audio.volume, muted: settings.audio.muted }) ?? Promise.resolve();
  }, [settings.audio]);
  const stopSpeaking = useCallback(() => speaker.current?.cancel(), []);
  const chime = useCallback((kind: Chime) => {
    if (settings.audio.muted || !settings.audio.soundEffects) return;
    playChime(kind, settings.audio.volume);
  }, [settings.audio]);

  const value: Ctx = {
    ready, storageError, data, profile, settings, attempts, allActivities, visibleActivities,
    createProfile: (nickname, ageBand, isDemo) => run(() => repo.createProfile({ nickname, ageBand, isDemo }), (d) => addProfile(d, { nickname, ageBand, isDemo })),
    updateProfile: (id, patch) => run(() => repo.updateProfile(id, patch), (d) => withProfilePatch(d, id, patch)),
    setActiveProfile: (id) => run(() => repo.setActiveProfile(id), (d) => ({ ...d, activeProfileId: id })),
    deleteProfile: (id) => run(() => repo.deleteProfile(id), (d) => removeProfile(d, id)),
    recordAttempt: (a) => run(() => repo.recordAttempt(a), (d) => withAttempt(d, a)),
    addNote: (id, note) => run(() => repo.addNote(id, note), (d) => withNote(d, id, note)),
    saveSettings: (s) => run(() => repo.saveSettings(s), (d) => withSettings(d, s)),
    resetDemo: () => run(() => repo.resetDemo(), removeDemo),
    seedDemoHistory: (pid) => run(() => repo.seedDemoHistory(pid), (d) => d),
    recommendations, adventure, say, stopSpeaking, chime, speechSupported,
  };

  return (
    <AppCtx.Provider value={value}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </AppCtx.Provider>
  );
}
