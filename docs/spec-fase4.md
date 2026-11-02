# Spec — Fase 4: dashboard, progresso e conquistas

Cobre DASH-01, DASH-02 (já atendido, só mantido), DASH-03, US-DASH-01 (CA1–CA3), GAME-01,
US-GAME-01 (CA1–CA3) e BR-06 do PRD (`docs/prd-v1.md`).
Decisões provisórias novas: DP-29 a DP-36 em `docs/decisoes-provisorias-prd.md`.
Depende da fase 3 (`get_plan_week_status`, estados de sessão, trigger `link_activity_to_plan_workout`).

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
| criar | `supabase/migrations/20261102040000_achievements_progress.sql` |
| criar | `types/achievements.ts` |
| criar | `types/progress.ts` |
| criar | `lib/achievements.ts` |
| criar | `lib/progressSummary.ts` |
| criar | `hooks/useAchievements.ts` |
| criar | `hooks/useProgressSummary.ts` |
| criar | `components/achievements/AchievementRow.tsx` |
| criar | `components/home/NoPlanCard.tsx` |
| criar | `components/activities/HistoryHeader.tsx` |
| criar | `app/(app)/achievements.tsx` |
| alterar | `app/(app)/_layout.tsx` |
| alterar | `app/(app)/(tabs)/index.tsx` |
| alterar | `app/(app)/(tabs)/activities.tsx` |
| alterar | `components/home/WeekProgressCard.tsx` |
| alterar | `docs/banco-de-dados.md` |
| alterar | `docs/planos.md` |

Nada é removido. Nenhuma Edge Function muda. `PlanCard`, `TodayCard` e `QuickAccess` não mudam.

## 2. Banco — migration (NÃO aplicar)

`supabase/migrations/20261102040000_achievements_progress.sql`, conteúdo exato:

```sql
insert into public.achievements (code, title, description, kind, metric, threshold)
values
  ('first_workout', 'Primeiro treino', 'Você concluiu seu primeiro treino no Paceless.', 'milestone', 'activities_count', 1),
  ('first_week_completed', 'Semana concluída', 'Você concluiu todos os treinos de uma semana do plano.', 'milestone', 'weeks_met', 1)
on conflict (code) do nothing;

create or replace function public.award_achievements_for_activity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_plan uuid;
  v_week smallint;
  v_attempt smallint;
  v_eligible int;
  v_completed int;
begin
  if new.source <> 'paceless' then
    return new;
  end if;

  insert into public.user_achievements (user_id, achievement_id, activity_id)
  select new.user_id, a.id, new.id
  from public.achievements a
  where a.code = 'first_workout'
  on conflict (user_id, achievement_id) do nothing;

  if new.user_plan_workout_id is null then
    return new;
  end if;

  select user_plan_id, week_number, attempt
  into v_plan, v_week, v_attempt
  from public.user_plan_workouts
  where id = new.user_plan_workout_id
    and user_id = new.user_id
    and status = 'completed'
    and activity_id = new.id;

  if not found then
    return new;
  end if;

  select
    count(*) filter (where status <> 'cancelled'),
    count(*) filter (where status = 'completed')
  into v_eligible, v_completed
  from public.user_plan_workouts
  where user_plan_id = v_plan and week_number = v_week and attempt = v_attempt;

  if v_eligible > 0 and v_completed = v_eligible then
    insert into public.user_achievements (user_id, achievement_id, activity_id)
    select new.user_id, a.id, new.id
    from public.achievements a
    where a.code = 'first_week_completed'
    on conflict (user_id, achievement_id) do nothing;
  end if;

  return new;
end;
$$;

revoke execute on function public.award_achievements_for_activity() from public, anon, authenticated;

create trigger activities_post_award_achievements
after insert on public.activities
for each row
execute function public.award_achievements_for_activity();

create function public.get_progress_summary(p_today date)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_start date;
  v_week jsonb;
  v_total jsonb;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  if abs(p_today - (now() at time zone 'America/Sao_Paulo')::date) > 1 then
    raise exception 'invalid_today' using errcode = 'P0001';
  end if;

  v_start := (date_trunc('week', p_today))::date;

  select jsonb_build_object(
    'sessions', count(*),
    'distance_meters', coalesce(sum(distance_meters), 0),
    'duration_seconds', coalesce(sum(duration_seconds), 0)
  )
  into v_week
  from public.activities
  where user_id = v_user
    and (started_at at time zone 'America/Sao_Paulo')::date between v_start and v_start + 6;

  select jsonb_build_object(
    'sessions', count(*),
    'distance_meters', coalesce(sum(distance_meters), 0),
    'duration_seconds', coalesce(sum(duration_seconds), 0)
  )
  into v_total
  from public.activities
  where user_id = v_user;

  return jsonb_build_object('week_start', v_start, 'week', v_week, 'total', v_total);
end;
$$;

revoke execute on function public.get_progress_summary(date) from public, anon;
grant execute on function public.get_progress_summary(date) to authenticated;
```

