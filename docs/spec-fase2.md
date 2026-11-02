# Spec — Fase 2: execução guiada e resumo com sensação

Cobre RUN-01..RUN-04, US-RUN-01 (CA1–CA5) e US-RUN-02 (CA1–CA3) do PRD (`docs/prd-v1.md`).
Decisões provisórias novas: DP-14 a DP-20 em `docs/decisoes-provisorias-prd.md`.

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
| criar | `supabase/migrations/20261102010000_activity_perceived_effort.sql` |
| criar | `lib/workoutBlocks.ts` |
| criar | `lib/perceivedEffort.ts` |
| criar | `lib/saveEffort.ts` |
| criar | `hooks/usePlanBlocks.ts` |
| criar | `hooks/useWallClock.ts` |
| criar | `components/workout/BlockGuide.tsx` |
| criar | `components/workout/PerceivedEffortPicker.tsx` |
| alterar | `lib/activities.ts` |
| alterar | `lib/activityQueue.ts` (e, se passar de 200 linhas, criar `lib/activityQueueStorage.ts`) |
| alterar | `lib/activeSession.ts` |
| alterar | `hooks/useActiveSessionSync.ts` |
| alterar | `hooks/useSaveActivity.ts` |
| alterar | `hooks/useFinishWorkout.ts` |
| alterar | `components/workout/WorkoutHeading.tsx` |
| alterar | `components/workout/HeartRateNotice.tsx` |
| alterar | `components/workout/workoutDialogs.tsx` |
| alterar | `app/(app)/workout/[id].tsx` |
| alterar | `app/(app)/workout/summary.tsx` |
| alterar | `theme/workout.ts` |
| alterar | `docs/banco-de-dados.md`, `docs/retomar-treino.md` |

Nada é removido nesta fase.

## 2. Banco — migration nova (NÃO aplicar)

`supabase/migrations/20261102010000_activity_perceived_effort.sql`, conteúdo exato:

```sql
alter table public.activities
  add column perceived_effort text
  check (perceived_effort in ('very_easy', 'easy', 'moderate', 'hard', 'very_hard'));

grant update (perceived_effort) on public.activities to authenticated;

create policy "activities_update_own_effort" on public.activities for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
```

Por quê: o grant de update vale só para a coluna `perceived_effort`; as demais colunas continuam
imutáveis para o cliente. O trigger `activities_link_plan_workout` é `after insert`, então um update
não remarca o plano (US-RUN-02 CA3).

Em `docs/banco-de-dados.md`, na seção da tabela `activities`, acrescente a coluna
`perceived_effort` (text, nulo = não informado/pulado; valores acima) e a política de update.

## 3. Libs

### 3.1 `lib/activities.ts`

- Exporte `export type PerceivedEffort = 'very_easy' | 'easy' | 'moderate' | 'hard' | 'very_hard';`
- Em `ActivityDraft` adicione `perceived_effort: PerceivedEffort | null;` (último campo).
- Exporte `isPerceivedEffort(value: unknown): value is PerceivedEffort` (compara com os 5 valores).
- Nada mais muda (`Activity`, `activitySelect` ficam iguais).

### 3.2 `lib/activityQueue.ts`

1. `withPlanLink`: além do que já faz, normalize
   `perceived_effort: isPerceivedEffort(draft.perceived_effort) ? draft.perceived_effort : null`
   (rascunhos antigos na fila não têm o campo).
2. `enqueueActivity` passa a ser idempotente por `id`: dentro do lock, monte
   `const others = queue.filter((item) => item.id !== draft.id)` e grave `[...others, compact]`
   (e o fallback `[...others, { ...compact, route: null }]`). Salvar o mesmo rascunho duas vezes
   resulta em uma única entrada.
3. Nova função exportada:

```ts
export async function patchQueuedEffort(id: string, effort: PerceivedEffort): Promise<boolean>
```
   Dentro de `withQueueLock`: lê a fila; se nenhum item tem esse `id`, retorna `false`; senão
   grava a fila com `perceived_effort: effort` nesse item e retorna o resultado de `writeQueue`.
4. Em `flushPendingActivities`, logo após `void flushPendingSamples(userId, pendingIds);`, chame
   `void flushPendingEfforts();` (de `lib/perceivedEffort.ts`).
5. Se o arquivo passar de 200 linhas, mova `isDraft`, `withPlanLink`, `readQueue`, `writeQueue` e
   `decimateRoute` para `lib/activityQueueStorage.ts` (exportando o que for usado) e importe de lá.
