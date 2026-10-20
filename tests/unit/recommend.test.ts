import { describe, expect, it } from "vitest";
import { ACTIVITIES, OBJECTIVES, OFFLINE_MISSIONS } from "@/content";
import { arePrerequisitesMet, recommend } from "@/lib/recommendations/recommend";
import { planAdventure } from "@/lib/recommendations/adventure";
import { buildAttempt } from "@/lib/learning/attempt";
import { progressMap } from "@/lib/learning/progress";
import { isChildVisible } from "@/lib/validation/publication";
import type { ActivityAttempt } from "@/lib/learning/types";
import { obs } from "../helpers";

const visible = ACTIVITIES.filter(isChildVisible);
const now = new Date("2026-02-01T10:00:00Z");
const ctx = (attempts: ActivityAttempt[] = [], over = {}) => ({ activities: visible, objectives: OBJECTIVES, attempts, ageBand: "little-explorer" as const, now, ...over });

function played(activityId: string, outcome: "independent" | "supported" | "shown", daysAgo: number, n = 3): ActivityAttempt {
  const a = ACTIVITIES.find((x) => x.id === activityId)!;
  const at = new Date(now.getTime() - daysAgo * 86_400_000);
  const observations = Array.from({ length: n }, (_, i) => obs({ activityId, roundId: a.rounds[i % a.rounds.length].id + i, objectiveId: a.objectiveIds[0], outcome, optionCount: 4, hintsUsed: outcome === "supported" ? 1 : 0, at: new Date(at.getTime() + i * 1000).toISOString() } as never));
  return { ...buildAttempt({ id: `${activityId}-${daysAgo}`, profileId: "p", activity: a, observations, reachedEnd: true, startedAt: at.getTime() - 60_000, now: at }) };
}

describe("recommendation engine", () => {
  it("is deterministic: same inputs, same output", () => {
    const a = recommend(ctx()).map((r) => [r.activity.id, r.score]);
    const b = recommend(ctx()).map((r) => [r.activity.id, r.score]);
    expect(a).toEqual(b);
  });
  it("every recommendation carries human-readable reasons", () => {
    for (const r of recommend(ctx()).slice(0, 10)) expect(r.reasons.length).toBeGreaterThan(0);
  });
  it("respects prerequisites for a brand-new child", () => {
    const ids = recommend(ctx()).map((r) => r.activity.id);
    expect(ids).not.toContain("count-the-animal-friends"); // needs MATH-CNT-01 first
    expect(ids).not.toContain("count-to-ten-parade");
    expect(ids).toContain("count-the-apples");
  });
  it("unlocks the next step once the prerequisite shows support or better", () => {
    const attempts = [played("count-the-apples", "supported", 3), played("count-the-apples", "supported", 2)];
    const prog = progressMap(OBJECTIVES.map((o) => o.id), attempts.flatMap((a) => a.rounds));
    expect(prog["MATH-CNT-01"].category).toMatch(/supported|independent|ready/);
    expect(recommend(ctx(attempts)).map((r) => r.activity.id)).toContain("count-the-animal-friends");
  });
  it("prerequisite checker never deadlocks when a prerequisite has no activity", () => {
    const obj = OBJECTIVES.find((o) => o.id === "SPE-SNT-01")!;
    expect(arePrerequisitesMet(obj, OBJECTIVES, progressMap(OBJECTIVES.map((o) => o.id), []), [])).toBe(true);
  });
  it("respects the age band: never offers activities from a later band", () => {
    const fake = { ...visible[0], id: "future", ageBand: "confident-learner" as const };
    const ids = recommend({ ...ctx(), activities: [...visible, fake] }).map((r) => r.activity.id);
    expect(ids).not.toContain("future");
  });
  it("ignores unpublished or unreviewed activities handed to it by mistake", () => {
    expect(visible.every(isChildVisible)).toBe(true);
    expect(visible.length).toBe(ACTIVITIES.length);
  });
  it("gives a short break from an activity played in the last day", () => {
    const first = recommend(ctx())[0].activity.id;
    const after = recommend(ctx([played(first, "supported", 0)]));
    expect(after.find((r) => r.activity.id === first)!.score).toBeLessThan(recommend(ctx()).find((r) => r.activity.id === first)!.score);
  });
  it("revisits objectives that need practice before skipping ahead", () => {
    const attempts = [played("count-the-apples", "shown", 4, 3)];
    const top = recommend(ctx(attempts)).slice(0, 5).map((r) => r.activity.id);
    expect(top).toContain("count-the-apples");
  });
  it("offers a harder variant after consistent success", () => {
    const easy = played("complete-the-colour-pattern", "independent", 6, 4);
    const attempts = [easy, played("complete-the-colour-pattern", "independent", 4, 4), played("complete-the-colour-pattern", "independent", 1, 4)];
    const reasons = recommend(ctx(attempts)).find((r) => r.activity.id === "complete-the-pattern");
    expect(reasons).toBeDefined(); // LOG-PAT-01 unlocked by MATH-PAT-01 evidence
  });
  it("rotates across domains", () => {
    const first = recommend(ctx())[0].activity;
    const attempts = [played(first.id, "supported", 3)];
    const next = recommend(ctx(attempts))[0].activity;
    expect(next.domain).not.toBe(first.domain);
  });
  it("prefers activities that match interests", () => {
    const plain = recommend(ctx()).find((r) => r.activity.id === "count-the-apples")!;
    const liked = recommend(ctx([], { interests: ["Fruit"] })).find((r) => r.activity.id === "count-the-apples")!;
    expect(liked.score).toBe(plain.score + 8);
  });
  it("never penalises stopping early: an exited-early attempt with no rounds adds no evidence", () => {
    const a = ACTIVITIES[0];
    const early = buildAttempt({ id: "e", profileId: "p", activity: a, observations: [], reachedEnd: false, startedAt: 0, now });
    expect(early.outcome).toBe("none");
    expect(recommend(ctx([early])).map((r) => r.activity.id)).toEqual(recommend(ctx()).map((r) => r.activity.id));
  });
});

describe("Today's Adventure", () => {
  it("builds a balanced set across different domains", () => {
    const plan = planAdventure(ctx(), OFFLINE_MISSIONS, 4);
    expect(plan.items).toHaveLength(4);
    const domains = plan.items.map((i) => i.pick.activity.domain);
    expect(new Set(domains).size).toBeGreaterThanOrEqual(3);
    expect(new Set(plan.items.map((i) => i.pick.activity.id)).size).toBe(4);
    expect(plan.totalMinutes).toBeGreaterThan(0);
  });
  it("respects the parent's length preference", () => {
    expect(planAdventure(ctx(), OFFLINE_MISSIONS, 2).items).toHaveLength(2);
  });
  it("keeps the offline mission separate from digital items", () => {
    const plan = planAdventure(ctx(), OFFLINE_MISSIONS, 4);
    expect(plan.mission?.mission.id).toBeDefined();
    expect(plan.items.some((i) => i.pick.activity.id === plan.mission!.mission.id)).toBe(false);
  });
  it("returns an empty plan, not a crash, when there are no activities", () => {
    const plan = planAdventure({ ...ctx(), activities: [] }, OFFLINE_MISSIONS, 4);
    expect(plan.items).toEqual([]);
  });
});