Por que o nome `activities_post_award_achievements`: no Postgres, triggers `after insert` da mesma
tabela disparam em ordem alfabética. `activities_post_...` vem depois de
`activities_link_plan_workout`, então a sessão já está `completed` quando a conquista é avaliada.
Não renomeie.

Regras resultantes (para conferir):
- **GAME-01 / US-GAME-01 CA1 / BR-06**: cada conquista é única por `(user_id, achievement_id)`
  (constraint já existente) e o insert usa `on conflict do nothing`. Reenvio da mesma atividade
  não dispara o trigger (upsert com `ignoreDuplicates` da fase 2), e mesmo que dispare não duplica.
- `first_workout`: primeira atividade com `source = 'paceless'` (corrida, caminhada ou musculação
  registradas no app). Importadas de HealthKit/Health Connect não contam (DP-30).
- `first_week_completed`: a atividade que conclui a última sessão elegível de uma tentativa de
  semana (`completed = eligible`, `eligible` exclui `cancelled`). Descanso não tem linha, então nunca
  entra na conta (US-GAME-01 CA2, BR-06). Sessão `interrupted` conta como não concluída até ser
  completada por uma atividade (DP-31).
- O cliente continua só com `select` em `user_achievements`; quem concede é só o trigger.
- Apagar a atividade não remove a conquista (`activity_id` vira nulo pela FK existente) (DP-33).

## 3. Tipos

### 3.1 `types/achievements.ts`

```ts
export interface Achievement {
  id: string;
  code: string;
  title: string;
  description: string | null;
  earnedAt: Date | null;
}
```

### 3.2 `types/progress.ts`

```ts
export interface ProgressTotals {
  sessions: number;
  distanceMeters: number;
  durationSeconds: number;
}

export interface ProgressSummary {
  weekStart: string;
  week: ProgressTotals;
  total: ProgressTotals;
}
```

## 4. Dados no app

### 4.1 `lib/achievements.ts`

- `export async function fetchAchievements(): Promise<Achievement[]>`
  - Se `!supabase`, lança `Error('Supabase não configurado.')`.
  - Faz, em paralelo (`Promise.all`):
    - `supabase.from('achievements').select('id,code,title,description,threshold').order('threshold', { ascending: true }).order('code', { ascending: true })`
    - `supabase.from('user_achievements').select('achievement_id,earned_at')`
  - Se qualquer `error`, lança `Error(error.message)`.
  - Valida cada linha com `isRecord` (de `@/lib/activities`) e `typeof`; linha inválida é descartada.
  - Monta um `Map<string, Date>` de `achievement_id → new Date(earned_at)`.
  - Retorna o catálogo na ordem da query, com `earnedAt` do mapa ou `null`, e então ordena de forma
    estável: conquistadas primeiro (mais recente primeiro), depois as não conquistadas na ordem
    original.
