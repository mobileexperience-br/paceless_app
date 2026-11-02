# Spec — Fase 5: prontidão para beta

Cobre as seções 9 (eventos e analytics), 10 (requisitos não funcionais, só o que cabe sem lib
nova), 11 (estratégia de testes) e 14 (critérios de go-live) do PRD (`docs/prd-v1.md`).
Decisões provisórias novas: DP-37 a DP-45 em `docs/decisoes-provisorias-prd.md`.
Depende das fases 1 a 4 (gerador v3, estados de sessão, `get_plan_week_status`, conquistas).

## 0. Regras para quem implementa

- Trabalhe só no worktree `/mnt/dados/projects/github/paceless_prd_flow` (branch `feat/prd-mvp`).
- NÃO aplique migration, NÃO faça deploy de Edge Function, NÃO faça push, NÃO inicie expo/web,
  NÃO instale lib. Esta fase não cria migration.
- Sem comentários em `.ts/.tsx/.js/.mjs`. Sem `any`. Arquivos com no máximo 200 linhas (se passar,
  extraia para um arquivo novo com nome descritivo, sem mudar comportamento).
- Estilo só por tokens de `theme/`. Ícones só `lucide-react-native`. Nenhum emoji.
- Texto de UI em PT-BR, exatamente como escrito aqui.
- Ao terminar: `npx tsc --noEmit`, `npx eslint .` e `npm test` sem erros.
- Siga a ordem das seções. Não toque em arquivos fora da lista da seção 1.

## 1. Arquivos

| Ação | Arquivo |
|---|---|
| criar | `types/analytics.ts` |
| criar | `lib/analyticsPayload.ts` |
| criar | `lib/analyticsRules.ts` |
| criar | `lib/analytics.ts` |
| criar | `lib/planWeekStatusParser.ts` |
| criar | `hooks/useWorkoutAnalytics.ts` |
| criar | `scripts/test-hooks.mjs` |
| criar | `lib/planCalendar.test.ts` |
| criar | `lib/planProgress.test.ts` |
| criar | `lib/planWeekStatusParser.test.ts` |
| criar | `lib/onboardingProgress.test.ts` |
| criar | `lib/workoutBlocks.test.ts` |
| criar | `lib/analyticsPayload.test.ts` |
| criar | `lib/analyticsRules.test.ts` |
| criar | `docs/analytics.md` |
| criar | `docs/testes.md` |
| criar | `docs/go-live.md` |
| alterar | `package.json` (só `scripts`) |
| alterar | `lib/planWeekStatus.ts` |
| alterar | `supabase/functions/generate-plan/index.ts` |
| alterar | `hooks/useGeneratePlan.ts` |
| alterar | `hooks/useCompleteOnboarding.ts` |
| alterar | `hooks/useSocialSignIn.ts` |
| alterar | `hooks/useFinishWorkout.ts` |
| alterar | `hooks/usePlanWeekStatus.ts` |
| alterar | `hooks/useAchievements.ts` |
| alterar | `app/(pre-auth)/signup.tsx` |
| alterar | `app/(app)/workout/[id].tsx` |
| alterar | `app/(app)/(tabs)/index.tsx` |
| alterar | `docs/decisoes-provisorias-prd.md` (já atualizado pelo orquestrador; só acrescente se precisar) |

Nada é removido. Nenhuma tabela, RPC ou trigger muda.

## 2. Analytics (PRD seção 9)

Princípio: interface tipada, uma única função `track`, e implementação que só escreve no console
em desenvolvimento (`__DEV__`). Em build de produção não faz nada. Provedor real (PostHog,
Amplitude etc.) fica pendente de aprovação de lib (DP-37). Nunca enviar e-mail, nome, id de
usuário, coordenadas, frequência cardíaca, sensação, rota ou pace (DP-38).

### 2.1 `types/analytics.ts` (conteúdo exato)

```ts
export type SignupMethod = 'email' | 'google' | 'apple';
export type WorkoutInterruptReason = 'discarded' | 'too_short';

export interface AnalyticsEventMap {
  signup_completed: { method: SignupMethod; app_version: string };
  onboarding_completed: { goal: string; level: string; days_count: number };
  plan_created: { template_version: string; duration_weeks: number };
  workout_started: { session_id: string; workout_type: string };
  workout_paused: { session_id: string; elapsed_seconds: number };
  workout_completed: { session_id: string; duration: number; distance: number; source: 'paceless' };
  workout_interrupted: { session_id: string; reason_optional: WorkoutInterruptReason | null };
  weekly_goal_completed: { plan_id: string; week_index: number };
  achievement_awarded: { achievement_code: string; criteria_version: number };
}

export type AnalyticsEventName = keyof AnalyticsEventMap;

export type AnalyticsValue = string | number | boolean | null;

export type AnalyticsPayload = Record<string, AnalyticsValue>;
```

