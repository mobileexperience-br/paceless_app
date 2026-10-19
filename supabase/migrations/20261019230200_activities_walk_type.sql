alter table public.activities
  drop constraint activities_type_check;

alter table public.activities
  add constraint activities_type_check
  check (type in ('run', 'walk', 'strength'));

alter table public.activities
  add column splits jsonb;