6. Sem import circular: `lib/perceivedEffort.ts` NÃO importa `lib/activityQueue.ts`. Quem junta
   os dois é `lib/saveEffort.ts` (seção 3.3).

### 3.3 `lib/perceivedEffort.ts` (novo)

```ts
export const PENDING_EFFORTS_KEY = 'paceless:pending-efforts';
export const perceivedEffortOptions: readonly PerceivedEffort[] =
  ['very_easy', 'easy', 'moderate', 'hard', 'very_hard'];
export const perceivedEffortLabels: Record<PerceivedEffort, string> = {
  very_easy: 'Muito leve',
  easy: 'Leve',
  moderate: 'Moderado',
  hard: 'Difícil',
  very_hard: 'Muito difícil',
};
export type EffortSaveResult = 'saved' | 'queued' | 'failed';
export async function updateEffort(activityId: string, effort: PerceivedEffort): Promise<boolean>
export async function storePendingEffort(activityId: string, effort: PerceivedEffort): Promise<boolean>
export async function flushPendingEfforts(): Promise<void>
```

Este arquivo só importa `lib/activities.ts`, `lib/supabase.ts` e AsyncStorage.

Em `lib/saveEffort.ts` (novo, importa `activityQueue` e `perceivedEffort`):
`export async function savePerceivedEffort(activityId: string, effort: PerceivedEffort): Promise<EffortSaveResult>`,
nesta ordem:
1. Se `patchQueuedEffort(activityId, effort)` retornar `true` → `'queued'` (a atividade ainda está
   na fila; o insert levará o campo).
2. Tenta `updateEffort(activityId, effort)`. `updateEffort` (em `perceivedEffort.ts`): `supabase.from('activities')
   .update({ perceived_effort: effort }).eq('id', activityId).select('id')` com timeout de
   10000 ms (mesmo padrão `Promise.race` de `insertActivity`); `true` = sem erro e `data` com
   1 linha; exceção ou sem `supabase` → `false`. Em `true`, `savePerceivedEffort` chama
   `notifyActivitiesChanged()` e retorna `'saved'`.
3. Senão `storePendingEffort`: grava `{ [activityId]: effort }` mesclado no objeto JSON em
   `PENDING_EFFORTS_KEY` (AsyncStorage, try/catch). `true` → `'queued'`; `false` → `'failed'`.

`flushPendingEfforts`: lê o mapa (valores inválidos são descartados com `isPerceivedEffort`); para
cada par chama `updateEffort`; remove do mapa os que tiveram sucesso; se o mapa ficar vazio,
`removeItem`. Uma flag de módulo `flushing` impede execução concorrente. Sem `supabase` → retorna.

### 3.4 `lib/workoutBlocks.ts` (novo)

```ts
export type BlockKind = 'warmup' | 'run' | 'walk' | 'cooldown' | 'strength';
export interface WorkoutBlock { kind: BlockKind; label: string; startSec: number; endSec: number; }
export interface BlockPosition {
  index: number;
  current: WorkoutBlock | null;
  next: WorkoutBlock | null;
  remainingSec: number;
  done: boolean;
}
export const blockKindLabels: Record<BlockKind, string> = {
  warmup: 'Aquecimento',
  run: 'Corrida',
  walk: 'Caminhada',
  cooldown: 'Desaquecimento',
  strength: 'Fortalecimento',
};
export function expandBlocks(steps: PlanStep[]): WorkoutBlock[]
export function blockAt(blocks: WorkoutBlock[], activeSec: number): BlockPosition
export function formatBlockTime(seconds: number): string
```

- `expandBlocks`: percorre em ordem; `repeat` é expandido `times` vezes, recursivamente; passos
  folha com `durationSec <= 0` ou não finito são ignorados. `startSec` acumula a partir de 0;
  `endSec = startSec + Math.round(durationSec)`.
- `blockAt`: `activeSec` negativo vira 0. Acha o primeiro bloco com `activeSec < endSec`.
  Encontrado no índice `i` → `{ index: i, current, next: blocks[i + 1] ?? null,
  remainingSec: endSec - activeSec (arredondado para cima, inteiro), done: false }`.
  Não encontrado (inclusive lista vazia) → `{ index: blocks.length, current: null, next: null,
  remainingSec: 0, done: blocks.length > 0 }`.
- `formatBlockTime`: `m:ss` abaixo de 1 hora (`1:05`, `0:09`), `h:mm:ss` a partir de 1 hora.
- O bloco atual é derivado só do **tempo ativo** (cronômetro), por isso pausa congela o bloco e
  a retomada de sessão (`?resume=1`) volta no bloco certo sem estado extra (US-RUN-01 CA5).

