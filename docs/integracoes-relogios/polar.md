# Polar

> Pesquisa feita em 2026-10-29, em 3 rodadas (pesquisa → revisão). Itens sem confirmação estão marcados como **a confirmar**. Plano geral em [`../relogios.md`](../relogios.md).

## Resumo

- **AccessLink API v3** é a API REST da Polar, que funciona na nuvem. O relógio sincroniza com o Polar Flow, o Polar avisa a nossa Edge Function por webhook e ela busca o treino: corridas com GPS, FC, zonas, arquivos FIT/TCX/GPX, além de atividade diária, sono, Nightly Recharge, FC contínua e dados físicos.
- **Polar BLE SDK** é um SDK nativo (Android/iOS) para ler o sensor em tempo real: FC, RR/PPI, ECG, ACC e PPG. É separado do AccessLink e só faz sentido para dados ao vivo durante a corrida (ex.: cinta H10).
- **Vale para o Paceless?** Sim. O cadastro é self-service, gratuito e **sem revisão manual aparente** (muito mais simples que a Garmin), e o uso comercial está liberado pela licença.
- **Recomendação:**
  1. Fase 1: AccessLink com webhook `EXERCISE` + reconciliação diária. A fonte canônica é o JSON com samples, e o FIT fica guardado cru no Storage.
  2. Fase 2 (opcional): FC ao vivo pelo **serviço BLE padrão de Heart Rate (0x180D)**, sem o SDK da Polar.
  3. O Polar BLE SDK só entra se precisarmos de ECG/PPI/ACC, via Expo Module próprio.

## Cadastro e burocracia

Responsável: **Pedro**. Custo: **zero hoje** (a cláusula 6 permite à Polar cobrar no futuro). Prazo estimado: **1 dia** (self-service, sem revisão conhecida; **a confirmar**).

### Passo a passo

1. **Criar uma conta Polar Flow da empresa** em https://flow.polar.com.
   - Use um e-mail alias da empresa (ex.: `integracoes@...`), nunca um e-mail pessoal. O client pertence a uma conta individual, e a doc não fala em transferir a posse.
   - Guarde a senha, o 2FA e a recuperação no gerenciador de senhas da empresa.
2. **Entrar em https://admin.polaraccesslink.com** com essa conta e criar um client. O formulário tem 4 abas (segundo o guia Open Wearables de 2026):
   1. **Contractual Information**
      - Razão social, endereço e país (Brasil).
      - Toggle "integrating on behalf of a client/third party": **desligado**.
      - Aceitar o *AccessLink Limited License Agreement*. **Salve um PDF ou print da página com a data** em `docs/integracoes-relogios/anexos/`.
   2. **Application Information**
      - Application Name: Paceless.
      - Business contact: e-mail compartilhado da empresa.
      - Description: seja honesto e completo. Exemplo: "App de coach de corrida com IA; importa treinos de corrida do usuário, com consentimento, para análise e geração de planos; os dados podem ser processados por um provedor de IA".
      - Application Web site (opcional).
      - **Authorization redirect URL**. Dá para cadastrar várias URLs: cadastre dev, staging e prod, ex.: `https://<proj>.supabase.co/functions/v1/polar-oauth-callback`.
      - Tipos de dados: Exercise, Daily activity, Physical information.
   3. **Check Information**: conferir e confirmar.
   4. **Credentials**: o **Client ID e o Secret aparecem uma única vez**. Copie direto para o gerenciador de senhas e passe ao dev para configurar `supabase secrets set POLAR_CLIENT_ID=... POLAR_CLIENT_SECRET=...`. **Nunca no app nem no `.env` do Expo.**
3. **Mandar um e-mail para b2bhelpdesk@polar.com** e arquivar a resposta em `docs/`. Perguntas:
   - (a) Existe revisão antes de produção? A cláusula 5.4 fala em "possible approval".
   - (b) Podemos enviar dados a um provedor de IA (LLM) para gerar coaching? E para treinar modelos?
   - (c) Existe DPA para LGPD/transferência internacional?
   - (d) Onde estão as Brand Guidelines (cláusula 3.1.5)? Podemos usar o logo?
   - (e) Existe limite de usuários?
   - (f) A posse de um client pode ser transferida, ou dá para adicionar mais admins?
4. **Documentos:** nenhum documento é exigido (nem CNPJ), mas use os dados oficiais da empresa.
5. **Pré-requisitos legais nossos:** política de privacidade pública (cláusula 3.1.4) cobrindo dados de saúde, Polar como fonte e o provedor de IA, e um encarregado/DPO com canal de contato (LGPD art. 41).

### Checklist do Pedro

