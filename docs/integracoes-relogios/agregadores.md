# Agregadores de wearables e Strava API

Data da pesquisa: 29/10/2026 (três rodadas de pesquisa e revisão). Plano geral: `docs/relogios.md`.

Legenda das fontes: **[OFICIAL]** = doc ou página do próprio fornecedor; **[FÓRUM-STRAVA]** = communityhub.strava.com (plataforma do Strava, mas os posts são de devs); **[TERCEIRO]** = blog, imprensa ou fórum; **[VIÉS]** = autor vende produto concorrente; **a confirmar** = não verificado em fonte primária.

## Conclusão geral (leia primeiro)

1. **Agregador não é atalho para o Strava.** É muito provável que a API Policy do Strava (vigente desde 01/06/2026) proíba passar dados do Strava por "abstraction layer / integration-platform-as-a-service" (§5.16). O Strava não confirmou isso e o texto oficial não foi lido (**a confirmar**). Se integrarmos o Strava, a integração tem que ser direta.
2. **É muito provável que o Strava proíba usar os dados dele em IA** (§5.3) [TERCEIRO/VIÉS + FÓRUM-STRAVA, **a confirmar**]. Como o Paceless tem coach de IA, o Strava fica como **upload-only**, para exportar a corrida feita no app, e não serve de fonte de dados para o coach.
3. **A Garmin permite IA com condições.** O Connect Developer Program Agreement, §15.10, exige consentimento explícito e uma "AI transparency statement" na política de privacidade [TERCEIRO/VIÉS Sahha, **a confirmar no texto da Garmin**].
4. **Os agregadores pagos começam em US$ 299 a 499/mês para 500 a 1.000 usuários.** O ganho é tempo de engenharia, não custo.
5. **Recomendação:** integração direta (Garmin, Polar, Coros) em Edge Functions do Supabase, usando o **Open Wearables (MIT) como código de referência**, não como servidor. Se o prazo apertar, a **Terra** é o agregador mais bem documentado. A **Thryve** é a opção com hospedagem na UE.

### Comparativo rápido

| Fornecedor | Preço de entrada | Usuários | Residência | Fonte do preço |
|---|---|---|---|---|
| Terra | US$ 399/mês (anual) ou 499 (mensal) | ~500 fontes | não declarada | [OFICIAL] |
| ROOK | US$ 399/mês (Core) | 750 ativos | não declarada | [OFICIAL] |
| Thryve | €499/mês (Start Up) | 500 | Alemanha | [OFICIAL] |
| Sahha | US$ 299/mês (anual) | 1.000 | não declarada | [TERCEIRO], **a confirmar** |
| Spike | a partir de US$ 450/mês | n/d | n/d | [TERCEIRO/VIÉS], **a confirmar** |
| Junction (ex-Vital) | US$ 0,50/usuário, mínimo US$ 300 | n/d | n/d | página antiga, **a confirmar** |
| Open Wearables | grátis (MIT), self-hosted | sem limite | quem hospeda decide | [OFICIAL] |

---

# Terra

## Resumo

- API de saúde e fitness que conecta cerca de 90 fontes nuvem-a-nuvem (Garmin, Polar, Coros, Suunto, Wahoo etc.). Apple Health e Health Connect entram pelo Mobile SDK.
- A Terra faz o OAuth com o provedor e entrega os dados normalizados por webhook.
- **Para o Paceless:** é o melhor agregador se quisermos lançar Garmin e Polar rápido sem fazer o cadastro em cada provedor. Acima de 500 fontes ativas, o custo sobe para cerca de US$ 1 por fonte por mês.
- **Recomendação:** é o plano B da integração direta. Só contratar depois de ter o DPA com as cláusulas ANPD.

## Cadastro e burocracia

- **Onde:** https://tryterra.co (dashboard). Plano **Quick Start**: US$ 399/mês no anual ou US$ 499/mês no mensal [OFICIAL tryterra.co/pricing]. **Não existe free tier.**
- **Quem:** Pedro, com a conta da empresa (e-mail corporativo dedicado, ex. dev@dominio) e o CNPJ como entidade.
- **Pagamento:** USD no cartão PJ internacional.
  - O IOF sobre cartão no exterior teve mudanças em 2025 (3,38% em 2025, **a confirmar a alíquota vigente**).
  - Se a cobrança for por fatura ao CNPJ, pode haver retenção de impostos sobre serviço importado (IRRF, CIDE, PIS/COFINS-importação). Falar com o contador.
- **Documentos:** política de privacidade, nome do encarregado (DPO), descrição do fluxo (Supabase + Edge Functions e região do projeto) e respostas ao questionário de segurança.
- **Quem assina o DPA:** o representante legal do CNPJ, como **controlador**.
- **Prazo:** não divulgado (**a confirmar**).

Checklist:
- [ ] Pedir trial ou demo ao comercial.
- [ ] Perguntar se o **DPA assinado** existe no Quick Start ou só no Enterprise (a tabela lista "Signed BAA (data protection agreement)" como item do Enterprise).
- [ ] Pedir o aceite das **cláusulas-padrão da ANPD** (Res. CD/ANPD 19/2024, anexo II) como anexo do contrato.
- [ ] Pedir a lista de suboperadores, a região de hospedagem e o relatório SOC 2.
- [ ] Perguntar se a tela OAuth da Garmin/Polar mostra "Terra" ou "Paceless".
- [ ] Perguntar se a taxa do Garmin Connect Developer Program (reaberto em 21/10/2026) é repassada ao cliente.
- [ ] Perguntar se o Coros entra no Quick Start (hoje ele aparece no add-on Planned Workouts, US$ 99/mês + uso).
- [ ] Configurar o webhook no dashboard (Connections/Destinations → Webhook) e copiar o signing secret. Os passos exatos do painel são **a confirmar**.
- [ ] Atualizar a política de privacidade: nomear a Terra, a transferência internacional e o consentimento destacado para dado de saúde.

## Dados disponíveis

- Webhooks dos tipos `activity`, `daily`, `sleep` e `body`. A atividade traz amostras de FC, posição GPS (`position_data`) e distância.
- O schema normalizado está em https://docs.tryterra.co/reference/health-and-fitness-api/openapi-spec. **Os campos não foram extraídos (pendente).**

## Autenticação e sincronização