## 4. Hooks

### 4.1 `hooks/usePlanBlocks.ts` (novo)

`export function usePlanBlocks(userPlanWorkoutId: string | null): WorkoutBlock[]`

- Usa `useActivePlan()`. Se `userPlanWorkoutId` é nulo, `plan` é nulo ou `findSession` não acha
  → `[]`. Se `session.workout.kind !== 'run'` → `[]`. Senão
  `useMemo(() => expandBlocks(session.workout.steps), [...])`.
- Não força recarga; se o plano não estiver em cache, o próprio `useActivePlan` carrega. Enquanto
  carrega → `[]` (tela mostra o treino livre normalmente).

### 4.2 `hooks/useWallClock.ts` (novo)

`export function useWallClock(startedAtMs: number): number` — retorna `Date.now() - startedAtMs`
(mínimo 0), atualizado por `setInterval` de 1000 ms, sempre rodando (inclusive em pausa),
limpo no unmount.

### 4.3 `hooks/useSaveActivity.ts`

- `export type NewActivity = Omit<ActivityDraft, 'user_id'>;` (o `id` agora vem de quem chama).
- Em `save`, `const draft: ActivityDraft = { ...activity, user_id: userId };` — remova o
  `randomUUID()` e o import de `expo-crypto` deste arquivo.
- Resto igual. Com o mesmo `id`, `insertActivity` (upsert `ignoreDuplicates`) e
  `enqueueActivity` (seção 3.2) não duplicam (US-RUN-01 CA4).

### 4.4 `lib/activeSession.ts` e `hooks/useActiveSessionSync.ts`

- `ActiveSession` ganha `activityId: string`.
- `parseSession`: lê `stored['activityId']`; se não for string não vazia, usa `randomUUID()`
  (import de `expo-crypto`) — sessões gravadas antes desta fase continuam retomáveis.
- `ActiveSessionSyncOptions` ganha `activityId: string`; ele já vai no spread `...rest`, então só
  o tipo muda. Confirme que `saveActiveSession` grava o campo.

### 4.5 `hooks/useFinishWorkout.ts`

- Opções ganham `activityId: string`.
- O `draft` ganha `id: activityId` e `perceived_effort: null`.
- `averagePace` só quando `snapshot.distanceMeters > 0` (já é assim).
- `distanceMeters` no `setWorkoutSummary` continua o arredondado.

## 5. Componentes

### 5.1 `theme/workout.ts`

Acrescente: `blockTimeSize: 56`, `blockBannerMs: 4000`, `effortOptionHeight: 48`.

### 5.2 `components/workout/BlockGuide.tsx` (novo)

Props: `{ blocks: WorkoutBlock[]; activeSeconds: number; paused: boolean }`.
Retorna `null` se `blocks.length === 0`.

Layout (coluna, `gap: spacing.sm`, `marginBottom: spacing.xl`, fundo `palettes.dark.surface`,
`borderRadius: radius.lg` (use o token existente mais próximo em `theme/radius.ts`),
`padding: spacing.lg`):

1. Linha do bloco: ícone por tipo (tamanho `workout.statusIconSize`) + `Text variant="captionStrong"`
   com `blockKindLabels[current.kind]` em maiúsculas + `Text variant="caption"` com
   `current.label` (cor `palettes.dark.textSecondary`). Ícones: `Flame` (warmup), `Zap` (run),
   `Footprints` (walk), `Wind` (cooldown), `Dumbbell` (strength). Cor do ícone e da tarja:
   `colors.primary` para `run`; `palettes.dark.ink` para os demais.
2. Tempo restante do bloco: `Text` com `formatBlockTime(remainingSec)`, `fontSize`
   `workout.blockTimeSize` via variante `metric` existente + estilo, cor `palettes.dark.ink`;
   abaixo `Text variant="caption"`: `Restante do bloco`.
3. Próximo: `Próximo: {blockKindLabels[next.kind]} · {formatBlockTime(next.endSec - next.startSec)}`;
   se `next` é nulo e não `done`: `Último bloco`.
4. Indicador `Bloco {index + 1} de {blocks.length}` (`caption`, `textSecondary`).
5. Quando `done`: substitui 1–4 por ícone `CheckCircle2` + `Treino do plano concluído` e, abaixo,
   `Finalize quando quiser`.
6. Pausado: acrescenta `Pausado` (`captionStrong`, `textSecondary`) acima do tempo restante.

