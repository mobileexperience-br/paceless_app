insert into public.achievements (code, title, description, kind, metric, threshold)
values
  ('first_workout', 'Primeiro treino', 'Você concluiu seu primeiro treino no Paceless.', 'milestone', 'activities_count', 1),
  ('first_week_completed', 'Semana concluída', 'Você concluiu todos os treinos de uma semana do plano.', 'milestone', 'weeks_met', 1)
on conflict (code) do nothing;

create or replace function public.award_achievements_for_activity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_plan uuid;
  v_week smallint;
  v_attempt smallint;
  v_eligible int;
  v_completed int;
begin
  if new.source <> 'paceless' then
    return new;
  end if;

  insert into public.user_achievements (user_id, achievement_id, activity_id)
  select new.user_id, a.id, new.id
  from public.achievements a
  where a.code = 'first_workout'
  on conflict (user_id, achievement_id) do nothing;

  if new.user_plan_workout_id is null then
    return new;
  end if;

  select user_plan_id, week_number, attempt
  into v_plan, v_week, v_attempt
  from public.user_plan_workouts
  where id = new.user_plan_workout_id
    and user_id = new.user_id
    and status = 'completed'
    and activity_id = new.id;

  if not found then
    return new;
  end if;

  select
    count(*) filter (where status <> 'cancelled'),
    count(*) filter (where status = 'completed')
  into v_eligible, v_completed
  from public.user_plan_workouts
  where user_plan_id = v_plan and week_number = v_week and attempt = v_attempt;

  if v_eligible > 0 and v_completed = v_eligible then
    insert into public.user_achievements (user_id, achievement_id, activity_id)
    select new.user_id, a.id, new.id
    from public.achievements a
    where a.code = 'first_week_completed'
    on conflict (user_id, achievement_id) do nothing;
  end if;

  return new;
end;
$$;

revoke execute on function public.award_achievements_for_activity() from public, anon, authenticated;

create trigger activities_post_award_achievements
after insert on public.activities
for each row
execute function public.award_achievements_for_activity();

create function public.get_progress_summary(p_today date)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_start date;
  v_week jsonb;
  v_total jsonb;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  if abs(p_today - (now() at time zone 'America/Sao_Paulo')::date) > 1 then
    raise exception 'invalid_today' using errcode = 'P0001';
  end if;

  v_start := (date_trunc('week', p_today))::date;

  select jsonb_build_object(
    'sessions', count(*),
    'distance_meters', coalesce(sum(distance_meters), 0),
    'duration_seconds', coalesce(sum(duration_seconds), 0)
  )
  into v_week
  from public.activities
  where user_id = v_user
    and (started_at at time zone 'America/Sao_Paulo')::date between v_start and v_start + 6;

  select jsonb_build_object(
    'sessions', count(*),
    'distance_meters', coalesce(sum(distance_meters), 0),
    'duration_seconds', coalesce(sum(duration_seconds), 0)
  )
  into v_total
  from public.activities
  where user_id = v_user;

  return jsonb_build_object('week_start', v_start, 'week', v_week, 'total', v_total);
end;
$$;

revoke execute on function public.get_progress_summary(date) from public, anon;
grant execute on function public.get_progress_summary(date) to authenticated;