- [ ] Conta Polar Flow criada com e-mail alias da empresa, com 2FA no gerenciador de senhas
- [ ] Client criado em admin.polaraccesslink.com com dados da empresa
- [ ] PDF/print da licença aceita, com data, salvo em `docs/`
- [ ] Redirect URLs de dev e prod cadastradas
- [ ] Client ID e Secret no gerenciador de senhas e repassados ao dev (Supabase secrets)
- [ ] E-mail com as perguntas (a)-(f) enviado para b2bhelpdesk@polar.com
- [ ] Resposta da Polar arquivada em `docs/`
- [ ] Política de privacidade publicada, com seções de dados de saúde, Polar e IA
- [ ] Encarregado (DPO) e e-mail `privacidade@` definidos

## Dados disponíveis

- **Exercícios (modelo não transacional, atual):**
  - `GET /v3/exercises`: lista os treinos enviados ao Flow nos **últimos 30 dias**. Os parâmetros `samples`, `zones` e `route` (true/false) incluem amostras, zonas e rota GPS.
  - `GET /v3/exercises/{id}`: um treino.
  - `GET /v3/exercises/{id}/fit`, `/tcx` e `/gpx`: arquivos.
  - Campos principais: `id`, `upload-time`, `device`, `start-time`, `start-time-utc-offset` (min), `duration` (ISO8601, ex.: `PT2H44M45S`), `calories`, `distance` (m), `heart-rate.{average,maximum}`, `training-load`, `sport`, `detailed-sport-info`, `has-route`, `running-index`, `training-load-pro` (cardio-load, muscle-load, perceived-load, user-rpe).
  - Samples: `[{ "sample-type", "recording-rate", data: "csv" }]`. Os tipos 0 = FC, 1 = velocidade, 2 = cadência, 3 = altitude e 10 = distância são **a confirmar**.
  - Rota: lista de `{latitude, longitude, time, altitude, satellites}`.
- **Modelo transacional (antigo):** `exercise-transactions` com commit. Está **DEPRECATED** para exercícios, atividade diária e dados físicos. Muitos repositórios e tutoriais ainda usam esse modelo, então não copie às cegas.
- **Outros:**
  - atividade diária e amostras de atividade (até 28 dias por consulta, dados de até 365 dias);
  - sono, Nightly Recharge, FC contínua, SleepWise, Cardio load, Elixir biosensing (janelas de 28 dias) e dados físicos.
- **Sem retroativo:** "Only exercises that have been uploaded to Flow after the user is registered with your client will be returned." O que foi sincronizado antes de conectar **não vem**.
  - O Open Wearables afirma que vem "everything available" ou 90 dias. Isso conflita com a doc oficial: **a confirmar** com uma conta real. Até lá, planejamos com 30 dias.
- **BLE SDK** (ao vivo): FC, RR/PPI, ECG (H10 a 130 Hz), ACC, PPG, gravação offline e atualização de firmware.
  - Dispositivos: H10, H9, Verity Sense, OH1, Polar 360/Loop, Ignite 3, Vantage V3, Grit X2 (Pro), Pacer (Pro) e M3.

## Autenticação e sincronização

### OAuth2 (Authorization Code)

1. O app chama a Edge Function `polar-oauth-start` com o JWT do usuário. A função grava um nonce em `oauth_states` e devolve a URL:
   `https://flow.polar.com/oauth2/authorization?response_type=code&client_id=...&redirect_uri=...&scope=accesslink.read_all&state=<nonce>`
2. O app abre com `WebBrowser.openAuthSessionAsync(url, "paceless://integrations/polar")`.
3. A Polar redireciona para `polar-oauth-callback`, que troca o code:
   - `POST https://polarremote.com/v2/oauth2/token`
   - Header: `Authorization: Basic base64(client_id:client_secret)`
   - Corpo form-urlencoded: `grant_type=authorization_code`, `code`, `redirect_uri`.
   - Resposta: `access_token`, `token_type`, `expires_in`, `x_user_id`.
   - O code vale **10 min** e é de uso único. **Reusar o code revoga todos os tokens.**
4. **Registrar o usuário (obrigatório):** `POST https://www.polaraccesslink.com/v3/users` com Bearer e corpo `{"member-id":"<uuid do usuário>"}`.
   - 200 = OK.
   - 403 = o usuário não aceitou os consentimentos do Flow. Mostre "Aceite os termos no Polar Flow e tente de novo", sem salvar a conexão.
   - 409 = já registrado. Trate como sucesso em reconexão.
5. A função guarda o token no Vault e responde 302 para `paceless://integrations/polar?ok=1`. **O token nunca volta para o app.**
   - Fallback: se o 302 falhar, devolver uma página HTML com o botão "Voltar ao app". No Android o redirecionamento está **a confirmar** (não testado).

### Token

