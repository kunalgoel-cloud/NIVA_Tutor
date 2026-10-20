"use client";
import { use } from "react";
import { useApp } from "@/components/AppProvider";
import { ChildShell } from "@/components/layout/ChildShell";
import { RequireProfile } from "@/components/layout/RequireProfile";
import { ActivityRunner } from "@/components/games/ActivityRunner";
import { BigButton } from "@/components/ui/Button";
import { ActivitySchema } from "@/lib/games/schema";
import { isChildVisible } from "@/lib/validation/publication";

export default function PlayPage({ params }: { params: Promise<{ activityId: string }> }) {
  const { activityId } = use(params);
  return <RequireProfile><PlayInner id={activityId} /></RequireProfile>;
}

function PlayInner({ id }: { id: string }) {
  const { allActivities } = useApp();
  const activity = allActivities.find((a) => a.id === id);
  // Defence in depth: re-validate right before rendering. Bad or unpublished data gets a calm fallback.
  const valid = activity && isChildVisible(activity) && ActivitySchema.safeParse(activity).success;

  if (!activity || !valid) {
    return (
      <ChildShell title="Oops">
        <div role="alert" className="mx-auto mt-10 flex max-w-md flex-col items-center gap-4 rounded-card bg-white p-8 text-center shadow-clay" data-testid="unavailable">
          <p aria-hidden className="text-6xl">🧸</p>
          <p className="text-2xl font-bold">That game isn&apos;t ready to play.</p>
          <BigButton href="/worlds">Back to the worlds</BigButton>
        </div>
      </ChildShell>
    );
  }
  return (
    <ChildShell world={activity.world}>
      <ActivityRunner key={activity.id} activity={activity} backHref={`/worlds/${activity.world}`} />
    </ChildShell>
  );
}
