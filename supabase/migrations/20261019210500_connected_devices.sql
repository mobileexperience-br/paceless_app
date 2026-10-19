create table public.connected_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  provider text not null check (provider in ('health_connect', 'healthkit', 'garmin', 'strava')),
  status text not null default 'connected' check (status in ('connected', 'disconnected', 'error')),
  granted_scopes text[] not null default '{}',
  connected_at timestamptz not null default now(),
  last_sync_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider)
);

create trigger connected_devices_set_updated_at
  before update on public.connected_devices
  for each row execute function public.set_updated_at();

alter table public.connected_devices enable row level security;

create policy "connected_devices_select_own"
  on public.connected_devices for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "connected_devices_insert_own_on_device"
  on public.connected_devices for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and provider in ('health_connect', 'healthkit')
  );

create policy "connected_devices_update_own_on_device"
  on public.connected_devices for update
  to authenticated
  using ((select auth.uid()) = user_id and provider in ('health_connect', 'healthkit'))
  with check ((select auth.uid()) = user_id and provider in ('health_connect', 'healthkit'));

create policy "connected_devices_delete_own"
  on public.connected_devices for delete
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.connected_devices from anon, authenticated;
grant select, insert, delete on public.connected_devices to authenticated;
grant update (status, granted_scopes, last_sync_at) on public.connected_devices to authenticated;

create table public.device_credentials (
  connected_device_id uuid primary key references public.connected_devices (id) on delete cascade,
  access_token text not null,
  refresh_token text,
  expires_at timestamptz,
  updated_at timestamptz not null default now()
);

create trigger device_credentials_set_updated_at
  before update on public.device_credentials
  for each row execute function public.set_updated_at();

alter table public.device_credentials enable row level security;

revoke all on public.device_credentials from anon, authenticated;
