alter table public.activities
  add column source text not null default 'paceless'
    check (source in ('paceless', 'healthkit', 'health_connect')),
  add column external_id text,
  add column source_name text,
  add column avg_heart_rate smallint check (avg_heart_rate between 20 and 250),
  add column max_heart_rate smallint check (max_heart_rate between 20 and 250),
  add constraint activities_external_id_check
    check ((source = 'paceless') = (external_id is null)),
  add constraint activities_user_source_external_key
    unique (user_id, source, external_id);
