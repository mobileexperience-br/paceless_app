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
| `expo-notifications` | instalado (58.1.7), plugin configurado no `app.json` |
| Firebase / `google-services.json` | configurado no `app.json` (`android.googleServicesFile`) |
| Tabela `notification_settings` | existe: `training_reminders`, `reminder_time`, `training_days`, `timezone` |
| Tela Perfil > Notificações | existe, quase vazia |
| Tela Plano > Configurações do plano | pronta (dias de treino) |
| Tabela `push_tokens` | migration escrita (`20261029120000_push_tokens.sql`), **não aplicada** |
| Edge Function `push` | código escrito, **não publicada** |

## Fase 1: implementado

Lembretes locais nos dias de treino. Agendados no aparelho, funcionam com o app fechado.
Requer um **novo build de desenvolvimento** (módulo nativo e plugin novos).

### Arquivos

- `app.json`: plugin `expo-notifications` (ícone monocromático, cor `#BCD243`) e
  `android.googleServicesFile`. Sem `SCHEDULE_EXACT_ALARM`: horário aproximado basta.
- `types/notifications.ts`: tipos de configuração, horário, plano e permissão.
- `lib/platform/reminders.ts` (aparelho) e `lib/platform/reminders.web.ts` (web, sem-op):
  handler, canal Android `training-reminders` ("Lembretes de treino"), permissão,
  agendamento, cancelamento e toque na notificação (abre `/plan`).
- `lib/reminderCopy.ts`: textos rotativos por dia, sem culpa.
- `lib/reminderTime.ts`: horário `HH:MM`, passos de hora e de 15 minutos, dias ISO e fuso.
- `lib/notificationSettings.ts`: leitura e gravação em `notification_settings`, e
  `syncReminders` (reagenda a partir do banco e dos dias do plano).
- `hooks/useReminderSync.ts`: sincroniza ao abrir o app e ao logar; cancela ao sair.
- `hooks/useNotificationSettings.ts`: estado da tela (ligar, horário, permissão).
- `components/notifications/`: seletor de horário e aviso de permissão negada.
- `app/(app)/(tabs)/profile/notifications.tsx`: tela Perfil > Notificações.

### Dias da semana

- No app, dias de treino são ISO: 1 = segunda ... 7 = domingo (`lib/trainingDayCombos.ts`).
- O `expo-notifications` usa 1 = domingo ... 7 = sábado. Conversão: `(isoDia % 7) + 1`.
- Fonte única dos dias: `profiles.training_days`. `notification_settings.training_days`
  recebe uma cópia a cada gravação.

### Quando agenda

- Abrir o app ou logar: `useReminderSync` (layout `(app)`).
- Salvar o plano: `usePlanSettings.save`. Na primeira vez (sem linha em
  `notification_settings`) pede a permissão uma vez e cria a linha com lembretes desligados.
- Ligar ou desligar o lembrete na tela: ligar pede a permissão se ainda não foi concedida.
- Mudar o horário: espera 600 ms sem novo toque e então salva e reagenda.
- Sair da conta ou excluir a conta: cancela tudo.
- Voltar ao app: reconsulta a permissão (pega mudanças nas configurações do aparelho).

Cada agendamento começa com cancelar todas as notificações agendadas. As operações
passam por uma fila sequencial (`serialize`), para duas sincronizações simultâneas
não duplicarem lembretes.

### Limitações

- Permissão negada no aparelho: a tela mostra o aviso e o botão "Abrir configurações".
  `training_reminders` continua como está no banco; nada é agendado enquanto a permissão faltar.
- Sem dias no plano: pode ligar, mas nada é agendado (a tela mostra "Nenhum dia definido").
- Web: o adaptador não importa `expo-notifications`; a tela mostra o estado vazio
  "Os lembretes de treino funcionam no app para celular.".
- Horário escolhido em passos de 15 minutos (sem seletor nativo de hora, para não
  adicionar biblioteca).

## Fase 3: implementado (código, não publicado)

Push remoto pelo Supabase. O código está pronto no repositório. Nada foi aplicado ao
banco remoto, nada foi publicado e não há build novo. Para push de verdade, faltam as
credenciais da Fase 2 e um build de desenvolvimento novo.

### Arquivos

- `supabase/migrations/20261029120000_push_tokens.sql`: tabela `push_tokens` (`user_id`,
  `expo_token` único, `platform`, `device_id`, datas), índice por `user_id`, trigger de
  `updated_at` e RLS. Cada pessoa só lê e altera as próprias linhas.
  - Grants: o cliente insere, lê e apaga; atualiza só `expo_token`, `platform`, `device_id` e `updated_at` (nunca `user_id`). O `user_id` vem do default `auth.uid()`.
    Não dá para trocar o `user_id` de um token pelo app.
- `types/notifications.ts`: tipo `PushPlatform`.
- `lib/platform/pushToken.ts` (aparelho) e `lib/platform/pushToken.web.ts` (web, devolve
  `null`): `getExpoPushToken` (só com permissão concedida) e `pushPlatform`.
