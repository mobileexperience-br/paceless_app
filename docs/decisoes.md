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

## 2026-10-21 — Android: conta de organização no Play, assinatura de app do Google
**Decisão:** o app Paceless (ID `4972516548397125859`, `com.paceless.app`) foi criado
na conta de organização MXPBR, com Play App Signing ativo. Cliente OAuth
"Paceless Android (Play)" criado com o SHA-1 da chave de assinatura do Google
(`D5:98:4A:5B:B2:B8:2C:5F:FC:C9:5E:EE:FE:A1:FE:89:F4:59:74:85`); o Supabase tem os
quatro Client IDs. O primeiro build de produção (AAB, versionCode 2) roda no EAS e
ainda não foi enviado.
**Por quê:** conta de organização dispensa o teste fechado de 12 testers por 14
dias; o Google Login em produção precisa do SHA-1 da chave que o Play usa para
assinar.
**Ainda aberto:** "Conteúdo do app" no Play Console (detalhes em
[pendencias-pedro.md](./pendencias-pedro.md)); tela OAuth do Google segue em modo de teste.

## 2026-10-21 — RevenueCat ligado ao Google Play
**Decisão:** chave de teste em `development` e `preview`, chave `goog_` em
`production` (variáveis do EAS). RevenueCat com o JSON da conta de serviço,
tópico Pub/Sub `projects/paceless/topics/Play-Store-Notifications` e notificação
de teste recebida.
**Estado:** as credenciais mostram o aviso "package name not found" até o primeiro
AAB ser enviado. A Edge Function `revenuecat-webhook` está escrita mas **não
publicada** (faltam `REVENUECAT_WEBHOOK_AUTH` e `REVENUECAT_SECRET_KEY`).

## 2026-10-21 — Migrations aplicadas no remoto
**Decisão:** as 15 migrations de `supabase/migrations/` estão aplicadas no projeto
`twfqvvfpnspbdaytrerm`, incluindo `strength`, `training_plans`, `user_plans`,
`gamification`, `notification_settings`, `connected_devices`, `nutrition`,
`activities_walk_type`, `restrict_core_table_grants`, `handle_new_user` e
`avatars_storage`. A Edge Function `delete-account` v2 está publicada.

## 2026-10-20 — Respostas do Pedro
**Decisão:** preço de R$ 267/ano e R$ 37/mês; freemium de 15 ou 30 dias (duração a
definir); relógios Garmin, Apple Watch, Samsung, Coros e Polar; dias de treino por
quantidade, com combinações predefinidas; gamificação aprovada (meta semanal sem
sequência, conquistas de 1, 3, 5, 7 e 10 km); Stories importante, mas não bloqueia a
primeira versão; iPad secundário; concorrente Zyla.
**Troca de plano:** feita pelo usuário no app, com a cobrança gerida pela loja;
intervenção manual só em suporte.
**Pagamento:** pela Hotmart está **em discussão**, sem decisão ([pagamento-hotmart.md](./pagamento-hotmart.md), fora desta branch).
**Em andamento:** combinações de dias de treino e retomada do treino após o app ser
encerrado.

## 2026-10-20 — Área admin fora do app
**Decisão:** a área administrativa será uma aplicação web separada, em outro
domínio, não uma tela dentro do app.
**Por quê:** pedido do Pedro, por segurança e LGPD.

## 2026-10-20 — Perfil por trigger e grants restritos
**Decisão:** `on_auth_user_created` cria `profiles` via `handle_new_user()`, e o
client nunca assume que a linha existe. A migration `restrict_core_table_grants`
revoga `anon` e privilégios excessivos em `activities` e `profiles`.
**Por quê:** o trigger original não existia no banco remoto; o client falando direto
com o banco exige o menor privilégio possível. Detalhes em
[banco-de-dados.md](./banco-de-dados.md).

## 2026-10-19 — Tema claro e escuro
**Decisão:** duas paletas com os mesmos tokens, `ThemeProvider` com `system`,
`light` e `dark`, e `expo-system-ui` no dev build para o Android seguir o esquema. As
telas de treino e resumo são sempre escuras.
**Por quê:** a preferência de tema já era salva no perfil; faltava renderizar.
Detalhes em [design-system.md](./design-system.md).

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
Foi a exceção à decisão "sem Edge Functions por ora", publicada na v2 em 21/10.
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
**Atualização:** substituída em parte. Já existem as Edge Functions
`delete-account` (publicada) e `revenuecat-webhook` (escrita, não publicada). O
`CLAUDE.md` continua certo: limite free/premium e APIs externas passam por Edge
Function quando essas features chegarem.

## 2026-10-19 — Pasta `docs/` para planejamento
**Decisão:** planejamento, diagnóstico e acordos de colaboração ficam em
`docs/`. Regras de código continuam só no `CLAUDE.md`.
**Por quê:** com duas pessoas no projeto, o plano precisa morar no repo e ser
revisado em PR como o código.

## 2026-10-19 — Foto de perfil no Supabase Storage (bucket público)
**Decisão:** fotos ficam no bucket `avatars`, público para leitura, em
`<user_id>/<timestamp>.jpg` (JPEG 512px, máx. 2 MB). Só o dono lista, insere,
atualiza e apaga na própria pasta (policies em `storage.objects`). O caminho
fica em `profiles.avatar_path` e a URL pública é montada no client.
**Por quê:** avatar não é dado sensível; URL pública dispensa signed URLs
(expiram e exigem uma chamada por imagem) e o timestamp no nome troca a URL a
cada foto nova, evitando cache velho.
**Exclusão:** a Edge Function `delete-account` apaga a pasta do usuário antes
de remover a conta.

## 2026-10-19 — Preferências do usuário no perfil, com cache local
**Decisão:** unidade de distância (`km`/`mi`) e tema (`system`/`light`/`dark`) ficam
em colunas de `profiles` e são espelhadas no AsyncStorage (`paceless:preferences`).
O `PreferencesProvider` carrega o cache na abertura, sincroniza com o perfil ao logar
e salva com atualização otimista (reverte e avisa em PT-BR se o upsert falhar).
**Por quê:** a preferência acompanha a conta entre aparelhos, e o cache dá início
instantâneo e uso sem login. Distâncias continuam gravadas em metros/segundos por km;
a conversão acontece só na exibição (`lib/units.ts`, 1 mi = 1,609344 km).
**Atualização (19/10):** o modo escuro foi implementado; ver "Tema claro e escuro" acima.
