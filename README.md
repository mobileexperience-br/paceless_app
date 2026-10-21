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
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=
EXPO_PUBLIC_REVENUECAT_IOS_KEY=
```

O `.env.example` lista também as variáveis de Termos, Privacidade, suporte,
FAQ, exclusão de conta e Google Sign-In.

## Verificações

```bash
npx tsc --noEmit
npx eslint . --max-warnings 0
npx expo-doctor
```

## Estrutura

```
app/
  (pre-auth)/   welcome · onboarding · paywall · signup · login · verify-email
  (app)/
    (tabs)/     index (Início) · plan · activities · nutrition · profile
                strength (empurrada, mantém a tab bar)
                plan/week/[week] — detalhe da semana, dentro da aba Plano
                profile/ — conta, preferências, notificações, dispositivos,
                           ajuda, FAQ, Termos e Privacidade
    workout/    [id] (treino em andamento, tela escura) · summary
  legal/        Termos e Privacidade abertos antes do login
components/     componentes base do design system e por área
content/        textos de Termos, Privacidade e FAQ
hooks/          acesso a dados e estado das telas
lib/            Supabase, RevenueCat, GPS, fila offline, unidades
providers/      sessão, tema, preferências, diálogos
supabase/       migrations e Edge Functions
theme/          tokens: cores (claro e escuro), tipografia, espaçamento, raio, sombra
types/          tipos do banco, onboarding e preferências
mockup/         referência visual (fonte da verdade do layout)
docs/           planejamento, decisões e requisitos das lojas
```

## Design system

Os tokens em `theme/` foram extraídos do painel DESIGN SYSTEM em
`mockup/paceless_mockup.png`. Os cinco hex da paleta e os cinco estilos de
texto estão declarados na própria imagem; raios, espaçamentos e os tons
derivados (verde claro, trilho de progresso, superfícies escuras) foram
medidos nas telas.

A imagem especifica **SF Pro**. O app usa **Inter**, a fonte do Google Fonts
mais próxima. O tema escuro foi derivado da paleta e está em
[docs/design-system.md](./docs/design-system.md).

## Assets pendentes

Os componentes usam `AssetPlaceholder` no lugar destes arquivos. Todos vão em
`assets/`:

| Arquivo | Onde aparece |
|---|---|
| `plan-illustration.png` | ilustração da estrada no card do plano |
| `strength-{a,b,c,core}.jpg` | thumbnails dos treinos de força (tela ainda vazia) |
| `meal-*.jpg` | fotos das refeições na Nutrição (tela ainda vazia) |

O avatar vem da foto enviada pelo usuário (Supabase Storage); sem foto, a
tela mostra o placeholder.

O mockup usa um ícone de tênis de corrida que não existe no lucide — está
substituído por `Footprints`.

## Documentação

Planejamento, estado atual, roadmap e decisões ficam em [docs/](./docs/README.md).
