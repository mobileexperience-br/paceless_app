alter table public.profiles
  add column distance_unit text not null default 'km' check (distance_unit in ('km', 'mi')),
  add column theme text not null default 'system' check (theme in ('system', 'light', 'dark'));
