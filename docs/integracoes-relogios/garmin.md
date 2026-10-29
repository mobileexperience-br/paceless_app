# Garmin (Garmin Connect Developer Program)

> Pesquisa de 2026-10-29, em três rodadas (pesquisa → revisão → pesquisa). Legenda:
> **[OFICIAL]** página, PDF ou formulário da Garmin. **[COMUNIDADE]** blog, repositório ou fórum.
> **a confirmar** quer dizer fonte única, fontes em conflito ou inferência nossa.
> Complementa o plano geral em `docs/relogios.md`.

## Resumo

**O que é.** É o programa da Garmin que dá acesso via API aos dados do Garmin Connect (atividades, arquivos .FIT, saúde) e permite enviar treinos estruturados para o relógio (Training API). A Garmin fechou novos cadastros em março de 2026, por cerca de 7 meses. O motivo oficial foi o volume de pedidos; o the5krunner cita também o processo da Strava (**a confirmar**). Em **21/10/2026 o programa reabriu com 3 níveis** [OFICIAL] ([overview](https://developer.garmin.com/gc-developer-program/overview/)).

| | Personal | **Starter** | Enterprise |
|---|---|---|---|
| Para quem | Uma pessoa, só os próprios dados | Devs, startups, empresas | Empresas "em escala" |
| Como obter | Self-service em https://connect.garmin.com/app/settings/personalApiToken | [Formulário Starter](https://www.garmin.com/en-US/forms/StarterGarminConnectDeveloperAccess/) | Pelo Developer Portal, ou como upgrade do Starter |
| APIs | Activity (JSON + .FIT), Health, Women's Health | As do Personal + **Training, Courses** | As do Starter + Golf |
| Entrega | Só pull [OFICIAL] | **Só push** | Push ou Ping/Pull |
| Histórico anterior à conexão | Não informado | **Nenhum** (sem backfill) | 1 mês ou mais (backfill) |
| Limite de usuários | A própria conta | "Limited" [OFICIAL]; cerca de **1.000** [COMUNIDADE, várias fontes] | Ilimitado |
| Suporte | Não informado | Não informado | Sim |
| Preço | Grátis [COMUNIDADE] | Grátis [COMUNIDADE] | US$ 1.000 de entrada (abatidos da fatura) + preço por MAU negociado [COMUNIDADE, DC Rainmaker] |

Quem já era parceiro virou Enterprise automaticamente e passa a pagar por usuário ativo a partir de 2027-04-01 ([DC Rainmaker](https://www.dcrainmaker.com/2026/10/garmin-connect-api-revamps-connect-developer.html)).

**Vale para o Paceless?** Sim. A Garmin é a marca de relógio dominante entre corredores, e o Starter cobre exatamente o que precisamos:
1. importar corridas feitas, com o .FIT completo (FC por segundo, GPS, voltas);
2. **enviar treinos estruturados para o relógio** (Training API), que é o diferencial do plano adaptativo;
3. ler FC de repouso, HRV e sono para ajustar a carga.

**Recomendação.** Pedir o **Starter** agora (grátis, cerca de 1.000 usuários, inclui Training). As limitações a planejar:
- não há histórico anterior à conexão (o fallback é Health Connect/HealthKit ou a importação do ZIP de exportação da Garmin);
- não há polling, os dados só chegam por webhook;
- a cláusula de "receita derivada da API" (5.2(e)) e as regras de IA precisam de confirmação por escrito da Garmin.

Integração direta. Agregadores (Terra, ROOK, Sahha) não dispensam a aprovação da Garmin e somam custo e mais um terceiro.

## Cadastro e burocracia

Responsável: **Pedro**. O formulário pede que o contato tenha "legal authority to represent your company".

### Pré-requisitos (antes de abrir o formulário)

- [ ] **CNPJ ativo.** O formulário não pede o número, mas pede "legal company name" e um representante legal, e o FAQ diz que o programa é "only for business use". Pessoa física não consegue preencher com honestidade [OFICIAL + inferência].
- [ ] **Site público** da empresa no ar.
- [ ] **Política de privacidade pública** (LGPD), com o conteúdo da seção "Limites e termos de uso". O formulário diz: "this is a legal requirement".
- [ ] **E-mail corporativo** compartilhado (ex.: `dev@<domínio>`). Não usar e-mail pessoal nem gratuito.
- [ ] **Conta Garmin (SSO)** criada com esse e-mail, com **2FA ativado**. O formulário usa o login Garmin e reCAPTCHA. A conta provavelmente vira dona do portal (**a confirmar**).
- [ ] **Decidir se algum LLM vai processar dados da Garmin.** Se sim, o fornecedor entra no campo 12.
- [ ] **Separar documentos** para o caso de a Garmin pedir (não há lista pública):
  - cartão CNPJ;
  - contrato social mostrando os poderes do Pedro;
  - comprovação do domínio/site;
  - política de privacidade;
  - descrição da empresa em inglês.
- [ ] **Termos de Uso do Paceless com a cláusula Garmin** (exigência da cláusula 5.3, ver abaixo). Pedir revisão de advogado.

### Passo a passo

1. **Preencher o [formulário Starter](https://www.garmin.com/en-US/forms/StarterGarminConnectDeveloperAccess/)**, em inglês. Campos capturados do HTML da página em 2026-10-29 [OFICIAL]; todos são obrigatórios, menos o 16.

| # | Campo | Opções | O que preencher |
|---|---|---|---|
| 1 | Company Name | texto, até 100 caracteres, "legal company name" | Razão social do CNPJ |
| 2 | Company Website URL | texto | Site público |
| 3 | Company Privacy Policy URL | texto | URL da política LGPD |
| 4 | Contact Name | nome e sobrenome, "legal authority" | Pedro (sócio/administrador no contrato social) |
| 5 | Job Title | texto | Co-founder / CEO |
| 6 | Email address | e-mail | E-mail corporativo |
| 7 | Country & State | lista | Brazil + estado |
| 8 | Primary business service | escolha única (Health & Activity Insights, Coaching & Training Programs, …, AI & Foundation Model Services) | **Coaching & Training Programs** |
| 9 | Industry | escolha única (Fitness & Wellness, Personal Training & Coaching, …) | **Fitness & Wellness** |
| 10 | Visão geral do app e de como as APIs serão usadas | texto longo | Rascunho abaixo |
| 11 | Modelo de negócio | texto longo | Freemium + assinatura premium (RevenueCat). Ser explícito, por causa da cláusula 5.2(e) |
| 12 | Terceiros que processam, analisam ou armazenam dados Garmin (inclusive analytics, ML, IA) | texto longo | Supabase (hospedagem/banco, com a região); o LLM, se houver; declarar que o PostHog **não** recebe dados Garmin (só se for verdade) |
| 13 | APIs de interesse | múltipla escolha: Activity / Courses / Health / Training / Women's Health | **Activity, Health, Training**. Courses fica fora da v1; pedir menos APIs provavelmente facilita a revisão (**a confirmar**) |
| 14 | Usuários esperados em 12 meses | `0-100` / `100-1000` / `1000>` | `100-1000` |
| 15 | Já teve contato com a Garmin? | No / Yes | No |
| 16 | Nome do contato Garmin | opcional | — |

Rascunho para o campo 10 (Pedro adapta):

> Paceless is a running training app (iOS/Android) for Brazilian runners. Users connect their Garmin account via OAuth2 to (1) import completed runs (Activity API, JSON + FIT) so we can compare executed vs planned sessions and adapt the plan, (2) send structured running workouts (warm-up, intervals with pace/HR targets, cool-down) to Garmin Connect and their watch, scheduled on the planned date (Training API), and (3) read resting HR / HRV / sleep (Health API) to adjust training load. Data is shown only to the owning user, with Garmin attribution. Users can disconnect at any time, which calls DELETE /user/registration and deletes stored Garmin data.

2. **Esperar a aprovação.** O FAQ fala em "immediate access", mas também em "after ... your request has been approved", e a confirmação do formulário diz "we'll be reaching out to you soon" [OFICIAL]. Existe revisão humana e o prazo é **desconhecido**. Um comentarista relata acesso no mesmo dia [COMUNIDADE]. **Planejar de 1 a 4 semanas**, mais 1 a 4 semanas de integração, segundo o FAQ. Até a revisão o app pode aparecer como "unverified", com limite de novas conexões (**a confirmar**).
3. **Criar o app no portal** (https://developerportal.garmin.com/developer-programs/myapp) para obter o **Consumer Key / Secret** (`client_id` / `client_secret` do OAuth2). Os campos do app não estão documentados publicamente. Ter prontos:
   - nome "Paceless" e descrição curta em inglês;
   - ícone PNG quadrado de 512 px ou mais;
   - site, política de privacidade e e-mail de suporte;
   - redirect URI `https://<ref>.supabase.co/functions/v1/garmin-oauth-callback` (se é preciso pré-registrar: **a confirmar**).
4. **Ativar as APIs** Activity, Health e Training.
5. **Configurar os endpoints de webhook** (API Tools / Endpoint Configuration) com **uma única URL** para todos os feeds: `https://<ref>.supabase.co/functions/v1/garmin-webhook?token=<segredo de 32+ bytes>`. Deixar em **On Hold** até o backend estar validado; a Garmin segura as notificações e entrega tudo ao liberar ([dofek](https://github.com/Asherlc/dofek/blob/main/docs/garmin.md)).
6. **Ler e arquivar a versão do Developer Program Agreement aceita no cadastro.** A cópia pública é FRM-0952 Rev. B, com metadados de 2023, e não tem cláusula de IA. Salvar o PDF da versão que aparecer no cadastro.
7. **Baixar os PDFs do portal** (exigem login): Start Guide 2.0, Activity API 2.0, Health API 2.0, OAuth2 PKCE, **Training API V2** e API Brand Guidelines com os assets de logo.
8. **Mandar as perguntas pelo [Developer Contact form](https://www.garmin.com/en-US/forms/developercontactus/)** e guardar as respostas por escrito:
   - [ ] Uma assinatura premium que inclui sync com a Garmin conta como "derive income from the API" (5.2(e))? A aprovação do formulário vale como permissão escrita?
   - [ ] Podemos usar um LLM de terceiro para gerar respostas/planos para o próprio usuário a partir dos dados dele, sem treinar modelos? Qual o texto exato da cláusula de IA?
   - [ ] O que acontece ao atingir o limite de usuários do Starter, e qual o caminho e o preço do Enterprise?
   - [ ] Dá para adicionar mais membros do time ao app no portal?
   - [ ] Existe sandbox ou conta de teste para o Starter?
9. **Criar uma conta Garmin de teste** (outro alias corporativo) para os testes de OAuth e Training API.
10. **Guardar os segredos só no Supabase:** `supabase secrets set GARMIN_CLIENT_ID=... GARMIN_CLIENT_SECRET=... GARMIN_WEBHOOK_TOKENS=... GARMIN_TOKEN_KEY=...`. Compartilhar com o time só por gerenciador de senhas.

**Custo:** US$ 0 no Starter [COMUNIDADE]. A Garmin pode começar a cobrar com 30 dias de aviso (cláusula 10.1) e pode cobrar volume acima dos limites (10.2).

### LGPD e lojas (também com o Pedro)

- [ ] **Nomear encarregado (DPO)** e publicar o contato (LGPD art. 41). A Resolução CD/ANPD nº 2/2022 dispensa agentes de pequeno porte, **mas não em tratamento de alto risco**; dado de saúde em escala provavelmente é alto risco (inferência, validar com advogado).
- [ ] **Preparar um RIPD** (relatório de impacto, art. 38), porque são dados sensíveis.
- [ ] **Supabase:** usar a região `sa-east-1` (São Paulo) se possível e assinar o DPA do Supabase. Se a região for fora do Brasil, há transferência internacional (art. 33; Resolução CD/ANPD nº 19/2024 sobre cláusulas-padrão, **a confirmar**).
- [ ] **Google Play:** Data safety + Health apps declaration.
- [ ] **Apple:** guideline 5.1.3 (dados de saúde: sem anúncios nem mineração de dados, política de privacidade obrigatória).

## Dados disponíveis

### Activity API (push)
- **`activities`**: `userId`, `summaryId`, `activityId`, `activityType`, `activityName`, `deviceName`, `startTimeInSeconds`, `durationInSeconds`, `distanceInMeters`, `averageHeartRateInBeatsPerMinute`, `maxHeartRateInBeatsPerMinute`, `steps`, `activeKilocalories` ([dofek payloads.ts](https://github.com/Asherlc/dofek/blob/main/src/providers/garmin/payloads.ts)).
- **`manuallyUpdatedActivities`**: revisões de atividades.
- **`activityFiles`**: `{userId, summaryId, activityId, activityType, startTimeInSeconds, fileType: "FIT"|"TCX"|"GPX", callbackURL, manual?}`.
  - O `callbackURL` aponta para `https://apis.garmin.com/wellness-api/rest/activityFile?...`, traz um token de curta duração e é **de uso único**. Baixar e arquivar no Storage na hora.
  - O .FIT tem amostras por segundo (FC, velocidade, GPS, altitude, cadência), voltas e sessão.
- **Lacunas conhecidas:**
  - não existe notificação de atividade apagada (duas fontes, **a confirmar**);
  - desde outubro de 2026 o .FIT entregue pela API viria sem VO2max, tempo de recuperação e performance condition (fonte única: Runalyze via Sahha, **a confirmar**). O VO2max continua vindo pela Health API.

### Health API (push)
- **`dailies`**: `restingHeartRateInBeatsPerMinute`. Usar este para a FC de repouso; a do `sleeps` é média do sono ([Terra FAQ](https://docs.tryterra.co/faq/help-topics/data-api-sdk/data-model-fields-and-units/resting-vs-average-hr-scope)).
- **`hrv`**: `lastNightAvg` (ms) e `hrvValues` a cada 5 minutos (**a confirmar**).
- **`sleeps`**: `durationInSeconds`, duração das fases, `overallSleepScore`.
- Outros feeds: `epochs`, `bodyComps`, `pulseox`, `allDayRespiration`, `stressDetails` ([Fitabase data dictionary](https://fitabase.com/media/2193/fitabase-garmin-data-dictionary.pdf)).
- **Atraso:** os dados só chegam depois que o relógio sincroniza com o celular (de minutos a horas). Um valor da manhã que não chegou é "desconhecido" e não deve travar o plano.

### Feeds de controle
- `deregistrations: [{userId, userAccessToken}]`: o usuário desconectou pelo lado da Garmin.
- `userPermissionsChange: [{userId, permissions}]`: o usuário mudou as permissões.

### Permissões do usuário
`GET .../user/permissions` devolve itens como `ACTIVITY_EXPORT`, `HEALTH_EXPORT`, `WORKOUT_IMPORT`, `COURSE_IMPORT`, `MCT_EXPORT`. Quem escolhe as permissões é o usuário, na tela de consentimento.

### Training API (escrita)
Cria treinos estruturados e agenda numa data; eles aparecem no Garmin Connect e no relógio na próxima sincronização. Exige `WORKOUT_IMPORT`. A página oficial (https://developer.garmin.com/gc-developer-program/enterprise/training-api/) é só uma visão geral. Os endpoints e o schema abaixo vêm de **três repositórios em produção que fizeram engenharia reversa** e concordam entre si (openathlete, watt-mind/coach, quantified-self). O PDF V2 do portal prevalece sobre eles.

| Ação | Método + URL |
|---|---|
| Criar treino | `POST https://apis.garmin.com/workoutportal/workout/v2` (watt-mind tenta `.../training-api/workout/v2` primeiro; **a confirmar**) |
| Ler / atualizar / apagar | `GET` / `PUT` / `DELETE https://apis.garmin.com/training-api/workout/v2/{workoutId}` |
| Agendar | `POST https://apis.garmin.com/training-api/schedule/` com `{ "workoutId": 123, "date": "YYYY-MM-DD" }`; a resposta pode ser só um inteiro |
| Atualizar / apagar agendamento | `PUT` / `DELETE .../training-api/schedule/{scheduleId}` |

Regras aprendidas em produção (cada uma **a confirmar** no PDF):
- 412 significa que o usuário não liberou `WORKOUT_IMPORT`.
- Apagar o treino apaga também os agendamentos dele.
- O PUT exige o treino completo, com o `workoutId` do path e o `ownerId` existente. Por isso faz-se GET antes de PUT.
- O `ownerId` é o id numérico do Connect, **não** o UUID de `/user/id`. Na criação, omitir `workoutId` e `ownerId`.
- Cerca de 100 passos-folha por treino.
- `workoutProvider` e `workoutSourceId` têm no máximo 20 caracteres.
- A V2 usa `sport` + `segments[]`. Não enviar `steps` no topo do objeto (esse é o formato V1).
- Repetições vão num `WorkoutRepeatStep` com `repeatType: "REPEAT_UNTIL_STEPS_CMPLT"`. O `stepOrder` é global, com o pai antes dos filhos.
- O alvo de pace é em **m/s**. Alvo secundário só é garantido para ciclismo e natação; omitir na corrida.
- Para conferir, usar `GET` ou o relógio. A interface web do Connect usa outros IDs.
- Não há endpoint de plano de várias semanas nos repositórios. Decisão: treinos avulsos + agendamentos numa janela móvel.

### Connect IQ (fase 5, programa separado)
Connect IQ (apps em Monkey C) é grátis e independente do Developer Program [OFICIAL, FAQ]. Um **data field** lê `Activity.Info.currentHeartRate` dentro da corrida nativa da Garmin. Comunicação com o celular em data field em primeiro plano só a partir da API 5.0; em aparelhos antigos, só por background service ([fórum](https://forums.garmin.com/developer/connect-iq/f/discussion/443774/solutions-for-real-time-phone-communication-on-older-devices)). Recomendação: para FC ao vivo, o celular lê a cinta por BLE (`ble-heart-rate.md`); o Connect IQ fica só para um data field "alvo Paceless". Preço de apps pagos (US$ 100/ano + 15%, dado de 2024) fora do plano até confirmar.

## Autenticação e sincronização

### OAuth 2.0 PKCE [OFICIAL, [OAuth2PKCE_1.pdf](https://developerportal.garmin.com/sites/default/files/OAuth2PKCE_1.pdf)]
O FAQ confirma: "All APIs in the Developer Program use OAUTH 2.0". O OAuth 1.0a está fora.

- **Authorize:** `GET https://connect.garmin.com/oauth2Confirm`
  - parâmetros: `response_type=code`, `client_id`, `code_challenge` = base64url(sha256(verifier)), `code_challenge_method=S256`, `redirect_uri` (opcional), `state`;
  - o verifier tem de 43 a 128 caracteres `[A-Za-z0-9-._~]`;
  - **não existe parâmetro `scope`**: os escopos são fixos no app e o usuário escolhe as permissões na tela.
- **Token:** `POST https://diauth.garmin.com/di-oauth2-service/oauth/token` (form-urlencoded)
  - body: `grant_type=authorization_code`, `client_id`, **`client_secret`**, `code`, `code_verifier`, `redirect_uri`;
  - resposta: `access_token`, `expires_in: 86400` (24 h), `refresh_token`, `refresh_token_expires_in: 7775998` (cerca de 90 dias), `scope`, `jti`. O texto do PDF fala em "three months" para o access token; tratamos os 3 meses como validade do refresh token (**a confirmar**).
- **Refresh:** mesmo endpoint, com `grant_type=refresh_token`, `client_id`, `client_secret` e `refresh_token`. **Cada refresh devolve um refresh_token novo**, então sempre salvar o último. A Garmin recomenda renovar cerca de 600 s antes de expirar.
- **Credenciais do cliente:** o PDF manda no body; o dofek usa header Basic. Implementar body e cair para Basic em caso de 401 (**a confirmar**).
- **Endpoints do usuário** (Bearer, base `https://apis.garmin.com/wellness-api/rest`):
  - `GET /user/id` devolve `{"userId":"..."}`, estável entre reconexões. É a chave para casar webhook com usuário.
  - `GET /user/permissions`.
  - **`DELETE /user/registration`** é obrigatório quando o app oferece "Desconectar" ou "Excluir conta".
  - O dofek usa `partner-gateway/rest`; os outros três projetos e o PDF usam `wellness-api`. Usamos `wellness-api`.
- **403 na primeira checagem de permissões** (visto no dofek): fazer retry com backoff (1 s, 5 s, 30 s) (**a confirmar**).
- **Refresh falhou com `invalid_grant`, ou o refresh token expirou:** a única saída é reconectar. Marcar `status = 'reconnect_required'`.

### Fluxo no Paceless
1. O app chama a Edge Function `garmin-oauth-start` (com JWT). Ela gera verifier e state, grava em `oauth_states` (TTL de 10 min) e devolve a URL de authorize.
2. O app abre `WebBrowser.openAuthSessionAsync(url, "paceless://garmin/connected")`.
3. A Garmin redireciona para a Edge Function `garmin-oauth-callback` (sem JWT). Ela consome o state, troca o code pelo token, busca `/user/id`, grava os tokens criptografados e responde 302 para `paceless://garmin/connected?status=ok`.
4. O app recarrega `my_connections`. A tela `app/garmin/connected.tsx` cobre o cold start pelo deep link. O app.json precisa de `scheme: "paceless"`.
5. Alguns navegadores Android bloqueiam o 302 automático para esquema customizado. Fallback: devolver uma página HTML com o link "Voltar ao Paceless" (**a confirmar**).

### Sincronização (push)
- A Garmin faz POST com JSON na URL configurada, só na porta 443. Não há assinatura HMAC.
- O header `garmin-client-id` **não é autenticação**, porque o client id não é segredo ([quantified-self](https://github.com/jimmykane/quantified-self/blob/main/docs/garmin-integration.md)). A checagem real é o token secreto na query string (comparação em tempo constante); o header serve só como filtro barato.
- **Timeout de cerca de 30 s** ([Open Wearables](https://github.com/the-momentum/open-wearables/blob/main/backend/app/services/providers/garmin/webhook_handler.py)). Responder 200 rápido, depois de gravar o payload bruto.
- Respostas não-2xx são reenviadas; a política de retry é **a confirmar**. Responder 5xx só quando a gravação falhar.
- Para recuperar dados perdidos, o portal tem o **Summary Resender**.
- **Idempotência:**
  - `summaryId` **não é estável**, a Garmin pode reemitir com outro id;
  - chavear atividades por `(garmin_user_id, activityId)`;
  - chavear dailies, sleeps e hrv por `(garmin_user_id, calendarDate)`;
  - a entrega com maior `uploadEndTimeInSeconds` vence;
  - duplicatas são normais.
- **Download do .FIT:**
  - Bearer do usuário, com a URL exatamente como chegou;
  - validar antes: host `apis.garmin.com`, path `/wellness-api/rest/activityFile`, sem porta, sem userinfo, sem seguir redirect (proteção contra SSRF);
  - nunca logar a URL.

### Ping/Pull e backfill
Só no Enterprise: `GET /wellness-api/rest/backfill/{activities|dailies|...}?summaryStartTimeInSeconds&summaryEndTimeInSeconds` devolve 202 (aceito) ou 409 (já pedido), e os dados chegam depois por push. **No Starter não há.**

## Limites e termos de uso

### Rate limits
Não há números públicos atuais. O PDF da Training API rev 1.0 (2020-12-01), numa [cópia no Scribd](https://www.scribd.com/document/794187143/Garmin-Connect-Developer-Program-Training-API), traria os valores abaixo. **Dado de 2020, a confirmar no PDF V2**:

| Limite | Valor | O que conta |
|---|---|---|
| Por parceiro | 100 chamadas/min (janela móvel de 60 s) | inclusive as chamadas OAuth |
| Por usuário | 200 chamadas/dia (janela móvel de 24 h) | exceto as chamadas OAuth |

Consequências:
- Publicar um treino custa 2 chamadas; atualizar custa 2.
- **Publicar só uma janela móvel de 7 a 10 dias**, comparar o hash do conteúdo e nunca republicar o plano inteiro.
- Enfileirar todas as escritas e drenar cerca de 60 chamadas/min.
- Renovar tokens sob demanda, nunca todos de uma vez.
- No 429, respeitar `Retry-After`; sem o header, backoff a partir de 60 s.

### Developer Program Agreement (FRM-0952 Rev. B, lido na íntegra) [OFICIAL]
Fonte: [PDF público](https://developerportal.garmin.com/sites/default/files/Garmin%20Connect%20Developer%20Program%20Agreement.pdf), com metadados de 2023-10-04. A Sahha chama a Rev. B de "março de 2026"; **conferir a versão aceita no cadastro**.

- **5.2(e):** é proibido "derive income from the use or provision of the API ... without Garmin's prior written permission". É uma redação ampla, e uma assinatura premium pode se enquadrar. Descrever o modelo de negócio no campo 11 e perguntar por escrito.
- **5.2(o):** é proibido repassar dados ou funcionalidades da API a terceiros não aprovados, inclusive por uma API própria.
- **5.1(f)–(h):** é preciso um programa de segurança no padrão do mercado. Incidentes ou vazamentos devem ser comunicados a **security@garmin.com e +1 913.440.3500 em até 24 h**.
- **5.3:** os Termos de Uso do Paceless devem proteger a Garmin no mínimo tanto quanto este contrato:
  - a Garmin como terceira beneficiária;
  - nenhuma garantia dada pela Garmin;
  - limitação da responsabilidade da Garmin;
  - aceite dos termos e da [privacidade do Garmin Connect](https://www.garmin.com/privacy/connect);
  - nenhum uso médico.
- **5.4:** proibido uso para crédito, seguro ou emprego. **5.6:** conformidade regulatória (dispositivo médico) é responsabilidade nossa.
- **6.1 a 6.3 e Brand Guidelines:** é obrigatório exibir a marca Garmin nos dados vindos do Garmin Connect. A visão geral das [guidelines](https://developer.garmin.com/brand-guidelines/overview/) cita também **dados exportados e derivados**. Não distorcer o logo.
- **9.2:** a Garmin pode rescindir com 30 dias de aviso; numa rescisão, destruir os assets.
- **10.1 / 10.2:** a Garmin pode começar a cobrar com 30 dias de aviso, e cobrar volume acima dos limites.
- **15.2:** a Garmin é **controladora independente**, então não existe DPA com ela. O Paceless é controlador do que recebe.
- **15.4:** antes de coletar, é preciso aviso claro, consentimento com **revogação fácil** e atendimento aos direitos do titular (acesso, correção, exclusão, oposição, portabilidade).
- **15.5:** não vender dados pessoais. **15.6:** não alterar os dados do usuário pela API. **15.7:** avisar a Garmin de investigação de regulador.
- **15.8:** nunca pedir a senha Garmin do usuário; usar só o OAuth da Garmin.
- **15.9:** as cláusulas-padrão valem só para dados vindos do EEE, Suíça e Reino Unido. Para o Brasil, o texto diz apenas "cooperate as necessary".
- **4.5:** como a Training API **envia dados para a Garmin**, é preciso consentimento expresso do usuário e o link da privacidade do Garmin Connect.
- **16.x:** arbitragem ICDR em Nova York, em inglês.

### IA
A versão pública do contrato **não tem cláusula de IA**. Open Wearables e Sahha descrevem uma restrição: não usar os dados para treinar ou melhorar modelos próprios; rodar um modelo existente sobre os dados de um usuário para responder a ele "pode ser possível", com consentimento e uma declaração de transparência. O texto exato e o número da cláusula são **a confirmar**; **não citar "15.10" para a Garmin**. O campo 12 e a categoria "AI & Foundation Model Services" mostram que a Garmin avalia isso.

Regras para o Paceless:
- nunca treinar modelos com dados Garmin;
- usar LLM sobre dados Garmin só depois de confirmação por escrito da Garmin, com tela de consentimento separada e revogável e o fornecedor declarado no campo 12.

### LGPD
- FC, HRV e sono são **dados pessoais sensíveis** (art. 11). Exigem consentimento **específico e destacado**, o que se alinha com a cláusula 15.4. Uma tela de consentimento pode cobrir Garmin, LGPD e (se houver) IA.
- **Conteúdo mínimo da política de privacidade:**
  - quais dados Garmin são lidos e por quê;
  - a base legal (art. 11, I);
  - os operadores (Supabase com a região, LLM se houver);
  - a declaração de IA;
  - o prazo de retenção;
  - como revogar (botão "Desconectar Garmin" e e-mail);
  - os direitos do titular;
  - o link https://www.garmin.com/privacy/connect;
  - o contato do encarregado.
- **Ao desconectar:**
  1. apagar os treinos futuros publicados;
  2. chamar `DELETE /user/registration`;
  3. apagar tokens, dados e .FITs derivados da Garmin (ou anonimizar, conforme a política).

## Arquitetura no Paceless

```
App Expo ──JWT──> garmin-oauth-start ──URL──> navegador ──> connect.garmin.com
                                                     │
Garmin ──302 code──> garmin-oauth-callback ──troca token──> connected_devices
                         └──302──> paceless://garmin/connected

Garmin ──POST push──> garmin-webhook ──insert──> garmin_inbox ──(pg_cron 1 min)──> garmin-process
                                                                  ├─ baixa .FIT → Storage garmin-fit/
                                                                  ├─ parse (@garmin/fitsdk) → runs / run_laps
                                                                  └─ dailies/sleeps/hrv → health_daily
App ──JWT──> garmin-publish (enfileira) ──> garmin_publish_queue ──(cron)──> Training API
```

### Edge Functions
| Função | JWT | Papel |
|---|---|---|
| `garmin-oauth-start` | sim | Gera PKCE e state e devolve a URL |
| `garmin-oauth-callback` | **não** | Troca o code, grava tokens, redireciona |
| `garmin-webhook` | **não** | Valida o token, grava um item por linha no inbox, responde 200 |
| `garmin-process` | segredo do cron | Processa o inbox (deregistration, permissões, atividades, .FIT, saúde) |
| `garmin-publish` | sim / cron | Diff + create/PUT/DELETE + schedule com rate limit |
| `garmin-disconnect` | sim | Limpa treinos futuros, `DELETE /user/registration`, apaga dados |

`supabase/config.toml`:
```toml
[functions.garmin-webhook]
verify_jwt = false
[functions.garmin-oauth-callback]
verify_jwt = false
```

### Tabelas (esboço)
- **`oauth_states`** `(state uuid pk, user_id, provider, code_verifier, expires_at)`: RLS ativo e sem policies, só service role.
- **`connected_devices`**:
  - colunas `(id, user_id, provider, external_user_id, access_token_enc bytea, refresh_token_enc bytea, key_version, access_expires_at, refresh_expires_at, permissions text[], status 'active'|'reconnect_required'|'disconnected', refresh_lock_until, connected_at)`, com `unique(provider, external_user_id)` e `unique(user_id, provider)`;
  - RLS sem policies; o app lê a view `my_connections` (`security_invoker`, sem tokens).
- **`garmin_inbox`**:
  - colunas `(id, feed, garmin_user_id, dedupe_key, upload_end, item jsonb, received_at, processed_at, attempts, last_error)`, com `unique(feed, garmin_user_id, dedupe_key, upload_end)`;
  - o worker lê com `for update skip locked limit 100`;
  - com 5 tentativas o item vai para dead-letter.
- **`garmin_unknown`**: feeds desconhecidos, guardados brutos, com alerta.
- **`planned_sessions`** ganha as colunas `garmin_workout_id`, `garmin_schedule_id` e `content_hash`.
- **`runs`** (uma linha por corrida, `source='garmin'`, `external_id=activityId`). Voltas em **`run_laps`**. As amostras por segundo vão para o Storage como array compactado, e não para linhas (cerca de 3.600 por hora).
- **`garmin_rate`**: token bucket do parceiro e de cada usuário.

### Segurança
- Tokens criptografados com **AES-GCM** dentro da Edge Function, com a chave `GARMIN_TOKEN_KEY` vinda do `supabase secrets`. A chave nunca entra no banco; a coluna `key_version` permite rotacionar.
- Token do webhook:
  - comparar em tempo constante depois de SHA-256;
  - aceitar vários tokens (`GARMIN_WEBHOOK_TOKENS`) para rotacionar sem perder entregas;
  - nunca logar `req.url`.
- **Corrida de refresh:**
  - só renova quem conseguir a lease em `refresh_lock_until`;
  - gravar os tokens novos logo depois do parse da resposta;
  - em `invalid_grant`, marcar `reconnect_required`.

### Limites da Edge Function [OFICIAL, [Supabase](https://supabase.com/docs/guides/functions/limits)]
- 256 MB de memória.
- **2 s de CPU por requisição** (sem contar I/O assíncrono).
- Tempo total: 150 s no Free, 400 s nos planos pagos.
- Consequências:
  - fazer streaming do .FIT direto para o Storage (limite de 20 MB) e parsear em outra invocação;
  - medir o custo do `@garmin/fitsdk` em corridas longas; se passar do limite, ler só session e lap e reduzir as amostras.

### UX
- **Conectado:** mostrar a conta, as permissões, o link "Gerenciar no Garmin" e o botão "Desconectar". Não mostrar "Reconectar" enquanto estiver saudável.
- **Desconectar:** pedir confirmação avisando que os dados importados serão apagados e bloquear as outras ações durante o processo.
- **`reconnect_required`:** banner "Sua conexão com o Garmin expirou" com o botão "Reconectar".
- **Sem `WORKOUT_IMPORT`:** desabilitar "Enviar treino para o relógio" e explicar o motivo.
- **Deregistration vinda da Garmin:** avisar que os treinos já enviados podem ser apagados no Garmin Connect.
- **Atribuição** "Garmin" e logo nas corridas importadas e nas métricas derivadas delas.

### Testes
Não há sandbox público para o Starter (**a confirmar**).
- Usar uma conta de teste real.
- Conferir os treinos com `GET` e no relógio.
- Testar se importar um .FIT pela web do Garmin Connect dispara push para parceiros (**a confirmar**).
- Reproduzir payloads capturados com `supabase functions serve` ([mockingbird #545](https://github.com/crvouga/mockingbird/issues/545) serve como especificação dos payloads).

### Observabilidade
Alertas via pg_cron para:
- nenhum webhook em 24 h com usuários ativos;
- itens com `attempts >= 5`;
- taxa alta de 429 ou 5xx.

Runbook:
1. corrigir o receiver;
2. usar o Summary Resender no período afetado;
3. colocar os endpoints em On Hold durante deploys que mexem no receiver.

## Exemplos de código

### 1. PKCE + URL de authorize (Deno)
Fluxo baseado em [alexanderhodes/garmin-auth-app](https://github.com/alexanderhodes/garmin-auth-app/) ([artigo](https://dev.to/alexanderhodes/implement-garmin-connect-oauth2-authentication-in-react-native-with-expo-1j55)). **Atenção:** esse repositório coloca o secret no app, o que é proibido para nós. Aproveitar só o fluxo.

```ts
// supabase/functions/garmin-oauth-start/index.ts
import { createClient } from "npm:@supabase/supabase-js@2";

const b64url = (b: Uint8Array) =>
  btoa(String.fromCharCode(...b)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

Deno.serve(async (req) => {
  const auth = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: req.headers.get("Authorization")! } },
  });
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return new Response(null, { status: 401 });

  const verifier = b64url(crypto.getRandomValues(new Uint8Array(32)));
  const challenge = b64url(new Uint8Array(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)),
  ));
  const state = crypto.randomUUID();

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  await admin.from("oauth_states").insert({ state, user_id: user.id, provider: "garmin", code_verifier: verifier });

  const url = new URL("https://connect.garmin.com/oauth2Confirm");
  url.search = new URLSearchParams({
    response_type: "code",
    client_id: Deno.env.get("GARMIN_CLIENT_ID")!,
    code_challenge: challenge,
    code_challenge_method: "S256",
    redirect_uri: Deno.env.get("GARMIN_REDIRECT_URI")!,
    state,
  }).toString();
  return Response.json({ url: url.toString() });
});
```

### 2. Callback: troca do code e deep link
Baseado no [PDF OAuth2 PKCE](https://developerportal.garmin.com/sites/default/files/OAuth2PKCE_1.pdf) e no [dofek oauth.ts](https://github.com/Asherlc/dofek/blob/main/src/providers/garmin/oauth.ts).

```ts
// supabase/functions/garmin-oauth-callback/index.ts (verify_jwt = false)
Deno.serve(async (req) => {
  const u = new URL(req.url);
  const code = u.searchParams.get("code");
  const state = u.searchParams.get("state");
  const back = (s: string) => Response.redirect(`paceless://garmin/connected?status=${s}`, 302);
  if (!code || !state) return back("error");

  // delete...select deixa o state de uso único
  const { data: st } = await db.from("oauth_states").delete()
    .eq("state", state).gt("expires_at", new Date().toISOString()).select().single();
  if (!st) return back("expired");

  const res = await fetch("https://diauth.garmin.com/di-oauth2-service/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: new URLSearchParams({
      grant_type: "authorization_code", code, code_verifier: st.code_verifier,
      redirect_uri: Deno.env.get("GARMIN_REDIRECT_URI")!,
      client_id: Deno.env.get("GARMIN_CLIENT_ID")!,
      client_secret: Deno.env.get("GARMIN_CLIENT_SECRET")!,
    }),
  });
  if (!res.ok) return back("error");
  const t = await res.json();

  const id = await (await fetch("https://apis.garmin.com/wellness-api/rest/user/id", {
    headers: { Authorization: `Bearer ${t.access_token}` },
  })).json();

  await db.from("connected_devices").upsert({
    user_id: st.user_id, provider: "garmin", external_user_id: id.userId,
    access_token_enc: await encrypt(t.access_token),
    refresh_token_enc: await encrypt(t.refresh_token),
    access_expires_at: new Date(Date.now() + (t.expires_in - 600) * 1000).toISOString(),
    refresh_expires_at: new Date(Date.now() + t.refresh_token_expires_in * 1000).toISOString(),
    status: "active",
  }, { onConflict: "user_id,provider" });
  // depois: GET /user/permissions com retry (1s, 5s, 30s) por causa do 403 visto no dofek
  return back("ok");
});
```

### 3. Refresh com lease (SQL + Deno)
```sql
create or replace function garmin_claim_refresh(p_device uuid) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  update connected_devices set refresh_lock_until = now() + interval '30 seconds'
  where id = p_device and (refresh_lock_until is null or refresh_lock_until < now());
  return found;
end $$;
```
```ts
async function refresh(device: Device): Promise<string> {
  const { data: got } = await db.rpc("garmin_claim_refresh", { p_device: device.id });
  if (!got) { await new Promise((r) => setTimeout(r, 1000)); return reloadToken(device.id); }
  const res = await fetch("https://diauth.garmin.com/di-oauth2-service/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: await decrypt(device.refresh_token_enc),
      client_id: Deno.env.get("GARMIN_CLIENT_ID")!,
      client_secret: Deno.env.get("GARMIN_CLIENT_SECRET")!,
    }),
  });
  if (res.status === 400 || res.status === 401) {
    await db.from("connected_devices").update({ status: "reconnect_required", refresh_lock_until: null }).eq("id", device.id);
    throw new Error("reconnect_required");
  }
  const t = await res.json();
  // gravar o refresh_token NOVO imediatamente (ele roda a cada refresh)
  await db.from("connected_devices").update({
    access_token_enc: await encrypt(t.access_token),
    refresh_token_enc: await encrypt(t.refresh_token),
    access_expires_at: new Date(Date.now() + (t.expires_in - 600) * 1000).toISOString(),
    refresh_lock_until: null,
  }).eq("id", device.id);
  return t.access_token;
}
```

### 4. Webhook receiver (Deno)
Adaptado do [receiver Express do dofek](https://github.com/Asherlc/dofek/blob/main/packages/server/src/routes/garmin-webhooks.ts) e do [handler do Open Wearables](https://github.com/the-momentum/open-wearables/blob/main/backend/app/services/providers/garmin/webhook_handler.py).

```ts
// supabase/functions/garmin-webhook/index.ts (verify_jwt = false)
import { createClient } from "npm:@supabase/supabase-js@2";
const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const MAX = 10 * 1024 * 1024;
const KNOWN = new Set(["activities", "activityFiles", "manuallyUpdatedActivities", "dailies", "sleeps",
  "hrv", "epochs", "deregistrations", "userPermissionsChange", "bodyComps", "pulseox",
  "stressDetails", "allDayRespiration"]);

const sha = async (s: string) => new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)));
const eq32 = (a: Uint8Array, b: Uint8Array) => { let d = 0; for (let i = 0; i < 32; i++) d |= a[i] ^ b[i]; return d === 0; };

async function readCapped(req: Request): Promise<Uint8Array | null> {
  const reader = req.body?.getReader(); if (!reader) return new Uint8Array();
  const chunks: Uint8Array[] = []; let n = 0;
  for (;;) {
    const { done, value } = await reader.read(); if (done) break;
    n += value.length; if (n > MAX) { await reader.cancel(); return null; }
    chunks.push(value);
  }
  const out = new Uint8Array(n); let o = 0; for (const c of chunks) { out.set(c, o); o += c.length; }
  return out;
}

const dedupe = (feed: string, it: Record<string, unknown>) =>
  String(it.activityId ?? it.calendarDate ?? it.summaryId ?? it.startTimeInSeconds ?? "");

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response(null, { status: 405 });
  const supplied = await sha(new URL(req.url).searchParams.get("token") ?? "");
  const tokens = Deno.env.get("GARMIN_WEBHOOK_TOKENS")!.split(",");
  let ok = false; for (const t of tokens) ok = eq32(supplied, await sha(t)) || ok;
  if (!ok) return new Response(null, { status: 401 });
  if (req.headers.get("garmin-client-id") !== Deno.env.get("GARMIN_CLIENT_ID")) return new Response(null, { status: 401 });

  const bytes = await readCapped(req);
  if (!bytes) return new Response(null, { status: 413 });
  const body = JSON.parse(new TextDecoder().decode(bytes)) as Record<string, unknown>;

  const rows = []; const unknown = [];
  for (const [feed, items] of Object.entries(body)) {
    if (!KNOWN.has(feed) || !Array.isArray(items)) { unknown.push({ feed, payload: items }); continue; }
    for (const it of items as Record<string, unknown>[]) {
      rows.push({ feed, garmin_user_id: it.userId, dedupe_key: dedupe(feed, it),
        upload_end: it.uploadEndTimeInSeconds ?? 0, item: it });
    }
  }
  const { error } = await db.from("garmin_inbox")
    .upsert(rows, { onConflict: "feed,garmin_user_id,dedupe_key,upload_end", ignoreDuplicates: true });
  if (error) return new Response(null, { status: 503 }); // força retry da Garmin
  if (unknown.length) await db.from("garmin_unknown").insert(unknown);
  return new Response(null, { status: 200 });
});
```

### 5. Validação do callbackURL e download do .FIT para o Storage
Baseado no `activityCallback` do [dofek payloads.ts](https://github.com/Asherlc/dofek/blob/main/src/providers/garmin/payloads.ts) e nas regras do [quantified-self](https://github.com/jimmykane/quantified-self/blob/main/docs/garmin-integration.md).

```ts
function safeCallback(raw: string): URL {
  const u = new URL(raw);
  if (u.protocol !== "https:" || u.hostname !== "apis.garmin.com" || u.port !== "" ||
      u.username || u.password || u.pathname !== "/wellness-api/rest/activityFile") {
    throw new Error("invalid callbackURL");
  }
  return u;
}

async function archiveFit(userId: string, item: { activityId: number; callbackURL: string }, token: string) {
  const res = await fetch(safeCallback(item.callbackURL), {
    headers: { Authorization: `Bearer ${token}` }, redirect: "error",
  });
  if (!res.ok) throw new Error(`fit ${res.status}`);
  if (Number(res.headers.get("content-length") ?? 0) > 20 * 1024 * 1024) throw new Error("fit too large");
  await db.storage.from("garmin-fit").upload(`${userId}/${item.activityId}.fit`, res.body!, {
    contentType: "application/octet-stream", upsert: true,
  });
}
```

### 6. Parse do .FIT com o SDK oficial
[garmin/fit-javascript-sdk](https://github.com/garmin/fit-javascript-sdk) / `npm:@garmin/fitsdk`, ESM puro. Funcionamento no Deno do Supabase **a confirmar** (testar com `supabase functions serve`).

```ts
import { Decoder, Stream } from "npm:@garmin/fitsdk";

const deg = (semicircles: number) => semicircles * (180 / 2 ** 31);

export function parseRun(bytes: Uint8Array) {
  const decoder = new Decoder(Stream.fromByteArray(bytes));
  if (!decoder.isFIT()) throw new Error("not FIT");
  const { messages } = decoder.read({ convertDateTimesToDates: true });
  const s = messages.sessionMesgs[0];
  const speed = s.enhancedAvgSpeed ?? s.avgSpeed;
  return {
    started_at: s.startTime,
    elapsed_s: s.totalElapsedTime,   // inclui pausas
    moving_s: s.totalTimerTime,      // exclui pausas
    distance_m: s.totalDistance,
    avg_hr: s.avgHeartRate, max_hr: s.maxHeartRate,
    avg_pace_s_per_km: speed ? 1000 / speed : null,
    ascent_m: s.totalAscent, kcal: s.totalCalories,
    laps: (messages.lapMesgs ?? []).map((l, idx) => ({
      idx, duration_s: l.totalTimerTime, distance_m: l.totalDistance,
      avg_hr: l.avgHeartRate, wkt_step_index: l.wktStepIndex ?? null, // presença a confirmar
    })),
    samples: (messages.recordMesgs ?? []).map((r) => ({
      t: r.timestamp, hr: r.heartRate, v: r.enhancedSpeed ?? r.speed,
      lat: r.positionLat != null ? deg(r.positionLat) : null,
      lon: r.positionLong != null ? deg(r.positionLong) : null,
    })),
  };
}
```
O `wktStepIndex` liga uma volta ao passo planejado, que é a base do "planejado vs executado". Se não vier no arquivo entregue pela API, o fallback é casar por ordem e duração.

### 7. Training API: treino 6×800 m em JSON
Composto a partir das regras de [openathlete garmin.types.ts](https://github.com/openathleteorg/openathlete/blob/main/apps/api/src/modules/providers-sync/mapping/garmin.types.ts) e do [checklist do watt-mind](https://github.com/watt-mind/coach/blob/main/docs/03-integrations/garmin/training-api-checklist.md). **A confirmar no PDF V2 e numa conta real.** Pace em m/s: 4:00/km = 4,167 e 4:10/km = 4,0.

```json
{
  "workoutName": "6x800 limiar", "description": "Paceless", "sport": "RUNNING",
  "poolLength": null, "poolLengthUnit": null,
  "workoutProvider": "PACELESS", "workoutSourceId": "a1b2c3d4e5f6a7b8c9d0",
  "isSessionTransitionEnabled": false,
  "segments": [{ "segmentOrder": 1, "sport": "RUNNING", "poolLength": null, "poolLengthUnit": null,
    "steps": [
      { "type": "WorkoutStep", "stepOrder": 1, "intensity": "WARMUP", "durationType": "TIME", "durationValue": 600, "targetType": "OPEN" },
      { "type": "WorkoutRepeatStep", "stepOrder": 2, "repeatType": "REPEAT_UNTIL_STEPS_CMPLT", "repeatValue": 6, "skipLastRestStep": true,
        "steps": [
          { "type": "WorkoutStep", "stepOrder": 3, "intensity": "INTERVAL", "durationType": "DISTANCE", "durationValue": 800, "durationValueType": "METER",
            "targetType": "PACE", "targetValueLow": 4.0, "targetValueHigh": 4.167 },
          { "type": "WorkoutStep", "stepOrder": 4, "intensity": "RECOVERY", "durationType": "TIME", "durationValue": 120, "targetType": "OPEN" }
        ] },
      { "type": "WorkoutStep", "stepOrder": 5, "intensity": "COOLDOWN", "durationType": "TIME", "durationValue": 600, "targetType": "OPEN" }
    ] }]
}
```
Para um passo por zona de FC: `"targetType": "HEART_RATE", "targetValueLow": 150, "targetValueHigh": 162` (bpm absoluto).

### 8. Publicar e agendar (Deno)
Adaptado do fluxo do [openathlete garmin.adapter.ts](https://github.com/openathleteorg/openathlete/blob/main/apps/api/src/modules/providers-sync/adapters/garmin.adapter.ts) e do [watt-mind garmin-push.ts](https://github.com/watt-mind/coach/blob/main/server/utils/garmin-push.ts).

```ts
const TRAINING = "https://apis.garmin.com/training-api";
const CREATE = "https://apis.garmin.com/workoutportal/workout/v2"; // caminho a confirmar
const h = (t: string) => ({ Authorization: `Bearer ${t}`, "Content-Type": "application/json" });

async function publish(token: string, workout: GarminWorkout, date: string,
                       prev?: { workoutId?: string; scheduleId?: string }) {
  let workoutId = prev?.workoutId ?? null;
  let scheduleId = prev?.scheduleId ?? null;
  if (workoutId) {
    const cur = await fetch(`${TRAINING}/workout/v2/${workoutId}`, { headers: h(token) });
    if (cur.status === 404) { workoutId = null; scheduleId = null; }
    else {
      const existing = await cur.json();
      const put = await fetch(`${TRAINING}/workout/v2/${workoutId}`, { method: "PUT", headers: h(token),
        body: JSON.stringify({ ...workout, workoutId: Number(workoutId), ownerId: existing.ownerId }) });
      if (!put.ok) throw new Error(`update ${put.status}`);
    }
  }
  if (!workoutId) {
    const r = await fetch(CREATE, { method: "POST", headers: h(token), body: JSON.stringify(workout) });
    if (r.status === 412) throw new Error("WORKOUT_IMPORT not granted");
    if (!r.ok) throw new Error(`create ${r.status}`);
    workoutId = String((await r.json()).workoutId);
  }
  if (!scheduleId) {
    const r = await fetch(`${TRAINING}/schedule/`, { method: "POST", headers: h(token),
      body: JSON.stringify({ workoutId: Number(workoutId), date }) });
    const body = await r.json();
    scheduleId = String(typeof body === "object" ? body.scheduleId : body); // pode vir inteiro puro
  }
  return { workoutId, scheduleId };
}
```

### 9. Rate limit (token bucket em janela fixa, SQL)
```sql
create table garmin_rate (bucket text primary key, window_start timestamptz, used int);
create or replace function garmin_take(p_bucket text, p_limit int, p_window interval) returns boolean
language plpgsql as $$
begin
  insert into garmin_rate values (p_bucket, now(), 1)
  on conflict (bucket) do update set
    used = case when garmin_rate.window_start < now() - p_window then 1 else garmin_rate.used + 1 end,
    window_start = case when garmin_rate.window_start < now() - p_window then now() else garmin_rate.window_start end;
  return (select used <= p_limit from garmin_rate where bucket = p_bucket);
end $$;
-- antes de cada chamada: garmin_take('partner', 90, '1 minute') e garmin_take('user:'||uid, 180, '24 hours')
```

### 10. App: abrir o OAuth (Expo)
```ts
import * as WebBrowser from "expo-web-browser";
import { supabase } from "@/lib/supabase";

export async function connectGarmin(): Promise<"ok" | "error" | "expired" | "cancel"> {
  const { data, error } = await supabase.functions.invoke<{ url: string }>("garmin-oauth-start");
  if (error || !data) return "error";
  const r = await WebBrowser.openAuthSessionAsync(data.url, "paceless://garmin/connected");
  if (r.type !== "success") return "cancel";
  const status = new URL(r.url).searchParams.get("status");
  return status === "ok" || status === "expired" ? status : "error";
}
```
(No código real do app, sem comentários, conforme o CLAUDE.md.)

### 11. Connect IQ: data field mínimo (Monkey C, fase 5)
```monkeyc
import Toybox.WatchUi; import Toybox.Activity;
class PacelessField extends WatchUi.SimpleDataField {
  function initialize() { SimpleDataField.initialize(); label = "FC"; }
  function compute(info as Activity.Info) as Numeric or String or Null {
    return info.currentHeartRate != null ? info.currentHeartRate : "--";
  }
}
```

## Riscos e pontos a confirmar

**Riscos**
1. **Fechamento de novo.** A Garmin já fechou o programa por 7 meses em 2026 e pode rescindir com 30 dias de aviso (9.2). Mitigação: fallback via Health Connect/HealthKit (`health-connect.md`, `apple-healthkit.md`) e o recurso nunca bloqueando o core do app.
2. **5.2(e), receita derivada da API.** Uma assinatura premium pode exigir permissão escrita. Mitigação: modelo de negócio explícito no formulário e pergunta formal.
3. **IA.** Restrição provável, com texto desconhecido. Pode limitar o plano adaptativo com LLM sobre dados Garmin.
4. **Teto de cerca de 1.000 usuários** no Starter, sem comportamento documentado ao atingir. O Enterprise custa pelo menos US$ 1.000 mais um valor por MAU.
5. **Sem histórico** no Starter: o usuário novo começa "do zero" na Garmin.
6. **Training API sem documentação pública**: tudo vem de engenharia reversa e pode mudar.
7. **Rate limit apertado** (dados de 2020) para replanejamento frequente.
8. **CPU de 2 s** da Edge Function para parsear .FIT longos.
9. **Deep link no Android** pode não voltar automaticamente para o app.
10. **LGPD:** dados sensíveis, transferência internacional (região do Supabase), encarregado e RIPD.

**A confirmar**
- [ ] Prazo de aprovação do Starter e duração do selo "unverified".
- [ ] Versão do contrato aceita no cadastro; texto exato da cláusula de IA e da atribuição de dados derivados (API Brand Guidelines).
- [ ] Limite exato de usuários do Starter e o que acontece ao atingi-lo.
- [ ] Se a redirect URI precisa ser pré-registrada; credenciais no body ou em Basic no endpoint de token.
- [ ] Validade real do access token (24 h) e do refresh token (cerca de 90 dias).
- [ ] Política de retry do webhook; se a Garmin pausa endpoints depois de falhas repetidas.
- [ ] Training API V2: caminho de criação, unidade do pace, limite de passos e de caracteres, rate limits atuais.
- [ ] Se existe endpoint de plano de treino na V2.
- [ ] `wktStepIndex` e a remoção de campos nos .FIT entregues pela API.
- [ ] Se um upload pela web do Connect dispara push.
- [ ] `@garmin/fitsdk` no Deno do Supabase (funciona e cabe nos 2 s de CPU).
- [ ] Região `sa-east-1` e DPA/cláusulas-padrão do Supabase segundo a Resolução ANPD 19/2024.
- [ ] Se a Garmin apaga os treinos publicados quando o usuário se desconecta (assumimos que não).
- [ ] Tipos de dado que o Garmin Connect grava hoje no Health Connect, inclusive rota GPS.
- [ ] Rumor de que a Garmin cortou a Terra em 2026 (fonte única, concorrente).

## Fontes

**Oficiais (Garmin / Supabase)**
- https://developer.garmin.com/gc-developer-program/overview/
- https://developerportal.garmin.com/developer-programs/connect-developer-api
- https://developer.garmin.com/gc-developer-program/enterprise/program-faq/
- https://developer.garmin.com/gc-developer-program/enterprise/training-api/
- https://www.garmin.com/en-US/forms/StarterGarminConnectDeveloperAccess/
- https://www.garmin.com/en-US/forms/developercontactus/
- https://connect.garmin.com/app/settings/personalApiToken
- https://developerportal.garmin.com/sites/default/files/OAuth2PKCE_1.pdf
- https://developerportal.garmin.com/sites/default/files/Garmin%20Connect%20Developer%20Program%20Agreement.pdf
- https://developerportal.garmin.com/sites/default/files/Garmin%20Developer%20Program_Start_Guide_2.0.pdf
- https://developerportal.garmin.com/sites/default/files/Activity_API%202.0_0.pdf
- https://developerportal.garmin.com/sites/default/files/Health_API_2.0.pdf
- https://developer.garmin.com/brand-guidelines/overview/
- https://www.garmin.com/privacy/connect
- https://github.com/garmin/fit-javascript-sdk
- https://npmjs.com/package/%40garmin%2Ffitsdk
- https://developer.garmin.com/connect-iq/connect-iq-basics/app-types/
- https://developer.garmin.com/connect-iq/app-review-guidelines/
- https://developer.garmin.com/connect-iq/compatible-devices/
- https://developer.garmin.com/downloads/connect-iq/sdks/agreement.html
- https://supabase.com/docs/guides/functions/limits

**Imprensa e blogs (2026)**
- https://www.dcrainmaker.com/2026/10/garmin-connect-api-revamps-connect-developer.html
- https://the5krunner.com/2026/09/14/garmin-developer-api-access-paused/
- https://sahha.ai/blog/garmin-connect-api-reopened-fees/
- https://openwearables.io/blog/garmin-connect-developer-program-reopened
- https://openwearables.io/docs/providers/garmin-api-integration.md
- https://tryterra.co/blog/garmin-connect-developer-program-pause

**Código em produção**
- https://github.com/Asherlc/dofek/pull/3043
- https://github.com/Asherlc/dofek/blob/main/docs/garmin.md
- https://github.com/Asherlc/dofek/blob/main/src/providers/garmin/oauth.ts
- https://github.com/Asherlc/dofek/blob/main/packages/server/src/routes/garmin-webhooks.ts
- https://github.com/Asherlc/dofek/blob/main/src/providers/garmin/payloads.ts
- https://github.com/openathleteorg/openathlete/blob/main/apps/api/src/modules/providers-sync/adapters/garmin.adapter.ts
- https://github.com/openathleteorg/openathlete/blob/main/apps/api/src/modules/providers-sync/mapping/garmin.types.ts
- https://github.com/watt-mind/coach/blob/main/docs/03-integrations/garmin/training-api-checklist.md
- https://github.com/watt-mind/coach/blob/main/server/utils/garmin-push.ts
- https://github.com/jimmykane/quantified-self/blob/main/docs/garmin-integration.md
- https://github.com/jimmykane/quantified-self/tree/main/functions/src/training-plans/delivery/garmin
- https://github.com/the-momentum/open-wearables/blob/main/backend/app/services/providers/garmin/webhook_handler.py
- https://github.com/osmandapp/OsmAnd-tools/blob/master/java-tools/OsmAndServer/src/main/java/net/osmand/server/controllers/pub/GarminConnectController.java
- https://github.com/alexanderhodes/garmin-auth-app/
- https://dev.to/alexanderhodes/implement-garmin-connect-oauth2-authentication-in-react-native-with-expo-1j55
- https://github.com/stoufa06/php-garmin-connect-api/issues/23
- https://github.com/Janibertz/zone3/pull/19
- https://github.com/crvouga/mockingbird/issues/545
- https://cdn.jsdelivr.net/npm/fit-file-parser@2.3.3/README.md

**Fóruns e outros**
- https://forums.garmin.com/developer/connect-iq/f/discussion/434542/garmin-connect-developer-program---access-request-rejected-without-notification/2052303
- https://forums.garmin.com/developer/connect-iq/f/discussion/443774/solutions-for-real-time-phone-communication-on-older-devices
- https://forums.garmin.com/developer/connect-iq/f/app-ideas/6032/datafield-with-communications
- https://forums.garmin.com/developer/connect-iq/f/showcase/430838/i-monetized-my-ski-app-here-s-what-happened/2024383
- https://the5krunner.com/2024/08/07/garmin-connect-iq-store-allows-paid-for-apps-using-garmin-pay/ (2024, antigo)
- https://www.scribd.com/document/794187143/Garmin-Connect-Developer-Program-Training-API (PDF de 2020, antigo)
- https://fitabase.com/media/2193/fitabase-garmin-data-dictionary.pdf
- https://docs.tryterra.co/faq/help-topics/data-api-sdk/data-model-fields-and-units/resting-vs-average-hr-scope
- https://forum.intervals.icu/t/wellness-data-random-overriding/26202
- https://www.tomsguide.com/wellness/fitness-trackers/garmin-clarifies-what-data-its-sharing-with-google-health-connect-heres-the-full-list
- https://the5krunner.com/2025/05/22/garmin-connect-and-strava-runna-new-link-to-goolge-health-connect/
- https://gadgetsandwearables.com/2025/06/28/garmin-google-health-connect-launch/
- https://www.fitmesh.fit/en/blog/garmin-body-battery-health-connect
- https://docs.tryterra.co/unified-api/pricing
- https://openwearables.io/compare
- https://sahha.ai/compare/terra-alternatives/
- https://sahha.ai/compare/rook-alternatives/
- https://sahha.ai/compare/sahha-vs-terra/
