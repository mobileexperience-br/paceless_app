# Spec — Fase 3: regras do plano (estados, repetir semana e avanço)

Cobre PLAN-03, PLAN-04, US-PLAN-01 (CA1–CA4) e BR-01..BR-03 do PRD (`docs/prd-v1.md`).
Decisões provisórias novas: DP-21 a DP-28 em `docs/decisoes-provisorias-prd.md`.

## 0. Regras para quem implementa

- Trabalhe só no worktree `/mnt/dados/projects/github/paceless_prd_flow` (branch `feat/prd-mvp`).
- NÃO aplique migration, NÃO faça deploy, NÃO faça push, NÃO inicie expo/web, NÃO instale lib.
- Sem comentários em `.ts/.tsx`. Sem `any`. Arquivos com no máximo 200 linhas (se passar, extraia
  para um arquivo novo com nome descritivo, sem mudar comportamento).
- Estilo só por tokens de `theme/`. Ícones só `lucide-react-native`. Nenhum emoji.
- Texto de UI em PT-BR, exatamente como escrito aqui.
- Ao terminar: `npx tsc --noEmit` e `npx eslint .` sem erros.
- Siga a ordem das seções. Não toque em arquivos fora da lista da seção 1.

## 1. Arquivos

| Ação | Arquivo |
|---|---|
| criar | `supabase/migrations/20261102020000_plan_session_states.sql` |
| criar | `supabase/migrations/20261102030000_plan_week_progression.sql` |
| criar | `lib/planSessionRpc.ts` |
| criar | `lib/planWeekStatus.ts` |
| criar | `hooks/usePlanWeekStatus.ts` |
| criar | `hooks/usePlanSessionReporter.ts` |
| criar | `components/plan/WeekStatusCard.tsx` |
| criar | `components/plan/AttemptHistory.tsx` |
| alterar | `types/training.ts` |
| alterar | `lib/planParsers.ts` |
| alterar | `lib/planQueries.ts` |
| alterar | `lib/planProgress.ts` |
| alterar | `components/plan/SessionStatus.tsx` |
| alterar | `components/plan/DayRow.tsx` |
| alterar | `components/plan/WeekList.tsx` (só se usar algo renomeado; ver 6.6) |
| alterar | `components/home/PlanCard.tsx`, `components/home/TodayCard.tsx` |
| alterar | `app/(app)/(tabs)/plan/index.tsx` |
| alterar | `app/(app)/(tabs)/plan/week/[week].tsx` |
| alterar | `app/(app)/(tabs)/plan/session/[id].tsx` |
| alterar | `app/(app)/workout/[id].tsx` |
| alterar | `hooks/useFinishWorkout.ts` |
| alterar | `docs/banco-de-dados.md`, `docs/planos.md` |

Nada é removido. A Edge Function `generate-plan` NÃO muda (a RPC que ela chama mantém a assinatura).

## 2. Modelo de estados (BR-02)

### 2.1 Estado gravado (`user_plan_workouts.status`)

| Valor | Significado | Quem grava |
|---|---|---|
| `scheduled` | programada, ainda não começou (substitui `planned`) | criação do plano / repetir semana |
| `in_progress` | treino do plano em andamento | RPC `transition_plan_session` |
| `paused` | treino do plano pausado | RPC `transition_plan_session` |
| `completed` | atividade vinculada salva (substitui `done`) | trigger `activities_link_plan_workout` |
| `interrupted` | começou e foi encerrado sem salvar | RPC `transition_plan_session` ou fechamento de semana |
| `cancelled` | retirada pelo sistema (substitui `skipped`) | migration de dados antigos |

Transições válidas (qualquer outra é recusada no servidor com `invalid_transition`):

| De | Para | Caminho | Condição extra |
|---|---|---|---|
| `scheduled` | `in_progress` | RPC | sessão é da semana e tentativa atuais do plano ativo |
| `interrupted` | `in_progress` | RPC | idem |
| `in_progress` | `paused` | RPC | — |
| `paused` | `in_progress` | RPC | — |
| `in_progress`, `paused` | `interrupted` | RPC | `p_reason` em `discarded`, `too_short` |
| `scheduled`, `in_progress`, `paused`, `interrupted` | `completed` | trigger de atividade | — |
| `in_progress`, `paused` | `interrupted` (`superseded`) | avançar/repetir semana, regerar plano | — |

`completed` e `cancelled` são finais. Pedir a mesma transição de novo (ex.: `paused`→`paused`)
retorna o estado atual sem erro (idempotente).

### 2.2 Estado exibido (`PlanSessionState`, só no app)

Derivado de `status` + data + hoje (`lib/planProgress.ts → sessionState`):

