# Paceless

App de treino de corrida. React Native + Expo (expo-router), SDK 58, TypeScript.

Regras, decisões de arquitetura e convenções estão no [CLAUDE.md](./CLAUDE.md).

## Rodar

```bash
npm install
npx expo start --tunnel
```

Preencha o `.env` antes de conectar backend:

```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_REVENUECAT_API_KEY=
```

## Verificações

```bash
npx tsc --noEmit
npx eslint .
npx expo-doctor
```

## Estrutura

```
app/
  (pre-auth)/   welcome · onboarding · paywall · signup · login
  (app)/
    (tabs)/     index (Início) · plan · activities · nutrition · profile
                strength (empurrada, mantém a tab bar)
    week/       [week] — detalhe da semana, sem tab bar
    workout/    [id] — treino em andamento, tela escura
components/     componentes base do design system
theme/          tokens: cores, tipografia, espaçamento, raio, sombra
mockup/         referência visual (fonte da verdade do layout)
```

## Design system

Os tokens em `theme/` foram extraídos do painel DESIGN SYSTEM em
`mockup/paceless_mockup.png`. Os cinco hex da paleta e os cinco estilos de
texto estão declarados na própria imagem; raios, espaçamentos e os tons
derivados (verde claro, trilho de progresso, superfícies escuras) foram
medidos nas telas.

A imagem especifica **SF Pro**. O app usa **Inter**, a fonte do Google Fonts
mais próxima.

## Assets pendentes

Os componentes usam `AssetPlaceholder` no lugar destes arquivos. Todos vão em
`assets/`:

| Arquivo | Onde aparece |
|---|---|
| `plan-illustration.png` | ilustração da estrada no card do plano |
| `avatar.jpg` | avatar no Início e no Perfil |
| `strength-{a,b,c,core}.jpg` | thumbnails dos treinos de força |
| `meal-*.jpg` | fotos das refeições na Nutrição |

O mockup usa um ícone de tênis de corrida que não existe no lucide — está
substituído por `Footprints`.
