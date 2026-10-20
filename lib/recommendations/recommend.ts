// Deterministic, explainable recommendation engine. Same inputs always give the same output.
import type { Activity } from "@/lib/games/schema";
import { ageBandIndex, type AgeBand, type DomainSlug, type Objective } from "@/lib/curriculum/schema";
import { EVIDENCE_ORDER, type ActivityAttempt, type EvidenceCategory, type ObjectiveProgress } from "@/lib/learning/types";
import { progressMap } from "@/lib/learning/progress";

export type RecommendContext = {
  activities: Activity[]; // already filtered to child-visible (published + reviewed)
  objectives: Objective[];
  attempts: ActivityAttempt[];
  ageBand: AgeBand;
  now: Date;
  interests?: string[];
  domains?: DomainSlug[]; // optional restriction (e.g. one adventure slot)
};

export type Recommendation = { activity: Activity; score: number; reasons: string[]; objectiveCategory: EvidenceCategory };

const DAY = 86_400_000;
const rank = (c: EvidenceCategory) => EVIDENCE_ORDER.indexOf(c);

export function arePrerequisitesMet(
  objective: Objective, objectives: Objective[], progress: Record<string, ObjectiveProgress>, activities: Activity[]
): boolean {
  return objective.prerequisites.every((pid) => {
    const hasActivity = activities.some((a) => a.objectiveIds[0] === pid);
    if (!hasActivity) return true; // nothing to practise yet, so it must not block (avoids deadlock)
    return rank(progress[pid]?.category ?? "not-introduced") >= rank("supported");
  });
}

export function recommend(ctx: RecommendContext): Recommendation[] {
  // Attempts with no finished rounds (the child stopped straight away) carry no evidence and must not
  // influence anything: stopping early is never penalised.
  const attempts = ctx.attempts.filter((a) => a.rounds.length > 0);
  const obsAll = attempts.flatMap((a) => a.rounds);
  const objById = new Map(ctx.objectives.map((o) => [o.id, o]));
  const progress = progressMap(ctx.objectives.map((o) => o.id), obsAll);
  const recent = [...attempts].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  const last3Domains = recent.slice(0, 3).map((a) => domainOf(ctx.activities, a.activityId));
  const last5Ids = recent.slice(0, 5).map((a) => a.activityId);
  const maxDifficultyDone = (oid: string) =>
    Math.max(0, ...recent.filter((a) => a.objectiveId === oid && a.completionStatus === "completed").map((a) => ctx.activities.find((x) => x.id === a.activityId)?.difficulty ?? 0));
  const bandIdx = ageBandIndex(ctx.ageBand);

  const out: Recommendation[] = [];
  for (const a of ctx.activities) {
    if (ageBandIndex(a.ageBand) > bandIdx) continue; // respect age band
    if (ctx.domains && !ctx.domains.includes(a.domain)) continue;
    const primary = objById.get(a.objectiveIds[0]);
    if (!primary) continue;
    if (!arePrerequisitesMet(primary, ctx.objectives, progress, ctx.activities)) continue;

    const p = progress[primary.id];
    const reasons: string[] = [];
    let score = 0;
    switch (p.category) {
      case "not-introduced": score += 30; reasons.push(`A new idea to explore: ${primary.title}.`); score += 5 * (4 - a.difficulty); break;
      case "introduced": score += 35; reasons.push(`Started recently: a little more practice with "${primary.title}" helps.`); score += 5 * (4 - a.difficulty); break;
      case "practising": score += 40; reasons.push(`Still practising "${primary.title}", so more play helps.`); score += 5 * (4 - a.difficulty); break;
      case "supported": score += 30; reasons.push(`Managing "${primary.title}" with support. Try again with less help.`); score += 2 * (4 - a.difficulty); break;
      case "independent": score += 6; reasons.push(`Doing "${primary.title}" independently. A gentle revisit keeps it fresh.`); score += 3 * a.difficulty; break;
      case "ready-for-challenge": {
        score += 6; reasons.push(`Ready for more challenge with "${primary.title}".`);
        if (a.difficulty > maxDifficultyDone(primary.id)) { score += 20; reasons.push("This is a step up from what was played before."); }
        break;
      }
    }
    if (p.nextReviewAt && new Date(p.nextReviewAt) <= ctx.now && rank(p.category) >= rank("practising")) { score += 15; reasons.push("A spaced review is due."); }

    if (!last3Domains.includes(a.domain)) { score += 15; reasons.push("Mixes in a different kind of learning."); }
    else if (last3Domains[0] === a.domain) score -= 10;

    const lastTime = recent.find((x) => x.activityId === a.id)?.occurredAt;
    if (lastTime && ctx.now.getTime() - new Date(lastTime).getTime() < DAY) { score -= 40; reasons.push("Played in the last day, so a break from it."); }
    else if (last5Ids.includes(a.id) && rank(p.category) >= rank("supported")) score -= 15; // no recency penalty while still practising

    if (ctx.interests?.length && a.tags.some((t) => ctx.interests!.map((i) => i.toLowerCase()).includes(t.toLowerCase()))) { score += 8; reasons.push("Matches an interest you set."); }

    out.push({ activity: a, score, reasons, objectiveCategory: p.category });
  }
  return out.sort((x, y) => y.score - x.score || x.activity.id.localeCompare(y.activity.id));
}

const domainOf = (acts: Activity[], id: string): DomainSlug | undefined => acts.find((a) => a.id === id)?.domain;
