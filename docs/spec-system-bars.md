# Spec: barras do sistema (status bar + barra de navegação)

Base: [pesquisa/barra-navegacao-android.md](./pesquisa/barra-navegacao-android.md) e
[pesquisa/barra-navegacao-riscos.md](./pesquisa/barra-navegacao-riscos.md).
Worktree: `paceless_navbar`, branch `feat/system-bars`.

## Objetivo

Hoje, na navegação por 3 botões, o Android pinta a barra inferior de cinza-claro (scrim de
contraste). Depois desta mudança:

- a barra de 3 botões fica transparente e mostra a cor da própria tela;
- os ícones da barra (e da status bar) ficam claros em tela escura e escuros em tela clara,
  seguindo o tema efetivo do app (preferência do usuário, não só o tema do sistema);
- nenhum controle tocável fica atrás dos botões ou da pílula;
- no iOS só a status bar é controlada (o `NavigationBar` é `null` lá).

## Fora do escopo

- Nenhuma outra lib além de `expo-navigation-bar` (aprovada). Sem `expo-linear-gradient`, sem
  `react-native-edge-to-edge`.
- Não detectar modo gestos. Não usar `hidden`. Não usar APIs depreciadas
  (`setVisibilityAsync`, `getVisibilityAsync`, `useVisibility`, `addVisibilityListener`,
  `setBackgroundColorAsync`, `setButtonStyleAsync`, `NavigationBar.setStyle` imperativo).
- Não mexer no layout visual das telas (welcome, treino etc.) além do que está listado aqui.
- Não rodar build EAS, servidor ou `adb`. Não fazer push.

## Passo 1 — Dependência e plugin

1. No worktree: `npx expo install expo-navigation-bar`. Esperado `~58.0.4` em `package.json`.
   Se a versão resolvida não for `58.x`, parar e reportar.
2. Em `app.json`, dentro de `expo.plugins`, adicionar logo depois de `"expo-font"`:

   ```json
   ["expo-navigation-bar", { "enforceContrast": false }]
   ```

   Só essa opção. Não usar `style`, `hidden`, `barStyle`, `visibility`, `backgroundColor`.
3. Não criar nem editar a pasta `android/` (é gerada pelo prebuild e ignorada pelo git).

Consequência registrada: muda o fingerprint, precisa de build nativo novo. OTA não leva isso.

## Passo 2 — Componente `components/SystemBars.tsx`

Arquivo novo, sem comentários (regra do projeto), menos de 60 linhas. Conteúdo exigido:

```tsx
import type { ReactElement } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationBar } from 'expo-navigation-bar';
import { useIsFocused } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import type { ColorScheme } from '@/theme';

interface SystemBarsProps {
  scheme?: ColorScheme;
}

export function SystemBars({ scheme }: SystemBarsProps): ReactElement {
  const theme = useTheme();
  const effective = scheme ?? theme.scheme;
  const iconStyle = effective === 'dark' ? 'light' : 'dark';
  return (
    <>
      <StatusBar style={iconStyle} />
      <NavigationBar style={iconStyle} />
    </>
  );
}

export function FocusedSystemBars({ scheme }: SystemBarsProps): ReactElement | null {
  const focused = useIsFocused();
  return focused ? <SystemBars scheme={scheme} /> : null;
}
```

Notas para quem implementa:

- Conferir de onde `ColorScheme` é exportado (`providers/ThemeProvider.tsx` importa de algum
  lugar de `@/theme`); usar o mesmo import. Se o nome exportado de `expo-navigation-bar` não for
  `NavigationBar`, olhar `node_modules/expo-navigation-bar/build/index.d.ts` e usar o export do
  componente que aceita `style`.
- `style` é sempre `'light'` ou `'dark'` explícito. Nunca `'auto'` nem `'inverted'` (eles leem o
  tema do sistema, não a preferência do app).
- `'light'` = ícones claros (fundo escuro). `'dark'` = ícones escuros (fundo claro). Vale igual
  para `StatusBar` e `NavigationBar`.
- Sem `Platform.OS`: no iOS e no web o `NavigationBar` renderiza `null` sozinho.
- `FocusedSystemBars` só pode ser usado dentro de uma tela do expo-router (o hook exige
  navegador). `SystemBars` pode ser usado em qualquer lugar.
- Exportar os dois em `components/index.ts` se o arquivo de barrel existir e exportar os demais
  componentes; seguir o padrão do arquivo.

Por que o foco: no expo-router as telas de baixo continuam montadas, e a pilha do
`StatusBar`/`NavigationBar` vale pelo último montado, não pela tela visível. Sem foco, voltar do
treino escuro para uma aba clara deixaria ícones claros sobre fundo claro.

## Passo 3 — Onde montar (substituir todos os `StatusBar` atuais)