- A doc diz: "Access tokens will not expire unless explicitly revoked". Mas a resposta de exemplo traz `expires_in: 31535999` (cerca de 1 ano).
- **Não existe refresh token.**
- Regra: guardar `expires_at` e tratar **qualquer 401 como "reconectar"** (`status='revoked'` + banner "Reconectar Polar" no app).
- **Não existe evento de desautorização.** A revogação feita pelo usuário no Flow só aparece como 401 na próxima chamada.

### Tipos de autenticação

- Bearer do usuário: `/v3/users/**` e `/v3/exercises`.
- Basic (client_id:secret): `/v3/webhooks` e `/v3/notifications`.

### Webhook (push)

- **Criar:** `POST /v3/webhooks` com `{"events":["EXERCISE"],"url":".../polar-webhook"}`.
  - 201 = criado. 409 = já existe (**só 1 webhook por client**).
  - Na criação a Polar manda um **PING** e exige 200, por isso a função precisa estar deployada antes.
  - O 201 devolve o `signature_secret_key` **uma única vez**.
- **Headers de cada entrega:**
  - `Polar-Webhook-Event`: EXERCISE, SLEEP, CONTINUOUS_HEART_RATE, SLEEP_WISE_CIRCADIAN_BEDTIME, SLEEP_WISE_ALERTNESS, ACTIVITY_SUMMARY, PHYSICAL_INFORMATION ou PING.
  - `Polar-Webhook-Signature`: HMAC-SHA256 em **hex**, confirmado pelo exemplo Java oficial (`toHexString`). Os bytes exatos assinados (corpo cru) são **a confirmar** com uma entrega real.
- **Payload:** `{event, user_id, entity_id, timestamp, url}`.
- **Gestão (Basic):**

| Ação | Método + caminho |
|---|---|
| Consultar | `GET /v3/webhooks` |
| Ativar | `POST /v3/webhooks/activate` |
| Desativar | `POST /v3/webhooks/deactivate` |
| Atualizar | `PATCH /v3/webhooks/{webhook-id}` (URL nova = novo PING) |
| Apagar | `DELETE /v3/webhooks/{webhook-id}` |

- **Desativação automática após 7 dias de falhas.** Reativar exige PING com 200.
- Trocar o secret = apagar e recriar o webhook.

### Sincronização no Paceless

- O webhook responde 200 rápido e enfileira (pgmq). Um worker busca o treino.
- Cron diário `polar-reconcile`: para cada conexão ativa, `GET /v3/exercises`, compara com os `runs` e enfileira o que falta.
- Cron de hora em hora: verifica `active` do webhook, reativa, alerta e roda o reconcile.
- **Risco:** se webhook e reconcile ficarem fora por mais de 30 dias, as corridas daquele intervalo se **perdem de vez**. Alertar após 3 dias sem reconcile.

## Limites e termos de uso

### Rate limit

- Janela curta (15 min): **500 + 20 × usuários**. Janela longa (24 h): **5000 + 100 × usuários**.
- Headers `RateLimit-Usage`, `RateLimit-Limit` e `RateLimit-Reset`, cada um com 2 valores (curta, longa). Estourar retorna 429.
- Requisições que estouram a janela curta contam na longa.

### Licença AccessLink

Fonte: https://www.polar.com/en/legal/polar-api-agreement. O PDF antigo dá 404.

- **2.1:** licença royalty-free, mundial, não exclusiva. **Uso comercial permitido.**
- **2.2:**
  - proibido criar serviço "similar to or competing with Polar Ecosystem";
  - proibido revender, sublicenciar ou comercializar os dados;
  - proibida engenharia reversa.
- **2.3:** proibido scraping e **proibido teste de carga sem aprovação**.
- **3.1.1:** dados só com autorização explícita do membro, e **nada para terceiros sem permissão explícita**. Um provedor de IA é terceiro, então o consentimento tem que citá-lo.
- **3.1.4 / 3.1.6:** política de privacidade obrigatória, e o usuário tem que ser informado da coleta e do armazenamento.
- **3.1.5:** creditar a Polar como fonte, seguindo as Brand Guidelines (não encontradas; **a confirmar**).
- **7.4:** marcas da Polar em marketing só com consentimento escrito.
- **3.3 / 8.4:** remover acesso e tokens ao fim da relação, e apagar os dados na rescisão.
- **4.2:** a Polar pode mudar os termos a qualquer momento.
- **6:** gratuito hoje, mas pode passar a ser cobrado.
- **8.2:** rescisão com 30 dias de aviso. **8.3:** a Polar pode suspender o acesso "for any or no reason, with immediate effect" (risco de negócio).
- **5.4:** menciona uma "possible approval" (**a confirmar**).
- **13.7:** lei finlandesa, com arbitragem em Oulu, em inglês.

### IA

