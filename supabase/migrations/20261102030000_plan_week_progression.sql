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
    set status = 'interrupted', interrupted_at = now(), interruption_reason = 'superseded'
    where user_plan_id = v_previous and status in ('in_progress', 'paused');

    delete from public.user_plan_workouts
    where user_plan_id = v_previous and status = 'scheduled' and scheduled_date >= p_today;

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
          and upw.status = 'completed'
          and pw.position = (v_workout ->> 'position')::smallint
          and pw.kind = v_workout ->> 'kind'
        limit 1;

        insert into public.user_plan_workouts (
          user_id, user_plan_id, plan_workout_id, scheduled_date, status, activity_id, completed_at, week_number
        )
        values (
          p_user,
          v_user_plan,
          v_workout_id,
          v_date,
          coalesce(v_history_status, 'scheduled'),
          v_history_activity,
          v_history_completed,
          (v_week ->> 'week_number')::smallint
        );
      end if;
    end loop;
  end loop;

  update public.user_plans
  set current_week = 1,
      current_attempt = 1,
      current_week_started_on = coalesce(
        (
          select (date_trunc('week', min(w.scheduled_date)))::date
          from public.user_plan_workouts w
          where w.user_plan_id = v_user_plan and w.week_number = 1
        ),
        (date_trunc('week', p_start))::date
      )
  where id = v_user_plan;

  return v_user_plan;
end;
$$;

revoke execute on function public.replace_generated_plan(uuid, date, date, boolean, jsonb) from public, anon, authenticated;
grant execute on function public.replace_generated_plan(uuid, date, date, boolean, jsonb) to service_role;

create or replace function public.enroll_in_plan(p_plan_id uuid, p_start_date date default current_date)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_user_plan uuid;
  v_is_premium boolean;
  v_week_start date := date_trunc('week', p_start_date)::date;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_user::text, 0));

  select p.is_premium into v_is_premium
  from public.plans p
  where p.id = p_plan_id and (p.owner_id is null or p.owner_id = v_user);

  if not found then
    raise exception 'plan not found' using errcode = 'P0002';
  end if;

  if v_is_premium and not exists (
    select 1 from public.subscriptions s
    where s.user_id = v_user
      and s.entitlement = 'premium'
      and s.is_active
      and (s.expires_at is null or s.expires_at > now())
  ) then
    raise exception 'premium required' using errcode = '42501';
  end if;

  delete from public.user_plan_workouts uw
  using public.user_plans up
  where uw.user_plan_id = up.id
    and up.user_id = v_user
    and up.status = 'active'
    and uw.status = 'scheduled';

  update public.user_plans
  set status = 'cancelled'
  where user_id = v_user and status = 'active';

  insert into public.user_plans (user_id, plan_id, started_at, current_week_started_on)
  values (v_user, p_plan_id, p_start_date, v_week_start)
  returning id into v_user_plan;

  insert into public.user_plan_workouts (user_id, user_plan_id, plan_workout_id, scheduled_date, week_number)
  select v_user, v_user_plan, w.id,
    v_week_start + ((pw.week_number - 1) * 7) + (w.day_of_week - 1),
    pw.week_number
  from public.plan_workouts w
  join public.plan_weeks pw on pw.id = w.plan_week_id
  where pw.plan_id = p_plan_id and w.kind <> 'rest';

  return v_user_plan;
end;
$$;

revoke execute on function public.enroll_in_plan(uuid, date) from public, anon;
grant execute on function public.enroll_in_plan(uuid, date) to authenticated;

create function public.plan_next_week_start(p_week_started_on date, p_today date)
returns date
language sql
immutable
set search_path = ''
as $$
  select greatest(
    p_week_started_on + 7,
    p_today + ((8 - extract(isodow from p_today)::int) % 7)
  );
$$;

create function public.plan_week_state(p_user uuid, p_today date)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_user_plan uuid;
  v_week smallint;
  v_attempt smallint;
  v_started date;
  v_available smallint;
  v_full smallint;
  v_tier text;
  v_eligible int;
  v_completed int;
  v_open int;
  v_closed boolean;
  v_minimum int;
  v_locked boolean;
  v_reason text;
begin
  select up.id, up.current_week, up.current_attempt, up.current_week_started_on,
         pl.weeks, coalesce(pl.full_weeks, pl.weeks), coalesce(pl.tier, 'full')
  into v_user_plan, v_week, v_attempt, v_started, v_available, v_full, v_tier
  from public.user_plans up
  join public.plans pl on pl.id = up.plan_id
  where up.user_id = p_user and up.status = 'active';

  if not found then
    return null;
  end if;

  select
    count(*) filter (where status <> 'cancelled'),
    count(*) filter (where status = 'completed'),
    count(*) filter (where status in ('scheduled', 'in_progress', 'paused'))
  into v_eligible, v_completed, v_open
  from public.user_plan_workouts
  where user_plan_id = v_user_plan and week_number = v_week and attempt = v_attempt;

  v_closed := p_today > v_started + 6 or (v_eligible > 0 and v_open = 0);
  v_minimum := ceil(v_eligible * 2 / 3.0)::int;
  v_locked := v_week >= v_available and v_available < v_full;

  v_reason := case
    when not v_closed then 'not_closed'
    when v_completed < v_minimum then 'below_minimum'
    when v_locked then 'locked'
    else null
  end;

  return jsonb_build_object(
    'user_plan_id', v_user_plan,
    'current_week', v_week,
    'current_attempt', v_attempt,
    'week_started_on', v_started,
    'week_ends_on', v_started + 6,
    'available_weeks', v_available,
    'full_weeks', v_full,
    'eligible', v_eligible,
    'completed', v_completed,
    'minimum', v_minimum,
    'adherence', case when v_eligible = 0 then null else round(v_completed::numeric / v_eligible, 4) end,
    'closed', v_closed,
    'can_advance', v_reason is null,
    'can_repeat', v_closed,
    'is_last_week', v_week >= v_full,
    'block_reason', v_reason
  );
