# Auditoria de estilo — telas e componentes do PRD

Escopo: arquivos `.tsx` criados ou alterados entre `7a204ed..698c55c`
(`git diff --name-only --diff-filter=AM 7a204ed..698c55c -- '*.tsx'`), 31 arquivos.
Referência: `theme/`, componentes base (`Screen`, `ScreenHeader`, `ScreenTitle`,
`Card`, `Button`, `EmptyState`, `InlineError`, `ListRow`, `SelectableCard`,
`CheckCircle`, `IconBadge`), `docs/design-system.md` e as telas que já existiam
antes de `7a204ed` (perfil, atividades, treino antigo).

Só visual/estilo. Nada aqui muda lógica de negócio, hooks de dados ou SQL.

## Resumo

| Severidade | Qtde | Critério |
|---|---|---|
| Alta | 2 | Defeito visível (layout quebrado) |
| Média | 7 | Fora do padrão de forma visível ou regra explícita do checklist |
| Baixa | 15 | Token, consistência fina, acessibilidade complementar, texto |

Arquivos **sem achados**: `app/(app)/_layout.tsx`, `app/(app)/onboarding/_layout.tsx`,
`app/(pre-auth)/signup.tsx`, `app/(pre-auth)/welcome.tsx` (no PRD só mudou a rota do
botão; `palettes.dark.background` no root é intencional, foto sempre escura),
`app/(app)/workout/[id].tsx` (o `style={{ paddingBottom: insets.bottom + ... }}` é
dinâmico e segue a regra de insets), `components/achievements/AchievementRow.tsx`,
`components/home/NoPlanCard.tsx`, `components/workout/workoutDialogs.tsx`
(`palettes.dark.onPrimary` é proposital: o ícone vai dentro do `Dialog` com
`tone: 'dark'`, renderizado fora do `ThemeScope`; valor é igual nas duas paletas).

Regras do CLAUDE.md (item 6): nenhum comentário, nenhum `any`, todos os arquivos
com ≤200 linhas (`workout/[id].tsx` está no limite: 200; não adicionar linhas nele).

Ordem sugerida de aplicação: criar tokens (T1, T2) → Alta → Média → Baixa → rodar
`npx tsc --noEmit` e `npx eslint .`.

---

## Tokens novos (criar antes)

### T1. `sizes.iconHero` em `theme/sizes.ts`

Adicionar depois de `iconXl: 28,`:

```ts
  iconHero: 56,
```

Motivo: hoje três telas usam `sizes.iconXl * 2` (número solto multiplicando token).
56 preserva o tamanho atual.

### T2. `theme/opacity.ts`

Criar arquivo:

```ts
export const opacity = {
  hidden: 0,
} as const;
```

E em `theme/index.ts` adicionar a linha:

```ts
export { opacity } from './opacity';
```

Motivo: `opacity: 0` (esconder texto mantendo layout durante carregamento) aparece
em três arquivos do escopo. Não criar outras chaves agora (sem flexibilidade
especulativa).

---

## Alta

### A1. `app/(app)/onboarding/plan-ready.tsx` — botões encolhem para a largura do texto

Trecho (linhas 39, 58, 73) dentro de `body` com `alignItems: 'center'`:

```tsx
<Button label="Continuar" ... />
<Button label="Ir para o início" ... />
<Button label="Tentar novamente" onPress={retry} />
```

Por quê: `Button` não tem largura nem `paddingHorizontal`; dentro de um container
`alignItems: 'center'` ele fica do tamanho do rótulo, com o texto encostando na
borda verde. Nas outras telas o CTA ocupa a largura toda (signup, welcome, home).
Status: plausível pela leitura do código — confirmar no device.

Correção: em `makeStyles` adicionar

```ts
    cta: {
      alignSelf: 'stretch',
    },
```

e passar `style={styles.cta}` nos três `<Button>`.

### A2. `components/EmptyState.tsx` — botão de ação encolhe (afeta telas do PRD)