### 2.2 `lib/analyticsPayload.ts` (puro, sem imports de valor de RN/Expo/Supabase)

```ts
import type { AnalyticsEventMap, AnalyticsEventName, AnalyticsPayload, AnalyticsValue } from '@/types/analytics';

export const MAX_STRING_LENGTH = 64;

export const allowedProperties: { [K in AnalyticsEventName]: readonly (keyof AnalyticsEventMap[K])[] } = {
  signup_completed: ['method', 'app_version'],
  onboarding_completed: ['goal', 'level', 'days_count'],
  plan_created: ['template_version', 'duration_weeks'],
  workout_started: ['session_id', 'workout_type'],
  workout_paused: ['session_id', 'elapsed_seconds'],
  workout_completed: ['session_id', 'duration', 'distance', 'source'],
  workout_interrupted: ['session_id', 'reason_optional'],
  weekly_goal_completed: ['plan_id', 'week_index'],
  achievement_awarded: ['achievement_code', 'criteria_version'],
};
```

E a função `buildAnalyticsPayload<K extends AnalyticsEventName>(name: K, props: AnalyticsEventMap[K]): AnalyticsPayload`:

- Percorre só as chaves de `allowedProperties[name]`, na ordem da lista. Qualquer outra chave do
  objeto recebido é descartada (proteção caso alguém passe um objeto maior por engano).
- Para cada chave, lê o valor e normaliza com uma função interna `normalize(value: unknown): AnalyticsValue | undefined`:
  - `string` → corta em `MAX_STRING_LENGTH` caracteres (`value.slice(0, MAX_STRING_LENGTH)`).
  - `number` finito → `Math.round(value)` (números inteiros; distância em metros, tempos em segundos).
  - `number` não finito → `undefined`.
  - `boolean` ou `null` → igual.
  - qualquer outra coisa (objeto, array, undefined) → `undefined`.
- Chave com resultado `undefined` não entra no payload.
- Para ler a propriedade sem `any`, converta `props` para `Record<string, unknown>` via uma
  variável tipada `const source: Record<string, unknown> = { ...props };` e use `String(key)`.

### 2.3 `lib/analyticsRules.ts` (puro)

```ts
import type { PlanWeekStatus } from '@/types/planWeek';

export const MAX_SENT_KEYS = 200;
export const FRESH_SIGNUP_WINDOW_MS = 60_000;
export const ACHIEVEMENT_CRITERIA_VERSION = 1;
```

Funções exportadas (assinaturas exatas):

- `isWeeklyGoalCompleted(status: PlanWeekStatus | null): boolean` → `true` só se
  `status !== null && status.eligible > 0 && status.completed >= status.eligible`.
  (Mesma regra do DP-31: todas as sessões elegíveis concluídas; descanso não tem sessão e não conta.)
- `weeklyGoalKey(status: PlanWeekStatus): string` →
  `` `weekly_goal_completed:${status.userPlanId}:${status.currentWeek}:${status.currentAttempt}` ``.
- `achievementKey(code: string): string` → `` `achievement_awarded:${code}` ``.
- `rememberKey(sent: readonly string[], key: string): { sent: string[]; isNew: boolean }`:
  - se `sent.includes(key)` → `{ sent: [...sent], isNew: false }`;
  - senão → `{ sent: [...sent, key].slice(-MAX_SENT_KEYS), isNew: true }`.
- `isFreshSignup(createdAt: string | undefined, lastSignInAt: string | undefined): boolean` →
  `false` se algum for `undefined` ou se `Date.parse` de algum der `NaN`; senão
  `Math.abs(Date.parse(lastSignInAt) - Date.parse(createdAt)) <= FRESH_SIGNUP_WINDOW_MS`.
- `templateVersionLabel(version: unknown): string` → `` `v${version}` `` se `version` for número
  inteiro positivo; senão `'unknown'`.
- `analyticsSessionId(planSessionId: string | null, activityId: string): string` →
  `planSessionId ?? activityId` (DP-40).

### 2.4 `lib/analytics.ts`

```ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { buildAnalyticsPayload } from '@/lib/analyticsPayload';
import { rememberKey } from '@/lib/analyticsRules';
import type { AnalyticsEventMap, AnalyticsEventName } from '@/types/analytics';

export const ANALYTICS_SENT_KEY = 'paceless:analytics-sent';
```