- `export function formatEarnedDate(date: Date): string` → `dd/mm/aaaa` com `padStart(2, '0')`
  em dia e mês (data local).

### 4.2 `lib/progressSummary.ts`

- `export function parseProgressSummary(value: unknown): ProgressSummary | null`: exige
  `week_start` string e `week`/`total` objetos com `sessions`, `distance_meters`,
  `duration_seconds` numéricos finitos (aceite também string numérica, porque `numeric` do Postgres
  pode chegar como string: use `Number(value)` e `Number.isFinite`). Qualquer falta → `null`.
- `export async function fetchProgressSummary(today: string): Promise<ProgressSummary | null>`:
  `supabase.rpc('get_progress_summary', { p_today: today })`; `!supabase` ou `error` → lança
  `Error`; retorna `parseProgressSummary(data)`.

### 4.3 `hooks/useAchievements.ts`

```ts
export interface UseAchievements {
  achievements: Achievement[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}
```

- Estado inicial: `[]`, `loading = true`, `error = null`.
- `reload`: chama `fetchAchievements()`; sucesso → grava lista e `error = null`; falha →
  `error = 'Não foi possível carregar suas conquistas.'` (mantém a lista anterior); sempre
  `loading = false` no fim.
- Recarrega em `useFocusEffect` e quando `subscribeActivityChanges` (de `@/lib/activityQueue`)
  notificar (mesmo padrão de `useActivities`).

### 4.4 `hooks/useProgressSummary.ts`

```ts
export interface UseProgressSummary {
  summary: ProgressSummary | null;
  error: boolean;
  reload: () => Promise<void>;
}
```

- `reload`: `fetchProgressSummary(localToday())` (de `@/lib/planDates`); sucesso → `summary` e
  `error = false`; falha → `error = true` (mantém o `summary` anterior).
- Recarrega em `useFocusEffect` e em `subscribeActivityChanges`.

## 5. Telas e componentes

### 5.1 `components/home/WeekProgressCard.tsx` (DASH-01, US-DASH-01 CA2)

Novas props: `{ activities: readonly Activity[]; status: PlanWeekStatus | null }`
(`PlanWeekStatus` de `@/types/planWeek`).

- `status === null` ou `status.eligible === 0`: comportamento atual sem mudança (contagem por
  atividades da semana).
- Caso contrário (plano ativo):
  - Título `Progresso da semana` (igual).
  - Linha 1 (`caption`, `textSecondary`): `Semana ${currentWeek}` e, se `currentAttempt > 1`,
    ` · tentativa ${currentAttempt}`.
  - `ProgressBar` com `progress = completed / eligible`, `marginTop: spacing.sm`,
    `accessibilityValue={{ min: 0, max: eligible, now: completed }}`.
  - Linha 2 (`caption`): `${completed} de ${eligible} treinos concluídos` e, se
    `adherence !== null`, ` · aderência ${Math.round(adherence * 100)}%`.
  - Linha 3 (`caption`, `textSecondary`): `Dias de descanso fazem parte do plano e não contam como falta.`
  - Linha de totais (distância e tempo das atividades da semana) continua, igual à de hoje, só se
    houver atividade na semana.
- Não use cor de erro/perigo em nenhum caso (US-GAME-01 CA3: sem pressão por treinar além do plano).

### 5.2 `components/home/NoPlanCard.tsx` (US-DASH-01 CA3)

Props: nenhuma. `Card` com:
- Título `title3`: `Você ainda não tem um plano ativo`.
- Texto `caption`, `textSecondary`: `Responda algumas perguntas e gere um plano para começar.`
- `Button` (`variant` padrão) `Criar meu plano`, `marginTop: spacing.md`, que faz
  `router.push('/plan/settings')`.

### 5.3 `app/(app)/(tabs)/index.tsx` (DASH-01, DASH-02, US-DASH-01)

