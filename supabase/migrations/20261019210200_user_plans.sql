create table public.user_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  plan_id uuid not null references public.plans (id) on delete restrict,
  started_at date not null default current_date,
  current_week smallint not null default 1 check (current_week >= 1),
  status text not null default 'active' check (status in ('active', 'paused', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index user_plans_user_id_idx on public.user_plans (user_id);
create index user_plans_plan_id_idx on public.user_plans (plan_id);
create unique index user_plans_one_active_idx on public.user_plans (user_id) where status = 'active';

create trigger user_plans_set_updated_at
  before update on public.user_plans
  for each row execute function public.set_updated_at();

alter table public.user_plans enable row level security;

create policy "user_plans_select_own"
  on public.user_plans for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "user_plans_update_own"
  on public.user_plans for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "user_plans_delete_own"
  on public.user_plans for delete
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.user_plans from anon, authenticated;
grant select, delete on public.user_plans to authenticated;
grant update (current_week, status) on public.user_plans to authenticated;

create table public.user_plan_workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  user_plan_id uuid not null references public.user_plans (id) on delete cascade,
  plan_workout_id uuid references public.plan_workouts (id) on delete set null,
  scheduled_date date not null,
  status text not null default 'planned' check (status in ('planned', 'done', 'skipped')),
  activity_id uuid references public.activities (id) on delete set null,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index user_plan_workouts_user_id_date_idx
  on public.user_plan_workouts (user_id, scheduled_date);
create index user_plan_workouts_user_plan_id_idx on public.user_plan_workouts (user_plan_id);
create index user_plan_workouts_plan_workout_id_idx on public.user_plan_workouts (plan_workout_id);
create index user_plan_workouts_activity_id_idx on public.user_plan_workouts (activity_id);

create trigger user_plan_workouts_set_updated_at
  before update on public.user_plan_workouts
  for each row execute function public.set_updated_at();

alter table public.user_plan_workouts enable row level security;

create policy "user_plan_workouts_select_own"
  on public.user_plan_workouts for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "user_plan_workouts_update_own"
  on public.user_plan_workouts for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and (
      activity_id is null
      or exists (
        select 1 from public.activities a
        where a.id = activity_id and a.user_id = (select auth.uid())
      )
    )
  );

revoke all on public.user_plan_workouts from anon, authenticated;
grant select on public.user_plan_workouts to authenticated;
grant update (status, activity_id, completed_at) on public.user_plan_workouts to authenticated;

create function public.enroll_in_plan(p_plan_id uuid, p_start_date date default current_date)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_user_plan uuid;
  v_week_start date := date_trunc('week', p_start_date)::date;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  if not exists (
    select 1 from public.plans p
    where p.id = p_plan_id and (p.owner_id is null or p.owner_id = v_user)
  ) then
    raise exception 'plan not found' using errcode = 'P0002';
  end if;

  update public.user_plans
  set status = 'cancelled'
  where user_id = v_user and status = 'active';

  insert into public.user_plans (user_id, plan_id, started_at)
  values (v_user, p_plan_id, p_start_date)
  returning id into v_user_plan;

  insert into public.user_plan_workouts (user_id, user_plan_id, plan_workout_id, scheduled_date)
  select v_user, v_user_plan, w.id,
    v_week_start + ((pw.week_number - 1) * 7) + (w.day_of_week - 1)
  from public.plan_workouts w
  join public.plan_weeks pw on pw.id = w.plan_week_id
  where pw.plan_id = p_plan_id and w.kind <> 'rest';

  return v_user_plan;
end;
$$;

revoke execute on function public.enroll_in_plan(uuid, date) from public, anon;
grant execute on function public.enroll_in_plan(uuid, date) to authenticated;