Funções exportadas:

- `appVersion(): string` → `Constants.expoConfig?.version ?? 'unknown'`.
- `track<K extends AnalyticsEventName>(name: K, props: AnalyticsEventMap[K]): void`:
  - `const payload = buildAnalyticsPayload(name, props);`
  - `if (__DEV__) console.info('[analytics]', name, payload);`
  - Nada mais. Nunca lança erro (envolver em `try { ... } catch { return; }`).
- `trackOnce<K extends AnalyticsEventName>(key: string, name: K, props: AnalyticsEventMap[K]): Promise<void>`:
  - lê `ANALYTICS_SENT_KEY` do AsyncStorage; parse JSON; se não for array de strings, usa `[]`;
  - `const result = rememberKey(sent, key);` se `!result.isNew` retorna;
  - grava `JSON.stringify(result.sent)`; chama `track(name, props)` só depois de gravar com sucesso;
  - qualquer erro (leitura, parse, escrita) → retorna sem rastrear. Nunca lança.
- Uma fila em memória não é necessária; eventos concorrentes iguais são raros e o pior caso é log
  duplicado em dev.

Se o ESLint reclamar de `console.info`, use `// eslint-disable` NÃO (comentários são proibidos):
em vez disso, use `globalThis.console.info(...)`. Se ainda reclamar, pare e registre no relatório.

### 2.5 Pontos de disparo

| Evento | Arquivo | Onde exatamente | Props |
|---|---|---|---|
| `signup_completed` (e-mail) | `app/(pre-auth)/signup.tsx` | em `submit`, logo depois do `if (result.error) {...}` e antes do `if (result.needsConfirmation)` | `{ method: 'email', app_version: appVersion() }` |
| `signup_completed` (social) | `hooks/useSocialSignIn.ts` | dentro de `run`, no `if (result.signedIn)`, antes do `router.replace`: `void reportSocialSignup(next);` | ver abaixo |
| `onboarding_completed` | `hooks/useCompleteOnboarding.ts` | em `run`, logo depois do `if (!(await markCompleted())) {...}` | `{ goal, level, days_count }` do `profile`; só dispara se `profile?.goal`, `profile?.level` e `profile?.days_per_week` não forem nulos |
| `plan_created` | `hooks/useGeneratePlan.ts` | no sucesso (`!response.error`), antes de `return okResult` | só se o corpo tiver `status === 'generated'`: `{ template_version: templateVersionLabel(body.generatorVersion), duration_weeks: body.weeks }` (pular se `weeks` não for número) |
| `workout_started` | `hooks/useWorkoutAnalytics.ts` | ver 2.6 | `{ session_id, workout_type: type }` |
| `workout_paused` | `hooks/useWorkoutAnalytics.ts` | ver 2.6 | `{ session_id, elapsed_seconds }` |
| `workout_completed` | `hooks/useFinishWorkout.ts` | depois de `const status = await save(...)`, se `status !== 'failed'` | `{ session_id: analyticsSessionId(userPlanWorkoutId, activityId), duration: elapsedSeconds, distance: distanceMeters, source: 'paceless' }` |
| `workout_interrupted` (curto) | `hooks/useFinishWorkout.ts` | no bloco `elapsedSeconds < MIN_SAVE_SECONDS`, antes do `reportPlanSession` | `{ session_id: analyticsSessionId(userPlanWorkoutId, activityId), reason_optional: 'too_short' }` (dispara também em treino livre) |
| `workout_interrupted` (descartado) | `app/(app)/workout/[id].tsx` | em `leave`, primeira linha | `{ session_id: analyticsSessionId(userPlanWorkoutId, activityId), reason_optional: 'discarded' }` |
| `weekly_goal_completed` | `hooks/usePlanWeekStatus.ts` | em `reload`, depois de obter o status (antes de `setStatus`) | se `isWeeklyGoalCompleted(next)`: `void trackOnce(weeklyGoalKey(next), 'weekly_goal_completed', { plan_id: next.userPlanId, week_index: next.currentWeek })` |
| `achievement_awarded` | `hooks/useAchievements.ts` | em `reload`, depois de `fetchAchievements()` (antes de `setAchievements`) | para cada item com `earnedAt !== null`: `void trackOnce(achievementKey(item.code), 'achievement_awarded', { achievement_code: item.code, criteria_version: ACHIEVEMENT_CRITERIA_VERSION })` |

`reportSocialSignup` é uma função nova exportada em `lib/analytics.ts`:

