# Spec — Fase 1: fluxo de primeiro acesso alinhado ao PRD

Fonte: `docs/prd-v1.md` (PRD v1.0). Decisões provisórias: `docs/decisoes-provisorias-prd.md`
(itens `DP-xx` citados abaixo). Esta spec é para implementação direta, sem interpretação.

## 0. Regras para quem implementa

- Trabalhe só neste worktree. Não faça push, não aplique migration, não faça deploy de função,
  não inicie Expo/web, não instale biblioteca.
- Sem comentários em arquivos `.ts/.tsx`. Sem `any`. Estilo só por tokens de `@/theme`.
  Ícones só `lucide-react-native`. Texto de UI em PT-BR, código em inglês.
- Arquivos com no máximo 200 linhas.
- Ao final rode, nesta ordem, e corrija tudo:
  1. `npx tsc --noEmit`
  2. `npx eslint . --max-warnings 0`
  3. `node --test supabase/functions/_shared/plan/generate.test.ts`
- Faça na ordem das etapas (seção 9). Cada etapa termina com tsc verde.

## 1. Fluxo alvo

```
boas-vindas → cadastro/login/Google/Apple → (área autenticada)
  objetivo → dias por semana → quais dias → nível → gerando plano
     ├─ plano gerado       → "Seu plano está pronto" → paywall (fechável) → Início
     ├─ nível não elegível → "Seu plano ainda não está disponível" → Início (sem plano, sem paywall)
     └─ falha de rede      → mensagem + "Tentar novamente" (não conclui o onboarding)
```

Regra do portão (gate): toda sessão autenticada cujo `profiles.onboarding_completed_at` é
`null` é levada para `/onboarding`, que abre na primeira etapa pendente. Vale para e-mail,
Google, Apple, link de confirmação e reabertura do app.

## 2. Valores novos (app e Edge Function usam os mesmos)

| Campo | Valor (`text`) | Rótulo na UI | Descrição na UI |
|---|---|---|---|
| goal | `complete_5k` | Completar 5 km | — |
| goal | `race` | Fazer uma prova | — |
| goal | `fitness` | Ganhar condicionamento | — |
| goal | `weight_loss` | Emagrecer | — |
| level | `total_beginner` | Iniciante total | Não corro ou estou voltando agora |
| level | `beginner` | Iniciante | Corro trechos curtos, mas ainda não 5 km sem parar |
| level | `intermediate` | Intermediário | Já corro 5 km sem parar |
| level | `advanced` | Avançado | Treino corrida com regularidade há bastante tempo |

`days_per_week` (`two | three | four | five_plus`), `training_days` e `strength`
(`yes | maybe_later | no`) não mudam de valores. `strength` passa a ter default `'no'` e não
é mais perguntado no onboarding (DP-04).

Níveis elegíveis ao plano-base: `total_beginner` e `beginner` (DP-01).

## 3. Banco — migration nova (NÃO aplicar)

Criar `supabase/migrations/20261102000000_prd_onboarding_values.sql` com exatamente:

```sql
update public.profiles
set goal = null, level = null, onboarding_completed_at = null
where goal is not null or level is not null;

update public.profiles set strength = 'no' where strength is null;

alter table public.profiles drop constraint if exists profiles_goal_check;
alter table public.profiles drop constraint if exists profiles_level_check;
alter table public.profiles
  add constraint profiles_goal_check
    check (goal in ('complete_5k', 'race', 'fitness', 'weight_loss')),
  add constraint profiles_level_check
    check (level in ('total_beginner', 'beginner', 'intermediate', 'advanced'));

alter table public.profiles alter column strength set default 'no';
alter table public.profiles alter column strength set not null;

alter table public.profiles alter column onboarding_completed_at set default null;
comment on column public.profiles.onboarding_completed_at is
  'Set when the first-access flow finishes (plan generated or level not eligible). Null means the user must be sent to the pending onboarding step.';

alter table public.plans drop constraint if exists plans_goal_check;
alter table public.plans drop constraint if exists plans_level_check;
alter table public.plans
  add constraint plans_goal_check
    check (goal in ('complete_5k', 'race', 'fitness', 'weight_loss')) not valid,
  add constraint plans_level_check
    check (level in ('total_beginner', 'beginner', 'intermediate', 'advanced')) not valid;
```

Notas: `onboarding_completed_at` já existe desde `20261019204923_create_profiles.sql`; a
migration só documenta o significado novo. `not valid` em `plans` porque linhas antigas têm
valores velhos (o banco será zerado, mas a migration não pode falhar antes disso). A versão do
template fica em `plans.generator_version` (já existe) e a data de início em
`user_plans.started_at` (já existe) — PRD US-ONB-01 CA4 (DP-06). Não mexer em
`replace_generated_plan`.

