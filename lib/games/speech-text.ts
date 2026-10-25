import type { Activity, TapChooseRound, StoryQuestionRound } from "./schema";

/** What the character says when a round starts. Word-only choices are read out too, because pre-readers cannot read them. */
export function roundSpeech(activity: Activity, roundIndex: number): string {
  const r = activity.rounds[roundIndex] as { prompt: string; options?: { alt: string }[] };
  const choices = (activity.engine === "tap-choose" || activity.engine === "story-listen") ? (r as TapChooseRound | StoryQuestionRound).options : undefined;
  if (activity.presentation === "words" && choices && choices.length > 0) {
    return `${r.prompt} ${choices.map((o) => o.alt).join(". Or: ")}.`.replace(/\.\.$/, ".");
  }
  return r.prompt;
}