- A licença **não fala em IA nem em treino de modelos**.
- Usar os dados como contexto do coach de IA parece aceitável com consentimento explícito (3.1.1). **A confirmar por escrito** (pergunta b).
- **Não treinar modelos** com dados da Polar sem autorização escrita.

### Marca (decisão provisória)

- Botão "Conectar com Polar" e o texto "Importado do Polar Flow" em cada treino.
- **Sem logo** até termos consentimento escrito.

### LGPD

- FC e treino são **dados de saúde**, ou seja, dados pessoais sensíveis (art. 11).
- Pedir consentimento específico e destacado (art. 11, I) **antes do OAuth**, citando a Polar, os tipos de dados e o provedor de IA.
- Fluxo dos dados: Polar (Finlândia/UE, GDPR) → Supabase (preferir `sa-east-1`) → provedor de IA (provavelmente EUA).
  - A transferência internacional precisa de base legal: art. 33 + Res. CD/ANPD 19/2024 (cláusulas-padrão) ou consentimento específico (art. 33, VIII).
- O Paceless é **controlador independente**; a Polar não é nossa operadora. DPA **a confirmar** (pergunta c).
- **Retenção (decisão):**
  - dados importados: enquanto a conta e a conexão existirem;
  - após desconectar: apagar em até 30 dias;
  - FIT cru: 12 meses;
  - logs com `polar user_id`: 90 dias.
- **Direitos do titular:**
  - exportação inclui `runs` com provider='polar';
  - exclusão segue a ordem `DELETE /v3/users/{id}` → Vault → conexão → runs/samples/rota/Storage → `run_sources`;
  - registrar cada pedido (art. 37).
- ANPD Res. CD/ANPD 2/2022 dá alívio para empresa pequena, mas o canal de contato continua obrigatório.

### Polar SDK License (BLE)

- **3.1:** pode distribuir o código objeto (lojas OK), só para trocar dados entre produtos Polar e o nosso app.
- **3.2:** nada de uso médico ou crítico. Evitar alegações médicas.
- **4:** sem nome ou marca da Polar sem consentimento.
- **7:** AS IS. **8:** responsabilidade limitada a 50 EUR.
- **10:** rescisão com 90 dias de aviso.
- **11:** nós indenizamos a Polar.
- **12.6:** lei finlandesa.
- Manter o aviso de licença na tela de licenças de terceiros.

### Lojas

- A API não impõe regras de loja.
- Apple e Google exigem política de privacidade cobrindo dados de saúde.

## Arquitetura no Paceless

```
App Expo ──(JWT)──> polar-oauth-start ──> URL de autorização (nonce em oauth_states)
App ──openAuthSessionAsync──> flow.polar.com ──> polar-oauth-callback
     polar-oauth-callback: troca code → token, POST /v3/users, Vault, 302 paceless://
Polar ──webhook──> polar-webhook (--no-verify-jwt): HMAC, valida, pgmq.send
pg_cron (1 min) ──> polar-worker: lê fila, busca JSON + FIT, grava runs/samples/route
pg_cron (diário) ──> polar-reconcile   |   pg_cron (1 h) ──> polar-webhook-health
App ──> polar-disconnect: DELETE /v3/users/{id} + limpeza LGPD
```

### Edge Functions

- `polar-oauth-start`
- `polar-oauth-callback`
- `polar-webhook`
- `polar-worker`
- `polar-reconcile`
- `polar-webhook-health`
- `polar-disconnect`

### Secrets

- `POLAR_CLIENT_ID`
- `POLAR_CLIENT_SECRET`
- `POLAR_REDIRECT_URI`
- `POLAR_WEBHOOK_SIGNATURE_SECRET`

### Tabelas

- `oauth_states(nonce, user_id, provider, created_at)`: RLS sem policies, ou seja, só o service role acessa. Cron apaga os nonces com mais de 10 min.
- `wearable_connections(user_id, provider, provider_user_id, token_secret_id, expires_at, status)`: o token fica no **Vault**; a tabela guarda só o id do secret.
- `runs(id, user_id, provider, external_id, started_at, duration_s, distance_m, hr_avg, hr_max, calories, device, source_payload jsonb)` com `unique(provider, external_id)` (as entregas chegam duplicadas).
- `run_samples(run_id, t_offset_s, hr, speed, cadence, altitude, distance)`, com tempo = índice × recording-rate.
- `run_route`: jsonb compacto, ou PostGIS `LineString` se a extensão já existir.
- `external_activities(provider, external_id, sport, start, duration, calories, hr_avg)`: treinos que não são corrida, só como contexto de carga.
- `run_sources(run_id, provider, external_id)`: dedup entre provedores.
  - Mesma pessoa, início com diferença < 120 s e duração com diferença < 5% conta como duplicata.
  - Prioridade: provedor nativo > Strava.
