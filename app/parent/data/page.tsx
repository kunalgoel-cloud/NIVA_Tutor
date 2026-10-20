"use client";
import { useState } from "react";
import { useApp } from "@/components/AppProvider";
import { PBtn, Section } from "@/components/parent/ui";
import { defaultSettings } from "@/lib/parent/settings";
import { buildExport } from "@/lib/privacy/export";
import { STORAGE_KEY } from "@/lib/database/local-repository";

export default function DataPage() {
  const { data, profile, deleteProfile, resetDemo, seedDemoHistory, saveSettings, attempts } = useApp();
  const [target, setTarget] = useState(profile?.id ?? "");
  const [confirm, setConfirm] = useState("");
  const [allConfirm, setAllConfirm] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const chosen = data.profiles.find((p) => p.id === target) ?? profile ?? null;

  const download = () => {
    if (!chosen) return;
    const out = buildExport(data, chosen.id);
    if (!out) return;
    const blob = new Blob([JSON.stringify(out, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `little-wonder-world-export-${new Date().toISOString().slice(0, 10)}.json`; a.click();
    URL.revokeObjectURL(url);
    setMsg("Export downloaded. It contains this child's profile and play history, nothing else.");
  };
  const del = async () => {
    if (!chosen || confirm !== "DELETE") return;
    await deleteProfile(chosen.id); setConfirm(""); setMsg(`Deleted ${chosen.nickname} and their play history.`);
  };
  const delAll = async () => {
    if (allConfirm !== "DELETE") return;
    for (const p of data.profiles) await deleteProfile(p.id);
    await saveSettings(defaultSettings());
    try { Object.keys(localStorage).filter((k) => k.startsWith("lww:") && k !== STORAGE_KEY).forEach((k) => localStorage.removeItem(k)); } catch { /* ignore */ }
    setAllConfirm(""); setMsg("All profiles, history and settings on this device were deleted.");
  };

  return (
    <>
      <h1 className="mb-4 text-3xl font-extrabold">Data &amp; privacy</h1>
      {msg && <p role="status" className="mb-4 rounded-xl bg-emerald-50 px-4 py-2 font-semibold">{msg}</p>}
      <Section title="Where the data lives" id="where">
        <ul className="list-disc space-y-1 pl-5">
          <li>Profiles, play history and settings are stored <strong>only in this browser on this device</strong>. They are not backed up or synchronised anywhere.</li>
          <li>Clearing the browser&apos;s site data, or using private browsing, erases them. Use the export below to keep a copy.</li>
          <li>Voice recordings are never recorded. Conversation transcripts are never saved.</li>
          <li>Currently stored: {data.profiles.length} profile(s), {data.attempts.length} activity record(s) (older than {data.settings.privacy.retentionDays} days are removed automatically).</li>
        </ul>
      </Section>

      {data.profiles.length > 0 && (
        <Section title="Choose a profile" id="choose">
          <label className="flex max-w-sm flex-col gap-1 font-semibold">Profile
            <select value={chosen?.id ?? ""} onChange={(e) => setTarget(e.target.value)} className="min-h-11 rounded-lg border-2 border-line bg-white px-2">
              {data.profiles.map((p) => <option key={p.id} value={p.id}>{p.nickname}{p.isDemo ? " (demo)" : ""}</option>)}</select></label>
        </Section>
      )}

      <Section title="Export" id="export" hint="Download everything stored about one child as a JSON file you can keep or open in a spreadsheet tool.">
        <PBtn tone="primary" disabled={!chosen} onClick={download}>⬇ Download export</PBtn>
      </Section>

      <Section title="Demo data" id="demo" hint="Demo profiles hold fictional practice data so you can try the dashboard. They are never mixed with real profiles.">
        <div className="flex flex-wrap gap-3">
          <PBtn disabled={!chosen?.isDemo} onClick={async () => { if (chosen) { await seedDemoHistory(chosen.id); setMsg("Sample (fictional) history added to the demo profile."); } }}>Add sample history to demo profile</PBtn>
          <PBtn disabled={!data.profiles.some((p) => p.isDemo)} onClick={async () => { await resetDemo(); setMsg("Demo profile(s) and their data were removed. Real profiles were not touched."); }}>Reset demo data</PBtn>
        </div>
        {chosen && !chosen.isDemo && <p className="mt-2 text-sm text-ink-soft">Sample history can only be added to a demo profile, never to a real one.</p>}
      </Section>

      <Section title="Delete this profile" id="delete" hint={`Permanently removes ${chosen?.nickname ?? "the profile"} and all of their play history from this device. This cannot be undone.`}>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 font-semibold" htmlFor="del-confirm">Type DELETE to confirm
            <input id="del-confirm" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="off" className="min-h-11 rounded-lg border-2 border-line px-2" /></label>
          <PBtn tone="danger" disabled={!chosen || confirm !== "DELETE"} onClick={del}>Delete profile</PBtn>
        </div>
      </Section>

      <Section title="Delete everything on this device" id="delete-all" hint="Removes all profiles, history and settings (including the PIN).">
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 font-semibold" htmlFor="all-confirm">Type DELETE to confirm
            <input id="all-confirm" value={allConfirm} onChange={(e) => setAllConfirm(e.target.value)} autoComplete="off" className="min-h-11 rounded-lg border-2 border-line px-2" /></label>
          <PBtn tone="danger" disabled={allConfirm !== "DELETE"} onClick={delAll}>Delete everything</PBtn>
        </div>
      </Section>

      <Section title="Cloud storage (Supabase)" id="cloud">
        <p>Not connected yet. The database design and security rules are written in <code>supabase/migrations/</code>, but this version of the app does not use them. See <code>docs/database.md</code>.</p>
        <p className="mt-1 text-sm text-ink-soft">This profile has {attempts.length} activity record(s).</p>
      </Section>
    </>
  );
}
