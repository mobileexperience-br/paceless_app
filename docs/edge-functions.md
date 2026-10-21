# Edge Functions

Código em `supabase/functions/<nome>/index.ts` (Deno). Fica fora do `tsconfig`
e do ESLint type-aware do app; zero comentário e limite de 200 linhas valem.

## Funções

| Função | O que faz |
| --- | --- |
| `delete-account` | Valida o JWT de quem chamou, apaga a pasta de avatar no Storage e apaga a conta com a service role. **Publicada (v2)** em 21/10/2026. |
| `revenuecat-webhook` | Recebe eventos do RevenueCat e grava `public.subscriptions`. Sem verificação de JWT. **Escrita, não publicada** (faltam `REVENUECAT_WEBHOOK_AUTH` e `REVENUECAT_SECRET_KEY`). Ver [assinaturas.md](./assinaturas.md). |

## Deploy

Precisa da [Supabase CLI](https://supabase.com/docs/guides/cli) instalada.

```bash
supabase login
supabase link --project-ref <ref-do-projeto>
supabase functions deploy delete-account
supabase functions deploy revenuecat-webhook --no-verify-jwt
```

O `<ref-do-projeto>` aparece em Project Settings > General no dashboard do
Supabase.

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