- Storage: `polar/{user}/{id}.fit` (cru, para reprocessar depois).

### Decisões

- **JSON é a fonte canônica.** Não precisa de lib nova, e o custo de CPU é só um `JSON.parse`. O limite de Edge Function é cerca de 2 s de CPU e 150 MB (**a confirmar** na página de limites).
- **FIT fica guardado sem parse**, e o parse é opcional mais tarde.
- **Filtro de esporte no worker:**
  - `detailed-sport-info` ∈ {RUNNING, ROAD_RUNNING, TRAIL_RUNNING, TREADMILL_RUNNING, TRACK_AND_FIELD_RUNNING, ULTRARUNNING_RUNNING} ou `sport == 'RUNNING'` vira `runs`; o resto vai para `external_activities`.
  - A lista exata é **a confirmar**: logar os valores distintos nas primeiras semanas.

### UX

- Antes de conectar, mostrar os pré-requisitos:
  - conta Polar Flow;
  - dispositivo Polar sincronizando com o Flow;
  - "só treinos sincronizados depois da conexão serão importados".
- Estado vazio: "Conectado. Seus próximos treinos sincronizados no Polar Flow aparecerão aqui."

### BLE ao vivo (fase 2)

- Opção (a), recomendada: FC pelo serviço GATT padrão 0x180D (H10/H9/Verity) com `react-native-ble-plx`. **A lib nova precisa de aprovação**, e um dev build é obrigatório.
- Opção (b): Expo Module próprio sobre o Polar BLE SDK.
  - Versão 8.5.0 (2026-10-23), Android **minSdk 26** (o "33" do README está desatualizado), iOS 14+.
  - A 9.0.0 deve subir para iOS 15+.
  - A API usa RxJava/RxSwift.
- Não existe pacote React Native oficial. O `rn-polar-ble-sdk` não é confiável, e o `polar` (Flutter) serve só de referência.

## Exemplos de código

Os snippets abaixo são **adaptados da doc oficial, do exemplo Python oficial e do polar-mcp-server, e não foram executados**. Por ser markdown, os comentários são permitidos aqui; o código real do projeto não terá comentários.

### Tipos

Fonte: https://www.polar.com/accesslink-api/

```ts
export type PolarEvent =
  | "EXERCISE" | "SLEEP" | "CONTINUOUS_HEART_RATE" | "SLEEP_WISE_CIRCADIAN_BEDTIME"
  | "SLEEP_WISE_ALERTNESS" | "ACTIVITY_SUMMARY" | "PHYSICAL_INFORMATION" | "PING";
export type PolarNotification = {
  event: Exclude<PolarEvent, "PING">; user_id: number; entity_id: string; timestamp: string; url: string;
};
export type PolarTokenResponse = { access_token: string; token_type: "bearer"; expires_in: number; x_user_id: number };
export type PolarExercise = {
  id: string; "upload-time": string; device: string; "start-time": string; "start-time-utc-offset": number;
  duration: string; calories?: number; distance?: number; "heart-rate"?: { average: number; maximum: number };
  sport: string; "detailed-sport-info"?: string; "has-route": boolean; "training-load"?: number;
};
```

### OAuth callback (`supabase/functions/polar-oauth-callback/index.ts`)

Fontes: doc oficial e https://github.com/polarofficial/accesslink-example-python

```ts
const CLIENT_ID = Deno.env.get("POLAR_CLIENT_ID")!;
const CLIENT_SECRET = Deno.env.get("POLAR_CLIENT_SECRET")!;
const REDIRECT_URI = Deno.env.get("POLAR_REDIRECT_URI")!;

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) return new Response("missing code", { status: 400 });

  // valida e consome o nonce (anti-CSRF); retorna o user_id do Supabase
  const appUserId = await consumeState(state);
  if (!appUserId) return new Response("invalid state", { status: 400 });

  const tokenRes = await fetch("https://polarremote.com/v2/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json;charset=UTF-8",
    },
    body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: REDIRECT_URI }),
  });
  if (!tokenRes.ok) return new Response("token error", { status: 502 });
  const t = (await tokenRes.json()) as PolarTokenResponse;

  const reg = await fetch("https://www.polaraccesslink.com/v3/users", {
    method: "POST",
    headers: { Authorization: `Bearer ${t.access_token}`, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ "member-id": appUserId }),
  });
  if (reg.status === 403) return Response.redirect("paceless://integrations/polar?error=consent", 302);
  if (!reg.ok && reg.status !== 409) return new Response("register error", { status: 502 });

  // service role: grava o token no Vault via função security definer
  await supabase.rpc("store_polar_token", {
    p_user: appUserId, p_polar_id: String(t.x_user_id), p_token: t.access_token, p_expires: t.expires_in,
  });
  return Response.redirect("paceless://integrations/polar?ok=1", 302);
});
```