| status | data | estado exibido | rótulo |
|---|---|---|---|
| `completed` | qualquer | `completed` | Concluído |
| `in_progress`, `paused` | qualquer | `in_progress` | Em andamento |
| `interrupted` | qualquer | `interrupted` | Interrompido |
| `cancelled` | qualquer | `cancelled` | Cancelado |
| `scheduled` | < hoje | `missed` | Não realizado |
| `scheduled` | = hoje | `today` | Hoje |
| `scheduled` | > hoje | `pending` | Pendente |

## 3. Banco — migration 1 (NÃO aplicar)

`supabase/migrations/20261102020000_plan_session_states.sql`, conteúdo exato:

```sql
alter table public.user_plan_workouts drop constraint user_plan_workouts_status_check;

update public.user_plan_workouts
set status = case status
  when 'planned' then 'scheduled'
  when 'done' then 'completed'
  else 'cancelled'
end;

alter table public.user_plan_workouts alter column status set default 'scheduled';

alter table public.user_plan_workouts add constraint user_plan_workouts_status_check
  check (status in ('scheduled', 'in_progress', 'paused', 'completed', 'interrupted', 'cancelled'));

alter table public.user_plan_workouts
  add column week_number smallint,
  add column attempt smallint not null default 1 check (attempt >= 1),
  add column started_at timestamptz,
  add column interrupted_at timestamptz,
  add column interruption_reason text
    check (interruption_reason in ('discarded', 'too_short', 'superseded'));

update public.user_plan_workouts upw
set week_number = pw.week_number
from public.plan_workouts w
join public.plan_weeks pw on pw.id = w.plan_week_id
where w.id = upw.plan_workout_id;

update public.user_plan_workouts set week_number = 1 where week_number is null;

alter table public.user_plan_workouts
  alter column week_number set not null,
  add constraint user_plan_workouts_week_number_check check (week_number >= 1);

create index user_plan_workouts_plan_week_attempt_idx
  on public.user_plan_workouts (user_plan_id, week_number, attempt);

alter table public.user_plans
  add column current_attempt smallint not null default 1 check (current_attempt >= 1),
  add column current_week_started_on date not null default (date_trunc('week', current_date))::date;

update public.user_plans up
set current_week_started_on = coalesce(
  (
    select (date_trunc('week', min(w.scheduled_date)))::date
    from public.user_plan_workouts w
    where w.user_plan_id = up.id and w.week_number = up.current_week
  ),
  (date_trunc('week', up.started_at))::date
);

drop policy "user_plan_workouts_update_own" on public.user_plan_workouts;
revoke update on public.user_plan_workouts from authenticated;
revoke update on public.user_plans from authenticated;

create or replace function public.link_activity_to_plan_workout()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.user_plan_workouts
  set status = 'completed',
      activity_id = new.id,
      completed_at = new.ended_at
  where id = new.user_plan_workout_id
    and user_id = new.user_id
    and status in ('scheduled', 'in_progress', 'paused', 'interrupted');
  return new;
end;
$$;

revoke execute on function public.link_activity_to_plan_workout() from public, anon, authenticated;

create function public.transition_plan_session(p_session uuid, p_to text, p_reason text default null)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_status text;
  v_week smallint;
  v_attempt smallint;
  v_current_week smallint;
  v_current_attempt smallint;
  v_plan_status text;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  select upw.status, upw.week_number, upw.attempt, up.current_week, up.current_attempt, up.status
  into v_status, v_week, v_attempt, v_current_week, v_current_attempt, v_plan_status
  from public.user_plan_workouts upw
  join public.user_plans up on up.id = upw.user_plan_id
  where upw.id = p_session and upw.user_id = v_user
  for update of upw;

  if not found then
    raise exception 'session_not_found' using errcode = 'P0002';
  end if;

  if v_plan_status <> 'active' then
    raise exception 'plan_not_active' using errcode = 'P0001';
  end if;

  if v_status = p_to then
    return v_status;
  end if;

  if p_to = 'in_progress' and v_status in ('scheduled', 'interrupted') then
    if v_week <> v_current_week or v_attempt <> v_current_attempt then
      raise exception 'session_not_current' using errcode = 'P0001';
    end if;
    update public.user_plan_workouts
    set status = 'in_progress',
        started_at = coalesce(started_at, now()),
        interrupted_at = null,
        interruption_reason = null
    where id = p_session;
  elsif p_to = 'in_progress' and v_status = 'paused' then
    update public.user_plan_workouts set status = 'in_progress' where id = p_session;
  elsif p_to = 'paused' and v_status = 'in_progress' then
    update public.user_plan_workouts set status = 'paused' where id = p_session;
  elsif p_to = 'interrupted' and v_status in ('in_progress', 'paused')
    and p_reason in ('discarded', 'too_short') then
    update public.user_plan_workouts
    set status = 'interrupted', interrupted_at = now(), interruption_reason = p_reason
    where id = p_session;
  else
    raise exception 'invalid_transition' using errcode = 'P0001';
  end if;

  return p_to;
end;
$$;

revoke execute on function public.transition_plan_session(uuid, text, text) from public, anon;
grant execute on function public.transition_plan_session(uuid, text, text) to authenticated;
```

