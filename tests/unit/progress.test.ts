import { describe, expect, it } from "vitest";
import { categorise, nextReviewDate, progressFor } from "@/lib/learning/progress";
import { obs } from "../helpers";

describe("progress categorisation", () => {
  it("starts as not introduced", () => {
    expect(categorise([])).toBe("not-introduced");
  });
  it("one correct answer is never mastery", () => {
    expect(categorise([obs({ outcome: "independent" })])).toBe("introduced");
  });
  it("needs several observations before 'practising'", () => {
    expect(categorise([obs({ outcome: "shown" }), obs({ outcome: "shown" })])).toBe("introduced");
    expect(categorise([obs({ outcome: "shown" }), obs({ outcome: "shown" }), obs({ outcome: "shown" })])).toBe("practising");
  });
  it("repeated success WITH support becomes 'demonstrated with support'", () => {
    expect(categorise([obs({ outcome: "supported", hintsUsed: 1 }), obs({ outcome: "supported", hintsUsed: 1 })])).toBe("supported");
  });
  it("independent needs successes across different questions AND different activities", () => {
    const sameActivity = [1, 2, 3, 4].map(() => obs({ outcome: "independent", activityId: "a1" }));
    expect(categorise(sameActivity)).not.toBe("independent");
    const mixed = [obs({ activityId: "a1", outcome: "independent" }), obs({ activityId: "a2", outcome: "independent" }), obs({ activityId: "a1", outcome: "independent" }), obs({ activityId: "a2", outcome: "independent" })];
    expect(categorise(mixed)).toBe("independent");
  });
  it("a memorised question repeated many times counts once", () => {
    const repeated = Array.from({ length: 8 }, (_, i) => obs({ activityId: "a1", roundId: "same", outcome: "independent", day: i }));
    expect(["introduced", "practising", "supported"]).toContain(categorise(repeated));
  });
  it("lucky guesses between two options are discounted", () => {
    const guessy = [obs({ activityId: "a1", outcome: "independent", optionCount: 2 }), obs({ activityId: "a2", outcome: "independent", optionCount: 2 }), obs({ activityId: "a3", outcome: "independent", optionCount: 2 })];
    expect(categorise(guessy)).not.toBe("independent"); // 3 x 0.5 weight = 1.5 < 3
  });
  it("answers that were shown never count as success", () => {
    const shown = Array.from({ length: 5 }, (_, i) => obs({ activityId: `a${i}`, outcome: "shown" }));
    expect(["introduced", "practising"]).toContain(categorise(shown));
  });
  it("'ready for challenge' needs sustained independent success on separate days", () => {
    const oneDay = Array.from({ length: 6 }, (_, i) => obs({ activityId: `a${i % 3}`, outcome: "independent", day: 0 }));
    expect(categorise(oneDay)).toBe("independent");
    const spaced = Array.from({ length: 6 }, (_, i) => obs({ activityId: `a${i % 3}`, outcome: "independent", day: i % 2 }));
    expect(categorise(spaced)).toBe("ready-for-challenge");
  });
  it("recent struggles pull a strong category back", () => {
    const strong = Array.from({ length: 6 }, (_, i) => obs({ activityId: `a${i % 3}`, outcome: "independent", day: i % 2 }));
    const slipped = [...strong, obs({ activityId: "a9", outcome: "shown", day: 3 }), obs({ activityId: "a8", outcome: "shown", day: 3 }), obs({ activityId: "a7", outcome: "shown", day: 3 })];
    expect(categorise(slipped)).not.toBe("ready-for-challenge");
  });
  it("open-ended activity records exposure but never claims mastery", () => {
    const many = Array.from({ length: 10 }, (_, i) => obs({ activityId: `c${i}`, outcome: "open-ended", optionCount: 0 }));
    expect(categorise(many)).toBe("practising");
    expect(categorise(many.slice(0, 1))).toBe("introduced");
  });
  it("computes counts, last practised date and a spaced review date", () => {
    const o = [obs({ outcome: "independent", day: 0 }), obs({ outcome: "supported", day: 2 })];
    const p = progressFor("MATH-CNT-01", o);
    expect(p.independentSuccesses).toBe(1);
    expect(p.supportedSuccesses).toBe(1);
    expect(p.lastPractisedAt!.startsWith("2026-01-03")).toBe(true);
    expect(p.nextReviewAt).toBe(nextReviewDate(p.category, p.lastPractisedAt));
  });
  it("ignores observations for other objectives", () => {
    expect(progressFor("MATH-CNT-01", [obs({ objectiveId: "LOG-ODD-01", outcome: "independent" })]).category).toBe("not-introduced");
  });
});