App (Expo):

```ts
import * as WebBrowser from "expo-web-browser";
const { data } = await supabase.functions.invoke<{ url: string }>("polar-oauth-start");
const result = await WebBrowser.openAuthSessionAsync(data!.url, "paceless://integrations/polar");
// result.type === "success" && result.url contém ?ok=1 ou ?error=...
```

### Webhook com HMAC hex, PING condicional e comparação em tempo constante

Fontes: exemplo Java da doc oficial (`toHexString`) e https://github.com/olimart/polar-mcp-server

```ts
import { timingSafeEqual } from "jsr:@std/crypto/timing-safe-equal";
const SECRET = Deno.env.get("POLAR_WEBHOOK_SIGNATURE_SECRET") ?? "";
const enc = new TextEncoder();
const EVENTS = ["EXERCISE", "SLEEP", "CONTINUOUS_HEART_RATE", "SLEEP_WISE_CIRCADIAN_BEDTIME",
  "SLEEP_WISE_ALERTNESS", "ACTIVITY_SUMMARY", "PHYSICAL_INFORMATION"];

async function hmacHex(body: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(body)));
  return [...sig].map((b) => b.toString(16).padStart(2, "0")).join("");
}

const isNotification = (n: unknown): n is PolarNotification => {
  if (typeof n !== "object" || n === null) return false;
  const o = n as Record<string, unknown>;
  return typeof o.user_id === "number" && typeof o.entity_id === "string" && typeof o.url === "string"
    && typeof o.event === "string" && EVENTS.includes(o.event)
    && new URL(o.url).host === "www.polaraccesslink.com"; // evita SSRF
};

Deno.serve(async (req) => {
  const raw = await req.text();
  const event = req.headers.get("Polar-Webhook-Event");
  // bootstrap: antes do secret existir, só o PING de criação é aceito
  if (!SECRET) return event === "PING" ? new Response("ok") : new Response("not configured", { status: 503 });

  const header = req.headers.get("Polar-Webhook-Signature");
  // decisão: PING sem header é aceito (não acessa dados); PING com assinatura errada é rejeitado
  if (event === "PING" && header === null) return new Response("ok");

  const got = (header ?? "").toLowerCase();
  const exp = await hmacHex(raw);
  if (got.length !== exp.length || !timingSafeEqual(enc.encode(got), enc.encode(exp))) {
    return new Response("bad sig", { status: 401 });
  }
  if (event === "PING") return new Response("ok");

  const n: unknown = JSON.parse(raw);
  if (!isNotification(n)) return new Response("bad payload", { status: 400 });
  await supabase.rpc("enqueue_polar", { msg: n }); // wrapper security definer sobre pgmq.send
  return new Response("ok");
});
```

Deploy: `supabase functions deploy polar-webhook --no-verify-jwt`. Se o hex falhar na primeira entrega real, logue o header e teste base64.

### Registrar o webhook (script único, feito pelo dev)

Fonte: doc oficial

```bash
curl -X POST https://www.polaraccesslink.com/v3/webhooks \
  -u "$POLAR_CLIENT_ID:$POLAR_CLIENT_SECRET" -H 'Content-Type: application/json' \
  -d '{"events":["EXERCISE"],"url":"https://<proj>.supabase.co/functions/v1/polar-webhook"}'
# guarde data.signature_secret_key (aparece só uma vez):
supabase secrets set POLAR_WEBHOOK_SIGNATURE_SECRET=...
```

### Worker pgmq (`polar-worker`, cron a cada minuto)

Fonte: adaptação própria, baseada em https://supabase.com/docs/guides/queues

