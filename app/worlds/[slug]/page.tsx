"use client";
import { use } from "react";
import { notFound } from "next/navigation";
import { useApp } from "@/components/AppProvider";
import { ChildShell } from "@/components/layout/ChildShell";
import { RequireProfile } from "@/components/layout/RequireProfile";
import { ActivityCard } from "@/components/worlds/ActivityCard";
import { Character } from "@/components/characters/Character";
import { BigButton } from "@/components/ui/Button";
import { worldBySlug } from "@/content/worlds";
import { characterById } from "@/content/characters";
import { ageBandIndex } from "@/lib/curriculum/schema";

export default function WorldPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const world = worldBySlug(slug);
  if (!world) notFound();
  return <RequireProfile><WorldInner slug={world.slug} /></RequireProfile>;
}

function WorldInner({ slug }: { slug: string }) {
  const { visibleActivities, profile, attempts, settings, recommendations } = useApp();
  const world = worldBySlug(slug)!;
  const character = characterById(world.characterId);
  const band = ageBandIndex(profile?.ageBand ?? "little-explorer");
  const list = visibleActivities.filter((a) => a.world === slug && ageBandIndex(a.ageBand) <= band);
  const played = new Set(attempts.map((a) => a.activityId));
  const top = recommendations().find((r) => r.activity.world === slug)?.activity.id;
  const sorted = [...list].sort((a, b) => (a.id === top ? -1 : b.id === top ? 1 : a.title.localeCompare(b.title)));

  return (
    <ChildShell world={slug} title={world.name}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4 rounded-card bg-[var(--w-bg)] p-5 shadow-clay">
          <Character species={character.species} size={110} mood="cheer" label={character.name} />
          <p className="text-xl font-bold text-[var(--w-fg)]">{world.description}</p>
        </div>
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-card bg-white p-8 text-center shadow-clay" data-testid="empty-world">
            <p className="text-5xl" aria-hidden>🌱</p>
            <p className="text-xl font-bold">New games are growing here soon!</p>
            <BigButton href="/worlds">Back to the worlds</BigButton>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3" role="list" aria-label={`${world.name} games`}>
            {sorted.map((a) => <div key={a.id} role="listitem"><ActivityCard activity={a} played={played.has(a.id)} suggested={a.id === top} showDuration={settings.session.showDurations} /></div>)}
          </div>
        )}
      </div>
    </ChildShell>
  );
}
