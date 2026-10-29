alter table public.connected_devices drop constraint connected_devices_provider_check;
alter table public.connected_devices
  add constraint connected_devices_provider_check
    check (provider in ('health_connect', 'healthkit', 'garmin', 'strava', 'ble_hr')),
  add column device_id text,
  add column device_name text,
  add constraint connected_devices_ble_device_check
    check (provider <> 'ble_hr' or device_id is not null);

drop policy "connected_devices_insert_own_on_device" on public.connected_devices;
drop policy "connected_devices_update_own_on_device" on public.connected_devices;
create policy "connected_devices_insert_own_on_device" on public.connected_devices
  for insert to authenticated
  with check ((select auth.uid()) = user_id and provider in ('health_connect', 'healthkit', 'ble_hr'));
create policy "connected_devices_update_own_on_device" on public.connected_devices
  for update to authenticated
  using ((select auth.uid()) = user_id and provider in ('health_connect', 'healthkit', 'ble_hr'))
  with check ((select auth.uid()) = user_id and provider in ('health_connect', 'healthkit', 'ble_hr'));
grant update (device_id, device_name) on public.connected_devices to authenticated;

alter table public.profiles
  add column max_heart_rate smallint check (max_heart_rate between 100 and 230);

create table public.activity_samples (
  activity_id uuid not null references public.activities (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  t_offset_s integer not null check (t_offset_s >= 0),
  hr_bpm smallint check (hr_bpm between 30 and 230),
  primary key (activity_id, t_offset_s)
);
alter table public.activity_samples enable row level security;
create policy "activity_samples_select_own" on public.activity_samples
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "activity_samples_insert_own" on public.activity_samples
  for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.activities a where a.id = activity_id and a.user_id = (select auth.uid()))
  );
create policy "activity_samples_delete_own" on public.activity_samples
  for delete to authenticated using ((select auth.uid()) = user_id);
revoke all on public.activity_samples from anon, authenticated;
grant select, insert, delete on public.activity_samples to authenticated;
