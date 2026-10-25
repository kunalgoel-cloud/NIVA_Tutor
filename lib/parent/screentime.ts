// Screen-time limit: after `playMinutes` of play the app rests for `lockHours`. Pure functions, so the
// rules are easy to test. This is a gentle family boundary on this device, not a security feature.
export type ScreenTimeConfig = { enabled: boolean; playMinutes: number; lockHours: number };
export type ScreenTimeState = { usedSeconds: number; lockedUntil: number | null };

export const EMPTY_SCREEN_STATE: ScreenTimeState = { usedSeconds: 0, lockedUntil: null };
export const WARNING_SECONDS = 120;
/** A tick never adds more than this, so a sleeping tab or a changed clock cannot burn through the allowance. */
export const MAX_TICK_SECONDS = 10;

export type ScreenTimeStatus = {
  enabled: boolean;
  locked: boolean;
  lockedUntil: number | null;
  usedSeconds: number;
  remainingSeconds: number; // play time left in this round (0 while locked)
  warning: boolean; // a few minutes left: time to wrap up gently
};

export function statusOf(state: ScreenTimeState, cfg: ScreenTimeConfig, now: number): ScreenTimeStatus {
  const limit = cfg.playMinutes * 60;
  if (!cfg.enabled) return { enabled: false, locked: false, lockedUntil: null, usedSeconds: state.usedSeconds, remainingSeconds: limit, warning: false };
  const locked = state.lockedUntil !== null && now < state.lockedUntil;
  const used = locked ? limit : state.lockedUntil !== null ? 0 : state.usedSeconds; // a finished lock starts a fresh round
  const remaining = locked ? 0 : Math.max(0, limit - used);
  return { enabled: true, locked, lockedUntil: locked ? state.lockedUntil : null, usedSeconds: used, remainingSeconds: remaining, warning: !locked && remaining > 0 && remaining <= WARNING_SECONDS };
}

/** Adds `elapsedSeconds` of play. Starts the rest period when the allowance is used up. */
export function advance(state: ScreenTimeState, cfg: ScreenTimeConfig, elapsedSeconds: number, now: number): ScreenTimeState {
  if (!cfg.enabled) return state;
  let s = state;
  if (s.lockedUntil !== null) {
    if (now < s.lockedUntil) return s; // resting: play time does not count
    s = { usedSeconds: 0, lockedUntil: null }; // the rest is over: fresh round
  }
  const used = s.usedSeconds + Math.min(Math.max(0, elapsedSeconds), MAX_TICK_SECONDS);
  if (used >= cfg.playMinutes * 60) return { usedSeconds: 0, lockedUntil: now + cfg.lockHours * 3_600_000 };
  return { usedSeconds: used, lockedUntil: null };
}

export const parseState = (raw: unknown): ScreenTimeState => {
  const o = (raw ?? {}) as Partial<ScreenTimeState>;
  const used = typeof o.usedSeconds === "number" && Number.isFinite(o.usedSeconds) && o.usedSeconds >= 0 ? o.usedSeconds : 0;
  const until = typeof o.lockedUntil === "number" && Number.isFinite(o.lockedUntil) ? o.lockedUntil : null;
  return { usedSeconds: used, lockedUntil: until };
};
