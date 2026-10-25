import { describe, expect, it } from "vitest";
import { EMPTY_SCREEN_STATE, MAX_TICK_SECONDS, WARNING_SECONDS, advance, parseState, statusOf, type ScreenTimeConfig } from "@/lib/parent/screentime";
import { ParentSettingsSchema } from "@/lib/parent/settings";

const cfg: ScreenTimeConfig = { enabled: true, playMinutes: 10, lockHours: 2 };
const T0 = Date.parse("2026-02-01T10:00:00Z");
const play = (state = EMPTY_SCREEN_STATE, seconds: number, start = T0, c = cfg) => {
  let s = state;
  for (let i = 1; i <= seconds; i++) s = advance(s, c, 1, start + i * 1000);
  return s;
};

describe("screen-time limit", () => {
  it("is off by default and never counts or locks when off", () => {
    expect(ParentSettingsSchema.parse({}).session.screenTime).toEqual({ enabled: false, playMinutes: 20, lockHours: 2 });
    const off = { ...cfg, enabled: false };
    expect(play(EMPTY_SCREEN_STATE, 9999, T0, off)).toEqual(EMPTY_SCREEN_STATE);
    expect(statusOf({ usedSeconds: 0, lockedUntil: T0 + 1e9 }, off, T0).locked).toBe(false);
  });
  it("counts play time and warns when a couple of minutes are left", () => {
    const s = play(EMPTY_SCREEN_STATE, 8 * 60 + 30);
    const st = statusOf(s, cfg, T0 + 510_000);
    expect(st.locked).toBe(false);
    expect(st.remainingSeconds).toBe(90);
    expect(st.warning).toBe(true);
    expect(statusOf(play(EMPTY_SCREEN_STATE, 60), cfg, T0 + 60_000).warning).toBe(false);
    expect(WARNING_SECONDS).toBe(120);
  });
  it("rests the app for the chosen hours once the play time is used up", () => {
    const s = play(EMPTY_SCREEN_STATE, 10 * 60);
    const now = T0 + 600_000;
    const st = statusOf(s, cfg, now);
    expect(st.locked).toBe(true);
    expect(st.lockedUntil).toBe(now + 2 * 3_600_000);
    expect(st.remainingSeconds).toBe(0);
  });
  it("does not count time while resting, and starts a fresh round when the rest ends", () => {
    const locked = play(EMPTY_SCREEN_STATE, 600);
    const during = advance(locked, cfg, 5, T0 + 600_000 + 60_000);
    expect(during).toBe(locked);
    const after = T0 + 600_000 + 2 * 3_600_000 + 1000;
    expect(statusOf(locked, cfg, after).locked).toBe(false);
    expect(statusOf(locked, cfg, after).usedSeconds).toBe(0);
    const next = advance(locked, cfg, 1, after);
    expect(next).toEqual({ usedSeconds: 1, lockedUntil: null });
  });
  it("caps one tick, so a sleeping tab or clock jump cannot use up the allowance", () => {
    const s = advance(EMPTY_SCREEN_STATE, cfg, 3600, T0);
    expect(s.usedSeconds).toBe(MAX_TICK_SECONDS);
    expect(s.lockedUntil).toBeNull();
  });
  it("lowering the limit below what was already played rests the app on the next tick", () => {
    const s = play(EMPTY_SCREEN_STATE, 8 * 60);
    const lower = { ...cfg, playMinutes: 5 };
    expect(advance(s, lower, 1, T0 + 481_000).lockedUntil).not.toBeNull();
  });
  it("reads saved state defensively", () => {
    expect(parseState(null)).toEqual(EMPTY_SCREEN_STATE);
    expect(parseState({ usedSeconds: "x", lockedUntil: "y" })).toEqual(EMPTY_SCREEN_STATE);
    expect(parseState({ usedSeconds: -4, lockedUntil: NaN })).toEqual(EMPTY_SCREEN_STATE);
    expect(parseState({ usedSeconds: 30, lockedUntil: 123 })).toEqual({ usedSeconds: 30, lockedUntil: 123 });
  });
});
