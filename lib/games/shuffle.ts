// Deterministic shuffle (seeded) so answer positions vary but a session is stable across re-renders.
export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function seededShuffle<T>(items: readonly T[], seed: string): T[] {
  const rnd = mulberry32(hashString(seed));
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
/** Shuffle that guarantees the result differs from the input order when possible (for "put in order" tasks). */
export function shuffleDifferent<T>(items: readonly T[], seed: string): T[] {
  if (items.length < 2) return [...items];
  for (let n = 0; n < 8; n++) {
    const s = seededShuffle(items, `${seed}:${n}`);
    if (s.some((x, i) => x !== items[i])) return s;
  }
  return [...items].reverse();
}
