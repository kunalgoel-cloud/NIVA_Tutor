"use client";
import Link from "next/link";
import { useMemo } from "react";
import { useApp } from "@/components/AppProvider";
import { Badge, Section, Stat } from "@/components/parent/ui";
import { DOMAINS, OBJECTIVES, OFFLINE_MISSIONS } from "@/content";
import { OUTCOME_LABEL, summarise } from "@/lib/parent/summary";

export default function ParentOverview() {
  const { profile, attempts, allActivities, recommendations, adventure } = useApp();
  const now = useMemo(() => new Date(), []);
  const s = useMemo(() => summarise(attempts, allActivities, now), [attempts, allActivities, now]);
  const recs = useMemo(() => recommendations().slice(0, 4), [recommendations]);
  const plan = useMemo(() => adventure(), [adventure]);
  const title = (id: string) => allActivities.find((a) => a.id === id)?.title ?? id;
  const objTitle = (id: string) => OBJECTIVES.find((o) => o.id === id)?.title ?? id;
  if (!profile) return null;

  return (
    <>
      <h1 className="mb-4 text-3xl font-extrabold">Overview for {profile.nickname}</h1>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Activities this week" value={s.attemptsThisWeek} />
        <Stat label="Learning goals practised" value={s.objectivesThisWeek} note="this week" />
        <Stat label="Areas explored" value={s.domains.size} note={`of ${DOMAINS.length}`} />
        <Stat label="Play time this week" value={`${s.minutesThisWeek} min`} note="optional information, not a target" />
      </div>

      <Section title="Recent activity">
        {s.recent.length === 0 ? <p>No activities played yet. Once your child plays, evidence appears here.</p> : (
          <ul className="divide-y divide-line">
            {s.recent.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span><strong>{title(a.activityId)}</strong> <span className="text-ink-soft">· {objTitle(a.objectiveId)}</span></span>
                <span className="flex flex-wrap items-center gap-2 text-sm">
                  <Badge tone={a.outcome === "independent" ? "good" : "neutral"}>{OUTCOME_LABEL[a.outcome]}</Badge>
                  {a.completionStatus === "exited-early" && <Badge>Stopped early (fine!)</Badge>}
                  {a.hintCount > 0 && <Badge tone="info">{a.hintCount} hint{a.hintCount > 1 ? "s" : ""}</Badge>}
                  <time dateTime={a.occurredAt} className="text-ink-soft">{new Date(a.occurredAt).toLocaleDateString()}</time>
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3"><Link href="/parent/history" className="font-semibold underline">See full history</Link></p>
      </Section>

      <Section title="Areas explored" hint="Counts of activities played per curriculum area.">
        <ul className="flex flex-wrap gap-2">
          {DOMAINS.map((d) => <li key={d.id}><Badge tone={s.domains.has(d.id) ? "good" : "neutral"}>{d.name}: {s.domains.get(d.id) ?? 0}</Badge></li>)}
        </ul>
      </Section>

      <Section title="Suggested next activities" hint="Chosen by transparent rules. Here is why each one was suggested.">
        {recs.length === 0 ? <p>No suggestions available.</p> : (
          <ol className="space-y-3">
            {recs.map((r) => (
              <li key={r.activity.id} className="rounded-xl bg-cream p-3">
                <p className="font-bold">{r.activity.title} <span className="font-normal text-ink-soft">· {objTitle(r.activity.objectiveIds[0])}</span></p>
                <ul className="list-disc pl-5 text-sm text-ink-soft">{r.reasons.map((x, i) => <li key={i}>{x}</li>)}</ul>
              </li>
            ))}
          </ol>
        )}
        <p className="mt-3 text-sm text-ink-soft">Today&apos;s Adventure for your child currently has {plan.items.length} activities (about {plan.totalMinutes} min, a suggestion only).</p>
      </Section>

      <Section title="Offline ideas to try together" hint="Suggestions only. These are never counted as completed digital activities.">
        <ul className="grid gap-3 sm:grid-cols-2">
          {OFFLINE_MISSIONS.slice(0, 6).map((m) => (
            <li key={m.id} className="rounded-xl border-2 border-dashed border-line p-3">
              <p className="font-bold">🏠 {m.title}</p><p className="text-sm">{m.description}</p>
              {m.supervision && <p className="mt-1 text-sm font-semibold text-try">Adult supervision: {m.supervision}</p>}
            </li>
          ))}
        </ul>
      </Section>
      <p className="text-sm text-ink-soft">These pages describe evidence of what your child has practised. They are not diagnoses or assessments of ability.</p>
    </>
  );
}
