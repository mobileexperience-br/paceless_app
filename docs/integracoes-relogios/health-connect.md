# Health Connect (Android)

> Pesquisa em 3 rodadas (pesquisa → revisão → pesquisa), consolidada em 2026-10-29. A rodada 3 corrige as anteriores, e o que está aqui já vem corrigido. Itens marcados **a confirmar** não foram verificados em fonte oficial ou dependem de teste em aparelho. Nenhum código deste documento foi rodado em aparelho ainda: foi escrito contra os tipos e o código-fonte de `react-native-health-connect@4.1.3`.

## Resumo

**O que é.** O Health Connect (HC) é o repositório de dados de saúde **local** do Android. Ele **não tem API em nuvem, OAuth, webhooks nem componente de servidor**. Toda leitura e escrita acontece no celular, dentro do nosso app, pelo client `androidx.health.connect`. No Android 14 ou superior ele vem embutido no sistema. No Android 9 a 13 é um app separado da Play Store ("Health Connect by Android"), e `getSdkStatus()` informa se está instalado ou se precisa de atualização.

**Por que importa para o Paceless.** Garmin Connect, Polar Flow, COROS e Samsung Health podem gravar no HC quando o usuário liga a sincronização no app da marca. Com uma única integração lemos corridas de várias marcas sem precisar de parceria com cada uma.

- A Garmin passou a suportar HC segundo a newsletter oficial do Google de agosto de 2025: "activity and wellness data, including heart rate, total calories burned and more". **Não há confirmação de que a Garmin grava a rota GPS.**
- A Polar é a única marca que documenta oficialmente que grava a rota ("only if the workout has one"), além de FC durante o treino e voltas.

**Segredo de API.** Não existe chave nem segredo, então a regra de "segredo só em Edge Function" não se aplica aqui. O app lê do HC e envia o resultado ao Supabase pelo caminho autenticado normal. A checagem free/premium continua no servidor, na Edge Function de importação.

**Recomendação.**
- **Fase 1:** integrar o HC **só para leitura**. Ler sessões de corrida, FC, distância e rota (quando houver), sincronizando ao abrir ou retomar o app. Sem escrita e sem sincronização em segundo plano.
- Testar em aparelhos reais com Garmin, Polar e COROS antes de decidir abrir as APIs de parceiro de cada marca.

## Cadastro e burocracia

Não há programa de desenvolvedor nem taxa além da conta da Play Console que o Pedro já tem (US$ 25, pagos uma vez). O acesso é liberado **por nome de pacote** por meio de uma declaração dentro da Play Console.

### Onde e como

- **Onde:** Play Console > (app) > Policy and programs (Política) > App content (Conteúdo do app) > **Health apps** (seção Health Connect). O formulário antigo do Google já foi aposentado, e agora tudo passa pela Play Console. O Google confirma que a declaração na Play Console é obrigatória "for all publishing requests". A data de aposentadoria do formulário (3 de setembro de 2026) aparece só no README da biblioteca.
- **Quem:** Pedro, como dono da conta da Play Console.
- **Prazo:** o Google **não divulga prazo**. Só diz que a análise acontece "as part of the app review process". O README da biblioteca fala em até 7 dias, mais "an additional 5-7 business days" para a allow-list propagar (**a confirmar**, fonte de terceiros). **Não planeje data de lançamento em cima disso.** Envie a declaração junto com o primeiro build da trilha interna, semanas antes.
- **Custo:** zero, além da conta Play.
- **Versões novas:** uma versão nova do app não exige novo pedido. Adicionar ou remover tipo de dado exige reenviar a declaração.
- **Antes da aprovação:** um build de produção mostra um diálogo de erro ao tentar conectar. Builds de desenvolvimento e internos funcionam em aparelhos de teste.

### Checklist do Pedro (em ordem)

**Pré-requisitos**
- [ ] Conta de desenvolvedor Play **verificada** (identidade e, se for conta de organização, D-U-N-S). Conferir em Play Console > Configurações > Conta de desenvolvedor (**a confirmar**: detalhes da verificação em 2026).
- [ ] Política de privacidade publicada numa **URL canônica única** (exemplo: `https://paceless.app/privacidade`), em PT-BR e EN, cobrindo dados de saúde e LGPD (ver "Limites e termos de uso").
- [ ] **URL de exclusão de conta** na web (exemplo: `https://paceless.app/excluir-conta`), exigida pelo Data safety desde 2024. É um formulário ou página de instruções que termina numa Edge Function ou num e-mail.
- [ ] Conta de teste para o revisor em App content > **App access** (e-mail e senha de um usuário Paceless premium). O HC não exige isso explicitamente, mas a regra geral da Play vale para recursos atrás de login (**a confirmar** para HC).
- [ ] Vídeo de demonstração (YouTube não listado) mostrando: conectar HC → tela de permissão → link de privacidade → corrida importada → desconectar. A página do HC **não exige**, mas é útil caso o revisor peça (**a confirmar**).
- [ ] Encarregado (DPO) definido, com nome e contato publicados na política (ver LGPD).

**Consistência da URL da política de privacidade.** O Google exige: "This must be the same privacy policy that is displayed to users when they click the privacy policy link in Health Connect".
- [ ] A mesma URL em Play Console > Policy > App content > **Privacy policy**.
- [ ] A mesma URL na página da loja.
- [ ] A mesma URL ou conteúdo idêntico na tela `/health-privacy` do app (ver Arquitetura).
- [ ] A mesma URL no formulário Data safety.

**Preenchimento do App content (nesta ordem)**
- [ ] 1. Privacy policy (URL).
- [ ] 2. App access (credenciais de teste).
- [ ] 3. Ads: "No ads". A política do HC proíbe anúncios.
- [ ] 4. Content rating e Target audience (18+ ou 13+; conferir se a política do HC empurra para apenas adultos, **a confirmar**).
- [ ] 5. **Data safety** (abaixo).
- [ ] 6. **Health apps**: Start → selecionar os recursos (Activity and fitness / "Fitness and wellness / coaching") → justificar **cada** tipo de dado → Save. É possível salvar como rascunho.
- [ ] 7. Subir o AAB com as permissões finais do manifesto numa trilha interna ou fechada e enviar para revisão.
- [ ] 8. Tirar print do formulário ao vivo e salvar em `docs/integracoes-relogios/` para registro. Não encontramos passo a passo nem captura de tela de 2026, e a redação das perguntas está parafraseada.

**Textos de justificativa por tipo de dado (prontos para colar).** Peça **só** os tipos que usamos. Na fase 1 são apenas os de leitura.

- **ExerciseSession** (`READ_EXERCISE`)
  - PT: "O Paceless importa as corridas que o usuário registrou no relógio (Garmin, Polar, COROS etc.) para montar seu histórico de treinos e ajustar o plano de treino personalizado. Lemos apenas sessões do tipo corrida."
  - EN: "Paceless imports the runs the user recorded on their watch to build their training history and adapt their personalized training plan. Only running sessions are used."