- **Sessão do widget** [OFICIAL]:
  - `POST https://access.tryterra.co/api/widget/session`, com os headers `dev-id`, `x-api-key` e `Content-Type: application/json`.
  - Body (todos os campos opcionais): `reference_id`, `providers` (ex. `"GARMIN,POLAR"`), `auth_success_redirect_url` e `auth_failure_redirect_url`.
  - Resposta 201: `session_id`, `url`, `status` e `expires_in: 86400`.
  - O endpoint `/v2/auth/generateWidgetSession` é **legado**. Criar uma sessão nova a cada clique e não guardar a URL.
- **Eventos de autenticação** [OFICIAL]:
  - `auth`: traz `user{user_id, reference_id, provider, scopes, active, ...}`. Gravar `external_id = user.user_id` e `user_id = reference_id`.
  - `user_reauth` (`status:"warning"`): traz `old_user` e `new_user`. Trocar o id antigo pelo novo. **Usar sempre o uuid do Supabase como `reference_id`**; se ele mudar, o usuário Terra antigo fica órfão.
  - `deauth`: traz um único `user`. Remover a conexão e purgar os dados.
- **Assinatura do webhook** [OFICIAL]:
  - Header `terra-signature: t=<ts>,v1=<hex>`.
  - O valor assinado é `HMAC-SHA256(secret, t + "." + rawBody)`, comparado em tempo constante e usando o body cru.
  - Ignorar esquemas diferentes de `v1` (proteção contra downgrade).
  - A unidade de `t` não é declarada. O exemplo da doc tem 10 dígitos, ou seja, segundos (**a confirmar com um payload real no Payload History**).
- **Retries e circuit breaker** [OFICIAL]:
  - A Terra espera 8 s pela resposta e faz 10 tentativas com backoff a partir de 30 s (janela de ~8 h). Depois disso o evento é **descartado sem aviso**.
  - O breaker é por destino. Com ele aberto, os eventos são re-enfileirados e **cada re-enfileiramento conta no limite de 10**. Ou seja, um deploy quebrado pode perder dados.
  - Os eventos de auth e deauth passam por fora do breaker.
- **Backfill:** um job diário chama a REST da Terra (`GET /v2/activity?user_id=...&start_date=...`, path **a confirmar no doc novo**).
- **Deauth via API:** `DELETE /v2/auth/deauthenticateUser?user_id=` (**a confirmar**).
- **React Native:** o pacote ganhou plugin Expo a partir da 1.8.0 [OFICIAL blog jun/2025]. O nome npm `terra-react` e a compatibilidade com o SDK 58 são **a confirmar**. O pacote só é necessário para Apple Health e Health Connect. Para Garmin e Polar basta o widget web via `expo-web-browser`, sem módulo nativo.

## Limites e termos de uso

**Custo do Quick Start** [OFICIAL]:
- 100.000 créditos/mês, que não acumulam.
- Cada fonte conectada por usuário custa 200 créditos/mês.
- Os primeiros 400 eventos por autenticação são grátis; depois, 0,5 crédito por evento.
- O excedente custa "starting at $0.005/credit" (valores abaixo são o teto).

| Usuários | Fontes/usuário | Custo/mês (plano mensal) |
|---|---|---|
| 500 | 1 | US$ 499 |
| 1.000 | 1 | US$ 999 |
| 5.000 | 1 | US$ 4.999 |
| 1.000 | 2 | US$ 1.999 |
| 5.000 | 2 | US$ 9.999 |

No plano anual, subtraia US$ 100. O volume real de eventos por mês de um corredor Garmin precisa ser **medido**.

**Compliance:**
- Itens só do Enterprise: "Dedicated instance to localised area" e MSA/SLA sob medida.
- A residência dos dados não é declarada. Não há menção à LGPD.

**IA:** a Terra não restringe uso em IA nas páginas lidas. A restrição vem do provedor: Garmin §15.10 (consentimento e transparência) e Strava (provável proibição).

**LGPD:**
- Dado de saúde é dado pessoal sensível (art. 5º II e art. 11): exige consentimento específico e destacado.
- Usar a Terra é transferência internacional (art. 33), e as cláusulas-padrão da ANPD (Res. 19/2024) são obrigatórias. O prazo para incorporá-las aos contratos venceu em **23/08/2025**, então qualquer contrato novo já nasce com elas.
- As cláusulas são adotadas integralmente e sem alteração. As fontes divergem entre 24 e 25 cláusulas (**a confirmar no anexo oficial em gov.br/anpd**).
- A Terra é **operadora** e o Paceless é **controlador**.

## Arquitetura no Paceless

- **App:** botão "Conectar relógio" → `supabase.functions.invoke("terra-connect")` → `WebBrowser.openAuthSessionAsync(url, "paceless://wearables")`. A tela consulta `provider_connections`, sem confiar no redirect.
- **Edge Functions:**
  - `terra-connect` (JWT verificado): cria a sessão.
  - `terra-webhook` (`verify_jwt = false`): verifica a assinatura, grava e responde rápido.
  - `wearable-worker`: processa a fila via pg_cron ou Supabase Queues.
- **Tabelas:** `provider_connections`, `wearable_events` (ver o SQL na seção da Strava).
- **Secrets:** `TERRA_DEV_ID`, `TERRA_API_KEY` e `TERRA_SIGNING_SECRET`.
- **Decisão em aberto:** se o usuário conectar Garmin **e** Polar pela Terra, a chave passa a ser `(user_id, 'terra:' || user.provider)`.

## Exemplos de código

### Edge Function `terra-connect`

Fonte: https://docs.tryterra.co/health-and-fitness-api/user-authentication/implementation-terra-widget

```ts
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const auth = req.headers.get("Authorization") ?? "";
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: auth } },
  });
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return new Response("unauthorized", { status: 401 });

  const res = await fetch("https://access.tryterra.co/api/widget/session", {
    method: "POST",
    headers: {
      "dev-id": Deno.env.get("TERRA_DEV_ID")!,
      "x-api-key": Deno.env.get("TERRA_API_KEY")!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      reference_id: user.id, // sempre o uuid do Supabase
      providers: "GARMIN,POLAR",
      auth_success_redirect_url: "paceless://wearables/connected",
      auth_failure_redirect_url: "paceless://wearables/failed",
    }),
  });
  if (res.status !== 201) return new Response("terra_error", { status: 502 });
  const { url } = await res.json();
  return Response.json({ url });
});
```