```ts
export async function reportSocialSignup(method: 'google' | 'apple'): Promise<void>
```

- Importa `supabase` de `@/lib/supabase`. Se `!supabase`, retorna.
- `const { data } = await supabase.auth.getSession();` `const user = data.session?.user;`
- Se `isFreshSignup(user?.created_at, user?.last_sign_in_at)` → `track('signup_completed', { method, app_version: appVersion() })`.
- Envolto em `try/catch` que só retorna. `SocialProviderName` em `useSocialSignIn` já é
  `'google' | 'apple'`; se não for, ajuste o tipo do parâmetro para `SocialProviderName`.

`useGeneratePlan`: para ler o corpo de sucesso sem `any`, use
`const body: unknown = response.data;` e uma função local
`function generatedSummary(body: unknown): { weeks: number; generatorVersion: unknown } | null`
que retorna `null` se `body` não for objeto, se `status !== 'generated'` ou se `weeks` não for
número. Use `isRecord` de `@/lib/activities`.

`useFinishWorkout` já recebe `activityId` e `userPlanWorkoutId`; não mude a assinatura.

### 2.6 `hooks/useWorkoutAnalytics.ts`

```ts
interface WorkoutAnalyticsOptions {
  sessionId: string;
  type: WorkoutType;
  running: boolean;
  resumed: boolean;
  finishing: boolean;
  elapsedSeconds: number;
}

export function useWorkoutAnalytics(options: WorkoutAnalyticsOptions): void
```

Comportamento:

- `startedRef = useRef(false)`, `wasRunningRef = useRef(false)`, `elapsedRef = useRef(elapsedSeconds)`
  (atualizado a cada render: `elapsedRef.current = elapsedSeconds` dentro de um `useEffect` sem
  dependências extras além de `elapsedSeconds`).
- `useEffect` com deps `[running, resumed, finishing, sessionId, type]`:
  - se `running && !startedRef.current`: marca `startedRef.current = true`; se `!resumed`,
    `track('workout_started', { session_id: sessionId, workout_type: type })`.
  - se `!running && wasRunningRef.current && !finishing`:
    `track('workout_paused', { session_id: sessionId, elapsed_seconds: elapsedRef.current })`.
  - no fim: `wasRunningRef.current = running`.
- Treino retomado após crash (`resumed`) não gera `workout_started` de novo (DP-41).

Em `app/(app)/workout/[id].tsx`, logo abaixo de `usePlanSessionReporter(userPlanWorkoutId, running);`,
uma linha:

```tsx
useWorkoutAnalytics({ sessionId: analyticsSessionId(userPlanWorkoutId, activityId), type, running, resumed: resumed !== null, finishing, elapsedSeconds });
```

O arquivo tem 195 linhas: se passar de 200, mova a função `leave` e o `togglePause` para um hook
`hooks/useWorkoutLeave.ts` sem mudar comportamento.

### 2.7 `supabase/functions/generate-plan/index.ts`

- Importar `GENERATOR_VERSION` de `../_shared/plan/hash.ts`.
- `ResponseBody` ganha `generatorVersion?: number`.
- `unchangedResponse` e a resposta `status: 'generated'` passam a incluir
  `generatorVersion: GENERATOR_VERSION`. Nada mais muda. NÃO fazer deploy: até o deploy, o app
  envia `template_version: 'unknown'` (aceito, DP-39).

### 2.8 `docs/analytics.md` (novo, em português)

Conteúdo: tabela dos 9 eventos (nome, quando dispara, arquivo, propriedades); regra de
privacidade do DP-38 com a lista do que nunca vai; como funciona hoje (só log `[analytics]` em
dev); deduplicação de `weekly_goal_completed` e `achievement_awarded` via `paceless:analytics-sent`
(até 200 chaves, por instalação); como plugar um provedor real (trocar o corpo de `track` em
`lib/analytics.ts`, pendente aprovação de lib e base legal LGPD).

## 3. Testes automatizados (PRD seção 11)

### 3.1 `scripts/test-hooks.mjs` (conteúdo exato)

```js
import { registerHooks } from 'node:module';
import { statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function isFile(file) {
  try {
    return statSync(file).isFile();
  } catch {
    return false;
  }
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (!specifier.startsWith('@/')) return nextResolve(specifier, context);
    const base = path.join(root, specifier.slice(2));
    const file = [`${base}.ts`, `${base}.tsx`, base, path.join(base, 'index.ts')].find(isFile);
    return nextResolve(file ? pathToFileURL(file).href : specifier, context);
  },
});
```

