"use client";
import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import { ChildShell } from "@/components/layout/ChildShell";
import { RequireProfile } from "@/components/layout/RequireProfile";
import { WorldCard } from "@/components/worlds/WorldCard";
import { WORLDS } from "@/content/worlds";

export default function WorldsHome() {
  const { freshActivities: visibleActivities, profile } = useApp();
  return (
    <RequireProfile>
      <ChildShell>
        <div className="flex flex-1 flex-col gap-6">
          <p className="text-center text-2xl font-bold">Hello{profile ? `, ${profile.nickname}` : ""}! Where shall we go? 🌈</p>
          <Link href="/today" id="todays-adventure" className="flex items-center justify-between gap-4 rounded-card bg-[var(--color-sun)] px-6 py-5 text-ink shadow-clay active:scale-[0.98]">
            <span className="flex flex-col"><span className="text-3xl font-extrabold">Today&apos;s Adventure</span><span className="text-lg font-semibold">A few games picked just for you</span></span>
            <span aria-hidden className="text-6xl">🗺️</span>
          </Link>
          <section aria-label="Learning worlds" className="grid gap-5 sm:grid-cols-2">
            {WORLDS.map((w) => <WorldCard key={w.slug} world={w} count={visibleActivities.filter((a) => a.world === w.slug).length} />)}
            <Link href="/explore" className="flex min-h-44 items-center justify-center gap-3 rounded-card border-2 border-dashed border-line bg-white/70 p-5 text-2xl font-extrabold shadow-clay active:scale-[0.97]">
              <span aria-hidden className="text-5xl">🔍</span> Explore freely
            </Link>
          </section>
        </div>
      </ChildShell>
    </RequireProfile>
  );
}
