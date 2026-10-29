alter table public.plans add column full_weeks smallint check (full_weeks >= 1);

alter table public.activities
  add column user_plan_workout_id uuid references public.user_plan_workouts (id) on delete set null;

create index activities_user_plan_workout_id_idx on public.activities (user_plan_workout_id);

drop policy "activities_insert_own" on public.activities;

create policy "activities_insert_own" on public.activities for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and (user_plan_workout_id is null or exists (
      select 1
      from public.user_plan_workouts w
      join public.user_plans up on up.id = w.user_plan_id
      where w.id = user_plan_workout_id
        and w.user_id = (select auth.uid())
        and up.status = 'active'
    ))
  );

create function public.link_activity_to_plan_workout()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.user_plan_workouts
  set status = 'done',
      activity_id = new.id,
      completed_at = new.ended_at
  where id = new.user_plan_workout_id
    and user_id = new.user_id
    and status <> 'done';
  return new;
end;
$$;

revoke execute on function public.link_activity_to_plan_workout() from public, anon, authenticated;

create trigger activities_link_plan_workout
after insert on public.activities
for each row
when (new.user_plan_workout_id is not null)
execute function public.link_activity_to_plan_workout();

create or replace function public.replace_generated_plan(
  p_user uuid,
  p_start date,
  p_today date,
  p_force boolean,
  p_plan jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_previous uuid;
  v_previous_hash text;
  v_plan uuid;
  v_user_plan uuid;
  v_week jsonb;
  v_workout jsonb;
  v_week_id uuid;
  v_workout_id uuid;
  v_date date;
  v_history_status text;
  v_history_activity uuid;
  v_history_completed timestamptz;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_user::text, 0));

  select up.id, pl.settings_hash into v_previous, v_previous_hash
  from public.user_plans up
  join public.plans pl on pl.id = up.plan_id
  where up.user_id = p_user and up.status = 'active';

  if v_previous is not null and not p_force and v_previous_hash = p_plan ->> 'settings_hash' then
    return v_previous;
  end if;

  if v_previous is not null then
    update public.user_plan_workouts
    set status = 'skipped'
    where user_plan_id = v_previous and status = 'planned' and scheduled_date < p_today;

    delete from public.user_plan_workouts
    where user_plan_id = v_previous and status = 'planned' and scheduled_date >= p_today;

    update public.user_plans
    set status = 'cancelled'
    where id = v_previous;
  end if;

  insert into public.plans (
    owner_id, name, description, goal, level, weeks, sessions_per_week,
    is_premium, settings_hash, generator_version, tier, full_weeks
  )
  values (
    p_user,
    p_plan ->> 'name',
    p_plan ->> 'description',
    p_plan ->> 'goal',
    p_plan ->> 'level',
    jsonb_array_length(p_plan -> 'weeks'),
    (p_plan ->> 'sessions_per_week')::smallint,
    p_plan ->> 'tier' = 'full',
    p_plan ->> 'settings_hash',
    (p_plan ->> 'generator_version')::smallint,
    p_plan ->> 'tier',
    (p_plan ->> 'full_weeks')::smallint
  )
  returning id into v_plan;

  insert into public.user_plans (user_id, plan_id, started_at)
  values (p_user, v_plan, p_start)
  returning id into v_user_plan;

  for v_week in select value from jsonb_array_elements(p_plan -> 'weeks') loop
    insert into public.plan_weeks (plan_id, week_number, title)
    values (v_plan, (v_week ->> 'week_number')::smallint, v_week ->> 'title')
    returning id into v_week_id;

    for v_workout in select value from jsonb_array_elements(v_week -> 'workouts') loop
      insert into public.plan_workouts (
        plan_week_id, day_of_week, position, title, description, kind, intensity, zone,
        target_duration_minutes, target_distance_meters, steps
      )
      values (
        v_week_id,
        (v_workout ->> 'day_of_week')::smallint,
        (v_workout ->> 'position')::smallint,
        v_workout ->> 'title',
        v_workout ->> 'description',
        v_workout ->> 'kind',
        v_workout ->> 'intensity',
        (v_workout ->> 'zone')::smallint,
        (v_workout ->> 'target_duration_minutes')::int,
        (v_workout ->> 'target_distance_meters')::numeric,
        coalesce(v_workout -> 'steps', '[]'::jsonb)
      )
      returning id into v_workout_id;

      if v_workout ->> 'kind' <> 'rest' then
        v_date := (v_workout ->> 'scheduled_date')::date;

        select upw.status, upw.activity_id, upw.completed_at
        into v_history_status, v_history_activity, v_history_completed
        from public.user_plan_workouts upw
        join public.plan_workouts pw on pw.id = upw.plan_workout_id
        where v_previous is not null
          and upw.user_plan_id = v_previous
          and upw.scheduled_date = v_date
          and upw.status in ('done', 'skipped')
          and pw.position = (v_workout ->> 'position')::smallint
          and pw.kind = v_workout ->> 'kind'
        limit 1;

        insert into public.user_plan_workouts (
          user_id, user_plan_id, plan_workout_id, scheduled_date, status, activity_id, completed_at
        )
        values (
          p_user,
          v_user_plan,
          v_workout_id,
          v_date,
          coalesce(v_history_status, case when v_date < p_today then 'skipped' else 'planned' end),
          v_history_activity,
          v_history_completed
        );
      end if;
    end loop;
  end loop;

  return v_user_plan;
end;
$$;

revoke execute on function public.replace_generated_plan(uuid, date, date, boolean, jsonb) from public, anon, authenticated;
grant execute on function public.replace_generated_plan(uuid, date, date, boolean, jsonb) to service_role;
