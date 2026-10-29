create table public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  expo_token text not null unique,
  platform text not null check (platform in ('ios', 'android')),
  device_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index push_tokens_user_id_idx on public.push_tokens (user_id);

create trigger push_tokens_set_updated_at
  before update on public.push_tokens
  for each row execute function public.set_updated_at();

alter table public.push_tokens enable row level security;

create policy "push_tokens_select_own"
  on public.push_tokens for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "push_tokens_insert_own"
  on public.push_tokens for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "push_tokens_update_own"
  on public.push_tokens for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "push_tokens_delete_own"
  on public.push_tokens for delete
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.push_tokens from anon, authenticated;
grant select, insert, delete on public.push_tokens to authenticated;
grant update (expo_token, platform, device_id, updated_at) on public.push_tokens to authenticated;
