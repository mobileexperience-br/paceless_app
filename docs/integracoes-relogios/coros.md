# COROS

> Pesquisa consolidada em 2026-10-29 (3 rodadas de pesquisa e revisão). Complementa `docs/relogios.md`.
> Legenda das fontes: **[OFICIAL]** central de ajuda da COROS ou docs do Supabase; **[DOC-VIA-REPO]** API Reference privada (V2.0.6, fev/2026) citada por repositórios públicos; **[COMUNIDADE]** código aberto ou terceiros; **[NOSSO]** desenho proposto por nós, não testado; **a confirmar** = não verificado ou fontes divergem.
> Atenção: `support.coros.com` bloqueia acesso automatizado (HTTP 403). Os fatos "oficiais" vieram de trechos de busca e de notas de terceiros. **O Pedro deve abrir as páginas oficiais no navegador e confirmar.**

## Resumo

**O que é.** A COROS (fabricante chinesa de relógios de corrida: PACE, APEX, VERTIX, NOMAD) oferece três caminhos para desenvolvedores [OFICIAL, "Connect Your Data", atualizado em 2026-09-02]:

| Caminho | Para quem | Aprovação | O que entrega |
|---|---|---|---|
| Conector MCP pessoal | Usuário ligando a própria conta a um assistente de IA | Nenhuma | Leitura e escrita de planos de treino |
| Build on COROS MCP (`https://mcp.coros.com/mcp`) | Desenvolvedor, mas **escopo de um único usuário** | Self-service | Dados limitados, **sem webhook**, sem sync bidirecional |
| **Partner API** | Plataformas estabelecidas | Solicitação + aceite dos Termos de Uso da API | OAuth 2.0 multiusuário, webhooks, dados diários, download de FIT, rotas, push de planos de treino |

**Vale para o Paceless?** Sim, e o caminho é a **Partner API**. O MCP foi descartado: a página oficial diz que "all data access is scoped to the authorizing user only (single-user)" (artigo 53181619102996), ou seja, não serve como API de produto. Os números citados por terceiros para o MCP (cerca de 22 campos, cerca de 50 FIT/dia) são **a confirmar**, mas deixaram de importar.

**Recomendação.**
1. Pedro solicita acesso à Partner API **o quanto antes**, apresentando o Paceless como plataforma de coaching de corrida.
2. Fase 1: importar treinos (webhook + FIT) e dados diários (polling). Fase 2: enviar treinos do Paceless para o relógio (`tp/list/push`).
3. Agregadores (Terra, vitalera) só como plano B, se a COROS recusar.

