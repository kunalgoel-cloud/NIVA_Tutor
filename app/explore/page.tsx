"use client";
import { useState } from "react";
import { useApp } from "@/components/AppProvider";
import { ChildShell } from "@/components/layout/ChildShell";
import { RequireProfile } from "@/components/layout/RequireProfile";
import { ActivityCard } from "@/components/worlds/ActivityCard";
import { WORLDS } from "@/content/worlds";
import { ageBandIndex } from "@/lib/curriculum/schema";

export default function ExplorePage() {
  return <RequireProfile><ExploreInner /></RequireProfile>;
}

function ExploreInner() {
  const { visibleActivities, profile, attempts, settings } = useApp();
  const [world, setWorld] = useState<string>("all");
  const band = ageBandIndex(profile?.ageBand ?? "little-explorer");
  const played = new Set(attempts.map((a) => a.activityId));
  const list = visibleActivities.filter((a) => ageBandIndex(a.ageBand) <= band && (world === "all" || a.world === world));
  return (
    <ChildShell title="Explore freely">
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Choose a world">
          {[{ slug: "all", emoji: "🌈", name: "All" }, ...WORLDS].map((w) => (
            <button key={w.slug} type="button" aria-pressed={world === w.slug} onClick={() => setWorld(w.slug)}
              className={`tap rounded-full border-2 px-4 text-lg font-bold ${world === w.slug ? "border-ink bg-ink text-white" : "border-line bg-white"}`}>
              <span aria-hidden>{w.emoji} </span>{w.name}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {list.map((a) => <ActivityCard key={a.id} activity={a} played={played.has(a.id)} showDuration={settings.session.showDurations} />)}
        </div>
        {list.length === 0 && <p className="text-center text-xl font-bold text-ink-soft">Nothing here yet.</p>}
      </div>
    </ChildShell>
  );
}
