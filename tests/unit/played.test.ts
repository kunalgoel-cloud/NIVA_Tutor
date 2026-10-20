import { describe, expect, it } from "vitest";
import { playedActivityIds } from "@/lib/learning/played";
import { ACTIVITIES, OBJECTIVES, OFFLINE_MISSIONS } from "@/content";
import { planAdventure } from "@/lib/recommendations/adventure";
import { isChildVisible } from "@/lib/validation/publication";
import { ParentSettingsSchema } from "@/lib/parent/settings";
import type { ActivityAttempt } from "@/lib/learning/types";

const at = (activityId: string, occurredAt: string, completionStatus: ActivityAttempt["completionStatus"] = "completed"): ActivityAttempt =>
  ({ id: `${activityId}-${occurredAt}`, childProfileId: "p", activityId, activityVersion: 1, objectiveId: "MATH-CNT-01", outcome: "independent", hintCount: 0,
    assistanceLevel: "none", completionStatus, occurredAt, durationSeconds: 30, rounds: [] });

describe("played games", () => {
  it("counts only finished games, not early exits", () => {
    const ids = playedActivityIds([at("a", "2026-02-01T10:00:00Z"), at("b", "2026-02-01T10:00:00Z", "exited-early")]);
    expect([...ids]).toEqual(["a"]);
  });
  it("a reset makes earlier games new again, and later plays count again", () => {
    const attempts = [at("a", "2026-02-01T10:00:00Z"), at("b", "2026-02-03T10:00:00Z")];
    expect([...playedActivityIds(attempts, "2026-02-02T00:00:00Z")]).toEqual(["b"]);
    expect(playedActivityIds(attempts, "2026-02-04T00:00:00Z").size).toBe(0);
  });
  it("defaults to never repeating, with no reset recorded", () => {
    const s = ParentSettingsSchema.parse({});
    expect(s.session.neverRepeat).toBe(true);
    expect(s.session.gamesResetAt).toEqual({});
  });
  it("Today's Adventure never offers a game that was already finished", () => {
    const visible = ACTIVITIES.filter(isChildVisible);
    const now = new Date("2026-02-01T10:00:00Z");
    const first = planAdventure({ activities: visible, objectives: OBJECTIVES, attempts: [], ageBand: "little-explorer", now }, OFFLINE_MISSIONS);
    const donePicks = first.items.map((i) => i.pick.activity.id);
    const played = playedActivityIds(donePicks.map((id) => at(id, now.toISOString())));
    const fresh = visible.filter((a) => !played.has(a.id));
    const next = planAdventure({ activities: fresh, objectives: OBJECTIVES, attempts: [], ageBand: "little-explorer", now }, OFFLINE_MISSIONS);
    for (const i of next.items) expect(donePicks).not.toContain(i.pick.activity.id);
  });
  it("games run out only after all are played", () => {
    const visible = ACTIVITIES.filter(isChildVisible);
    const all = playedActivityIds(visible.map((a) => at(a.id, "2026-02-01T10:00:00Z")));
    expect(visible.filter((a) => !all.has(a.id))).toHaveLength(0);
  });
});
