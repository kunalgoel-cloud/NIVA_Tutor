// An in-memory STAND-IN for the supabase-js query builder (select/insert/update/upsert/delete + eq/in/lt/order/range).
// It lets us test OUR adapter logic. It does NOT test Supabase, RLS or the network (RLS is tested in database-rls.test.ts).
type Row = Record<string, unknown>;
type Filter = (r: Row) => boolean;

export function createFakeSupabase(opts: { failOn?: string } = {}) {
  const tables: Record<string, Row[]> = { child_profiles: [], activity_attempts: [], parent_settings: [], parent_activity_overrides: [] };
  const log: string[] = [];
  const hasId = (t: string) => t === "child_profiles" || t === "activity_attempts";
  const pk: Record<string, string[]> = { parent_settings: ["parent_user_id"], parent_activity_overrides: ["parent_user_id", "activity_id"] };

  class Q implements PromiseLike<{ data: unknown; error: { message: string } | null }> {
    private filters: Filter[] = []; private ord: { col: string; asc: boolean } | null = null; private rng: [number, number] | null = null;
    private single = false; private wantRows = false; private payload: unknown; private onConflict?: string;
    constructor(private table: string, private op: "select" | "insert" | "update" | "delete" | "upsert") {}
    select() { if (this.op !== "select") this.wantRows = true; return this; }
    insert(p: unknown) { this.op = "insert"; this.payload = p; return this; }
    update(p: unknown) { this.op = "update"; this.payload = p; return this; }
    upsert(p: unknown, o?: { onConflict?: string }) { this.op = "upsert"; this.payload = p; this.onConflict = o?.onConflict; return this; }
    delete() { this.op = "delete"; return this; }
    eq(c: string, v: unknown) { this.filters.push((r) => r[c] === v); return this; }
    in(c: string, vs: unknown[]) { this.filters.push((r) => vs.includes(r[c])); return this; }
    lt(c: string, v: string) { this.filters.push((r) => String(r[c]) < v); return this; }
    order(col: string, o?: { ascending?: boolean }) { this.ord = { col, asc: o?.ascending !== false }; return this; }
    range(a: number, b: number) { this.rng = [a, b]; return this; }
    maybeSingle() { this.single = true; return this; }
    then<A, B>(ok?: ((v: { data: unknown; error: { message: string } | null }) => A | PromiseLike<A>) | null, bad?: ((e: unknown) => B | PromiseLike<B>) | null) { return Promise.resolve(this.exec()).then(ok, bad); }

    private exec(): { data: unknown; error: { message: string } | null } {
      log.push(`${this.op} ${this.table}`);
      if (opts.failOn === this.table) return { data: null, error: { message: "boom" } };
      const rows = tables[this.table];
      const match = (r: Row) => this.filters.every((f) => f(r));
      if (this.op === "select") {
        let out = rows.filter(match);
        if (this.ord) { const { col, asc } = this.ord; out = [...out].sort((a, b) => (String(a[col]) < String(b[col]) ? -1 : 1) * (asc ? 1 : -1)); }
        if (this.rng) out = out.slice(this.rng[0], this.rng[1] + 1);
        return { data: this.single ? out[0] ?? null : out, error: null };
      }
      if (this.op === "insert") {
        const list = (Array.isArray(this.payload) ? this.payload : [this.payload]) as Row[];
        const added = list.map((r) => ({ ...(hasId(this.table) ? { id: crypto.randomUUID() } : {}), created_at: new Date().toISOString(), ...r }));
        rows.push(...added);
        return { data: this.wantRows ? added.map((r) => ({ id: r.id })) : null, error: null };
      }
      if (this.op === "upsert") {
        const keys = (this.onConflict ?? pk[this.table]?.join(",") ?? "id").split(",");
        for (const r of (Array.isArray(this.payload) ? this.payload : [this.payload]) as Row[]) {
          const i = rows.findIndex((x) => keys.every((k) => x[k] === r[k]));
          if (i >= 0) rows[i] = { ...rows[i], ...r }; else rows.push({ ...r });
        }
        return { data: null, error: null };
      }
      if (this.op === "update") { rows.filter(match).forEach((r) => Object.assign(r, this.payload)); return { data: null, error: null }; }
      // delete (with cascade for profiles, mirroring ON DELETE CASCADE)
      const gone = rows.filter(match);
      tables[this.table] = rows.filter((r) => !gone.includes(r));
      if (this.table === "child_profiles") tables.activity_attempts = tables.activity_attempts.filter((a) => !gone.some((g) => g.id === a.child_profile_id));
      return { data: null, error: null };
    }
  }
  const client = { from: (t: string) => ({ select: () => new Q(t, "select").select(), insert: (p: unknown) => new Q(t, "insert").insert(p), update: (p: unknown) => new Q(t, "update").update(p), upsert: (p: unknown, o?: { onConflict?: string }) => new Q(t, "upsert").upsert(p, o), delete: () => new Q(t, "delete").delete() }) };
  return { client, tables, log };
}