```ts
Deno.serve(async () => {
  const { data: msgs } = await supabase.rpc("read_polar", { n: 10, vt: 60 });
  for (const m of msgs ?? []) {
    const n = m.message as PolarNotification;
    const { data } = await supabase.rpc("get_polar_token", { p_polar_id: String(n.user_id) });
    const row = data?.[0];
    if (!row || n.event !== "EXERCISE") { await ack(m.msg_id); continue; }

    const base = `https://www.polaraccesslink.com/v3/exercises/${n.entity_id}`;
    const headers = { Authorization: `Bearer ${row.token}`, Accept: "application/json" };
    const r = await fetch(`${base}?samples=true&route=true&zones=true`, { headers });
    if (r.status === 401) { await markRevoked(row.user_id); await ack(m.msg_id); continue; }
    if (r.status === 429) break;           // respeita o rate limit
    if (!r.ok) continue;                   // volta à fila após o visibility timeout
    const ex = (await r.json()) as PolarExercise;
    if (isRun(ex)) {
      await saveRun(row.user_id, ex);      // upsert idempotente em unique(provider, external_id)
      const fit = await fetch(`${base}/fit`, { headers: { Authorization: `Bearer ${row.token}`, Accept: "*/*" } });
      if (fit.ok) await storeRawFit(row.user_id, ex.id, new Uint8Array(await fit.arrayBuffer()));
    } else {
      await saveExternalActivity(row.user_id, ex);
    }
    await ack(m.msg_id);
  }
  return new Response("ok");
});
```

Mensagens com `read_ct` alto vão para a DLQ.

### Saúde do webhook (cron de hora em hora)

Fonte: doc oficial, seção Webhooks

```ts
const basic = btoa(`${Deno.env.get("POLAR_CLIENT_ID")}:${Deno.env.get("POLAR_CLIENT_SECRET")}`);
const r = await fetch("https://www.polaraccesslink.com/v3/webhooks", {
  headers: { Authorization: `Basic ${basic}`, Accept: "application/json" },
});
const body = (await r.json()) as { data: { id: string; events: string[]; url: string; active: boolean }[] };
if (!body.data?.[0]?.active) {
  await fetch("https://www.polaraccesslink.com/v3/webhooks/activate", { method: "POST", headers: { Authorization: `Basic ${basic}` } });
  await alertTeam("polar webhook inactive");
  await runReconcile(); // cobre o buraco (janela de 30 dias)
}
```

### SQL: estado OAuth, conexão e token no Vault

Fontes: https://supabase.com/docs/guides/database/vault e o linter do Supabase (`search_path=''`)

```sql
create table public.oauth_states (
  nonce text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('polar')),
  created_at timestamptz not null default now()
);
alter table public.oauth_states enable row level security;

create table public.wearable_connections (
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  provider_user_id text not null,
  token_secret_id uuid not null,
  expires_at timestamptz,
  status text not null default 'active' check (status in ('active','revoked')),
  created_at timestamptz not null default now(),
  primary key (user_id, provider),
  unique (provider, provider_user_id)
);
alter table public.wearable_connections enable row level security;
create policy own_read on public.wearable_connections for select using (auth.uid() = user_id);

create or replace function public.store_polar_token(p_user uuid, p_polar_id text, p_token text, p_expires int)
returns void language plpgsql security definer set search_path = '' as $$
declare sid uuid; nm text := 'polar_token_' || p_user::text;
begin
  select id into sid from vault.secrets where name = nm;
  if sid is null then
    sid := vault.create_secret(p_token, nm);
  else
    perform vault.update_secret(sid, p_token);
  end if;
  insert into public.wearable_connections(user_id, provider, provider_user_id, token_secret_id, expires_at, status)
  values (p_user, 'polar', p_polar_id, sid, now() + make_interval(secs => p_expires), 'active')
  on conflict (user_id, provider) do update
    set provider_user_id = excluded.provider_user_id, token_secret_id = excluded.token_secret_id,
        expires_at = excluded.expires_at, status = 'active';
end $$;

create or replace function public.get_polar_token(p_polar_id text)
returns table(user_id uuid, token text) language sql security definer set search_path = '' as $$
  select c.user_id, s.decrypted_secret from public.wearable_connections c
  join vault.decrypted_secrets s on s.id = c.token_secret_id
  where c.provider = 'polar' and c.provider_user_id = p_polar_id and c.status = 'active';
$$;

revoke all on function public.store_polar_token(uuid,text,text,int) from public, anon, authenticated;
grant execute on function public.store_polar_token(uuid,text,text,int) to service_role;
revoke all on function public.get_polar_token(text) from public, anon, authenticated;
grant execute on function public.get_polar_token(text) to service_role;

create or replace function public.enqueue_polar(msg jsonb)
returns bigint language sql security definer set search_path = '' as $$
  select pgmq.send('polar_events', msg);
