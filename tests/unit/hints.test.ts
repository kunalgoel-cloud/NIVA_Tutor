import { describe, expect, it } from "vitest";
import { assistanceLevel, hintText, nextHintLevel, roundOutcome, shouldOfferHint, shouldShowAnswer, type HintLevel } from "@/lib/games/hints";

describe("graduated hints", () => {
  const hints = ["nudge", "stronger"];
  it("never reveals the answer on the first mistake", () => {
    expect(shouldShowAnswer(1, 0)).toBe(false);
    expect(shouldShowAnswer(3, 2)).toBe(false);
  });
  it("offers a hint after a mistake", () => {
    expect(shouldOfferHint(0)).toBe(false);
    expect(shouldOfferHint(1)).toBe(true);
  });
  it("progresses nudge -> stronger -> narrow down -> together, and caps", () => {
    let level: HintLevel = 0;
    const texts: (string | null)[] = [];
    for (let i = 0; i < 6; i++) { level = nextHintLevel(level); texts.push(hintText(hints, level)); }
    expect(texts[0]).toBe("nudge");
    expect(texts[1]).toBe("stronger");
    expect(texts[2]).toMatch(/easier/);
    expect(level).toBe(4);
    expect(texts[3]).toMatch(/together/);
  });
  it("falls back to kind generic hints when none are authored", () => {
    expect(hintText([], 1)).toMatch(/notice/i);
  });
  it("shows the answer (kindly) only after repeated difficulty or the last hint", () => {
    expect(shouldShowAnswer(4, 1)).toBe(true);
    expect(shouldShowAnswer(1, 4)).toBe(true);
  });
  it("classifies outcomes honestly", () => {
    expect(roundOutcome({ wrongAttempts: 0, hintLevel: 0, answerShown: false })).toBe("independent");
    expect(roundOutcome({ wrongAttempts: 1, hintLevel: 0, answerShown: false })).toBe("supported");
    expect(roundOutcome({ wrongAttempts: 0, hintLevel: 1, answerShown: false })).toBe("supported");
    expect(roundOutcome({ wrongAttempts: 2, hintLevel: 4, answerShown: true })).toBe("shown");
    expect(roundOutcome({ openEnded: true, wrongAttempts: 0, hintLevel: 0, answerShown: false })).toBe("open-ended");
    expect(assistanceLevel(0, false)).toBe("none");
    expect(assistanceLevel(2, false)).toBe("hint");
    expect(assistanceLevel(1, true)).toBe("example");
  });
});
