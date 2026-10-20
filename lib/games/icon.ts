import type { Activity } from "./schema";
import { worldBySlug } from "@/content/worlds";

const firstGlyph = (s: string | undefined) => {
  if (!s) return undefined;
  const seg = new Intl.Segmenter(undefined, { granularity: "grapheme" });
  const g = [...seg.segment(s.trim())][0]?.segment;
  return g && /\p{Extended_Pictographic}/u.test(g) ? g : undefined;
};

/** A friendly picture for an activity card, taken from its own content. */
export function activityIcon(a: Activity): string {
  const r = a.rounds[0] as Record<string, unknown>;
  const opts = r.options as { visual: string }[] | undefined;
  const pairs = r.pairs as { left: { visual: string } }[] | undefined;
  const bins = r.bins as { visual: string }[] | undefined;
  const steps = r.steps as { visual: string }[] | undefined;
  return (
    firstGlyph(r.display as string) ?? firstGlyph(r.visual as string) ?? firstGlyph(opts?.[0]?.visual) ?? firstGlyph(pairs?.[0]?.left.visual) ??
    firstGlyph(bins?.[0]?.visual) ?? firstGlyph(steps?.[0]?.visual) ?? worldBySlug(a.world)?.emoji ?? "⭐"
  );
}
