create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 1 and 120),
  muscle_group text not null check (muscle_group in (
    'full_body', 'core', 'glutes', 'hips', 'quads', 'hamstrings',
    'calves', 'feet', 'chest', 'back', 'shoulders', 'arms'
  )),
  category text not null default 'strength' check (category in ('strength', 'mobility', 'core')),
  level text not null default 'beginner' check (level in ('beginner', 'intermediate', 'advanced')),
  description text,
  instructions text,
  media_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index exercises_muscle_group_idx on public.exercises (muscle_group);

create trigger exercises_set_updated_at
  before update on public.exercises
  for each row execute function public.set_updated_at();

alter table public.exercises enable row level security;

create policy "exercises_select_authenticated"
  on public.exercises for select
  to authenticated
  using (true);

revoke all on public.exercises from anon, authenticated;
grant select on public.exercises to authenticated;

create table public.strength_workouts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  subtitle text check (char_length(subtitle) <= 120),
  duration_minutes int check (duration_minutes > 0),
  level text not null default 'beginner' check (level in ('beginner', 'intermediate', 'advanced')),
  is_premium boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index strength_workouts_owner_id_idx on public.strength_workouts (owner_id);

create trigger strength_workouts_set_updated_at
  before update on public.strength_workouts
  for each row execute function public.set_updated_at();

alter table public.strength_workouts enable row level security;

create policy "strength_workouts_select_catalog_or_own"
  on public.strength_workouts for select
  to authenticated
  using (owner_id is null or owner_id = (select auth.uid()));

create policy "strength_workouts_insert_own"
  on public.strength_workouts for insert
  to authenticated
  with check (owner_id = (select auth.uid()) and is_premium = false);

create policy "strength_workouts_update_own"
  on public.strength_workouts for update
  to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()) and is_premium = false);

create policy "strength_workouts_delete_own"
  on public.strength_workouts for delete
  to authenticated
  using (owner_id = (select auth.uid()));

revoke all on public.strength_workouts from anon, authenticated;
grant select, insert, update, delete on public.strength_workouts to authenticated;

create table public.strength_workout_exercises (
  id uuid primary key default gen_random_uuid(),
  strength_workout_id uuid not null references public.strength_workouts (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete restrict,
  position smallint not null check (position >= 1),
  sets smallint not null default 1 check (sets between 1 and 20),
  reps smallint check (reps between 1 and 200),
  duration_seconds int check (duration_seconds between 1 and 3600),
  rest_seconds int not null default 0 check (rest_seconds between 0 and 600),
  created_at timestamptz not null default now(),
  unique (strength_workout_id, position),
  check (reps is not null or duration_seconds is not null)
);

create index strength_workout_exercises_exercise_id_idx
  on public.strength_workout_exercises (exercise_id);

alter table public.strength_workout_exercises enable row level security;

create policy "strength_workout_exercises_select_visible"
  on public.strength_workout_exercises for select
  to authenticated
  using (exists (
    select 1 from public.strength_workouts w
    where w.id = strength_workout_id
  ));

create policy "strength_workout_exercises_insert_own"
  on public.strength_workout_exercises for insert
  to authenticated
  with check (exists (
    select 1 from public.strength_workouts w
    where w.id = strength_workout_id and w.owner_id = (select auth.uid())
  ));

create policy "strength_workout_exercises_update_own"
  on public.strength_workout_exercises for update
  to authenticated
  using (exists (
    select 1 from public.strength_workouts w
    where w.id = strength_workout_id and w.owner_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.strength_workouts w
    where w.id = strength_workout_id and w.owner_id = (select auth.uid())
  ));

create policy "strength_workout_exercises_delete_own"
  on public.strength_workout_exercises for delete
  to authenticated
  using (exists (
    select 1 from public.strength_workouts w
    where w.id = strength_workout_id and w.owner_id = (select auth.uid())
  ));

revoke all on public.strength_workout_exercises from anon, authenticated;
grant select, insert, update, delete on public.strength_workout_exercises to authenticated;
