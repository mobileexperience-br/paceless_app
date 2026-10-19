create table public.nutrition_goals (
  user_id uuid primary key references auth.users (id) on delete cascade default auth.uid(),
  kcal int check (kcal between 500 and 10000),
  protein_g int check (protein_g between 0 and 1000),
  carbs_g int check (carbs_g between 0 and 2000),
  fat_g int check (fat_g between 0 and 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger nutrition_goals_set_updated_at
  before update on public.nutrition_goals
  for each row execute function public.set_updated_at();

alter table public.nutrition_goals enable row level security;

create policy "nutrition_goals_select_own"
  on public.nutrition_goals for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "nutrition_goals_insert_own"
  on public.nutrition_goals for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "nutrition_goals_update_own"
  on public.nutrition_goals for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "nutrition_goals_delete_own"
  on public.nutrition_goals for delete
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.nutrition_goals from anon, authenticated;
grant select, insert, update, delete on public.nutrition_goals to authenticated;

create table public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  meal_date date not null default current_date,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  name text check (char_length(name) <= 120),
  kcal int check (kcal between 0 and 10000),
  protein_g numeric check (protein_g >= 0),
  carbs_g numeric check (carbs_g >= 0),
  fat_g numeric check (fat_g >= 0),
  notes text check (char_length(notes) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index meals_user_id_meal_date_idx on public.meals (user_id, meal_date desc);

create trigger meals_set_updated_at
  before update on public.meals
  for each row execute function public.set_updated_at();

alter table public.meals enable row level security;

create policy "meals_select_own"
  on public.meals for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "meals_insert_own"
  on public.meals for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "meals_update_own"
  on public.meals for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "meals_delete_own"
  on public.meals for delete
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.meals from anon, authenticated;
grant select, insert, update, delete on public.meals to authenticated;

create table public.anamnesis (
  user_id uuid primary key references auth.users (id) on delete cascade default auth.uid(),
  restrictions text[] not null default '{}' check (cardinality(restrictions) <= 30),
  conditions text[] not null default '{}' check (cardinality(conditions) <= 30),
  consented_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger anamnesis_set_updated_at
  before update on public.anamnesis
  for each row execute function public.set_updated_at();

alter table public.anamnesis enable row level security;

create policy "anamnesis_select_own"
  on public.anamnesis for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "anamnesis_insert_own"
  on public.anamnesis for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "anamnesis_update_own"
  on public.anamnesis for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "anamnesis_delete_own"
  on public.anamnesis for delete
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.anamnesis from anon, authenticated;
grant select, insert, update, delete on public.anamnesis to authenticated;
