# Notificações

Pesquisa feita em 19/10/2026. Itens sem fonte confirmada estão como **a verificar**.

## O que os concorrentes fazem

A pesquisa não confirmou o catálogo de notificações de cada app. Tratar como **a verificar**.

| App | Padrão observável |
|---|---|
| Runna | Lembrete do treino do dia (a verificar) |
| Nike Run Club | Lembretes e desafios de comunidade ([Nike](https://www.nike.com/a/running-goals)); detalhes: a verificar |
| Garmin Coach | O treino aparece no relógio (a verificar o aviso) |
| Strava | Notificações sociais (a verificar) |

Inferência para o Paceless: como o produto evita exposição, **notificação social fica de fora**; só lembrete do próprio treino.

## Opções

| Tipo | Como | Precisa de servidor? |
|---|---|---|
| **Lembrete local** | `expo-notifications` agenda no aparelho, a partir dos dias/hora do plano | Não |
| **Push remoto** | Edge Function chama o [Expo Push Service](https://docs.expo.dev/push-notifications/overview/) com o token do aparelho | Sim |

### Local (MVP)

- `scheduleNotificationAsync` com gatilho de data ou intervalo. Para repetição semanal por dia da semana, a forma correta na API do SDK 58 é **a verificar** (um relato de fórum usa intervalo de 604800 s com `repeats`).
- Android 12+: alarme exato exige `SCHEDULE_EXACT_ALARM`/`USE_EXACT_ALARM`, e desde o Android 14 não vem concedido por padrão ([Android](https://developer.android.com/about/versions/14/changes/schedule-exact-alarms)). Para lembrete de treino, horário aproximado basta: **não pedir alarme exato**.
- Android 13+: permissão de notificação em tempo de execução. Pedir depois do onboarding, explicando o motivo.
- Ao replanejar (plano novo) cancelar e reagendar tudo.

### Push remoto (depois)

- Guia oficial: [Supabase: Sending Push Notifications](https://supabase.com/docs/guides/functions/examples/push-notifications). Usa um Expo Access Token guardado como secret da Edge Function.
- Casos de uso: "seu plano da semana está pronto" (domingo à noite, ligado ao plano adaptativo).
- Agendamento no servidor: `pg_cron` + Edge Function (limites do plano Supabase: a verificar).
- Respeita a decisão de arquitetura: o token de acesso da Expo só vive na Edge Function.

## O que é preciso nas lojas/EAS

| Item | Android | iOS |
|---|---|---|
| Credencial de push | Projeto Firebase, `google-services.json` em `android.googleServicesFile`, chave de conta de serviço (FCM v1) enviada ao EAS ([Expo](https://expo.dev/blog/expo-adds-support-for-fcm-http-v1-api)) | Chave APNs (o EAS pode gerar na conta Apple Developer) |
| Build | Novo build de desenvolvimento com `expo-notifications` | Idem; capability Push Notifications |
| Expo Go | Push remoto: usar dev build (já temos `expo-dev-client`); suporte no Expo Go: a verificar | Idem |

Lembrete **local** dispensa Firebase e APNs.

## Achado do código

O onboarding hoje guarda só **quantos dias** por semana (`daysPerWeek`: 2, 3, 4, 5+ em `lib/onboardingSteps.ts`), não **quais**. O [produto.md](../produto.md) fala em agenda tipo "2 dias/semana: quarta e sábado", mas esse dado ainda não existe. Lembrete por dia exige escolher os dias (ou o plano gerado defini-los) e um horário.

## Escopo recomendado para o MVP

1. Permissão pedida ao fim do onboarding, com texto claro.
2. Lembrete local nos dias de treino do plano, no horário escolhido.
3. Perfil > Notificações (já existe no mockup): ligar/desligar e escolher horário.
4. Texto neutro e encorajador, nunca culpa (ver [gamificacao.md](./gamificacao.md)).
5. Push remoto só quando o plano adaptativo existir.

## Modelo de dados

| Tabela | Colunas |
|---|---|
| `notification_settings` | `user_id`, `reminders_enabled`, `reminder_time`, `weekdays` (lista), `timezone` |
| `push_tokens` (fase push) | `user_id`, `expo_token`, `platform`, `device_id`, `updated_at`; único por token |

Lembrete local não precisa de tabela, mas guardar a preferência no banco permite restaurar em outro aparelho.

## Esforço

- Lembretes locais: **M** (agendar, cancelar/reagendar, permissão, tela).
- Push remoto + Edge Function + tokens + credenciais: **M**.

## Riscos

- Usuário nega a permissão: precisa de caminho para reativar nas configurações do sistema.
- Fuso horário e horário de verão ao reagendar.
- Android que mata processos em segundo plano (impacto em lembretes locais: a verificar).
- Notificação demais aumenta a sensação de cobrança.

## Perguntas para o Pedro

1. O usuário escolhe os dias exatos? Em que tela?
2. Qual horário padrão? Lembrar também na véspera?
3. Treino perdido: silêncio ou uma mensagem acolhedora uma única vez?
4. O push "plano da semana pronto" entra junto do plano adaptativo?