Trecho:

```tsx
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    ...
      {action}
```

Por quê: mesmo defeito do A1. Atinge `achievements.tsx` (Tentar novamente),
`plan/week/[week].tsx` (Ver planos), `plan/session/[id].tsx` (Voltar ao plano),
`PlanError`/`NoPlanState` e `ActivitiesEmpty`. Status: plausível — confirmar no device
antes de aplicar (é componente base; se o visual atual for desejado, pular).

Correção em `components/EmptyState.tsx`:

```tsx
      {action ? <View style={styles.action}>{action}</View> : null}
```

e em `styles`:

```ts
  action: {
    alignSelf: 'stretch',
    marginTop: spacing.sm,
  },
```

---

## Média

### M1. `app/(app)/(tabs)/plan/session/[id].tsx` — inset inferior duplicado sobre a tab bar

Trecho (linha 130):

```tsx
<View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
```

Por quê: a rota está dentro de `(tabs)` e a tab bar continua visível (o
`(tabs)/_layout.tsx` não esconde a barra). A tab bar já soma `insets.bottom`.
`docs/design-system.md`: "Telas dentro das abas não duplicam o padding inferior".
Resultado: faixa vazia extra acima da tab bar em aparelhos com home indicator.

Correção:
- trocar a linha por `<View style={styles.footer}>`;
- em `footer` adicionar `paddingBottom: spacing.lg,`;
- remover `const insets = useSafeAreaInsets();` e o import de
  `react-native-safe-area-context` (ficam órfãos).

### M2. `components/plan/DayRow.tsx` — feedback de toque por opacidade solta

Trecho (linhas 99–101):

```ts
    pressed: {
      opacity: 0.7,
    },
```

Por quê: número solto, e o padrão do app para toque é fundo `colors.track`
(`ListRow`, `PlanCard`, `TodayCard`).

Correção:

```ts
    pressed: {
      backgroundColor: colors.track,
      borderRadius: radius.sm,
    },
```

### M3. `app/(app)/(tabs)/plan/settings.tsx` — loader com cor e espaçamento fora do padrão

Trecho (linha 88):

```tsx
<ActivityIndicator color={colors.primary} accessibilityLabel="Carregando configurações" />
```

