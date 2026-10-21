# Design system

Contexto que antes vivia em comentários no código (removidos pela regra de
zero comentários). Os tokens moram em `theme/`.

## Origem dos valores

- Paleta e cinco estilos de texto vêm do painel DESIGN SYSTEM de
  `mockup/paceless_mockup.png`. Os demais estilos e tons foram medidos nas telas.
- O mockup usa **SF Pro**; o app usa **Inter** (mais próxima no Google Fonts).
- Raios medidos no mockup com precisão de ±1pt.
- Espaçamento em escala de 4pt.

## Cores (`theme/colors.ts`)

Duas paletas com os mesmos tokens (`palettes.light` e `palettes.dark`). Telas e componentes leem as cores pelo tema: `useTheme()` devolve `{ scheme, isDark, colors }` e `useThemedStyles(makeStyles)` memoiza estilos criados com `createStyles((colors) => StyleSheet.create({...}))`. Nunca importe cores estáticas.

| Token | Claro | Escuro | Uso |
|---|---|---|---|
| `primary` | `#BCD243` | `#BCD243` | Verde da marca: botões, progresso, aba ativa, cronômetro |
| `primaryPressed` | `#A9BE33` | `#A9BE33` | Estado pressionado, derivado, **não está no mockup** |
| `primarySoft` | `#EBF4C3` | `#2C3019` | Círculos de ícone. Escuro: primary a 16% sobre o fundo, **derivado** |
| `primaryDeep` | `#5F6F17` | `#BCD243` | Texto e ícones de destaque. Também é o preenchimento do `ProgressBar` e o sublinhado da aba ativa. No claro, contraste 5,57:1 sobre branco (o antigo `#83952A` tinha 3,33:1); no escuro vira o próprio primary (11,18:1 sobre `#111111`) |
| `onPrimary` | `#111111` | `#111111` | Texto e ícones sobre superfícies `primary`. **Token novo**: `ink` vira branco no escuro |
| `ink` | `#111111` | `#FFFFFF` | Texto primário |
| `textSecondary` | `#687280` | `#A9A9A9` | Texto secundário, metadados, ícones inativos. Escuro: branco a 64% sobre `#111111` |
| `border` | `#E5E7EB` | `#323232` | Hairline de cards, inputs e divisórias. Escuro: branco a 14% sobre `#111111` |
| `borderStrong` | `#868E9B` | `#6B6B6B` | Borda de campos e controles interativos (input, botão secundário, `CheckCircle` vazio). Contraste mínimo de 3:1 (3,30:1 sobre branco; 3,54:1 sobre `#111111`). `border` fica só para hairlines decorativas |
| `track` | `#EDEEF0` | `#2A2A2A` | Trilho de progresso e círculos neutros. Escuro **derivado** |
| `background` | `#FFFFFF` | `#111111` | Fundo das telas (no escuro, o fundo que já era da tela de treino) |
| `surface` | `#FFFFFF` | `#1F1F1F` | Cards, inputs, tab bar. Escuro: branco a 6% sobre `#111111` |
| `white` | `#FFFFFF` | `#FFFFFF` | Texto sobre foto ou scrim |
| `danger` | `#D92D20` | `#F97066` | Erros e ações destrutivas. Escuro **derivado** (mais claro para contraste) |
| `scrim` | `rgba(17,17,17,0.45)` | igual | Sobreposição escura sobre foto ou modal |

Os valores escuros de `background`, `surface`, `border` e `textSecondary` são os antigos `colors.dark.*` (translúcidos) convertidos para o equivalente opaco sobre `#111111`, necessário para tab bar e inputs. `primarySoft`, `track` e `danger` escuros não existiam e foram derivados.

## Tema

`ThemeProvider` resolve o esquema: `system` segue `useColorScheme()`; `light` e `dark` forçam e também chamam `Appearance.setColorScheme` para que componentes nativos acompanhem. `ThemeScope scheme="dark"` força o escuro numa subárvore: as telas de treino e resumo são sempre escuras, e `Dialog` com `tone="dark"` também. Sem `tone`, o diálogo segue o tema.

`app.json` usa `userInterfaceStyle: "automatic"`. O dev build inclui `expo-system-ui`, que o Android precisa para aplicar a mudança nativa.
## Raio (`theme/radius.ts`)

`md` botões, inputs, tiles de acesso rápido · `lg` cards · `xl` card hero do plano.

## Layout (`theme/spacing.ts`)

`screenPadding` margem lateral (medida no mockup) · `cardGap` entre cards ·
`cardPadding` interno do card · `controlHeight` botões e inputs ·
`progressHeight` barra de progresso.

## Sombras (`theme/shadows.ts`)

Cards são quase flat: a separação vem da hairline `border`, com sombra
discreta. `fab` **não vem do mockup** — só no botão de Atividades da tab bar.

## Fora do mockup (pedidos à parte)

- **Tab bar:** Atividades é um FAB elevado, não um item igual aos outros.
- **Musculação:** é empurrada a partir do Acesso rápido e mantém a tab bar,
  sem virar aba.
- **Onboarding e Paywall:** sem referência visual; montados a partir dos
  tokens. Os planos do paywall vêm do RevenueCat.
- **Login:** mesma anatomia do cadastro, sem campo de nome e sem indicador
  de passo.

## Componentes

- `AssetPlaceholder` ocupa o lugar de fotos/ilustrações ainda não fornecidas
  (lista no README, "Assets pendentes").
- `Dialog` / `useDialog()`: diálogo modal no lugar de `Alert.alert` (proibido por lint). `confirm({ title, message, confirmLabel, cancelLabel, destructive, icon, tone })` retorna `Promise<boolean>`; `alert({ title, message, okLabel, tone })` retorna `Promise<void>`. `tone: 'dark'` força o escuro (tela de treino); sem `tone`, segue o tema. Um por vez (fila); botão voltar do Android cancela.
- `IconBadge`: círculo colorido atrás de ícone (cards e listas de treino).
- `CheckCircle`: treino concluído — vazio ou verde com check.
- `ProgressBar` e `Ring` recebem `progress` de 0 a 1.

## Safe areas e insets

Regra: todo conteúdo ancorado em uma borda da tela usa insets.

- `Screen` aplica `top`, `bottom`, `left` e `right` por padrão. Telas dentro das abas não duplicam o padding inferior, pois a barra de abas já cobre a borda e o `SafeAreaView` só aplica o que realmente toca a borda.
- Elementos fixos embaixo (CTA, slider, tab bar) somam `insets.bottom` ao espaçamento do tema. Nunca use valor fixo.
- Bottom sheets somam `insets.bottom + spacing.xxl` no padding inferior (folga extra para cantos de tela arredondados) e `insets.left/right` nas laterais.
- `Modal` abre uma janela nova no Android: use `statusBarTranslucent` e `navigationBarTranslucent` e envolva o conteúdo em `ModalSafeArea` (um `SafeAreaProvider` interno), para que `useSafeAreaInsets` meça a janela do próprio modal.
- Cabeçalhos respeitam `insets.top`.

## Build

- `babel.config.js`: o plugin `react-native-worklets/plugin` é obrigatório
  para o react-native-reanimated 4.
