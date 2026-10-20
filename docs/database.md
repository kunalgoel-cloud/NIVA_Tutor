# Database (Supabase) — designed and tested, not yet wired into the app

The app currently stores data in the browser. The database is ready for when you want accounts and cross-device sync.

## Files
- `supabase/migrations/0001_init.sql` — tables, constraints, indexes
- `supabase/migrations/0002_rls.sql` — Row Level Security, privileges, `export_child_data()` and `delete_child_profile()`
- `supabase/seed.sql` — generated curriculum + activities (`npm run db:seed-sql`); safe to re-run

## Tables
Shared content (read-only to signed-in users): `learning_domains`, `curriculum_frameworks`, `learning_objectives`,
`objective_prerequisites`, `objective_framework_mappings`, `activities`, `activity_objectives`.
Private family data (RLS: a parent sees only their own): `child_profiles`, `activity_attempts`, `learning_progress`,
`parent_settings`, `parent_activity_overrides`.

## Changes from the original brief, and why
- Text ids (`MATH-CNT-01`, `count-the-apples`) instead of uuids, so git content and rows share one identifier.
- `objective_prerequisites` join table instead of an array, so foreign keys enforce it.
- `activities` gained `world`, `review_status`; a CHECK forbids *published but unreviewed*.
- `activity_attempts` gained `duration_seconds`, `rounds` (per-round evidence, never transcripts) and `parent_note`.
- `parent_activity_overrides` stores each parent's publish/retire/review choices.
- `child_profiles` has **no** date of birth, photo, school or address; nickname ≤ 24 characters.
- Deletion rules: deleting a parent or profile cascades to their private rows; activities/objectives that have attempts cannot be deleted (retire them).

## What was tested
`tests/integration/database-rls.test.ts` runs both migrations and the seed in **PGlite** (Postgres 18 compiled to WASM) with a stand-in for
Supabase's `auth` schema and verifies: parents see only their own rows; cannot update, delete or write onto another parent's child;
cannot give a profile away; anonymous users are denied everywhere; curriculum is read-only; export/delete only affect the caller;
cascade deletion; constraints. **Not tested:** a real Supabase project (Auth, PostgREST, storage).

## Setting it up (when you are ready)
1. Create a Supabase project (supabase.com). 2. Install the CLI and link: `supabase link --project-ref <your-ref>`.
3. `supabase db push` (applies the migrations). 4. Run `supabase/seed.sql` in the SQL editor. 5. Add the public URL/anon key to Vercel
env vars (see deployment guide). The `SupabaseRepository` itself still needs to be written (see checklist).
Never put the service-role key in the browser or in `NEXT_PUBLIC_` variables.

## Local storage limits (current mode)
Data lives in one browser on one device; it is not backed up or synced; clearing site data or private browsing erases it. Use
Grown-ups → Data & privacy → Download export for a copy. Migration path: write `SupabaseRepository implements Repository`, import an export file on first login.