Atualizar `docs/banco-de-dados.md`: na seção de `profiles`, trocar os valores de `goal`,
`level`, o default de `strength` e o significado de `onboarding_completed_at`, citando a
migration nova.

## 4. Edge Function `generate-plan` e gerador

### 4.1 `supabase/functions/_shared/plan/types.ts`

- `goals = ['complete_5k', 'race', 'fitness', 'weight_loss'] as const`
- `levels = ['total_beginner', 'beginner', 'intermediate', 'advanced'] as const`
- Adicionar `export const eligibleLevels = ['total_beginner', 'beginner'] as const;` e
  `export type EligibleLevel = (typeof eligibleLevels)[number];`
- `WeekKind` deixa de existir (remover o tipo).
- `BuildPlanInput.level` passa a ser `EligibleLevel`. `GeneratedPlan.level` também.
- `GeneratedWorkout.intensity`: manter `'easy' | 'moderate' | null`.

### 4.2 `tables.ts` — substituir o conteúdo por

```ts
import type { EligibleLevel, IntervalStage } from './types.ts';

export const PLAN_WEEKS = 8;
export const FREE_WEEKS = 2;
export const PLAN_RACE_METERS = 5000;

export const maxRunSessions: Record<EligibleLevel, number> = {
  total_beginner: 3,
  beginner: 3,
};

export const intervalStages: readonly IntervalStage[] = [
  { stage: 1, runSec: 60, walkSec: 120, reps: 8 },
  { stage: 2, runSec: 90, walkSec: 120, reps: 7 },
  { stage: 3, runSec: 120, walkSec: 120, reps: 6 },
  { stage: 4, runSec: 180, walkSec: 90, reps: 6 },
  { stage: 5, runSec: 300, walkSec: 120, reps: 4 },
  { stage: 6, runSec: 480, walkSec: 120, reps: 3 },
  { stage: 7, runSec: 600, walkSec: 60, reps: 3 },
  { stage: 8, runSec: 900, walkSec: 60, reps: 2 },
];

export const continuousSessionMinutes: Readonly<Record<number, number>> = {
  5: 30,
  6: 35,
  7: 40,
  8: 40,
};
```

(`continuousSessionMinutes` inclui os 10 min de aquecimento + desaquecimento; ou seja,
20/25/30/30 min de corrida contínua.)

### 4.3 `intervals.ts` — substituir por

```ts
import { intervalStages } from './tables.ts';
import type { EligibleLevel, IntervalStage } from './types.ts';

export function stageNumberForWeek(level: EligibleLevel, week: number): number | null {
  if (level === 'total_beginner') return week;
  const stage = week + 4;
  return stage <= 8 ? stage : null;
}

export function intervalStageForWeek(level: EligibleLevel, week: number): IntervalStage | null {
  const stageNo = stageNumberForWeek(level, week);
  if (stageNo === null) return null;
  return intervalStages.find((stage) => stage.stage === stageNo) ?? null;
}
```

Resultado: `total_beginner` semana N = estágio N (1–8). `beginner` semanas 1–4 = estágios
5–8; semanas 5–8 = corrida contínua (DP-02, DP-03).

### 4.4 `generate.ts` — substituir por

