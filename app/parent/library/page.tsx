"use client";
import { useMemo, useState } from "react";
import { useApp } from "@/components/AppProvider";
import { Badge, PBtn } from "@/components/parent/ui";
import { DOMAINS, FRAMEWORKS, OBJECTIVES, RAW_ACTIVITIES } from "@/content";
import { WORLDS } from "@/content/worlds";
import type { Activity } from "@/lib/games/schema";
import { AGE_BAND_INFO, type PublicationStatus } from "@/lib/curriculum/schema";
import { validateContent } from "@/lib/validation/content-validator";
import { canTransition, isChildVisible } from "@/lib/validation/publication";

type Tab = "activities" | "objectives" | "sources";

function describeAnswer(a: Activity, i: number): string {
  const r = a.rounds[i] as never as Record<string, unknown> & { options?: { id: string; alt: string }[]; correctIds?: string[]; acceptableIds?: string[] };
  switch (a.engine) {
    case "tap-choose": {
      if (r.openEnded) return "Open-ended: every option is welcome";
      const ok = new Set([...(r.correctIds ?? []), ...(r.acceptableIds ?? [])]);
      return `Correct: ${(r.options ?? []).filter((o) => ok.has(o.id)).map((o) => o.alt).join(" / ")}`;
    }
    case "count-collect": return r.mode === "count" ? `Count answer: ${r.total}` : `Give exactly ${r.target} of ${r.total}`;
    case "match-pair": return r.mode === "pairs" ? `${(r.pairs as unknown[]).length} pairs to match` : `Sort ${(r.items as unknown[]).length} items into ${(r.bins as unknown[]).length} groups`;
    case "complete-pattern": return r.mode === "complete" ? `Correct: ${(r.options ?? []).filter((o) => r.correctIds?.includes(o.id)).map((o) => o.alt).join(" / ")}` : `Order ${(r.steps as unknown[]).length} steps`;
    case "listen-respond": return `Any understandable reply is welcome (${(r.quickReplies as unknown[]).length} tap choices, ${(r.concepts as unknown[]).length} topics recognised)`;
  }
}