Depois desta migration, `replace_generated_plan` e `enroll_in_plan` ainda usam os valores antigos;
a migration 2 (seção 4) corrige as duas. As duas migrations sempre vão juntas.

## 4. Banco — migration 2 (NÃO aplicar)

`supabase/migrations/20261102030000_plan_week_progression.sql`. Contém, nesta ordem:

### 4.1 `replace_generated_plan` (create or replace, mesma assinatura e mesmos grants)

Copie o corpo inteiro da versão em `20261029010000_plan_session_link.sql` e faça SÓ estas mudanças:

1. Troque o bloco `if v_previous is not null then ... end if;` (o que marca `skipped`, apaga
   `planned` e cancela o plano) por:
   ```sql
   if v_previous is not null then
     update public.user_plan_workouts
     set status = 'interrupted', interrupted_at = now(), interruption_reason = 'superseded'
     where user_plan_id = v_previous and status in ('in_progress', 'paused');

     delete from public.user_plan_workouts
     where user_plan_id = v_previous and status = 'scheduled' and scheduled_date >= p_today;

     update public.user_plans
     set status = 'cancelled'
     where id = v_previous;
   end if;
   ```
2. No `insert into public.user_plan_workouts (...)` acrescente a coluna `week_number` com o valor
   `(v_week ->> 'week_number')::smallint`.
3. Na busca de histórico troque `and upw.status in ('done', 'skipped')` por
   `and upw.status = 'completed'`.
4. No valor de status troque
   `coalesce(v_history_status, case when v_date < p_today then 'skipped' else 'planned' end)` por
   `coalesce(v_history_status, 'scheduled')`.
5. Logo antes de `return v_user_plan;` acrescente:
   ```sql
   update public.user_plans
   set current_week = 1,
       current_attempt = 1,
       current_week_started_on = coalesce(
         (
           select (date_trunc('week', min(w.scheduled_date)))::date
           from public.user_plan_workouts w
           where w.user_plan_id = v_user_plan and w.week_number = 1
         ),
         (date_trunc('week', p_start))::date
       )
   where id = v_user_plan;
   ```
Repita no fim o `revoke`/`grant` da função exatamente como na versão anterior.

### 4.2 `enroll_in_plan` (create or replace, mesma assinatura e mesmos grants)

Copie o corpo de `20261019210200_user_plans.sql` e mude SÓ:
- `and uw.status = 'planned';` → `and uw.status = 'scheduled';`
- `insert into public.user_plans (user_id, plan_id, started_at) values (v_user, p_plan_id, p_start_date)`
  → `insert into public.user_plans (user_id, plan_id, started_at, current_week_started_on) values (v_user, p_plan_id, p_start_date, v_week_start)`
- `insert into public.user_plan_workouts (user_id, user_plan_id, plan_workout_id, scheduled_date)` →
  acrescente `week_number` na lista de colunas e `pw.week_number` no `select`.

### 4.3 Funções novas (conteúdo exato)