```ts
import { anchorMonday, dateFor } from './schedule.ts';
import { GENERATOR_VERSION, settingsHash } from './hash.ts';
import { intervalStageForWeek } from './intervals.ts';
import { longRunDay, normalizeDays, pickRunDays, strengthDays } from './days.ts';
import { planDescription, planName, weekTitle } from './copy.ts';
import { runWorkout, strengthWorkout, type RunSession } from './sessions.ts';
import { continuousSessionMinutes, FREE_WEEKS, maxRunSessions, PLAN_RACE_METERS, PLAN_WEEKS } from './tables.ts';
import type { BuildPlanInput, GeneratedPlan, GeneratedWeek, GeneratedWorkout } from './types.ts';

interface PlanSchedule {
  input: BuildPlanInput;
  runDays: number[];
  longDay: number;
  anchor: string;
}

function sessionFor(schedule: PlanSchedule, week: number, day: number): RunSession {
  const stage = intervalStageForWeek(schedule.input.level, week);
  if (stage) return { type: 'intervals', stage };
  if (week === PLAN_WEEKS && day === schedule.longDay) return { type: 'goal', meters: PLAN_RACE_METERS };
  return { type: 'easy', minutes: continuousSessionMinutes[week] ?? 30 };
}

function buildWeek(schedule: PlanSchedule, week: number): GeneratedWeek {
  const { input, runDays, anchor, longDay } = schedule;
  const runs = runDays.map((day) => runWorkout(sessionFor(schedule, week, day), day, dateFor(anchor, week, day)));
  const strengthOn = input.strength === 'yes' ? strengthDays(runDays, longDay, null) : [];
  const strength = strengthOn.map((day) => strengthWorkout(day, dateFor(anchor, week, day)));
  const workouts: GeneratedWorkout[] = [...runs, ...strength].sort(
    (a, b) => a.day_of_week - b.day_of_week || a.position - b.position,
  );
  return { week_number: week, title: weekTitle(week), workouts };
}

export function buildPlan(input: BuildPlanInput): GeneratedPlan {
  const trainingDays = normalizeDays(input.trainingDays);
  const runDays = pickRunDays(trainingDays, Math.min(trainingDays.length, maxRunSessions[input.level]));
  const firstRunDay = runDays.at(0);
  if (firstRunDay === undefined) throw new Error('Training days are required');
  const schedule: PlanSchedule = {
    input: { ...input, trainingDays },
    runDays,
    longDay: longRunDay(runDays),
    anchor: anchorMonday(input.startDate, firstRunDay),
  };
  const weekCount = input.tier === 'free' ? FREE_WEEKS : PLAN_WEEKS;
  const weeks = Array.from({ length: weekCount }, (_, index) => buildWeek(schedule, index + 1));
  return {
    name: planName(input.tier),
    description: planDescription,
    goal: input.goal,
    level: input.level,
    sessions_per_week: weeks.at(0)?.workouts.filter((workout) => workout.kind === 'run').length ?? 0,
    tier: input.tier,
    full_weeks: PLAN_WEEKS,
    settings_hash: settingsHash(input),
    generator_version: GENERATOR_VERSION,
    weeks,
  };
}
```

O objetivo (`goal`) não altera o conteúdo: todo plano elegível é o plano-base de 5 km
(DP-02). O goal continua gravado em `plans.goal` e no hash.

### 4.5 `sessions.ts`

- `RunSession` fica: `{ type: 'easy'; minutes: number } | { type: 'intervals'; stage: IntervalStage } | { type: 'goal'; meters: number }`.
- Remover os casos `long`, `tempo`, `fartlek` de `runContent` e a função `longTitle`.
- `runWorkout(session, dayOfWeek, scheduledDate)` — remover o parâmetro `goal` (e de
  `runContent`). Remover import de `isRaceGoal` e do tipo `Goal`.
- `strengthWorkout` não muda.

### 4.6 `copy.ts`

- Remover `planNames`, `longDescription`, `tempoDescription`, `fartlekDescription`, e
  `long`, `tempo`, `fartlek` de `sessionTitles`.
- `planName(tier: Tier): string` → `tier === 'free' ? 'Rumo aos 5 km (2 semanas)' : 'Rumo aos 5 km'`.
- `weekTitle(week: number): string` → `` `Semana ${week}` ``.
- `goalTitle(meters)` → sempre `'Corrida de 5 km'` (assinatura pode virar `goalTitle(): string`
  se `meters` ficar sem uso; ajuste a chamada em `sessions.ts`).
- `goalDescription(meters)` → `` `Aqueça caminhando 10 min. Corra ${meters / 1000} km em ritmo leve, sem se cobrar tempo. Se precisar, caminhe e retome. Termine com 5 min de caminhada.` ``
  e em `sessions.ts` o caso `goal` passa a `intensity: 'easy', zone: 2` (conservador, DP-03).

### 4.7 Outros arquivos do gerador

- `steps.ts`: remover `buildTempoSteps` e `buildFartlekSteps`. Em `buildGoalSteps` trocar o
  rótulo `'Ritmo moderado'` por `'Corrida leve'`.
- `days.ts`: remover `keyDay` (fica órfã). `strengthDays` não muda.
- `volume.ts`: apagar o arquivo inteiro.
- `hash.ts`: `GENERATOR_VERSION = 3`. Restante igual.
- `rows.ts`: `ProfileSettings.level` continua `Level` (todos os 4). Nada mais muda.
- Depois de tudo, rode `grep -rn "<nome>" supabase/functions` para cada export removido e
  garanta zero referências.

### 4.8 `supabase/functions/generate-plan/index.ts`

- Import: `import { eligibleLevels, type EligibleLevel, type GeneratedPlan, type Tier } from '../_shared/plan/types.ts';`
- Adicionar função:

```ts
function isEligible(level: string): level is EligibleLevel {
  return eligibleLevels.some((eligible) => eligible === level);
}
```