end;
$$;

revoke execute on function public.plan_week_state(uuid, date) from public, anon, authenticated;
revoke execute on function public.plan_next_week_start(date, date) from public, anon, authenticated;

create function public.get_plan_week_status(p_today date)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  if abs(p_today - (now() at time zone 'America/Sao_Paulo')::date) > 1 then
    raise exception 'invalid_today' using errcode = 'P0001';
  end if;
  return public.plan_week_state(auth.uid(), p_today);
end;
$$;

create function public.advance_plan_week(p_today date)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_state jsonb;
  v_user_plan uuid;
  v_week smallint;
  v_attempt smallint;
  v_start date;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  if abs(p_today - (now() at time zone 'America/Sao_Paulo')::date) > 1 then
    raise exception 'invalid_today' using errcode = 'P0001';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_user::text, 0));

  v_state := public.plan_week_state(v_user, p_today);
  if v_state is null then
    raise exception 'plan_not_found' using errcode = 'P0002';
  end if;
  if not (v_state ->> 'can_advance')::boolean then
    raise exception 'cannot_advance:%', v_state ->> 'block_reason' using errcode = 'P0001';
  end if;

  v_user_plan := (v_state ->> 'user_plan_id')::uuid;
  v_week := (v_state ->> 'current_week')::smallint;
  v_attempt := (v_state ->> 'current_attempt')::smallint;

  update public.user_plan_workouts
  set status = 'interrupted', interrupted_at = now(), interruption_reason = 'superseded'
  where user_plan_id = v_user_plan and week_number = v_week and attempt = v_attempt
    and status in ('in_progress', 'paused');

  if (v_state ->> 'is_last_week')::boolean then
    update public.user_plans set status = 'completed' where id = v_user_plan;
    return null;
  end if;

  v_start := public.plan_next_week_start((v_state ->> 'week_started_on')::date, p_today);

  update public.user_plan_workouts upw
  set scheduled_date = v_start + (upw.week_number - (v_week + 1)) * 7 + (w.day_of_week - 1)
  from public.plan_workouts w
  where w.id = upw.plan_workout_id
    and upw.user_plan_id = v_user_plan
    and upw.week_number > v_week
    and upw.status = 'scheduled';

  update public.user_plans
  set current_week = v_week + 1, current_attempt = 1, current_week_started_on = v_start
  where id = v_user_plan;

  return public.plan_week_state(v_user, p_today);
end;
$$;

create function public.repeat_plan_week(p_today date)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_state jsonb;
  v_user_plan uuid;
  v_week smallint;
  v_attempt smallint;
  v_start date;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  if abs(p_today - (now() at time zone 'America/Sao_Paulo')::date) > 1 then
    raise exception 'invalid_today' using errcode = 'P0001';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_user::text, 0));

  v_state := public.plan_week_state(v_user, p_today);
  if v_state is null then
    raise exception 'plan_not_found' using errcode = 'P0002';
  end if;
  if not (v_state ->> 'can_repeat')::boolean then
    raise exception 'cannot_repeat:not_closed' using errcode = 'P0001';
  end if;

  v_user_plan := (v_state ->> 'user_plan_id')::uuid;
  v_week := (v_state ->> 'current_week')::smallint;
  v_attempt := (v_state ->> 'current_attempt')::smallint;
  v_start := public.plan_next_week_start((v_state ->> 'week_started_on')::date, p_today);

  update public.user_plan_workouts
  set status = 'interrupted', interrupted_at = now(), interruption_reason = 'superseded'
  where user_plan_id = v_user_plan and week_number = v_week and attempt = v_attempt
    and status in ('in_progress', 'paused');

  insert into public.user_plan_workouts (
    user_id, user_plan_id, plan_workout_id, scheduled_date, status, week_number, attempt
  )
  select v_user, v_user_plan, upw.plan_workout_id, v_start + (w.day_of_week - 1),
         'scheduled', v_week, v_attempt + 1
  from public.user_plan_workouts upw
  join public.plan_workouts w on w.id = upw.plan_workout_id
  where upw.user_plan_id = v_user_plan and upw.week_number = v_week and upw.attempt = v_attempt
    and upw.status <> 'cancelled';

  update public.user_plan_workouts upw
  set scheduled_date = v_start + (upw.week_number - v_week) * 7 + (w.day_of_week - 1)
  from public.plan_workouts w
  where w.id = upw.plan_workout_id
    and upw.user_plan_id = v_user_plan
    and upw.week_number > v_week
    and upw.status = 'scheduled';

  update public.user_plans
  set current_attempt = v_attempt + 1, current_week_started_on = v_start
  where id = v_user_plan;

  return public.plan_week_state(v_user, p_today);
end;
$$;

revoke execute on function public.get_plan_week_status(date) from public, anon;
grant execute on function public.get_plan_week_status(date) to authenticated;
revoke execute on function public.advance_plan_week(date) from public, anon;
grant execute on function public.advance_plan_week(date) to authenticated;
revoke execute on function public.repeat_plan_week(date) from public, anon;
grant execute on function public.repeat_plan_week(date) to authenticated;