- **ExerciseRoute** (`READ_EXERCISE_ROUTES`, **no plural**)
  - PT: "Exibe o mapa do percurso da corrida importada, quando o usuário solicita, para ele revisar onde correu e o ritmo por trecho."
  - EN: "Shows the map of an imported run, on the user's request, so they can review where they ran and their pace per segment."
- **HeartRate** (`READ_HEART_RATE`)
  - PT: "Calcula frequência cardíaca média, máxima e zonas de cada corrida para dosar a intensidade dos próximos treinos."
  - EN: "Computes average and max heart rate and zones per run to set the intensity of upcoming workouts."
- **Distance** (`READ_DISTANCE`)
  - PT: "Usa a distância da corrida para calcular ritmo e volume semanal."
  - EN: "Uses run distance to compute pace and weekly volume."
- **Se houver IA**, acrescentar: "Os dados das corridas são processados por um recurso de treinador com IA para gerar o plano; o provedor não armazena nem treina modelos com esses dados." **Só escreva isso se o contrato com o provedor garantir retenção zero.**

**Data safety, campo a campo** (**a confirmar**: rótulos exatos no formulário ao vivo)
- Coleta ou compartilha dados? **Sim**.
- Criptografia em trânsito? **Sim**.
- O usuário pode pedir exclusão? **Sim** (no app e pela URL web).
- Health and fitness > **Fitness info**:
  - Coletado **Sim**, Compartilhado **Não**, Processado de forma efêmera **Não**, **Opcional**.
  - Finalidades: App functionality e Personalization.
  - Operadores que agem em nosso nome, sob contrato, não contam como compartilhamento pela definição da Play (resposta 10787469, **a confirmar** a redação).
- Health and fitness > **Health info** (FC): igual ao item acima.
- Location > **Precise location** (rota GPS): Coletado **Sim**, Opcional, App functionality.
- Personal info > E-mail e User IDs: igual à autenticação atual.
- Nenhuma finalidade de Advertising ou Marketing para dados de saúde.

**Se a declaração for rejeitada.** As páginas do Google não descrevem recurso formal. Na prática:
- [ ] Ler o e-mail de rejeição, corrigir a justificativa ou remover o tipo de dado, e reenviar o formulário junto com uma nova release.
- [ ] Se o motivo não estiver claro, abrir chamado no **Health Connect Developer Support**: https://issuetracker.google.com/issues/new?component=1676744&template=2072671
- [ ] Para rejeição de política: Play Console > Policy status > Appeal.

**Chamados a abrir antes do lançamento**
- [ ] Perguntar ao suporte da Play se o processamento de dados do HC por um LLM (via Edge Function, com provedor de retenção zero) é aceito.
- [ ] Ver em Play Console > Statistics / Reach and devices a parcela de usuários no Android 7.0/7.1 (API 24-25), que o minSdk 26 vai excluir.

## Dados disponíveis

| Necessidade | Registro no HC | Permissão (manifesto) |
|---|---|---|
| Corridas | `ExerciseSession` (`exerciseType` RUNNING=56, RUNNING_TREADMILL=57; voltas, segmentos e título são opcionais) | `android.permission.health.READ_EXERCISE` |
| Rota GPS | Não é um registro separado. Vem em `exerciseRoute`, dentro da sessão | `android.permission.health.READ_EXERCISE_ROUTES` (**plural**). A escrita usa `WRITE_EXERCISE_ROUTE` (singular) |
| FC | `HeartRate` (registro de intervalo com `samples[]` de `{time, beatsPerMinute}`, de 1 a 300) | `READ_HEART_RATE` |
| Distância, calorias, velocidade | `Distance`, `ActiveCaloriesBurned`, `TotalCaloriesBurned`, `Speed` | `READ_` correspondente |
| Histórico antigo (mais de 30 dias) | | `READ_HEALTH_DATA_HISTORY` (na lib: `recordType: 'ReadHealthDataHistory'`) |
| Leitura em segundo plano | | `READ_HEALTH_DATA_IN_BACKGROUND` (na lib: `recordType: 'BackgroundAccessPermission'`) |

- **Não há arquivo FIT.** Recebemos apenas registros estruturados. Voltas e segmentos dependem do app de origem.
- **Limite de histórico** (confirmado na página read-data): "By default, all applications can read data from Health Connect for up to 30 days prior to when any permission was first granted."
  - Android 14 ou superior: sem limite para dados que o próprio app gravou, e 30 dias para dados de outros apps.
  - Android 13 ou inferior: 30 dias para qualquer dado.
  - Sem `READ_HEALTH_DATA_HISTORY`, ler registros mais antigos gera erro.
  - Desinstalar o app reinicia a janela.
  - Isso bate com a importação dos "últimos 30 dias" prevista em `docs/relogios.md`.

**Permissão de rota (confirmado).** Segundo a documentação, `READ_EXERCISE_ROUTES` "can only be granted manually by a user in Health Connect settings or in the route request activity ... Attempts to request the permission by applications will be ignored". Mesmo com a permissão concedida, a leitura de rota de outro app só funciona **em primeiro plano**, a menos que o app tenha a permissão de segundo plano. A permissão precisa estar declarada no manifesto mesmo assim.

**O que cada marca grava no HC:**

| Fonte | Pacote (`dataOrigin`) | Sessão | Rota | Amostras de FC | Voltas | Evidência |
|---|---|---|---|---|---|---|
| Polar Flow | `com.polar.polarflow` (**a confirmar**) | Sim | **Sim**, se o treino tiver rota | Sim, só durante o treino | Sim | Suporte oficial Polar (© 2025) |
| Garmin Connect | `com.garmin.android.apps.connectmobile` (**a confirmar** no aparelho) | Sim | **Não confirmado** | Sim | ? | Newsletter do Google de agosto de 2025, Notebookcheck. Segundo Tom's Guide e Yahoo, não compartilha training load, training effect, VFC, potência nem cadência |
| COROS | `com.yf.smart.coros.dist` (**a confirmar**) | Sim (Perfil > Configurações > 3rd Party Apps > Data Sync > Health Connect) | ? | Terceiros dizem que sim | ? | support.coros.com |
| Samsung Health | `com.sec.android.app.shealth` (**a confirmar**) | Sim, com sincronização ligada | ? | ? | ? | Nenhuma fonte de 2025-2026 |
| Strava | `com.strava` (**a confirmar**) | ? | ? | ? | ? | the5krunner (2025-05-22), fonte secundária |
| Paceless | nosso `android.package` | (escritas próprias) | | | | **Ignorar na importação** |

Os nomes de pacote servem **só** para exibir rótulos como "via Garmin" e para descartar o nosso próprio pacote. **Não usar como allow-list.**

## Autenticação e sincronização

