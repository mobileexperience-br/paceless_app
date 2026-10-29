# Notificações: planejamento

Decidido em 29/10/2026. A pesquisa de base está em [pesquisa/notificacoes.md](./pesquisa/notificacoes.md).

## Como funciona o lembrete local

É o jeito usual de apps de treino lembrarem do dia de treino.

1. Quando a pessoa salva o plano (ex.: seg/qua/sex às 7h), o app pede **uma vez** ao
   sistema: "mostre esta notificação toda segunda às 7h".
2. Quem guarda e dispara é o **sistema operacional**, não o app:
   - iOS: central de notificações da Apple (`UNUserNotificationCenter`);
   - Android: agendador de alarmes do sistema (`AlarmManager`).
3. Na hora marcada a notificação aparece na barra de notificações e na tela de
   bloqueio, igual a uma mensagem, **com o app fechado** e sem rodar em segundo plano.
4. Tocar na notificação abre o app (pode levar direto ao treino do dia).

`expo-notifications` é a ponte para essas APIs; é a mesma API em todos os aparelhos.

### Variação entre aparelhos

- iOS: previsível. Limite de 64 notificações agendadas ao mesmo tempo (lembretes
  semanais repetidos ficam bem abaixo disso).
- Android: funciona em todos. Fabricantes com economia de bateria agressiva
  (Xiaomi, Samsung, Motorola) podem atrasar alguns minutos, o que não atrapalha um
  lembrete de treino. Após reiniciar o aparelho, a lib reagenda sozinha.
- Não pedir alarme exato (`SCHEDULE_EXACT_ALARM`): horário aproximado basta.

## Local x push

| | Lembrete local | Push (Firebase + Supabase) |
|---|---|---|
| Quem decide a hora | o aparelho, agendado antes | o servidor, na hora |
| Precisa de internet | não | sim |
| Precisa de Firebase/Supabase | não | sim |
| Uso | "hoje é dia de treino, 7h" | "seu plano da semana ficou pronto", avisos novos |

Para o usuário as duas aparecem iguais.

## Situação em 29/10/2026

| Item | Situação |
|---|---|
| Projeto Google Cloud `paceless` (nº 336845760115) | ativo; Jhonatas é `roles/owner` (convite do Pedro) |
| Firebase no projeto | ainda não adicionado |
| `expo-notifications` | não instalado |
| Tabela `notification_settings` | existe: `training_reminders`, `reminder_time`, `training_days`, `timezone` |
| Tela Perfil > Notificações | existe, quase vazia |
| Tela Plano > Configurações do plano | pronta (dias de treino) |

## Fases

### Fase 1: lembretes locais (começar por aqui)

- Instalar `expo-notifications` (lib nova, exige build novo).
- Pedir permissão depois do onboarding, explicando o motivo; caminho para reativar
  nas configurações do sistema se a pessoa negar.
- Perfil > Notificações: ligar/desligar e horário; dias vêm de Configurações do plano.
  Salva em `notification_settings`.
- Agendar no aparelho; cancelar e reagendar quando plano, dias ou horário mudarem.
- Texto neutro e encorajador, nunca culpa ([gamificação](./pesquisa/gamificacao.md)).

### Fase 2: credenciais de push (conta do Pedro)

- Adicionar o Firebase ao projeto `paceless` e registrar o app Android `com.paceless.app`.
- `google-services.json` em `android.googleServicesFile` no `app.json`.
- Chave de conta de serviço para FCM v1 enviada ao EAS (`eas credentials -p android`
  > Push Notifications (FCM V1)). A API antiga do FCM foi desligada em 2024.
- iOS: chave APNs da conta Apple (criada pelo Pedro no portal ou gerada pelo EAS com
  o Apple ID dele).

Sugestão: fazer as fases 1 e 2 juntas para sair um build só.

### Fase 3: push remoto pelo Supabase

```
app → salva o token do aparelho (push_tokens)
Supabase (pg_cron ou gatilho) → Edge Function "push"
Edge Function → Expo Push Service → FCM (Android) / APNs (iOS) → aparelho
```

- Tabela `push_tokens` (`user_id`, `expo_token`, `platform`, `device_id`,
  `updated_at`, único por token) com RLS.
- Edge Function `push` com `EXPO_ACCESS_TOKEN` como secret; a chave nunca vai no app.
- Disparos com `pg_cron`. Primeiro caso: "seu plano da semana está pronto" (depende
  da geração do plano).

As demais notificações (conquistas, desafios etc.) entram depois, sobre essa base.

## Fontes

- [Supabase: Sending Push Notifications](https://supabase.com/docs/guides/functions/examples/push-notifications)
- [Expo: migrando para FCM v1](https://expo.dev/blog/expo-push-notifications-migrating-to-fcm-v1)
- [Expo: configuração de push](https://docs.expo.dev/push-notifications/push-notifications-setup.md)
- [Expo: envio de notificações](https://docs.expo.dev/push-notifications/sending-notifications.md)