- Adicione `const { status } = usePlanWeekStatus();` (hook da fase 3).
- Saudação: mantém `Olá, {primeiro nome}!`. Subtítulo passa a ser:
  - plano ativo → `Pronto para o seu treino de hoje?` (igual);
  - sem plano (`!planLoading && plan === null`) → `Vamos montar seu plano de treino?`.
- Ordem dos blocos depois da saudação:
  1. Sem plano (`!planLoading && plan === null`): `<NoPlanCard />` no lugar de `PlanCard`.
     Com plano ou carregando: `<PlanCard plan={plan} loading={planLoading} />` (igual).
  2. `<WeekProgressCard activities={activities} status={plan ? status : null} />`.
  3. `<TodayCard ... />` (igual; é o "próximo treino" de US-DASH-01 CA1).
  4. `LastWorkoutCard`, botão `Iniciar treino`, `QuickAccess` (iguais).
- Ao voltar o foco para a Início, `usePlanWeekStatus` já recarrega sozinho; não chame nada extra.

### 5.4 `components/achievements/AchievementRow.tsx` (GAME-01)

Props: `{ achievement: Achievement; divider: boolean }`. Usa `ListRow` de `@/components`:
- `title`: `achievement.title`.
- `subtitle`: `achievement.description ?? undefined`.
- `meta`: conquistada → `Conquistada em ${formatEarnedDate(earnedAt)}`; não conquistada →
  `Ainda não conquistada`.
- `leading`: `IconBadge` com `tone="primary"` e ícone `Trophy` (cor `colors.onPrimary`) se
  conquistada; senão `IconBadge` com `tone="neutral"` e ícone `Lock`
  (cor `colors.textSecondary`). Tamanhos: `size={sizes.badgeSm}` no badge e `sizes.iconMd` no
  ícone, `strokeWidth={sizes.iconStroke}`.
- `showChevron={false}`, sem `onPress`.
- `accessibilityLabel`: `${title}. ${meta}`.

### 5.5 `app/(app)/achievements.tsx` (GAME-01)

- `Screen` + `ScreenHeader` com `title="Conquistas"` e `showBack`.
- Usa `useAchievements()`.
- Carregando sem lista: `ActivityIndicator` (`colors.primaryDeep`).
- Erro sem lista: `EmptyState` título `Não foi possível carregar suas conquistas.` e ação
  `Button` `variant="secondary"` `Tentar novamente` →
  `reload()`.
- Lista vazia sem erro: `EmptyState` título `Nenhuma conquista disponível ainda.`.
- Lista: cabeçalho `captionStrong` `${conquistadas} de ${total} conquistadas` e um `Card` com as
  linhas `AchievementRow` (`divider` em todas menos a última).
- Erro com lista: lista continua e aparece `InlineError` com o texto do erro acima do `Card`.
- Nenhum texto de pressão ("não perca", "não pare", etc.) (US-GAME-01 CA3).

### 5.6 `app/(app)/_layout.tsx`

Adicione `<Stack.Screen name="achievements" />` depois de `plan-paywall`. Nada mais muda.

### 5.7 `components/activities/HistoryHeader.tsx` e `app/(app)/(tabs)/activities.tsx` (DASH-03)

Mova o cabeçalho da lista (`header`) de `activities.tsx` para `HistoryHeader`, com props
`{ weekStats: Stat[]; total: ProgressTotals | null; showError: boolean }`:
- `Esta semana` + `Card` com `StatRow` de `weekStats` (igual a hoje, calculado no cliente para
  incluir atividades da fila offline).
- Se `total !== null`: `captionStrong` `Desde o início` + `Card` com `StatRow`:
  `{ value: String(total.sessions), label: 'Sessões' }`,
  `{ value: formatWeekDistance(total.distanceMeters, distanceUnit), label: distanceLabel(distanceUnit) }`,
  `{ value: formatDuration(total.durationSeconds), label: 'Tempo' }`.
  (`distanceUnit` via `usePreferences` dentro do componente.)