**Autenticação.** É local: o usuário concede as permissões na tela do HC, e nada chega ao Supabase até o app enviar.

**Detalhes da biblioteca (confirmados no código-fonte da 4.1.3):**
- `requestPermission` trata como especiais apenas três casos: escrita de ExerciseRoute, ReadHealthDataHistory e BackgroundAccessPermission. **Não há mapeamento para leitura de rota.** Passar `{accessType:'read', recordType:'ExerciseRoute'}` lança `InvalidRecordType`. Isso é coerente com a regra do Google de que o app não pode pedir essa permissão.
- `getGrantedPermissions` **nunca informa** se `READ_EXERCISE_ROUTES` foi concedida. A única forma de deduzir é pelo `exerciseRoute.type` que volta nas leituras.
- `requestExerciseRoute(recordId)` abre o diálogo de consentimento por sessão. Esse diálogo tem a opção "permitir todas as rotas", que concede `READ_EXERCISE_ROUTES`. Se o usuário cancelar ou negar, a promise é **rejeitada** com `ExerciseRouteAccessDenied` em vez de resolver com lista vazia.
- **Bug na lib:** o TypeScript declara `ExerciseRouteResultType` como enum numérico (0, 1, 2), mas o Kotlin (`ReactExerciseSessionRecord.kt`) envia **string** (`"DATA"`, `"NO_DATA"`, `"CONSENT_REQUIRED"`). Por isso, comparar com `ExerciseRouteResultType.DATA` dá sempre falso. Use o helper `toRouteStatus` (ver Exemplos de código). Vale abrir issue no repositório da lib.
- `pageSize`, `pageToken`, `ascendingOrder` e `dataOriginFilter` existem nas opções de leitura (`records.types.ts`).

**Sincronização incremental (sem webhooks).** Usamos `getChanges({ recordTypes, changesToken })`, que devolve `{ upsertionChanges, deletionChanges, nextChangesToken, changesTokenExpired, hasMore }`.
- **Validade do token (confirmado):** "an unused Changes token expires within 30 days".
- Fazer o loop enquanto `hasMore` for verdadeiro e só gravar o token **depois** que o servidor confirmar o upload. Se gravar antes e o upload falhar, perdemos dados.
- Manter um token por tipo de dado: um para `ExerciseSession` e outro para `HeartRate`, porque a FC pode chegar atrasada.
- Guardar o token no AsyncStorage, com chave por usuário.
- Descartar mudanças cujo `dataOrigin` seja o nosso pacote. O Google recomenda: "only take changes that didn't come from the calling app".

**Escada do Google para token expirado.** Em ordem de preferência:
1. Reler a partir do último timestamp lido, ou dos últimos 30 dias, e deduplicar por ID. **Adotamos esta.** A chave única no servidor torna a releitura segura.
2. Ler apenas a partir do último timestamp.
3. Apagar os últimos 30 dias importados e reler.
4. Reler sem deduplicar (pior opção).

**Orquestração ao abrir ou retomar o app:**
1. Primeira conexão: chamar `resetToken()` **antes** da importação inicial de 30 dias.
2. Chamar `pullSessionChanges()`.
3. Se o token expirou: chamar `resetToken()` primeiro, depois `readAllRuns(since)` com `since = lastReadAt ?? agora - 30d` (limitado a 30 dias sem HISTORY), e enviar.
4. Se o token está válido: chamar `readRecord('ExerciseSession', id)` para cada ID alterado e enviar. Os IDs apagados também vão para o servidor. Não confie no payload de mudança para a rota (**a confirmar** se ele traz `exerciseRoute`).
5. Conferir `stillConnected()` toda vez, porque o usuário pode revogar a permissão nas configurações do HC sem o app ser avisado.
6. Regra extra: re-resumir as corridas dos últimos 7 dias que estejam com `hr_avg` ou `distance_m` nulos.

**Segundo plano.** A lib **não tem agendador**, e não achamos evidência de que funcione em Headless JS ou em `expo-background-task` (**a confirmar**). As opções são:
- (a) Fase 1: sincronizar só ao abrir. **Recomendado.**
- (b) `expo-background-task` com um spike de teste antes. É dependência nova e precisa de aprovação.
- (c) Módulo Expo próprio em Kotlin com WorkManager. É a opção mais confiável e também a que dá mais trabalho.

A leitura em segundo plano também é mais uma permissão a justificar na declaração.

**Limites de taxa.** O Google não publica números, e a página de rate limit retornou 404. Recomendações:
- Usar APIs de agregação para totais.
- Usar `pageSize` de até 1000 e paginar com `pageToken`. No Android 12/13 ele pode vir `""`, então trate vazio e nulo como fim.
- Tratar qualquer erro como tentável de novo, com backoff, e registrar a mensagem no log.

## Limites e termos de uso

**Política da Play para Health Connect** (resposta 12991134):
- O uso precisa estar "directly tied to providing a clear benefit to the user". Fitness, bem-estar e coaching é uma categoria aprovada, e um treinador de corrida se encaixa nela.
- **É proibido:** "Transferring or selling user health or fitness data to third parties", anúncios (inclusive personalizados), e decisões de crédito, seguro, emprego ou empréstimo.
- **Segurança:** criptografia em trânsito e em repouso, controle de acesso (o RLS do Supabase cobre) e escopos mínimos.

**IA / LLM.** A política do HC **não menciona IA**. A Sahha (artigo de 2026-08-28, opinião de fornecedor e não política do Google) alerta que "silence is not stable" e que a cláusula de transferência a terceiros pode ser lida como abrangendo o envio a um provedor de LLM.
- **Risco.** Se mandarmos corridas vindas do HC para um LLM:
  - Descrever isso de forma explícita na declaração e na política de privacidade.
  - Usar um provedor com contrato de retenção zero (DPA).
  - **Perguntar ao suporte da Play antes do lançamento.**
- Pela definição do Data safety, um operador que trata dados "on the developer's behalf" não conta como compartilhamento. **A confirmar** se a política própria do HC aceita a mesma leitura.

**LGPD (Lei 13.709/2018).** Validar com advogado. As resoluções da ANPD citadas abaixo **não foram relidas** nesta pesquisa.
- **Art. 5º II e art. 11:** dado de saúde é dado pessoal sensível. A base legal é **consentimento específico e destacado** (art. 11, I) para a finalidade informada. A rota não é dado sensível em si, mas é de alto risco.
- **Art. 33, transferência internacional:** se o Supabase ou o LLM estiverem nos EUA ou na UE, precisamos de consentimento específico que destaque o caráter internacional (art. 33, VIII) ou de cláusulas-padrão da ANPD (Res. CD/ANPD nº 19/2024, **a confirmar** a versão vigente). Se possível, usar o Supabase na região `sa-east-1` (São Paulo). Nomear o provedor de IA e o país dele na política.
- **Art. 41, Encarregado (DPO):** a dispensa para pequenos agentes (Res. 2/2022) **não cobre** tratamento de alto risco de dados sensíveis. Assumir que o Paceless precisa nomear um (**a confirmar** com advogado).
- **Art. 38, RIPD:** preparar um relatório de impacto simples antes do lançamento, cobrindo o fluxo HC → app → Edge Function → Postgres → LLM, os riscos e as mitigações.
- **Art. 18, direitos do titular:** implementar "Desconectar e apagar dados importados" (`revokeAllPermissions()` mais exclusão das linhas com `source='health_connect'`), além de acesso, correção e portabilidade.
- **Incidentes:** comunicar a ANPD em 3 dias úteis (Res. 15/2024, **a confirmar**).
- **Retenção:** linhas marcadas como apagadas são removidas de vez após 30 dias. Informar esse prazo na política.

