# Decisões

Uma entrada por decisão que muda o rumo. Mais recente no topo.
As decisões de arquitetura originais estão no [CLAUDE.md](../CLAUDE.md#decisões-de-arquitetura).

Formato:

```
## AAAA-MM-DD — Título curto
**Decisão:** o que foi decidido.
**Por quê:** o motivo.
**Alternativas descartadas:** o que mais foi considerado (opcional).
```

---

## 2026-10-19 — Tabelas de usuário: FK em auth.users e RLS
**Decisão:** toda tabela de dados do usuário referencia `auth.users(id)` com
`on delete cascade` e tem RLS ativa com políticas por `(select auth.uid())`.
**Por quê:** o client fala direto com o banco, então a RLS é a única barreira;
o cascade faz a exclusão de conta apagar todos os dados.
**Primeira aplicação:** `public.profiles` (nome + respostas do onboarding),
criada por trigger no signup; sem política de delete.

## 2026-10-19 — Primeira Edge Function: exclusão de conta
**Decisão:** `supabase/functions/delete-account` valida o JWT do usuário e
apaga a conta com `auth.admin.deleteUser`. O app chama via
`supabase.functions.invoke('delete-account')` e faz logout local em seguida.
**Por quê:** App Store e Play exigem excluir a conta dentro do app. Apagar um
usuário do Auth exige a service role key, que nunca pode ir para o client.
É a exceção à decisão "sem Edge Functions por ora".
**Como funciona:** o `ON DELETE CASCADE` das tabelas ligadas a `auth.users`
remove os dados do usuário; tabelas futuras devem seguir essa regra.
**Alternativas descartadas:** RPC `SECURITY DEFINER` apagando de `auth.users`
(mexe no schema interno do Supabase); desativar a conta em vez de apagar
(não atende a exigência das lojas).
**Arquivos Deno:** `supabase/functions/**` fica fora do `tsconfig` e do ESLint
type-aware; as regras de zero comentário e 200 linhas continuam valendo.

## 2026-10-19 — Dependências sempre na última versão compatível
**Decisão:** projeto sobe para o Expo SDK 58 (RN 0.88, React 19.3, TS 6) e
mantém tudo na versão mais recente **que o SDK/ecossistema suporta**.
**Por quê:** ficar atrás acumula migração; Expo Go só abre o SDK mais novo.
**Travados de propósito** (rever a cada upgrade):
- `typescript` 6.x — o 7 não é suportado pelo `typescript-eslint` (<6.1).
- `eslint` 9.x — o 10 quebra o `eslint-plugin-react` do `eslint-config-expo`.
- `eslint-import-resolver-typescript` 3.x — versão usada pelo `eslint-config-expo`.
- `react`/`react-dom` 19.3.0 e `async-storage` 2.2.0 — fixados pelo SDK 58.
**Como atualizar:** `npx expo install expo@latest && npx expo install --fix`,
depois `npm outdated` para o resto; `tsc`, `eslint` e `npx expo-doctor` limpos.

## 2026-10-19 — Lefthook no commit e no push
**Decisão:** `lefthook.yml` com `pre-commit` (eslint nos staged + tsc) e
`pre-push` (eslint e tsc completos). Sem `--fix` automático.
**Por quê:** lint vira barreira real, não só convenção — vale para os dois
devs e para qualquer LLM.

## 2026-10-19 — Lint e tipagem no máximo
**Decisão:** `tsconfig` com `strict` + `noUncheckedIndexedAccess`,
`exactOptionalPropertyTypes` e afins. ESLint com `strictTypeChecked` +
`stylisticTypeChecked`, retorno explícito, `max-lines: 200`, regra local que
proíbe comentários, `--max-warnings 0`.
**Por quê:** lint é a principal barreira de qualidade do projeto.
**Exceção:** `restrict-template-expressions` com `allowNumber` — o RN tipa
largura como `` `${number}%` ``, e `String(n)` não satisfaz esse tipo.

## 2026-10-19 — App fala direto com o Supabase, sem Edge Functions por ora
**Decisão:** o React acessa o Supabase direto (`lib/supabase.ts` → `hooks/` →
telas). Nenhuma Edge Function nesta etapa. `lib/` mantido como nome da pasta.
**Por quê:** simplicidade enquanto o app está no início; Edge Function entra
quando tiver algo que realmente precise rodar no servidor.
**Condição:** RLS em todas as tabelas é obrigatório — com o client falando
direto com o banco, o RLS é a única proteção dos dados.
**Pendente:** o `CLAUDE.md` ainda diz que limite free/premium e APIs externas
passam por Edge Function. Isso continua valendo quando essas features chegarem
(Fase 4 em diante).

## 2026-10-19 — Pasta `docs/` para planejamento
**Decisão:** planejamento, diagnóstico e acordos de colaboração ficam em
`docs/`. Regras de código continuam só no `CLAUDE.md`.
**Por quê:** com duas pessoas no projeto, o plano precisa morar no repo e ser
revisado em PR como o código.
