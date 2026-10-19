create table public.plans (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  description text,
  goal text not null check (goal in ('start_running', 'run_5k', 'run_10k', 'fitness')),
  level text not null check (level in ('never_ran', 'sometimes', 'weekly')),
  weeks smallint not null check (weeks between 1 and 52),
  sessions_per_week smallint not null check (sessions_per_week between 1 and 7),
  is_premium boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index plans_owner_id_idx on public.plans (owner_id);

create trigger plans_set_updated_at
  before update on public.plans
  for each row execute function public.set_updated_at();

alter table public.plans enable row level security;

create policy "plans_select_catalog_or_own"
  on public.plans for select
  to authenticated
  using (owner_id is null or owner_id = (select auth.uid()));

revoke all on public.plans from anon, authenticated;
grant select on public.plans to authenticated;

create table public.plan_weeks (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.plans (id) on delete cascade,
  week_number smallint not null check (week_number >= 1),
  title text,
  unique (plan_id, week_number)
);

alter table public.plan_weeks enable row level security;

create policy "plan_weeks_select_visible"
  on public.plan_weeks for select
  to authenticated
  using (exists (select 1 from public.plans p where p.id = plan_id));

revoke all on public.plan_weeks from anon, authenticated;
grant select on public.plan_weeks to authenticated;

create table public.plan_workouts (
  id uuid primary key default gen_random_uuid(),
  plan_week_id uuid not null references public.plan_weeks (id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 1 and 7),
  position smallint not null default 1 check (position >= 1),
  title text not null check (char_length(title) between 1 and 120),
  kind text not null check (kind in ('run', 'strength', 'rest')),
  intensity text check (intensity in ('easy', 'moderate', 'hard')),
  zone smallint check (zone between 1 and 5),
  target_duration_minutes int check (target_duration_minutes > 0),
  target_distance_meters numeric check (target_distance_meters > 0),
  strength_workout_id uuid references public.strength_workouts (id) on delete set null,
  notes text,
  unique (plan_week_id, day_of_week, position)
);

create index plan_workouts_strength_workout_id_idx
  on public.plan_workouts (strength_workout_id);

alter table public.plan_workouts enable row level security;

create policy "plan_workouts_select_visible"
  on public.plan_workouts for select
  to authenticated
  using (exists (select 1 from public.plan_weeks w where w.id = plan_week_id));

revoke all on public.plan_workouts from anon, authenticated;
grant select on public.plan_workouts to authenticated;
