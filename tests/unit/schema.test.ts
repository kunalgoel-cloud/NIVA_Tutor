import { describe, expect, it } from "vitest";
import { ACTIVITIES, RAW_ACTIVITIES } from "@/content";
import { ActivitySchema, ENGINE_TYPES, PLANNED_ENGINES } from "@/lib/games/schema";
import { T, CNT, GIVE, PAIRS, PAT, ORD, LR, activity } from "@/content/builders";

const base = () => activity({ id: "x", title: "X", description: "d", world: "puzzle-planet", domain: "logic-puzzles", obj: ["LOG-ODD-01"], instructions: "i" }, "tap-choose", [T("r1", "p", ["🍎|a", "🍌|b"], [0])]);

describe("activity schema validation", () => {
  it("every authored activity parses", () => {
    expect(ACTIVITIES).toHaveLength(RAW_ACTIVITIES.length);
  });
  it("library has 50+ activities across all five worlds and eight domains", () => {
    expect(ACTIVITIES.length).toBeGreaterThanOrEqual(50);
    expect(new Set(ACTIVITIES.map((a) => a.world)).size).toBe(5);
    expect(new Set(ACTIVITIES.map((a) => a.domain)).size).toBe(8);
  });
  it("uses all five engines and none of the planned ones", () => {
    const used = new Set(ACTIVITIES.map((a) => a.engine));
    for (const e of ENGINE_TYPES) expect(used.has(e)).toBe(true);
    for (const e of PLANNED_ENGINES) expect(used.has(e as never)).toBe(false);
  });
  it("rejects an unknown engine", () => {
    expect(ActivitySchema.safeParse({ ...base(), engine: "arrange-story" }).success).toBe(false);
  });
  it("rejects a closed tap round with no correct answer", () => {
    expect(ActivitySchema.safeParse({ ...base(), rounds: [T("r1", "p", ["🍎|a", "🍌|b"], [])] }).success).toBe(false);
  });
  it("rejects a correct id that is not an option", () => {
    const bad = { ...T("r1", "p", ["🍎|a", "🍌|b"], [0]), correctIds: ["zzz"] };
    expect(ActivitySchema.safeParse({ ...base(), rounds: [bad] }).success).toBe(false);
  });
  it("accepts an open-ended round without correctIds", () => {
    const open = T("r1", "p", ["🍎|a", "🍌|b"], [], { open: true });
    expect(ActivitySchema.safeParse({ ...base(), rounds: [open] }).success).toBe(true);
  });
  it("requires count rounds to offer the true total", () => {
    const bad = activity({ id: "c", title: "C", description: "d", world: "number-kingdom", domain: "mathematics", obj: ["MATH-CNT-01"], instructions: "i" }, "count-collect", [CNT("r1", "p", "🍎", 3, [1, 2])]);
    expect(ActivitySchema.safeParse(bad).success).toBe(false);
  });
  it("rejects a collect target above the total", () => {
    const bad = activity({ id: "c", title: "C", description: "d", world: "number-kingdom", domain: "mathematics", obj: ["MATH-CNT-01"], instructions: "i" }, "count-collect", [GIVE("r1", "p", "🍎", 3, 5, "🦖|dino")]);
    expect(ActivitySchema.safeParse(bad).success).toBe(false);
  });
  it("rejects a pattern with no blank and an order task with one step", () => {
    const m = { id: "p", title: "P", description: "d", world: "puzzle-planet", domain: "logic-puzzles", obj: ["LOG-PAT-01"], instructions: "i" } as { id: string; title: string; description: string; world: "puzzle-planet"; domain: "logic-puzzles"; obj: string[]; instructions: string };
    expect(ActivitySchema.safeParse(activity(m, "complete-pattern", [PAT("r1", "p", ["🔴", "🔵"], ["🔴", "🔵"], 0)])).success).toBe(false);
    expect(ActivitySchema.safeParse(activity(m, "complete-pattern", [ORD("r1", "p", ["🔴|a"])])).success).toBe(false);
  });
  it("rejects a pairs round with fewer than two pairs", () => {
    const bad = activity({ id: "m", title: "M", description: "d", world: "puzzle-planet", domain: "logic-puzzles", obj: ["LOG-MTC-01"], instructions: "i" }, "match-pair", [PAIRS("r1", "p", [["🐟|a", "🌊|b"]])]);
    expect(ActivitySchema.safeParse(bad).success).toBe(false);
  });
  it("requires tap alternatives on speech rounds", () => {
    const bad = activity({ id: "l", title: "L", description: "d", world: "conversation-cafe", domain: "conversation", obj: ["CONV-RSP-01"], instructions: "i" }, "listen-respond", [LR("r1", "hi", { quick: [["🙂", "hi"]] })]);
    expect(ActivitySchema.safeParse(bad).success).toBe(false); // needs 2+ quick replies
  });
  it("treats script-looking strings as plain text (nothing is executed)", () => {
    const evil = activity({ id: "e", title: "eval('1+1')", description: "<script>alert(1)</script>", world: "puzzle-planet", domain: "logic-puzzles", obj: ["LOG-ODD-01"], instructions: "i" }, "tap-choose", [T("r1", "constructor.constructor('return 1')()", ["🍎|a", "🍌|b"], [0])]);
    const r = ActivitySchema.safeParse(evil);
    expect(r.success).toBe(true);
    if (r.success) expect(typeof r.data.title).toBe("string");
  });
  it("keeps worlds and domains as separate concepts", () => {
    const wonderLogic = ACTIVITIES.find((a) => a.world === "wonder-world" && a.domain === "logic-puzzles");
    expect(wonderLogic).toBeDefined();
  });
});
