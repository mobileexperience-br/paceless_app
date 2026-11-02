# Analytics

Fonte: PRD v1, seção 9. Implementação da fase 5 (`docs/spec-fase5.md`).

## Eventos

| Evento | Quando dispara | Arquivo | Propriedades |
|---|---|---|---|
| `signup_completed` | Conta criada por e-mail, ou conta social criada agora (não no login de conta existente) | `app/(pre-auth)/signup.tsx`, `lib/analytics.ts` (`reportSocialSignup`) | `method`, `app_version` |
| `onboarding_completed` | Onboarding concluído e perfil marcado como completo | `hooks/useCompleteOnboarding.ts` | `goal`, `level`, `days_count` |
| `plan_created` | Plano gerado pela Edge Function (resposta `generated`, não `unchanged`) | `hooks/useGeneratePlan.ts` | `template_version`, `duration_weeks` |
| `workout_started` | Treino iniciado (não dispara ao retomar após crash) | `hooks/useWorkoutAnalytics.ts` | `session_id`, `workout_type` |
| `workout_paused` | Treino pausado pelo usuário (não dispara ao finalizar) | `hooks/useWorkoutAnalytics.ts` | `session_id`, `elapsed_seconds` |
| `workout_completed` | Treino salvo ou guardado na fila offline | `hooks/useFinishWorkout.ts` | `session_id`, `duration`, `distance`, `source` |
| `workout_interrupted` | Treino com menos de 10 s (`too_short`) ou descartado (`discarded`) | `hooks/useFinishWorkout.ts`, `app/(app)/workout/[id].tsx` | `session_id`, `reason_optional` |
| `weekly_goal_completed` | Todas as sessões elegíveis da semana concluídas | `hooks/usePlanWeekStatus.ts` | `plan_id`, `week_index` |
| `achievement_awarded` | Conquista concedida (`earnedAt` preenchido) | `hooks/useAchievements.ts` | `achievement_code`, `criteria_version` |

`session_id` vem de `analyticsSessionId` (`lib/analyticsRules.ts`): id da sessão do plano; em treino livre, o id da atividade gerado no cliente (DP-40).

`template_version` é `v` + `generatorVersion` devolvido pela Edge Function. Até o deploy da função, vai `unknown` (DP-39).

## Privacidade (DP-38)

Só as propriedades da lista permitida em `lib/analyticsPayload.ts` saem do objeto. Textos são cortados em 64 caracteres e números são arredondados.

Nunca são enviados: e-mail, nome, id de usuário, coordenadas, frequência cardíaca, sensação (esforço percebido), rota ou pace.

## Como funciona hoje

- `track` valida o payload e, só em `__DEV__`, escreve no console uma linha `[analytics] <nome> {payload}`.
- Em build de produção nada é logado nem enviado.
- Nenhum dado sai do aparelho (DP-37), por isso não há tela de consentimento (DP-44).

## Deduplicação

`weekly_goal_completed` e `achievement_awarded` usam `trackOnce`, que grava a chave em `paceless:analytics-sent` (AsyncStorage) antes de rastrear:

- meta semanal: chave `weekly_goal_completed:<plano>:<semana>:<tentativa>`, então repetir a semana gera novo evento;
- conquista: chave `achievement_awarded:<código>`.

A lista guarda até 200 chaves, por instalação (DP-45).

## Como plugar um provedor real

Pendente de aprovação de lib e de base legal LGPD (DP-37 e DP-44). Quando aprovado, troque o corpo de `track` em `lib/analytics.ts` e mantenha `buildAnalyticsPayload` como única porta de saída dos dados.