- Logo após `if (!profile) { return respond(422, { error: 'profile_incomplete' }); }` inserir:

```ts
  if (!isEligible(profile.level)) {
    return respond(422, { error: 'level_not_supported' });
  }
```

- Na chamada `buildPlan({ ...profile, tier, startDate: planStart })` passar
  `{ ...profile, level: profile.level, tier, startDate: planStart }` com o tipo já
  estreitado (o `if` acima garante). Se o TS não estreitar dentro do spread, guarde
  `const level: EligibleLevel = profile.level;` logo após o `if` e passe `level`.
- Recusa não toca no banco: o plano ativo existente (se houver) permanece (DP-07).

### 4.9 Testes — reescrever `generate.test.ts`

Remover os testes que dependem de `volume.ts`, `planWeeks`, tempo/fartlek, 10 km e recuperação.
`base` passa a ser `{ goal: 'complete_5k', level: 'beginner', trainingDays: [2, 4, 6], strength: 'no', tier: 'full', startDate: '2026-10-26' }`.
Manter (adaptando valores): "mesmo plano para a mesma entrada", "treinos só nos dias escolhidos
e nunca antes do início", "ancoragem quinta → segunda seguinte" (use `level: 'beginner'`).
Testes obrigatórios (nomes em PT-BR, um `test` cada):

1. Todo plano completo tem 8 semanas e `full_weeks = 8`, para os 4 goals × 2 níveis elegíveis.
2. Plano grátis tem 2 semanas iguais (`deepEqual`) às 2 primeiras do completo; `full_weeks = 8`.
3. `total_beginner`: semana N (1..8) tem todas as corridas com repeat do estágio N
   (confira `times`, `runSec`, `walkSec` contra `intervalStages`).
4. `beginner`: semanas 1–4 usam estágios 5–8; semanas 5–8 não têm passo `repeat` nas corridas.
5. `beginner` semana 8: a corrida do último dia de corrida tem `target_distance_meters = 5000`;
   `total_beginner` não tem nenhuma corrida com `target_distance_meters` não nulo.
6. Conteúdo independe do goal: `buildPlan` com cada goal tem `weeks` `deepEqual` entre si.
7. 6 dias de treino geram no máximo 3 corridas por semana (os dois níveis).
8. `strength: 'yes'` gera no máximo 2 treinos de força por semana e nunca no último dia de
   corrida; `strength: 'no'` não gera nenhum.
9. `settingsHash(base) === 'v3|complete_5k|beginner|2,4,6|no|full'` e hash muda quando cada
   entrada muda (6 hashes distintos).
10. `generator_version === 3` no plano gerado.

11. `parseProfile({ goal: 'race', level: 'intermediate', training_days: [1,3], strength: null })`
    retorna `level: 'intermediate'` e `strength: 'no'` (a recusa acontece no `index.ts`).

## 5. App — tipos e libs

### 5.1 `types/onboarding.ts` — substituir por

```ts
import { trainingDayComboIds } from '@/lib/trainingDayCombos';

export const onboardingOptions = {
  goal: ['complete_5k', 'race', 'fitness', 'weight_loss'],
  level: ['total_beginner', 'beginner', 'intermediate', 'advanced'],
  daysPerWeek: ['two', 'three', 'four', 'five_plus'],
  trainingDays: trainingDayComboIds,
  strength: ['yes', 'maybe_later', 'no'],
} as const;

export const eligibleLevels = ['total_beginner', 'beginner'] as const;

export type OnboardingField = keyof typeof onboardingOptions;

export type OnboardingAnswers = {
  [K in OnboardingField]: (typeof onboardingOptions)[K][number];
};

export type PartialOnboardingAnswers = Partial<OnboardingAnswers>;

export type OnboardingStepKey = 'goal' | 'daysPerWeek' | 'trainingDays' | 'level';

export const onboardingStepKeys: readonly OnboardingStepKey[] = ['goal', 'daysPerWeek', 'trainingDays', 'level'];

export type LabeledField = Exclude<OnboardingField, 'trainingDays'>;

export type OnboardingLabels = {
  [K in LabeledField]: Record<OnboardingAnswers[K], string>;
};
```

`OnboardingState` deixa de existir. Ajuste quem importava `OnboardingStepKey` como "qualquer
campo" (`lib/planDraft.ts`, `hooks/usePlanSettings.ts`) para usar `OnboardingAnswers[...]`
como já fazem (nenhuma outra mudança de tipo lá).

### 5.2 `lib/onboardingSteps.ts`

- `onboardingLabels`: goal e level com os rótulos da seção 2; `daysPerWeek` e `strength`
  iguais aos atuais.
