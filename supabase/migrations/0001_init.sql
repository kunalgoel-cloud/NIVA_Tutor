-- Little Wonder World: initial schema (versioned migration 0001)
-- Curriculum tables hold shared, non-private reference content.
-- Family tables (child_profiles, activity_attempts, learning_progress, parent_settings, ...) hold private data
-- and are locked down by Row Level Security in 0002_rls.sql.
--
-- Differences from the original brief (documented in docs/database.md):
--  * Curriculum/activity ids are readable text ids (e.g. 'MATH-CNT-01', 'count-the-apples'), not uuids, so
--    content in git and rows in the database share one stable identifier.
--  * learning_objectives.prerequisites became a join table (objective_prerequisites) so foreign keys can enforce it.
--  * activities gained world, review_status and age_band; activity_attempts gained duration_seconds, rounds, parent_note.
--  * parent_activity_overrides stores each parent's publish/retire/review choices without editing shared content.

create table public.learning_domains (
  id            text primary key,
  name          text not null,
  slug          text not null unique,
  description   text not null,
  display_order integer not null
);

create table public.curriculum_frameworks (
  id                    text primary key,
  name                  text not null,
  issuing_organisation  text not null,
  official_source_url   text not null,
  age_range             text not null,
  review_date           date,                         -- NULL until a human has actually consulted the source
  verification_status   text not null default 'pending' check (verification_status in ('pending','verified')),
  notes                 text not null default '',
  check (verification_status = 'pending' or review_date is not null)
);

create table public.learning_objectives (
  id                   text primary key,
  domain_id            text not null references public.learning_domains(id) on delete restrict,
  parent_objective_id  text references public.learning_objectives(id) on delete set null,
  subdomain            text not null,
  title                text not null,
  description          text not null,
  age_band             text not null check (age_band in ('little-explorer','curious-thinker','confident-learner','young-problem-solver')),
  success_criteria     jsonb not null default '[]'::jsonb,
  details              jsonb not null default '{}'::jsonb,   -- examples, hints, common difficulties, parent explanation
  status               text not null default 'draft' check (status in ('draft','validated','published','retired'))
);
create index learning_objectives_domain_idx on public.learning_objectives(domain_id);

create table public.objective_prerequisites (
  objective_id     text not null references public.learning_objectives(id) on delete cascade,
  prerequisite_id  text not null references public.learning_objectives(id) on delete cascade,
  primary key (objective_id, prerequisite_id),
  check (objective_id <> prerequisite_id)
);

create table public.objective_framework_mappings (
  objective_id           text not null references public.learning_objectives(id) on delete cascade,
  framework_id           text not null references public.curriculum_frameworks(id) on delete cascade,
  reference_description  text not null,   -- learning-area level; never an invented clause number
  mapping_type           text not null check (mapping_type in ('aligns','partial','informs')),
  evidence_or_notes      text,
  primary key (objective_id, framework_id, reference_description)
);

create table public.activities (
  id                 text primary key,
  title              text not null,
  description        text not null,
  domain_id          text not null references public.learning_domains(id) on delete restrict,
  world              text not null check (world in ('number-kingdom','conversation-cafe','puzzle-planet','wonder-world','creativity-forest')),
  engine_type        text not null check (engine_type in ('tap-choose','count-collect','match-pair','complete-pattern','listen-respond')),
  age_band           text not null check (age_band in ('little-explorer','curious-thinker','confident-learner','young-problem-solver')),
  difficulty         smallint not null check (difficulty between 1 and 3),
  configuration      jsonb not null,                -- validated by Zod in the app before use; never executed
  status             text not null default 'draft' check (status in ('draft','validated','published','retired')),
  review_status      text not null default 'unreviewed' check (review_status in ('unreviewed','reviewed')),
  version            integer not null default 1 check (version >= 1),
  estimated_duration numeric(4,1) not null check (estimated_duration > 0),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  check (status <> 'published' or review_status = 'reviewed')   -- unreviewed content can never be published
);
create index activities_lookup_idx on public.activities(domain_id, status, age_band);

