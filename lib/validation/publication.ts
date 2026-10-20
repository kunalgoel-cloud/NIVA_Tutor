import type { Activity } from "@/lib/games/schema";
import type { PublicationStatus, ReviewStatus } from "@/lib/curriculum/schema";
import { ActivitySchema } from "@/lib/games/schema";

export type StatusOverride = { status?: PublicationStatus; reviewStatus?: ReviewStatus };
export type Overrides = Record<string, StatusOverride>;

const ALLOWED: Record<PublicationStatus, PublicationStatus[]> = {
  draft: ["validated"],
  validated: ["published", "draft"],
  published: ["retired"],
  retired: ["validated", "draft"],
};

export function effectiveActivity(a: Activity, overrides: Overrides): Activity {
  const o = overrides[a.id];
  return o ? { ...a, status: o.status ?? a.status, reviewStatus: o.reviewStatus ?? a.reviewStatus } : a;
}

/** The only activities a child ever sees. */
export function isChildVisible(a: Activity): boolean {
  return a.status === "published" && a.reviewStatus === "reviewed";
}

export function canTransition(a: Activity, to: PublicationStatus, hasValidationErrors: boolean): { ok: boolean; reason?: string } {
  if (!ALLOWED[a.status].includes(to)) return { ok: false, reason: `Cannot move from ${a.status} to ${to}.` };
  if (to === "validated" || to === "published") {
    if (!ActivitySchema.safeParse(a).success || hasValidationErrors) return { ok: false, reason: "This activity has validation errors." };
  }
  if (to === "published" && a.reviewStatus !== "reviewed") return { ok: false, reason: "A parent must mark this activity as reviewed before publishing." };
  return { ok: true };
}