```sql
create function public.plan_next_week_start(p_week_started_on date, p_today date)
returns date
language sql
immutable
set search_path = ''
as $$
  select greatest(
    p_week_started_on + 7,
    p_today + ((8 - extract(isodow from p_today)::int) % 7)
  );
$$;

create function public.plan_week_state(p_user uuid, p_today date)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_user_plan uuid;
  v_week smallint;
  v_attempt smallint;
  v_started date;
  v_available smallint;
  v_full smallint;
  v_tier text;
  v_eligible int;
  v_completed int;
  v_open int;
  v_closed boolean;
  v_minimum int;
  v_locked boolean;
  v_reason text;
begin
  select up.id, up.current_week, up.current_attempt, up.current_week_started_on,
         pl.weeks, coalesce(pl.full_weeks, pl.weeks), coalesce(pl.tier, 'full')
  into v_user_plan, v_week, v_attempt, v_started, v_available, v_full, v_tier
  from public.user_plans up
  join public.plans pl on pl.id = up.plan_id
  where up.user_id = p_user and up.status = 'active';

  if not found then
    return null;
  end if;

  select
    count(*) filter (where status <> 'cancelled'),
    count(*) filter (where status = 'completed'),
    count(*) filter (where status in ('scheduled', 'in_progress', 'paused'))
  into v_eligible, v_completed, v_open
  from public.user_plan_workouts
  where user_plan_id = v_user_plan and week_number = v_week and attempt = v_attempt;

  v_closed := p_today > v_started + 6 or (v_eligible > 0 and v_open = 0);
  v_minimum := ceil(v_eligible * 2 / 3.0)::int;
  v_locked := v_week >= v_available and v_available < v_full;

  v_reason := case
    when not v_closed then 'not_closed'
    when v_completed < v_minimum then 'below_minimum'
    when v_locked then 'locked'
    else null
  end;

  return jsonb_build_object(
    'user_plan_id', v_user_plan,
    'current_week', v_week,
    'current_attempt', v_attempt,
    'week_started_on', v_started,
    'week_ends_on', v_started + 6,
    'available_weeks', v_available,
    'full_weeks', v_full,
    'eligible', v_eligible,
    'completed', v_completed,
    'minimum', v_minimum,
    'adherence', case when v_eligible = 0 then null else round(v_completed::numeric / v_eligible, 4) end,
    'closed', v_closed,
    'can_advance', v_reason is null,
    'can_repeat', v_closed,
    'is_last_week', v_week >= v_full,
    'block_reason', v_reason
  );
end;
$$;

revoke execute on function public.plan_week_state(uuid, date) from public, anon, authenticated;
revoke execute on function public.plan_next_week_start(date, date) from public, anon, authenticated;

create function public.get_plan_week_status(p_today date)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  if abs(p_today - (now() at time zone 'America/Sao_Paulo')::date) > 1 then
    raise exception 'invalid_today' using errcode = 'P0001';
  end if;
  return public.plan_week_state(auth.uid(), p_today);
end;
$$;

create function public.advance_plan_week(p_today date)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_state jsonb;
  v_user_plan uuid;
  v_week smallint;
  v_attempt smallint;
  v_start date;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  if abs(p_today - (now() at time zone 'America/Sao_Paulo')::date) > 1 then
    raise exception 'invalid_today' using errcode = 'P0001';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_user::text, 0));

  v_state := public.plan_week_state(v_user, p_today);
  if v_state is null then
    raise exception 'plan_not_found' using errcode = 'P0002';
  end if;
  if not (v_state ->> 'can_advance')::boolean then
    raise exception 'cannot_advance:%', v_state ->> 'block_reason' using errcode = 'P0001';
  end if;

  v_user_plan := (v_state ->> 'user_plan_id')::uuid;
  v_week := (v_state ->> 'current_week')::smallint;
  v_attempt := (v_state ->> 'current_attempt')::smallint;

  update public.user_plan_workouts
  set status = 'interrupted', interrupted_at = now(), interruption_reason = 'superseded'
  where user_plan_id = v_user_plan and week_number = v_week and attempt = v_attempt
    and status in ('in_progress', 'paused');

  if (v_state ->> 'is_last_week')::boolean then
    update public.user_plans set status = 'completed' where id = v_user_plan;
    return null;
  end if;

  v_start := public.plan_next_week_start((v_state ->> 'week_started_on')::date, p_today);

  update public.user_plan_workouts upw
  set scheduled_date = v_start + (upw.week_number - (v_week + 1)) * 7 + (w.day_of_week - 1)
  from public.plan_workouts w
  where w.id = upw.plan_workout_id
    and upw.user_plan_id = v_user_plan
    and upw.week_number > v_week
    and upw.status = 'scheduled';

  update public.user_plans
  set current_week = v_week + 1, current_attempt = 1, current_week_started_on = v_start
  where id = v_user_plan;

  return public.plan_week_state(v_user, p_today);
end;
$$;

create function public.repeat_plan_week(p_today date)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_state jsonb;
  v_user_plan uuid;
  v_week smallint;
  v_attempt smallint;
  v_start date;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  if abs(p_today - (now() at time zone 'America/Sao_Paulo')::date) > 1 then
    raise exception 'invalid_today' using errcode = 'P0001';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_user::text, 0));

  v_state := public.plan_week_state(v_user, p_today);
  if v_state is null then
    raise exception 'plan_not_found' using errcode = 'P0002';
  end if;
  if not (v_state ->> 'can_repeat')::boolean then
    raise exception 'cannot_repeat:not_closed' using errcode = 'P0001';
  end if;

  v_user_plan := (v_state ->> 'user_plan_id')::uuid;
  v_week := (v_state ->> 'current_week')::smallint;
  v_attempt := (v_state ->> 'current_attempt')::smallint;
  v_start := public.plan_next_week_start((v_state ->> 'week_started_on')::date, p_today);

  update public.user_plan_workouts
  set status = 'interrupted', interrupted_at = now(), interruption_reason = 'superseded'
  where user_plan_id = v_user_plan and week_number = v_week and attempt = v_attempt
    and status in ('in_progress', 'paused');

  insert into public.user_plan_workouts (
    user_id, user_plan_id, plan_workout_id, scheduled_date, status, week_number, attempt
  )
  select v_user, v_user_plan, upw.plan_workout_id, v_start + (w.day_of_week - 1),
         'scheduled', v_week, v_attempt + 1
  from public.user_plan_workouts upw
  join public.plan_workouts w on w.id = upw.plan_workout_id
  where upw.user_plan_id = v_user_plan and upw.week_number = v_week and upw.attempt = v_attempt
    and upw.status <> 'cancelled';

  update public.user_plan_workouts upw
  set scheduled_date = v_start + (upw.week_number - v_week) * 7 + (w.day_of_week - 1)
  from public.plan_workouts w
  where w.id = upw.plan_workout_id
    and upw.user_plan_id = v_user_plan
    and upw.week_number > v_week
    and upw.status = 'scheduled';

  update public.user_plans
  set current_attempt = v_attempt + 1, current_week_started_on = v_start
  where id = v_user_plan;

  return public.plan_week_state(v_user, p_today);
end;
$$;

revoke execute on function public.get_plan_week_status(date) from public, anon;
grant execute on function public.get_plan_week_status(date) to authenticated;
revoke execute on function public.advance_plan_week(date) from public, anon;
grant execute on function public.advance_plan_week(date) to authenticated;
revoke execute on function public.repeat_plan_week(date) from public, anon;
grant execute on function public.repeat_plan_week(date) to authenticated;
```

