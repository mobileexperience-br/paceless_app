revoke all on public.activities from anon, authenticated;
grant select, insert, delete on public.activities to authenticated;

revoke all on public.profiles from anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
