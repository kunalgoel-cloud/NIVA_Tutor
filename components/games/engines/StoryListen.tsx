"use client";
import type { StoryRound } from "@/lib/games/schema";
import TapChoose from "./TapChoose";
import type { EngineProps } from "../types";

/**
 * A story is told page by page, then questions check that the child understood it.
 * Pages are read aloud by the runner and cannot be left until they have been heard; questions are
 * ordinary choices and follow the same rule as every other game (a wrong answer means listening to a hint first).
 */
export default function StoryListen(props: EngineProps<StoryRound>) {
  const { round } = props;
  if (round.kind === "question") return <TapChoose {...props} round={round} />;
  return (
    <div className="flex flex-col items-center gap-4" data-testid="story-page">
      {round.display ? <div aria-hidden className="whitespace-pre-line text-center text-8xl leading-tight">{round.display}</div> : null}
      <p className="text-center text-lg font-semibold text-ink-soft">Listen to the story…</p>
    </div>
  );
}