Regras resultantes (para conferir):
- Semana **encerrada** = hoje passou do domingo da semana atual, OU toda sessão elegível da
  tentativa atual já está em `completed`/`interrupted`.
- **Aderência (BR-01)** = `completed / eligible` da tentativa atual; `eligible` = linhas da
  tentativa atual com status diferente de `cancelled`. Descanso não tem linha, logo não entra.
  `null` quando não há sessão elegível.
- **Avançar (BR-03)** exige semana encerrada E `completed >= ceil(eligible × 2/3)` E semana seguinte
  liberada. Nunca acontece sozinho: só pela RPC `advance_plan_week`, chamada por toque do usuário.
- Avançar na última semana (`current_week >= full_weeks`) marca o plano `completed` e retorna `null`.
- **Repetir (PLAN-04)** exige semana encerrada. Cria novas linhas (tentativa + 1) e mantém as da
  tentativa anterior intactas (histórico preservado).
- Data de início da próxima semana = o maior entre (segunda da semana atual + 7) e (próxima segunda
  a partir de hoje; se hoje é segunda, hoje). Semanas futuras são remarcadas a partir dela.

## 5. Tipos e dados no app

### 5.1 `types/training.ts`

- `UserPlanWorkoutStatus = 'scheduled' | 'in_progress' | 'paused' | 'completed' | 'interrupted' | 'cancelled'`.
- `PlanSessionState = 'completed' | 'in_progress' | 'interrupted' | 'cancelled' | 'missed' | 'today' | 'pending'`.
- `UserPlanWorkoutRow`: acrescentar `week_number: number; attempt: number; started_at: string | null;
  interrupted_at: string | null; interruption_reason: string | null;`.
- `UserPlanRow`: acrescentar `current_attempt: number; current_week_started_on: string;`.
- `PlanSession`: acrescentar `attempt: number;`.
- Nova interface `AttemptSummary { attempt: number; completed: number; eligible: number; }`.
- `PlanWeek`: acrescentar `attempt: number; history: AttemptSummary[];` (`done` passa a contar
  `completed`; `total` conta as sessões não canceladas da tentativa exibida).
- `ActivePlan`: acrescentar `currentWeek: number; currentAttempt: number; currentWeekStartedOn: string;`.
- Novo tipo `WeekBlockReason = 'not_closed' | 'below_minimum' | 'locked'` e interface
  `PlanWeekStatus { userPlanId: string; currentWeek: number; currentAttempt: number;
  weekStartedOn: string; weekEndsOn: string; eligible: number; completed: number; minimum: number;
  adherence: number | null; closed: boolean; canAdvance: boolean; canRepeat: boolean;
  isLastWeek: boolean; blockReason: WeekBlockReason | null; }`.

### 5.2 `lib/planParsers.ts`