Sinal da comunidade: projetos pequenos (Stride/zhaochy1990, quantified-self) parecem ter conseguido acesso, o que sugere que a exigência de base de usuários não é proibitiva (**a confirmar**, é inferência). Já o agregador open source Open Wearables ainda não tinha acesso visível em out/2026 (issue #1214).

## Cadastro e burocracia

**Quem faz:** Pedro (dono das contas da empresa). **Onde:** formulário em "Submit an API Application" (https://support.coros.com/hc/en-us/articles/17085887816340-Submit-an-API-Application) e e-mail **api@coros.com**.

**Requisitos** [OFICIAL, "Partner API Access", atualizado em 2026-09-03]:
- Plataforma estabelecida com base de usuários demonstrável (nenhum número mínimo é publicado, **a confirmar**).
- **Empresa registrada** (nosso CNPJ) com **representante técnico autorizado**.
- Conformidade de segurança e privacidade (LGPD, política de privacidade pública).
- Aceite dos Termos de Uso da API COROS.

**Custo:** nenhuma página menciona taxa. **Pedir confirmação por escrito.** **Prazo de aprovação:** não informado em lugar nenhum, e nenhum relato público de prazo foi encontrado (Reddit, Stack Overflow, fóruns).

**Campos do formulário** (segundo theodiablo/running-coach §1.2 [DOC-VIA-REPO], podem ter mudado):
- **Nome da aplicação:** até 50 caracteres. "Paceless".
- **Descrição:** até **100 caracteres**, escrever **em inglês** [NOSSO]. Rascunho (98 caracteres): `Paceless: running app with adaptive training plans and coaching. Imports COROS workouts via OAuth.`
- **Logo:** PNG em **144x144** e **102x102**.
- **Domínios de callback:** **1 ou 2**. Usar `<project>.supabase.co`; se houver domínio próprio no futuro, registrar já como segundo.
- **Redirect URI:** precisa bater exatamente (inclusive barra final): `https://<project>.supabase.co/functions/v1/coros-oauth-callback`. Esquema customizado (`paceless://`) provavelmente não é aceito, pois o campo pede *domínios*.
- **WORKOUT DATA RECEIVING ENDPOINT URL** (campo do webhook, visto no PR #559 de zhaochy1990/running): `https://<project>.supabase.co/functions/v1/coros-webhook`, preenchido só quando a função estiver no ar respondendo; senão "N/A" e atualizar depois.
- Dados da empresa, contatos técnicos, URL da política de privacidade.

**Depois da aprovação:** a COROS emite **Client ID + Client Secret** e envia o **API Reference em PDF** (versão atual citada: V2.0.6, fev/2026). A documentação **não é pública** (a Nango confirma: "documentation is private"). Credenciais de sandbox funcionam em `opentest.coros.com` [DOC-VIA-REPO]. O host de produção `open.coros.com` aparece só em código da comunidade (**a confirmar** no e-mail de boas-vindas).

### Checklist do Pedro

Preparar:
- [ ] CNPJ, razão social, site
- [ ] Política de privacidade pública em PT-BR **e inglês**, citando COROS, Supabase e provedor de IA
- [ ] Logo PNG 144x144 e 102x102
- [ ] Descrição em inglês (até 100 caracteres, rascunho acima)
- [ ] Número atual de usuários ativos e links das lojas
- [ ] E-mail do contato técnico (representante técnico autorizado)
- [ ] URL do projeto Supabase de produção (`<project>.supabase.co`)

No formulário:
- [ ] Domínio de callback `<project>.supabase.co` (+ domínio próprio futuro como segundo)
- [ ] Redirect URI `https://<project>.supabase.co/functions/v1/coros-oauth-callback`
- [ ] WORKOUT DATA RECEIVING ENDPOINT URL `.../functions/v1/coros-webhook` ou N/A
- [ ] Ler e aceitar os Termos de Uso **só depois** de receber o texto completo

E-mail para api@coros.com perguntando:
- [ ] Hosts de produção e sandbox, e como obter credenciais de sandbox
- [ ] Mínimo de usuários, prazo de aprovação, taxas; existe tier beta/startup?
- [ ] Texto completo dos Termos de Uso: uso com IA, retenção de dados/FIT, branding, exclusão após desautorização
- [ ] Guia de marca / selo "Works with COROS"
- [ ] Webhook: quais tipos de evento são enviados, política de retentativa, IPs de origem, URLs separadas para staging e produção
- [ ] Refresh do token funciona depois da expiração? Lista de códigos de erro
- [ ] A janela de 3 meses vale também para download de FIT?
- [ ] Schema do `tp/list/push` (envio de treinos ao relógio)
- [ ] JSON de exemplo dos endpoints diários, de detalhe e de streams
- [ ] LGPD: onde os dados são hospedados, existe DPA ou cláusulas contratuais padrão, permissão escrita para processamento por IA

## Dados disponíveis

**Resumo do treino (lista e webhook)** [COMUNIDADE, schemas zod do c2c_tracking]:

| Campo | Tipo / observação |
|---|---|
| `labelId` | string numérica (id do treino) |
| `mode`, `subMode` | inteiro 1-99 |
| `distance?` | número >= 0 (opcional) |
| `duration?` | inteiro >= 0, segundos (opcional) |
| `startTime`, `endTime` | epoch em **segundos** |
| `startTimezone`, `endTimezone` | inteiro 1-96, em **unidades de 15 min** (ex.: 32 = UTC+8) |
| `fitUrl?` | link pré-assinado de object storage, não exige token |
| `triathlonItemList?` | `{mode, subMode, distance, duration, fitUrl}[]` |

Também citados: cadência, calorias, passos, dispositivo. **O resumo não tem FC nem altimetria**; FC por amostra, GPS e altitude estão no **FIT**. A vitalera diz que, após o push, "fetches workout details and streams endpoints", o que sugere endpoints de detalhe/streams além do FIT (**a confirmar**).

**Modalidades conhecidas** (tabela completa só no PDF): 8/1 corrida outdoor, 8/2 esteira/indoor, 15/1 trail, 20/1 pista, 13 e 14 triatlo/multisport, 31/1 caminhada, 16/1 trilha (hike). Alguns códigos usam a chave `mode*10+subMode` (81 = Outdoor Run). Demais modos: ignorar ou gravar como "other".

**Dados diários** (`/coros/daily/query`): passos, FC de repouso, HRV, janela de sono [COMUNIDADE, ts-health]. Não existe JSON de exemplo público; se HRV vem como média noturna é **a confirmar**.

**Segundo a integração em produção da vitalera** [COMUNIDADE]: FC média/máx e FC por segundo nos treinos, FC de repouso diária, duração e estágios do sono, SpO2 (só VERTIX e PACE Pro), VO2max, splits por km, cadência, ganho/perda de elevação, **potência de corrida nativa**. Lista da issue do Open Wearables (carga de treino, stamina, qualidade do sono) é **a confirmar**.

**Histórico:** no máximo **30 dias por chamada** e **nada além de 3 meses** (regra do changelog "V2.5, 2024-01-01" dentro da V2.0.6, numeração estranha, **a confirmar**). Não há backfill do histórico completo. Usar piso seguro de **agora menos 88 dias**.

## Autenticação e sincronização

**OAuth 2.0 (Authorization Code)** [COMUNIDADE, 3 bases de código independentes]:

| Etapa | Método / caminho | Observações |
|---|---|---|
| Autorizar | `GET /oauth2/authorize?client_id&redirect_uri&state&response_type=code` | **Sem `scope`, sem PKCE.** `state` só `[A-Za-z0-9]`, máx. 128 bytes (§3.1.3) |
| Token | `POST /oauth2/accesstoken` (form-urlencoded: client_id, client_secret, redirect_uri, code, grant_type=authorization_code) | Credenciais no corpo, não Basic. Retorna `access_token`, `refresh_token`, `openId`, talvez `expires_in`. Ler snake_case e camelCase. O openathlete usa `/oauth2/token` (minoria, **a confirmar** no sandbox) |
| Refresh | `POST /oauth2/refresh-token` (client_id, client_secret, refresh_token, grant_type=refresh_token) | Segundo running-coach (§3.3): **não emite token novo**, estende o atual por 30 dias e retorna `{result:"0000",message:"OK"}`; refresh token não expira. Fonte única, não testada ao vivo (**a confirmar**) |
| Desautorizar | `POST /oauth2/deauthorize?token=...` | |
| Estado do vínculo | `GET /coros/bindState?token&openId` | |
| Usuário | `GET /v2/user` (nome no doc: `getUserInfo`) | |
| Lista de treinos | `GET /v2/coros/sport/list?token&openId&startDate=YYYYMMDD&endDate=YYYYMMDD` | 30 dias por chamada, 3 meses no máximo |
| FIT do treino | `GET /v2/coros/sport/detail/fit?token&openId&labelId&mode&subMode` | Retorna `fitUrl` |
| Dados diários | `GET /coros/daily/query?token&openId&startDate&endDate` | |
| Plano de treino | `POST /coros/tp/list/push`, `tp/workout/deleteById` | Schema não público |
| Rotas / upload | `route/push` (GPX/KML até 50 MB), `file/synchronous`, `file/upload`, `file/upload/get` | Só nomes [OFICIAL] |

Convenção de resposta: HTTP 200 com `result` no corpo; `"0000"` = sucesso, qualquer outro valor = erro. Só `"0000"` está documentado publicamente. HTTP 429 = rate limit.

**Webhook (push):**
- A COROS faz POST de um **resumo de treino** em cerca de 5 minutos após a sincronização [OFICIAL].
- Autenticação: cabeçalhos `client` e `secret` com nosso client id e secret [DOC-VIA-REPO §5]. Sem HMAC. Comparar em tempo constante e **nunca logar esses cabeçalhos**.
- Payload: `{ "sportDataList": [ { openId, labelId, mode, subMode, distance, duration, startTime, endTime, startTimezone, endTimezone, fitUrl, triathlonItemList? } ] }`.
- Resposta esperada: HTTP 200 com `{"message":"ok","result":"0000"}`.
- Retentativa: qualquer resposta diferente de `"0000"` faz a COROS reenviar dentro de 24 h (PR #559); número de tentativas **a confirmar**. Logo, **idempotência é obrigatória**: chave `(open_id, label_id)`.
- Até onde se sabe, **só treinos são enviados**; dados diários exigem polling (inferência, **a confirmar**).
- A Terra diz que "Coros does not notify Terra" e faz polling a cada 5-10 min. Leitura mais provável: a Terra não registrou webhook. Não prova ausência de push (**a confirmar**).

**Modelo de sincronização do Paceless:** webhook para treinos novos + backfill inicial (88 dias, blocos de 30) + polling diário de `/coros/daily/query` + refresh proativo de token.

## Limites e termos de uso

- **Rate limit:** 1.000 chamadas/min [OFICIAL]; não diz se é por app ou por usuário, tratar como **por app**.
- **Histórico:** 3 meses, 30 dias por chamada.
- **FIT:** sem limite publicado. Nosso teto: 10 MB por arquivo, só hosts `https://*.coros.com`.
- **Termos de Uso da API:** **texto público não encontrado**. A COROS os descreve como "standard, non-discriminatory" (segurança, privacidade, rate limits). Pedir o texto completo antes de assinar, com atenção a: (a) uso dos dados com modelos de IA (coaching do Paceless); (b) tempo de retenção de FIT e dados brutos; (c) regras de marca; (d) exclusão após desautorização.
- **IA:** para o MCP, a COROS diz que os dados seguem as políticas da COROS e da plataforma de IA (the5krunner, 2026-05). Nenhuma proibição explícita encontrada para a Partner API (**a confirmar**, pedir permissão por escrito).
- **Marca:** nenhum guia de marca ou selo "Works with COROS" público. Até receber, usar o texto "Conectar com COROS" sem logo.

**LGPD** [NOSSO + texto da lei]:
- FC, sono, HRV etc. são **dados pessoais sensíveis** (dados de saúde, art. 5º, II).
- **Base legal:** consentimento específico e destacado, para finalidade determinada (art. 11, I). Tela de consentimento dedicada **antes** do redirect OAuth, listando: dados lidos, finalidade (coaching, e IA se houver), retenção, como revogar.
- **Registro:** linha em `consents` com versão e timestamp.
- **Revogação** (art. 18, IX): desconectar apaga os dados COROS do usuário.
- **Transferência internacional** (art. 33): COROS (China), Supabase (região escolhida), provedor de IA. A política de privacidade precisa citá-los. Perguntar à COROS onde hospeda e se há DPA/cláusulas padrão.
- **Papéis:** COROS é controladora independente dos dados dela; Supabase e provedor de IA são operadores (art. 39) e exigem DPA.

**Lojas:**
- **Apple:** dados COROS não vêm do HealthKit, então as regras do HealthKit não se aplicam diretamente. Se gravarmos treinos COROS no HealthKit, vale a guideline 5.1.3 (sem uso publicitário, com divulgação).
- **Google Play:** declarar "Saúde e condicionamento físico" no formulário Data safety e preencher a declaração de apps de saúde. Dado vindo de API de terceiro conta como coletado pelo app.

## Arquitetura no Paceless

Regra do projeto: client secret e troca de token **só em Edge Functions**; o app nunca vê tokens da COROS.

```
App Expo                       Edge Functions (Deno)                 COROS
--------                       ---------------------                 -----
[tela de consentimento]
  -> coros-oauth-start (JWT on) -> grava state -> URL authorize
  WebBrowser.openAuthSessionAsync(url, "paceless://integrations/coros")
                                                    <- usuário autoriza
                               coros-oauth-callback (JWT off) <- ?code&state
                                 troca code (secret) -> coros_connections
                                 cria job backfill
  <- 302 paceless://integrations/coros?status=ok

                               coros-webhook (JWT off) <- POST sportDataList
                                 valida client/secret -> coros_webhook_inbox
                               coros-worker (pg_cron a cada 2 min)
                                 baixa FIT -> decodifica -> external_workouts
                               coros-refresh (pg_cron diário)
                               coros-disconnect (JWT on) -> deauthorize + apaga dados
```

**Edge Functions:**

| Função | `verify_jwt` | Papel |
|---|---|---|
| `coros-oauth-start` | true | Gera `state` (32 alfanuméricos), grava `state -> user_id`, devolve URL de autorização |
| `coros-oauth-callback` | false | Valida e consome `state` (expira em 10 min), troca o code, faz upsert da conexão, agenda backfill, redireciona para o app |
| `coros-webhook` | false | Valida cabeçalhos, grava inbox **antes** de responder |
| `coros-worker` | (chamado pelo cron com chave própria) | Processa inbox e jobs (backfill, daily) |
| `coros-refresh` | (cron) | Refresh proativo de tokens que expiram em até 7 dias |
| `coros-disconnect` | true | Chama deauthorize, apaga conexão e treinos `source = 'coros'` |

**Segredos (Edge Function secrets):** `COROS_API_BASE` (sem host fixo no código), `COROS_CLIENT_ID`, `COROS_CLIENT_SECRET`, `COROS_REDIRECT_URI`.

**Tabelas:** `coros_connections`, `coros_oauth_states`, `coros_webhook_inbox`, `coros_jobs`, `external_workouts` (compartilhada com Garmin, Polar, HealthKit), `consents`. Tabelas de tokens com RLS ligado e **sem policies** (só `service_role` acessa); considerar Supabase Vault para os tokens.

**Deduplicação entre fontes** [NOSSO]: ao inserir em `external_workouts`, procurar treino do mesmo `user_id` com `|Δ start_time| < 120 s` e `|Δ duração| < 5%`; manter um por prioridade de fonte (nativa do relógio acima do HealthKit) e vincular o outro.

**Conflito de vínculo:** `open_id` é único. Se a mesma conta COROS tentar se ligar a um segundo usuário Paceless, o upsert falha: tratar como `status=in_use`.

## Exemplos de código

> Todos os snippets abaixo são **não testados**. Os de Deno são [NOSSO], com formatos tirados de c2c_tracking e running-coach. Comentários aparecem aqui só porque é markdown; no código real do projeto, a regra é sem comentários.

### Referências de código real

1. **theodiablo/running-coach**: Supabase Edge Function em Deno, calibrada na API Reference V2.0.6, commit de 2026-08-27; **não verificada contra conta real**. É a mais próxima da nossa stack.
   - https://github.com/theodiablo/running-coach/blob/main/supabase/functions/coros-import/index.ts
   - https://github.com/theodiablo/running-coach/blob/main/docs/integrations-coros.md (melhor resumo público do PDF privado)
2. **c2corg/c2c_tracking** (Koa + zod, em produção na camptocamp): token, refresh, lista, FIT, deauthorize e webhook. Usar para formatos, não como referência de segurança.
   - https://github.com/c2corg/c2c_tracking/blob/master/src/server/coros/coros.api.ts
   - https://github.com/c2corg/c2c_tracking/blob/master/src/server/coros/coros.service.ts
   - https://github.com/c2corg/c2c_tracking/blob/master/src/server/coros/coros.controller.ts
3. **jimmykane/quantified-self** (Firebase Functions TS): diários, bindState, deauthorize, histórico, `tp/list/push`. https://github.com/jimmykane/quantified-self/tree/master/functions/src/coros
4. **stacksjs/ts-health**: driver COROS. https://github.com/stacksjs/ts-health/blob/main/packages/health/src/drivers/coros.ts
5. **zhaochy1990/running PR #559**: contrato do webhook. https://github.com/zhaochy1990/running/pull/559
6. Outros: openathleteorg/openathlete (NestJS, usa `/oauth2/token`), r-follador/CubeTrek (Java), hicso21/Runners-API (JS), Byron4j/MarathonTraining.
7. **Não usar:** Pinta365/coros (JSR) e Coros-Training-Hub-Exporter usam a API não oficial `teamapi.coros.com`, privada e sem OAuth.

### Trechos de referência da comunidade

running-coach, refresh que só estende o token:

```ts
// fonte: https://github.com/theodiablo/running-coach/blob/main/supabase/functions/coros-import/index.ts
const API = Deno.env.get("COROS_API_BASE") || "https://open.coros.com";
const REFRESH_URL = `${API}/oauth2/refresh-token`;
const LIST_URL = `${API}/v2/coros/sport/list`;
const OK = "0000";
body = await postForm(REFRESH_URL, { client_id, client_secret, refresh_token: row.refresh_token, grant_type: "refresh_token" });
if (body.result !== OK) { /* marca needs_reauth */ }
await admin.from("integration_connections").update({ expires_at: new Date(Date.now() + 30*DAY_MS).toISOString() })...
```

c2c_tracking, webhook e troca de token:

```ts
// fonte: https://github.com/c2corg/c2c_tracking/blob/master/src/server/coros/
export const WebhookEvent = z.object({ sportDataList: z.array(Workout.extend({ openId: z.string() })) });
public webhook(ctx: Context): void {
  void service.handleWebhookEvent(ctx.request.body, ctx.get('client'), ctx.get('secret'));
  ctx.status = 200; ctx.body = { message: 'ok', result: '0000' };
}
const response = await axios.post(`${baseUrl}oauth2/accesstoken`,
  { client_id, client_secret, redirect_uri, code, grant_type: 'authorization_code' },
  { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
```

### Migration (SQL)

```sql
create extension if not exists pg_cron;
create extension if not exists pg_net;

create table coros_connections (
  user_id uuid primary key references auth.users on delete cascade,
  open_id text unique not null,
  access_token text not null,
  refresh_token text not null,
  expires_at timestamptz not null,
  status text not null default 'active'  -- active | needs_reauth
);

create table coros_oauth_states (
  state text primary key,
  user_id uuid not null references auth.users on delete cascade,
  created_at timestamptz default now()
);

create table coros_webhook_inbox (
  open_id text not null,
  label_id text not null,
  payload jsonb not null,
  status text not null default 'pending',  -- pending | processing | done | orphan | failed
  attempts int not null default 0,
  received_at timestamptz default now(),
  primary key (open_id, label_id)
);

create table external_workouts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users on delete cascade,
  source text not null,
  source_id text not null,
  start_time timestamptz not null,
  duration_s int,
  distance_m numeric,
  unique (source, source_id)
);

alter table coros_connections enable row level security;
alter table coros_oauth_states enable row level security;
alter table coros_webhook_inbox enable row level security;
```

### Configuração de JWT (`supabase/config.toml`) [OFICIAL Supabase]

```toml
[functions.coros-webhook]
verify_jwt = false

[functions.coros-oauth-callback]
verify_jwt = false
```

Alternativa: `supabase functions deploy coros-webhook --no-verify-jwt`. Cuidado: a flag de CLI no CI pode sobrescrever o arquivo de config.

### Webhook (`coros-webhook`)

Contrato [COMUNIDADE PR #559 + NOSSO]:

| Situação | HTTP | `result` | Efeito |
|---|---|---|---|
| Cabeçalho `client`/`secret` inválido | 403 | != 0000 | Rejeita (a COROS nunca enviaria isso) |
| JSON malformado ou sem campos obrigatórios | 400 | != 0000 | Loga; a COROS pode reenviar |
| Evento gravado na inbox | 200 | `0000` | Fim |
| `openId` sem vínculo (usuário desconectou) | 200 | `0000` | Worker marca `orphan`; evita retentativas inúteis |
| Falha transitória de banco | 500 | != 0000 | A COROS reenvia dentro de 24 h |

```ts
// supabase/functions/coros-webhook/index.ts  [NOSSO, não testado]
import { createClient } from "npm:@supabase/supabase-js@2";
import { timingSafeEqual } from "jsr:@std/crypto/timing-safe-equal";

const enc = new TextEncoder();
const eq = (a: string, b: string) => {
  const x = enc.encode(a), y = enc.encode(b);
  return x.length === y.length && timingSafeEqual(x, y);
};
const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const reply = (status: number, result: string, message: string) =>
  Response.json({ result, message }, { status });

type Item = {
  openId?: string; labelId?: string | number; mode?: number; subMode?: number;
  fitUrl?: string; triathlonItemList?: { fitUrl?: string }[];
};

Deno.serve(async (req) => {
  // nunca logar estes cabeçalhos
  if (!eq(req.headers.get("client") ?? "", Deno.env.get("COROS_CLIENT_ID")!) ||
      !eq(req.headers.get("secret") ?? "", Deno.env.get("COROS_CLIENT_SECRET")!))
    return reply(403, "4003", "forbidden");

  const raw = await req.text();
  if (raw.length > 1_048_576) return reply(400, "4000", "too large");

  let list: Item[];
  try { list = JSON.parse(raw).sportDataList; } catch { return reply(400, "4000", "bad json"); }
  if (!Array.isArray(list)) return reply(400, "4000", "no sportDataList");

  // valida item a item; duration e distance são opcionais;
  // modos 13/14 (triatlo) trazem os FIT em triathlonItemList
  const rows = list
    .filter((w) => w.openId && w.labelId != null && w.mode != null)
    .map((w) => ({ open_id: w.openId!, label_id: String(w.labelId), payload: w }));
  if (rows.length === 0) return reply(400, "4000", "no valid items");

  // grava ANTES de responder: se falhar, a COROS reenvia
  const { error } = await admin.from("coros_webhook_inbox")
    .upsert(rows, { onConflict: "open_id,label_id", ignoreDuplicates: true });
  if (error) return reply(500, "5000", "retry");
  return reply(200, "0000", "ok");
});
```

Atenção: uma versão anterior deste esboço gravava dentro de `EdgeRuntime.waitUntil` e respondia `0000` antes; isso **perde eventos** se o upsert falhar. Não fazer assim.

### OAuth start (`coros-oauth-start`, JWT ligado)

```ts
// [NOSSO, não testado]
import { createClient } from "npm:@supabase/supabase-js@2";
const API = Deno.env.get("COROS_API_BASE")!;

Deno.serve(async (req) => {
  const jwt = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: { user } } = await admin.auth.getUser(jwt);
  if (!user) return new Response("unauthorized", { status: 401 });

  // 32 caracteres alfanuméricos: cabe em [A-Za-z0-9] e 128 bytes. Não usar JWT no state.
  const state = crypto.randomUUID().replaceAll("-", "");
  await admin.from("coros_oauth_states").insert({ state, user_id: user.id });

  const u = new URL(`${API}/oauth2/authorize`);
  u.search = new URLSearchParams({
    client_id: Deno.env.get("COROS_CLIENT_ID")!,
    redirect_uri: Deno.env.get("COROS_REDIRECT_URI")!,
    response_type: "code",
    state,
  }).toString();
  return Response.json({ url: u.toString() });
});
```

### OAuth callback (`coros-oauth-callback`, JWT desligado)

```ts
// [NOSSO, não testado]
import { createClient } from "npm:@supabase/supabase-js@2";
const API = Deno.env.get("COROS_API_BASE")!;
const CID = Deno.env.get("COROS_CLIENT_ID")!;
const SECRET = Deno.env.get("COROS_CLIENT_SECRET")!;
const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const APP = "paceless://integrations/coros";
const back = (s: string) =>
  new Response(null, { status: 302, headers: { Location: `${APP}?status=${s}` } });

Deno.serve(async (req) => {
  const q = new URL(req.url).searchParams;
  const code = q.get("code"), state = q.get("state");
  if (!code || !state || !/^[A-Za-z0-9]{1,128}$/.test(state)) return back("error");

  const { data: st } = await admin.from("coros_oauth_states")
    .delete().eq("state", state).select().single();
  if (!st || Date.now() - Date.parse(st.created_at) > 600_000) return back("expired");

  const r = await fetch(`${API}/oauth2/accesstoken`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CID, client_secret: SECRET,
      redirect_uri: Deno.env.get("COROS_REDIRECT_URI")!,
      code, grant_type: "authorization_code",
    }),
  });
  const t = await r.json();
  const access = t.access_token ?? t.accessToken;
  const refresh = t.refresh_token ?? t.refreshToken;
  const openId = t.openId ?? t.open_id;
  if (!r.ok || !access || !openId) return back("error");

  const ttl = Number(t.expires_in ?? t.expiresIn) || 30 * 86400;
  const { error } = await admin.from("coros_connections").upsert({
    user_id: st.user_id, open_id: String(openId),
    access_token: access, refresh_token: refresh,
    expires_at: new Date(Date.now() + ttl * 1000).toISOString(),
    status: "active",
  }, { onConflict: "user_id" });
  if (error) return back("in_use"); // open_id já ligado a outro usuário

  await admin.from("coros_jobs").insert({ user_id: st.user_id, kind: "backfill" });
  return back("ok");
});
```

### No app (Expo)

```ts
// [NOSSO, não testado] expo-web-browser já faz parte do Expo
import * as WebBrowser from "expo-web-browser";
import { supabase } from "@/lib/supabase";

export async function connectCoros(): Promise<string> {
  const { data, error } = await supabase.functions.invoke<{ url: string }>("coros-oauth-start");
  if (error || !data) return "error";
  const result = await WebBrowser.openAuthSessionAsync(data.url, "paceless://integrations/coros");
  if (result.type !== "success") return "cancelled";
  return new URL(result.url).searchParams.get("status") ?? "error";
}
```

### Cron: refresh e worker [padrão documentado do Supabase: pg_cron + pg_net + Vault]

```sql
-- fonte do padrão: https://supabase.com/docs/guides/functions/schedule-functions
select cron.schedule('coros-refresh', '15 3 * * *', $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name='functions_url') || '/coros-refresh',
    headers := jsonb_build_object('Authorization','Bearer '||(select decrypted_secret from vault.decrypted_secrets where name='cron_key')))
$$);

select cron.schedule('coros-worker', '*/2 * * * *', $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name='functions_url') || '/coros-worker',
    headers := jsonb_build_object('Authorization','Bearer '||(select decrypted_secret from vault.decrypted_secrets where name='cron_key')))
$$);
```

**`coros-refresh`** (não depende do comportamento exato do refresh, que é **a confirmar**):
- Seleciona conexões `active` com `expires_at < now() + interval '7 days'`.
- POST em `/oauth2/refresh-token` com `client_id`, `client_secret`, `refresh_token`, `grant_type=refresh_token`.
- Se `result === "0000"`: `expires_at` = `expires_in` ou agora + 30 dias; salva `access_token`/`refresh_token` novos se vierem (caso o refresh rotacione).
- Qualquer outro resultado: `needs_reauth`, e o app mostra "Reconectar COROS".

**`coros-worker`**:
- Reivindica até 20 linhas `pending` via RPC com `update ... set status='processing' ... for update skip locked ... returning`.
- Sem `coros_connections` para o `open_id`: marca `orphan`.
- Coleta URLs de FIT:
  ```ts
  const urls = [p.mode === 13 || p.mode === 14 ? null : p.fitUrl,
    ...(p.triathlonItemList ?? []).map((s) => s.fitUrl)].filter(Boolean);
  ```
- Sem URL: chama `GET /v2/coros/sport/detail/fit?token&openId&labelId&mode&subMode`.
- Só baixa se o host bater `/^https:\/\/([a-z0-9-]+\.)*coros\.com\//` (proteção SSRF, como no running-coach) e limita a 10 MB.
- Decodifica e faz upsert em `external_workouts`. Triatlo: pai com `source_id = labelId`, segmentos `labelId:idx` (ou como voltas).
- `duration_s`: fallback para `totalTimerTime` da sessão do FIT, ou `endTime - startTime`.
- Falha: `attempts++`; após 5 tentativas, `failed`.
- Jobs `backfill` usam `/v2/coros/sport/list` em blocos de 30 dias a partir de agora menos 88 dias; job `daily` consulta `/coros/daily/query` uma vez por dia.

### Decodificar FIT em Deno

```ts
// [NOSSO, não testado] pacote oficial da Garmin, funciona via npm: no Deno
import { Decoder, Stream } from "npm:@garmin/fitsdk";

const buf = new Uint8Array(await (await fetch(fitUrl)).arrayBuffer());
const decoder = new Decoder(Stream.fromByteArray(buf));
if (!decoder.isFIT()) throw new Error("not fit");
const { messages, errors } = decoder.read();
const records = messages.recordMesgs; // heartRate, enhancedAltitude, positionLat, ...
const session = messages.sessionMesgs?.[0]; // totalTimerTime, totalDistance, ...
```

Alternativa: `fit-file-parser`. Instalar qualquer biblioteca exige aprovação (regra do projeto).

## Riscos e pontos a confirmar

| Risco / ponto | Impacto | Mitigação |
|---|---|---|
| Aprovação negada ou demorada (sem critério nem prazo públicos) | Alto | Solicitar já; pedir tier beta/startup; plano B com agregador |
| Documentação privada; tudo aqui vem de repositórios de terceiros | Alto | Validar cada endpoint no sandbox ao receber o PDF |
| Host de produção `open.coros.com` **a confirmar** | Médio | `COROS_API_BASE` como segredo, sem host fixo |
| Caminho do token (`/oauth2/accesstoken` vs `/oauth2/token`) **a confirmar** | Baixo | Testar ambos no sandbox |
| Semântica do refresh (estende vs rotaciona; funciona após expirar?) **a confirmar** | Médio | Refresh proativo 7 dias antes; salvar tokens novos se vierem |
| Retentativas do webhook (quantas, por quanto tempo) **a confirmar** | Médio | Idempotência por `(open_id, label_id)`; gravar antes de responder |
| Tipos de evento enviados (só treinos?) **a confirmar** | Médio | Polling diário dos dados diários |
| Janela de 3 meses no histórico (e se vale para FIT) **a confirmar** | Médio | Backfill de 88 dias; comunicar ao usuário que só os últimos ~3 meses entram |
| Endpoints de detalhe/streams além do FIT (vitalera) **a confirmar** | Baixo | Começar pelo FIT |
| Campos exatos dos dados diários **a confirmar** | Médio | Pedir JSON de exemplo |
| Termos de Uso (IA, retenção, marca) não vistos | Alto | Não assinar sem o texto; pedir permissão de IA por escrito |
| Transferência internacional (China) e DPA (LGPD art. 33) | Alto | Perguntar hospedagem/DPA; citar na política de privacidade |
| Rate limit 1.000/min: por app ou por usuário **a confirmar** | Baixo | Tratar como por app; backoff em 429 |
| Campos do formulário (limites de caracteres, logos) vêm de um só repo | Baixo | Conferir no formulário real |
| Agregadores: Terra (preço histórico ~USD 399+/mês, **a confirmar**, informação antiga, polling, processador nos EUA); vitalera (preço não público, foco B2B clínico); Open Wearables (sem COROS) | Médio | Só como ponte temporária; cada um é mais um operador LGPD |

## Fontes

Oficiais (COROS, confirmar no navegador):
- https://support.coros.com/hc/en-us/articles/53181766856724-Partner-API-Access
- https://support.coros.com/hc/en-us/articles/17085887816340-Submit-an-API-Application
- https://support.coros.com/hc/en-us/articles/53181260265492-Connect-Your-Data
- https://support.coros.com/hc/en-us/articles/53181619102996-Build-on-COROS-MCP
- https://support.coros.com/hc/en-us/articles/50841795180948-Connect-Your-COROS-to-AI
- https://github.com/coroslab/coros-mcp

Código e documentação da comunidade:
- https://github.com/theodiablo/running-coach/blob/main/supabase/functions/coros-import/index.ts
- https://github.com/theodiablo/running-coach/blob/main/docs/integrations-coros.md
- https://github.com/c2corg/c2c_tracking/blob/master/src/server/coros/coros.api.ts
- https://github.com/c2corg/c2c_tracking/blob/master/src/server/coros/coros.service.ts
- https://github.com/c2corg/c2c_tracking/blob/master/src/server/coros/coros.controller.ts
- https://github.com/jimmykane/quantified-self/tree/master/functions/src/coros
- https://github.com/stacksjs/ts-health/blob/main/packages/health/src/drivers/coros.ts
- https://github.com/openathleteorg/openathlete
- https://github.com/r-follador/CubeTrek
- https://github.com/zhaochy1990/running/pull/559
- https://github.com/the-momentum/open-wearables/issues/1214
- https://github.com/soma-intelligence/open-health-sync/pull/189
- https://raw.githubusercontent.com/soma-intelligence/open-health-sync/main/docs/connectors/coros.md
- https://zff.dev/endurain-project/endurain/issues/662
- https://jsr.io/@pinta365/coros (API não oficial, não usar)

Agregadores e terceiros:
- https://nango.dev/docs/integrations/all/coros
- https://tryterra.co/integrations/coros
- https://docs-v2.vitalera.io/device-integrations/coros
- https://www.tredict.com/blog/coros_api_integration/
- https://www.athletedata.health/guides/coros-mcp-server
- https://the5krunner.com/2026/05/13/coros-mcp-ai-data/
- https://www.runnerspicks.com/blog/coros-mcp-connect-chatgpt-claude/
- https://forums.zwift.com/t/coros-integration/604861?page=2 (é a COROS pedindo acesso à API da Zwift; não serve como prazo de aprovação)

Supabase:
- https://supabase.com/docs/guides/functions/auth.md
- https://supabase.com/docs/guides/functions/function-configuration
- https://supabase.com/docs/guides/functions/schedule-functions
- https://vibe-eval.com/fix/supabase-edge-function-no-jwt/
- https://tessl.io/registry/skills/github/fernandezbaptiste/Skrillz/supabase-functions--supabase-functions
