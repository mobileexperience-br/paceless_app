create table public.notification_settings (
  user_id uuid primary key references auth.users (id) on delete cascade default auth.uid(),
  training_reminders boolean not null default false,
  reminder_time time not null default '07:00',
  training_days smallint[] not null default '{}'
    check (training_days <@ array[1, 2, 3, 4, 5, 6, 7]::smallint[]),
  timezone text not null default 'America/Sao_Paulo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger notification_settings_set_updated_at
  before update on public.notification_settings
  for each row execute function public.set_updated_at();

alter table public.notification_settings enable row level security;

create policy "notification_settings_select_own"
  on public.notification_settings for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "notification_settings_insert_own"
  on public.notification_settings for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "notification_settings_update_own"
  on public.notification_settings for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

revoke all on public.notification_settings from anon, authenticated;
grant select, insert, update on public.notification_settings to authenticated;