- `sessionStatuses` com os 6 valores novos.
- `SessionRow` ganha `weekNumber: number; attempt: number;` lidos de `week_number` e `attempt`
  (linha sem `week_number` numérico é descartada; `attempt` ausente vira 1).
- `ParsedUserPlan` ganha `currentWeek`, `currentAttempt`, `currentWeekStartedOn` lidos de
  `current_week` (padrão 1), `current_attempt` (padrão 1), `current_week_started_on`
  (padrão = `mondayOf(startedAt)`).

### 5.3 `lib/planQueries.ts`

- `userPlanSelect` inclui `current_week,current_attempt,current_week_started_on`.
- `sessionSelect` inclui `week_number,attempt`.
- `assemble` deixa de usar `Map` por `planWorkoutId` (agora há várias linhas por treino). Para cada
  semana: pegue as linhas com `weekNumber` igual; a tentativa exibida é a maior `attempt` entre elas
  (1 se não houver linha); `sessions` = linhas dessa tentativa cujo `planWorkoutId` existe nos
  `workouts` da semana, montadas como hoje (+ `attempt`), ignorando `cancelled`; `history` = para
  cada tentativa menor, `{ attempt, completed, eligible }` (eligible = não canceladas), em ordem
  crescente; `done` = sessões com status `completed`; `total` = `sessions.length`.
- Retorna também `currentWeek`, `currentAttempt`, `currentWeekStartedOn`.

### 5.4 `lib/planProgress.ts`

- `sessionState` segue a tabela 2.2.
- `currentWeekNumber(plan)` passa a retornar `plan.currentWeek` (remova o parâmetro `today`;
  ajuste quem chama: `app/(app)/(tabs)/plan/index.tsx` e `components/home/PlanCard.tsx`).
- `weekStartDate(plan, weekNumber, today)` vira `weekStartDate(plan, week)`: se
  `week.weekNumber === plan.currentWeek` retorna `plan.currentWeekStartedOn`; senão
  `mondayOf(menor date das sessions)`; sem sessões, `addDays(plan.currentWeekStartedOn, (week.weekNumber - plan.currentWeek) * 7)`.
  Remova `planAnchor` se ficar sem uso.
- `nextSession`: considera só estados `today`, `pending` e `in_progress`, e só sessões com
  `weekNumber <= plan.currentWeek`.
- `planProgress`: conta `status === 'completed'`.
- Nova `sessionMetaLabel(workout)`: junta com ` · ` o `sessionTargetLabel(workout)` e o
  `intensityLabel(workout.intensity)`, ignorando nulos; retorna `null` se ambos nulos.
  Ex.: `30 min · Leve`.

### 5.5 `lib/planSessionRpc.ts` (novo)

```ts
export type SessionTransition = 'in_progress' | 'paused' | 'interrupted';
export type InterruptReason = 'discarded' | 'too_short';
export async function reportPlanSession(sessionId: string, to: SessionTransition, reason?: InterruptReason): Promise<void>
```
Chama `supabase.rpc('transition_plan_session', { p_session, p_to, p_reason: reason ?? null })`.
Melhor esforço: sem Supabase, erro de rede ou erro da RPC → retorna sem lançar e sem UI. Depois de
sucesso, chama `notifyActivitiesChanged()` de `lib/activityQueue.ts` (já existe) para o plano recarregar.

### 5.6 `lib/planWeekStatus.ts` (novo)

- `parsePlanWeekStatus(value: unknown): PlanWeekStatus | null` (snake_case → camelCase; `null`
  ou objeto inválido → `null`; `block_reason` fora do tipo → `null`).
- `fetchPlanWeekStatus(today: string)`, `advancePlanWeek(today: string)`, `repeatPlanWeek(today: string)`:
  chamam as RPCs `get_plan_week_status`, `advance_plan_week`, `repeat_plan_week` com `{ p_today: today }`
  e retornam `PlanWeekStatus | null`. Erro da RPC → `throw new Error(error.message)`.

### 5.7 `hooks/usePlanWeekStatus.ts` (novo)

`usePlanWeekStatus(): { status: PlanWeekStatus | null; loading: boolean; busy: boolean; error: string | null; advance: () => Promise<void>; repeat: () => Promise<void>; reload: () => Promise<void> }`
- Carrega no foco (`useFocusEffect`) com `localToday()`.
- `advance`/`repeat`: `busy` true; chamam a RPC; em sucesso chamam `clearActivePlanCache()` e
  `reload` próprio, e o `reload` de `useActivePlan` é responsabilidade da tela (ver 6.4). Em erro
  `error = 'Não foi possível atualizar a semana.'`.