### App (Expo)

```ts
import * as WebBrowser from "expo-web-browser";
import { supabase } from "@/lib/supabase";

export async function connectWearable(): Promise<"connected" | "failed" | "cancelled"> {
  const { data, error } = await supabase.functions.invoke<{ url: string }>("terra-connect");
  if (error || !data) return "failed";
  const result = await WebBrowser.openAuthSessionAsync(data.url, "paceless://wearables");
  if (result.type !== "success") return "cancelled";
  // o status real vem do webhook "auth"; a tela deve reler provider_connections
  return result.url.includes("/connected") ? "connected" : "failed";
}
```

### Webhook `terra-webhook` (assinatura, auth/reauth/deauth, dedup)

Fontes: https://docs.tryterra.co/health-and-fitness-api/integration-setup/setting-up-data-destinations/webhooks e https://docs.tryterra.co/reference/health-and-fitness-api/event-types

```ts
import { createClient } from "jsr:@supabase/supabase-js@2";

const enc = new TextEncoder();

async function hmacHex(secret: string, msg: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(msg)));
  return Array.from(sig, (b) => b.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

async function verify(raw: string, header: string, secret: string): Promise<boolean> {
  const parts = header.split(",").map((p) => p.split("="));
  const t = parts.find(([k]) => k === "t")?.[1];
  const sigs = parts.filter(([k]) => k === "v1").map(([, v]) => v); // só v1 (anti-downgrade)
  if (!t || sigs.length === 0) return false;
  const tsMs = t.length <= 10 ? Number(t) * 1000 : Number(t); // heurística nossa: confirmar unidade
  if (Math.abs(Date.now() - tsMs) > 300_000) return false;
  const expected = await hmacHex(secret, `${t}.${raw}`);
  return sigs.some((s) => safeEqual(expected, s));
}

type TerraUser = { user_id: string; reference_id: string | null; provider: string };
type TerraEvent = { type: string; user?: TerraUser; old_user?: TerraUser; new_user?: TerraUser };

Deno.serve(async (req) => {
  const raw = await req.text();
  if (!(await verify(raw, req.headers.get("terra-signature") ?? "", Deno.env.get("TERRA_SIGNING_SECRET")!)))
    return new Response("bad signature", { status: 401 });
  const ev = JSON.parse(raw) as TerraEvent;
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  if (ev.type === "auth" && ev.user?.reference_id) {
    const { error } = await db.from("provider_connections").upsert(
      { user_id: ev.user.reference_id, provider: "terra", external_id: ev.user.user_id },
      { onConflict: "user_id,provider" });
    return new Response(error ? "retry" : "ok", { status: error ? 500 : 200 });
  }
  if (ev.type === "user_reauth" && ev.old_user && ev.new_user) {
    const { error } = await db.from("provider_connections")
      .update({ external_id: ev.new_user.user_id })
      .eq("provider", "terra").eq("external_id", ev.old_user.user_id);
    return new Response(error ? "retry" : "ok", { status: error ? 500 : 200 });
  }
  if (ev.type === "deauth" && ev.user) {
    const { data } = await db.from("provider_connections").delete()
      .eq("provider", "terra").eq("external_id", ev.user.user_id).select("user_id");
    const uid = data?.[0]?.user_id;
    if (uid) await db.from("wearable_events").delete().eq("provider", "terra").eq("user_id", uid);
    return new Response("ok");
  }
  // dados: grava com await e responde (cabe nos 8 s); processamento fica no worker
  const { error } = await db.from("wearable_events").insert({
    dedup_key: await hmacHex("dedup", raw), provider: "terra",
    user_id: ev.user?.reference_id ?? null, payload: ev });
  if (error && error.code !== "23505") return new Response("retry", { status: 500 });
  return new Response("ok");
});
```

Evitamos o `EdgeRuntime.waitUntil` porque o trabalho fica preso ao limite de wall-clock e os erros são engolidos. O padrão é inserir com await e então responder.