**Rascunho do texto de consentimento** (exibido antes de `requestPermission`):

> **Importar dados do Health Connect.** Com sua autorização, o Paceless vai ler do Health Connect suas sessões de corrida, frequência cardíaca, distância e, quando você pedir, o percurso (GPS). Esses são dados de saúde (dados sensíveis pela LGPD) e serão usados somente para montar seu histórico e ajustar seu plano de treino[, inclusive por um recurso de IA]. Os dados são armazenados em servidores [do Supabase, região X][e processados por {provedor de IA} nos EUA], com criptografia. Não vendemos nem compartilhamos seus dados para publicidade. Você pode revogar a qualquer momento em Configurações ou no Health Connect, e pedir a exclusão dos dados importados. Encarregado: {nome, e-mail}. [Política de privacidade]
>
> Botões: "Concordo e continuar" / "Agora não". Registrar o consentimento no servidor (user_id, versão, hash do texto, data e hora).

## Arquitetura no Paceless

```
Relógio → app da marca → Health Connect (no celular)
                              ↓  react-native-health-connect (leitura, em primeiro plano)
                        App Paceless (Expo dev build)
                              ↓  JWT do usuário
                Edge Function import-runs (auth + consentimento + rate limit + free/premium)
                              ↓  service role
           Postgres: imported_runs, imported_run_routes, health_consents, import_requests
```

**Biblioteca.** `react-native-health-connect` **4.1.3**, a versão `latest` no npm. Fixar a versão exata. A data de publicação (por volta de 2026-08-06) é aproximada.
- Desde a v4 o config plugin Expo vem no próprio pacote. Se `expo-health-connect` estiver instalado, remova, porque gera erro de classe duplicada.
- **Não funciona no Expo Go.** Precisa de um dev build novo, já que é módulo nativo novo.
- **Instalar a lib precisa de aprovação** (regra do projeto).

**SDK do Android (verificado localmente).** O Expo SDK 58 deste repositório usa por padrão minSdk **24**, compileSdk 37 e targetSdk 36. A lib e o `connect-client:1.1.0` exigem **minSdk 26**, e o plugin não ajusta isso sozinho. Com 24, o build falha no manifest merger. Há duas saídas:
- `expo-build-properties`. Não está no `package.json`, então é dependência nova e precisa de aprovação.
- Um config plugin local com `withGradleProperties` que define `android.minSdkVersion=26`, sem dependência nova.

O impacto é deixar de fora só o Android 7.0/7.1 (API 24/25). O Android 8.0 é API 26 e continua suportado.

**`app.json`, fase 1 (somente leitura):**
```json
{
  "expo": {
    "plugins": ["react-native-health-connect", "./plugins/with-health-rationale-route"],
    "android": {
      "permissions": [
        "android.permission.health.READ_EXERCISE",
        "android.permission.health.READ_EXERCISE_ROUTES",
        "android.permission.health.READ_HEART_RATE",
        "android.permission.health.READ_DISTANCE"
      ]
    }
  }
}
```
Sem `WRITE_*` na fase 1, porque cada permissão do manifesto provavelmente precisa ser justificada. As páginas do Google não dizem se leitura e escrita são avaliadas separadamente (**a confirmar** no formulário). A escrita só faz sentido quando o Paceless gravar corridas com GPS próprio.

**Tela de privacidade (obrigatória para aprovação).** O plugin adiciona dois pontos de entrada:
- No Android 13 ou inferior: o intent-filter `androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE` na MainActivity.
- No Android 14 ou superior: o activity-alias `ViewPermissionUsageActivity` (`VIEW_PERMISSION_USAGE` + `HEALTH_PERMISSIONS`).

Os dois abrem a MainActivity **sem URI**. Como o expo-router roteia pela URL, o usuário cai na home e não vê a política. Isso é rejeição provável, então **não lance sem resolver**. A solução proposta:
- Um config plugin local que reescreve esses intents para `paceless://health-privacy`. É código nativo e precisa de aprovação. Ver Exemplos de código.
- Uma rota `app/health-privacy.tsx` na **raiz**, fora de `(pre-auth)/` e `(app)/`, para abrir com ou sem login.
- Conferir `expo.scheme`.

**Tabelas.** As escritas acontecem só pela Edge Function, com service role. O cliente tem apenas política RLS de `select`.
- `imported_runs`: chave única `(user_id, source, external_id)`, `data_origin`, `route_status`, `hr_origin`, `duplicate_of` e `deleted_at`.
- `imported_run_routes`: separada para poder apagar a localização de forma independente. Considerar truncar as coordenadas para 5 casas decimais.
- `health_consents`: guarda a prova do consentimento. Mantemos a linha com `revoked_at` mesmo depois da revogação.
- `import_requests`: rate limit simples, de 20 por hora.
- Uma rotina `pg_cron` apaga em definitivo as linhas com `deleted_at` acima de 30 dias.

**Deduplicação entre fontes.** Uma corrida Garmin pode chegar duas vezes: direto do Garmin Connect e via Strava ou Samsung Health. Consideramos duplicata quando o início difere em menos de 120 s e a duração em até 5%. Na escolha, preferimos a versão com rota, depois a com FC, depois a mais antiga.

**Web local.** Criar `lib/health/healthConnect.web.ts` retornando `'unsupported'`, para o build web não importar o módulo nativo.

**UX (textos PT-BR):**
- Precisa instalar ou atualizar: "Para importar suas corridas do relógio, o Paceless usa o Health Connect, app gratuito do Google. Instale ou atualize para continuar." Botão: "Abrir Play Store".
- Aparelho sem suporte: "Seu aparelho não suporta o Health Connect (requer Android 9 ou superior). Você ainda pode registrar corridas pelo Paceless."
- Permissão parcial, sem FC: "Importamos suas corridas, mas sem frequência cardíaca. Você pode permitir isso nas configurações do Health Connect."
- Sem permissão de sessões: "Sem permissão para ler exercícios não conseguimos importar suas corridas."
- Rota: botão "Ver rota" nas corridas com `CONSENT_REQUIRED`, pedido corrida a corrida. Não encadear 30 diálogos seguidos.
- Fonte sem rota: "Mapa indisponível para esta fonte".
- Usuário negou duas vezes: o Android para de mostrar o diálogo. Mostrar "Abrir configurações do Health Connect", que chama `openHealthConnectSettings()`.

