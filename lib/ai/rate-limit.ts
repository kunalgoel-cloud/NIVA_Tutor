// Small in-memory sliding-window limiter. On serverless hosts each instance has its own memory, so this is a
// best-effort guard, not a hard quota (see docs/known-limitations.md). Provider-side spend limits are the real cap.
export function createRateLimiter(limit: number, windowMs: number, now: () => number = Date.now) {
  const hits = new Map<string, number[]>();
  return {
    check(key: string): { allowed: boolean; retryAfterSeconds: number } {
      const t = now();
      const recent = (hits.get(key) ?? []).filter((x) => t - x < windowMs);
      if (recent.length >= limit) {
        hits.set(key, recent);
        return { allowed: false, retryAfterSeconds: Math.ceil((windowMs - (t - recent[0])) / 1000) };
      }
      recent.push(t);
      hits.set(key, recent);
      if (hits.size > 5000) for (const [k, v] of hits) if (v.every((x) => t - x >= windowMs)) hits.delete(k);
      return { allowed: true, retryAfterSeconds: 0 };
    },
  };
}