O SDK oficial tem uma função equivalente, `verifyTerraWebhookSignature` (npm `terra-api`, https://www.npmjs.com/package/terra-api). Vale portar a lógica dele.

## Riscos e pontos a confirmar

- DPA e cláusulas ANPD podem existir só no Enterprise (**a confirmar**).
- A unidade de `t` na assinatura (**a confirmar**).
- Eventos são perdidos depois de ~8 h de falhas; por isso o backfill diário é obrigatório.
- O nome exibido na tela OAuth da Garmin e a taxa da Garmin repassada (**a confirmar**).
- O path REST de backfill e o de deauth (**a confirmar**).
- O pacote React Native e o SDK 58 (**a confirmar**).

## Fontes

- https://tryterra.co/pricing
- https://docs.tryterra.co/health-and-fitness-api/user-authentication/implementation-terra-widget
- https://docs.tryterra.co/health-and-fitness-api/integration-setup/setting-up-data-destinations/webhooks
- https://docs.tryterra.co/health-and-fitness-api/user-authentication/handling-authentication-events
- https://docs.tryterra.co/faq/help-topics/no-data/auth-scopes-user-id-matching/reauth-webhook-user-id-changes
- https://docs.tryterra.co/reference/health-and-fitness-api/event-types
- https://docs.tryterra.co/reference/health-and-fitness-api/openapi-spec
- https://docs.tryterra.co/docs/secure-your-webhook
- https://www.npmjs.com/package/terra-api
- https://landing-cf.tryterra.co/blog/june-2025-updates
- https://tryterra.co/community/how-to-add-setupbackgrounddelivery-in-app-delegate-for-expo-app
- https://tryterra.co/integrations/garmin
- https://tryterra.co/integrations/coros
- https://github.com/IslemMedjahdi/terra-athletes

---

# ROOK

## Resumo

- Agregador com 8 APIs de nuvem diretas e SDKs para Apple Health, Health Connect e Samsung Health. Diz cobrir 72 fontes e mais de 500 dispositivos.
- **Para o Paceless:** preço parecido com o da Terra (US$ 399), com mais usuários (750). Mas a página não fala de residência dos dados nem de LGPD.
- **Recomendação:** cotar como alternativa à Terra.

## Cadastro e burocracia

- **Onde:** https://www.tryrook.io/pricing [OFICIAL].
- **Planos:**
  - Core: US$ 399/mês, até 750 usuários ativos.
  - Core+: US$ 999/mês, 5.000 usuários, com 3 add-ons.
  - Business: US$ 1.999/mês, 15.000 usuários.
  - Enterprise: sob consulta.

Checklist:
- [ ] Pedir o DPA com o anexo II da Res. ANPD 19/2024, a região de hospedagem e os suboperadores.
- [ ] Perguntar se a ROOK usa credenciais próprias na Garmin e na Polar, e se a taxa Garmin é repassada.
- [ ] Perguntar o nome exibido na tela OAuth.
- [ ] Pedir trial.

## Dados disponíveis

Atividade, sono, corpo e métricas diárias (detalhes **a confirmar** na doc da ROOK).

## Autenticação e sincronização

Nuvem-a-nuvem via OAuth da ROOK, mais os SDKs no aparelho. O fluxo exato não foi pesquisado (**a confirmar**).

## Limites e termos de uso

- Assina BAA HIPAA "when the customer is a Covered Entity". Cita HIPAA e GDPR, mas **nada sobre LGPD**.
- A restrição de IA dos provedores (Garmin e Strava) continua valendo.

## Arquitetura no Paceless

A mesma da Terra: uma Edge Function cria a sessão, um webhook grava em `wearable_events` e um worker processa.

## Exemplos de código

Não coletados. Reaproveitar o padrão de webhook da Terra, ajustando o header e o algoritmo de assinatura (**a confirmar**).

## Riscos e pontos a confirmar

- Residência dos dados, LGPD e uso de credenciais próprias.

## Fontes

- https://www.tryrook.io/pricing
- https://insider.fitt.co/press-release/rook-evolves-beyond-wearables-to-become-the-infrastructure-for-the-continuous-health-record/
- https://sahha.ai/compare/sahha-vs-rook/ [VIÉS]
- https://openwearables.io/compare/rook [VIÉS]

---

# Thryve

## Resumo

- Agregador alemão: "All data processed and stored by Thryve is hosted in Germany" [OFICIAL].
- **Para o Paceless:** é o agregador com a melhor argumentação de proteção de dados. Mesmo assim, as cláusulas ANPD continuam necessárias, porque a Alemanha não tem decisão de adequação da ANPD que eu conheça (**a confirmar**).
- **Recomendação:** cotar se a LGPD pesar mais que o preço.

## Cadastro e burocracia

- **Onde:** https://www.thryve.health/pricing [OFICIAL].
- **Planos:**
  - Start Up: a partir de €499/mês para 500 usuários, mais €0,50 por usuário extra. Trial de 14 dias; o Free Trial lista 25 usuários.
  - Scale Up: a partir de €1.000/mês para 5.000 usuários. Só para empresas com menos de 10 anos; histórico de 14 dias e armazenamento de 1 mês.

Checklist:
- [ ] Ativar o trial de 14 dias.
- [ ] Pedir o DPA com o anexo II da Res. ANPD 19/2024 e a lista de suboperadores.
- [ ] Perguntar sobre credenciais Garmin e Polar, a taxa Garmin e o Coros.

## Dados disponíveis

A cobertura não é detalhada na página de preços (**a confirmar**).

## Autenticação e sincronização

Não pesquisado (**a confirmar**).

## Limites e termos de uso

- Diz ser GDPR e HIPAA, com ISO 27001. Sem menção à LGPD.
- Os limites do Scale Up (histórico de 14 dias e armazenamento de 1 mês) importam para o backfill.

## Arquitetura no Paceless

Mesmo padrão: webhook → `wearable_events` → worker.

## Exemplos de código

Não coletados.

## Riscos e pontos a confirmar

- SDK mobile, cobertura de dispositivos e formato do webhook.

## Fontes

- https://www.thryve.health/pricing

---

# Sahha

## Resumo

- Agregador com foco em métricas de saúde. Cobre Garmin, Oura, WHOOP, Apple Health e Health Connect.
- Starter a partir de US$ 299/mês no anual, para 1.000 usuários [TERCEIRO, **a confirmar na página oficial**].
- **Atenção:** muitas fontes deste estudo sobre concorrentes são da própria Sahha [VIÉS].
- **Recomendação:** baixa prioridade. Tem pouca cobertura de relógios de corrida (Polar e Coros não aparecem).

## Cadastro e burocracia

- [ ] Buscar a página oficial de preços e o DPA.

## Dados disponíveis

Garmin, Oura, WHOOP e mais um; Apple Health e Health Connect.

## Autenticação e sincronização

Não pesquisado (**a confirmar**).

## Limites e termos de uso

A Sahha resume a §15.10 da Garmin (IA com consentimento explícito e uma AI transparency statement; a Garmin pode auditar). **Ler a cláusula no texto da Garmin.**

## Arquitetura no Paceless

Mesmo padrão dos outros agregadores.

## Exemplos de código

Não coletados.

## Riscos e pontos a confirmar

- Preço, residência e cobertura.

## Fontes

- https://sahha.ai/blog/health-api-ai-restrictions/
- https://sahha.ai/compare/terra-alternatives/

---

# Spike

## Resumo

- Agregador com cerca de 23 provedores OAuth e SDK mobile.
- A partir de US$ 450/mês [TERCEIRO/VIÉS, **a confirmar**].
- **Recomendação:** baixa prioridade.

## Cadastro e burocracia

- [ ] Buscar a página oficial de preços (spikeapi.com) e o DPA.

## Dados disponíveis

**A confirmar.**

## Autenticação e sincronização

**A confirmar.**

## Limites e termos de uso

**A confirmar.**

## Arquitetura no Paceless

Mesmo padrão dos outros agregadores.

## Exemplos de código

Não coletados.

## Riscos e pontos a confirmar

Tudo, porque as fontes são só de terceiros.

## Fontes

- https://sahha.ai/compare/terra-alternatives/ [VIÉS]

---

# Open Wearables

## Resumo

- Plataforma open source (MIT) e self-hosted que integra wearables. Repositório: https://github.com/the-momentum/open-wearables.
  - Stack: FastAPI, Postgres, Redis e Celery (worker e beat), com Svix opcional, portal em SvelteKit e servidor MCP.
  - Nuvem: Garmin, Polar, Suunto, Strava, Whoop, Oura, Withings, Ultrahuman e Google Health.
  - No aparelho: Apple Health, Health Connect e Samsung Health.
- **Releases** [OFICIAL via `gh api`]: 0.10.0 (16/10/2026), 0.9.0 (17/09/2026) e 0.8.0 (11/09/2026).
- **Para o Paceless:** rodar como servidor exige infra própria, o que contraria a decisão "backend só Supabase". **Usar como referência de código** dos fluxos OAuth e webhook da Garmin e da Polar e do modelo normalizado.
- **Recomendação:** é a base técnica da integração direta.

## Cadastro e burocracia

O Open Wearables usa **as nossas credenciais** (`credentials()` lê client_id e secret do ambiente). Então o Pedro faz o cadastro na Garmin e na Polar do mesmo jeito, seguindo `docs/relogios.md`.

- [ ] Cadastro no Garmin Connect Developer Program (ver `docs/relogios.md`).
- [ ] Cadastro no Polar AccessLink (ver `docs/relogios.md`).
- [ ] Coros: a Partner API exige parceria (ver `docs/integracoes-relogios/coros.md`).

## Dados disponíveis

Workouts e timeseries normalizados, de todas as fontes listadas no resumo.

## Autenticação e sincronização

Arquivos de referência:

- `backend/app/services/providers/garmin/oauth.py`: OAuth2 com **PKCE**.
  - `authorize_url=https://connect.garmin.com/oauth2Confirm`
  - `token_url=https://diauth.garmin.com/di-oauth2-service/oauth/token`
- `backend/app/services/providers/garmin/handlers/lifecycle.py`: trata `userPermissionsChange` e `deregistrations`.
  - A Garmin mantém o mesmo userId entre re-autorizações e pode entregar a desregistração de um grant antigo depois que o usuário reconectou.
  - Por isso o código confirma, chamando a API, se o grant atual ainda vale antes de revogar.
- `backend/app/services/providers/garmin/handlers/{activities,backfill}.py` e `backfill_state/*`.
- `backend/app/services/providers/polar/webhook_handler.py`: header `Polar-Webhook-Signature: <hex>` com HMAC-SHA256 do body. O PING vem sem assinatura e é tratado antes da verificação.
- `backend/app/api/routes/v1/strava_webhooks.py`.

## Limites e termos de uso

- Licença MIT, então o código pode ser portado.
- Os termos de cada provedor (Garmin, Polar) se aplicam diretamente a nós.

## Arquitetura no Paceless

- A lógica (URLs, PKCE, HMAC e regras de lifecycle) porta direto para Deno.
- A orquestração Celery e o backfill state vão para pg_cron ou pgmq (Supabase Queues).
- **Não dá para copiar o código Python**, só portar a lógica.
- SDKs disponíveis: React Native (`the-momentum/open-wearables-react-native-sdk`) e iOS de Apple Health (`the-momentum/open_wearables_ios_sdk`). Usar qualquer um deles exige aprovação de nova dependência.

## Exemplos de código

Verificação do webhook da Polar portada para Deno. A lógica vem de `polar/webhook_handler.py`; a adaptação é nossa e não foi testada.

```ts
async function verifyPolar(raw: string, signature: string, secret: string): Promise<boolean> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(raw)));
  const hex = Array.from(sig, (b) => b.toString(16).padStart(2, "0")).join("");
  if (hex.length !== signature.length) return false;
  let d = 0;
  for (let i = 0; i < hex.length; i++) d |= hex.charCodeAt(i) ^ signature.charCodeAt(i);
  return d === 0;
}

Deno.serve(async (req) => {
  const raw = await req.text();
  const body = JSON.parse(raw) as { event: string };
  if (body.event === "PING") return new Response("ok"); // PING vem sem assinatura
  const ok = await verifyPolar(raw, req.headers.get("Polar-Webhook-Signature") ?? "", Deno.env.get("POLAR_WEBHOOK_SECRET")!);
  if (!ok) return new Response("bad signature", { status: 401 });
  // inserir em wearable_events com await e responder
  return new Response("ok");
});
```

## Riscos e pontos a confirmar

- Projeto jovem (0.x), com mudanças rápidas. Fixar um commit como referência ao portar.
- O status do SDK RN com o Expo SDK 58 é **a confirmar**.

## Fontes

- https://github.com/the-momentum/open-wearables
- https://github.com/the-momentum/open-wearables/releases
- https://github.com/the-momentum/open-wearables/blob/main/backend/app/services/providers/garmin/oauth.py
- https://github.com/the-momentum/open-wearables/blob/main/backend/app/services/providers/garmin/handlers/lifecycle.py
- https://github.com/the-momentum/open-wearables/blob/main/backend/app/services/providers/polar/webhook_handler.py
- https://github.com/the-momentum/open-wearables/blob/main/backend/app/api/routes/v1/strava_webhooks.py
- https://openwearables.io/wearable-api
- https://openwearables.io/faq
- https://www.themomentum.ai/blog/open-wearables-0-4-release

---

# Strava API (regras de 2026)

## Resumo

- Novo API Agreement vigente desde 01/06/2026 [OFICIAL strava.com/legal/api]: "Strava Data provided by a specific user can only be displayed or disclosed in your Developer Application to that user".
- Os pontos críticos (IA, agregadores e cache) estão na **API Policy**, cujo texto oficial **não foi localizado** (`developers.strava.com/docs/policy/` dá 404).
- **Para o Paceless:** o Strava não pode alimentar o coach (provável proibição de IA), não pode passar por agregador e não permite guardar histórico.
- **Recomendação:** **upload-only** (`activity:write`), para exportar para o Strava a corrida gravada no Paceless. Fica condicionado a uma resposta escrita do Strava.

## Cadastro e burocracia

- **Onde:** https://www.strava.com/settings/api, com a conta da empresa.
- **Campos:** nome, site, ícone e **Authorization Callback Domain** = `<ref>.supabase.co` (só o domínio, não a URL).
- **Níveis:**
  - O app nasce com 1 atleta e sobe para 10 sem revisão.
  - O Standard vai até 9.999 atletas, com aprovação.
  - O Extended começa em 10.000 e passa por revisão.
  - Não há prazo garantido de revisão [TERCEIRO/VIÉS Terra].
- **Assinatura Strava paga para devs Standard** desde 01/06/2026 (novos) ou 30/06/2026 (existentes) [TERCEIRO: TechRepublic, intervals.icu, **a confirmar**]. Isso conflita com a §3.2 do Agreement, que diz "currently provided at no charge". Não usar o valor de US$ 11,99 que circula.
- **Custo de API:** nenhum.

Checklist:
- [ ] Criar o app com e-mail corporativo e CNPJ.
- [ ] Enviar **por escrito** (formulário de suporte ou revisão do app; o fórum não serve) a pergunta abaixo e guardar a resposta: "Our app (Paceless) has an AI running coach. We only want `activity:write` to upload a run the athlete recorded in our app to their Strava account. We will not read any Strava data. Is this allowed under API Policy 5.3 and 5.16? Does upload-only require a paid Strava subscription for the developer?"
- [ ] Pedir o link oficial da API Policy vigente e salvar um PDF datado.
- [ ] Assinar o Strava, se a resposta disser que é exigido.
- [ ] Ler as brand guidelines (botão "Connect with Strava" e "Powered by Strava"; **a confirmar** em developers.strava.com/guidelines).
- [ ] Preencher o formulário de revisão para passar de 10 atletas.
- [ ] Aceitar o API Agreement.

## Dados disponíveis

- No upload-only, **não lemos nada**. Só guardamos os tokens.
- Os endpoints Club Activities, Club Members e Club Admins foram removidos em 01/09/2026. `GET /segments/explore` agora só com Extended [TERCEIRO/VIÉS Terra].

## Autenticação e sincronização

**OAuth** [OFICIAL developers.strava.com/docs/authentication]:
- Autorização no mobile: `GET https://www.strava.com/oauth/mobile/authorize` (abre o app do Strava se estiver instalado). Na web: `/oauth/authorize`.
- Parâmetros: `client_id`, `redirect_uri`, `response_type=code`, `approval_prompt`, `scope=activity:write` e `state`.
- Troca do código: `POST https://www.strava.com/oauth/token`. A resposta traz `access_token`, `refresh_token`, `expires_at`, `athlete` e `scope`. **Conferir o scope**, porque o usuário pode desmarcar escopos.
- O access token dura 6 h. O refresh token **rotaciona**: o anterior morre na hora, então é preciso salvar o novo de forma atômica.

**Upload** [OFICIAL developers.strava.com/docs/uploads]:
- `POST https://www.strava.com/api/v3/uploads` (multipart).
- Campos: `file`, `data_type` (`fit|fit.gz|tcx|tcx.gz|gpx|gpx.gz`), `name`, `description`, `sport_type` (`Run`, case sensitive), `trainer`, `commute` e `external_id` (único).
- Resposta 201 com `id_str` (usar esse), `status`, `error` e `activity_id`.
- Polling com `GET /uploads/{id}` no máximo 1x/s; o processamento leva menos de 2 s em média.
- Erro de duplicado = sucesso idempotente.

**Webhook** [OFICIAL developers.strava.com/docs/webhooks]:
- Assinatura via `POST /api/v3/push_subscriptions`. O handshake é um GET com `hub.challenge`, que tem que ser respondido em até 2 s. Uma assinatura por app.
- O POST tem que receber 200 em até 2 s, com até 3 tentativas no total.
- Campos: `object_type`, `object_id`, `aspect_type`, `updates`, `owner_id`, `subscription_id` e `event_time`.
- Desautorização: `object_type:"athlete"` com `updates.authorized === "false"` (**string**).
- O Strava não assina o POST. O controle possível é o `subscription_id` mais uma URL difícil de adivinhar.

**Migrações** [TERCEIRO/VIÉS Terra, **a confirmar**]:
- Nova base `https://api-v3.strava.com` a partir de 04/01/2027.
- `oauth/deauthorize` desligado em 01/06/2027; usar `POST https://www.strava.com/oauth/revoke` com Basic Auth.
- Token obrigatoriamente no header.

## Limites e termos de uso

- **Rate limits:** 400 requisições/15 min e 4.000/dia; as que não são upload ficam em 200/15 min e 2.000/dia. O limite é compartilhado pelo app inteiro [TERCEIRO, **a confirmar**]. Um upload com polling custa 2 a 4 requisições.
- **Exibição:** só para o próprio atleta (Agreement). Sem ranking ou feed social.
- **IA (§5.3):** provável proibição, inclusive "ingestion into a context window" [FÓRUM-STRAVA/VIÉS, **a confirmar**]. O MCP oficial do Strava é só para o próprio assinante.
- **Agregadores (§5.16):** provável proibição. Um dev foi "twice flagged" e o Strava não respondeu no fórum [FÓRUM-STRAVA, **a confirmar**].
- **Retenção:** "may not be retained in cache longer than seven days" (§6.2). Apagar em até 48 h após o deauth (§6.3). Guardar só "what is necessary for the original purpose" (§6.4). Esses trechos foram citados por devs no hub oficial [FÓRUM-STRAVA].
- **LGPD:** no upload-only, o dado sai do Paceless para o Strava por ação do titular. Registrar isso na política de privacidade como compartilhamento a pedido do usuário.

## Arquitetura no Paceless

- **App:** gera um `state`, registra via `strava-state`, abre `/oauth/mobile/authorize` com `openAuthSessionAsync` e recebe o retorno em `paceless://strava?ok=1`.
- **Edge Functions:**
  - `strava-state` (JWT): guarda o `state` ligado ao usuário.
  - `strava-callback` (`verify_jwt=false`): troca o código, confere o scope `activity:write`, grava o token no Vault e redireciona com 302 para `paceless://strava?ok=1`.
  - `strava-upload` (JWT): faz o refresh se faltar menos de 1 h para expirar, gera o GPX e envia.
  - `strava-webhook` (`verify_jwt=false`): trata só o deauth.
- **Tabelas:** `provider_connections` (com `token_secret_id` apontando para o Vault) e `wearable_events`.
- **Secrets:** `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, `STRAVA_VERIFY_TOKEN` e `STRAVA_SUBSCRIPTION_ID`.
- **Formato do arquivo:** GPX gerado à mão (`<trkpt lat lon><ele/><time/>` + FC via `gpxtpx:hr`). Gerar FIT exige uma lib, que precisa de aprovação.

## Exemplos de código

### Schema + RLS (serve para todos os provedores)

Vault: https://supabase.com/docs/guides/database/vault

```sql
create table public.provider_connections (
  user_id uuid not null references auth.users on delete cascade,
  provider text not null check (provider in ('strava','terra','garmin','polar')),
  external_id text not null,
  token_secret_id uuid,
  expires_at timestamptz,
  scope text,
  connected_at timestamptz not null default now(),
  primary key (user_id, provider),
  unique (provider, external_id)
);
create table public.wearable_events (
  id bigserial primary key,
  dedup_key text not null unique,
  provider text not null,
  user_id uuid references auth.users on delete cascade,
  payload jsonb not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);
alter table public.provider_connections enable row level security;
alter table public.wearable_events enable row level security;
-- o app só lê as próprias conexões; escrita só pelo service role
create policy "own connections readable" on public.provider_connections
  for select to authenticated using ((select auth.uid()) = user_id);

create or replace function public.store_provider_token(
  p_user uuid, p_provider text, p_external text, p_tokens jsonb, p_expires timestamptz, p_scope text)
returns void language plpgsql security definer set search_path = '' as $$
declare v_id uuid;
begin
  select token_secret_id into v_id from public.provider_connections
   where user_id = p_user and provider = p_provider for update;
  if v_id is null then
    v_id := vault.create_secret(p_tokens::text, p_provider || ':' || p_user::text);
  else
    perform vault.update_secret(v_id, p_tokens::text);
  end if;
  insert into public.provider_connections (user_id, provider, external_id, token_secret_id, expires_at, scope)
  values (p_user, p_provider, p_external, v_id, p_expires, p_scope)
  on conflict (user_id, provider) do update
    set external_id = excluded.external_id, token_secret_id = excluded.token_secret_id,
        expires_at = excluded.expires_at, scope = excluded.scope;
end $$;
revoke all on function public.store_provider_token from public, anon, authenticated;
```

`p_tokens` tem o formato `{"access_token": "...", "refresh_token": "..."}`.

### Purga após deauth + jobs pg_cron

Fontes: https://supabase.com/docs/guides/cron e https://supabase.com/docs/guides/queues

```sql
create or replace function public.purge_strava_athlete(p_external text)
returns void language plpgsql security definer set search_path = '' as $$
declare v_user uuid; v_secret uuid;
begin
  delete from public.provider_connections where provider = 'strava' and external_id = p_external
    returning user_id, token_secret_id into v_user, v_secret;
  if v_secret is not null then delete from vault.secrets where id = v_secret; end if; -- confirmar permissão
  if v_user is not null then
    delete from public.wearable_events where provider = 'strava' and user_id = v_user;
  end if;
end $$;
revoke all on function public.purge_strava_athlete from public, anon, authenticated;

select cron.schedule('strava-cache-7d', '15 3 * * *',
  $$delete from public.wearable_events where provider = 'strava' and received_at < now() - interval '7 days'$$);
select cron.schedule('wearable-process', '* * * * *',
  $$select net.http_post(url := '<PROJECT_URL>/functions/v1/wearable-worker',
    headers := jsonb_build_object('Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'worker_key')))$$);
```

### Webhook `strava-webhook`

Fonte: https://developers.strava.com/docs/webhooks/

```ts
import { createClient } from "jsr:@supabase/supabase-js@2";

type StravaEvent = {
  object_type: "activity" | "athlete";
  object_id: number;
  aspect_type: "create" | "update" | "delete";
  owner_id: number;
  subscription_id: number;
  event_time: number;
  updates?: Record<string, string>;
};

Deno.serve(async (req) => {
  const url = new URL(req.url);
  if (req.method === "GET") {
    if (url.searchParams.get("hub.verify_token") !== Deno.env.get("STRAVA_VERIFY_TOKEN"))
      return new Response("forbidden", { status: 403 });
    return Response.json({ "hub.challenge": url.searchParams.get("hub.challenge") });
  }
  const event = (await req.json()) as StravaEvent;
  if (String(event.subscription_id) !== Deno.env.get("STRAVA_SUBSCRIPTION_ID"))
    return new Response("ignored", { status: 200 });
  if (event.object_type === "athlete" && event.updates?.authorized === "false") {
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { error } = await db.rpc("purge_strava_athlete", { p_external: String(event.owner_id) });
    return new Response(error ? "retry" : "ok", { status: error ? 500 : 200 });
  }
  return new Response("ok"); // upload-only: eventos de activity são ignorados
});
```

### Refresh do token (rotativo)

Fonte: https://developers.strava.com/docs/authentication/

```ts
async function refreshStrava(refreshToken: string) {
  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: Deno.env.get("STRAVA_CLIENT_ID")!,
      client_secret: Deno.env.get("STRAVA_CLIENT_SECRET")!,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });
  if (!res.ok) throw new Error("strava_refresh_failed");
  // gravar SEMPRE o novo refresh_token via store_provider_token: o anterior deixa de valer
  return (await res.json()) as { access_token: string; refresh_token: string; expires_at: number };
}
```

### Upload com polling (`strava-upload`)

Fonte: https://developers.strava.com/docs/uploads/

```ts
async function uploadRun(accessToken: string, file: Uint8Array, runId: string, name: string) {
  const form = new FormData();
  form.append("file", new Blob([file]), `${runId}.gpx`);
  form.append("data_type", "gpx");
  form.append("sport_type", "Run");
  form.append("name", name);
  form.append("external_id", `paceless-${runId}`);
  const res = await fetch("https://www.strava.com/api/v3/uploads", {
    method: "POST", headers: { Authorization: `Bearer ${accessToken}` }, body: form });
  if (res.status !== 201) throw new Error(`strava_upload_${res.status}`);
  const up = (await res.json()) as { id_str: string };
  for (let i = 0; i < 10; i++) {
    await new Promise((r) => setTimeout(r, 1500)); // máximo 1 req/s
    const s = await fetch(`https://www.strava.com/api/v3/uploads/${up.id_str}`, {
      headers: { Authorization: `Bearer ${accessToken}` } });
    const body = (await s.json()) as { activity_id: number | null; error: string | null };
    if (body.error) return { ok: false as const, error: body.error }; // duplicado = tratar como sucesso
    if (body.activity_id) return { ok: true as const, activityId: body.activity_id };
  }
  return { ok: false as const, error: "pending" };
}
```

### Autorização no app (Expo SDK 58)

```ts
import * as WebBrowser from "expo-web-browser";
import * as Crypto from "expo-crypto"; // precisa de aprovação se ainda não estiver no projeto
import { supabase } from "@/lib/supabase";

export async function connectStrava(clientId: string): Promise<"connected" | "failed" | "cancelled"> {
  const state = Crypto.randomUUID();
  await supabase.functions.invoke("strava-state", { body: { state } });
  const redirect = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/strava-callback`;
  const url = `https://www.strava.com/oauth/mobile/authorize?client_id=${clientId}`
    + `&redirect_uri=${encodeURIComponent(redirect)}&response_type=code&approval_prompt=auto`
    + `&scope=activity:write&state=${state}`;
  const r = await WebBrowser.openAuthSessionAsync(url, "paceless://strava");
  if (r.type !== "success") return "cancelled";
  return r.url.includes("ok=1") ? "connected" : "failed";
}
```

### Secrets e deploy

```bash
supabase secrets set STRAVA_CLIENT_ID=... STRAVA_CLIENT_SECRET=... STRAVA_VERIFY_TOKEN=... STRAVA_SUBSCRIPTION_ID=...
supabase secrets set TERRA_DEV_ID=... TERRA_API_KEY=... TERRA_SIGNING_SECRET=...
supabase functions deploy strava-webhook --no-verify-jwt
supabase functions deploy strava-callback --no-verify-jwt
supabase functions deploy terra-webhook --no-verify-jwt
curl -X POST https://www.strava.com/api/v3/push_subscriptions \
  -F client_id=$ID -F client_secret=$SECRET \
  -F callback_url=https://<ref>.supabase.co/functions/v1/strava-webhook -F verify_token=$VT
# o "id" retornado vira STRAVA_SUBSCRIPTION_ID
```

Em vez da flag no deploy, dá para usar o `supabase/config.toml`:

```toml
[functions.strava-webhook]
verify_jwt = false

[functions.strava-callback]
verify_jwt = false

[functions.terra-webhook]
verify_jwt = false
```

## Riscos e pontos a confirmar

- O texto oficial da API Policy (§2.3, §5.3, §5.16, §6.1 a §6.4) não foi lido (**a confirmar**).
- A assinatura paga para devs e se o upload-only também a exige (**a confirmar**).
- As datas de migração (api-v3 e fim do deauthorize) são **a confirmar**.
- O `openAuthSessionAsync` com o app Strava interceptando, no SDK 58, Android e iOS, **não foi testado** (testar em dev build).
- Apagar direto em `vault.secrets` depende da permissão do papel (**testar**).
- Os rate limits são compartilhados; se o app crescer, o polling de upload pode pesar.

## Fontes

- https://www.strava.com/legal/api
- https://developers.strava.com/docs/authentication/
- https://developers.strava.com/docs/webhooks/
- https://developers.strava.com/docs/uploads/
- https://communityhub.strava.com/developers-api-7/clarification-on-api-policy-6-2-retaining-an-athlete-s-own-activity-data-for-historical-comparison-13928
- https://communityhub.strava.com/developers-api-7/section-5-16-clarification-twice-flagged-as-abstraction-layer-need-to-understand-what-to-fix-13745
- https://communityhub.strava.com/developers-api-7/is-ai-inference-on-an-athlete-s-own-data-no-training-permitted-under-the-api-agreement-13753
- https://communityhub.strava.com/developers-api-7/is-my-app-compliant-13485
- https://communityhub.strava.com/developers-api-7/keeping-activity-history-for-an-app-that-tracks-which-streets-you-ve-run-api-policy-5-5-5-7-6-2-14094
- https://tryterra.co/blog/strava-api-changes-2026 [VIÉS]
- https://www.techrepublic.com/article/news-strava-api-scraping-crackdown/
- https://marathonhandbook.com/strava-api-changes/
- https://forum.intervals.icu/t/strava-api-update-new-terms-subs-required-for-api-access/130240
- https://vorplabs.com/agent-tools/strava-mcp
- https://supabase.com/docs/guides/database/vault
- https://supabase.com/docs/guides/cron
- https://supabase.com/docs/guides/queues
- https://supabase.com/docs/guides/functions/background-tasks

---

# LGPD: deveres do controlador (vale para qualquer opção)

O texto primário não foi lido. Os artigos foram citados de memória e precisam ser confirmados em planalto.gov.br.

- [ ] **Consentimento** específico e destacado para dado de saúde (art. 11, I), com finalidade explícita. Exemplo: "usar sua FC, ritmo e sono para o coach de IA ajustar seus treinos".
- [ ] **Seção de IA** na política de privacidade (exigência da Garmin §15.10) e tela de consentimento.
- [ ] **Encarregado (DPO)** com nome e contato publicados (art. 41).
- [ ] **RIPD/DPIA**, porque dado sensível e IA são tratamento de alto risco.
- [ ] **Transferência internacional** (art. 33): todo contrato com operador fora do Brasil precisa incorporar as cláusulas-padrão da Res. CD/ANPD 19/2024, anexo II. O prazo para os contratos existentes venceu em 23/08/2025.
- [ ] **Região do Supabase:** conferir em Settings → General. Se não for `sa-east-1`, o DPA do Supabase também precisa das cláusulas.
- [ ] **Exclusão a pedido do titular:** apagar no Supabase, chamar o deauth do agregador e pedir ao agregador a deleção dos dados.
- [ ] Nomear cada operador (agregador, Supabase, provedor de IA) na política de privacidade.

Fontes:
- https://www.mattosfilho.com.br/unico/regulamentacao-transferencia-internacional-dados/
- https://www.demarest.com.br/?p=156219
- https://cesconbarrieu.com.br/anpd-aprova-regulamento-sobre-transferencias-internacionais-de-dados-2/
- https://www.migalhas.com.br/depeso/415220/anpd-aprova-o-regulamento-de-transferencia-internacional-de-dados
- https://lefosse.com/noticias/alerta/transferencia-internacional-de-dados-prazo-para-adocao-das-clausulas-padrao-da-anpd-se-encerra-em-23-de-agosto/
- https://arq.migalhas.com.br/arquivos/2026/2/DC8DD5485D6EBE_RESOLUCAOCD_ANPDNº19,DE23DEAGO.pdf
- https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/atos-normativos/regulamentacoes_anpd/documentos/rtid_anexo_1_d.pdf
- https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm
