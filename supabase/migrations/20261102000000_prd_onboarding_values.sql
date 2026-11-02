update public.profiles
set goal = null, level = null, onboarding_completed_at = null
where goal is not null or level is not null;

update public.profiles set strength = 'no' where strength is null;

alter table public.profiles drop constraint if exists profiles_goal_check;
alter table public.profiles drop constraint if exists profiles_level_check;
alter table public.profiles
  add constraint profiles_goal_check
    check (goal in ('complete_5k', 'race', 'fitness', 'weight_loss')),
  add constraint profiles_level_check
    check (level in ('total_beginner', 'beginner', 'intermediate', 'advanced'));

alter table public.profiles alter column strength set default 'no';
alter table public.profiles alter column strength set not null;

alter table public.profiles alter column onboarding_completed_at set default null;
comment on column public.profiles.onboarding_completed_at is
  'Set when the first-access flow finishes (plan generated or level not eligible). Null means the user must be sent to the pending onboarding step.';

alter table public.plans drop constraint if exists plans_goal_check;
alter table public.plans drop constraint if exists plans_level_check;
alter table public.plans
  add constraint plans_goal_check
    check (goal in ('complete_5k', 'race', 'fitness', 'weight_loss')) not valid,
  add constraint plans_level_check
    check (level in ('total_beginner', 'beginner', 'intermediate', 'advanced')) not valid;
