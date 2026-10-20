import Link from "next/link";
import type { World } from "@/content/worlds";
import { Character } from "@/components/characters/Character";
import { characterById } from "@/content/characters";

export function WorldCard({ world, count }: { world: World; count: number }) {
  const c = characterById(world.characterId);
  return (
    <Link href={`/worlds/${world.slug}`} data-world={world.slug} aria-label={`${world.name}. ${world.tagline}`}
      className="group relative flex min-h-44 items-center gap-4 overflow-hidden rounded-card border-2 border-white bg-[var(--w-bg)] p-5 shadow-clay transition active:scale-[0.97]">
      <div className="flex-1">
        <div aria-hidden className="text-4xl">{world.emoji}</div>
        <h2 className="text-2xl font-extrabold text-[var(--w-fg)] sm:text-3xl">{world.name}</h2>
        <p className="text-base font-semibold text-[var(--w-fg)]/80">{world.tagline}</p>
        <p className="sr-only">{count} activities</p>
      </div>
      <Character species={c.species} size={110} className="transition group-hover:scale-105" />
    </Link>
  );
}