$$;
revoke all on function public.enqueue_polar(jsonb) from public, anon, authenticated;
grant execute on function public.enqueue_polar(jsonb) to service_role;
```

### Parse do FIT (opcional, **não testado**, precisa de aprovação da lib)

Fonte: https://www.npmjs.com/package/@garmin/fitsdk

```ts
import { Decoder, Stream } from "npm:@garmin/fitsdk@21"; // fixar versão exata
const decoder = new Decoder(Stream.fromByteArray(bytes));
if (!decoder.isFIT()) throw new Error("not fit");
const { messages } = decoder.read({ convertDateTimesToDates: true, applyScaleAndOffset: true });
const records = messages.recordMesgs ?? []; // positionLat/Long em semicírculos: graus = v * 180 / 2**31
```

### Desconectar

Fonte: doc oficial, seção Users

```ts
await fetch(`https://www.polaraccesslink.com/v3/users/${polarUserId}`, {
  method: "DELETE", headers: { Authorization: `Bearer ${token}` },
}); // 204: token revogado
// depois: apagar o secret do Vault, a conexão, runs/samples/rota/Storage e run_sources
```

## Riscos e pontos a confirmar

- **Suspensão imediata pela Polar** (cláusula 8.3), mudança de termos (4.2) e cobrança futura (6). Mitigação: não depender só da Polar e ter outros provedores.
- **Revisão ou aprovação antes de produção** (cláusula 5.4): **a confirmar** com a Polar.
- **IA:** permissão para enviar dados ao LLM e para treinar modelos: **a confirmar** por escrito.
- **DPA / LGPD:** **a confirmar**.
- **Brand Guidelines e uso de logo:** **a confirmar**.
- **Bus factor:** o client pertence a uma conta Flow. Se ela se perder, todos os usuários precisam reconectar. A transferência de posse é **a confirmar**.
- **Janela de 30 dias, sem retroativo:** corridas anteriores à conexão não vêm, e mais de 30 dias de pane significa perda. O dado do Open Wearables (90 dias, "everything") é **a confirmar** com conta real.
- **Assinatura:** hex confirmado pela doc, mas os bytes assinados e se o PING vai assinado são **a confirmar** na primeira entrega.
- **Códigos de `sample-type`** e o enum de `detailed-sport-info`: **a confirmar** (trecho da doc ainda não lido).
- **302 para `paceless://` no Android** (Custom Tabs): **a confirmar** em dev build. Plano B: App Link/universal link em domínio próprio.
- **Limites de Edge Function** (CPU 2 s, 150 MB): **a confirmar** na página oficial.
- **`pgmq_public` exposto via PostgREST:** não verificado no projeto; usar os wrappers `enqueue_polar`/`read_polar`.
- **`vault.update_secret`:** testar na versão de Postgres do projeto.
- **Duplicatas:** a Polar entrega em duplicata. Resolvido com `unique(provider, external_id)`.
- **Libs novas** (`react-native-ble-plx`, `@garmin/fitsdk`): precisam de aprovação.
- **Confusão de busca:** "Polar webhooks" costuma retornar o **Polar.sh** (billing, Standard Webhooks, base64), que **não tem relação** com o AccessLink. Não usar as libs `standardwebhooks` nem `polar_express`.

## Fontes

- Doc oficial AccessLink v3: https://www.polar.com/accesslink-api/
- Portal admin: https://admin.polaraccesslink.com
- Polar Flow: https://flow.polar.com
- Licença AccessLink: https://www.polar.com/en/legal/polar-api-agreement
- PDF antigo (404 em 2026-10-29): https://www.polar.com/sites/default/files/static/ACL_Ltd_License_Agreement.pdf
- Excertos (Law Insider, antigos): https://lawinsider.com/contracts/8ClYmYHuNpX, https://lawinsider.com/dictionary/polar-ecosystem
- Exemplo oficial em Python (MIT): https://github.com/polarofficial/accesslink-example-python
- Polar BLE SDK: https://github.com/polarofficial/polar-ble-sdk
- Releases: https://github.com/polarofficial/polar-ble-sdk/releases e https://api.github.com/repos/polarofficial/polar-ble-sdk/releases
- build.gradle (minSdk 26): https://github.com/polarofficial/polar-ble-sdk/blob/master/sources/Android/android-communications/library/build.gradle
- Polar SDK License: https://raw.githubusercontent.com/polarofficial/polar-ble-sdk/master/Polar_SDK_License.txt
- polar-mcp-server (TS, Cloudflare Workers): https://github.com/olimart/polar-mcp-server
- Open Wearables:
  - https://github.com/the-momentum/open-wearables
  - https://openwearables.io/docs/providers/polar-api-integration.md
  - https://openwearables.io/docs/api-reference/guides/provider-webhook-subscriptions.md
  - https://openwearables.io/blog/open-wearables-0-5-2-polar-webhooks-sport-type-expansion-hrv-score-integrity
- hass-polar (Home Assistant): https://github.com/Aohzan/hass-polar
- rn-polar-ble-sdk (comunidade, não confiável): https://cdn.jsdelivr.net/npm/rn-polar-ble-sdk@1.0.7/README.md
- Flutter `polar` (referência): https://pub.dev/packages/polar/example
- react-native-cycling-sensors (referência BLE): https://github.com/RespectableThieves/react-native-cycling-sensors
- Supabase:
  - limites de Edge Functions: https://supabase.com/docs/guides/functions/limits
  - Vault: https://supabase.com/docs/guides/database/vault
  - Queues: https://supabase.com/docs/guides/queues
- Garmin FIT SDK (JS): https://www.npmjs.com/package/@garmin/fitsdk
- Para não confundir (Polar.sh, outro produto): https://docs.polar.sh/developers/webhooks, https://polar-express.hexdocs.pm/PolarExpress.Webhook.html