Por quê: todos os loaders do app usam `colors.primaryDeep` (`PlanLoading`,
`achievements`, `activities`); `primary` (#BCD243) sobre branco tem contraste baixo
no tema claro. Também falta o respiro vertical padrão (`spacing.huge`).

Correção:

```tsx
<ActivityIndicator color={colors.primaryDeep} accessibilityLabel="Carregando configurações" style={styles.loader} />
```

e em `styles`:

```ts
  loader: {
    paddingVertical: spacing.huge,
  },
```

### M4. `components/workout/PerceivedEffortPicker.tsx` — opção selecionável recriada à mão

Trecho (linhas 84–99 e 130–136):

```tsx
<Pressable
  key={effort}
  accessibilityRole="radio"
  accessibilityState={{ selected, disabled: busy }}
  ...
  style={[styles.option, { borderColor: selected ? colors.primary : palettes.dark.border }, selected && { backgroundColor: colors.primarySoft }]}
>
```
```ts
  option: { ..., height: workout.effortOptionHeight, borderWidth: sizes.hairline * 2, borderRadius: radius.md },
```

Por quê: o app já tem `SelectableCard` para escolha única (onboarding, paywall,
`OptionSection`). A versão manual usa `sizes.hairline * 2` (número solto), estilo
inline, raio diferente (`md` vs `lg`) e `accessibilityState.selected` em vez de
`checked` (o leitor de tela não anuncia "marcado" num radio).

Correção: substituir o `<Pressable>` inteiro por

```tsx
<SelectableCard
  key={effort}
  active={selected}
  disabled={busy}
  accessibilityLabel={perceivedEffortLabels[effort]}
  onPress={() => {
    setChoice(effort);
  }}
>
  <Text variant="body">{perceivedEffortLabels[effort]}</Text>
</SelectableCard>
```

- import: `import { SelectableCard } from '@/components/paywall/SelectableCard';`
- remover `Pressable` do import de `react-native`;
- remover o estilo `option`;
- remover `workout.effortOptionHeight` de `theme/workout.ts` (fica órfão; único uso
  era aqui).
- Em `<View style={styles.options} accessibilityRole="radiogroup">` adicionar
  `accessibilityLabel="Como você se sentiu?"`.

Obs.: o componente roda dentro de `ThemeScope scheme="dark"`, então o `Card` interno
do `SelectableCard` já pega as cores escuras.

### M5. `components/activities/HistoryHeader.tsx` — erro como `Text` vermelho em vez de `InlineError`

Trecho (linhas 64–68):

```tsx
{showError ? (
  <Text variant="caption" color={colors.danger}>
    Não foi possível carregar seus treinos.
  </Text>
) : null}
```

Por quê: o padrão de erro inline é `InlineError` (já tem `accessibilityRole="alert"`
e live region). Usado em settings, achievements, WeekStatusCard.

Correção:

```tsx
<InlineError message={showError ? 'Não foi possível carregar seus treinos.' : null} />
```

com `import { InlineError } from '@/components/InlineError';`.

### M6. Ícones de destaque com `sizes.iconXl * 2`

Trechos:
- `app/(app)/(tabs)/plan/week/[week].tsx:122` — `<Lock size={sizes.iconXl * 2} ...`
- `app/(app)/onboarding/plan-ready.tsx:32` — `<CalendarCheck size={sizes.iconXl * 2} ...`
- `app/(app)/onboarding/plan-ready.tsx:50` — `<Hourglass size={sizes.iconXl * 2} ...`

Por quê: multiplicador solto sobre token (checklist item 1).

Correção: trocar `sizes.iconXl * 2` por `sizes.iconHero` (token T1) nas três linhas.
(`components/plan/PlanStates.tsx` tem o mesmo padrão, fora da lista do PRD; vale
trocar junto para não ficar dois jeitos.)

### M7. `components/plan/OptionSection.tsx` — estilos inline

Trechos (linhas 27, 34, 45, 49):

```tsx
<View style={{ gap: spacing.sm }}>
<View accessibilityRole="radiogroup" accessibilityLabel={title} style={{ gap: spacing.sm }}>
<Text variant="bodyStrong" style={{ flexShrink: 1 }}>
<Text variant="caption" color={colors.textSecondary} style={{ flexShrink: 1 }}>
```

Por quê: todo o app declara estilo em `StyleSheet.create` (objeto inline recria a
cada render e foge do padrão).

Correção: adicionar `StyleSheet` ao import de `react-native` e no fim do arquivo:

```ts
const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  shrink: {
    flexShrink: 1,
  },
});
```

Trocar as duas `View` para `style={styles.section}` e os dois `Text` para
`style={styles.shrink}`.

---

## Baixa

### B1. Alvo mínimo de toque por `layout.headerHeight` em vez de `MIN_TOUCH_TARGET`

Trechos:
- `components/plan/DayRow.tsx:86` e `:92` — `minHeight: layout.headerHeight,`
- `app/(app)/plan-paywall.tsx:74-75` — `minWidth: layout.headerHeight, minHeight: layout.headerHeight,`
- `components/plan/SessionStatus.tsx:79` — `minHeight: layout.headerHeight,`

Por quê: o token de alvo mínimo é `MIN_TOUCH_TARGET` (`components/touch.ts`, usado em
`Button` e `welcome`). `headerHeight` é altura de cabeçalho; mesmo valor hoje, sentido
errado. O chip de `SessionStatus` nem é tocável (está dentro do `Pressable` do DayRow).

Correção:
- DayRow e plan-paywall: `import { MIN_TOUCH_TARGET } from '@/components/touch';` e
  trocar `layout.headerHeight` por `MIN_TOUCH_TARGET`. Remover `layout` do import de
  `@/theme` se ficar sem uso.
- SessionStatus: apagar a linha `minHeight: layout.headerHeight,` e tirar `layout`
  do import.

### B2. `components/plan/DayRow.tsx:43` — `hitSlop` em linhas empilhadas

Trecho: `hitSlop={sizes.hitSlop}` no `Pressable` de cada sessão.

Por quê: a linha já tem altura mínima de 44; com duas sessões no mesmo dia, o
`hitSlop` de 12 de uma invade a outra e causa toque errado.

Correção: remover a prop `hitSlop={sizes.hitSlop}`.

### B3. Paleta fixa `palettes.dark.*` dentro de telas com `ThemeScope scheme="dark"`

Por quê: checklist item 2 — cores sempre do tema ativo. Essas telas já rodam dentro
de `ThemeScope scheme="dark"`, então `colors.X` === `palettes.dark.X` (sem mudança
visual) e o arquivo deixa de misturar `colors.primary` com `palettes.dark.ink`.

Correção (trocar todas as ocorrências `palettes.dark.` por `colors.` e remover
`palettes` do import de `@/theme`):
- `app/(app)/workout/summary.tsx` (linhas 69, 72, 79, 86, 105, 112, 113, 121, 128).
- `components/workout/HeartRateNotice.tsx` (31, 43, 51, 60, 61). `HeartRateUnavailable`
  não chama `useTheme`: adicionar `const { colors } = useTheme();` no início dela.
- `components/workout/WorkoutHeading.tsx` (38, 41, 43, 49, 55, 65).
- `components/workout/PerceivedEffortPicker.tsx` (31, 41, 52, 76, 77, 98; a 94 sai no M4).
- `components/workout/BlockGuide.tsx` (72, 74, 80, 92, 95, 100, 102, 105, 106, 111, 125,
  126). As linhas 125–126 estão em `StyleSheet.create` estático: converter para
  `const makeStyles = createStyles((colors) => StyleSheet.create({...}))`, chamar
  `const styles = useThemedStyles(makeStyles);` no início de `BlockGuide` (importar
  `useThemedStyles` de `@/hooks/useTheme` e `createStyles` de `@/theme`), e usar
  `borderColor: colors.surface, backgroundColor: colors.surface`.

Não mexer: `workoutDialogs.tsx` e `welcome.tsx` (exceções justificadas no topo) e
as props `dark` de `Screen`/`StatRow`.

### B4. `strokeWidth={2}` solto (linhas pré-existentes em arquivos alterados)

- `app/(app)/workout/summary.tsx:78` — `<StatusIcon ... strokeWidth={2} />`
- `components/workout/WorkoutHeading.tsx:41` — `<ChevronDown ... strokeWidth={2} />`

Correção: `strokeWidth={sizes.iconStroke}` (em WorkoutHeading importar `sizes`).
Opcional: deixa o traço um pouco mais fino (1,75); se o designer quiser o 2, criar
`sizes.iconStrokeBold: 2` em vez de manter o número.

### B5. Tamanho de ícone de `ListRow.leading` fora do padrão

- `app/(app)/(tabs)/plan/index.tsx:89` — `<Settings size={sizes.iconTab} ...` (token
  da tab bar).
- `components/activities/HistoryHeader.tsx:57` — `<Trophy size={sizes.iconMd} ...`

Por quê: nas telas de perfil o ícone `leading` de `ListRow` usa `sizes.iconLg`.

Correção: `size={sizes.iconLg}` nas duas.

### B6. `opacity: 0` solto

Trechos: `app/(app)/(tabs)/index.tsx:113`, `components/home/PlanCard.tsx:82`,
`components/home/TodayCard.tsx:139` — `hidden: { opacity: 0 }`.

Correção: `opacity: opacity.hidden,` com `opacity` importado de `@/theme` (token T2).

### B7. Loaders sem `accessibilityLabel`

- `app/(app)/achievements.tsx:27` → adicionar `accessibilityLabel="Carregando conquistas"`.
- `app/(app)/(tabs)/activities.tsx:74` → adicionar `accessibilityLabel="Carregando atividades"`.

Por quê: `PlanLoading`, `settings` e `plan-ready` já anunciam o carregamento.

### B8. Rótulo de card com cor diferente das outras

- `components/plan/WeekStatusCard.tsx:43` — `<Text variant="captionStrong" color={colors.textSecondary}>{titleOf(status)}</Text>`
- `components/plan/AttemptHistory.tsx:18` — `<Text variant="captionStrong" color={colors.textSecondary}>Tentativas anteriores</Text>`

Por quê: rótulo de card (`captionStrong`) é `ink` em `PlanCard`, `TodayCard`,
`WeekProgressCard`, `HistoryHeader` e na tela de atividades antiga.

Correção: remover a prop `color={colors.textSecondary}` nas duas linhas.

### B9. `components/workout/BlockGuide.tsx` — padding do card por espaçamento genérico

Trecho (linha 122): `padding: spacing.lg,`

Correção: `padding: layout.cardPadding,` (importar `layout`). Mesmo valor, token
semântico do card.

### B10. `components/workout/BlockGuide.tsx:102` — número grande sem proteção de fonte grande

Trecho: `<Text variant="metric" ... style={styles.remaining}>` com
`fontSize: workout.blockTimeSize` (56).

Correção: adicionar `numberOfLines={1} adjustsFontSizeToFit` nesse `Text`.

### B11. Separadores misturados (`·` e `•`)

O app usa ` • ` (PlanCard, session/[id], TodayCard, WeekProgressCard linha 39).
Trocar ` · ` por ` • ` em:
- `components/home/WeekProgressCard.tsx:26` e `:32`
- `components/plan/WeekStatusCard.tsx:19` e `:25`
- `components/workout/BlockGuide.tsx:108`

### B12. Números em template sem `String()`

O padrão do escopo é `String(n)` dentro de template.
- `components/workout/BlockGuide.tsx:112` → `` `Bloco ${String(index + 1)} de ${String(blocks.length)}` ``
- `components/workout/HeartRateNotice.tsx:31` → `` `${String(bpm)} bpm` ``

### B13. Textos de UI

- `components/workout/HeartRateNotice.tsx:18` — `'FC indisponível'` → `'Frequência cardíaca indisponível'`
  (igual ao resumo do treino; sigla não é usada em outro lugar).
- `components/home/TodayCard.tsx:45` — `'Configure seu plano para começar'` →
  `'Configure seu plano para começar.'` (os outros `detail` terminam com ponto).
- `app/(app)/achievements.tsx:17-18` — títulos de `EmptyState` sem ponto final, como
  `PlanError` e `ActivitiesEmpty` (estado vazio): `'Nenhuma conquista disponível ainda'`
  e `'Não foi possível carregar suas conquistas'`. No erro, adicionar
  `description="Verifique sua conexão e tente novamente."` (mesmo texto de
  `ActivitiesEmpty`).
- `app/(app)/(tabs)/plan/session/[id].tsx:158` — `'Musculação ainda não tem treino guiado. Registre como concluído pelo app em breve.'`
  é confuso (soa como ordem). Sugestão: `'Musculação ainda não tem treino guiado. Em breve você poderá marcá-la como concluída.'`

### B14. `components/home/PlanCard.tsx` — leitor de tela anuncia "Nenhum plano ativo" durante o carregamento

Trecho (linha 28): `accessibilityLabel={plan ? ... : 'Nenhum plano ativo. Configurar plano'}`
enquanto o texto visível está escondido (`hidden`).

Correção: no `Pressable` adicionar `accessibilityState={{ busy: loading && plan === null }}`.
Mesma coisa em `components/home/TodayCard.tsx` (linha 97).

### B15. `app/(app)/onboarding/plan-ready.tsx` — estado de falha sem ícone

Os estados `ready` e `unavailable` têm ícone `sizes.iconHero`; `failed` não.

Correção: antes do título do bloco `failed` adicionar
`<AlertTriangle size={sizes.iconHero} color={colors.danger} strokeWidth={sizes.iconStroke} />`
(importar `AlertTriangle` de `lucide-react-native`, já usado em `summary.tsx`).

---

## Fora do escopo de estilo (só reportar, não aplicar)

- `plan-ready.tsx:37` — texto fixo "São 8 semanas ... 5 km ... As 2 primeiras já estão
  liberadas" não vem do plano gerado; se o plano mudar, o texto mente (regra "sem mock
  data"). Depende de dados do hook, é lógica.
- Home sem plano mostra `NoPlanCard` **e** `TodayCard` ("Nenhum treino agendado"), dois
  CTAs para o mesmo destino. Decisão de produto.
- `WeekProgressCard` e `WeekStatusCard` repetem a mesma formatação de semana/aderência.
- Fora da lista do PRD mas com o mesmo tipo de problema: `components/plan/NextSessionCard.tsx:100`
  (`opacity: 0.85`), `components/ListRow.tsx` (`minHeight: 56`, `gap: 2`),
  `components/Button.tsx` e `components/SocialButton.tsx` (`opacity: 0.4`; existe
  `workout.disabledOpacity` só para treino), `components/profile/NameField.tsx` (`opacity: 0`).

---

## Como verificar

Rodar na raiz do worktree (`/mnt/dados/projects/github/paceless_style`). A lista de
arquivos usa `-z`/`xargs -0` porque os caminhos têm parênteses e colchetes.

```bash
S() { git diff -z --name-only --diff-filter=AM 7a204ed..698c55c -- '*.tsx' | xargs -0 grep -nE "$1"; }

S 'iconXl \* 2'                       # M6: deve voltar vazio
S 'opacity: 0[,.]'                    # M2/B6: vazio (DayRow 0.7 e os três opacity 0)
S 'style=\{\{'                         # M7: só workout/[id].tsx:162 (inset dinâmico, permitido)
S 'hairline \* 2|effortOptionHeight'  # M4: vazio
grep -n effortOptionHeight theme/workout.ts   # M4: vazio
S 'layout\.headerHeight'              # B1: vazio
S 'palettes\.dark'                    # B3: só welcome.tsx:80 e workoutDialogs.tsx:21
S 'strokeWidth=\{[0-9]'               # B4: vazio
S 'sizes\.iconTab'                    # B5: vazio
S ' · '                               # B11: vazio
S 'color=\{colors\.primary\} accessibilityLabel="Carregando' # M3: vazio
S 'insets\.bottom \+ spacing'         # M1: vazio
S 'color=\{colors\.danger\}>'         # M5: não deve listar HistoryHeader
S 'FC indisponível'                   # B13: vazio
S '^\s*//|/\*|\bany\b'                # regra CLAUDE.md: vazio
git diff -z --name-only --diff-filter=AM 7a204ed..698c55c -- '*.tsx' | xargs -0 wc -l | awk '$1>200 && $2!="total"'  # vazio

npx tsc --noEmit
npx eslint .
```

Visual (não dá para provar por grep): A1/A2 (largura dos botões) e M1 (espaço acima da
tab bar) precisam ser conferidos no device, tema claro e escuro.

---

## Status da correção

Aplicado no branch `fix/prd-style`. Itens marcados como `[x]` foram corrigidos; os demais
ficaram fora do escopo (só reportados).

Tokens:
- [x] T1 `sizes.iconHero: 56` em `theme/sizes.ts`
- [x] T2 `theme/opacity.ts` (`opacity.hidden`) exportado em `theme/index.ts`

Alta:
- [x] A1 `plan-ready.tsx`: `cta` com `alignSelf: 'stretch'` nos três botões
- [x] A2 `EmptyState.tsx`: ação envolvida em `View` com `alignSelf: 'stretch'` e `marginTop`

Média:
- [x] M1 `plan/session/[id].tsx`: `paddingBottom: spacing.lg` fixo no footer; removidos `insets` e import
- [x] M2 `plan/DayRow.tsx`: toque com `backgroundColor: colors.track` e `radius.sm`
- [x] M3 `plan/settings.tsx`: loader com `colors.primaryDeep` e `styles.loader` (`spacing.huge`)
- [x] M4 `workout/PerceivedEffortPicker.tsx`: troca `Pressable` manual por `SelectableCard`, rótulo do radiogroup, `colors.*`; removido `workout.effortOptionHeight` de `theme/workout.ts`
- [x] M5 `activities/HistoryHeader.tsx`: erro via `InlineError`
- [x] M6 `iconXl * 2` trocado por `sizes.iconHero` em `plan/week/[week].tsx`, `onboarding/plan-ready.tsx` e `plan/PlanStates.tsx`
- [x] M7 `plan/OptionSection.tsx`: estilos movidos para `StyleSheet.create`

Baixa:
- [x] B1 `minHeight` de `DayRow`/`plan-paywall` com `MIN_TOUCH_TARGET`; `SessionStatus` sem `minHeight`
- [x] B2 `hitSlop` removido de `DayRow`
- [x] B3 `palettes.dark.*` trocado por `colors.*` em `summary.tsx`, `HeartRateNotice.tsx` (com `useTheme` em `HeartRateUnavailable`), `WorkoutHeading.tsx`, `PerceivedEffortPicker.tsx` e `BlockGuide.tsx` (que passou a usar `createStyles`/`useThemedStyles`)
- [x] B4 `strokeWidth` solto trocado por `sizes.iconStroke` em `summary.tsx` e `WorkoutHeading.tsx`
- [x] B5 `ListRow.leading` com `sizes.iconLg` em `plan/index.tsx` e `HistoryHeader.tsx`
- [x] B6 `opacity: 0` trocado por `opacity.hidden` em `(tabs)/index.tsx`, `PlanCard.tsx` e `TodayCard.tsx`
- [x] B7 `accessibilityLabel` nos loaders de `achievements.tsx` e `(tabs)/activities.tsx`
- [x] B8 `color={colors.textSecondary}` removido de `captionStrong` em `WeekStatusCard.tsx` e `AttemptHistory.tsx`
- [x] B9 `BlockGuide` com `layout.cardPadding`
- [x] B10 `numberOfLines={1} adjustsFontSizeToFit` no tempo restante do `BlockGuide`
- [x] B11 ` · ` trocado por ` • ` em `WeekProgressCard.tsx`, `WeekStatusCard.tsx` e `BlockGuide.tsx`
- [x] B12 `String()` em `BlockGuide.tsx` e `HeartRateNotice.tsx`
- [x] B13 textos: `HeartRateNotice` (`Frequência cardíaca indisponível`), `TodayCard` (ponto final), `achievements` (títulos sem ponto, descrição no erro), `session/[id].tsx` (texto de musculação)
- [x] B14 `accessibilityState={{ busy: loading && plan === null }}` em `PlanCard.tsx` e `TodayCard.tsx`
- [x] B15 `AlertTriangle` com `sizes.iconHero` no bloco `failed` de `plan-ready.tsx`

Não aplicados (fora do escopo de estilo, conforme o próprio documento): texto fixo de `plan-ready.tsx:37`,
duplicação de CTA na home sem plano, `WeekProgressCard`/`WeekStatusCard` repetindo formatação,
e os itens "Fora da lista do PRD" (`NextSessionCard`, `ListRow`, `Button`, `SocialButton`,
`NameField`, `WeekList` com `sizes.iconTab`, `ReminderTimeStepper`).

Pendente de confirmação visual no device (tema claro e escuro): A1, A2 e M1.
