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

| Token | Uso |
|---|---|
| `primary` | Verde da marca: botões, progresso, aba ativa, cronômetro |
| `primaryPressed` | Estado pressionado — derivado, **não está no mockup** |
| `primarySoft` | Círculos de ícone nas listas de atividade |
| `primaryDeep` | Verde-oliva das sombras da ilustração do plano |
| `ink` | Texto primário e fundo da tela de treino |
| `textSecondary` | Texto secundário, metadados, ícones inativos |
| `border` | Hairline de cards, inputs e divisórias |
| `track` | Trilho de progresso e círculos neutros |
| `dark.*` | Tela de treino em andamento |
| `scrim` | Sobreposição escura sobre a foto do welcome |

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
  tokens. Os planos do paywall virão do RevenueCat.
- **Login:** mesma anatomia do cadastro, sem campo de nome e sem indicador
  de passo.

## Componentes

- `AssetPlaceholder` ocupa o lugar de fotos/ilustrações ainda não fornecidas
  (lista no README, "Assets pendentes").
- `IconBadge`: círculo colorido atrás de ícone (cards e listas de treino).
- `CheckCircle`: treino concluído — vazio ou verde com check.
- `ProgressBar` e `Ring` recebem `progress` de 0 a 1.

## Build

- `babel.config.js`: o plugin `react-native-worklets/plugin` é obrigatório
  para o react-native-reanimated 4.
