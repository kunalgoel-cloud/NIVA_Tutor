import Link from "next/link";
import type { Activity } from "@/lib/games/schema";
import { activityIcon } from "@/lib/games/icon";

export function ActivityCard({ activity, played, suggested, showDuration }: { activity: Activity; played: boolean; suggested?: boolean; showDuration: boolean }) {
  return (
    <Link href={`/play/${activity.id}`} data-world={activity.world} data-testid="activity-card"
      aria-label={`${activity.title}${played ? ", played before" : ""}${suggested ? ", a good next choice" : ""}`}
      className="relative flex min-h-36 flex-col items-center justify-center gap-2 rounded-card border-2 border-white bg-[var(--w-bg)] p-4 text-center shadow-clay transition active:scale-[0.96]">
      {suggested && <span aria-hidden className="absolute -left-2 -top-2 grid size-10 place-items-center rounded-full bg-sun text-xl shadow-clay">✨</span>}
      {played && <span aria-hidden className="absolute -right-2 -top-2 grid size-9 place-items-center rounded-full bg-good text-lg font-black text-white">✓</span>}
      <span aria-hidden className="text-6xl leading-none">{activityIcon(activity)}</span>
      <span className="text-xl font-extrabold text-[var(--w-fg)]">{activity.title}</span>
      {showDuration && <span className="text-sm font-semibold text-[var(--w-fg)]/80">about {activity.estimatedMinutes} min</span>}
    </Link>
  );
}
