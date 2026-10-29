# Edge Functions

Código em `supabase/functions/<nome>/index.ts` (Deno). Fica fora do `tsconfig`
e do ESLint type-aware do app; zero comentário e limite de 200 linhas valem.

## Funções

| Função | O que faz |
| --- | --- |
| `delete-account` | Valida o JWT de quem chamou, apaga a pasta de avatar no Storage e apaga a conta com a service role. **Publicada (v2)** em 21/10/2026. |
| `generate-plan` | Gera o plano de corrida do usuário por regras (sem IA) e grava `user_plans`, `plans` e a agenda com a service role. Exige JWT. Lê o perfil e a assinatura no servidor. Regras em [planos.md](./planos.md). **Escrita, não publicada** (depende da migration `20261029000000_generated_plans.sql`). |
| `revenuecat-webhook` | Recebe eventos do RevenueCat e grava `public.subscriptions`. Sem verificação de JWT. **Escrita, não publicada** (faltam `REVENUECAT_WEBHOOK_AUTH` e `REVENUECAT_SECRET_KEY`). Ver [assinaturas.md](./assinaturas.md). |

## Deploy

Precisa da [Supabase CLI](https://supabase.com/docs/guides/cli) instalada.

```bash
supabase login
supabase link --project-ref <ref-do-projeto>
supabase functions deploy delete-account
supabase functions deploy generate-plan
supabase functions deploy revenuecat-webhook --no-verify-jwt
```

O `<ref-do-projeto>` aparece em Project Settings > General no dashboard do
Supabase.

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
