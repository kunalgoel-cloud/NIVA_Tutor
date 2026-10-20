// Content registry: the single place the app reads curriculum + activities from.
import { ActivitySchema, type Activity } from "@/lib/games/schema";
import { DOMAINS } from "./domains";
import { FRAMEWORKS } from "./frameworks";
import { OBJECTIVES } from "./objectives";
import { NUMBER_ACTIVITIES } from "./activities/number";
import { CONVERSATION_ACTIVITIES } from "./activities/conversation";
import { EXTRA_NUMBER_ACTIVITIES, EXTRA_PUZZLE_ACTIVITIES, EXTRA_CREATIVITY_ACTIVITIES } from "./activities/extra";
import { PUZZLE_ACTIVITIES, WONDER_ACTIVITIES, CREATIVITY_ACTIVITIES } from "./activities/worlds";

export { DOMAINS, FRAMEWORKS, OBJECTIVES };
export { WORLDS, worldBySlug } from "./worlds";
export { CHARACTERS, characterById } from "./characters";
export { OFFLINE_MISSIONS } from "./offline-missions";

export const RAW_ACTIVITIES: unknown[] = [
  ...NUMBER_ACTIVITIES, ...CONVERSATION_ACTIVITIES, ...PUZZLE_ACTIVITIES, ...WONDER_ACTIVITIES, ...CREATIVITY_ACTIVITIES,
  ...EXTRA_NUMBER_ACTIVITIES, ...EXTRA_PUZZLE_ACTIVITIES, ...EXTRA_CREATIVITY_ACTIVITIES,
];

/** Activities that parse. Broken ones are dropped here and reported by validation, never rendered. */
export const ACTIVITIES: Activity[] = RAW_ACTIVITIES.flatMap((raw) => {
  const r = ActivitySchema.safeParse(raw);
  return r.success ? [r.data] : [];
});

export const activityById = (id: string) => ACTIVITIES.find((a) => a.id === id);
export const domainById = (id: string) => DOMAINS.find((d) => d.id === id);