Isso resolve os imports `@/...` nos testes. `import type` some na remoção de tipos do Node 22,
então só módulos com imports de valor puros podem ser testados (nada de `react-native`,
`expo-*`, `@/lib/supabase`, AsyncStorage). Validado pelo orquestrador com Node 22.23.

### 3.2 `package.json`

Acrescentar em `scripts` (não mexer em dependências):

```json
"test": "TZ=America/Sao_Paulo node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --import ./scripts/test-hooks.mjs --test \"lib/**/*.test.ts\" \"supabase/functions/**/*.test.ts\""
```

`TZ` fixo garante que os testes de fuso sejam determinísticos (fuso do produto, DP-42).

### 3.3 `lib/planWeekStatusParser.ts` (extração)

Mover de `lib/planWeekStatus.ts` para o arquivo novo, sem mudar nada: `blockReasons`, `numberOf`,
`textOf`, `booleanOf`, `blockReasonOf` e `parsePlanWeekStatus` (exportada). O arquivo novo importa
só `isRecord` de `@/lib/activities` e tipos de `@/types/planWeek`. `lib/planWeekStatus.ts` passa a
importar `parsePlanWeekStatus` de `@/lib/planWeekStatusParser` e não reexporta nada novo.

### 3.4 Casos de teste (todos com `import { describe, it } from 'node:test'` e `assert from 'node:assert/strict'`, importando o módulo testado com caminho relativo e extensão `.ts`, ex.: `'./planCalendar.ts'`)

**`lib/planCalendar.test.ts`** (calendário e fuso)
1. `addDays('2026-12-30', 3)` = `'2027-01-02'`; `addDays('2026-03-01', -1)` = `'2026-02-28'`.
2. `mondayOf('2026-11-08')` (domingo) = `'2026-11-02'`; `mondayOf('2026-11-02')` = `'2026-11-02'`.
3. `daysBetween('2026-11-02', '2026-11-09')` = `7`.
4. `weekdayName('2026-11-02')` = `'Segunda'`; `weekdayName('2026-11-08')` = `'Domingo'`.
5. Fuso (importar `localToday` de `./planDates.ts`): `localToday(new Date('2026-11-03T02:59:00Z'))` = `'2026-11-02'` e `localToday(new Date('2026-11-03T03:00:00Z'))` = `'2026-11-03'` (virada de dia em America/Sao_Paulo).

**`lib/planProgress.test.ts`** (estados de sessão, descanso)
1. `sessionState('completed', '2026-11-01', '2026-11-02')` = `'completed'`.
2. `'in_progress'` e `'paused'` → `'in_progress'`.
3. `'interrupted'` → `'interrupted'`; `'cancelled'` → `'cancelled'`.
4. `'scheduled'` com data anterior a hoje → `'missed'`; igual → `'today'`; posterior → `'pending'`.
5. `weekDays(week, '2026-11-02')` com `week.sessions` contendo sessões só em `2026-11-03` e `2026-11-05`: retorna 7 dias, de `'2026-11-02'` a `'2026-11-08'`, e os dias sem sessão (descanso) têm `sessions` vazio (5 dias). Monte os objetos mínimos com os campos usados (`date`, `status`, `workout: { position: 0 }`) e converta com `as unknown as PlanWeek` (tipo importado com `import type`).
6. `planProgress(plan)` com 3 sessões, 1 `completed`, 1 `interrupted`, 1 `scheduled` → `{ done: 1, total: 3 }`.

**`lib/planWeekStatusParser.test.ts`** (aderência e avanço vindos do servidor)
1. Payload completo válido (todas as chaves snake_case, `adherence: 0.67`, `block_reason: null`) → objeto camelCase igual ao esperado.
2. `adherence` ausente → `adherence: null` (semana sem sessão elegível não vira 0%).
3. Falta `can_advance` → `null`.
4. `block_reason: 'below_minimum'` → `blockReason: 'below_minimum'`; `block_reason: 'xyz'` → `null`.
5. `null`, `'texto'` e `[]` → `null`.

**`lib/onboardingProgress.test.ts`** (elegibilidade)
1. `isEligibleLevel('total_beginner')` e `isEligibleLevel('beginner')` → `true`.
2. `isEligibleLevel('intermediate')` e `isEligibleLevel('advanced')` → `false` (DP-01). Use os valores reais de `onboardingOptions.level` em `types/onboarding.ts`.
3. `pendingStep({})` = primeira chave de `onboardingStepKeys`; com todas as respostas = `null`.