**Regra de decisão por marca (depois do teste em aparelho):**
- Sessão + FC + rota no HC: o HC basta e não precisamos de API de parceiro.
- Sessão + FC sem rota: lançar com HC e mostrar "Mapa indisponível".
- Só abrir a API de parceiro (Garmin Connect Developer Program, ver `docs/relogios.md`) se o beta mostrar que os usuários querem mapa ou voltas daquela marca.
- Alternativa barata: o usuário faz upload de um `.fit` e uma Edge Function interpreta o arquivo. Exige um parser FIT em Deno, que é dependência nova.

## Exemplos de código

> São trechos ilustrativos. Os comentários existem só neste markdown: no código real do projeto, comentários são proibidos.

### Helper do status de rota (contorna o bug string × enum)
Fonte: `src/types/base.types.ts` e `ReactExerciseSessionRecord.kt` em https://github.com/matinzd/react-native-health-connect
```ts
type RouteStatus = 'DATA' | 'NO_DATA' | 'CONSENT_REQUIRED';
// aceita as duas formas, para continuar funcionando se a lib corrigir qualquer um dos lados
const toRouteStatus = (t: unknown): RouteStatus =>
  t === 'DATA' || t === 0 ? 'DATA' : t === 'CONSENT_REQUIRED' || t === 2 ? 'CONSENT_REQUIRED' : 'NO_DATA';
```

### Disponibilidade e permissões
Fontes: https://matinzd.github.io/react-native-health-connect/docs/permissions e `src/constants.ts` (`SdkAvailabilityStatus` = 1 indisponível, 2 precisa atualizar, 3 disponível)
```ts
import { Linking } from 'react-native';
import { getSdkStatus, initialize, requestPermission, getGrantedPermissions, SdkAvailabilityStatus } from 'react-native-health-connect';

const HC_PKG = 'com.google.android.apps.healthdata';
// deep link dos exemplos nativos antigos; a página get-started de 2026 não mostra mais (a confirmar)
const HC_STORE = `market://details?id=${HC_PKG}&url=healthconnect%3A%2F%2Fonboarding`;
const HC_STORE_WEB = `https://play.google.com/store/apps/details?id=${HC_PKG}`;

export type HcReady = 'ready' | 'unsupported' | 'needs-install-or-update';

export async function ensureHealthConnect(): Promise<HcReady> {
  const status = await getSdkStatus();
  if (status === SdkAvailabilityStatus.SDK_UNAVAILABLE) return 'unsupported';
  if (status === SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED) return 'needs-install-or-update';
  await initialize();
  return 'ready';
}

export async function openHealthConnectInStore() {
  await Linking.openURL(HC_STORE).catch(() => Linking.openURL(HC_STORE_WEB));
}

// a leitura de rota NÃO entra aqui: a lib lança InvalidRecordType e o Android ignora o pedido
const WANTED = [
  { accessType: 'read', recordType: 'ExerciseSession' },
  { accessType: 'read', recordType: 'HeartRate' },
  { accessType: 'read', recordType: 'Distance' },
] as const;

export async function connect() {
  const granted = await requestPermission([...WANTED]);
  const has = (t: string) => granted.some((g) => g.recordType === t && g.accessType === 'read');
  if (!has('ExerciseSession')) return { ok: false as const, reason: 'no-sessions' as const };
  return { ok: true as const, hasHr: has('HeartRate'), hasDistance: has('Distance') };
}

export async function stillConnected() {
  const g = await getGrantedPermissions();
  return g.some((p) => p.recordType === 'ExerciseSession' && p.accessType === 'read');
}
```

### Ler corridas com paginação, FC por janela e distância agregada
Fontes: https://matinzd.github.io/react-native-health-connect/docs/api/methods/readRecords e https://developer.android.com/health-and-fitness/health-connect/read-data
```ts
import { readRecords, aggregateRecord, ExerciseType } from 'react-native-health-connect';

type Window = { operator: 'between'; startTime: string; endTime: string };

async function readAllPages<T>(fetchPage: (pageToken?: string) => Promise<{ records: T[]; pageToken?: string }>) {
  const all: T[] = [];
  let pageToken: string | undefined;
  do {
    const res = await fetchPage(pageToken);
    all.push(...res.records);
    pageToken = res.pageToken ? res.pageToken : undefined; // "" no Android 12/13 = fim
  } while (pageToken);
  return all;
}

// FC só de UMA origem (a com mais amostras), para não somar Garmin + Samsung em dobro
async function hrForRun(window: Window, origin: string | undefined) {
  const read = (filter?: string[]) =>
    readAllPages((pageToken) =>
      readRecords('HeartRate', { timeRangeFilter: window, dataOriginFilter: filter, pageSize: 1000, pageToken }));
  let records = origin ? await read([origin]) : [];
  if (records.length === 0) records = await read();
  const byOrigin = new Map<string, number[]>();
  for (const r of records) {
    const key = r.metadata?.dataOrigin ?? 'unknown';
    const list = byOrigin.get(key) ?? [];
    for (const s of r.samples) list.push(s.beatsPerMinute);
    byOrigin.set(key, list);
  }
  const best = [...byOrigin.entries()].sort((a, b) => b[1].length - a[1].length)[0];
  if (!best || best[1].length === 0) return { hrAvg: null, hrMax: null, hrOrigin: null };
  const bpm = best[1];
  return {
    hrAvg: Math.round(bpm.reduce((a, b) => a + b, 0) / bpm.length),
    hrMax: Math.max(...bpm), // em listas muito grandes, prefira reduce
    hrOrigin: best[0],
  };
}

async function distanceForRun(window: Window, origin: string | undefined): Promise<number | null> {
  const agg = await aggregateRecord({
    recordType: 'Distance', timeRangeFilter: window, dataOriginFilter: origin ? [origin] : undefined,
  }).catch(() => null);
  const m = agg?.DISTANCE?.inMeters; // nome do campo: a confirmar em aggregate.types.ts
  return typeof m === 'number' && m > 0 ? m : null;
}

