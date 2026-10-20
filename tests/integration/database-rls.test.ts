// Runs the REAL SQL migrations + generated seed in an in-process Postgres (PGlite) and verifies
// Row Level Security, constraints and cascade deletion. A tiny stand-in for Supabase's auth schema is created.
import { beforeAll, describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { ACTIVITIES, OBJECTIVES } from "@/content";

const root = path.join(process.cwd(), "supabase");
const sql = (f: string) => fs.readFileSync(path.join(root, f), "utf8");
const A = "00000000-0000-4000-8000-00000000000a";
const B = "00000000-0000-4000-8000-00000000000b";

let db: PGlite;
const as = async (role: "anon" | "authenticated" | "postgres", uid?: string) => {
  await db.exec("reset role");
  if (uid) await db.exec(`select set_config('request.jwt.claim.sub', '${uid}', false)`);
  else await db.exec(`select set_config('request.jwt.claim.sub', '', false)`);
  if (role !== "postgres") await db.exec(`set role ${role}`);
};
const fails = async (q: string, pattern: RegExp) => { await expect(db.query(q)).rejects.toThrow(pattern); };
const insertChild = (uid: string, nick = "Kid") => db.query<{ id: string }>(`insert into public.child_profiles (parent_user_id, nickname, age_band) values ('${uid}', '${nick}', 'little-explorer') returning id`);
const insertAttempt = (child: string) => db.query(`insert into public.activity_attempts (child_profile_id, activity_id, activity_version, objective_id, outcome, assistance_level, completion_status) values ('${child}', 'count-the-apples', 1, 'MATH-CNT-01', 'independent', 'none', 'completed')`);

beforeAll(async () => {
  db = new PGlite();
  await db.exec(`
    create schema auth;
    create table auth.users (id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    create role anon nologin; create role authenticated nologin;
    grant usage on schema public, auth to anon, authenticated;
    grant execute on function auth.uid() to anon, authenticated;
    insert into auth.users values ('${A}'), ('${B}');
  `);
  await db.exec(sql("migrations/0001_init.sql"));
  await db.exec(sql("migrations/0002_rls.sql"));
  await db.exec(sql("seed.sql"));
}, 120_000);

describe("migrations and seed", () => {
  it("loads all curriculum content", async () => {
    await as("postgres");
    expect((await db.query<{ n: number }>("select count(*)::int n from public.activities")).rows[0].n).toBe(ACTIVITIES.length);
    expect((await db.query<{ n: number }>("select count(*)::int n from public.learning_objectives")).rows[0].n).toBe(OBJECTIVES.length);
    expect((await db.query<{ n: number }>("select count(*)::int n from public.activity_objectives where is_primary")).rows[0].n).toBe(ACTIVITIES.length);
  });
  it("seed is idempotent (safe to re-run)", async () => {
    await as("postgres");
    await db.exec(sql("seed.sql"));
    expect((await db.query<{ n: number }>("select count(*)::int n from public.activities")).rows[0].n).toBe(ACTIVITIES.length);
  });
  it("source verification stays pending in the database too", async () => {
    await as("postgres");
    const r = await db.query<{ n: number }>("select count(*)::int n from public.curriculum_frameworks where verification_status = 'pending' and review_date is null");
    expect(r.rows[0].n).toBe(7);
  });
});

describe("Row Level Security", () => {
  let childA = "";
  beforeAll(async () => {
    await as("authenticated", A);
    childA = (await insertChild(A, "A-kid")).rows[0].id;
    await insertAttempt(childA);
    await db.query(`insert into public.learning_progress (child_profile_id, objective_id, evidence_category) values ('${childA}', 'MATH-CNT-01', 'introduced')`);
    await db.query(`insert into public.parent_settings (parent_user_id) values ('${A}')`);
  });

  it("a parent sees their own child, attempts, progress and settings", async () => {
    await as("authenticated", A);
    expect((await db.query("select * from public.child_profiles")).rows).toHaveLength(1);
    expect((await db.query("select * from public.activity_attempts")).rows).toHaveLength(1);
    expect((await db.query("select * from public.learning_progress")).rows).toHaveLength(1);
    expect((await db.query("select * from public.parent_settings")).rows).toHaveLength(1);
  });
  it("another parent sees nothing of it", async () => {
    await as("authenticated", B);
    for (const t of ["child_profiles", "activity_attempts", "learning_progress", "parent_settings"])
      expect((await db.query(`select * from public.${t}`)).rows, t).toHaveLength(0);
  });
  it("another parent cannot read, update or delete the child by id", async () => {
    await as("authenticated", B);
    expect((await db.query(`select * from public.child_profiles where id = '${childA}'`)).rows).toHaveLength(0);
    expect((await db.query(`update public.child_profiles set nickname = 'hacked' where id = '${childA}' returning id`)).rows).toHaveLength(0);
    expect((await db.query(`delete from public.child_profiles where id = '${childA}' returning id`)).rows).toHaveLength(0);
    await as("postgres");
    expect((await db.query<{ nickname: string }>(`select nickname from public.child_profiles where id = '${childA}'`)).rows[0].nickname).toBe("A-kid");
  });
  it("another parent cannot write attempts or progress onto someone else's child", async () => {
    await as("authenticated", B);
    await fails(`insert into public.activity_attempts (child_profile_id, activity_id, activity_version, objective_id, outcome, assistance_level, completion_status) values ('${childA}', 'count-the-apples', 1, 'MATH-CNT-01', 'independent', 'none', 'completed')`, /row-level security/);
    await fails(`insert into public.learning_progress (child_profile_id, objective_id, evidence_category) values ('${childA}', 'MATH-CNT-02', 'introduced')`, /row-level security/);
  });
  it("a parent cannot create a profile owned by someone else", async () => {
    await as("authenticated", B);
    await fails(`insert into public.child_profiles (parent_user_id, nickname, age_band) values ('${A}', 'sneaky', 'little-explorer')`, /row-level security/);
  });
  it("a parent cannot hand their child's profile to another parent", async () => {
    await as("authenticated", A);
    await fails(`update public.child_profiles set parent_user_id = '${B}' where id = '${childA}'`, /row-level security/);
  });
  it("anonymous users get nothing: private and curriculum tables are both denied", async () => {
    await as("anon");
    for (const t of ["child_profiles", "activity_attempts", "learning_progress", "parent_settings", "activities", "learning_objectives"])
      await fails(`select * from public.${t}`, /permission denied/);
  });
  it("signed-in users can read but not edit shared curriculum content", async () => {
    await as("authenticated", A);
    expect((await db.query("select id from public.activities")).rows.length).toBe(ACTIVITIES.length);
    await fails(`update public.activities set title = 'x' where id = 'count-the-apples'`, /permission denied/);
    await fails(`insert into public.learning_domains (id,name,slug,description,display_order) values ('x','x','x','x',1)`, /permission denied/);
  });
  it("export returns only the caller's own child, and nothing for someone else's", async () => {
    await as("authenticated", A);
    const own = (await db.query<{ e: { profile: { nickname: string }; attempts: unknown[]; progress: unknown[] } }>(`select public.export_child_data('${childA}') e`)).rows[0].e;
    expect(own.profile.nickname).toBe("A-kid");
    expect(own.attempts).toHaveLength(1);
    expect(own.progress).toHaveLength(1);
    await as("authenticated", B);
    const other = (await db.query<{ e: { profile: unknown; attempts: unknown[] } }>(`select public.export_child_data('${childA}') e`)).rows[0].e;
    expect(other.profile).toBeNull();
    expect(other.attempts).toHaveLength(0);
  });
  it("deleting a profile erases its attempts and progress", async () => {
    await as("authenticated", B);
    const bKid = (await insertChild(B, "B-kid")).rows[0].id;
    await insertAttempt(bKid);
    await as("authenticated", A);
    await db.query(`select public.delete_child_profile('${bKid}')`); // not A's child: no effect
    await as("authenticated", B);
    expect((await db.query("select * from public.activity_attempts")).rows).toHaveLength(1);
    await db.query(`select public.delete_child_profile('${bKid}')`);
    expect((await db.query("select * from public.child_profiles")).rows).toHaveLength(0);
    expect((await db.query("select * from public.activity_attempts")).rows).toHaveLength(0);
    await as("postgres");
    expect((await db.query<{ n: number }>(`select count(*)::int n from public.activity_attempts where child_profile_id = '${bKid}'`)).rows[0].n).toBe(0);
  });
});

describe("data constraints", () => {
  it("rejects unreviewed content that is marked published", async () => {
    await as("postgres");
    await fails(`update public.activities set status = 'published', review_status = 'unreviewed' where id = 'count-the-apples'`, /check constraint/);
  });
  it("keeps nicknames short and non-empty, and age bands valid", async () => {
    await as("authenticated", A);
    await fails(`insert into public.child_profiles (parent_user_id, nickname, age_band) values ('${A}', '${"x".repeat(25)}', 'little-explorer')`, /check constraint/);
    await fails(`insert into public.child_profiles (parent_user_id, nickname, age_band) values ('${A}', '', 'little-explorer')`, /check constraint/);
    await fails(`insert into public.child_profiles (parent_user_id, nickname, age_band) values ('${A}', 'ok', 'toddler')`, /check constraint/);
  });
  it("has no column that could hold a date of birth, address or photo", async () => {
    await as("postgres");
    const cols = (await db.query<{ column_name: string }>(`select column_name from information_schema.columns where table_name = 'child_profiles'`)).rows.map((r) => r.column_name);
    expect(cols.sort()).toEqual(["age_band", "created_at", "id", "is_demo", "nickname", "parent_user_id", "preferences"]);
  });
  it("allows only one primary objective per activity", async () => {
    await as("postgres");
    await fails(`insert into public.activity_objectives (activity_id, objective_id, is_primary) values ('count-the-apples', 'MATH-CNT-02', true)`, /unique|duplicate/);
  });
  it("blocks deleting a published activity that has attempts (evidence integrity)", async () => {
    await as("authenticated", A);
    await as("postgres");
    await fails(`delete from public.activities where id = 'count-the-apples'`, /foreign key|violates/);
  });
});