**`lib/workoutBlocks.test.ts`** (execução guiada)
1. `blockAt([], 30)` → `{ index: 0, current: null, next: null, remainingSec: 0, done: false }`.
2. Com blocos `[{endSec: 60}, {endSec: 120}]` (monte via `expandBlocks` com passos reais ou objetos mínimos): em `0` → índice 0, `remainingSec` 60; em `60` → índice 1; em `120` → `done: true`.
3. Tempo negativo é tratado como 0.

**`lib/analyticsPayload.test.ts`** (privacidade)
1. `buildAnalyticsPayload('workout_completed', { session_id: 'a', duration: 61.6, distance: 1000.4, source: 'paceless' })` → `{ session_id: 'a', duration: 62, distance: 1000, source: 'paceless' }`.
2. Chave extra (ex.: `email: 'x@y.z'`, passada com `as never`) não aparece.
3. String com 100 caracteres é cortada em 64.
4. `NaN` some do payload; `null` em `reason_optional` permanece `null`.

**`lib/analyticsRules.test.ts`** (idempotência de conquistas e meta semanal)
1. `rememberKey([], 'k')` → `isNew: true`, `sent: ['k']`; `rememberKey(['k'], 'k')` → `isNew: false`, `sent` inalterado.
2. Conceder a mesma conquista duas vezes: aplicar `rememberKey` duas vezes com `achievementKey('first_workout')` → só a primeira é nova.
3. Limite: com 200 chaves, adicionar uma nova mantém 200 e descarta a mais antiga.
4. `isWeeklyGoalCompleted`: `null` → `false`; `eligible 0` → `false`; `completed 2 / eligible 3` → `false`; `3/3` → `true`.
5. `weeklyGoalKey` muda quando `currentAttempt` muda (repetir semana gera nova chave).
6. `isFreshSignup`: diferença de 5 s → `true`; 2 h → `false`; `undefined` ou data inválida → `false`.
7. `templateVersionLabel(3)` = `'v3'`; `undefined`, `0`, `'3'` → `'unknown'`.
8. `analyticsSessionId(null, 'act')` = `'act'`; `analyticsSessionId('ses', 'act')` = `'ses'`.

`supabase/functions/_shared/plan/generate.test.ts` (já existe, 14 casos) passa a rodar no
`npm test` e cobre a geração de plano (dois dias, nível fora do escopo).

### 3.5 Lacunas registradas (não implementar)

Regras que moram em SQL não rodam com `node --test`: transições `transition_plan_session`,
fechamento de semana, mínimo `ceil(2/3)`, conclusão pelo trigger da atividade, idempotência real
de conquistas (`on conflict do nothing`) e acesso cruzado entre usuários (RLS). Precisam de banco
local (Supabase CLI + pgTAP) — pendente (DP-43). E2E, acessibilidade automatizada, rede instável,
bateria e GPS degradado ficam como roteiro manual em dispositivo real (seção 5).

### 3.6 `docs/testes.md` (novo)

Como rodar (`npm test`), o que cada arquivo cobre (lista da 3.4 ligada aos itens da seção 11 do
PRD), as lacunas da 3.5 e o roteiro manual da seção 5 desta spec.

## 4. Falha de rede e permissão negada nas telas tocadas (PRD seção 14, item 6)

Auditoria do orquestrador:

| Tela | Rede | Permissão | Ação nesta fase |
|---|---|---|---|
| `onboarding/plan-ready` | erro + "Tentar novamente" | lembretes: falha ignorada (DP-13) | nenhuma |
| `plan-paywall` | diálogo "Plano não atualizado" | — | nenhuma |
| Plano (`plan/index`, `week/[week]`, `session/[id]`) | `PlanError` com "Tentar novamente" | — | nenhuma |
| Treino (`workout/[id]`) | salvamento vai para fila offline | GPS: `GpsNotice` (negada, pedir de novo, ajustes) | nenhuma |
| Resumo (`workout/summary`) | mensagens `queued`/`failed` + tentar de novo | — | nenhuma |
| Histórico (`activities`) | erro com e sem lista | — | nenhuma |
| Conquistas | erro com tentar de novo | — | nenhuma |
| Perfil/notificações | — | `PermissionNotice` | nenhuma |
| **Início (`(tabs)/index`)** | **falha ao carregar o plano mostra "Vamos montar seu plano?" e o `NoPlanCard` — mensagem errada** | — | **corrigir (4.1)** |

### 4.1 `app/(app)/(tabs)/index.tsx`

