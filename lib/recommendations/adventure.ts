// "Today's Adventure": a short, balanced set. Suggested, never mandatory.
import type { DomainSlug } from "@/lib/curriculum/schema";
import type { OfflineMission } from "@/content/offline-missions";
import { recommend, type RecommendContext, type Recommendation } from "./recommend";
import { progressMap } from "@/lib/learning/progress";
import { EVIDENCE_ORDER } from "@/lib/learning/types";

export type AdventureSlot = { key: "counting" | "chat" | "puzzle" | "story"; label: string; emoji: string; domains: DomainSlug[] };

export const ADVENTURE_SLOTS: AdventureSlot[] = [
  { key: "counting", label: "A counting game", emoji: "🔢", domains: ["mathematics"] },
  { key: "chat", label: "A little chat", emoji: "💬", domains: ["conversation", "spoken-english"] },
  { key: "puzzle", label: "A puzzle", emoji: "🧩", domains: ["logic-puzzles"] },
  { key: "story", label: "Story, nature or feelings", emoji: "🌈", domains: ["creativity-storytelling", "social-emotional", "early-literacy", "science-knowledge"] },
];

export type AdventurePlan = {
  items: { slot: AdventureSlot; pick: Recommendation }[];
  mission: { mission: OfflineMission; reason: string } | null;
  totalMinutes: number;
};

export function planAdventure(ctx: RecommendContext, missions: OfflineMission[], maxItems = 4): AdventurePlan {
  const used = new Set<string>();
  const items: AdventurePlan["items"] = [];
  const slots = ADVENTURE_SLOTS.slice(0, Math.max(2, Math.min(4, maxItems)));
  for (const slot of slots) {
    const ranked = recommend({ ...ctx, domains: slot.domains }).filter((r) => !used.has(r.activity.id));
    const pick = ranked[0];
    if (pick) { used.add(pick.activity.id); items.push({ slot, pick }); }
  }
  // Offline mission: prefer one linked to an objective that needs practice; rotate by day otherwise.
  const prog = progressMap([...new Set(missions.flatMap((m) => m.objectiveIds))], ctx.attempts.flatMap((a) => a.rounds));
  const dayNumber = Math.floor(ctx.now.getTime() / 86_400_000);
  const scored = missions.map((m, i) => {
    const need = Math.min(...m.objectiveIds.map((o) => EVIDENCE_ORDER.indexOf(prog[o]?.category ?? "not-introduced")));
    return { m, key: need * 100 + ((i - dayNumber) % missions.length + missions.length) % missions.length };
  }).sort((a, b) => a.key - b.key || a.m.id.localeCompare(b.m.id));
  const best = scored[0]?.m;
  return {
    items,
    mission: best ? { mission: best, reason: "A real-world activity linked to something your child is practising. It is a suggestion, separate from the games." } : null,
    totalMinutes: items.reduce((n, i) => n + i.pick.activity.estimatedMinutes, 0),
  };
}
