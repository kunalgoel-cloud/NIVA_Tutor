-- 0004: two new game engines (story-listen, maze) may be stored in public.activities.
alter table public.activities drop constraint if exists activities_engine_type_check;
alter table public.activities add constraint activities_engine_type_check
  check (engine_type in ('tap-choose','count-collect','match-pair','complete-pattern','listen-respond','story-listen','maze'));
