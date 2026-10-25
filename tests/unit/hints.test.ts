import { describe, expect, it } from "vitest";
import { GLOW_FROM_LEVEL, MAX_HINT_LEVEL, assistanceLevel, hintDwellMs, hintText, nextHintLevel, roundOutcome, type HintLevel } from "@/lib/games/hints";
import { roundSpeech } from "@/lib/games/speech-text";
import { ACTIVITIES } from "@/content";

describe("graduated hints (a wrong answer always means listening to a hint)", () => {
  const hints = ["nudge", "stronger"];
  it("progresses nudge -> stronger -> glow, and caps; it never removes choices", () => {
    let level: HintLevel = 0;
    const texts: (string | null)[] = [];
    for (let i = 0; i < 5; i++) { level = nextHintLevel(level); texts.push(hintText(hints, level)); }
    expect(texts[0]).toBe("nudge");
    expect(texts[1]).toBe("stronger");
    expect(texts[2]).toMatch(/glowing/);
    expect(level).toBe(MAX_HINT_LEVEL);
    expect(GLOW_FROM_LEVEL).toBe(MAX_HINT_LEVEL);
  });
  it("falls back to the round's explanation, then to kind generic hints", () => {
    expect(hintText([], 1)).toMatch(/notice/i);
    expect(hintText(["only one"], 2, "Because plants need water.")).toBe("Because plants need water.");
  });
  it("classifies outcomes honestly: a glowing answer is an example, not the child's own work", () => {
    expect(roundOutcome({ wrongAttempts: 0, hintLevel: 0, answerShown: false })).toBe("independent");
    expect(roundOutcome({ wrongAttempts: 1, hintLevel: 1, answerShown: false })).toBe("supported");
    expect(roundOutcome({ wrongAttempts: 3, hintLevel: 3, answerShown: false })).toBe("shown");
    expect(roundOutcome({ openEnded: true, wrongAttempts: 0, hintLevel: 0, answerShown: false })).toBe("open-ended");
    expect(assistanceLevel(0, false)).toBe("none");
    expect(assistanceLevel(2, false)).toBe("hint");
    expect(assistanceLevel(3, false)).toBe("example");
  });
  it("holds the choices long enough to hear or read the hint", () => {
    expect(hintDwellMs("Look.")).toBeGreaterThanOrEqual(2500);
    expect(hintDwellMs("x".repeat(500))).toBeLessThanOrEqual(9000);
    expect(hintDwellMs("A longer hint that needs more time to read aloud properly")).toBeGreaterThan(hintDwellMs("Look."));
  });
});

describe("what is read aloud", () => {
  it("reads word-only choices out loud, because pre-readers cannot read them", () => {
    const a = ACTIVITIES.find((x) => x.id === "kind-words")!;
    expect(a.presentation).toBe("words");
    const text = roundSpeech(a, 0);
    expect(text).toContain("please and thank you");
    expect(text).toContain("Or:");
  });
  it("reads only the prompt for picture games", () => {
    const a = ACTIVITIES.find((x) => x.id === "count-the-apples")!;
    expect(roundSpeech(a, 0)).toBe("How many apples?");
  });
});
