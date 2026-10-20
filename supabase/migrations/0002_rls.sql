-- Row Level Security (migration 0002).
-- Rule of thumb: a signed-in parent can see and change ONLY their own family's rows.
-- Curriculum content is readable by signed-in users and writable only with the service role (server/migrations).
-- Policies use (select auth.uid()) so Postgres evaluates it once per statement (Supabase performance advice).

-- ---------- Curriculum (shared, read-only for clients) ----------
alter table public.learning_domains            enable row level security;
alter table public.curriculum_frameworks       enable row level security;
alter table public.learning_objectives         enable row level security;
alter table public.objective_prerequisites     enable row level security;
alter table public.objective_framework_mappings enable row level security;
alter table public.activities                  enable row level security;
alter table public.activity_objectives         enable row level security;

create policy "curriculum readable by signed-in users" on public.learning_domains for select to authenticated using (true);
create policy "curriculum readable by signed-in users" on public.curriculum_frameworks for select to authenticated using (true);
create policy "curriculum readable by signed-in users" on public.learning_objectives for select to authenticated using (true);
create policy "curriculum readable by signed-in users" on public.objective_prerequisites for select to authenticated using (true);
create policy "curriculum readable by signed-in users" on public.objective_framework_mappings for select to authenticated using (true);
create policy "curriculum readable by signed-in users" on public.activity_objectives for select to authenticated using (true);
-- Children only ever see published content; parents see everything to manage it.
create policy "activities readable by signed-in users" on public.activities for select to authenticated using (true);

-- ---------- Private family data ----------
alter table public.child_profiles            enable row level security;
alter table public.activity_attempts         enable row level security;
alter table public.learning_progress         enable row level security;
alter table public.parent_settings           enable row level security;
alter table public.parent_activity_overrides enable row level security;

create policy "parents manage their own children" on public.child_profiles
  for all to authenticated
  using (parent_user_id = (select auth.uid()))
  with check (parent_user_id = (select auth.uid()));

create policy "parents manage attempts of their own children" on public.activity_attempts
  for all to authenticated
  using (exists (select 1 from public.child_profiles c where c.id = child_profile_id and c.parent_user_id = (select auth.uid())))
  with check (exists (select 1 from public.child_profiles c where c.id = child_profile_id and c.parent_user_id = (select auth.uid())));

create policy "parents manage progress of their own children" on public.learning_progress
  for all to authenticated
  using (exists (select 1 from public.child_profiles c where c.id = child_profile_id and c.parent_user_id = (select auth.uid())))
  with check (exists (select 1 from public.child_profiles c where c.id = child_profile_id and c.parent_user_id = (select auth.uid())));

create policy "parents manage their own settings" on public.parent_settings
  for all to authenticated
  using (parent_user_id = (select auth.uid()))
  with check (parent_user_id = (select auth.uid()));

create policy "parents manage their own overrides" on public.parent_activity_overrides
  for all to authenticated
  using (parent_user_id = (select auth.uid()))
  with check (parent_user_id = (select auth.uid()));

-- ---------- Table privileges ----------
-- Nobody anonymous touches anything. (RLS is the lock; revoking grants is the second lock.)
-- Scoped to this app's tables so it is safe in a Supabase project that also holds other data.
revoke all on public.learning_domains, public.curriculum_frameworks, public.learning_objectives, public.objective_prerequisites,
  public.objective_framework_mappings, public.activities, public.activity_objectives, public.child_profiles, public.activity_attempts,
  public.learning_progress, public.parent_settings, public.parent_activity_overrides from anon;
grant select on public.learning_domains, public.curriculum_frameworks, public.learning_objectives, public.objective_prerequisites,
               public.objective_framework_mappings, public.activities, public.activity_objectives to authenticated;
grant select, insert, update, delete on public.child_profiles, public.activity_attempts, public.learning_progress,
               public.parent_settings, public.parent_activity_overrides to authenticated;

-- ---------- Export and deletion helpers (run as the signed-in parent, so RLS still applies) ----------
create or replace function public.export_child_data(p_child_id uuid) returns jsonb
language sql stable security invoker set search_path = public as $$
  select jsonb_build_object(
    'format', 'little-wonder-world-export/1',
    'exported_at', now(),
    'profile', (select to_jsonb(c) from public.child_profiles c where c.id = p_child_id),
    'attempts', coalesce((select jsonb_agg(to_jsonb(a) order by a.occurred_at) from public.activity_attempts a where a.child_profile_id = p_child_id), '[]'::jsonb),
    'progress', coalesce((select jsonb_agg(to_jsonb(p)) from public.learning_progress p where p.child_profile_id = p_child_id), '[]'::jsonb)
  )
$$;

-- Deleting a profile cascades to its attempts and progress (foreign keys, on delete cascade).
create or replace function public.delete_child_profile(p_child_id uuid) returns void
language sql security invoker set search_path = public as $$
  delete from public.child_profiles where id = p_child_id
$$;

revoke all on function public.export_child_data(uuid), public.delete_child_profile(uuid) from public, anon;
grant execute on function public.export_child_data(uuid), public.delete_child_profile(uuid) to authenticated;
