// Pure view-model helpers for the parent dashboard. Neutral, evidence-based wording only.
import type { Activity } from "@/lib/games/schema";
import type { DomainSlug } from "@/lib/curriculum/schema";
import type { ActivityAttempt, EvidenceCategory } from "@/lib/learning/types";

const DAY = 86_400_000;

export const OUTCOME_LABEL: Record<ActivityAttempt["outcome"], string> = {
  independent: "Managed on their own",
  supported: "Managed with some help",
  shown: "Explored together with the answer shown",
  "open-ended": "Shared their own ideas",
  none: "No rounds finished",
};

export const EVIDENCE_SYMBOL: Record<EvidenceCategory, string> = {
  "not-introduced": "○", introduced: "◔", practising: "◑", supported: "◕", independent: "●", "ready-for-challenge": "★",
};

export function summarise(attempts: ActivityAttempt[], activities: Activity[], now: Date) {
  const weekAgo = now.getTime() - 7 * DAY;
  const week = attempts.filter((a) => new Date(a.occurredAt).getTime() >= weekAgo);
  const byId = new Map(activities.map((a) => [a.id, a]));
  const domains = new Map<DomainSlug, number>();
  for (const a of attempts) {
    const d = byId.get(a.activityId)?.domain;
    if (d) domains.set(d, (domains.get(d) ?? 0) + 1);
  }
  return {
    attemptsThisWeek: week.length,
    objectivesThisWeek: new Set(week.map((a) => a.objectiveId)).size,
    minutesThisWeek: Math.round(week.reduce((n, a) => n + a.durationSeconds, 0) / 60),
    domains,
    recent: [...attempts].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)).slice(0, 8),
  };
}

export type HistoryFilters = { from?: string; to?: string; domain?: DomainSlug | ""; activityId?: string; outcome?: ActivityAttempt["outcome"] | "" };

export function filterAttempts(attempts: ActivityAttempt[], activities: Activity[], f: HistoryFilters): ActivityAttempt[] {
  const byId = new Map(activities.map((a) => [a.id, a]));
  const from = f.from ? new Date(`${f.from}T00:00:00`).getTime() : -Infinity;
  const to = f.to ? new Date(`${f.to}T23:59:59.999`).getTime() : Infinity;
  return attempts
    .filter((a) => {
      const t = new Date(a.occurredAt).getTime();
      return t >= from && t <= to
        && (!f.domain || byId.get(a.activityId)?.domain === f.domain)
        && (!f.activityId || a.activityId === f.activityId)
        && (!f.outcome || a.outcome === f.outcome);
    })
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
}
