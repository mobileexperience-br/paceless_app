alter table public.user_plan_workouts drop constraint user_plan_workouts_status_check;

update public.user_plan_workouts
set status = case status
  when 'planned' then 'scheduled'
  when 'done' then 'completed'
  else 'cancelled'
end;

alter table public.user_plan_workouts alter column status set default 'scheduled';

alter table public.user_plan_workouts add constraint user_plan_workouts_status_check
  check (status in ('scheduled', 'in_progress', 'paused', 'completed', 'interrupted', 'cancelled'));

alter table public.user_plan_workouts
  add column week_number smallint,
  add column attempt smallint not null default 1 check (attempt >= 1),
  add column started_at timestamptz,
  add column interrupted_at timestamptz,
  add column interruption_reason text
    check (interruption_reason in ('discarded', 'too_short', 'superseded'));

update public.user_plan_workouts upw
set week_number = pw.week_number
from public.plan_workouts w
join public.plan_weeks pw on pw.id = w.plan_week_id
where w.id = upw.plan_workout_id;

update public.user_plan_workouts set week_number = 1 where week_number is null;

alter table public.user_plan_workouts
  alter column week_number set not null,
  add constraint user_plan_workouts_week_number_check check (week_number >= 1);

create index user_plan_workouts_plan_week_attempt_idx
  on public.user_plan_workouts (user_plan_id, week_number, attempt);

alter table public.user_plans
  add column current_attempt smallint not null default 1 check (current_attempt >= 1),
  add column current_week_started_on date not null default (date_trunc('week', current_date))::date;

update public.user_plans up
set current_week_started_on = coalesce(
  (
    select (date_trunc('week', min(w.scheduled_date)))::date
    from public.user_plan_workouts w
    where w.user_plan_id = up.id and w.week_number = up.current_week
  ),
  (date_trunc('week', up.started_at))::date
);

drop policy "user_plan_workouts_update_own" on public.user_plan_workouts;
revoke update on public.user_plan_workouts from authenticated;
revoke update on public.user_plans from authenticated;

create or replace function public.link_activity_to_plan_workout()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.user_plan_workouts
  set status = 'completed',
      activity_id = new.id,
      completed_at = new.ended_at
  where id = new.user_plan_workout_id
    and user_id = new.user_id
    and status in ('scheduled', 'in_progress', 'paused', 'interrupted');
  return new;
end;
$$;

revoke execute on function public.link_activity_to_plan_workout() from public, anon, authenticated;

create function public.transition_plan_session(p_session uuid, p_to text, p_reason text default null)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_status text;
  v_week smallint;
  v_attempt smallint;
  v_current_week smallint;
  v_current_attempt smallint;
  v_plan_status text;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  select upw.status, upw.week_number, upw.attempt, up.current_week, up.current_attempt, up.status
  into v_status, v_week, v_attempt, v_current_week, v_current_attempt, v_plan_status
  from public.user_plan_workouts upw
  join public.user_plans up on up.id = upw.user_plan_id
  where upw.id = p_session and upw.user_id = v_user
  for update of upw;

  if not found then
    raise exception 'session_not_found' using errcode = 'P0002';
  end if;

  if v_plan_status <> 'active' then
    raise exception 'plan_not_active' using errcode = 'P0001';
  end if;

  if v_status = p_to then
    return v_status;
  end if;

  if p_to = 'in_progress' and v_status in ('scheduled', 'interrupted') then
    if v_week <> v_current_week or v_attempt <> v_current_attempt then
      raise exception 'session_not_current' using errcode = 'P0001';
    end if;
    update public.user_plan_workouts
    set status = 'in_progress',
        started_at = coalesce(started_at, now()),
        interrupted_at = null,
        interruption_reason = null
    where id = p_session;
  elsif p_to = 'in_progress' and v_status = 'paused' then
    update public.user_plan_workouts set status = 'in_progress' where id = p_session;
  elsif p_to = 'paused' and v_status = 'in_progress' then
    update public.user_plan_workouts set status = 'paused' where id = p_session;
  elsif p_to = 'interrupted' and v_status in ('in_progress', 'paused')
    and p_reason in ('discarded', 'too_short') then
    update public.user_plan_workouts
    set status = 'interrupted', interrupted_at = now(), interruption_reason = p_reason
    where id = p_session;
  else
    raise exception 'invalid_transition' using errcode = 'P0001';
  end if;

  return p_to;
end;
$$;

revoke execute on function public.transition_plan_session(uuid, text, text) from public, anon;
grant execute on function public.transition_plan_session(uuid, text, text) to authenticated;
