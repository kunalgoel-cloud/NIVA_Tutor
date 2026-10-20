import type { Activity } from "@/lib/games/schema";
import type { HintLevel } from "@/lib/games/hints";

/** What an engine reports to the runner. The runner owns feedback, hints, progress and recording. */
export type AttemptReport = {
  kind: "correct" | "incorrect" | "open";
  complete?: boolean; // default true for correct/open. Use false for partial progress (e.g. one pair matched)
  message?: string; // optional character message (e.g. reflection on an open-ended choice)
  support?: "own-words" | "tapped"; // listen-respond: how the child answered
};

export type EngineProps<R> = {
  round: R;
  activity: Activity;
  seed: string; // varies per play so answer positions are not memorised
  hintLevel: HintLevel;
  reveal: boolean; // runner asks the engine to show the answer ("let's do it together")
  locked: boolean; // round finished; ignore taps
  onAttempt: (r: AttemptReport) => void;
  say: (text: string) => void;
};