- Erro de carga: `error = 'Não foi possível carregar a semana.'`.

### 5.8 `hooks/usePlanSessionReporter.ts` (novo)

`usePlanSessionReporter(sessionId: string | null, running: boolean): void`
- Se `sessionId === null`, não faz nada.
- Quando `running` vira `true` → `reportPlanSession(id, 'in_progress')`.
- Quando `running` vira `false` depois de já ter sido `true` nesta montagem → `reportPlanSession(id, 'paused')`.
- Não reporta no primeiro render se `running` for `false`.

## 6. Telas e componentes

### 6.1 `components/plan/SessionStatus.tsx`

`sessionStateLabels` com os 7 estados da tabela 2.2. Ícones (lucide) e cores:
`completed` → `CheckCircle` checked, `colors.primaryDeep`; `in_progress` → `CirclePlay`, `colors.ink`;
`interrupted` → `CircleSlash`, `colors.danger`; `missed` → `CircleX`, `colors.danger`;
`cancelled` → `CircleMinus`, `colors.textSecondary`; `today` → `Circle`, `colors.ink` (texto
`captionStrong`); `pending` → `Circle`, `colors.textSecondary`.

### 6.2 `components/plan/DayRow.tsx` (US-PLAN-01 CA1, CA2; PLAN-03)

- Linha de meta da sessão usa `sessionMetaLabel(session.workout)` no lugar de `sessionTargetLabel`.
- Dia sem sessão continua mostrando o ícone `Moon` + "Descanso".

### 6.3 `components/plan/WeekStatusCard.tsx` (novo)

Props: `status: PlanWeekStatus; busy: boolean; error: string | null; onAdvance: () => void; onRepeat: () => void; onUnlock: () => void`.
Dentro de `Card`:
- Título `captionStrong`: `Semana ${currentWeek}` + (se `currentAttempt > 1`) ` · tentativa ${currentAttempt}`.
- Linha: `${completed} de ${eligible} treinos concluídos` e, se `adherence !== null`,
  ` · aderência ${Math.round(adherence * 100)}%`.
- Se `!closed`: texto `A próxima semana libera quando esta terminar.` e nenhum botão.
- Se `closed` e `blockReason === 'below_minimum'`: texto
  `Conclua pelo menos ${minimum} treinos para avançar. Repita a semana para seguir no seu ritmo.`
  + botão `Repetir semana` (`onRepeat`).
- Se `closed` e `blockReason === 'locked'`: texto `As próximas semanas fazem parte do Premium.` +
  botão `Ver planos` (`onUnlock`) + botão secundário `Repetir semana`.
- Se `canAdvance`: texto `Semana encerrada.` + botão `isLastWeek ? 'Concluir plano' : 'Avançar para a semana ' + (currentWeek + 1)`
  (`onAdvance`) + botão secundário `Repetir semana`.
- Botões desabilitados com `busy`. `error` aparece com `InlineError`.
- Botão principal com a variante padrão do `Button`; "Repetir semana" secundário usa `variant="secondary"`.

### 6.4 `app/(app)/(tabs)/plan/index.tsx`

- Usa `currentWeekNumber(plan)`.
- Abaixo do `PlanHero`, se `usePlanWeekStatus().status` não for `null`, renderiza `WeekStatusCard`;
  `onAdvance`/`onRepeat` chamam a ação e depois `reload()` de `useActivePlan`; `onUnlock` faz
  `router.push('/plan-paywall')`.

### 6.5 `app/(app)/(tabs)/plan/week/[week].tsx` (CA3)

- `weekDays(week, weekStartDate(plan, week))`.
- Texto do topo: `${done} de ${total} treinos` (inalterado).
- Se `week.history.length > 0`, abaixo dos dias renderiza `AttemptHistory` (novo,
  `components/plan/AttemptHistory.tsx`): título `captionStrong` `Tentativas anteriores` e uma linha
  por item: `Tentativa ${attempt}: ${completed} de ${eligible} treinos concluídos`.
- Semana com `weekNumber > plan.currentWeek`: `DayRow` não navega para a sessão (passe
  `onSessionPress` que não faz nada) e aparece o texto `Libera quando você avançar de semana.` acima
  dos dias.

### 6.6 `components/plan/WeekList.tsx`

Só ajuste se algum campo usado mudou de nome; a lógica `done/total` continua.

### 6.7 `app/(app)/(tabs)/plan/session/[id].tsx`

- O botão `Começar treino`/`Retomar treino` só aparece quando o estado for `today`, `pending`,
  `missed`, `in_progress` ou `interrupted` E `session.weekNumber === plan.currentWeek` E
  `session.attempt === plan.currentAttempt`. Caso contrário, sem botão; para semana futura mostre
  `Libera quando você avançar de semana.`.