- Adicionar `export const levelDescriptions: Record<OnboardingAnswers['level'], string>` com as
  descrições da seção 2.
- `OnboardingOption` ganha `description?: string`.
- `onboardingSteps` na ordem: goal ("Qual é o seu objetivo?", "Isso define o plano que vamos
  montar."), daysPerWeek ("Quantos dias por semana você pode treinar?", "Mínimo de 2 dias.
  Você pode ajustar depois."), trainingDays (igual ao atual), level ("Como está seu preparo
  hoje?", "Seja honesto — dá para evoluir de qualquer ponto.") com `description` vinda de
  `levelDescriptions`. Remover o passo `strength`.
- Remover `goalSummaries` e `summarizeAnswers` (ficam órfãos).
- `buildStep` passa a usar `LabeledField` no genérico.

### 5.3 `lib/onboardingProgress.ts` (novo)

```ts
import { comboGroup, comboIdForDays } from '@/lib/trainingDayCombos';
import type { ProfileRow } from '@/types/database';
import { eligibleLevels, type OnboardingAnswers, type OnboardingStepKey, type PartialOnboardingAnswers } from '@/types/onboarding';

export function answersFromProfile(row: ProfileRow | null): PartialOnboardingAnswers
export function pendingStep(answers: PartialOnboardingAnswers): OnboardingStepKey | null
export function isEligibleLevel(level: OnboardingAnswers['level']): boolean
```

- `answersFromProfile`: `goal`, `level`, `daysPerWeek` copiados da row se não nulos;
  `trainingDays` = `comboIdForDays([...row.training_days].sort((a, b) => a - b))` somente se
  não nulo e `comboGroup(combo) === row.days_per_week`. Row nula → `{}`.
- `pendingStep`: retorna a primeira chave de `['goal', 'daysPerWeek', 'trainingDays', 'level']`
  sem valor em `answers`; tudo preenchido → `null`.
- `isEligibleLevel`: `eligibleLevels.some((item) => item === level)`.

### 5.4 Remoções

- Apagar `lib/onboardingStorage.ts` (rascunho AsyncStorage pré-cadastro).
- Apagar `hooks/useOnboardingSync.ts` (migração pós-signup) e tirar a chamada e o import de
  `app/(app)/_layout.tsx`.
- Apagar `app/(pre-auth)/onboarding.tsx` e `app/(pre-auth)/paywall.tsx`.
- Não é preciso limpar a chave `paceless:onboarding` do AsyncStorage de instalações antigas
  (banco e builds serão zerados; DP-05).

## 6. App — hooks

### 6.1 `hooks/useOnboarding.ts` — reescrever

```ts
interface UseOnboarding {
  loading: boolean;
  stepIndex: number;
  stepCount: number;
  stepKey: OnboardingStepKey;
  answers: PartialOnboardingAnswers;
  selected: string | null;
  isFirst: boolean;
  isLast: boolean;
  saving: boolean;
  error: string | null;
  answer: (value: string) => void;
  next: () => Promise<boolean>;
  back: () => void;
}
```

Comportamento:
- Usa `useProfile()` e `useSession()`. `loading = profileLoading || !initialized`.
- Ao carregar o profile pela primeira vez (não nulo), `answers = answersFromProfile(profile)`
  e `stepIndex = indexOf(pendingStep(answers) ?? 'level')`. Inicializa uma única vez (guarde
  em estado `initialized`; padrão de "ajustar estado durante render" já usado em
  `usePlanSettings`).
- `answer(value)`: valida com `onboardingOptions[stepKey].includes(value)`; para
  `trainingDays` também exige `comboGroup(value) === answers.daysPerWeek`. Para
  `daysPerWeek`, se o `trainingDays` atual não for do novo grupo, remove `trainingDays` das
  answers. Só altera estado local; limpa `error`.
- `selected = answers[stepKey] ?? null`.
- `next()`: se `selected` nulo → `false`. Monta o patch do passo:
  - goal → `{ goal }`
  - daysPerWeek → `{ days_per_week }` e, se `trainingDays` foi removido, `training_days: []`
  - trainingDays → `{ training_days: [...trainingDaysFor(id)] }`
  - level → `{ level }`
  Executa `supabase.from('profiles').update(patch).eq('id', userId).select('id')`; sucesso
  = sem erro e 1+ linha. Falha → `error = 'Não foi possível salvar sua resposta. Tente novamente.'`,
  retorna `false`. Sucesso → `await refresh()` do `useProfile`; se não for o último passo,
  `stepIndex + 1`; retorna `true`. `saving` true durante a chamada. Sem supabase/userId →
  mesma mensagem de erro, `false`.
- `back()`: `stepIndex - 1` se > 0 (não salva nada).
- Não usa AsyncStorage.

### 6.2 `hooks/useGeneratePlan.ts`

- `GeneratePlanResult` vira `{ error: string | null; code: 'ok' | 'level_not_supported' | 'profile_incomplete' | 'failed' }`.
- Adicionar leitura do corpo do erro:

```ts
async function errorCodeOf(error: unknown): Promise<string | null> {
  if (typeof error !== 'object' || error === null || !('context' in error)) return null;
  if (!(error.context instanceof Response)) return null;
  const body: unknown = await error.context.clone().json().catch(() => null);
  if (typeof body !== 'object' || body === null || !('error' in body)) return null;
  return typeof body.error === 'string' ? body.error : null;
}
```

- Mapeamento: sem erro → `{ error: null, code: 'ok' }`; `level_not_supported` →
  `{ error: 'Seu plano ainda não está disponível para o seu nível.', code: 'level_not_supported' }`;
  `profile_incomplete` → mensagem atual `incompleteProfileError`, code `profile_incomplete`;
  qualquer outro / exceção → `regenerationError`, code `failed`. Remover `statusOf` se ficar órfã.
- Quem já usa só `.error` (`plan-paywall.tsx`, `usePlanSettings.ts`) continua funcionando.

### 6.3 `hooks/useCompleteOnboarding.ts` (novo)

```ts
export type CompletionStatus = 'idle' | 'generating' | 'ready' | 'unavailable' | 'failed';
interface UseCompleteOnboarding { status: CompletionStatus; error: string | null; run: () => Promise<void>; }
```

`run()`:
1. `status = 'generating'`.
2. `const result = await generate()` (de `useGeneratePlan`).
3. `code === 'ok'` → status alvo `'ready'`; `'level_not_supported'` → `'unavailable'`;
   outro → `status = 'failed'`, `error = result.error`, retorna (não conclui).
4. Grava `profiles.onboarding_completed_at = new Date().toISOString()` com `update ... eq('id', userId).select('id')`.
   Falha → `status = 'failed'`, `error = 'Não foi possível concluir. Tente novamente.'`, retorna.
5. `await refresh()` do `useProfile`; se `'ready'`, `await reload()` de `useActivePlan`.
6. Também faz o que o fluxo antigo de configurações fazia: com os dias do profile,
   `offerReminderPermission(userId, days)`; se `'granted'`, `void registerPushToken(userId)`;
   `await syncReminders(userId, days)` — só quando status alvo é `'ready'`. Erros aqui são
   ignorados (try/catch vazio não é permitido sem corpo; use `.catch(() => undefined)`).
7. `status` = alvo.

## 7. App — telas e navegação

### 7.1 Portão em `app/(app)/_layout.tsx`

- Remover `useOnboardingSync`.
- Adicionar `const { profile, loading: profileLoading } = useProfile();` e
  `const segments = useSegments();` (de `expo-router`).
- Depois do `if (!session) return <Redirect href="/welcome" />;`:

```tsx
  if (profileLoading) return null;
  const inOnboarding = segments.includes('onboarding');
  if (profile && profile.onboarding_completed_at === null && !inOnboarding) {
    return <Redirect href="/onboarding" />;
  }
```

- Registrar no `<Stack>`: `<Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />`.
- `useResumeWorkout`, lembretes, push e health continuam como estão.
- `profile === null` (falha de leitura) não redireciona (evita loop; DP-08).

Assim cadastro, login, Google/Apple (`useSocialSignIn` → `/(app)`), `auth/callback` e
`app/index.tsx` não precisam mudar: todos caem em `/(app)` e o portão decide.

### 7.2 `app/(pre-auth)/welcome.tsx`

- Botão "Começar": `router.push('/signup')` (antes `/onboarding`). Nada mais muda.

### 7.3 `app/(app)/onboarding/_layout.tsx` (novo)

Stack sem header, `contentStyle: { backgroundColor: colors.background }`,
`gestureEnabled: false` (mesmo padrão de `app/(pre-auth)/_layout.tsx`).

### 7.4 `app/(app)/onboarding/index.tsx` (novo — perguntas)

Baseado no `app/(pre-auth)/onboarding.tsx` atual (mesmo layout, componentes e estilos), com:
- `useProfile()`: se `profile?.onboarding_completed_at` não nulo → `<Redirect href="/(app)" />`.
- Header: `ScreenHeader showBack={!isFirst} onBack={back} centerLabel={`${stepIndex + 1} / ${stepCount}`}`.
  Botão voltar do Android no primeiro passo: não tratar (sem ação extra).
- Opções: `optionsForStep(current, answers)`; cada `SelectableCard` mostra `label`
  (`bodyStrong`) e, se houver, `description` (`caption`, `colors.textSecondary`).
- `HEALTH_DISCLAIMER` aparece no rodapé quando `isLast` (igual hoje).
- `<InlineError message={error} />` acima do botão.
- Botão: label `saving ? 'Salvando...' : 'Continuar'`, `disabled={!selected || saving}`.
  No passo `daysPerWeek` não existe opção com menos de 2 dias, e o botão fica desabilitado
  enquanto nada estiver escolhido → PRD ONB-02 / US-ONB-01 CA1.
- `onPress`: `const ok = await next(); if (ok && isLast) router.replace('/onboarding/plan-ready');`

### 7.5 `app/(app)/onboarding/plan-ready.tsx` (novo)

- Ao montar, se `status === 'idle'`, chama `run()` uma vez (`useEffect` com ref de guarda).
- `generating`: `ActivityIndicator` (cor `colors.primaryDeep`, `accessibilityLabel="Montando seu plano"`)
  e texto `title2` "Montando seu plano...".
- `ready`: ícone `CalendarCheck` (lucide, `sizes.iconXl * 2`, `colors.primaryDeep`), título
  `title1` "Seu plano está pronto", texto `body`/`textSecondary`
  "São 8 semanas para você chegar aos 5 km no seu ritmo. As 2 primeiras já estão liberadas."
  Botão "Continuar" → `router.replace('/plan-paywall')`.
- `unavailable`: ícone `Hourglass`, título "Seu plano ainda não está disponível", texto
  "Por enquanto, o plano é para quem está começando. Avisaremos quando houver um plano para o
  seu nível. Você pode mudar seu nível em Configurações do plano." Botão "Ir para o início" →
  `router.replace('/(app)')`. Sem paywall.
- `failed`: título "Não foi possível montar seu plano", `InlineError` com `error`, botão
  "Tentar novamente" → `run()`.
- Use `Screen` + `EmptyState` quando couber (`icon`, `title`, `description`, `action`).
- Se o app for morto nesta tela antes do passo 4 de `run`, o portão volta para
  `/onboarding`, que (tudo respondido) abre no passo nível; ao continuar, `plan-ready` roda
  de novo — o `generate-plan` é idempotente pelo hash.

### 7.6 `app/(app)/plan-paywall.tsx`

Usado também como paywall pós-plano. Trocar os dois `router.back()` por uma função:

```ts
const close = (): void => {
  if (router.canGoBack()) router.back();
  else router.replace('/(app)');
};
```

Nada mais muda (já é fechável pelo X e faz upgrade com `generate(true)`).

### 7.7 Início sem plano

Nenhuma mudança obrigatória: `PlanCard`/`TodayCard` já tratam `plan === null`, e a aba Plano
mostra `NoPlanState` ("Configurar plano") — atende PRD US-DASH-01 CA3.

## 8. Configurações do plano

`app/(app)/(tabs)/plan/settings.tsx`:
- Objetivo e nível passam a listar as opções novas automaticamente via `onboardingOptions` e
  `onboardingLabels`. A seção de nível mostra também a descrição: `levelOptions` vira
  `{ id, label, description: levelDescriptions[id] }` — se `OptionSection` não aceitar
  `description`, adicionar prop opcional `description?: string` nas opções e renderizar como
  `caption`/`textSecondary` abaixo do label (mudança mínima em `components/plan/OptionSection.tsx`).
- Ordem das seções: Objetivo, Dias por semana, Dias de treino, Preparo atual, Musculação.
- Musculação continua editável (yes/maybe_later/no).
- Quando `save()` retornar `'regeneration_failed'` por nível não elegível, a mensagem já vem
  de `useGeneratePlan` ("Seu plano ainda não está disponível para o seu nível."). O plano
  anterior continua ativo.

`hooks/usePlanSettings.ts` e `lib/planDraft.ts`: só ajustes de tipo, se o tsc pedir.

## 9. Docs

- `docs/planos.md`: reescrever as seções "4.1 Duração", "4.2 Volume semanal", "4.5 Caminhada e
  corrida" e "Plano grátis e premium" para: 8 semanas fixas; só `total_beginner`/`beginner`;
  tabela dos 8 estágios; `beginner` estágios 5–8 e depois contínua 20/25/30/30 min + 5 km na
  última sessão da semana 8; goal não muda conteúdo; grátis = semanas 1–2; `generator_version = 3`;
  `422 level_not_supported` para intermediário/avançado. Remover menções a tempo, fartlek,
  semana de recuperação, polimento e 10 km. Citar `docs/decisoes-provisorias-prd.md`.
- `docs/estado-atual.md`: trocar a descrição do fluxo de primeiro acesso pelo da seção 1.
- `docs/decisoes-provisorias-prd.md`: já criado nesta fase; acrescentar qualquer decisão nova
  que a implementação precisar tomar.

## 10. Ordem de execução e verificação

1. Gerador + testes (seção 4.1–4.7, 4.9) → `node --test ...` verde.
2. `generate-plan/index.ts` (4.8) → revisar manualmente (Deno não roda aqui).
3. Migration (3) + `docs/banco-de-dados.md`.
4. Tipos/libs (5) → tsc verde.
5. Hooks (6) → tsc verde.
6. Telas e portão (7) + configurações (8) → tsc + eslint verdes.
7. Docs (9).
8. `grep -rnE "onboardingStorage|useOnboardingSync|summarizeAnswers|never_ran|run_10k|start_running|'sometimes'|maybe_later.*onboarding|\(pre-auth\)/paywall|router.push\('/onboarding'\)" app hooks lib components types supabase`
   → nenhuma ocorrência (exceto `maybe_later` em `types/onboarding.ts`/`onboardingSteps.ts`).

## 11. Critérios de aceite

PRD cobertos:
- **US-AUTH-01 CA4** — após cadastro (e-mail, Google, Apple, link), usuário sem onboarding vai à etapa pendente.
- **US-ONB-01 CA1** — Continuar bloqueado com menos de 2 dias.
- **US-ONB-01 CA2** — objetivo, nível e disponibilidade persistidos em `profiles`.
- **US-ONB-01 CA3** — intermediário/avançado recebem mensagem clara, não um plano.
- **US-ONB-01 CA4** — plano referencia versão (`plans.generator_version = 3`) e início (`user_plans.started_at`).
- **ONB-01 / ONB-03** — 4 objetivos e 4 níveis do PRD. **PLAN-01** — 8 semanas.
- **US-DASH-01 CA3** — sem plano, há ação para configurar plano.

Verificáveis:
1. "Começar" nas boas-vindas abre `/signup`.
2. `app/(pre-auth)/onboarding.tsx`, `app/(pre-auth)/paywall.tsx`, `lib/onboardingStorage.ts`,
   `hooks/useOnboardingSync.ts`, `supabase/functions/_shared/plan/volume.ts` não existem.
3. Nenhum arquivo de `app/ hooks/ lib/` importa `@react-native-async-storage` para onboarding.
4. Sessão com `onboarding_completed_at = null` em qualquer rota de `(app)` é redirecionada para `/onboarding`.
5. `/onboarding` abre no primeiro campo nulo (goal → daysPerWeek → trainingDays → level).
6. Cada "Continuar" faz `update` em `profiles` antes de avançar; falha mostra erro e não avança.
7. Matar o app no passo 3 e reabrir → abre no passo 3 com respostas anteriores marcadas.
8. Não há pergunta de musculação; `profiles.strength` default `'no'`; editável nas configurações.
9. Goal/level com os valores e rótulos da seção 2 no onboarding e nas configurações.
10. Fim do onboarding: `plan-ready` → "Seu plano está pronto" → paywall com X → Início.
11. Nível intermediário/avançado: "Seu plano ainda não está disponível" → Início, sem paywall, sem plano criado.
12. Em ambos os casos `onboarding_completed_at` fica preenchido e o portão não volta a redirecionar.
13. Falha de rede na geração: "Tentar novamente", `onboarding_completed_at` continua nulo.
14. Usuário com onboarding concluído que abre `/onboarding` é levado ao Início.
15. Edge Function: nível não elegível → `422 { error: 'level_not_supported' }`, sem escrita no banco.
16. Plano gerado: 8 semanas (`full_weeks = 8`), grátis com 2; regras de estágio da seção 4.3.
17. Migration `20261102000000_prd_onboarding_values.sql` existe e não foi aplicada.
18. `npx tsc --noEmit`, `npx eslint . --max-warnings 0` e `node --test supabase/functions/_shared/plan/generate.test.ts` verdes.
19. Nenhum arquivo `.ts/.tsx` com comentário; nenhum com mais de 200 linhas.

## 12. Fora do escopo desta fase

Validação dos treinos por especialista (DEC-10), regra de avanço de semana (BR-03/DEC-09),
analytics `onboarding_completed`/`plan_created` (sem lib de analytics), histórico de lesões
(ONB-05), escolha livre de dias da semana (DP-09).
