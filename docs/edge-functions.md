# Edge Functions

Código em `supabase/functions/<nome>/index.ts` (Deno). Fica fora do `tsconfig`
e do ESLint type-aware do app; zero comentário e limite de 200 linhas valem.

## Funções

| Função | O que faz |
| --- | --- |
| `delete-account` | Valida o JWT de quem chamou, apaga a pasta de avatar no Storage e apaga a conta com a service role. **Publicada (v2)** em 21/10/2026. |
| `push` | Envia push pelo Expo Push Service para os tokens de um usuário (`push_tokens`). Autoriza por `x-push-secret` ou pela service role. Remove tokens com `DeviceNotRegistered`. Não devolve tokens nem segredos. **Escrita, não publicada** (faltam a migration `push_tokens`, `EXPO_ACCESS_TOKEN` e `PUSH_FUNCTION_SECRET`). Ver [notificacoes.md](./notificacoes.md). |
| `revenuecat-webhook` | Recebe eventos do RevenueCat e grava `public.subscriptions`. Sem verificação de JWT. **Escrita, não publicada** (faltam `REVENUECAT_WEBHOOK_AUTH` e `REVENUECAT_SECRET_KEY`). Ver [assinaturas.md](./assinaturas.md). |

## Deploy

Precisa da [Supabase CLI](https://supabase.com/docs/guides/cli) instalada.

```bash
supabase login
supabase link --project-ref <ref-do-projeto>
supabase functions deploy delete-account
supabase functions deploy revenuecat-webhook --no-verify-jwt
supabase db push
supabase functions deploy push --no-verify-jwt
```

O `<ref-do-projeto>` aparece em Project Settings > General no dashboard do
Supabase.

`supabase db push` aplica **todas** as migrations pendentes, não só a de `push_tokens`. Confira
antes com `supabase migration list`.

`push` usa `--no-verify-jwt` porque autoriza sozinha: aceita o header `x-push-secret` igual a
`PUSH_FUNCTION_SECRET` ou `Authorization: Bearer <service role key>`. Sem uma das duas, responde 401.

## Secrets do `push`

```bash
supabase secrets set EXPO_ACCESS_TOKEN=... PUSH_FUNCTION_SECRET=...
```

- `EXPO_ACCESS_TOKEN`: em expo.dev > Account settings > Access tokens. Com
  **Enhanced Security for Push Notifications** ligado. A chave nunca vai ao app.
- `PUSH_FUNCTION_SECRET`: texto aleatório longo, por exemplo `openssl rand -hex 32`. O mesmo
  valor vai ao Supabase Vault para o pg_cron (ver [notificacoes.md](./notificacoes.md)).

Sem `EXPO_ACCESS_TOKEN` ou a service role, a função responde 500 `Function is not configured`.

## Testar o `push`

```bash
curl -X POST https://<ref-do-projeto>.supabase.co/functions/v1/push \
  -H 'Content-Type: application/json' \
  -H 'x-push-secret: <PUSH_FUNCTION_SECRET>' \
  -d '{"user_id":"<uuid do usuário>","title":"Teste","body":"Olá"}'
```

Resposta esperada: `{"success":true,"sent":1,"removed":0}`. Sem tokens para o usuário, a resposta
é `{"success":true,"sent":0,"removed":0}`. Um token com `DeviceNotRegistered` é apagado e conta
em `removed`. Erro de leitura responde 500 e falha no Expo responde 502.

Push de verdade só chega com um **build de desenvolvimento novo** e as credenciais FCM v1 (Android)
e APNs (iOS) da Fase 2.

Recibos do Expo (`/getReceipts`) ainda não são consultados: fica como próximo passo.

## Variáveis de ambiente

`SUPABASE_URL`, `SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` são
injetadas automaticamente pelo Supabase nas funções hospedadas. Não é preciso
configurar nada nem criar `.env` para elas.

A service role key só existe no ambiente da função. Nunca vai para o app nem
para o repositório.

## Testar

Com o app logado, em Perfil > Minha conta > Excluir conta. Confira no
dashboard (Authentication > Users) que o usuário sumiu e veja os logs em
Edge Functions > delete-account > Logs.