| Arquivo | Hoje | Depois |
| --- | --- | --- |
| `components/ThemedStack.tsx` | `<StatusBar style={isDark ? 'light' : 'dark'} />` | `<SystemBars />`. Remover o import de `expo-status-bar` e o `isDark` se ficar sem uso. |
| `app/(pre-auth)/welcome.tsx` | `<StatusBar style="light" />` | `<FocusedSystemBars scheme="dark" />` |
| `app/(app)/workout/[id].tsx` | `<StatusBar style="light" />` | `<FocusedSystemBars scheme="dark" />` |
| `app/(app)/workout/summary.tsx` | `<StatusBar style="light" />` | `<FocusedSystemBars scheme="dark" />` |

Regras:

- Ao fim, `grep -rn "expo-status-bar\|expo-navigation-bar" app components hooks` só pode achar
  `components/SystemBars.tsx`.
- `ThemedStack` monta o `SystemBars` cedo de propósito: com `enforceContrast: false` o RN não
  define a cor inicial dos ícones da barra de navegação, então quem define é o primeiro
  `NavigationBar` montado.
- Abas, onboarding, plan-paywall, login, signup, settings e demais telas: não recebem nada. Elas
  usam o tema efetivo, que já é o do `ThemedStack`.
- Não remover o `useWindowBackground` do `ThemedStack`.

## Passo 4 — Modais e overlays

| Componente | Mudança |
| --- | --- |
| `components/dialog/Dialog.tsx` | Nenhuma. Já tem `navigationBarTranslucent` e usa `insets.bottom`. O cartão fica no centro; atrás da barra fica o fundo escurecido da tela de baixo, e a janela do modal herda o estilo ativo (o `expo-navigation-bar` 57+ copia o estilo para janelas de `Modal`). Não montar `SystemBars` dentro dele. |
| `components/workout/WorkoutMenu.tsx` | Nenhuma. Só abre no treino (escuro), já tem `navigationBarTranslucent` e soma `insets.bottom`. |
| `components/workout/SavingOverlay.tsx` | Adicionar a prop `navigationBarTranslucent` ao `<Modal>`, logo após `statusBarTranslucent`. Nada mais. |
| `components/SignInOverlay.tsx` | Idem: adicionar `navigationBarTranslucent`. |

Motivo dos overlays: sem a prop, a janela do overlay termina acima da barra e a faixa da barra
fica com o fundo da tela de baixo, sem o escurecimento do overlay. Com a prop, o overlay cobre a
tela inteira. O conteúdo deles é centralizado, então nada fica atrás dos botões.

Se o teste no aparelho mostrar ícones errados num `Dialog` com `tone` diferente do tema, a correção
será montar `SystemBars scheme={effectiveScheme}` dentro do `ThemeScope` do `Dialog`. Não fazer
agora.

## Passo 5 — Safe area (nada atrás dos botões)

Estado lido no código; só conferir, sem mudar estrutura:

- `app/(app)/(tabs)/_layout.tsx`: a barra de abas soma `insets.bottom` (com mínimo `spacing.sm`)
  na altura e no `paddingBottom`, fundo `colors.surface`. Manter.
- `components/Screen.tsx`: `SafeAreaView` com os quatro lados por padrão e fundo pintado. Toda
  tela que passa `edges` sem `'bottom'` tem de reservar `insets.bottom` à mão no último elemento
  tocável. Verificar com `grep -rn "edges=" app components` e listar no relatório cada uso sem
  `'bottom'` e como o inset é tratado. Se algum não tratar e tiver controle no fim da tela,
  corrigir somando `insets.bottom` (via `useSafeAreaInsets`) no padding inferior desse controle.
- `workout/[id].tsx`: `edges={['top','left','right']}` e `paddingBottom: insets.bottom +
  workout.sliderBottomGap` no `SlideToFinish`. Manter. O fundo da raiz é escuro sólido até a borda.
- `welcome.tsx`: `SafeAreaView` com `bottom`; a foto e o `scrim` (cor `colors.scrim`, uniforme)
  passam atrás da barra. Não mexer no layout. A legibilidade da pílula em gestos depende da
  amostragem do sistema sobre essa área; avaliar no aparelho (roteiro abaixo).
- `Dialog` e `WorkoutMenu`: já somam `insets` dentro de `ModalSafeArea`. Manter.

## Passo 6 — Verificação por código (critérios de aceite)

Todos têm de passar antes de devolver:

1. `package.json` tem `"expo-navigation-bar": "~58.0.x"`; nenhuma outra dependência nova.
2. `app.json` tem exatamente `["expo-navigation-bar", { "enforceContrast": false }]` em `plugins`.
3. `components/SystemBars.tsx` existe, sem comentários, com `style` só `'light' | 'dark'`.
4. `grep -rn "expo-status-bar\|expo-navigation-bar" app components hooks` encontra só
   `components/SystemBars.tsx`.
5. `grep -rn "'auto'\|\"auto\"\|inverted\|hidden" components/SystemBars.tsx` não encontra nada.
6. `grep -rn "FocusedSystemBars" app` encontra exatamente `welcome.tsx`, `workout/[id].tsx` e
   `workout/summary.tsx`, todos com `scheme="dark"`.
