"use client";
import { useMemo } from "react";
import { useApp } from "@/components/AppProvider";
import { ChildShell } from "@/components/layout/ChildShell";
import { RequireProfile } from "@/components/layout/RequireProfile";
import { ActivityCard } from "@/components/worlds/ActivityCard";
import { BigButton } from "@/components/ui/Button";

export default function TodayPage() {
  return <RequireProfile><TodayInner /></RequireProfile>;
}

function TodayInner() {
  const { adventure, attempts, settings } = useApp();
  const plan = useMemo(() => adventure(), [adventure]);
  const today = new Date().toISOString().slice(0, 10);
  const playedToday = new Set(attempts.filter((a) => a.occurredAt.startsWith(today)).map((a) => a.activityId));

  return (
    <ChildShell title="Today's Adventure">
      <div className="flex flex-col gap-6">
        <p className="text-center text-xl font-semibold text-ink-soft">Pick any of these, in any order. Stop whenever you like! 🌟</p>
        {plan.items.length === 0 ? (
          <div className="rounded-card bg-white p-8 text-center shadow-clay" data-testid="empty-adventure">
            <p className="text-5xl" aria-hidden>🌱</p>
            <p className="text-xl font-bold">No adventure is ready yet.</p>
            <p className="mt-1 text-ink-soft">A grown-up can check the activity library.</p>
          </div>
        ) : (
          <ol className="grid grid-cols-2 gap-5 sm:grid-cols-4" aria-label="Adventure activities">
            {plan.items.map(({ slot, pick }) => (
              <li key={pick.activity.id} className="flex flex-col items-center gap-2">
                <span className="rounded-full bg-white px-3 py-1 text-sm font-bold shadow-clay"><span aria-hidden>{slot.emoji} </span>{slot.label}</span>
                <ActivityCard activity={pick.activity} played={playedToday.has(pick.activity.id)} showDuration={settings.session.showDurations} />
              </li>
            ))}
          </ol>
        )}
        {plan.mission && (
          <aside className="flex items-start gap-4 rounded-card border-2 border-dashed border-line bg-white/80 p-5" aria-label="Grown-up mission">
            <span aria-hidden className="text-5xl">🏠</span>
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-ink-soft">Optional mission with a grown-up (not a game)</p>
              <p className="text-xl font-extrabold">{plan.mission.mission.title}</p>
              <p className="text-lg font-semibold">{plan.mission.mission.description}</p>
              {plan.mission.mission.supervision && <p className="mt-1 text-sm font-semibold text-try">Adult supervision: {plan.mission.mission.supervision}</p>}
            </div>
          </aside>
        )}
        <div className="flex justify-center gap-4"><BigButton variant="soft" href="/explore">🔍 Explore freely instead</BigButton></div>
      </div>
    </ChildShell>
  );
}
