# Sprint 02 — funcionalidades restantes (exceto plano com IA)

Plano de corrida gerado por IA fica para outra implementação.

**Status (21/10/2026):** F, K, J, L, P e R entraram na `main`, junto com dias de treino, retomada do treino e revisão de usabilidade. P (assinatura) depende
do webhook, que está escrito mas não publicado.
Cada trilha roda num worktree com um agente Sonnet; o agente principal revisa e integra.

| Trilha | Escopo | Libs novas |
|---|---|---|
| F — Login social | Google e Apple nativos via `signInWithIdToken` do Supabase | `@react-native-google-signin/google-signin`, `expo-apple-authentication` |
| K — Auth polish | `SessionProvider` único, tela "verifique seu e-mail", aviso de Termos no cadastro | — |
| J — Perfil no banco | Tabela `profiles` + RLS, migra respostas do onboarding após o cadastro, "Olá, {nome}" | — |
| L — Corrida com GPS | Distância, ritmo, salvar atividade (tabela `activities` + RLS), histórico em Atividades | `expo-location` |
| P — Assinatura | RevenueCat: ofertas reais no paywall, compra, restaurar, status premium | `react-native-purchases` |
| R — Pesquisa | Propostas para relógios, notificações, compartilhar corrida, gamificação e musculação | — |

Migrations ficam em `supabase/migrations/` (todas já aplicadas no projeto remoto em 21/10/2026).
Libs nativas novas exigem gerar um novo APK de desenvolvimento.
