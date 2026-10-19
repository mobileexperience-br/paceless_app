# APIs em nuvem dos fabricantes de relógio

Pesquisa de 19/10/2026 (trilha WS2). Cobre só as **APIs de nuvem dos fabricantes**. Health Connect e HealthKit estão em [relogios-e-saude.md](../pesquisa/relogios-e-saude.md).
Onde não consegui confirmar em fonte oficial, está marcado **a verificar**. Várias páginas oficiais responderam 403/404 ou não detalham o ponto; nesses casos usei fonte secundária e disse qual.

Legenda de esforço: P (pequeno), M (médio), G (grande).

## Resumo executivo

- **Garmin direto está bloqueado.** A Garmin pausou a análise de novos pedidos ao Connect Developer Program desde a primavera (hemisfério norte) de 2026 e não deu prazo de reabertura ([Terra](https://tryterra.co/blog/garmin-connect-developer-program-pause), [5krunner](https://the5krunner.com/2026/09/14/garmin-developer-api-access-paused/), [fórum Garmin](https://forums.garmin.com/apps-software/mobile-apps-web/f/garmin-connect-mobile-andriod/441607/garmin-connect-api-access-paused-for-months-what-are-startups-supposed-to-do)). Quem já era parceiro continua funcionando. A página oficial do programa não menciona a pausa, só "Stay tuned" ([Garmin](https://developer.garmin.com/gc-developer-program/overview/)). Confirmar com a Garmin: **a verificar**.
- **A única API de fabricante em que um app novo entra hoje sem ser empresa estabelecida é a Polar** (cliente criado por qualquer conta Flow). Mas a Polar não envia treino ao relógio e tem pouca base no Brasil (a verificar).
- **Enviar treino planejado ao relógio por nuvem** só é confirmado em Garmin (Training API, bloqueada) e COROS (Partner API, exige empresa). Suunto aceita FIT na conta, sem confirmação de que chega ao relógio. Wahoo tem escopos `plans_write`, foco em ciclismo, sem confirmação para corrida. Nos demais, não.
- **Strava**: viável tecnicamente, mas a política proíbe dados da API em IA, o que conflita com o plano adaptativo por IA.
- **Recomendação**: manter Health Connect/HealthKit como base e pedir já acesso a COROS, Suunto e Garmin (a aprovação é o gargalo). Construir a infra comum de nuvem e usar a Polar como primeiro conector de teste. Detalhes em [Prioridade](#prioridade-recomendada).

## Comparativo

| Fabricante | Acesso | Custo | Auth | Dados | Push (webhook) | Enviar treino ao relógio | Relevância BR |
|---|---|---|---|---|---|---|---|
| Garmin | Só empresa, aprovação. **Novos pedidos pausados** | Sem taxa de acesso; algumas métricas podem exigir licença | OAuth 2.0 (FAQ oficial) | Atividades com FIT, saúde diária, sono, FC | Sim (mecanismo: a verificar) | Sim, Training API (corrida: a verificar) | A verificar |
| Polar | Qualquer usuário Flow cria cliente | Não informado | OAuth 2.0 | Exercícios (FIT/TCX/GPX), FC contínua, sono, atividade | Sim (1 webhook por cliente) | Não | Baixa (a verificar) |
| COROS | Partner API: empresa registrada com base de usuários | Não informado | OAuth, client id/secret | Atividades, rotas GPX | Sim (~5 min) | Sim (treinos estruturados e planos) | A verificar |
| Suunto | Programa de parceiros, só empresa, resposta em ~2 semanas | Não informado | OAuth 2.0 + chave de assinatura | Treinos em FIT, passos e calorias diários | Sim, só treinos | FIT e rotas GPX na conta; chegada ao relógio: a verificar | Baixa (a verificar) |
| Wahoo | Pedido com justificativa de escopos; sandbox e produção separados | Não informado | OAuth 2.0 | Treinos, FIT | A verificar | Escopos `plans_write`/`routes_write`; foco ciclismo | Baixa para corrida |
| Amazfit/Zepp | Sem programa público encontrado | A verificar | A verificar | Só via agregadores | Sem push (agregador faz polling) | Não encontrado | Alta em volume de relógios (dado de 2021) |
| Samsung | Samsung Health Data SDK (Android local, não é nuvem), parceria aprovada | Não informado | Permissão no aparelho | Dados do Samsung Health | Não (SDK local) | Não | A verificar |
| Apple | Sem API de nuvem | n/a | n/a | Só HealthKit no aparelho | n/a | Fora do escopo (WorkoutKit, a verificar) | Alta no iOS |
| Strava | Todos podem pedir; limites de atletas | Assinatura Strava para o dev | OAuth 2.0 | Atividades, streams | Sim | Não | Muito alta como rede social |

## Por fabricante

### Garmin Connect Developer Program

Fontes oficiais: [visão geral](https://developer.garmin.com/gc-developer-program/overview/), [FAQ](https://developer.garmin.com/gc-developer-program/program-faq/), [Training API](https://developer.garmin.com/gc-developer-program/training-api/).

| Item | Situação |
|---|---|
| Modelo de acesso | Só uso empresarial. Pelo FAQ, resposta em 2 dias úteis e integração em 1 a 4 semanas. **Na prática, o formulário foi removido e novos pedidos estão pausados** desde a primavera de 2026; um candidato de março ainda esperava em setembro (relatos em fórum, não confirmados pela Garmin) |
| Custo | FAQ: sem taxa de licença ou manutenção. Algumas métricas podem exigir licença ou pedido mínimo de aparelhos; o contrato prevê taxas futuras com aviso de 30 dias (segundo a Terra) |
| Auth | OAuth 2.0 segundo o FAQ. A nota anterior do repositório dizia 1.0a; corrigir lá |
| APIs | Health (saúde diária), Activity (mais de 30 tipos, FIT), Women's Health, **Training** (treinos e planos estruturados no calendário do Garmin Connect), Courses |
| Push vs pull | Nuvem-a-nuvem. Mecanismo de ping/push: **a verificar** (a doc pública não detalha) |
| Enviar treino | Sim. O usuário consente, o Garmin Connect cuida do aparelho e o relógio baixa ao sincronizar. Suporte a corrida e formato: **a verificar** |
| Limites | Produção com acesso limitado (throttled) após aprovação; números: a verificar |
| Restrições | Marca Garmin Connect obrigatória (logotipo e regras de atribuição) |
| Contato | connect-support@developer.garmin.com |

Plano B: agregador (Terra mantém integração Garmin). É pago e o dado passa por terceiro, o que pesa contra a promessa de privacidade.

### Polar AccessLink

Fonte oficial: [documentação v3](https://www.polar.com/accesslink-api/).

| Item | Situação |
|---|---|
| Acesso | "Qualquer usuário Flow registrado pode criar um cliente" em admin.polaraccesslink.com, sob a licença limitada da Polar. Aprovação e custo: não informados |
| Auth | OAuth 2.0 authorization code (`flow.polar.com/oauth2/authorization`, token em `polarremote.com/v2/oauth2/token`). Código expira em 10 min e é de uso único. Token de acesso não expira, só se revogado |
| Dados | Exercícios com FIT, TCX e GPX, amostras, zonas e rota; FC contínua (5 min); sono; Nightly Recharge; atividade diária (até 365 dias atrás) |
| Push | 1 webhook por cliente, ping inicial com HTTP 200, assinatura HMAC SHA-256 no header `Polar-Webhook-Signature`. Desativa após 7 dias de falha. Eventos: EXERCISE, SLEEP, CONTINUOUS_HEART_RATE, ACTIVITY_SUMMARY etc. |
| Enviar treino | **Não** (nenhum endpoint) |
| Limites | 15 min: 500 + 20 por usuário. 24 h: 5000 + 100 por usuário. Cabeçalhos `RateLimit-*`, HTTP 429 |
| Restrições | Só exercícios dos últimos 30 dias e só depois do usuário se registrar no nosso cliente. Consentimentos obrigatórios (senão 403). TLS obrigatório |

### COROS

Fontes: [central de ajuda COROS](https://support.coros.com/hc/en-us/articles/360043975752-Exporting-Workout-Data-and-Uploading-to-3rd-Party-Apps), [Terra](https://tryterra.co/integrations/coros), [Final Surge](https://blog.finalsurge.com/sync-planned-structured-workouts-to-coros/), [Tredict](https://www.tredict.com/blog/coros_training_sync/). A página oficial da API respondeu 404; os dados abaixo vêm de resultados de busca e de parceiros, então **a verificar** na fonte oficial.

| Item | Situação |
|---|---|
| Acesso | Partner API para plataforma estabelecida: empresa registrada, base de usuários demonstrada, representante técnico, aceite dos termos. Pedido por e-mail a api@coros.com. Existe também integração via MCP, só de um usuário e sem webhook |
| Custo | Não informado |
| Auth | OAuth com client id e secret após verificação |
| Dados | Atividades, rotas GPX |
| Push | Webhook, dados em até ~5 min, com retentativa |
| Enviar treino | **Sim**: treinos estruturados e planos (parceiros enviam os próximos 4 a 7 dias). Corrida, bike, natação e força. Há relato de falha de sincronização após apagar plano no Training Hub |
| Limites | 1.000 chamadas por minuto (a verificar) |
| Parceiros | Strava, TrainingPeaks, Final Surge, Nike Run Club; abril/2026: integração bidirecional com Wahoo |

Barreira: "base de usuários demonstrada". Um app em pré-lançamento pode não passar; vale tentar com a landing e o plano de uso.

### Suunto

Fonte oficial: [FAQ da API Zone](https://apizone.suunto.com/faq), [upload de treinos](https://apizone.suunto.com/how-to-workout-upload).

| Item | Situação |
|---|---|
| Acesso | Programa de parceiros, para empresas e organizações, não para uso pessoal. Resposta em ~2 semanas. Uma conta por app |
| Custo | Não informado |
| Auth | OAuth 2.0 (código por JWT, Basic auth) + cabeçalho `Ocp-Apim-Subscription-Key` |
| Dados | Treinos em FIT (GPS, FC, voltas), passos e calorias diários. **Sem sono** |
| Push | Webhook POST com `username` e `workoutid`, só para treinos novos |
| Enviar treino | Aceita treinos em FIT e rotas GPX na conta do usuário, que aparecem no app Suunto. **Não está dito que chegam ao relógio** (a verificar) |
| Limites | Existem, sem números |
| Restrições | Publicação exige assinatura de produção e revisão da Suunto |

### Wahoo

Fonte oficial: [Cloud API](https://developers.wahooligan.com/cloud). Foco em ciclismo; baixa relevância para corredor iniciante.

- Acesso por pedido com justificativa de escopos ("pending approval" no portal). Sandbox e produção são apps separados e sandbox não vira produção.
- OAuth 2.0 com escopos `workouts_read/write`, `plans_read/write`, `routes_read/write`, `offline_data`, entre outros.
- Webhooks, limites e se `plans_write` entrega treino ao dispositivo: **a verificar** (a página não diz). Fontes de terceiros citam limite de 10 tokens por usuário desde 01/01/2026 e 25 req/5 min no sandbox; não confirmado na fonte oficial.

### Amazfit / Zepp

- Não encontrei programa público de API de nuvem com documentação oficial. Agregadores (Terra, Thryve) dizem integrar; a Terra faz polling a cada 5 a 10 min por falta de notificação ([Terra](https://tryterra.co/integrations/amazfit)). Programa oficial e termos: **a verificar** na Zepp Open Platform.
- Mercado: em 2021 a Zepp Health liderou wearables no Brasil com 36,8% segundo a IDC ([Tecnoblog](https://tecnoblog.net/noticias/amazfit-supera-samsung-e-apple-em-smartwatches-e-pulseiras-no-brasil/)). Dado antigo, não usar como atual.
- Caminho prático: se o app Zepp escreve no Health Connect/HealthKit (a verificar), a cobertura vem do plano base.

### Samsung

- **Samsung Health Data SDK** é um SDK Android local, não nuvem. Para distribuir exige pedido de parceria, aprovação e registro do pacote e do SHA-256; sem isso só funciona com modo desenvolvedor. Escrita exige código de acesso após aprovação. Não roda em emulador ([Samsung](https://developer.samsung.com/health/data/process.html)).
- Tipos de dado (exercício, rota, FC), custo e países suportados: **a verificar**. Se o Health Connect já entrega os treinos do Galaxy Watch, o SDK não é necessário; rota via Health Connect: a verificar.

### Apple

Não existe API de nuvem. Os dados do Apple Watch só chegam pelo HealthKit no aparelho (plano base). Enviar treino planejado ao Apple Watch seria via WorkoutKit no app nativo, assunto de outra trilha; **a verificar**.

### Strava

Fontes secundárias; o anúncio oficial é o post "An Update To Our Developer Program" na comunidade Strava, que não consegui abrir. [Terra](https://tryterra.co/blog/strava-api-changes-2026), [TechRepublic](https://www.techrepublic.com/article/news-strava-api-scraping-crackdown/), [fórum Intervals.icu](https://forum.intervals.icu/t/strava-api-update-new-terms-subs-required-for-api-access/130240). **O contrato oficial manda.**

| Item | Situação |
|---|---|
| Assinatura | Dev Standard precisa de assinatura Strava: novos desde 01/06/2026, existentes desde 30/06/2026. Extended Access isento. Preço citado: US$ 11,99/mês, varia por região. Sem taxa extra de API |
| Atletas | App novo: 1 atleta, sobe a 10 sem revisão. Mais que isso exige aprovação, até 9.999 (Standard). Sem garantia de prazo |
| Limites | 400 req/15 min e 4.000/dia no total; não-upload 200/15 min e 2.000/dia, compartilhados entre todos os atletas |
| IA | Proíbe dados da API em aplicações de IA (prompts, embeddings, RAG), inclusive derivados e anonimizados. Inferência só com dados do próprio atleta: sem resposta oficial |
| Dados | Cache de 7 dias. Dados do atleta só exibidos a ele mesmo |
| Intermediários | Apps que passam por plataformas intermediárias não são mais suportados |
| Migração | Novo host `api-v3.strava.com` em 04/01/2027; `oauth/deauthorize` sai em 01/06/2027 (usar `POST /oauth/revoke`); token em header obrigatório em 01/06/2027 |
| Enviar treino | Não |

Conclusão: dado Strava não entra no plano adaptativo. Poderia servir só para o usuário **publicar** a corrida no Strava (upload), outro caso de uso.

## Mercado no Brasil

Não encontrei participação por marca atual com recorte Brasil. Só há: Amazfit líder em 2021 (IDC); Euromonitor 2025 cita liderança da Apple e expansão da Xiaomi por preço; no mundo, a Huawei passou a Apple no 2T/2026 (Counterpoint, sem recorte Brasil). Garmin, COROS, Polar e Suunto no Brasil: **a verificar** (IDC ou Counterpoint com recorte Brasil). A pergunta sobre quais relógios o público usa segue aberta em [relogios-e-saude.md](../pesquisa/relogios-e-saude.md).

## Arquitetura para o Paceless

Respeita [CLAUDE.md](../../CLAUDE.md): chave e segredo só em Edge Function; o app nunca vê token de fornecedor.

### Fluxo OAuth

1. App chama `watch-connect-start` (JWT do usuário). A função gera `state` aleatório de uso único e `code_verifier` (PKCE onde o fornecedor aceitar), grava em `oauth_states` (user_id, provider, state, verifier, expira em 10 min) e devolve a URL de autorização.
2. App abre a URL com `expo-web-browser` (navegador do sistema, não WebView).
3. Fornecedor redireciona para `watch-oauth-callback` (URL pública da Edge Function, sem JWT). A função valida e apaga o `state`, troca o código por tokens com o segredo do cliente e grava os tokens cifrados.
4. A função redireciona para o deep link do app (`paceless://dispositivos?status=ok`). O app só descobre sucesso ou falha, nunca o token.
5. Desconexão: `watch-disconnect` revoga no fornecedor (Strava: `POST /oauth/revoke`) e apaga tokens e dados, conforme LGPD.

### Armazenamento de tokens

| Decisão | Motivo |
|---|---|
| Tabela `watch_connections` (user_id, provider, external_user_id, token_enc, refresh_enc, expires_at, scopes, last_sync_at) com RLS ligada e **nenhuma política para `authenticated`** | Cliente não lê nem escreve; só service role |
| Cifrar o token na função com AES-GCM (Web Crypto, chave de 256 bits em secret da função) ou usar Supabase Vault | Vazamento de backup ou de SQL não expõe token. Vault vs. AES na função: **a verificar** na doc atual do Supabase |
| View `watch_connections_status` só com provider, conectado e last_sync_at | O app mostra "Conectado" sem tocar no segredo |
| `ON DELETE CASCADE` em `auth.users` | Exclusão de conta apaga tudo (regra existente) |
| Refresh de token dentro das funções, com lock por conexão | Evita corrida entre webhook e sync manual |

### Receptores de webhook

| Fornecedor | Função | Validação |
|---|---|---|
| Polar | `webhook-polar` | HMAC SHA-256 do corpo com o segredo mostrado uma vez na criação; responder 200 ao ping. Job diário para reativar se desativar após 7 dias de falha |
| Suunto | `webhook-suunto` | Assinatura não documentada; validar `username` conhecido e buscar o FIT com o token (a verificar se há autenticação do webhook) |
| COROS, Garmin | `webhook-coros`, `webhook-garmin` | Conforme contrato após aprovação |

Padrão: responder 200 rápido, gravar o evento em fila (`watch_events` com provider, external_id, payload, status) e processar depois (pg_cron ou invocação assíncrona), com idempotência por (provider, external_id). Regra do repositório: função com até 200 linhas e sem comentário; separar em `_shared/` o que é por fornecedor, parser e dedup.

### Parser de FIT

| Opção | Notas |
|---|---|
| [`@garmin/fitsdk`](https://github.com/garmin/fit-javascript-sdk) (oficial) | Decoder JS para Node e navegador; npm listava 21.141.0 e há menção a 21.161.0 com encoder. Uso via `npm:` no Deno: **a verificar** |
| [`fit-file-parser`](https://github.com/jimmykane/fit-parser) v5 | TypeScript, campos alinhados ao perfil Garmin; pede Node 20+. Pelo `npm:` no Supabase (suporte a npm é GA, [Supabase](https://supabase.com/features/npm-compatibility)); teste real: a verificar |
| [`fitreader` (deno.land)](https://deno.land/x/fitreader) | Nativa em Deno, mas pouco testada e parada há anos. Não recomendo |

Recomendação: `@garmin/fitsdk`, testado numa Edge Function antes de decidir. Saída normalizada para `activities` (distância, duração, ritmo médio, FC média e máxima) e, depois, amostras e rota. A Polar também entrega TCX, GPX e JSON, o que dispensa FIT nesse conector.

### Deduplicação com corridas gravadas no celular

- Idempotência: `UNIQUE (user_id, source, external_id)` (já no esboço de [relogios-e-saude.md](../pesquisa/relogios-e-saude.md)).
- Mesma corrida em fontes diferentes (gravada no app e vinda do relógio, ou Polar e Health Connect): considerar igual se `started_at` difere até 2 min **e** duração e distância diferem até 5%. Valores iniciais, calibrar com dados reais.
- Qual vence: manter a do relógio (FC e GPS melhores) e marcar a do app com `merged_into`, em vez de apagar. Mostrar uma só ao usuário.
- Hoje `activities` não tem `source` nem `external_id` (migration `20261019180000_create_activities.sql`); será preciso migration, fora do escopo deste doc.

### Enviar treino ao relógio

Camada separada `workout-push-<provider>` que converte o plano do Paceless (distância, ritmo-alvo, intervalos) para o formato do fornecedor (Garmin Training API, COROS, FIT workout da Suunto). Só COROS e Garmin estão confirmados como entrega ao relógio, e ambos dependem de aprovação. Enquanto isso, o treino fica no app.

## Prioridade recomendada

| # | O quê | Esforço | Por quê | Risco |
|---|---|---|---|---|
| 0 | Health Connect e HealthKit (base) | G (já estimado) | Cobre a maioria dos relógios sem aprovação de ninguém | Revisão das lojas por permissão de saúde |
| 1 | Pedir acesso agora: COROS Partner, Suunto, Garmin (entrar na fila quando reabrir) | P (burocracia) | Aprovação leva semanas e é o gargalo; começar em paralelo | Negativa por falta de base de usuários |
| 2 | Infra comum: OAuth, tokens cifrados, fila de webhook, parser FIT, dedup | M | Necessária para qualquer fornecedor | Segurança dos tokens |
| 3 | Polar AccessLink | M | Único com acesso aberto hoje; webhook e FIT/GPX; serve de teste da infra | Pouca base no Brasil; sem envio de treino |
| 4 | Garmin (Activity + Training) quando reabrir | G | Maior ganho: importar e **enviar treino**; o Garmin Coach é concorrente direto | Pausa sem prazo; exige empresa e marca Garmin |
| 5 | COROS, se aprovado | G | Envio de treino confirmado | Exige base demonstrada |
| 6 | Suunto, Wahoo, Zepp direto, Samsung SDK | M cada | Público pequeno ou sem programa claro | Pouco retorno |
| X | Strava | M | Não alimentar IA; só publicar corrida, se um dia for requisito | Termos mudam; assinatura do dev; IA proibida |

Para iniciantes no Brasil, o ganho mais barato é o plano base. A nuvem direta só se justifica com Garmin (envio de treino) e COROS. Polar antes dessas aprovações é opcional: valida a infra, mas o retorno de mercado é baixo.

## Perguntas em aberto

1. A Garmin reabrirá as inscrições? Existe contato direto (pergunta 5 da pesquisa anterior)?
2. Quais relógios o público do Pedro usa? Define se vale esperar Garmin e COROS.
3. Strava como destino de publicação (não como fonte) interessa?
4. Vault ou AES na função para os tokens (confirmar na doc atual do Supabase).
5. `@garmin/fitsdk` roda em Edge Function? Testar.