create table public.activity_objectives (
  activity_id   text not null references public.activities(id) on delete cascade,
  objective_id  text not null references public.learning_objectives(id) on delete restrict,
  is_primary    boolean not null default false,
  primary key (activity_id, objective_id)
);
create unique index activity_one_primary_idx on public.activity_objectives(activity_id) where is_primary;

-- ---------------- Private family data ----------------
create table public.child_profiles (
  id             uuid primary key default gen_random_uuid(),
  parent_user_id uuid not null references auth.users(id) on delete cascade,
  nickname       text not null check (char_length(nickname) between 1 and 24),   -- a nickname, never a full name
  age_band       text not null check (age_band in ('little-explorer','curious-thinker','confident-learner','young-problem-solver')),
  preferences    jsonb not null default '{}'::jsonb,
  is_demo        boolean not null default false,
  created_at     timestamptz not null default now()
  -- Deliberately NO date of birth, photo, school or address.
);
create index child_profiles_parent_idx on public.child_profiles(parent_user_id);

create table public.activity_attempts (
  id                uuid primary key default gen_random_uuid(),
  child_profile_id  uuid not null references public.child_profiles(id) on delete cascade,
  activity_id       text not null references public.activities(id) on delete restrict,
  activity_version  integer not null,
  objective_id      text not null references public.learning_objectives(id) on delete restrict,
  outcome           text not null check (outcome in ('independent','supported','shown','open-ended','none')),
  hint_count        integer not null default 0 check (hint_count >= 0),
  assistance_level  text not null check (assistance_level in ('none','hint','example')),
  completion_status text not null check (completion_status in ('completed','exited-early')),
  occurred_at       timestamptz not null default now(),
  duration_seconds  integer not null default 0 check (duration_seconds >= 0),
  rounds            jsonb not null default '[]'::jsonb,     -- per-round evidence; never transcripts or audio
  parent_note       text check (char_length(parent_note) <= 300),
  metadata          jsonb not null default '{}'::jsonb
);
create index activity_attempts_child_time_idx on public.activity_attempts(child_profile_id, occurred_at desc);
create index activity_attempts_child_objective_idx on public.activity_attempts(child_profile_id, objective_id);

create table public.learning_progress (
  id                          uuid primary key default gen_random_uuid(),
  child_profile_id            uuid not null references public.child_profiles(id) on delete cascade,
  objective_id                text not null references public.learning_objectives(id) on delete restrict,
  evidence_category           text not null check (evidence_category in ('not-introduced','introduced','practising','supported','independent','ready-for-challenge')),
  independent_success_count   integer not null default 0 check (independent_success_count >= 0),
  supported_success_count     integer not null default 0 check (supported_success_count >= 0),
  recent_observations         jsonb not null default '[]'::jsonb,
  last_practised_at           timestamptz,
  next_review_at              timestamptz,
  updated_at                  timestamptz not null default now(),
  unique (child_profile_id, objective_id)
);

create table public.parent_settings (
  parent_user_id       uuid primary key references auth.users(id) on delete cascade,
  session_preferences  jsonb not null default '{}'::jsonb,
  audio_preferences    jsonb not null default '{}'::jsonb,
  ai_settings          jsonb not null default '{"enabled": false}'::jsonb,   -- AI is opt-in
  privacy_settings     jsonb not null default '{}'::jsonb,
  updated_at           timestamptz not null default now()
);

create table public.parent_activity_overrides (
  parent_user_id  uuid not null references auth.users(id) on delete cascade,
  activity_id     text not null references public.activities(id) on delete cascade,
  status          text check (status in ('draft','validated','published','retired')),
  review_status   text check (review_status in ('unreviewed','reviewed')),
  updated_at      timestamptz not null default now(),
  primary key (parent_user_id, activity_id)
);

-- keep updated_at honest
create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;
create trigger activities_touch before update on public.activities for each row execute function public.touch_updated_at();
create trigger progress_touch before update on public.learning_progress for each row execute function public.touch_updated_at();
create trigger settings_touch before update on public.parent_settings for each row execute function public.touch_updated_at();
create trigger overrides_touch before update on public.parent_activity_overrides for each row execute function public.touch_updated_at();
