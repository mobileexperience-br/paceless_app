create table public.weekly_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  week_start date not null check (extract(isodow from week_start) = 1),
  target_sessions smallint not null check (target_sessions between 1 and 14),
  target_distance_meters numeric check (target_distance_meters > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, week_start)
);

create trigger weekly_goals_set_updated_at
  before update on public.weekly_goals
  for each row execute function public.set_updated_at();

alter table public.weekly_goals enable row level security;

create policy "weekly_goals_select_own"
  on public.weekly_goals for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "weekly_goals_insert_own"
  on public.weekly_goals for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "weekly_goals_update_own"
  on public.weekly_goals for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "weekly_goals_delete_own"
  on public.weekly_goals for delete
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.weekly_goals from anon, authenticated;
grant select, insert, update, delete on public.weekly_goals to authenticated;

create table public.achievements (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[a-z0-9]+(_[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 1 and 120),
  description text,
  kind text not null check (kind in ('milestone', 'personal')),
  metric text not null check (metric in (
    'distance_meters', 'duration_seconds', 'activities_count', 'weeks_met'
  )),
  threshold numeric not null check (threshold > 0),
  created_at timestamptz not null default now()
);

alter table public.achievements enable row level security;

create policy "achievements_select_authenticated"
  on public.achievements for select
  to authenticated
  using (true);

revoke all on public.achievements from anon, authenticated;
grant select on public.achievements to authenticated;

create table public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  achievement_id uuid not null references public.achievements (id) on delete cascade,
  activity_id uuid references public.activities (id) on delete set null,
  earned_at timestamptz not null default now(),
  unique (user_id, achievement_id)
);

create index user_achievements_achievement_id_idx on public.user_achievements (achievement_id);
create index user_achievements_activity_id_idx on public.user_achievements (activity_id);

alter table public.user_achievements enable row level security;

create policy "user_achievements_select_own"
  on public.user_achievements for select
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.user_achievements from anon, authenticated;
grant select on public.user_achievements to authenticated;
