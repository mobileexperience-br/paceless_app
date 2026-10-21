alter table public.profiles
  add column training_days smallint[] not null default '{}'
    check (training_days <@ array[1, 2, 3, 4, 5, 6, 7]::smallint[]);