- Estado `completed` mantém o texto atual de concluída. Adapte comparações com `'done'` para `'completed'`.

### 6.8 `components/home/TodayCard.tsx` e `PlanCard.tsx`

- `TodayCard`: troque `!== 'done'` por `!== 'completed'`.
- `PlanCard`: `currentWeekNumber(plan)`.

### 6.9 Treino (`app/(app)/workout/[id].tsx` e `hooks/useFinishWorkout.ts`)

- Em `WorkoutContent`, chame `usePlanSessionReporter(userPlanWorkoutId, running)`.
- Em `leave()`, antes de `router.back()`, se `userPlanWorkoutId !== null`, chame
  `void reportPlanSession(userPlanWorkoutId, 'interrupted', 'discarded')`.
- Em `useFinishWorkout`, no ramo `elapsedSeconds < MIN_SAVE_SECONDS`, se `userPlanWorkoutId !== null`,
  chame `void reportPlanSession(userPlanWorkoutId, 'interrupted', 'too_short')`.
- A conclusão continua vindo do trigger ao inserir a atividade (nada muda no salvamento).
- Se `[id].tsx` passar de 200 linhas, extraia `leave` e o hook para `hooks/useWorkoutLeave.ts`.

## 7. Documentação

- `docs/banco-de-dados.md`: seção de `user_plan_workouts` com os 6 estados, colunas novas
  (`week_number`, `attempt`, `started_at`, `interrupted_at`, `interruption_reason`), colunas novas
  de `user_plans` (`current_attempt`, `current_week_started_on`), RPCs novas e o fim do update
  direto pelo cliente.
- `docs/planos.md`: seção "Semanas: encerrar, avançar e repetir" com as regras do fim da seção 4.

## 8. Critérios de aceite

PRD:
- **US-PLAN-01 CA1**: na tela da semana, os 7 dias aparecem; dia com treino mostra título e
  `duração/distância · intensidade`; dia sem treino mostra "Descanso" com ícone de lua (PLAN-03).
- **US-PLAN-01 CA2**: concluída ("Concluído", check), pendente ("Pendente"/"Hoje") e interrompida
  ("Interrompido", ícone `CircleSlash`) têm rótulo e ícone diferentes.
- **US-PLAN-01 CA3 / PLAN-04**: após `repeat_plan_week`, as linhas da tentativa anterior continuam
  no banco com os mesmos status/atividades, e a tela mostra "Tentativas anteriores".
- **US-PLAN-01 CA4 / BR-03**: com a semana encerrada e menos de `ceil(2/3)` concluídas,
  `advance_plan_week` falha com `cannot_advance:below_minimum`; passar do domingo nunca muda
  `user_plans.current_week` sozinho.
- **BR-01**: `get_plan_week_status` retorna `adherence = completed / eligible` só da tentativa
  atual; dias de descanso não contam (não há linha) e `cancelled` sai do denominador.
- **BR-02**: os 6 estados existem no check do banco; cliente não tem mais `update` em
  `user_plan_workouts` nem em `user_plans`; `transition_plan_session` recusa
  `completed→in_progress`, `scheduled→paused` e `scheduled→interrupted` com `invalid_transition`.

Verificáveis por leitura/execução local:
- [ ] As duas migrations existem com o conteúdo das seções 3 e 4 e não foram aplicadas.
- [ ] Nenhum `'planned'`, `'done'` (como status de sessão) ou `'skipped'` (como status de sessão)
  restante em `app/ components/ hooks/ lib/ types/` (`grep -rnE "'planned'|'skipped'" app components hooks lib types`
  só pode achar o `'skipped'` do `PerceivedEffortPicker`).
- [ ] Começar treino do plano chama `in_progress`; pausar chama `paused`; retomar chama `in_progress`;
  voltar/descartar chama `interrupted/discarded`; finalizar com menos de 10 s chama `interrupted/too_short`.
- [ ] Falha dessas chamadas não aparece para o usuário nem bloqueia o treino.
- [ ] `WeekStatusCard` mostra os 4 cenários do 6.3 com os textos exatos.
- [ ] `npx tsc --noEmit` e `npx eslint .` sem erros; nenhum arquivo tocado passa de 200 linhas.

## 9. Fora desta fase

- Evento `weekly_goal_completed` e demais eventos de analytics (fase de instrumentação).
- Reagendar sessão (PLAN-05, P1) e cancelamento manual de sessão pelo usuário.
- Teste SQL automatizado das RPCs (não há suíte de banco local configurada); validar quando as
  migrations forem aplicadas em ambiente de teste.