- `lib/platform/reminders.ts`: canal Android `general` ("Avisos"), além de `training-reminders`.
- `lib/pushTokens.ts`: `registerPushToken` (upsert por `expo_token`) e `unregisterPushToken` (apaga).
- `hooks/usePushTokenSync.ts`: registra ao logar e ao voltar ao app. Montado no layout `(app)`.
- `hooks/useNotificationSettings.ts` e `hooks/usePlanSettings.ts`: registram logo depois que a
  permissão é concedida.
- `providers/SessionProvider.tsx`: remove o token antes do `signOut`.
- `supabase/functions/push/`: Edge Function de envio (ver [edge-functions.md](./edge-functions.md)).

### Fluxo do token

1. Login: `usePushTokenSync` chama `registerPushToken`. Com permissão concedida, pega o
   token Expo e faz upsert em `push_tokens` com `device_id` nulo.
2. Permissão concedida depois (ao ligar o lembrete ou ao salvar o plano): registra na hora.
   Ao voltar ao app, registra de novo. Assim pega permissões dadas nas configurações do aparelho.
3. Mesmo token e mesma pessoa: o upsert só atualiza `updated_at`.
4. Mesmo token, outra pessoa (sair falhou sem internet e outra conta entrou no aparelho): o upsert
   falha por RLS, porque a cláusula USING da linha existente não bate com `auth.uid()`. O app ignora
   o erro. A linha continua com o dono anterior até ele sair de novo ou até o Expo responder
   `DeviceNotRegistered`.
5. Sair da conta: `unregisterPushToken` apaga a linha **antes** de `supabase.auth.signOut()`,
   com a sessão ainda válida (a RLS só deixa apagar a própria linha).
6. Excluir a conta: não precisa de código. O `on delete cascade` a partir de `auth.users`
   apaga as linhas.

Nenhum prompt novo de permissão. Só os caminhos da Fase 1 (salvar o plano e ligar o lembrete)
pedem permissão. Se a pessoa negar, nenhum token é gravado.

### Canal `general`

Android: canal "Avisos" ("Novidades do seu plano e da sua conta"). Os pushes do servidor saem com
`channelId: 'general'`. Os lembretes continuam no canal `training-reminders`.

Ao tocar em um push com `data.url` (ex.: `/plan`), o app abre a rota pelo mesmo
`useReminderTapRedirect` dos lembretes.

### Limitações

- Web: os adaptadores devolvem `null` e nada é gravado.
- Permissão negada ou não decidida: não há token nem linha. Quando a permissão for concedida, o
  próximo retorno ao app registra.
- Emulador sem Google Play ou sem credenciais FCM: `getExpoPushTokenAsync` falha, o erro é
  ignorado e nenhum token é gravado.
- `device_id` sempre `null`. Só há `expo-constants` instalado (sem `expo-device` nem
  `expo-application`). A coluna fica pronta para uso futuro.
- Sair sem internet: o delete falha em silêncio e a linha continua. Enquanto ela existir,
  pushes da conta anterior ainda podem chegar a esse aparelho, até o Expo responder
  `DeviceNotRegistered` e a Edge Function remover o token. Isso é um ponto de atenção de
  privacidade; a correção possível é uma fila de revogação, a definir.
- Recibos do Expo (`/getReceipts`) não são lidos. Ficam para o próximo passo.
- Sem credenciais FCM/APNs, o Expo recusa o envio. A função não trata isso como erro e responde
  `sent: 0`.

## Próximo passo: disparo semanal com pg_cron

Só depois de aplicar a migration e publicar a função `push`. Exemplo (não aplicado):

```sql
select cron.schedule('weekly-plan-ready', '0 10 * * 1', $$
  select net.http_post(
    url := 'https://<ref>.supabase.co/functions/v1/push',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-push-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'push_function_secret')
    ),
    body := jsonb_build_object(
      'user_id', u.user_id,
      'title', 'Seu plano da semana está pronto',
      'body', 'Toque para ver os treinos',
      'data', jsonb_build_object('url', '/plan')
    )
  ) from public.notification_settings as u where u.training_reminders
$$);
```

Ajustes antes de usar: o filtro do `from` é um exemplo (trocar pela regra real de "plano da
semana pronto"). O segredo `x-push-secret` deve ficar no **Supabase Vault**, nunca escrito no SQL.
Criar uma vez com `select vault.create_secret('<valor>', 'push_function_secret');`, usando o mesmo
valor de `PUSH_FUNCTION_SECRET`. Não cole o segredo em migrations nem no repositório.

- Avaliar RPC `claim_push_token` (SECURITY DEFINER) para reatribuir um token cujo dono anterior saiu offline.

Outros próximos passos: recibos do Expo (`/getReceipts`), preencher `device_id` com
`expo-device` (exige aprovação de lib nova) e a revogação de token na conta anterior.

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
