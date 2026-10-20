-- Least privilege (migration 0003).
-- Supabase auto-grants ALL privileges on new tables to anon/authenticated (including TRUNCATE, which Row Level
-- Security does not govern). 0002 only added grants and revoked from anon, so `authenticated` kept extra rights.
-- This resets them to the minimum the app needs. Idempotent: safe on projects that already ran 0001/0002.
revoke all on public.learning_domains, public.curriculum_frameworks, public.learning_objectives, public.objective_prerequisites,
  public.objective_framework_mappings, public.activities, public.activity_objectives, public.child_profiles, public.activity_attempts,
  public.learning_progress, public.parent_settings, public.parent_activity_overrides from anon, authenticated;

grant select on public.learning_domains, public.curriculum_frameworks, public.learning_objectives, public.objective_prerequisites,
  public.objective_framework_mappings, public.activities, public.activity_objectives to authenticated;
grant select, insert, update, delete on public.child_profiles, public.activity_attempts, public.learning_progress,
  public.parent_settings, public.parent_activity_overrides to authenticated;
