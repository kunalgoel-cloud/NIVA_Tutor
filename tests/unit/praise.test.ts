import { describe, expect, it } from "vitest";
import { COMPLETE, CORRECT, STEP, TRY_AGAIN, pickVaried, praiseCategory, type PraiseCategory } from "@/lib/games/praise";
import { ACTIVITIES } from "@/content";

const cats = Object.keys(CORRECT) as PraiseCategory[];

describe("varied praise", () => {
  it("has plenty of different phrases for every kind of game", () => {
    for (const c of cats) {
      expect(new Set(CORRECT[c]).size, c).toBeGreaterThanOrEqual(6);
      expect(new Set(COMPLETE[c]).size, c).toBeGreaterThanOrEqual(4);
    }
    expect(new Set(STEP).size).toBeGreaterThanOrEqual(6);
    expect(new Set(TRY_AGAIN).size).toBeGreaterThanOrEqual(6);
  });
  it("never says the same thing twice in a row, whatever the random numbers are", () => {
    let seed = 7;
    const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    let prev = "";
    for (let i = 0; i < 500; i++) { const p = pickVaried(CORRECT.choose, "t", rand); expect(p).not.toBe(prev); prev = p; }
    const stuck = () => 0; // a worst-case random source that always picks the first phrase
    let p2 = "";
    for (let i = 0; i < 20; i++) { const p = pickVaried(CORRECT.count, "t2", stuck); expect(p).not.toBe(p2); p2 = p; }
  });
  it("uses a different set of phrases for different kinds of games", () => {
    const count = praiseCategory(ACTIVITIES.find((a) => a.id === "count-the-apples")!);
    const kind = praiseCategory(ACTIVITIES.find((a) => a.id === "kind-words")!);
    const match = praiseCategory(ACTIVITIES.find((a) => a.id === "match-the-pairs")!);
    expect(new Set([count, kind, match]).size).toBe(3);
  });
  it("never uses the old filler that did not fit counting or kindness", () => {
    for (const c of cats) for (const p of [...CORRECT[c], ...COMPLETE[c]]) expect(p).not.toMatch(/onto something|noticed something interesting/i);
    for (const p of TRY_AGAIN) expect(p).not.toMatch(/wrong|bad|fail/i);
  });
});
