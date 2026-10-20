"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { MotionConfig } from "motion/react";
import { ACTIVITIES, OBJECTIVES, OFFLINE_MISSIONS } from "@/content";
import type { Activity } from "@/lib/games/schema";
import type { AgeBand } from "@/lib/curriculum/schema";
import { addProfile, emptyData, removeDemo, removeProfile, withAttempt, withNote, withProfilePatch, withSettings } from "@/lib/database/data";
import { LocalRepository } from "@/lib/database/local-repository";
import { getSupabase } from "@/lib/database/supabase-client";
import { SupabaseRepository } from "@/lib/database/supabase-repository";
import type { AppData, ChildProfile, Repository } from "@/lib/database/types";
import type { ActivityAttempt } from "@/lib/learning/types";
import type { ParentSettings } from "@/lib/parent/settings";
import { effectiveActivity, isChildVisible } from "@/lib/validation/publication";
import { recommend, type Recommendation } from "@/lib/recommendations/recommend";
import { planAdventure, type AdventurePlan } from "@/lib/recommendations/adventure";
import { Speaker } from "@/lib/speech/synthesis";
import { playChime, type Chime } from "@/lib/speech/chime";

export type CloudState = { configured: boolean; signedIn: boolean; email: string | null };
export type AuthResult = { ok: boolean; message: string };

type Ctx = {
  ready: boolean;
  cloud: CloudState;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  importLocalToCloud: () => Promise<AuthResult>;
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
  const local = useMemo(() => new LocalRepository(), []);
  const supabase = useMemo(() => getSupabase(), []);
  const [session, setSession] = useState<{ userId: string; email: string | null } | null>(null);
  const [authReady, setAuthReady] = useState(!supabase); // with no Supabase configured there is nothing to wait for
  // Signed in -> cloud storage. Signed out (or Supabase not configured) -> on-device storage.
  const repo = useMemo<Repository>(() => (session && supabase ? new SupabaseRepository(supabase, session.userId) : local), [session, supabase, local]);
  const [data, setData] = useState<AppData>(emptyData());
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const speaker = useRef<Speaker | null>(null);
  const [speechSupported, setSpeechSupported] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    supabase.auth.getSession().then(({ data: d }) => {
      if (!alive) return;
      setSession(d.session ? { userId: d.session.user.id, email: d.session.user.email ?? null } : null);
      setAuthReady(true);
    }).catch(() => { if (alive) setAuthReady(true); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => setSession(sess ? { userId: sess.user.id, email: sess.user.email ?? null } : null));
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, [supabase]);

  useEffect(() => {
    if (!authReady) return;
    let cancelled = false;
    (async () => {
      setReady(false);
      try {
        const d = await repo.applyRetention(new Date());
        if (!cancelled) setData(d);
      } catch (e) {
        if (!cancelled) { setStorageError(e instanceof Error ? e.message : "Storage is unavailable."); setData(emptyData()); }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => { cancelled = true; };
  }, [repo, authReady]);

  useEffect(() => {
    speaker.current = new Speaker();
    setSpeechSupported(speaker.current.supported);
  }, []);

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

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    if (!supabase) return { ok: false, message: "Cloud storage is not set up on this app." };
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    return error ? { ok: false, message: "That email and password did not work." } : { ok: true, message: "Signed in." };
  }, [supabase]);
  const signUp = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    if (!supabase) return { ok: false, message: "Cloud storage is not set up on this app." };
    const { data: d, error } = await supabase.auth.signUp({ email: email.trim(), password });
    if (error) return { ok: false, message: error.message.toLowerCase().includes("password") ? "Please choose a longer, stronger password." : "Could not create the account. Check the email address." };
    return d.session ? { ok: true, message: "Account created and signed in." } : { ok: true, message: "Almost there! Open the email we sent and confirm your address, then sign in." };
  }, [supabase]);
  const signOut = useCallback(async () => { await supabase?.auth.signOut(); }, [supabase]);
  const importLocalToCloud = useCallback(async (): Promise<AuthResult> => {
    if (!(repo instanceof SupabaseRepository)) return { ok: false, message: "Sign in first." };
    try {
      const res = await repo.importLocal(await local.load());
      setData(await repo.load());
      return { ok: true, message: `Copied ${res.profiles} profile(s) and ${res.attempts} activity record(s) to your cloud account. The copy on this device was left as it is.` };
    } catch { return { ok: false, message: "The copy did not finish. Please try again." }; }
  }, [repo, local]);

  const value: Ctx = {
    ready, cloud: { configured: !!supabase, signedIn: !!session, email: session?.email ?? null }, signIn, signUp, signOut, importLocalToCloud,
    storageError, data, profile, settings, attempts, allActivities, visibleActivities,
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