export async function readAllRuns(sinceIso: string, ownPackage: string) {
  const range: Window = { operator: 'between', startTime: sinceIso, endTime: new Date().toISOString() };
  const sessions = await readAllPages((pageToken) =>
    readRecords('ExerciseSession', { timeRangeFilter: range, pageSize: 1000, pageToken }));
  const runs = sessions.filter((s) =>
    (s.exerciseType === ExerciseType.RUNNING || s.exerciseType === ExerciseType.RUNNING_TREADMILL)
    && s.metadata?.id && s.metadata.dataOrigin !== ownPackage);
  const out = [];
  for (const run of runs) { // sequencial (ou concorrência 2) para não sobrecarregar a ponte nativa
    const w: Window = { operator: 'between', startTime: run.startTime, endTime: run.endTime };
    const origin = run.metadata?.dataOrigin;
    const status = toRouteStatus(run.exerciseRoute?.type);
    out.push({
      externalId: run.metadata?.id as string,
      dataOrigin: origin ?? null,
      startTime: run.startTime, endTime: run.endTime,
      distanceM: await distanceForRun(w, origin),
      ...(await hrForRun(w, origin)),
      routeStatus: status,
      route: status === 'DATA' && run.exerciseRoute && 'route' in run.exerciseRoute ? run.exerciseRoute.route : null,
    });
  }
  return out;
}
```
Dimensionamento: com amostragem de 1 Hz, uma corrida de 45 min tem cerca de 2.700 amostras. Ler por janela de cada corrida mantém cada chamada pequena. `ownPackage` deve ser uma constante igual ao `android.package`, porque o `expo-application` não está instalado.

### Rota sob demanda (consentimento por corrida)
Fonte: `HealthConnectPermissionDelegate.kt` (4.1.3) e https://developer.android.com/health-and-fitness/health-connect/features/exercise-routes
```ts
import { requestExerciseRoute } from 'react-native-health-connect';

export type RouteOutcome =
  | { kind: 'ok'; route: { time: string; latitude: number; longitude: number }[] }
  | { kind: 'denied' } | { kind: 'error'; message: string };

export async function askRoute(recordId: string): Promise<RouteOutcome> {
  if (!recordId) return { kind: 'error', message: 'missing-id' };
  try {
    const route = await requestExerciseRoute(recordId); // abre UI do HC; só em primeiro plano
    return route && route.length ? { kind: 'ok', route } : { kind: 'denied' };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    // cancelar/negar REJEITA com ExerciseRouteAccessDenied
    if (/denied/i.test(message)) return { kind: 'denied' };
    return { kind: 'error', message };
  }
}
```
Depois de obtida, a rota vai para o servidor por um endpoint PATCH separado.

### Sincronização incremental com getChanges
Fontes: https://developer.android.com/health-and-fitness/health-connect/sync-data e https://matinzd.github.io/react-native-health-connect/docs/api/methods/getChanges
```ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getChanges } from 'react-native-health-connect';

type SyncState = { token?: string; lastReadAt?: string };
type ChangeBatch = { upsertedIds: string[]; deletedIds: string[]; nextToken: string };

const key = (userId: string) => `hc-sync:${userId}:ExerciseSession`;

async function loadState(userId: string): Promise<SyncState> {
  const raw = await AsyncStorage.getItem(key(userId));
  return raw ? (JSON.parse(raw) as SyncState) : {};
}

export async function saveState(userId: string, s: SyncState) {
  await AsyncStorage.setItem(key(userId), JSON.stringify(s));
}

export async function pullSessionChanges(userId: string, ownPackage: string): Promise<ChangeBatch | 'expired'> {
  const state = await loadState(userId);
  if (!state.token) return 'expired';
  const out: ChangeBatch = { upsertedIds: [], deletedIds: [], nextToken: state.token };
  let token = state.token;
  let hasMore = true;
  while (hasMore) {
    const res = await getChanges({ recordTypes: ['ExerciseSession'], changesToken: token });
    if (res.changesTokenExpired) return 'expired';
    for (const c of res.upsertionChanges) {
      const id = c.record.metadata?.id;
      if (id && c.record.metadata?.dataOrigin !== ownPackage) out.upsertedIds.push(id);
    }
    for (const d of res.deletionChanges) out.deletedIds.push(d.recordId);
    token = res.nextChangesToken;
    hasMore = res.hasMore;
  }
  out.nextToken = token;
  return out; // quem chama grava saveState({ token: out.nextToken, ... }) SÓ após o servidor aceitar
}

export async function resetToken(userId: string) {
  const res = await getChanges({ recordTypes: ['ExerciseSession'], changesToken: undefined });
  const prev = await loadState(userId);
  await saveState(userId, { ...prev, token: res.nextChangesToken });
}
```

### Config plugin local: intent de privacidade → expo-router
Fonte dos intents: `app.plugin.js` em https://raw.githubusercontent.com/matinzd/react-native-health-connect/main/app.plugin.js. O plugin abaixo é proposta nossa e **não foi testado**. Conferir a assinatura de `onNewIntent` no `MainActivity.kt` gerado pelo SDK 58 depois de `npx expo prebuild --clean`. Se o template já sobrescreve `onNewIntent`, mesclar em vez de duplicar.
```js
const { withMainActivity } = require('@expo/config-plugins');

const SNIPPET = `
  private fun mapHealthRationaleIntent(i: android.content.Intent?) {
    val a = i?.action ?: return
    if (a == "androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE" || a == "android.intent.action.VIEW_PERMISSION_USAGE") {
      i.action = android.content.Intent.ACTION_VIEW
      i.data = android.net.Uri.parse("paceless://health-privacy")
    }
  }
  override fun onNewIntent(intent: android.content.Intent) {
    mapHealthRationaleIntent(intent)
    super.onNewIntent(intent)
  }
`;

module.exports = (config) =>
  withMainActivity(config, (c) => {
    let src = c.modResults.contents;
    if (src.includes('mapHealthRationaleIntent')) return c;
    const a = src.replace(/super\.onCreate\(([^)]*)\)/, 'mapHealthRationaleIntent(intent)\n    super.onCreate($1)');
    const b = a.replace(/class MainActivity[^{]*\{/, (m) => m + SNIPPET);
    // falha o build se o template mudar, em vez de publicar sem a tela
    if (a === src || b === a) throw new Error('with-health-rationale-route: MainActivity template mismatch');
    c.modResults.contents = b;
    return c;
  });
```
Registrar o plugin **depois** de `"react-native-health-connect"` no `app.json`. Para testar no Android 13 ou inferior: `adb shell am start -a androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE -n <pkg>/.MainActivity`. No Android 14 ou superior, abrir HC > Permissões de apps > Paceless > link de privacidade. O alias é protegido por permissão e o `adb` pode recusar.

```tsx
// app/health-privacy.tsx (na raiz, fora dos grupos)
import { Stack } from 'expo-router';
import { PrivacyPolicyView } from '@/components/PrivacyPolicyView';

export default function HealthPrivacyScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Privacidade e dados de saúde' }} />
      <PrivacyPolicyView source="health-connect" />
    </>
  );
}
```

### SQL: tabelas, RLS e deduplicação
Fonte: projeto próprio. A chave de upsert e o `clientRecordId` seguem https://developer.android.com/health-and-fitness/health-connect/sync-data
```sql
create table public.imported_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source text not null check (source in ('health_connect','healthkit','garmin','polar','strava')),
  external_id text not null,
  data_origin text,
  start_time timestamptz not null,
  end_time timestamptz not null,
  distance_m numeric,
  hr_avg smallint check (hr_avg between 1 and 300),
  hr_max smallint check (hr_max between 1 and 300),
  hr_origin text,
  route_status text check (route_status in ('DATA','NO_DATA','CONSENT_REQUIRED')),
  duplicate_of uuid references public.imported_runs(id),
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  constraint imported_runs_source_ext_uniq unique (user_id, source, external_id),
  constraint imported_runs_time_ok check (end_time > start_time)
);
create index imported_runs_user_start_idx on public.imported_runs (user_id, start_time);
alter table public.imported_runs enable row level security;
create policy "own rows read" on public.imported_runs for select using (auth.uid() = user_id);