- `ListRow` dentro de um `Card`: `title="Conquistas"`, ícone `Trophy` em `leading`,
  `showChevron`, `onPress` → `router.push('/achievements')`.
- `showError` → o texto de erro atual (`Não foi possível carregar seus treinos.`).

Em `activities.tsx`: use `useProgressSummary()`; passe `total={summary?.total ?? null}`. Se a RPC
falhar, o bloco "Desde o início" simplesmente não aparece (sem mensagem extra). O restante da tela
não muda.

## 6. Documentação

- `docs/banco-de-dados.md`: na linha de `achievements`, citar os 2 códigos semeados; na de
  `user_achievements`, citar o trigger `activities_post_award_achievements`; incluir a RPC
  `get_progress_summary`.
- `docs/planos.md`: seção curta "Conquistas e progresso" com as regras do fim da seção 2.

## 7. Critérios de aceite

PRD:
- **DASH-01 / US-DASH-01 CA1**: com plano ativo, a Início mostra saudação, `PlanCard` (semana N de
  M), `WeekProgressCard` com a barra e `X de Y treinos concluídos`, e `TodayCard` com a próxima
  sessão elegível.
- **US-DASH-01 CA2**: o progresso da Início vem de `get_plan_week_status` (`completed/eligible`);
  descanso não aparece no denominador e o card diz que descanso não conta como falta.
- **US-DASH-01 CA3**: sem plano ativo (nunca gerado, não disponível ou concluído), a Início mostra
  `NoPlanCard` com `Criar meu plano` levando a `/plan/settings`.
- **DASH-02**: `QuickAccess` (Musculação, Nutrição, Plano) e `Iniciar treino` continuam na Início.
- **DASH-03**: Atividades mostra `Esta semana` e `Desde o início` com sessões, distância e tempo, e
  o histórico em lista (já existente).
- **GAME-01**: existem as conquistas `first_workout` e `first_week_completed`, concedidas só pelo
  trigger no servidor e listadas em `Conquistas`.
- **US-GAME-01 CA1 / BR-06**: inserir a mesma conquista de novo não cria segunda linha
  (`unique` + `on conflict do nothing`); uma segunda semana concluída não gera nova linha.
- **US-GAME-01 CA2 / BR-06**: uma semana com 3 sessões e 4 dias de descanso, com as 3 concluídas,
  concede `first_week_completed`.
- **US-GAME-01 CA3**: nenhuma conquista premia treino fora do plano, sequência diária ou volume
  extra; nenhum texto novo pressiona a treinar.

Verificáveis por leitura/execução local:
- [ ] A migration existe com o conteúdo exato da seção 2 e não foi aplicada.
- [ ] `grep -rn "user_achievements" app components hooks lib` só acha `select` (nenhum insert/update).
- [ ] `app/(app)/achievements.tsx` trata carregando, erro sem lista, lista vazia e lista com erro.
- [ ] `WeekProgressCard` sem plano continua idêntico ao comportamento anterior.
- [ ] `npx tsc --noEmit` e `npx eslint .` sem erros; nenhum arquivo tocado passa de 200 linhas.

## 8. Fora desta fase

- Aviso/animação de "conquista desbloqueada" no resumo do treino (precisa reler conquistas após
  salvar; fica para depois).
- Evento `achievement_awarded` e `weekly_goal_completed` (fase de instrumentação).
- XP, níveis, sequências, temporadas e mascote (GAME-02..04, P1/P2).
- Gráficos por período/modalidade e maior corrida contínua (DASH-04/05, P1).
- Backfill de conquistas para usuários com dados antigos (DP-34: base será zerada).
- Teste SQL automatizado do trigger e da RPC (sem suíte de banco local); validar quando a migration
  for aplicada em ambiente de teste.