7. `SavingOverlay` e `SignInOverlay` têm `navigationBarTranslucent`.
8. Nenhum arquivo tocado passa de 200 linhas por causa desta mudança.
9. `npx tsc --noEmit` sem erros e `npx eslint .` sem erros nem warnings novos.
10. `npx expo config --type public` (ou `npx expo config --json`) roda sem erro e mostra o plugin.

Commit sugerido: `feat(android): transparent navigation bar with themed SystemBars`.

## Status (2026-11-02)

Implementado no commit `ac4ebb8` (branch `feat/system-bars`, sem push). Passos 1 a 5 feitos:

- `expo-navigation-bar ~58.0.4` instalado; plugin com `enforceContrast: false` no `app.json`.
- `components/SystemBars.tsx` (`SystemBars` e `FocusedSystemBars`), exportado no barrel.
- `ThemedStack` usa `SystemBars`; `welcome`, `workout/[id]` e `workout/summary` usam
  `FocusedSystemBars scheme="dark"`. Nenhum outro import de `expo-status-bar`.
- `SavingOverlay` e `SignInOverlay` com `navigationBarTranslucent`.
- Passo 5: `plan/session/[id].tsx` usava `edges` sem `bottom` e o rodapé com o botão ficava
  atrás da barra; agora soma `insets.bottom` no `paddingBottom` do rodapé.

Verificado por código: `tsc --noEmit` ok, `eslint .` ok, `npm test` 60/60.

Pendente: build nativo novo (muda o fingerprint; OTA não leva) e o roteiro abaixo no aparelho.
Só o aparelho confirma: transparência real da barra de 3 botões, cor da pílula em gestos (One UI
sem fonte), ausência de piscar cinza na abertura, troca de estilo ao voltar de tela escura,
`Dialog`/`WorkoutMenu` herdando o estilo, e o iPhone (status bar e home indicator).

## Roteiro de teste no aparelho (depois do build nativo)

Não executar agora. Aparelho principal: Galaxy A12 (Android 13). Se houver, um Android 14/16 real
(o emulador do Android 15 tem bug no `setStyle`) e um iPhone.

Preparar: anotar na tabela, para cada linha, "barra transparente?", "ícones legíveis?",
"algo tocável atrás da barra?". Repetir a tabela inteira em quatro combinações:

| | 3 botões | Gestos (Configurações > Tela > Barra de navegação > Gestos de deslizar) |
| --- | --- | --- |
| Tema claro (Configurações do app) | A | B |
| Tema escuro | C | D |

Mais uma rodada rápida com tema "Sistema" alternando o modo escuro do Android.

Telas e fluxos:

1. Abertura (splash para a primeira tela): sem piscar cinza na barra.
2. `welcome`: foto aparece atrás da barra; ícones claros; botões e "Entrar" acima dos botões do
   sistema. Em gestos, anotar a cor da pílula sobre a foto.
3. `welcome` > login social com `SignInOverlay`: overlay cobre também a faixa da barra.
4. `welcome` > Começar > signup > voltar: ao voltar ao welcome os ícones voltam a claros; na
   signup seguem o tema.
5. Login e onboarding: ícones seguem o tema; botão inferior acima da barra.
6. Abas (cada aba): barra de abas inteira acima dos botões do sistema; fundo atrás da barra igual
   ao da barra de abas; ícones seguem o tema.
7. `plan-paywall` (modal de pilha): botão de assinar acima da barra.
8. Iniciar treino (`workout/[id]`): ícones claros em qualquer tema; `SlideToFinish` acima da barra;
   abrir `WorkoutMenu`; abrir `Dialog` de descartar/parar; voltar para a aba e conferir que os
   ícones voltam ao tema (crítico no tema claro).
9. Finalizar treino: `SavingOverlay` cobre a faixa da barra; `workout/summary` com ícones claros;
   sair do resumo e conferir volta ao tema.
10. Configurações > trocar tema com o app aberto: barra acompanha na hora.
11. `Dialog` de qualquer tela clara (ex.: sair da conta): ícones legíveis sobre o fundo escurecido.
12. Gestos: anotar se a pílula do Samsung segue o `style` ou só a cor do conteúdo (ponto sem
    fonte na pesquisa).
13. iPhone: status bar correta em welcome, abas, treino, resumo; nada atrás do home indicator.

Aceite no aparelho: barra transparente em todas as telas nos 3 botões; ícones legíveis em A, B, C
e D; nenhum controle atrás da barra; nenhum caso de ícone claro sobre fundo claro (ou o inverso)
depois de voltar de uma tela escura. Falhas da pílula em gestos que só dependam da amostragem do
sistema são registradas, não bloqueiam.

## Riscos aceitos

- Pílula em gestos é decidida pelo sistema (amostragem de luminância); o `style` é só dica.
- Comportamento do One UI em gestos não tem fonte; só o teste diz.
- Android 8 e 9 (minSdk 26): o módulo simula a transparência; testar se houver aparelho.
