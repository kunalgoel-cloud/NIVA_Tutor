// Varied feedback so the same words are not heard over and over. Phrases are grouped by the kind of game,
// they never claim more than happened, and a phrase is never repeated back to back.
export type PraiseCategory =
  | "count" | "choose" | "match" | "pattern" | "order" | "talk" | "kind" | "feelings" | "letters" | "puzzle" | "maze" | "story" | "create";

const GENERAL = [
  "Yes, that's right!", "Well done!", "You got it!", "Super thinking!", "That's the one!", "Lovely work!",
  "Great job!", "You did it!", "Hooray, correct!", "Brilliant!", "Spot on!", "Nicely done!",
];

export const CORRECT: Record<PraiseCategory, string[]> = {
  count: ["You counted so carefully!", "Exactly right, that's how many!", "Counting champion!", "Yes! You touched each one just once.", "Perfect counting!", "That's the right number!", ...GENERAL.slice(0, 4)],
  choose: ["That's the right answer!", "You chose well!", "Good choosing!", "Yes, that one fits!", "Clever pick!", ...GENERAL],
  match: ["Those two belong together!", "A perfect match!", "You found the partner!", "They go together, well spotted!", "Great matching!", ...GENERAL.slice(0, 5)],
  pattern: ["You spotted the pattern!", "Yes, that comes next!", "Pattern power!", "You worked out what comes next!", "The pattern goes on, just like that!", ...GENERAL.slice(0, 5)],
  order: ["Right order, nicely done!", "That's the way it happens!", "First, then next, then last. Perfect!", "You put them in the right order!", "Everything is in its place!", ...GENERAL.slice(0, 4)],
  talk: ["Thank you for telling me!", "What a lovely thing to say!", "I loved hearing that!", "You explained that so well!", "Great talking!", "That was interesting!"],
  kind: ["That's a kind choice!", "That would make a friend feel good!", "Kind and caring, well done!", "Yes, that's a thoughtful thing to do!", "What a helpful idea!", "That shows you care!"],
  feelings: ["Yes, that's how they feel!", "You understand feelings so well!", "Good noticing!", "That's right, you read their feelings!", "You are a feelings detective!", "Spot on, that's the feeling!"],
  letters: ["Yes, that's the letter!", "You know your letters!", "Letter detective!", "That's the right letter!", "Great reading eyes!", "That sound is right!", ...GENERAL.slice(0, 4)],
  puzzle: ["Puzzle solved!", "Clever thinking!", "You figured it out!", "Great puzzle brain!", "You worked it out!", "Smart solving!", ...GENERAL.slice(0, 4)],
  maze: ["You found the way!", "Out of the maze, hooray!", "What a great explorer!", "You followed the path all the way!", "Maze master!", "You made it!"],
  story: ["Yes, you remembered the story!", "You were listening so well!", "That's just what happened!", "Great listening!", "You understood the story!", "Right, that's in the story!"],
  create: ["What a creative idea!", "I love your imagination!", "That's a wonderful idea!", "How inventive!", "What a lovely thought!", "Great imagining!"],
};

/** Short cheers for one correct step in a longer round (a pair matched, an item sorted, a step placed). */
export const STEP: string[] = ["That fits!", "Yes!", "Good one!", "Right!", "Nice!", "Another one!", "Perfect!", "Keep going!", "Just right!"];

/** After a wrong answer, before the hint. Warm, short, and never a "wrong". */
export const TRY_AGAIN: string[] = [
  "Good try! Let's listen.", "Nearly! Let's have a little help.", "Let's think about it together.", "Not that one. Listen carefully.",
  "That's okay! Here's a clue.", "Let's look again, with a clue.", "Have another think. Here's some help.", "Almost! Listen to this.",
];

export const COMPLETE: Record<PraiseCategory, string[]> = {
  count: ["What a great counter you are!", "You counted everything!", "All done counting!", "Super counting today!"],
  choose: ["You finished the whole game!", "All done, well played!", "You worked hard on that.", "Great playing!"],
  match: ["Everything is matched!", "All the pairs are together!", "Matching master!", "What a great matcher!"],
  pattern: ["You solved every pattern!", "Pattern star!", "All the patterns are done!", "Great pattern thinking!"],
  order: ["Everything is in order!", "You put it all in order!", "Great sequencing!", "All in the right order!"],
  talk: ["Thank you for chatting with me!", "That was a lovely chat!", "I enjoyed talking with you!", "What a great talker you are!"],
  kind: ["You thought of so many kind things!", "Kindness star!", "What a caring friend you are!", "That was kind thinking!"],
  feelings: ["You know so much about feelings!", "Feelings detective!", "Great noticing of feelings!", "All done, well noticed!"],
  letters: ["You know your letters so well!", "Letter star!", "What a wonderful reader you are becoming!", "All the letters are done!"],
  puzzle: ["Puzzle champion!", "All the puzzles are solved!", "Super puzzling!", "What a clever thinker!"],
  maze: ["You are a maze explorer!", "Every maze is solved!", "Great route finding!", "Maze champion!"],
  story: ["That was a lovely story, and you understood it!", "Great story listening!", "You listened to the whole story!", "Story star!"],
  create: ["What a creative adventure!", "Your ideas were wonderful!", "Thank you for sharing your imagination!", "Imagination star!"],
};

import type { Activity } from "./schema";

export function praiseCategory(a: Pick<Activity, "engine" | "domain" | "tags"> & { rounds?: unknown[] }): PraiseCategory {
  if (a.engine === "maze") return "maze";
  if (a.engine === "story-listen") return "story";
  if (a.domain === "early-literacy" || a.tags.includes("letters") || a.tags.includes("alphabet")) return "letters";
  if (a.domain === "social-emotional") return a.tags.includes("feelings") ? "feelings" : "kind";
  if (a.domain === "creativity-storytelling") return "create";
  if (a.engine === "count-collect") return "count";
  if (a.engine === "match-pair") return "match";
  if (a.engine === "listen-respond") return "talk";
  if (a.engine === "complete-pattern") return a.tags.includes("sequence") ? "order" : "pattern";
  if (a.domain === "logic-puzzles") return "puzzle";
  return "choose";
}

/** A varied pick that never equals the previous one for the same list. `rand` is injectable for tests. */
const last = new Map<string, number>();
export function pickVaried(list: string[], key: string, rand: () => number = Math.random): string {
  if (list.length === 1) return list[0];
  const prev = last.get(key);
  let i = Math.floor(rand() * list.length);
  if (i === prev) i = (i + 1 + Math.floor(rand() * (list.length - 1))) % list.length;
  last.set(key, i);
  return list[i];
}
export const praise = (c: PraiseCategory) => pickVaried(CORRECT[c], `c:${c}`);
export const stepPraise = () => pickVaried(STEP, "step");
export const tryAgain = () => pickVaried(TRY_AGAIN, "try");
export const completePraise = (c: PraiseCategory) => pickVaried(COMPLETE[c], `done:${c}`);