create table public.imported_run_routes (
  run_id uuid primary key references public.imported_runs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  points jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.imported_run_routes enable row level security;
create policy "own routes read" on public.imported_run_routes for select using (auth.uid() = user_id);

create table public.health_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scope text not null check (scope in ('health_connect','healthkit','garmin','polar')),
  version int not null,
  text_hash text not null,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz
);
create index on public.health_consents (user_id, scope) where revoked_at is null;

-- duplicatas entre fontes: início < 120 s, duração ±5%, prefere rota > FC > mais antigo > id
with ranked as (
  select id, start_time, extract(epoch from end_time - start_time) as dur,
         (route_status = 'DATA')::int as has_route, (hr_avg is not null)::int as has_hr, created_at
  from public.imported_runs
  where user_id = $1 and deleted_at is null
)
update public.imported_runs r
set duplicate_of = k.id
from ranked a, ranked k
where r.id = a.id and a.id <> k.id
  and r.duplicate_of is null
  and abs(extract(epoch from a.start_time - k.start_time)) < 120
  and abs(a.dur - k.dur) <= 0.05 * greatest(a.dur, k.dur)
  and (k.has_route, k.has_hr, a.created_at, a.id) > (a.has_route, a.has_hr, k.created_at, k.id);

-- exclusões vindas do getChanges
update public.imported_runs set deleted_at = now()
where user_id = $1 and source = 'health_connect' and external_id = any($2);

-- pg_cron: purga definitiva após 30 dias
delete from public.imported_runs where deleted_at < now() - interval '30 days';
```

### Edge Function `import-runs` (Deno)
Fonte: padrão Supabase Edge Functions (https://supabase.com/docs/guides/functions). A regra free/premium **não está definida aqui**: usar a de `docs/relogios.md`.
```ts
import { createClient } from 'npm:@supabase/supabase-js@2';

type RunIn = {
  externalId: string; dataOrigin: string | null; startTime: string; endTime: string;
  distanceM: number | null; hrAvg: number | null; hrMax: number | null; hrOrigin: string | null;
  routeStatus: 'DATA' | 'NO_DATA' | 'CONSENT_REQUIRED';
};

const MAX_RUNS = 200;
const MAX_BYTES = 5_000_000;
const CONSENT_VERSION = 1;

const bad = (msg: string, status = 400) => new Response(JSON.stringify({ error: msg }), { status });
const bpmOk = (v: number | null) => v === null || (Number.isInteger(v) && v >= 1 && v <= 300);
const isoOk = (s: string) => typeof s === 'string' && !Number.isNaN(Date.parse(s));

function validRun(r: RunIn): boolean {
  if (typeof r.externalId !== 'string' || r.externalId.length === 0 || r.externalId.length > 200) return false;
  if (!isoOk(r.startTime) || !isoOk(r.endTime) || Date.parse(r.endTime) <= Date.parse(r.startTime)) return false;
  return bpmOk(r.hrAvg) && bpmOk(r.hrMax);
}