Transição (RUN-03): guarde o último `index` em `useRef`. Quando `index` muda (e não é a primeira
renderização), mostre por `workout.blockBannerMs` ms uma faixa no topo do card com fundo
`colors.primary`, texto `colors.onPrimary`, `captionStrong`:
`Agora: {blockKindLabels[current.kind]}` ou, se `done`, `Treino do plano concluído`.
Use `useState` + `setTimeout` limpo no unmount/troca. A borda do card também fica
`colors.primary` (largura `StyleSheet.hairlineWidth * 2` ou token existente) enquanto a faixa
aparece. Acessibilidade: a faixa tem `accessibilityLiveRegion="polite"` e
`accessibilityRole="alert"`.

Sem vibração e sem voz (ver DP-18).

### 5.3 `components/workout/WorkoutHeading.tsx`

- Nova prop `totalFormatted: string`.
- Acima do cronômetro grande, `Text variant="caption"` `Tempo ativo`.
- Abaixo do cronômetro, `Text variant="caption"` cor `textSecondary`:
  `Tempo total {totalFormatted}` (US-RUN-01 CA1: decorrido x ativo).

### 5.4 `components/workout/HeartRateNotice.tsx` (US-RUN-01 CA3)

- `status === 'none' || status === 'idle'` deixa de retornar `null`: renderiza linha com
  `HeartOff` (cor `textSecondary`) + `Text variant="caption"` `FC indisponível`.
- `connected` com `bpm === null` ou `bpm <= 0`: mostra `FC indisponível` no lugar de `-- bpm`.
- Nunca exibir `0 bpm`.

### 5.5 `components/workout/workoutDialogs.tsx`

`confirmStop`: título `Finalizar treino?`, mensagem `O treino será encerrado e salvo.`,
`confirmLabel: 'Finalizar'`, `cancelLabel: 'Continuar'`.

### 5.6 `components/workout/PerceivedEffortPicker.tsx` (novo)

Props: `{ activityId: string }`. Estado interno:
`phase: 'choosing' | 'saving' | 'saved' | 'queued' | 'skipped' | 'failed'`, `choice: PerceivedEffort | null`.

- `choosing`: título `Como você se sentiu?` (`title3`, `palettes.dark.ink`); subtítulo
  `Opcional. Ajuda a acompanhar sua tolerância ao esforço.` (`caption`, `textSecondary`);
  5 opções em coluna (`perceivedEffortOptions`), cada uma `Pressable` com altura
  `workout.effortOptionHeight`, `accessibilityRole="radio"`, `accessibilityState={{ selected }}`,
  borda `palettes.dark.border`, selecionada com fundo `colors.primarySoft` e borda `colors.primary`,
  texto = `perceivedEffortLabels[...]`. Abaixo, `Button` `Salvar sensação` (desabilitado sem
  escolha) e `Button variant="text"` `Pular`.
- Salvar → `phase='saving'` (botão `Salvando...`, desabilitado) → `savePerceivedEffort` (de `lib/saveEffort.ts`) →
  `saved` / `queued` / `failed`.
- `saved`: ícone `Check` + `Sensação registrada: {label}`.
- `queued`: ícone `CloudOff` + `Sensação guardada. Será enviada quando houver conexão.`
- `failed`: `Não foi possível guardar a sensação.` + `Button variant="text"` `Tentar de novo`
  (volta a salvar com a mesma escolha).
- `skipped`: `Text caption` `Sensação não registrada.` — não grava nada (valor fica nulo).

## 6. Telas

### 6.1 `app/(app)/workout/[id].tsx`

- `const [activityId] = useState<string>(() => resumed?.session.activityId ?? randomUUID());`
  (`randomUUID` de `expo-crypto`). Passe `activityId` para `useActiveSessionSync` e
  `useWorkoutFinish`.
- `const blocks = usePlanBlocks(userPlanWorkoutId);`
- `const totalMs = useWallClock(startedAtRef.current.getTime());` e passe
  `totalFormatted={formatElapsed(totalMs)}` ao `WorkoutHeading`. Observação: em sessão nova
  `startedAtRef` é redefinido no efeito de start; use o valor atual a cada render
  (o `useWallClock` deve receber o número e recalcular quando ele mudar).
- Entre `WorkoutHeading` e `WorkoutStatsBlock`:
  `<BlockGuide blocks={blocks} activeSeconds={elapsedSeconds} paused={!running} />`.
- `SlideToFinish.onFinish` passa a chamar `confirmStop(() => { finishWorkout(); })` (DP-15).
- Se o arquivo passar de 200 linhas, extraia o `useEffect`/estado de retomada do
  `WorkoutScreen` ou os estilos para um arquivo novo; não mude comportamento.