export default function LibraryPage() {
  const { allActivities, settings, saveSettings } = useApp();
  const [tab, setTab] = useState<Tab>("activities");
  const [status, setStatus] = useState("");
  const [domain, setDomain] = useState("");
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const issues = useMemo(() => validateContent({ rawActivities: RAW_ACTIVITIES, objectives: OBJECTIVES, frameworks: FRAMEWORKS, domains: DOMAINS }), []);
  const issuesFor = (id: string) => issues.filter((i) => i.scope === `activity:${id}` || i.scope.startsWith(`activity:${id}/`));
  const list = allActivities.filter((a) => (!status || a.status === status) && (!domain || a.domain === domain) && (!q || a.title.toLowerCase().includes(q.toLowerCase())));
  const counts = (["draft", "validated", "published", "retired"] as const).map((s) => [s, allActivities.filter((a) => a.status === s).length] as const);

  const setOverride = async (a: Activity, patch: { status?: PublicationStatus; reviewStatus?: "reviewed" | "unreviewed" }) =>
    saveSettings({ ...settings, statusOverrides: { ...settings.statusOverrides, [a.id]: { ...settings.statusOverrides[a.id], ...patch } } });

  const move = async (a: Activity, to: PublicationStatus) => {
    const errors = issuesFor(a.id).some((i) => i.level === "error");
    const res = canTransition(a, to, errors);
    if (!res.ok) { setMsg(`${a.title}: ${res.reason}`); return; }
    await setOverride(a, { status: to });
    setMsg(`${a.title} is now ${to}.`);
  };

  return (
    <>
      <h1 className="mb-4 text-3xl font-extrabold">Content library</h1>
      <div role="tablist" aria-label="Library sections" className="mb-4 flex flex-wrap gap-2">
        {(["activities", "objectives", "sources"] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`min-h-11 rounded-full border-2 px-5 font-bold ${tab === t ? "border-ink bg-ink text-white" : "border-line bg-white"}`}>
            {t === "activities" ? "Activities" : t === "objectives" ? "Learning goals" : "Curriculum sources"}
          </button>
        ))}
      </div>
      {msg && <p role="status" className="mb-3 rounded-xl bg-violet-50 px-4 py-2 font-semibold">{msg}</p>}

      {tab === "activities" && (
        <>
          <p className="mb-3 max-w-3xl text-ink-soft">Only <strong>published</strong> and <strong>reviewed</strong> activities appear for your child. Moving an activity to <em>validated</em> or <em>published</em> requires it to pass validation, and publishing requires you to mark it reviewed.</p>
          <p className="mb-3 flex flex-wrap gap-2">{counts.map(([s, n]) => <Badge key={s} tone={s === "published" ? "good" : "neutral"}>{s}: {n}</Badge>)}</p>
          <div className="mb-4 flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 font-semibold">Search<input value={q} onChange={(e) => setQ(e.target.value)} className="min-h-11 rounded-lg border-2 border-line px-2" /></label>
            <label className="flex flex-col gap-1 font-semibold">Status<select value={status} onChange={(e) => setStatus(e.target.value)} className="min-h-11 rounded-lg border-2 border-line bg-white px-2"><option value="">All</option>{["draft", "validated", "published", "retired"].map((s) => <option key={s}>{s}</option>)}</select></label>
            <label className="flex flex-col gap-1 font-semibold">Area<select value={domain} onChange={(e) => setDomain(e.target.value)} className="min-h-11 rounded-lg border-2 border-line bg-white px-2"><option value="">All</option>{DOMAINS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></label>
          </div>
          {list.length === 0 && <p className="rounded-xl bg-white p-4" data-testid="empty-library">No activities match. Clear the filters to see everything.</p>}
          <div className="space-y-3">
            {list.map((a) => {
              const is = issuesFor(a.id);
              const errs = is.filter((i) => i.level === "error");
              return (
                <details key={a.id} className="rounded-2xl border-2 border-line bg-white p-4" data-testid="library-row">
                  <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2">
                    <span><strong>{a.title}</strong> <span className="text-sm text-ink-soft">· {a.engine} · ages {AGE_BAND_INFO[a.ageBand].ages}</span></span>
                    <span className="flex flex-wrap gap-2">
                      <Badge tone={a.status === "published" ? "good" : a.status === "retired" ? "warn" : "neutral"}>{a.status}</Badge>
                      <Badge tone={a.reviewStatus === "reviewed" ? "good" : "warn"}>{a.reviewStatus}</Badge>
                      {isChildVisible(a) ? <Badge tone="info">visible to child</Badge> : <Badge>hidden from child</Badge>}
                      {errs.length > 0 && <Badge tone="warn">{errs.length} validation error{errs.length > 1 ? "s" : ""}</Badge>}
                    </span>
                  </summary>
                  <div className="mt-3 grid gap-4 text-sm lg:grid-cols-2">
                    <div>
                      <p>{a.description}</p>
                      <p className="mt-1"><strong>Area:</strong> {DOMAINS.find((d) => d.id === a.domain)?.name} · <strong>World:</strong> {WORLDS.find((w) => w.slug === a.world)?.name}</p>
                      <p><strong>Learning goals:</strong> {a.objectiveIds.map((id) => OBJECTIVES.find((o) => o.id === id)?.title ?? id).join("; ")}</p>
                      <p><strong>Framework mapping:</strong> {a.frameworkMappings.map((m) => `${m.frameworkId}: ${m.reference}`).join(" · ") || "—"}</p>
                      <p><strong>Version:</strong> {a.version} · about {a.estimatedMinutes} min · difficulty {a.difficulty}/3</p>
                      {a.adultSupervision && <p className="font-semibold text-try">Adult supervision: {a.adultSupervision}</p>}
                      {a.realWorldMission && <p>🏠 {a.realWorldMission}</p>}
                      {is.length > 0 && <ul className="mt-2 list-disc pl-5 text-try">{is.map((i, k) => <li key={k}>{i.level}: {i.message}</li>)}</ul>}
                    </div>
                    <div>
                      <p className="font-bold">Content to review</p>
                      <ol className="list-decimal pl-5">
                        {a.rounds.map((r, i) => <li key={r.id} className="mb-1">&ldquo;{(r as { prompt: string }).prompt}&rdquo;<br /><span className="text-ink-soft">{describeAnswer(a, i)}</span>{((r as { hints?: string[] }).hints?.length ?? 0) > 0 && <><br /><span className="text-ink-soft">Hints: {(r as { hints: string[] }).hints.join(" → ")}</span></>}</li>)}
                      </ol>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {a.reviewStatus !== "reviewed" && <PBtn onClick={() => setOverride(a, { reviewStatus: "reviewed" })}>Mark as reviewed</PBtn>}
                    {a.status === "draft" && <PBtn onClick={() => move(a, "validated")}>Validate</PBtn>}
                    {a.status === "validated" && <PBtn tone="primary" onClick={() => move(a, "published")}>Publish</PBtn>}
                    {a.status === "published" && <PBtn tone="danger" onClick={() => move(a, "retired")}>Retire</PBtn>}
                    {a.status === "retired" && <PBtn onClick={() => move(a, "validated")}>Restore (validated)</PBtn>}
                    {(a.status === "validated" || a.status === "retired") && <PBtn onClick={() => move(a, "draft")}>Back to draft</PBtn>}
                  </div>
                </details>
              );
            })}
          </div>
          <p className="mt-4 text-sm text-ink-soft">Publishing choices are saved in this browser. The activity content itself lives in the code (content/ folder) so it can be reviewed and tested.</p>
        </>
      )}

      {tab === "objectives" && (
        <div className="space-y-6">
          {DOMAINS.map((d) => (
            <section key={d.id} aria-labelledby={`d-${d.id}`}>
              <h2 id={`d-${d.id}`} className="text-xl font-extrabold">{d.name}</h2>
              <p className="mb-2 text-sm text-ink-soft">Progression: {d.progression.join(" → ")}</p>
              <div className="space-y-2">
                {OBJECTIVES.filter((o) => o.domain === d.id).map((o) => (
                  <details key={o.id} className="rounded-xl border-2 border-line bg-white p-3">
                    <summary className="cursor-pointer"><strong>{o.title}</strong> <span className="text-sm text-ink-soft">{o.id} · ages {AGE_BAND_INFO[o.ageBand].ages}</span> <Badge tone={o.status === "published" ? "good" : "neutral"}>{o.status === "published" ? "has activities" : "planned"}</Badge></summary>
                    <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                      <div><p>{o.description}</p><p className="mt-1"><strong>Prior knowledge:</strong> {o.priorKnowledge}</p><p><strong>Builds on:</strong> {o.prerequisites.join(", ") || "—"}</p><p><strong>Next steps:</strong> {o.nextSteps.join(", ") || "—"}</p></div>
                      <div><p><strong>Success looks like:</strong> {o.successCriteria.join("; ")}</p><p><strong>Common difficulties:</strong> {o.commonDifficulties.join("; ")}</p><p><strong>Framework mapping (learning-area level):</strong> {o.frameworkMappings.map((m) => `${m.frameworkId}: ${m.reference} (${m.mappingType})`).join(" · ")}</p></div>
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {tab === "sources" && (
        <div className="space-y-4">
          <p role="note" className="rounded-xl border-2 border-dashed border-amber-500 bg-amber-50 p-3 font-semibold">⚠️ Source verification is still <u>pending</u>. When this register was built, the sources could not be opened, so nothing here is claimed as reviewed. Please check each link before relying on these notes.</p>
          {FRAMEWORKS.map((f) => (
            <article key={f.id} className="rounded-2xl border-2 border-line bg-white p-4">
              <h2 className="text-lg font-extrabold">{f.name} <Badge tone={f.verificationStatus === "verified" ? "good" : "warn"}>{f.verificationStatus}</Badge></h2>
              <p className="text-sm text-ink-soft">{f.issuingOrganisation} · ages {f.ageRange} · reviewed: {f.reviewDate ?? "not yet"}</p>
              <p className="mt-1 text-sm"><a className="underline" href={f.officialSourceUrl} target="_blank" rel="noopener noreferrer">{f.officialSourceUrl}</a></p>
              <p className="mt-1 text-sm"><strong>Learning areas:</strong> {f.learningDomains.join("; ")}</p>
              <p className="text-sm"><strong>Principles:</strong> {f.learningPrinciples.join("; ")}</p>
              <p className="text-sm"><strong>Notes:</strong> {f.notes}</p>
              <p className="text-sm"><strong>How it informs the app:</strong> {f.appUse}</p>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
