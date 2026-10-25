"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/components/AppProvider";
import { Character } from "@/components/characters/Character";
import { EMPTY_SCREEN_STATE, advance, parseState, statusOf, type ScreenTimeState, type ScreenTimeStatus } from "@/lib/parent/screentime";

type Ctx = { status: ScreenTimeStatus; endBreak: () => void; resetTimer: () => void };
const ScreenCtx = createContext<Ctx | null>(null);
export const useScreenTime = () => {
  const c = useContext(ScreenCtx);
  if (!c) throw new Error("useScreenTime must be used inside ScreenTimeGuard");
  return c;
};

const key = (profileId: string) => `lww:screentime:${profileId}`;
const load = (profileId: string): ScreenTimeState => {
  try { const raw = localStorage.getItem(key(profileId)); return raw ? parseState(JSON.parse(raw)) : EMPTY_SCREEN_STATE; } catch { return EMPTY_SCREEN_STATE; }
};
const save = (profileId: string, s: ScreenTimeState) => { try { localStorage.setItem(key(profileId), JSON.stringify(s)); } catch { /* storage blocked: the limit still works while the page is open */ } };

const clock = (t: number) => new Date(t).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

/**
 * Counts active play time for the selected child and rests the app when the grown-up's limit is reached.
 * The Grown-ups area is never blocked (it has its own gate). Time only counts while a child screen is visible.
 */
export function ScreenTimeGuard({ children }: { children: React.ReactNode }) {
  const { profile, settings, stopSpeaking } = useApp();
  const profileId = profile?.id ?? null;
  const cfg = settings.session.screenTime;
  const pathname = usePathname() ?? "/";
  const inParentArea = pathname.startsWith("/parent");
  // Each child has their own counter. When the selected child changes it is (re)loaded during render,
  // so the page below is never remounted.
  const [held, setHeld] = useState<{ id: string | null; state: ScreenTimeState }>(() => ({ id: profileId, state: profileId ? load(profileId) : EMPTY_SCREEN_STATE }));
  if (held.id !== profileId) setHeld({ id: profileId, state: profileId ? load(profileId) : EMPTY_SCREEN_STATE });
  const state = held.id === profileId ? held.state : EMPTY_SCREEN_STATE;
  const setState = (fn: (cur: ScreenTimeState) => ScreenTimeState) => setHeld((h) => ({ id: h.id, state: fn(h.state) }));
  const [now, setNow] = useState(() => Date.now());
  const lastTick = useRef<number | null>(null);
  const counting = !!profileId && cfg.enabled && !inParentArea;
  const status = statusOf(state, cfg, now);

  useEffect(() => {
    if (!profileId) return;
    const id = window.setInterval(() => {
      const t = Date.now();
      const elapsed = lastTick.current === null ? 0 : (t - lastTick.current) / 1000;
      lastTick.current = t;
      setNow(t);
      if (counting && document.visibilityState === "visible") setState((cur) => advance(cur, cfg, elapsed, t));
    }, 1000);
    return () => window.clearInterval(id);
  }, [profileId, counting, cfg]);

  // Persist at most every few seconds of play, and always when a rest starts or ends.
  const saveKey = `${state.lockedUntil ?? "-"}:${Math.floor(state.usedSeconds / 5)}`;
  useEffect(() => { if (profileId) save(profileId, state); }, [profileId, saveKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const locked = status.locked && !inParentArea && !!profileId;
  useEffect(() => { if (locked) stopSpeaking(); }, [locked, stopSpeaking]);

  const value: Ctx = { status, endBreak: () => setState(() => EMPTY_SCREEN_STATE), resetTimer: () => setState(() => EMPTY_SCREEN_STATE) };
  return (
    <ScreenCtx.Provider value={value}>
      {children}
      {status.warning && !inParentArea && !locked && profile && (
        <p role="status" data-testid="time-warning" className="pointer-events-none fixed inset-x-0 bottom-4 z-40 mx-auto w-fit rounded-full bg-white px-5 py-2 text-lg font-bold shadow-clay">
          ⏳ A few minutes left, then we rest.
        </p>
      )}
      {locked && (
        <div role="dialog" aria-modal="true" aria-labelledby="rest-title" data-testid="screen-lock" className="fixed inset-0 z-50 grid place-items-center bg-[#fff8ec] p-6 text-center">
          <div className="flex max-w-md flex-col items-center gap-4">
            <Character species="owl" size={160} mood="cheer" label="Owl" />
            <h1 id="rest-title" className="text-4xl font-extrabold">Time for a rest! 😴</h1>
            <p className="text-xl font-semibold text-ink-soft">Great playing today! Little Wonder World is resting{status.lockedUntil ? ` until ${clock(status.lockedUntil)}` : ""}.</p>
            <p className="text-lg font-semibold text-ink-soft">Let&apos;s play outside, read a book or have a cuddle.</p>
            <Link href="/parent" className="tap mt-4 flex items-center text-sm font-semibold text-ink-soft underline underline-offset-4">Grown-ups</Link>
          </div>
        </div>
      )}
    </ScreenCtx.Provider>
  );
}
