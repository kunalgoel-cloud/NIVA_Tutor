"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/components/AppProvider";

const NAV = [
  { href: "/parent", label: "Overview" },
  { href: "/parent/progress", label: "Progress" },
  { href: "/parent/history", label: "History" },
  { href: "/parent/library", label: "Library" },
  { href: "/parent/settings", label: "Settings" },
  { href: "/parent/data", label: "Data & privacy" },
];

export function ParentShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { profile, storageError, data, setActiveProfile } = useApp();
  return (
    <div className="mx-auto min-h-dvh max-w-6xl px-4 pb-16 pt-4 text-[17px] sm:px-8">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-line pb-3">
        <Link href="/parent" className="inline-flex min-h-11 items-center text-xl font-extrabold">Little Wonder World <span className="font-semibold text-ink-soft">· Grown-ups</span></Link>
        <div className="flex flex-wrap items-center gap-3">
          {data.profiles.length > 1 && (
            <label className="flex items-center gap-2 text-sm font-semibold">Child
              <select value={profile?.id ?? ""} onChange={(e) => void setActiveProfile(e.target.value)} className="min-h-11 rounded-lg border-2 border-line bg-white px-2">
                {data.profiles.map((p) => <option key={p.id} value={p.id}>{p.nickname}{p.isDemo ? " (demo)" : ""}</option>)}
              </select>
            </label>
          )}
          <Link href="/worlds" className="tap inline-flex items-center rounded-full bg-ink px-5 font-bold text-white">Back to child view</Link>
        </div>
      </header>
      <nav aria-label="Grown-ups sections" className="my-4 flex flex-wrap gap-2">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} aria-current={path === n.href ? "page" : undefined}
            className={`inline-flex min-h-11 items-center rounded-full border-2 px-4 font-semibold ${path === n.href ? "border-ink bg-ink text-white" : "border-line bg-white hover:bg-cream"}`}>{n.label}</Link>
        ))}
      </nav>
      {profile?.isDemo && (
        <p role="note" className="mb-4 rounded-xl border-2 border-dashed border-grape bg-violet-50 px-4 py-2 font-semibold" data-testid="demo-banner">
          🧪 Demo profile: everything here is fictional practice data. It is kept separate from real profiles and you can reset it in Data &amp; privacy.
        </p>
      )}
      {storageError && <p role="alert" className="mb-4 rounded-xl bg-sun/40 px-4 py-2 font-semibold">{storageError}</p>}
      {!profile && <p className="mb-4 rounded-xl bg-white px-4 py-3 font-semibold">No child profile yet. <Link href="/parent/setup" className="underline">Set one up</Link>.</p>}
      {children}
    </div>
  );
}
