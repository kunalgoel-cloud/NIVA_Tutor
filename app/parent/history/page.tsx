"use client";
import { useMemo, useState } from "react";
import { useApp } from "@/components/AppProvider";
import { Badge, PBtn } from "@/components/parent/ui";
import { DOMAINS, OBJECTIVES } from "@/content";
import type { DomainSlug } from "@/lib/curriculum/schema";
import type { ActivityAttempt } from "@/lib/learning/types";
import { filterAttempts, OUTCOME_LABEL, type HistoryFilters } from "@/lib/parent/summary";

export default function HistoryPage() {
  const { attempts, allActivities, addNote } = useApp();
  const [f, setF] = useState<HistoryFilters>({ from: "", to: "", domain: "", activityId: "", outcome: "" });
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const rows = useMemo(() => filterAttempts(attempts, allActivities, f), [attempts, allActivities, f]);
  const title = (id: string) => allActivities.find((a) => a.id === id)?.title ?? id;
  const set = <K extends keyof HistoryFilters>(k: K, v: HistoryFilters[K]) => setF((x) => ({ ...x, [k]: v }));
  const field = "min-h-11 rounded-lg border-2 border-line bg-white px-2";

  return (
    <>
      <h1 className="mb-4 text-3xl font-extrabold">Activity history</h1>
      <form className="mb-4 grid gap-3 rounded-2xl bg-white p-4 sm:grid-cols-3 lg:grid-cols-5" aria-label="Filters" onSubmit={(e) => e.preventDefault()}>
        <label className="flex flex-col gap-1 font-semibold">From<input type="date" className={field} value={f.from} onChange={(e) => set("from", e.target.value)} /></label>
        <label className="flex flex-col gap-1 font-semibold">To<input type="date" className={field} value={f.to} onChange={(e) => set("to", e.target.value)} /></label>
        <label className="flex flex-col gap-1 font-semibold">Area
          <select className={field} value={f.domain} onChange={(e) => set("domain", e.target.value as DomainSlug | "")}><option value="">All</option>{DOMAINS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></label>
        <label className="flex flex-col gap-1 font-semibold">Activity
          <select className={field} value={f.activityId} onChange={(e) => set("activityId", e.target.value)}><option value="">All</option>{allActivities.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}</select></label>
        <label className="flex flex-col gap-1 font-semibold">Outcome
          <select className={field} value={f.outcome} onChange={(e) => set("outcome", e.target.value as ActivityAttempt["outcome"] | "")}><option value="">All</option>{(Object.keys(OUTCOME_LABEL) as ActivityAttempt["outcome"][]).map((o) => <option key={o} value={o}>{OUTCOME_LABEL[o]}</option>)}</select></label>
      </form>
      <p className="mb-2 text-sm text-ink-soft" role="status">{rows.length} of {attempts.length} activities shown</p>
      {rows.length === 0 ? <p className="rounded-xl bg-white p-4">Nothing matches these filters.</p> : (
        <div className="overflow-x-auto rounded-2xl border-2 border-line bg-white">
          <table className="w-full min-w-[720px] text-left">
            <caption className="sr-only">Activity history</caption>
            <thead className="bg-cream text-sm"><tr><th className="p-3">Date</th><th className="p-3">Activity</th><th className="p-3">Goal</th><th className="p-3">Outcome</th><th className="p-3">Hints</th><th className="p-3">Note</th></tr></thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id} className="border-t border-line align-top">
                  <td className="p-3 whitespace-nowrap">{new Date(a.occurredAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</td>
                  <td className="p-3 font-semibold">{title(a.activityId)}{a.completionStatus === "exited-early" && <Badge>stopped early</Badge>}</td>
                  <td className="p-3 text-sm">{OBJECTIVES.find((o) => o.id === a.objectiveId)?.title ?? a.objectiveId}</td>
                  <td className="p-3 text-sm">{OUTCOME_LABEL[a.outcome]}</td>
                  <td className="p-3">{a.hintCount}</td>
                  <td className="p-3 text-sm">
                    {editing === a.id ? (
                      <form onSubmit={async (e) => { e.preventDefault(); await addNote(a.id, draft); setEditing(null); }} className="flex flex-col gap-2">
                        <label className="sr-only" htmlFor={`note-${a.id}`}>Observation note</label>
                        <textarea id={`note-${a.id}`} value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={300} rows={2} className="rounded-lg border-2 border-line p-2" />
                        <span className="flex gap-2"><PBtn type="submit" tone="primary">Save</PBtn><PBtn onClick={() => setEditing(null)}>Cancel</PBtn></span>
                      </form>
                    ) : (
                      <>{a.parentNote ?? <span className="text-ink-soft">—</span>} <button type="button" className="underline" onClick={() => { setEditing(a.id); setDraft(a.parentNote ?? ""); }}>{a.parentNote ? "Edit" : "Add note"}</button></>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3 text-sm text-ink-soft">Notes are optional observations you add yourself. Avoid names or other identifying details.</p>
    </>
  );
}