- `const { plan, loading: planLoading, error: planError, reload: reloadPlan } = useActivePlan();`
- `const noPlan = !planLoading && plan === null && planError === null;`
- Trocar `{noPlan ? <NoPlanCard /> : <PlanCard plan={plan} loading={planLoading} />}` por:

```tsx
{planError !== null && plan === null ? (
  <PlanError message={planError} onRetry={() => { void reloadPlan(); }} />
) : noPlan ? (
  <NoPlanCard />
) : (
  <PlanCard plan={plan} loading={planLoading} />
)}
```

- Importar `PlanError` de `@/components/plan/PlanStates` (já existe: título "Não foi possível
  carregar seu plano", descrição = mensagem do hook, botão "Tentar novamente").
- O subtítulo da saudação com erro mostra `'Pronto para o seu treino de hoje?'` (já é o
  comportamento quando `noPlan` é falso). Não criar componente novo.

## 5. Go-live (PRD seção 14) — `docs/go-live.md` (novo)

Criar com o conteúdo abaixo (pode ajustar redação, não o status). Status: **OK** (atendido e com
evidência no código), **Parcial** (implementado, falta verificação em dispositivo/homologação),
**Pendente** (não feito).

```markdown
# Checklist de go-live do MVP

Fonte: PRD v1, seção 14. Atualizado na fase 5 (`docs/spec-fase5.md`).
Status: OK, Parcial (falta verificar em dispositivo real ou homologar) ou Pendente.

| # | Critério (PRD 14) | Status | Evidência / o que falta |
|---|---|---|---|
| 1 | Criar conta, concluir onboarding e receber plano elegível | Parcial | Fase 1 (fluxo conta → onboarding → plano → paywall). Falta rodar em iOS e Android com banco novo. |
| 2 | Plano, calendário, descanso e sessões consistentes | Parcial | Fases 1 e 3; testes `planCalendar`, `planProgress`, `generate`. Falta testar virada de semana em dispositivo. |
| 3 | Treino iniciado, pausado, retomado, finalizado e salvo sem perda ou duplicação | Parcial | Fases 2 e 3: id gerado no cliente (DP-19), fila offline, retomada após crash. Falta roteiro manual (abaixo). |
| 4 | Histórico e dashboard refletem dados persistidos | Parcial | Fase 4 (`get_progress_summary`, histórico). Falta conferir com dados reais. |
| 5 | Progresso e conquistas não recompensam duplicadas nem penalizam descanso | Parcial | Trigger com `on conflict do nothing` (DP-32), descanso sem linha (DP-31). Sem teste SQL automatizado (DP-43). |
| 6 | Falhas de rede e permissões negadas com estados e mensagens claros | Parcial | Auditoria da fase 5 (spec seção 4) e correção no Início. Falta passar o roteiro em modo avião. |
| 7 | LGPD, segurança, monitoramento, suporte e rollback verificados | Pendente | Existem termos/privacidade e exclusão de conta. Faltam: provedor de crash/monitoramento (lib nova), alerta de falha de sync, canal de suporte definido, plano de rollback (OTA em `docs/ota.md` + migrations reversas). |
| 8 | DEC-01 a DEC-06 e DEC-09 homologadas | Pendente | Decisões provisórias em `docs/decisoes-provisorias-prd.md` aguardam o Pedro: DEC-01 (DP-01), DEC-02 (DP-03), DEC-03 (sem decisão), DEC-04 (sem decisão), DEC-05 (sem decisão), DEC-06 (GPS próprio + HealthKit/Health Connect já implementados), DEC-09 (DP-25, DP-31). |

## Requisitos não funcionais (PRD 10)

| Categoria | Status | Nota |
|---|---|---|
| Desempenho | Pendente | Sem benchmark de P95. |
| Confiabilidade | Parcial | Idempotência por id do cliente e fila offline. |
| Disponibilidade | Pendente | Depende do plano do Supabase. |
| Acessibilidade | Parcial | Labels e `accessibilityRole` nas telas; falta auditoria WCAG 2.2 AA. |
| Segurança | Parcial | RLS, lógica sensível em Edge Function/RPC; falta revisão de rate limit. |
| Privacidade | Parcial | Analytics sem dados pessoais (DP-38); falta política de retenção. |
| Observabilidade | Pendente | Só log de dev; precisa lib aprovada. |
| Compatibilidade | Pendente | Definir versões mínimas iOS/Android. |
| Qualidade | Parcial | `npm test` cobre lógica pura; faltam SQL, E2E e testes em dispositivo. |

## Roteiro manual em dispositivo real

1. Conta nova por e-mail e por Google/Apple → onboarding → plano pronto → paywall → Início.
2. Iniciar treino do plano, pausar, retomar, finalizar → resumo "salvo" → sessão concluída no plano.
3. Repetir o passo 2 em modo avião → resumo "guardado" → religar a rede → atividade aparece uma só vez.
4. Matar o app no meio do treino → reabrir → retomar → finalizar sem duplicar.
5. Negar GPS → aviso no treino; negar notificações → aviso no perfil.
6. Início, Plano, Histórico e Conquistas em modo avião → mensagens de erro com "Tentar novamente".
7. Excluir conta → dados somem e volta para a tela inicial.
8. Com `__DEV__`, conferir no console os eventos `[analytics]` de cada passo e que nenhum traz e-mail, nome ou localização.
```

## 6. Ordem de execução e verificação

1. Seção 3.1–3.3 (hooks de teste, script, extração do parser) → `npm test` verde só com o
   `generate.test.ts` e `parseHeartRate.test.ts` existentes.
2. Seção 2.1–2.3 + testes da 3.4 → `npm test` verde.
3. Seção 2.4–2.7 (analytics e disparos) → `npx tsc --noEmit` e `npx eslint .` verdes.
4. Seção 4.1 (Início) → tsc + eslint verdes.
5. Docs (2.8, 3.6, 5).
6. Final: `npm test`, `npx tsc --noEmit`, `npx eslint .` e `grep -rn "console\." lib hooks app components` deve mostrar só `lib/analytics.ts`.

## 7. Critérios de aceite

PRD cobertos: seção 9 (eventos), seção 11 (testes de estado, calendário, plano), seção 14 item 6
(rede/permissão) e checklist da seção 14.

- **CA-A1** `types/analytics.ts` define exatamente os 9 eventos do PRD seção 9 com as propriedades
  mínimas listadas; `track` não compila com nome ou propriedade fora do mapa.
- **CA-A2** Em `__DEV__`, cada evento gera uma linha `[analytics] <nome> {payload}`; em produção,
  nada é logado nem enviado.
- **CA-A3** Nenhum payload contém e-mail, nome, id de usuário, coordenadas, FC, sensação, rota ou
  pace; chaves fora da lista são descartadas (teste `analyticsPayload` 2).
- **CA-A4** `weekly_goal_completed` e `achievement_awarded` disparam no máximo uma vez por
  semana/tentativa e por conquista em cada instalação (teste `analyticsRules` 1–3, 5).
- **CA-A5** Retomar um treino após crash não gera novo `workout_started`; finalizar não gera
  `workout_paused`.
- **CA-A6** Treino com menos de 10 s gera `workout_interrupted` com `reason_optional: 'too_short'`;
  sair descartando gera `'discarded'`; treino salvo ou na fila gera `workout_completed`.
- **CA-A7** Login social de conta existente não gera `signup_completed`; conta criada agora gera.
- **CA-T1** `npm test` roda todos os `*.test.ts` de `lib/` e `supabase/functions/` com TZ
  America/Sao_Paulo e passa (0 falhas), sem lib nova.
- **CA-T2** Há testes para: estados de sessão (planProgress 1–4), aderência/avanço vindos do
  servidor (planWeekStatusParser), elegibilidade (onboardingProgress, generate), idempotência de
  conquistas no app (analyticsRules), calendário com fuso e descanso (planCalendar 1–5, planProgress 5).
- **CA-R1** Com falha ao carregar o plano, o Início mostra "Não foi possível carregar seu plano"
  com "Tentar novamente" e não mostra o card "monte seu plano"; tocar em tentar recarrega.
- **CA-R2** As demais telas da tabela da seção 4 mantêm seus estados de erro/permissão.
- **CA-G1** `docs/go-live.md` existe com os 8 itens da seção 14 do PRD, cada um com status e
  evidência, a tabela de requisitos não funcionais e o roteiro manual.
- **CA-Q1** `npx tsc --noEmit` e `npx eslint .` sem erros; nenhum arquivo `.ts/.tsx` acima de 200
  linhas; nenhuma dependência nova em `package.json`.

## 8. Fora do escopo / pendências

- Provedor real de analytics e de crash/monitoramento (lib nova; DP-37).
- Testes SQL (pgTAP + Supabase local) e E2E (Maestro/Detox) — lib/ferramenta nova (DP-43).
- Deploy da Edge Function com `generatorVersion` (até lá `template_version: 'unknown'`).
- Consentimento explícito de analytics na UI: não necessário enquanto nada sai do aparelho (DP-44).
- Homologação das DEC-01 a DEC-06 e DEC-09 pelo Pedro.
