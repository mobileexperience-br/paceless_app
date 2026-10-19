create table public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  type text not null default 'run' check (type in ('run', 'strength')),
  started_at timestamptz not null,
  ended_at timestamptz not null,
  duration_seconds int not null check (duration_seconds >= 0),
  distance_meters numeric not null default 0 check (distance_meters >= 0),
  avg_pace_seconds_per_km numeric,
  route jsonb,
  created_at timestamptz not null default now()
);

create index activities_user_id_started_at_idx
  on public.activities (user_id, started_at desc);

alter table public.activities enable row level security;

create policy "activities_select_own"
  on public.activities for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "activities_insert_own"
  on public.activities for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "activities_delete_own"
  on public.activities for delete
  to authenticated
  using ((select auth.uid()) = user_id);
