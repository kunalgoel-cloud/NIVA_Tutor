// Graduated hints: never reveal the answer straight after the first mistake.
//   level 0  nothing
//   level 1  gentle nudge (hints[0])
//   level 2  stronger clue (hints[1])
//   level 3  narrow it down (engine removes or highlights something)
//   level 4  "let's try together": the answer is shown (counts as an example)
export type HintLevel = 0 | 1 | 2 | 3 | 4;
export const MAX_HINT_LEVEL: HintLevel = 4;
export const WRONG_ATTEMPTS_BEFORE_OFFER = 1;
export const WRONG_ATTEMPTS_BEFORE_SHOWING = 3;

const GENERIC = [
  "Take a good look. What do you notice?",
  "Let's look at it another way. Try one thing at a time.",
];

export function nextHintLevel(level: HintLevel): HintLevel {
  return Math.min(MAX_HINT_LEVEL, level + 1) as HintLevel;
}

export function hintText(hints: string[], level: HintLevel): string | null {
  if (level === 0) return null;
  if (level === 1) return hints[0] ?? GENERIC[0];
  if (level === 2) return hints[1] ?? hints[0] ?? GENERIC[1];
  if (level === 3) return "Let's make it a little easier.";
  return "Let's do this one together.";
}

export function shouldOfferHint(wrongAttempts: number): boolean {
  return wrongAttempts >= WRONG_ATTEMPTS_BEFORE_OFFER;
}

/** After this many wrong tries the engine shows the answer kindly and moves on. */
export function shouldShowAnswer(wrongAttempts: number, level: HintLevel): boolean {
  return level >= MAX_HINT_LEVEL || wrongAttempts >= WRONG_ATTEMPTS_BEFORE_SHOWING + 1;
}

export type RoundOutcome = "independent" | "supported" | "shown" | "open-ended";
export type Assistance = "none" | "hint" | "example";

export function assistanceLevel(hintLevel: HintLevel, answerShown: boolean): Assistance {
  if (answerShown || hintLevel >= 4) return "example";
  return hintLevel > 0 ? "hint" : "none";
}

export function roundOutcome(args: { openEnded?: boolean; wrongAttempts: number; hintLevel: HintLevel; answerShown: boolean }): RoundOutcome {
  if (args.openEnded) return "open-ended";
  if (args.answerShown) return "shown";
  return args.wrongAttempts === 0 && args.hintLevel === 0 ? "independent" : "supported";
}
