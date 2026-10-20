"use client";
import { useMemo, useState } from "react";
import { useApp } from "@/components/AppProvider";
import { Badge, Section } from "@/components/parent/ui";
import { DOMAINS, FRAMEWORKS, OBJECTIVES } from "@/content";
import { AGE_BAND_INFO } from "@/lib/curriculum/schema";
import { progressFor } from "@/lib/learning/progress";
import { EVIDENCE_LABEL, type EvidenceCategory } from "@/lib/learning/types";
import { EVIDENCE_SYMBOL } from "@/lib/parent/summary";

const SYM: Record<string, string> = { independent: "●", supported: "◐", shown: "○", "open-ended": "◇" };
const tone = (c: EvidenceCategory) => (c === "independent" || c === "ready-for-challenge" ? "good" : c === "not-introduced" ? "neutral" : "info");

export default function ProgressPage() {
  const { attempts, allActivities, visibleActivities } = useApp();
  const [domain, setDomain] = useState("");
  const [onlyStarted, setOnlyStarted] = useState(false);
  const obs = useMemo(() => attempts.flatMap((a) => a.rounds), [attempts]);
  const rows = useMemo(() => OBJECTIVES.filter((o) => !domain || o.domain === domain).map((o) => {
    const p = progressFor(o.id, obs);
    const mine = obs.filter((x) => x.objectiveId === o.id).sort((a, b) => a.at.localeCompare(b.at));
    const next = visibleActivities.find((a) => a.objectiveIds[0] === o.id);
    return { o, p, mine, next };
  }).filter((r) => !onlyStarted || r.p.observations > 0), [domain, obs, visibleActivities, onlyStarted]);

  return (
    <>
      <h1 className="mb-2 text-3xl font-extrabold">Learning goals and evidence</h1>
      <p className="mb-4 max-w-3xl text-ink-soft">
        Each goal shows the <em>evidence</em> gathered so far. One correct answer is never counted as mastery: we look for repeated success across different questions and activities, and we count hints and repeated questions carefully.
      </p>
      <div className="mb-4 flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1 font-semibold" htmlFor="dom">Area
          <select id="dom" value={domain} onChange={(e) => setDomain(e.target.value)} className="min-h-11 rounded-lg border-2 border-line bg-white px-2">
            <option value="">All areas</option>{DOMAINS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </label>
        <label className="flex min-h-11 items-center gap-2 font-semibold"><input type="checkbox" className="size-5" checked={onlyStarted} onChange={(e) => setOnlyStarted(e.target.checked)} /> Only goals already started</label>
      </div>
      <p className="mb-2 text-sm text-ink-soft" aria-hidden>Key: ● independent · ◐ with support · ○ answer shown · ◇ open-ended</p>
      <div className="space-y-3">
        {rows.map(({ o, p, mine, next }) => (
          <details key={o.id} className="rounded-2xl border-2 border-line bg-white p-4" data-testid="objective-row">
            <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2">
              <span><strong>{o.title}</strong> <span className="text-sm text-ink-soft">{o.id} · ages {AGE_BAND_INFO[o.ageBand].ages}{o.status !== "published" ? " · planned" : ""}</span></span>
              <Badge tone={tone(p.category)}><span aria-hidden>{EVIDENCE_SYMBOL[p.category]} </span>{EVIDENCE_LABEL[p.category]}</Badge>
            </summary>
            <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <p><strong>Recent attempts:</strong> {p.observations === 0 ? "none yet" : <span aria-label={`${mine.length} observations`}>{mine.slice(-10).map((m, i) => <span key={i} className="mr-1 font-mono text-lg" title={m.outcome}>{SYM[m.outcome]}</span>)}</span>}</p>
                <p><strong>Hints used:</strong> {mine.filter((m) => m.hintsUsed > 0).length} of {mine.length} rounds</p>
                <p><strong>Last seen:</strong> {p.lastPractisedAt ? new Date(p.lastPractisedAt).toLocaleDateString() : "not yet"}</p>
                <p><strong>Next suggested review:</strong> {p.nextReviewAt ? new Date(p.nextReviewAt).toLocaleDateString() : "n/a"}</p>
                <p><strong>Next activity:</strong> {next ? next.title : "no published activity yet"}</p>
              </div>
              <div>
                <p><strong>What this means:</strong> {o.parentExplanation}</p>
                <p className="mt-1"><strong>Looks like success when:</strong> {o.successCriteria.join("; ")}.</p>
                {o.offlineIdea && <p className="mt-1">🏠 <strong>Try offline:</strong> {o.offlineIdea}</p>}
                <p className="mt-1 text-ink-soft"><strong>Frameworks:</strong> {o.frameworkMappings.map((m) => `${FRAMEWORKS.find((f) => f.id === m.frameworkId)?.name.split(" (")[0] ?? m.frameworkId}: ${m.reference}`).join(" · ")}</p>
                {o.prerequisites.length > 0 && <p className="mt-1 text-ink-soft"><strong>Builds on:</strong> {o.prerequisites.map((id) => OBJECTIVES.find((x) => x.id === id)?.title ?? id).join(", ")}</p>}
              </div>
            </div>
          </details>
        ))}
        {rows.length === 0 && <p className="rounded-xl bg-white p-4">No goals match. {onlyStarted ? "Nothing has been started yet." : ""}</p>}
      </div>
      <Section title="About these labels" id="about">
        <p className="text-sm">Labels such as &ldquo;Practising&rdquo; describe evidence gathered in this app only. They say nothing about your child&apos;s overall ability or future results, and children develop at very different speeds. Activities: {allActivities.length} in the library.</p>
      </Section>
    </>
  );
}