// não confiar em Content-Length: conta bytes no stream
async function readLimited(req: Request, max: number): Promise<string | null> {
  const reader = req.body?.getReader();
  if (!reader) return null;
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) { await reader.cancel(); return null; }
    chunks.push(value);
  }
  const all = new Uint8Array(size);
  let o = 0;
  for (const c of chunks) { all.set(c, o); o += c.byteLength; }
  return new TextDecoder().decode(all);
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return bad('method', 405);
  const jwt = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!jwt) return bad('auth', 401);
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: { user }, error } = await admin.auth.getUser(jwt);
  if (error || !user) return bad('auth', 401);

  // LGPD art. 11 I: consentimento vigente imposto no servidor
  const { data: consent } = await admin.from('health_consents').select('id')
    .eq('user_id', user.id).eq('scope', 'health_connect').is('revoked_at', null)
    .gte('version', CONSENT_VERSION).limit(1).maybeSingle();
  if (!consent) return bad('consent-required', 403);

  // rate limit simples: 20 importações por hora (idealmente numa função Postgres atômica)
  const since = new Date(Date.now() - 3600_000).toISOString();
  const { count } = await admin.from('import_requests').select('*', { count: 'exact', head: true })
    .eq('user_id', user.id).gte('created_at', since);
  if ((count ?? 0) >= 20) return bad('rate-limited', 429);
  await admin.from('import_requests').insert({ user_id: user.id });

  const raw = await readLimited(req, MAX_BYTES);
  if (raw === null) return bad('too-large', 413);
  let body: { runs?: RunIn[] } | null = null;
  try { body = JSON.parse(raw); } catch { return bad('json'); }
  const runs = body?.runs;
  if (!Array.isArray(runs) || runs.length === 0 || runs.length > MAX_RUNS) return bad('payload');
  if (!runs.every(validRun)) return bad('invalid-run');

  // TODO: checagem free/premium conforme docs/relogios.md (entitlements via webhook RevenueCat)

  const rows = runs.map((r) => ({
    user_id: user.id, source: 'health_connect', external_id: r.externalId, data_origin: r.dataOrigin,
    start_time: r.startTime, end_time: r.endTime, distance_m: r.distanceM,
    hr_avg: r.hrAvg, hr_max: r.hrMax, hr_origin: r.hrOrigin, route_status: r.routeStatus, deleted_at: null,
  }));
  const { error: upErr } = await admin.from('imported_runs')
    .upsert(rows, { onConflict: 'user_id,source,external_id' });
  if (upErr) return bad('db', 500);
  return new Response(JSON.stringify({ imported: rows.length }), { status: 200 });
});
```
Manter `verify_jwt = true` (o padrão) em `supabase/config.toml` como segunda barreira.

### Escrita (fase futura)
Fonte: https://developer.android.com/health-and-fitness/health-connect/sync-data e `metadata.types.ts`. Em cada registro, use `metadata: { clientRecordId: run.id, clientRecordVersion: Date.parse(run.updated_at) }` para que uma nova tentativa **atualize** o registro em vez de duplicar. Guarde os IDs do HC que voltarem. Os pontos da rota precisam estar dentro da janela da sessão, e a FC entre 1 e 300.

## Riscos e pontos a confirmar

1. **Rota da Garmin, COROS e Samsung**: se gravam rota, voltas e FC no HC, e se a Garmin faz backfill de corridas anteriores à sincronização. **A confirmar** em aparelho. Protocolo:
   - (a) registrar 3 corridas **antes** de ligar a sincronização com o HC;
   - (b) ligar a sincronização;
   - (c) registrar 1 corrida com GPS;
   - (d) no HC Toolbox ou numa tela de dev, registrar por origem: sessões, string de `exerciseRoute.type`, número de amostras de FC, distância, voltas;
   - (e) conferir de novo depois de 24 h, por causa da FC atrasada.

   Se não houver backfill, o texto do onboarding deve dizer "corridas a partir de agora".
2. **Nomes de pacote** de cada marca: tirar do aparelho.
3. **IA/LLM e a política do HC**: abrir chamado no suporte da Play. É o maior risco de política.
4. **Prazo de revisão**: desconhecido, o Google não publica.
5. **Leitura e escrita justificadas separadamente** no formulário ao vivo: o Pedro vai ver na hora de preencher.
6. **minSdk 26**: exige `expo-build-properties` ou um plugin local. Precisa de aprovação. Perda estimada de API 24-25 é de poucos por cento no mundo (**a confirmar**, sem dado do Brasil).
7. **Assinatura de `onNewIntent`** no template do SDK 58: conferir depois do prebuild. Sem a tela de privacidade funcionando, a rejeição é provável.
8. **Bug string × enum** em `exerciseRoute.type` na lib: usar o helper e abrir issue no repositório.
9. **Se o payload do `getChanges` traz a rota**: sempre reler com `readRecord`.
10. **HC em segundo plano** (Headless JS ou expo-background-task): sem evidência. Precisa de um spike antes de qualquer decisão.
11. **Quotas e rate limit do HC**: sem números publicados.
12. **LGPD**: obrigatoriedade de DPO, versão das resoluções da ANPD e transferência internacional. Validar com advogado.
13. **Divisão de versões do Android no Brasil** (9-13 contra 14 ou superior): pegar das estatísticas da Play Console.
14. **CI**: o HC exige aparelho ou emulador com Play Services. No Codemagic rodam só tsc, lint e testes com `jest.mock('react-native-health-connect')`. O fluxo do HC vira checklist manual de QA a cada release. Emulador: imagem Google Play API 34 ou superior. O expirar do token não pode ser forçado, então testamos com mock de `changesTokenExpired: true`.
15. **HC Toolbox** (https://goo.gle/health-connect-toolbox): "supports reading and writing all Health Connect data types". **A confirmar** se insere sessão com rota pela interface.

## Fontes (links)

**Google / Android (oficiais)**
- https://developer.android.com/health-and-fitness/health-connect/publish
- https://developer.android.com/health-and-fitness/health-connect/declare-access
- https://developer.android.com/health-and-fitness/health-connect/get-started
- https://developer.android.com/health-and-fitness/health-connect/read-data
- https://developer.android.com/health-and-fitness/health-connect/sync-data
- https://developer.android.com/health-and-fitness/health-connect/data-types
- https://developer.android.com/health-and-fitness/health-connect/features/exercise-routes
- https://developer.android.com/health-and-fitness/guides/health-connect/develop/sessions
- https://developer.android.com/health-and-fitness/health-connect/experiences/workouts
- https://developer.android.com/health-and-fitness/health-connect/test/health-connect-toolbox
- https://developer.android.com/health-and-fitness/community/newsletters/2025/08
- https://developer.android.com/reference/kotlin/androidx/health/connect/client/records/ExerciseSessionRecord
- https://developer.android.com/reference/kotlin/androidx/health/connect/client/response/ChangesResponse
- https://developer.android.com/reference/kotlin/android/health/connect/HealthPermissions
- https://developer.android.com/reference/androidx/health/connect/client/permission/HealthPermission
- https://issuetracker.google.com/issues/new?component=1676744&template=2072671

**Google Play (políticas)**
- https://support.google.com/googleplay/android-developer/answer/12991134 (política do Health Connect)
- https://support.google.com/googleplay/android-developer/answer/14738291
- https://support.google.com/googleplay/android-developer/answer/16679511
- https://support.google.com/googleplay/android-developer/answer/13327111 (exclusão de conta; não relida na rodada 3)
- https://support.google.com/googleplay/android-developer/answer/10787469 (Data safety; não relida na rodada 3)

**Biblioteca react-native-health-connect**
- https://github.com/matinzd/react-native-health-connect
- https://www.npmjs.com/package/react-native-health-connect/v/4.1.3 (fonte do tarball: PermissionUtils.kt, HealthConnectPermissionDelegate.kt, ReactExerciseSessionRecord.kt, base.types.ts, records.types.ts, app.plugin.js, android/gradle.properties)
- https://registry.npmjs.org/react-native-health-connect/latest
- https://matinzd.github.io/react-native-health-connect/docs/permissions
- https://matinzd.github.io/react-native-health-connect/docs/api/methods/getChanges
- https://matinzd.github.io/react-native-health-connect/docs/api/methods/readRecords
- https://raw.githubusercontent.com/matinzd/react-native-health-connect/main/app.plugin.js
- https://raw.githubusercontent.com/matinzd/react-native-health-connect/main/src/constants.ts
- https://raw.githubusercontent.com/matinzd/react-native-health-connect/main/src/types/metadata.types.ts
- https://app.unpkg.com/react-native-health-connect@3.5.3/files/lib/typescript/index.d.ts (versão antiga, apenas referência)

**Expo**
- https://docs.expo.dev/versions/v58.0.0
- https://expo.dev/blog/how-to-upgrade-to-sdk-58
- Local: `node_modules/expo-modules-autolinking/android/expo-gradle-plugin/expo-autolinking-plugin/src/main/kotlin/expo/modules/plugin/ExpoRootProjectPlugin.kt`

**Marcas e terceiros**
- https://support.polar.com/en/flow-app-health-connect (oficial Polar)
- https://support.coros.com/hc/en-us/articles/360040256531 (oficial COROS)
- https://www.tomsguide.com/wellness/fitness-trackers/garmin-clarifies-what-data-its-sharing-with-google-health-connect-heres-the-full-list
- https://www.notebookcheck.net/Garmin-expands-Google-Health-Connect-compatibility-to-wearables.1047349.0.html
- https://tech.yahoo.com/wearables/articles/garmin-wont-share-data-google-173520201.html
- https://the5krunner.com/2025/05/22/garmin-connect-and-strava-runna-new-link-to-goolge-health-connect/
- https://sahha.ai/blog/health-api-ai-restrictions/ (opinião de fornecedor, 2026-08-28)
- https://docs.sahha.ai/docs/guides/app-store-submission/google-play-store

**Legislação**
- Lei 13.709/2018 (LGPD): https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm
