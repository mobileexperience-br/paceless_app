alter table public.activities
  add column perceived_effort text
  check (perceived_effort in ('very_easy', 'easy', 'moderate', 'hard', 'very_hard'));

grant update (perceived_effort) on public.activities to authenticated;

create policy "activities_update_own_effort" on public.activities for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
