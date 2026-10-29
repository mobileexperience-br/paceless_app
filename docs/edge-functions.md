# Edge Functions

Código em `supabase/functions/<nome>/index.ts` (Deno). Fica fora do `tsconfig`
e do ESLint type-aware do app; zero comentário e limite de 200 linhas valem.

## Funções

| Função | O que faz |
| --- | --- |
| `delete-account` | Valida o JWT de quem chamou, apaga a pasta de avatar no Storage e apaga a conta com a service role. **Publicada (v2)** em 21/10/2026. |
| `push` | Envia push pelo Expo Push Service para os tokens de um usuário (`push_tokens`). Autoriza por `x-push-secret` ou pela service role. Remove tokens com `DeviceNotRegistered`. Não devolve tokens nem segredos. **Publicada** em 29/10/2026 (migration `push_tokens` aplicada, `PUSH_FUNCTION_SECRET` definido; falta `EXPO_ACCESS_TOKEN`). Ver [notificacoes.md](./notificacoes.md). |
| `generate-plan` | Gera o plano de corrida do usuário por regras (sem IA) e grava `user_plans`, `plans` e a agenda com a service role. Exige JWT. Lê o perfil e a assinatura no servidor. Regras em [planos.md](./planos.md). **Publicada** em 29/10/2026 (migrations `generated_plans` e `plan_session_link` aplicadas). |
| `revenuecat-webhook` | Recebe eventos do RevenueCat e grava `public.subscriptions`. Sem verificação de JWT. **Escrita, não publicada** (faltam `REVENUECAT_WEBHOOK_AUTH` e `REVENUECAT_SECRET_KEY`). Ver [assinaturas.md](./assinaturas.md). |

## Deploy

Precisa da [Supabase CLI](https://supabase.com/docs/guides/cli) instalada.

```bash
supabase login
supabase link --project-ref <ref-do-projeto>
supabase functions deploy delete-account
supabase functions deploy generate-plan
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
### generate-plan

- Antes do deploy, aplique a migration `20261029000000_generated_plans.sql` no projeto
  remoto com `supabase db push`. Sem ela, a função falha ao chamar `replace_generated_plan`.
- `replace_generated_plan` só tem execute para `service_role`. Nunca chame essa RPC do app.
- A função passa à RPC `p_today` (hoje em São Paulo, usado para separar passado e futuro) e
  `p_force` (o `force` do body). A RPC confere o `settings_hash` de novo, sob lock, então a
  checagem antes da chamada é só um atalho.
- Histórico: treinos `done` e `skipped` do plano anterior são copiados para o novo plano pela
  data e posição. Treinos passados `planned` viram `skipped`, e os futuros são recriados.
  Regras completas em [planos.md](./planos.md#regeneração-e-histórico).
- Se a assinatura da RPC mudar, aplique a migration antes e redeploye `generate-plan`:
  a função e a RPC precisam ter a mesma lista de argumentos.
- Sem o `revenuecat-webhook` publicado, nenhum usuário tem linha premium em
  `subscriptions`: **todo mundo gera o plano grátis (2 semanas)**.
- Resposta 200 `generated` e `unchanged` traz `fullWeeks` (total de semanas do plano completo,
  ex.: 12 no `run_10k` com `never_ran`). O free recebe `weeks: 2` e `fullWeeks: 12`; a UI mostra
  as semanas 3 a 12 bloqueadas. Forma completa:
  `{status, userPlanId, tier, weeks, fullWeeks, sessions?}`.
- `GENERATOR_VERSION` está em `2` (era `1`). A forma do plano mudou (campo `full_weeks`), então
  o `settings_hash` mudou e o próximo save regenera o plano mesmo sem mudar as entradas.
- Não precisa de `--no-verify-jwt`: a função valida o JWT do usuário logado.

## Variáveis de ambiente

`SUPABASE_URL`, `SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` são
injetadas automaticamente pelo Supabase nas funções hospedadas. Não é preciso
configurar nada nem criar `.env` para elas.

A service role key só existe no ambiente da função. Nunca vai para o app nem
para o repositório.

## Testar

### generate-plan

1. Com o app logado e o perfil completo (objetivo, preparo, dias de treino), abra
   Plano > Configurações do plano e clique em "Salvar alterações".
2. O botão mostra "Atualizando plano..." enquanto a função roda. Se der erro, aparece a
   mensagem em vermelho e você pode salvar de novo.
3. No dashboard do Supabase (Table Editor), confira em `user_plans` a linha `active` e em
   `plans` um registro com `owner_id` igual ao usuário e `tier = free`.
4. Confira em `user_plan_workouts` que há treinos com `scheduled_date` a partir do início
   (ou da segunda-feira seguinte, quando o primeiro dia de corrida já passou).
5. Salve de novo sem mudar nada: a resposta deve ser `unchanged` e nada novo aparece no banco.
6. Logs: Edge Functions > generate-plan > Logs.

### delete-account

Com o app logado, em Perfil > Minha conta > Excluir conta. Confira no
dashboard (Authentication > Users) que o usuário sumiu e veja os logs em
Edge Functions > delete-account > Logs.