### 6.2 `app/(app)/workout/summary.tsx`

- Stats (US-RUN-02 CA1): se `summary.distanceMeters === 0`, distância usa
  `formatDistanceStat(null, unit)` (traço) e o ritmo já é traço (pace nulo). Duração = tempo ativo
  (`durationSeconds`) com rótulo `Tempo ativo`. Acrescente uma 4ª informação abaixo da `StatRow`,
  `Text caption`: `Tempo total {formatElapsed((new Date(draft.ended_at) - new Date(draft.started_at)))}`.
- FC: se `summary.heartRate` é nulo ou `avg` não é número > 0, mostre linha `HeartOff` +
  `Frequência cardíaca indisponível` no lugar do `HeartRateSummaryCard`.
- `retry` reutiliza `summary.draft` (que agora tem `id`), então não duplica.
- Logo antes do botão `Concluir`, quando `status !== 'failed'`:
  `<PerceivedEffortPicker activityId={summary.draft.id} />`. Com `failed`, o seletor não aparece;
  depois de `retry` com sucesso ele aparece.
- `Concluir` continua indo para `/` sem exigir sensação (pular implícito).

## 7. Docs

- `docs/retomar-treino.md`: acrescente que a sessão ativa guarda `activityId` gerado no início,
  usado como `id` da atividade; finalizar, tentar de novo ou reenviar pela fila nunca cria outra
  linha. Acrescente que o bloco guiado é recalculado a partir do tempo ativo ao retomar.
- `docs/banco-de-dados.md`: ver seção 2.

## 8. Critérios de aceite (verificáveis)

PRD:
- US-RUN-01 CA1: pausar congela `Tempo ativo` e o bloco; `Tempo total` continua andando; retomar
  continua o ativo de onde parou.
- US-RUN-01 CA2: tanto o botão de parar quanto o deslizar para finalizar abrem `Finalizar treino?`;
  `Continuar` mantém o treino rodando.
- US-RUN-01 CA3: sem cinta, a tela mostra `FC indisponível`; o resumo mostra
  `Frequência cardíaca indisponível`; nenhuma tela mostra `0 bpm`; `avg_heart_rate` gravado é nulo.
- US-RUN-01 CA4: chamar `save` duas vezes com o mesmo rascunho gera no máximo uma linha
  (upsert por `id`) e uma entrada na fila (`enqueueActivity` substitui por `id`).
- US-RUN-01 CA5: fechar o app durante um treino do plano e reabrir com retomada volta ao mesmo
  bloco e ao mesmo `activityId`.
- US-RUN-02 CA1: resumo mostra duração; distância e ritmo só com valor quando houve GPS, senão traço.
- US-RUN-02 CA2: é possível escolher uma das 5 sensações e salvar, ou tocar `Pular`/`Concluir`
  sem escolher; a coluna fica nula.
- US-RUN-02 CA3: a sessão do plano é marcada `done` uma única vez (trigger só em insert; update de
  sensação não dispara nada) e a lista de atividades é notificada.
- RUN-03: treino de sessão do plano mostra bloco atual, tempo restante do bloco, próximo bloco,
  `Bloco N de M` e a faixa `Agora: ...` por 4 s a cada troca; treino livre (`/workout/atual`) não
  mostra o `BlockGuide`.

Técnicos:
- `expandBlocks([{kind:'warmup',durationSec:300,label:'a'},{kind:'repeat',times:2,steps:[{kind:'run',durationSec:60,label:'b'},{kind:'walk',durationSec:90,label:'c'}]},{kind:'cooldown',durationSec:300,label:'d'}])`
  gera 6 blocos; o último tem `startSec 600` e `endSec 900`.
- `blockAt(esses blocos, 310)` → `index 1`, `current.kind 'run'`, `remainingSec 50`,
  `next.kind 'walk'`. `blockAt(..., 900)` → `done: true`, `current: null`.
- `formatBlockTime(65) === '1:05'`, `formatBlockTime(3725) === '1:02:05'`.
- Fila antiga sem `perceived_effort` continua sendo lida (campo vira nulo).
- `npx tsc --noEmit` e `npx eslint .` limpos; nenhum arquivo `.ts/.tsx` acima de 200 linhas;
  nenhuma dependência nova em `package.json`.

## 9. Fora do escopo / pendências

- Vibração e voz nas transições (DP-18): exigem `expo-haptics`/`expo-speech` (não instalados).
- Voltas (RUN-05) e qualidade de GPS/sensores (RUN-06) são P1.
- Exibir a sensação no histórico/detalhe da atividade fica para a fase de progresso.
