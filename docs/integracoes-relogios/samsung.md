# Samsung (Galaxy Watch / Samsung Health Data SDK)

> Pesquisa em 3 rodadas (pesquisa → revisão), consolidada em 2026-10-29. Complementa `docs/relogios.md`.
> Itens sem fonte oficial recente estão marcados como **a confirmar**.

## Resumo

- **O que é:** o Samsung Health Data SDK é uma **biblioteca Android que roda no aparelho** (um AAR). Ela lê (e, com código de acesso, escreve) os dados do app Samsung Health no celular do usuário. Esses dados incluem o que o Galaxy Watch e o Galaxy Ring sincronizam com o celular. Fonte: https://developer.samsung.com/health/data/overview.html
- **Não existe API em nuvem:** não tem REST, OAuth nem webhook. É o contrário da Garmin e da Polar: quem sincroniza é o próprio aparelho, e a Edge Function só recebe o que o app envia.
- **Só Android.** Não existe no iOS. O Galaxy Watch atual também não pareia com iPhone. Isso é conhecimento comum, mas sem fonte oficial nesta pesquisa.
- O SDK novo substitui o antigo "Samsung Health SDK for Android", que foi descontinuado em **31/07/2025**. Apps aprovados no SDK antigo precisam pedir parceria de novo. Fonte: https://developer.samsung.com/health/data/migration-guide/overview.html
- **Bloqueio principal:** sem aprovação de parceria, o SDK funciona **apenas com o modo desenvolvedor ligado**, o que serve só para teste. Nenhum usuário real consegue ler dados pelo SDK antes da aprovação (https://developer.samsung.com/health/data/process.html).

**Recomendação para o Paceless:**
1. **v1 usa Health Connect** (`react-native-health-connect`). O Galaxy Watch já chega por esse caminho: relógio → Samsung Health → Health Connect. Não precisa de parceria com a Samsung.
2. **Em paralelo, o Pedro pede a parceria do Data SDK** e abre um ticket no suporte. Se for aprovada e o Health Connect não trouxer a rota GPS ou a FC em alta resolução, o módulo Samsung direto entra numa versão posterior.
3. O Samsung Health Sensor SDK e os apps no próprio relógio (Wear OS) ficam **fora do escopo** na v1 e na v2.

## Cadastro e burocracia

### Quem faz
O Pedro, com as contas da empresa (e-mail corporativo).

### Onde
- Portal: https://developer.samsung.com (Samsung Account + Samsung Developers)
- Download do SDK e link "Partnership Request": https://developer.samsung.com/health/data/process.html
- Suporte: https://developer.samsung.com/dev-support

### Passo a passo
1. Criar a Samsung Account e entrar no Samsung Developers com o e-mail corporativo.
2. Baixar o SDK (AAR) em process.html. A versão atual seria v1.1.0, de 2026-03-12 (**a confirmar** no download). Anotar o nome do arquivo, a versão e a licença que vem junto.
3. Para testes: ligar o **modo desenvolvedor** no app Samsung Health dos celulares de teste. Ele é só para teste e debug e nunca vale para usuários.
4. Separar o **SHA-256 da chave de assinatura do app** (app signing key). Fica no Play Console > Versão > Configuração > Integridade do app. Os builds de debug, de upload key e internos do EAS usam outra chave, então só funcionam com o modo desenvolvedor.
5. Enviar o formulário **Partnership Request**. O formulário exige login e os campos dele ainda não foram documentados. **Tirar print de todos os campos e salvar em `docs/`**.
6. Abrir um ticket no suporte com as perguntas abaixo, nesta ordem:
   1. A parceria do **Samsung Health Data SDK** (não a do Privileged Health nem a do Sensor SDK) está aceitando pedidos agora, de empresa com CNPJ brasileiro?
   2. Qual é o prazo (SLA) de aprovação e quais documentos são exigidos?
   3. Tem taxa? Qual licença vale para o Data SDK? A "Partner Service & SDK License" de 2021 ainda é a atual?
   4. Um app de corrida focado em bem-estar, que só lê dados, é elegível?
   5. Os dados processados podem alimentar um coaching com IA dentro do app, usando apenas os dados do próprio usuário?
7. Até a aprovação sair, nenhum build público inclui o módulo Samsung.

### Documentos e dados a separar
- Razão social, CNPJ, site, URL da política de privacidade e contato de suporte.
- Nome do app, package name (ex.: `com.paceless.app`) e SHA-256 da app signing key.
- Caso de uso em uma frase: "ler treinos, rota e frequência cardíaca para análise de corrida; somente leitura; bem-estar, não médico".
- Tipos de dados: EXERCISE e HEART_RATE, talvez STEPS e SLEEP.

### Custo e prazo
- **Custo:** não há taxa conhecida. A licença de 2021 se reserva o direito de cobrar no futuro (**a confirmar** se ela vale para o Data SDK).
- **Prazo:** não documentado (**a confirmar**).
- **Elegibilidade de empresa do Brasil:** **a confirmar**.
- **Conta de vendedor na Galaxy Store:** nada indica que seja necessária (**a confirmar**).

### Health Connect (caminho da v1), parte do Play Console
- Preencher Play Console > Conteúdo do app > **Apps de saúde** e a declaração de permissões do Health Connect.
- Pedir só READ_EXERCISE, READ_EXERCISE_ROUTES, READ_HEART_RATE, READ_DISTANCE e, se precisar, READ_HEALTH_DATA_HISTORY e READ_HEALTH_DATA_IN_BACKGROUND, cada uma com justificativa.
- Prazo: a análise leva até 7 dias, e a allowlist ainda leva de 5 a 7 dias úteis para propagar (README do react-native-health-connect).
- Conteúdo esperado do formulário: a justificativa e a funcionalidade de cada permissão, se os dados saem do aparelho e para onde, a política de privacidade cobrindo dados de saúde, um vídeo ou prints, e a conformidade com o Limited Use (sem anúncios e sem venda de dados). Os campos exatos estão **a confirmar**: tirar prints.

### Checklist do Pedro
- [ ] Samsung Account e Samsung Developers com e-mail corporativo
- [ ] Download do AAR, com versão e licença anotadas
- [ ] Modo desenvolvedor ligado nos celulares de teste
- [ ] SHA-256 da app signing key tirado do Play Console
- [ ] Partnership Request enviado, com prints de todos os campos em `docs/`
- [ ] Ticket aberto no Developer Support com as 5 perguntas
- [ ] Resposta da Samsung registrada neste arquivo
- [ ] Declaração de Apps de saúde e de Health Connect no Play Console
- [ ] Política de privacidade cobrindo dados de saúde (LGPD), publicada com URL
- [ ] Encarregado (DPO) definido e contato publicado
- [ ] RIPD curto escrito antes do lançamento

## Dados disponíveis

### Pelo Samsung Health Data SDK
- Cerca de 25 tipos para leitura e 12 para escrita, segundo o site da Samsung (**a confirmar** no download). Incluem exercício, localização do exercício (rota), frequência cardíaca, resumo de atividade, passos, sono, SpO2 e outros.
- **Registro `ExerciseType`** ([referência](https://developer.samsung.com/health/data/api-reference/-shd/com.samsung.android.sdk.health.data.request/-data-type/-exercise-type/index.html)):
  - Campos: `uid`, `startTime`, `endTime`, `zoneOffset`, `dataSource`, `EXERCISE_TYPE`, `SESSIONS` (`List<ExerciseSession>`) e `CUSTOM_TITLE`.
  - Pode ser lido, lido por mudanças e escrito.
- **`ExerciseSession`** ([referência](https://developer.samsung.com/health/data/api-reference/-shd/com.samsung.android.sdk.health.data.data.entries/-exercise-session/index.html)):
  - Campos: `startTime`, `endTime`, `exerciseType`, `duration`, `calories`.
  - Campos opcionais:
    - `route: List<ExerciseLocation>?` e `log: List<ExerciseLog>?`
    - `distance`, `altitudeGain`, `altitudeLoss`
    - FC média, máxima e mínima
    - velocidade, cadência e potência (média e máxima)
    - `vo2Max`, `swimmingLog`, `comment` e `customTitle`
  - **A rota e a FC por amostra vêm dentro do registro do exercício.** Não precisa de outra consulta.
- `ExerciseLocation`: `timestamp`, `latitude`, `longitude`, `altitude` e `accuracy`. Esses nomes foram inferidos do código do Open Wearables (**a confirmar** na referência).
- `ExerciseLog`: `timestamp`, `heartRate`, `cadence`, `speed` e `power`. O [codelab](https://developer.samsung.com/codelab/health/write-exercise-data.html) confirma.
- O SDK **não exporta FIT**. Os dados vêm como objetos estruturados.
- Cada ponto traz `dataSource.deviceId`, e `DeviceManager.getDevice` diz se o ponto veio de um Galaxy Watch ([FAQ](https://developer.samsung.com/health/data/faq.html)).
- **Latência:** a FC contínua do relógio demora a chegar ao celular, para economizar bateria. Medições manuais sincronizam na hora ([blog](https://developer.samsung.com/health/blog/accessing-samsung-health-data-through-health-connect)).

### Pelo Health Connect (dados que o Samsung Health escreve lá)
- Tipos: ExerciseSessionRecord, calorias, distância, FC, potência, velocidade, VO2max, sono e peso ([FAQ HC](https://developer.samsung.com/health/health-connect-faq.html)).
- Os registros vindos do Samsung trazem `metadata.dataOrigin = com.sec.android.app.shealth`.
- **Se o Samsung Health escreve ExerciseRoute no Health Connect: a confirmar** com teste num aparelho real. Há uma pergunta no fórum da Samsung sem resposta oficial. Se não escrever, o mapa depende do SDK direto.
- Há relatos (2023, antigos) de sessões que faltam ou chegam atrasadas no Health Connect: https://forum.developer.samsung.com/t/syncing-data-is-unreliable-between-samsung-health-and-health-connect/24850

## Autenticação e sincronização

### Samsung Data SDK
- Não tem OAuth nem segredo. A Samsung faz duas verificações separadas ([app-verification](https://developer.samsung.com/health/data/guide/app-verification.html)):
  - **Registro da assinatura** (package name e SHA-256): é o que libera um app distribuído. Sem ele, a chamada dá `AuthorizationException`, a não ser que o modo desenvolvedor esteja ligado. A Samsung só registra esses dados depois da aprovação, então **ler também exige parceria**.
  - **Código de acesso:** só é necessário para inserir, atualizar ou apagar dados, e é emitido depois da aprovação. O Paceless só lê, então não precisa dele.
- O "erro 2003" das rodadas anteriores pode ser um artefato do SDK antigo (**a confirmar**).
- **Permissões:** o usuário concede pelo diálogo do Samsung Health (`requestPermissions`).
- **Sincronização incremental:** `HealthDataStore.readChanges`, com requisição montada por `changedDataRequestBuilder`.
  - O filtro é pela **hora em que o dado foi gravado**, não pela hora de início do treino. Assim pega sincronizações atrasadas do relógio.
  - O resultado é paginado por `pageToken` e cada mudança vem como UPSERT ou DELETE.
  - Gravar o cursor (epoch ms) depois de cada envio bem-sucedido.
- **Em segundo plano:** WorkManager (o mínimo de um trabalho periódico é 15 min). O Open Wearables faz assim na prática. O SDK não diz oficialmente se recusa leitura com o app em segundo plano (**a confirmar** em teste).
- **Sem Samsung Health instalado:** checar o pacote `com.sec.android.app.shealth` e a versão mínima, 6.30.2.
- **Requisitos:** Android 10 (API 29) ou superior, Java 17, sem emulador. Funciona em Android que não é Samsung, desde que o Samsung Health esteja instalado.

### Health Connect
- **Instalação:**
  - Android 14 ou superior: o Health Connect já faz parte do sistema.
  - Android 8 a 13: o usuário instala o app Health Connect pela Play (**a confirmar** na documentação do Android).
  - Usar `getSdkStatus()` para saber em qual caso o aparelho está.
- **Limite de histórico:** por padrão, o app só lê **30 dias antes da primeira permissão**. Para ler mais, precisa de `READ_HEALTH_DATA_HISTORY` ([read-data](https://developer.android.com/health-and-fitness/guides/health-connect/develop/read-data)).
- **Leitura em segundo plano:** precisa de `READ_HEALTH_DATA_IN_BACKGROUND`, e o app tem que continuar funcionando se o usuário negar.
- **Paginação:** pageSize padrão de 1000. No Android 12-13 o pageToken pode vir como string vazia.
- **Sincronização incremental:** `getChangesToken` + `getChanges`.
  - O token expiraria em cerca de 30 dias (**a confirmar**). Quando expira, volta para a leitura completa por janela de tempo.
  - Se o `react-native-health-connect` expõe `getChanges`: **a confirmar**.
- **Rota:** cada sessão pede um consentimento do sistema (`requestExerciseRoute`). Só chamar a partir de uma ação do usuário, como abrir o treino.
- **Onboarding:** o usuário precisa ligar Samsung Health > Configurações > Health Connect. Mostrar o passo a passo e detectar quando não chega nenhum dado com origem Samsung.

## Limites e termos de uso

- **Finalidade:** os dados servem só para fitness e bem-estar, nunca para diagnóstico ou tratamento (overview).
- **Licença:** as cláusulas abaixo são da "Partner Service & SDK License", de out/2021. Ela está numa URL `/sensor/` e chegou por fonte de segunda mão, então **a confirmar** se vale para o Data SDK. Não citar como termo oficial.
  - 7.2: proibido usar os dados para anúncios, venda ou mineração.
  - 7.3: exige programa de segurança por escrito e aviso de incidente à Samsung em até 1 dia útil.
  - 5.1: exige consentimento do usuário.
  - 4.1 e 5.3: usar a marca exige aprovação por escrito.
  - 3.3 e 6.2(e): proibido uso médico.
  - 12.2: rescisão com aviso de 30 dias úteis.
  - 4.5: a Samsung pode remover um serviço quando quiser.
- **Redistribuir o AAR:** provavelmente proibido. Não versionar o AAR num repositório público.
- **IA:** a licença não fala de IA. Um coaching dentro do app, com os dados do próprio usuário, parece caber em "processar só para prestar o serviço". Treinar modelos com dados de vários usuários é arriscado. **A confirmar por escrito** com a Samsung.
- **Health Connect / Google Play:** a política de Limited Use também proíbe anúncios e venda de dados. Exige a declaração de Apps de saúde e uma política de privacidade.
- **LGPD:**
  - **Base legal:** dado de saúde é dado pessoal sensível (art. 11). A base é o **consentimento específico e destacado** (art. 11, I). A tela de consentimento lista cada tipo de dado, a finalidade, o tempo de retenção e que os dados não são compartilhados. Rascunho do texto: "Autorizo o Paceless a ler meus treinos, rota GPS e frequência cardíaca do Samsung Health para analisar meus treinos. Posso revogar a qualquer momento em Configurações."
  - **Revogação e exclusão:** ao revogar ou excluir a conta, apagar os dados do usuário (`on delete cascade` mais uma Edge Function de "apagar meus dados").
  - **Encarregado (DPO):** exigido pelo art. 41. A Res. CD/ANPD 2/2022 dispensa agentes de pequeno porte, mas não quando tratam dado sensível em larga escala ou de alto risco. Na dúvida, nomear um (**a confirmar** na Res. CD/ANPD 18/2024).
  - **RIPD:** o art. 38 permite que a ANPD exija o relatório. Escrever um curto antes do lançamento.
  - **Transferência internacional:** se o Supabase não estiver em sa-east-1 (São Paulo), há transferência internacional (art. 33). As cláusulas-padrão são da Res. CD/ANPD 19/2024 (**a confirmar** em https://www.gov.br/anpd). Subprocessadores contam mesmo em sa-east-1.
  - **Incidente:** comunicar a ANPD (LGPD) e também a Samsung (licença 7.3, se ela valer).

## Arquitetura no Paceless

```
Galaxy Watch ──► Samsung Health (celular) ──┬─► Health Connect ──► react-native-health-connect (v1)
                                            └─► Samsung Data SDK ──► módulo Expo nativo (v2, após aprovação)
                                                                  │
                                         app Expo (JWT do usuário) ▼
                                   Edge Function `activities-upload` (valida, checa limite free/premium)
                                                                  ▼
                                               Postgres `activities` (RLS)
```

- **Não há segredo da Samsung.** O acesso depende da assinatura do app, então a Edge Function só valida o JWT, o payload e o limite do plano.
- **Limite free/premium:** verificado na Edge Function pela RPC `is_premium`. Ela lê o entitlement do RevenueCat que fica salvo no servidor (webhook grava numa tabela `subscriptions`), nunca o que o client diz.
- **minSdk:** a v1 com Health Connect usa minSdk 26. Subir para 29 só quando o módulo Samsung entrar, ou isolar o módulo com um config plugin ou product flavor. Subir para 29 tira o Android 8 e 9.
- **Builds:** o Health Connect e o módulo Samsung são nativos, então exigem novo dev build (não rodam no Expo Go). Instalar dependência nova depende de aprovação do Jonatas.
- **Deduplicação:** é uma proposta, os valores ainda precisam de ajuste.
  - Para cada usuário, usar só uma fonte Samsung: o SDK direto **ou** o Health Connect.
  - Com o SDK direto ativo, ignorar no Health Connect os registros com dataOrigin Samsung.
  - Entre fabricantes diferentes, tratar como duplicado quando a sobreposição de tempo passa de 80% e a distância difere menos de 5%. Ficar com o registro mais rico: primeiro o que tem rota, depois o que tem amostras de FC.
- **Rotas grandes:** podem ir para o Storage como JSON gzip em vez de jsonb.
- **Distribuição:** a Galaxy Store também é aceita na verificação, mas cria um segundo pipeline de release. Fica fora da v1.
- **Matriz de testes:**
  - Relógios: Galaxy Watch4, Watch6 e Watch7 ou Ultra.
  - Celulares: um Galaxy com Android 14 ou superior e um Android de outra marca com Samsung Health.
  - Samsung Health 6.30.2 ou superior.
  - Casos:
    - corrida com GPS iniciada no relógio
    - corrida com o celular em casa
    - Samsung Health ausente
    - sincronização com o Health Connect desligada

## Exemplos de código

> Esboços sem compilação, montados das fontes citadas. Os snippets TS seguem a regra de não ter comentários. Os snippets Kotlin podem ter.

### Kotlin: permissões e leitura (guia oficial de migração)
Fonte: https://developer.samsung.com/health/data/migration-guide/exercise-app-example.html
```kotlin
val healthDataStore = HealthDataService.getStore(context)
val PERMISSIONS = setOf(Permission.of(DataTypes.EXERCISE, AccessType.READ))
val granted = healthDataStore.getGrantedPermissions(PERMISSIONS)
if (!granted.containsAll(PERMISSIONS)) {
    healthDataStore.requestPermissions(PERMISSIONS, activity)
}
val readRequest = DataTypes.EXERCISE.readDataRequestBuilder
    .setLocalTimeFilter(LocalTimeFilter.of(LocalDate.now().atStartOfDay(), LocalDateTime.now()))
    .build()
val list = healthDataStore.readData(readRequest).dataList
// o guia envolve em try/catch de HealthDataException
```

### Kotlin: corridas com rota e FC (montado da referência da API)
```kotlin
val runs = store.readData(req).dataList.mapNotNull { p ->
    val type = p.getValue(DataType.ExerciseType.EXERCISE_TYPE)
    if (type != DataType.ExerciseType.PredefinedExerciseType.RUNNING) return@mapNotNull null
    val sessions = p.getValue(DataType.ExerciseType.SESSIONS) ?: emptyList()
    sessions.map { s ->
        mapOf(
            "uid" to p.uid,
            "deviceId" to p.dataSource?.deviceId,
            "start" to s.startTime.toEpochMilli(),
            "end" to s.endTime.toEpochMilli(),
            "distance" to s.distance,
            "meanHr" to s.meanHeartRate,
            // nomes dos getters de ExerciseLocation/ExerciseLog: a confirmar
            "route" to s.route?.map { l -> listOf(l.timestamp.toEpochMilli(), l.latitude, l.longitude, l.altitude) },
            "hr" to s.log?.mapNotNull { e -> e.heartRate?.let { listOf(e.timestamp.toEpochMilli(), it) } }
        )
    }
}.flatten()
```

### Kotlin: sincronização incremental com readChanges
Padrão do Open Wearables (MIT): https://github.com/the-momentum/open_wearables_android_sdk/blob/main/sdk/src/main/kotlin/com/openwearables/health/sdk/SamsungHealthManager.kt
```kotlin
val builder = DataTypes.EXERCISE.changedDataRequestBuilder
builder.setChangeTimeFilter(InstantTimeFilter.of(Instant.ofEpochMilli(lastSyncMs), Instant.now()))
builder.setPageSize(CHANGE_PAGE_SIZE)
if (pageToken != null) builder.setPageToken(pageToken)
val response = store.readChanges(builder.build())
for (change in response.dataList) when (change.changeType) {
    ChangeType.DELETE -> deleted++          // marcar deleted_at na nossa linha
    ChangeType.UPSERT -> (change.upsertDataPoint as? HealthDataPoint)?.let { points.add(it) }
}
val next = response.pageToken
```

### Kotlin: checar se o Samsung Health está instalado (Open Wearables)
```kotlin
val info = context.packageManager.getPackageInfo("com.sec.android.app.shealth", 0)
info.versionCode >= MIN_SAMSUNG_HEALTH_VERSION
// NameNotFoundException => não instalado: oferecer Play Store ou cair para Health Connect
```

### Módulo Expo (esqueleto para a v2)
Referências:
- Open Wearables RN SDK: https://openwearables.io/docs/sdk/react-native
- Plugin Expo da Junction/Vital com o caminho do AAR: https://docs.junction.com/wearables/guides/samsung-health
- O Open Wearables **versiona o AAR da Samsung no repositório**. Não copiar essa prática.
- O pacote `react-native-samsung-health` do npm usa o SDK antigo, então não serve.

`modules/samsung-health/expo-module.config.json`:
```json
{ "platforms": ["android"], "android": { "modules": ["expo.modules.samsunghealth.SamsungHealthModule"] } }
```

`modules/samsung-health/android/build.gradle` (trecho):
```groovy
android { defaultConfig { minSdkVersion 29 }
  compileOptions { sourceCompatibility JavaVersion.VERSION_17; targetCompatibility JavaVersion.VERSION_17 } }
dependencies {
  implementation files('libs/samsung-health-data-api-1.1.0.aar') // fora do git; nome do arquivo a confirmar
  implementation 'com.google.code.gson:gson:2.11.0'              // deps transitivas: conferir no guia de migração
}
```

```kotlin
class SamsungHealthModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("SamsungHealth")
    Function("isAvailable") { /* checagem de pacote acima */ }
    AsyncFunction("requestPermissions") Coroutine { ->
      val act = appContext.currentActivity ?: throw Exceptions.MissingActivity()
      /* store.requestPermissions(perms, act) */ }
    AsyncFunction("readRunsSince") Coroutine { sinceMs: Long -> /* readChanges, retorna List<Map> */ }
  }
}
```

```ts
export type SamsungRun = { uid: string; deviceId: string | null; start: number; end: number; distance: number | null; meanHr: number | null; route: [number, number, number, number | null][] | null; hr: [number, number][] | null };
```

### Health Connect: app.json (v1)
Fonte: https://github.com/matinzd/react-native-health-connect. A compatibilidade com o SDK 58 está **a confirmar**.
```json
{
  "expo": {
    "plugins": [
      "react-native-health-connect",
      ["expo-build-properties", { "android": { "compileSdkVersion": 36, "targetSdkVersion": 36, "minSdkVersion": 26 } }],
      "./plugins/withHealthConnectPermissions"
    ],
    "android": {
      "permissions": [
        "android.permission.health.READ_EXERCISE",
        "android.permission.health.READ_EXERCISE_ROUTES",
        "android.permission.health.READ_HEART_RATE",
        "android.permission.health.READ_DISTANCE",
        "android.permission.health.READ_HEALTH_DATA_HISTORY",
        "android.permission.health.READ_HEALTH_DATA_IN_BACKGROUND"
      ]
    }
  }
}
```
Se o `expo-health-connect` estiver instalado, removê-lo: ele duplica classes e quebra o build.

### Health Connect: config plugin de rationale e política de privacidade
- O Health Connect exige uma tela que mostre por que o app pede as permissões e a política de privacidade.
  - Android 13 ou inferior: ação `ACTION_SHOW_PERMISSIONS_RATIONALE`.
  - Android 14 ou superior: activity-alias `VIEW_PERMISSION_USAGE`.
- Esses strings vieram de memória da documentação do Android (**a confirmar**).
- Depois de `npx expo prebuild`, conferir no manifest gerado se a biblioteca já injeta algum desses filtros, para não duplicar.
```ts
import { ConfigPlugin, withAndroidManifest } from "expo/config-plugins";

const withHealthConnectPermissions: ConfigPlugin = (config) =>
  withAndroidManifest(config, (cfg) => {
    const app = cfg.modResults.manifest.application?.[0];
    if (!app) return cfg;
    const main = app.activity?.find((a) => a.$["android:name"] === ".MainActivity");
    main?.["intent-filter"]?.push({ action: [{ $: { "android:name": "androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE" } }] });
    app["activity-alias"] = [
      ...(app["activity-alias"] ?? []),
      {
        $: {
          "android:name": "ViewPermissionUsageActivity",
          "android:exported": "true",
          "android:targetActivity": ".MainActivity",
          "android:permission": "android.permission.START_VIEW_PERMISSION_USAGE",
        },
        "intent-filter": [{
          action: [{ $: { "android:name": "android.intent.action.VIEW_PERMISSION_USAGE" } }],
          category: [{ $: { "android:name": "android.intent.category.HEALTH_PERMISSIONS" } }],
        }],
      },
    ];
    return cfg;
  });

export default withHealthConnectPermissions;
```

### Health Connect: fluxo de leitura em TS
Fonte da API de rota: https://matinzd.github.io/react-native-health-connect/docs/api/methods/requestExerciseRoute
```ts
import {
  initialize,
  getSdkStatus,
  SdkAvailabilityStatus,
  requestPermission,
  readRecords,
  readRecord,
  requestExerciseRoute,
  ExerciseRouteResultType,
} from "react-native-health-connect";

export type HcRun = { id: string; start: string; end: string; origin: string; route: { time: string; latitude: number; longitude: number; altitude?: number }[] | null };

export async function connectHealthConnect(): Promise<boolean> {
  const status = await getSdkStatus();
  if (status !== SdkAvailabilityStatus.SDK_AVAILABLE) return false;
  if (!(await initialize())) return false;
  const granted = await requestPermission([
    { accessType: "read", recordType: "ExerciseSession" },
    { accessType: "read", recordType: "HeartRate" },
    { accessType: "read", recordType: "Distance" },
    { accessType: "read", recordType: "ExerciseRoute" },
  ]);
  return granted.some((p) => p.recordType === "ExerciseSession");
}

export async function readRunsSince(since: Date): Promise<HcRun[]> {
  const { records } = await readRecords("ExerciseSession", {
    timeRangeFilter: { operator: "after", startTime: since.toISOString() },
  });
  const runs: HcRun[] = [];
  for (const r of records) {
    const full = await readRecord("ExerciseSession", r.metadata?.id ?? "");
    let route: HcRun["route"] = null;
    if (full.exerciseRoute?.type === ExerciseRouteResultType.DATA) route = full.exerciseRoute.route;
    else if (full.exerciseRoute?.type === ExerciseRouteResultType.CONSENT_REQUIRED) route = await requestExerciseRoute(r.metadata?.id ?? "");
    runs.push({ id: r.metadata?.id ?? "", start: r.startTime, end: r.endTime, origin: r.metadata?.dataOrigin ?? "", route });
  }
  return runs;
}
```
- Filtrar `exerciseType` de corrida. No enum do Health Connect é `EXERCISE_TYPE_RUNNING = 56`; conferir a constante da biblioteca.
- A FC vem à parte: `readRecords("HeartRate", { timeRangeFilter: { operator: "between", startTime, endTime } })`.

### Supabase: tabela e RLS (esboço)
```sql
create table public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  source text not null check (source in ('samsung','health_connect','garmin','polar')),
  external_id text not null,
  device_id text,
  started_at timestamptz not null, ended_at timestamptz not null,
  distance_m real, mean_hr real,
  route jsonb, hr_samples jsonb,
  deleted_at timestamptz,
  created_at timestamptz default now(),
  unique (user_id, source, external_id)
);
alter table public.activities enable row level security;
create policy "own rows read" on public.activities for select using (auth.uid() = user_id);
```

### Edge Function `activities-upload` (Deno)
```ts
import { createClient } from "jsr:@supabase/supabase-js@2";
import { z } from "npm:zod@3.23.8";

const MAX_BODY = 2_000_000;
const MAX_ROUTE = 20_000;
const MAX_HR = 20_000;
const FREE_MONTHLY = 30;

const Run = z.object({
  source: z.enum(["samsung", "health_connect"]),
  externalId: z.string().min(1).max(200),
  deviceId: z.string().max(200).nullable(),
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime(),
  distanceM: z.number().nonnegative().max(500_000).nullable(),
  meanHr: z.number().min(20).max(250).nullable(),
  route: z.array(z.tuple([z.number(), z.number(), z.number(), z.number().nullable()])).max(MAX_ROUTE).nullable(),
  hrSamples: z.array(z.tuple([z.number(), z.number()])).max(MAX_HR).nullable(),
});
const Body = z.object({ runs: z.array(Run).min(1).max(50) });

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("method", { status: 405 });
  const len = Number(req.headers.get("content-length") ?? "0");
  if (!len || len > MAX_BODY) return new Response("too large", { status: 413 });
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("unauthorized", { status: 401 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return new Response("invalid", { status: 400 });

  const { data: premium } = await supabase.rpc("is_premium");
  if (!premium) {
    const monthStart = new Date(); monthStart.setUTCDate(1); monthStart.setUTCHours(0, 0, 0, 0);
    const { count } = await supabase.from("activities").select("id", { count: "exact", head: true })
      .gte("created_at", monthStart.toISOString());
    if ((count ?? 0) + parsed.data.runs.length > FREE_MONTHLY) return new Response("limit", { status: 402 });
  }

  const rows = parsed.data.runs.map((r) => ({
    user_id: user.id, source: r.source, external_id: r.externalId, device_id: r.deviceId,
    started_at: r.startedAt, ended_at: r.endedAt, distance_m: r.distanceM, mean_hr: r.meanHr,
    route: r.route, hr_samples: r.hrSamples,
  }));
  const { error } = await supabase.from("activities").upsert(rows, { onConflict: "user_id,source,external_id" });
  return new Response(JSON.stringify({ ok: !error }), { status: error ? 500 : 200, headers: { "content-type": "application/json" } });
});
```

Pontos a ajustar:
- **Limite do plano:** `FREE_MONTHLY` é provisório; o valor real é decisão de produto. A contagem de hoje conta também upserts de treinos que já existem; refinar para contar só `external_id` novos.
- **Escrita no banco:** hoje não existe policy de insert, então a função precisa de uma policy de insert/update com `auth.uid() = user_id`. A outra opção é usar a service role, mas aí a função precisa filtrar por `user_id` ela mesma.
- **Tamanho do corpo:** se o corpo vier chunked, sem `content-length`, ler o stream com limite de tamanho.

## Riscos e pontos a confirmar

| Risco / ponto | Impacto | Status |
|---|---|---|
| A parceria do Data SDK está aberta para empresa brasileira em 2025-2026? | Bloqueia o SDK direto em produção | **a confirmar** (ticket). Os relatos de "programa fechado" (2020-2023) são do SDK antigo, mas o risco continua em aberto |
| Prazo de aprovação, documentos e taxa | Planejamento | **a confirmar** |
| Licença que vale para o Data SDK e uso com IA | Jurídico | **a confirmar** por escrito |
| O Samsung Health escreve ExerciseRoute no Health Connect? | Sem rota, não tem mapa na v1 | **a confirmar** em aparelho real |
| Leitura do SDK com o app em segundo plano | Sincronização automática | **a confirmar** em teste |
| Nomes exatos dos getters de `ExerciseLocation` e `ExerciseLog` | Código | **a confirmar** na referência |
| v1.1.0, 25/12 tipos, 1,78 MB e nome do AAR | Build | **a confirmar** no download |
| `react-native-health-connect` no Expo SDK 58 e com `getChanges` | Build e sincronização | **a confirmar** |
| Validade do changes token do Health Connect (~30 dias) | Sincronização | **a confirmar** |
| Strings exatos do manifest (rotas e rationale) | Aprovação na Play | **a confirmar** |
| Atraso e falha na sincronização Samsung Health → Health Connect | Treinos chegam tarde | Relatos de 2023; mostrar orientação na UI |
| A Samsung pode encerrar o programa (licença 12.2/4.5) | Perda da integração | Manter o Health Connect como plano B permanente |
| Res. ANPD 18/2024 e 19/2024, e dispensa de DPO | LGPD | **a confirmar** em gov.br/anpd |
| O Sensor SDK exige parceria? | Fora do escopo | Só para registro |

## Fontes

Samsung (oficial):
- https://developer.samsung.com/health/data/overview.html
- https://developer.samsung.com/health/data/process.html
- https://developer.samsung.com/health/data/guide/app-verification.html
- https://developer.samsung.com/health/data/faq.html
- https://developer.samsung.com/health/data/release-note.html
- https://developer.samsung.com/health/data/migration-guide/overview.html
- https://developer.samsung.com/health/data/migration-guide/exercise-app-example.html
- https://developer.samsung.com/health/data/guide/features/data-types.html
- https://developer.samsung.com/health/data/guide/features/data-access.html
- https://developer.samsung.com/health/data/api-reference/index.html
- https://developer.samsung.com/health/data/api-reference/-shd/com.samsung.android.sdk.health.data.request/-data-type/-exercise-type/index.html
- https://developer.samsung.com/health/data/api-reference/-shd/com.samsung.android.sdk.health.data.data.entries/-exercise-session/index.html
- https://developer.samsung.com/codelab/health/write-exercise-data.html
- https://developer.samsung.com/health/blog/accessing-samsung-health-data-through-health-connect
- https://developer.samsung.com/health/health-connect-faq.html
- https://developer.samsung.com/health/android/data/guide/process.html (SDK antigo)
- https://developer.samsung.com/health/sensor/overview.html
- https://developer.samsung.com/health/privileged/overview.html
- https://news.samsung.com/global/samsungs-new-health-software-development-kit-suite-powers-advancements-in-healthcare-innovation

Fórum Samsung (2020-2024, podem estar desatualizados):
- https://forum.developer.samsung.com/t/partner-program-availability/9899
- https://forum.developer.samsung.com/t/sdk-says-i-need-a-partnership/21304
- https://forum.developer.samsung.com/t/samsung-health-data-sdk/42300 (retorna 404; não usado como evidência)
- https://forum.developer.samsung.com/t/syncing-data-is-unreliable-between-samsung-health-and-health-connect/24850
- https://forum.developer.samsung.com/t/samsung-privileged-health-sdk-partnership/23542
- https://forum.developer.samsung.com/t/does-the-samsung-privileged-health-sdk-has-a-cost/28785
- https://forum.developer.samsung.com/t/unclear-partnership-program/17277
- https://forum.developer.samsung.com/t/who-knows-when-sdk-partnership-will-be-restored-with-samsung-health-kit/19762
- https://forum.developer.samsung.com/t/samsung-health-integration-for-3rd-party-apps-is-active-again/17742

Código aberto e agregadores:
- https://github.com/the-momentum/open-wearables
- https://github.com/the-momentum/open_wearables_android_sdk
- https://github.com/the-momentum/open_wearables_android_sdk/blob/main/sdk/src/main/kotlin/com/openwearables/health/sdk/SamsungHealthManager.kt
- https://openwearables.io/docs/sdk/react-native
- https://docs.thryve.health/integrate-your-mobile-app/setup-thryve-sdk/react-native/react-native-expo
- https://docs.junction.com/wearables/guides/samsung-health
- https://docs.spikeapi.com/sdk-docs/android/usage-guide-shd.md
- https://tryterra.co/blog/samsung-health-medicare-app-library-developer-access
- https://www.jsdelivr.com/package/npm/react-native-samsung-health (SDK antigo)

Health Connect e Android:
- https://github.com/matinzd/react-native-health-connect
- https://matinzd.github.io/react-native-health-connect/docs/api/methods/requestExerciseRoute
- https://developer.android.com/health-and-fitness/guides/health-connect/develop/read-data
- https://developer.android.com/health-and-fitness/guides/health-connect/develop/get-started

LGPD:
- https://www.gov.br/anpd
