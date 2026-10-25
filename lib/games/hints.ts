// Graduated hints. A wrong answer ALWAYS leads to a hint the child has to listen to; the choices then open again.
//   level 0  nothing
//   level 1  gentle nudge (hints[0])
//   level 2  stronger clue (hints[1])
//   level 3  "let's find it together": the right choice glows. The child still has to pick it to move on.
// No level ever removes choices or moves the child on without the right answer.
export type HintLevel = 0 | 1 | 2 | 3;
export const MAX_HINT_LEVEL: HintLevel = 3;
export const GLOW_FROM_LEVEL: HintLevel = 3;

const GENERIC = [
  "Take a good look. What do you notice?",
  "Let's look at it another way. Try one thing at a time.",
];

export function nextHintLevel(level: HintLevel): HintLevel {
  return Math.min(MAX_HINT_LEVEL, level + 1) as HintLevel;
}

export function hintText(hints: string[], level: HintLevel, explain?: string): string | null {
  if (level === 0) return null;
  if (level === 1) return hints[0] ?? GENERIC[0];
  if (level === 2) return hints[1] ?? explain ?? hints[0] ?? GENERIC[1];
  return "Look for the one that is glowing. Tap it.";
}

export type RoundOutcome = "independent" | "supported" | "shown" | "open-ended";
export type Assistance = "none" | "hint" | "example";

/** The glow gives the answer away, so a round finished with it counts as an example, not as the child's own work. */
export function assistanceLevel(hintLevel: HintLevel, answerShown: boolean): Assistance {
  if (answerShown || hintLevel >= GLOW_FROM_LEVEL) return "example";
  return hintLevel > 0 ? "hint" : "none";
}

export function roundOutcome(args: { openEnded?: boolean; wrongAttempts: number; hintLevel: HintLevel; answerShown: boolean }): RoundOutcome {
  if (args.openEnded) return "open-ended";
  if (args.answerShown || args.hintLevel >= GLOW_FROM_LEVEL) return "shown";
  return args.wrongAttempts === 0 && args.hintLevel === 0 ? "independent" : "supported";
}

/** Words to read when a hint is spoken: long hints take longer, and a muted device still pauses long enough to read. */
export function hintDwellMs(text: string): number {
  return Math.min(9000, Math.max(2500, 1800 + text.length * 55));
}
