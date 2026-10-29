# Apple HealthKit

> Pesquisa consolidada em 2026-10-29 (3 rodadas de pesquisa e revisão). Complementa `docs/relogios.md`, que já escolhe `@kingstinct/react-native-healthkit` para iOS.
> Itens marcados **a confirmar** não foram verificados em fonte oficial ou em teste no aparelho.

## Resumo

- **O que é:** o HealthKit é o banco de dados de saúde da Apple (o app Saúde). Ele fica no próprio iPhone e no Apple Watch.
- **Não existe API em nuvem nem REST.** Os dados ficam no aparelho e só saem através do nosso app. Por isso não há OAuth, webhook nem troca de token em Edge Function. A regra "segredos só em Edge Functions" é cumprida automaticamente: não há segredo.
- **Vale para o Paceless? Sim, é obrigatório no iOS.** Além do Apple Watch, usuários de Garmin, Polar, Coros e Samsung também chegam por aqui, desde que liguem a sincronização com o app Saúde no app da marca. Atenção: corridas vindas da Garmin costumam chegar **sem rota** (veja Riscos).
- **Recomendação:**
  - Usar `@kingstinct/react-native-healthkit` **16.2.0**. Ela tem tipos, consultas com âncora (anchored queries), entrega em segundo plano e rotas de treino.
  - Na primeira versão: **somente leitura**, **sem entrega em segundo plano**, e sincronizar sempre que o app abrir.
  - As corridas vão para uma Edge Function `ingest-healthkit-workouts`, que valida os dados e remove duplicatas.

## Cadastro e burocracia

Não existe cadastro, aprovação nem taxa específicos do HealthKit. O trabalho é ter uma conta **Apple Developer Program como Organização** e preencher corretamente a parte de privacidade e da revisão da App Store.

**Responsáveis:** **P** = Pedro (Account Holder, ou seja, o titular da conta) e **J** = Jonatas (desenvolvedor).

| # | Passo | Quem | Prazo | O que entregar |
|---|---|---|---|---|
| 1 | Confirmar a forma jurídica da empresa. LTDA ou SLU servem. **MEI ou EI podem ser direcionados para a inscrição como Individual.** Conferir também se a razão social e o endereço batem exatamente com o cartão CNPJ. | P | 1 dia | Razão social exata |
| 2 | Criar uma Apple Account pessoal com e-mail do domínio da empresa (não Gmail) e **autenticação em dois fatores ligada**. | P | 1 dia | – |
| 3 | Consultar ou pedir o D-U-N-S, que é gratuito, em https://developer.apple.com/enroll/duns-lookup/. A D&B pode ligar, então deixe o contrato social à mão. Nome fantasia (DBA), filial e marca não são aceitos. | P | até 5 dias úteis na D&B, mais até 2 dias úteis até a Apple receber | Número D-U-N-S |
| 4 | Colocar no ar o site da empresa no domínio próprio e publicar a política de privacidade em URL pública, em PT-BR e EN. | P + J | 2 a 5 dias | URL da política |
| 5 | Inscrever a empresa como **Organization** em https://developer.apple.com/programs/enroll/ e pagar em BRL. A Apple pode ligar para confirmar que o Pedro representa a empresa. | P | de alguns dias até cerca de 2 semanas (**a confirmar**) | Print do preço e recibo |
| 6 | Em App Store Connect > Business, aceitar o **Paid Apps Agreement**. Ele é necessário para as assinaturas via RevenueCat e precisa vir antes da parte de impostos. | P (só o Account Holder) | minutos | – |
| 7 | **Impostos:** preencher o W-8BEN-E (o questionário do App Store Connect escolhe o formulário) e a seção do Brasil, onde o CNPJ é obrigatório. **Revisar com o contador antes de enviar**, porque normalmente não dá para editar depois. | P + contador | 1 dia | – |
| 8 | Cadastrar uma conta bancária em BRL no nome da empresa. | P | 1 dia, mais a verificação da Apple | – |
| 9 | Convidar o J em App Store Connect > Users com o papel **Admin**. O mínimo é App Manager com a opção "Access to Certificates, Identifiers & Profiles" marcada. | P | minutos | J aceita o convite |
| 10 | Criar a App Store Connect API Key em Users and Access > Integrations > Team Keys, com acesso Admin. Baixar o `.p8`, que **só pode ser baixado uma vez**, e mandar o Key ID, o Issuer ID e o `.p8` por um gerenciador de senhas, **nunca por chat**. | P | minutos | `.p8`, Key ID, Issuer ID |
| 11 | Criar o App ID `com.paceless.app` e ligar a capability **HealthKit**. Deixar Background Delivery desligado. O EAS faz isso no primeiro build. | J (EAS) | minutos | – |
| 12 | Criar o app no App Store Connect com rótulo de privacidade, URL da política e URL de suporte. | J (P revisa) | 1 dia | – |
| 13 | Implementar a exclusão de conta dentro do app e criar uma conta demo para a revisão. | J | tarefa de dev | Credenciais demo |
| 14 | Preencher o App Review Information com as notas e o vídeo de demonstração. | J | – | – |
| 15 | **Acompanhar sempre** os e-mails da Apple sobre novos contratos. Só o Account Holder aceita, e enquanto ninguém aceita ficam bloqueados builds, envios e compras dentro do app. | P | contínuo | – |

**Custo:** o preço publicado é US$ 99 por ano, mas a Apple cobra em BRL no checkout. **O valor em BRL de 2026 está a confirmar**, e o Pedro deve tirar print. A isenção de taxa no Brasil vale só para ONGs, instituições de ensino e governo, então **não se aplica** ao Paceless.

**Checklist do Pedro**

- [ ] Empresa é LTDA ou SLU, com razão social e endereço iguais ao CNPJ
- [ ] Apple Account com e-mail corporativo e 2FA ligado
- [ ] Número D-U-N-S obtido
- [ ] Site da empresa no ar e política de privacidade publicada (PT-BR e EN)
- [ ] Inscrição como Organization paga, com print do preço em BRL
- [ ] Paid Apps Agreement aceito
- [ ] Impostos (W-8BEN-E e CNPJ) revisados pelo contador e enviados
- [ ] Conta bancária cadastrada
- [ ] Jonatas convidado como Admin
- [ ] API Key (`.p8`, Key ID e Issuer ID) entregue por canal seguro
- [ ] Alerta configurado para e-mails de novos contratos da Apple

**Rótulo de privacidade (App Privacy)** no App Store Connect, conforme https://developer.apple.com/app-store/app-privacy-details/:

| Categoria | Cobre | Vinculado ao usuário | Rastreamento | Finalidade |
|---|---|---|---|---|
| Health & Fitness > Health | FC, FC de repouso, HRV, VO2max | Sim | Não | App Functionality e Product Personalization |
| Health & Fitness > Fitness | treinos, distância, pace, cadência, potência | Sim | Não | App Functionality |
| Location > Precise Location | pontos da rota enviados ao Supabase | Sim | Não | App Functionality |

- Uma sincronização contínua precisa ser declarada.
- Se usarmos IA, ela exige opt-in no app (diretriz 5.1.2(i)).

**A política de privacidade precisa cobrir:**
- os tipos de dado do HealthKit que são lidos;
- que esses dados nunca são usados para anúncio ou marketing nem vendidos;
- o processamento por IA, se houver;
- retenção e exclusão;
- a LGPD, art. 11 (dado pessoal sensível, com consentimento explícito);
- o contato do encarregado (DPO);
- a transferência internacional, já que o Supabase e o provedor de IA ficam fora do Brasil.

## Dados disponíveis

- **Treinos (`HKWorkout`):**
  - tipo `running`, duração, distância e energia (totais sempre em metros e kcal);
  - estatísticas por treino com `getStatistic(type, unit)`, que traz `averageQuantity` e `maximumQuantity`;
  - `HKMetadataKeyIndoorWorkout`;
  - origem em `sourceRevision?.source?.bundleIdentifier`, que é um campo opcional.
- **Rotas GPS:** `workout.getWorkoutRoutes()` devolve as `locations` com latitude, longitude, altitude, speed, course, date e as precisões. A rota é um tipo separado, com permissão própria.
- **Frequência cardíaca:**
  - `HKQuantityTypeIdentifierHeartRate` (`count/min`), filtrando por `{ workout: w }` e não por janela de data, para não misturar fontes;
  - também `RestingHeartRate`, `HeartRateVariabilitySDNN` e a série batimento a batimento (`queryHeartbeatSeriesSamples`).
- **Métricas de corrida:** `RunningPower`, `RunningStrideLength`, `RunningGroundContactTime`, `RunningVerticalOscillation`, `RunningSpeed`, `DistanceWalkingRunning`, `ActiveEnergyBurned` e `VO2Max`. Os IDs exatos na união de tipos da v16 estão **a confirmar**.
- **Arquivo FIT: não existe.** Se um dia precisarmos de FIT ou GPX, teremos de montar o arquivo a partir das amostras.
- **FC ao vivo durante a corrida:** a biblioteca não tem `HKWorkoutSession`. Para isso seria preciso um app watchOS nativo (estimativa de 3 a 6 semanas), o que **não vale para a v1**. Para FC ao vivo, a preferência é a cinta BLE (GATT 0x180D), que já está em `relogios.md`.

## Autenticação e sincronização

**Permissões (não há OAuth)**
- `requestAuthorization({ toRead })` abre a tela de permissões do sistema, com um botão por tipo de dado. Quando ele resolve `true`, isso só quer dizer que o pedido terminou, não que o acesso foi dado.
- `getRequestStatusForAuthorization` devolve `shouldRequest` ou `unnecessary`. A tela do sistema não aparece de novo para tipos já pedidos.
- **Não dá para detectar quando o usuário nega leitura.** Nesse caso a consulta simplesmente volta vazia. A interface deve mostrar o caminho em texto: **Ajustes → Saúde → Acesso a Dados e Dispositivos → Paceless**. Não usar `x-apple-health://`, que não é documentado.
- **Permissões parciais:**

| Situação | O que o app recebe | Como a UI reage |
|---|---|---|
| Treinos negados | 0 treinos | Estado vazio com o caminho de Ajustes |
| Rotas negadas | `getWorkoutRoutes()` devolve `[]` | Corrida sem mapa e um aviso único |
| FC negada | estatística `null` | Esconder o card de FC e mostrar uma dica |

  Para decidir quando mostrar a dica: se as últimas 5 corridas ao ar livre vierem todas sem rota (ou todas sem FC), mostrar uma vez e guardar `routes_hint_dismissed` no AsyncStorage.

**Sincronização**
1. Usar `queryWorkoutSamplesWithAnchor` com `filter.workoutActivityType = running` (confirmado na v16), em **páginas de 10**.
2. A âncora fica no AsyncStorage em `healthkit_anchor_{userId}` e **só avança depois que o upload deu certo**. Assim a sincronização pode ser retomada, e o upsert no servidor torna inofensivo reler a mesma página.
3. `deletedSamples` traz os UUIDs dos treinos apagados no Saúde, e essas exclusões são espelhadas no Supabase.
4. Sincronizar **sempre ao abrir o app** (AppState `active`). Uma flag de execução única impede duas sincronizações ao mesmo tempo.
5. Com o aparelho bloqueado, o HealthKit fica criptografado. Checar `isProtectedDataAvailable()` antes de consultar.
6. **Segundo plano** (fase futura, com o plugin em `background: true`):
   - chamar `configureBackgroundTypes([...], UpdateFrequency.immediate)` depois da autorização;
   - registrar `subscribeToChanges` no carregamento do módulo em `app/_layout.tsx`. Os eventos ficam guardados no nativo até o handler JS se registrar;
   - **não sobrevive a force-quit:** se o usuário fechar o app à força, ele só volta a receber eventos quando for aberto manualmente (fórum Apple 803365);
   - a frequência é de melhor esforço, e a janela de tempo está **a confirmar**;
   - processar **uma página por despertar**;
   - **nunca prometer "sincronização automática garantida"**.
7. Toda proxy de treino devolvida pela biblioteca deve ter `dispose()` chamado (em `finally`). Usá-la depois disso gera erro.

## Limites e termos de uso

- **Não há rate limit**, porque tudo é local. O limite real é o tamanho do payload:
  - reduzir a rota para cerca de 1 ponto a cada 5 s (ou Douglas-Peucker com 3 a 5 m) e mandar como polyline com precisão 5;
  - mandar a FC a 1 ponto a cada 5 s;
  - usar páginas de 10 corridas, ficando abaixo de cerca de 1 MB por requisição;
  - para ultras, salvar as séries no Storage e mandar só o caminho.
- **Edge Functions do Supabase** (https://supabase.com/docs/guides/functions/limits):
  - CPU de **2 s por requisição**, tempo total de 150 s (Free) ou 400 s (pago), 256 MB de memória;
  - o limite de tamanho do corpo da requisição não está na página: **a confirmar**.
- **Diretrizes da App Store** (lidas em 2026-10-29):
  - **5.1.3(i):** os dados do HealthKit não podem ser usados nem compartilhados para publicidade, marketing ou mineração de dados. É preciso informar exatamente quais dados de saúde são coletados.
  - **5.1.3(ii):** proibido gravar dados falsos no Saúde e proibido guardar dados de saúde no iCloud. Nós usamos o Supabase, então está ok.
  - **5.1.2(i), IA:** é obrigatório deixar claro quando dados pessoais vão para terceiros, **inclusive IA de terceiros**, e ter permissão explícita. Se algum coach por IA receber dados derivados do HealthKit por Edge Function, é preciso **opt-in explícito no app** e menção na política. Esse mesmo consentimento atende a LGPD, art. 11.
  - **2.5.1:** o HealthKit só pode ser usado para saúde e fitness, e a descrição da App Store deve citar a integração com o Apple Saúde.
  - **5.1.1(v):** quem oferece criação de conta precisa oferecer **exclusão de conta dentro do app**.
  - **Nenhum valor derivado do HealthKit** pode ir para PostHog, para atributos do RevenueCat ou para SDK de anúncio.
- **LGPD:**
  - dado de saúde é dado pessoal sensível (art. 11) e exige consentimento específico;
  - é preciso apagar quando a finalidade acaba (art. 16);
  - o usuário tem direito de pedir a exclusão (art. 18 VI) e de revogar o consentimento (art. 8 §5). No app isso vira a ação "Desconectar Apple Saúde", com a opção de apagar os treinos importados.
- **Selo "Works with Apple Health":**
  - altura mínima de 30 px;
  - área de respiro de ¼ da altura;
  - não pode ser alterado;
  - não pode ir na página institucional nem em redes sociais;
  - no texto para o usuário, escrever **"Apple Saúde/Apple Health", nunca "HealthKit"**;
  - no app, usar ícone lucide com texto; o selo fica para o site e as screenshots da loja.
- **Lições da revisão em 2026:** no fórum Apple 813897 (jan-fev 2026), um app foi rejeitado pela 2.5.1 porque o HealthKit não aparecia na interface. Ele só foi aprovado depois de ganhar um controle de permissão nos Ajustes do app e um indicador visível.

## Arquitetura no Paceless

```
iPhone (app Expo)                                   Supabase
hooks/healthkit/*.ios.ts  ── anchored query ──┐
  (no-op em *.ts p/ Android e web)            │
AsyncStorage: healthkit_anchor_{uid}          ├─► Edge Function ingest-healthkit-workouts
AppState active → syncNow(20)                 │     (JWT, Zod, upsert service role)
subscribeToChanges → syncNow(1) [futuro]      │          │
                                              │          ▼
                                              │     tabela activities (RLS só select)
                                              └─► Edge Function delete-account / disconnect
```

**Configuração**
- Instalação: `npx expo install @kingstinct/react-native-healthkit react-native-nitro-modules`.
  - São **duas dependências nativas novas, que precisam de aprovação**, e exigem um novo dev build. Expo Go não funciona.
  - O pacote `@react-native-healthkit/core` vem junto automaticamente.
  - Versões exigidas: React 19 ou maior, RN 0.79 ou maior, Nitro 0.35 ou maior. Estamos no RN 0.88, então é compatível.
- Plugin no `app.json` para a v1:

```json
["@kingstinct/react-native-healthkit", {
  "NSHealthShareUsageDescription": "O Paceless lê seus treinos de corrida, rotas e frequência cardíaca do app Saúde para montar seu histórico e ajustar seu plano de treino.",
  "NSHealthUpdateUsageDescription": false,
  "background": false
}]
```

  O plugin vem com `background: true` por padrão, o que adiciona a entitlement de background delivery, então **é preciso desligar explicitamente**.

- **Privacy manifest:** nenhum dos dois pacotes traz `PrivacyInfo.xcprivacy`, e a biblioteca usa UserDefaults. Declarar em `ios.privacyManifests`:

```json
"ios": { "privacyManifests": { "NSPrivacyAccessedAPITypes": [
  { "NSPrivacyAccessedAPIType": "NSPrivacyAccessedAPICategoryUserDefaults",
    "NSPrivacyAccessedAPITypeReasons": ["CA92.1"] }
] } }
```

  Juntar com as entradas que o Expo e o AsyncStorage já pedem (C617.1, 35F9.1, E174.1) e conferir o resultado depois de `npx expo prebuild -p ios`.

- **Por plataforma:** o código fica em `hooks/healthkit/*.ios.ts`, com no-op em `*.ts`. Sempre checar `isHealthDataAvailable()`, porque ele é falso em alguns iPads.

**EAS**
- Usar a ASC API Key com `EXPO_ASC_API_KEY_PATH`, `EXPO_ASC_KEY_ID`, `EXPO_ASC_ISSUER_ID`, `EXPO_APPLE_TEAM_ID` e `EXPO_APPLE_TEAM_TYPE=COMPANY_OR_ORGANIZATION`. Os nomes vêm da documentação de CI do Expo; **a confirmar no SDK 58**.
- O `.p8` fica fora do git.
- Ao ligar o HealthKit, regenerar o profile com `eas credentials`.

**Tabela** (proposta)

```sql
create table public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('healthkit','garmin','polar','health_connect','paceless')),
  external_id text not null,
  source_bundle_id text,
  started_at timestamptz not null,
  ended_at timestamptz not null,
  duration_s numeric not null,
  distance_m numeric,
  energy_kcal numeric,
  avg_hr numeric,
  max_hr numeric,
  route_polyline text,
  hr_series jsonb,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider, external_id)
);
create index activities_user_started_idx on public.activities (user_id, started_at desc);
alter table public.activities enable row level security;
create policy "own activities read" on public.activities
  for select to authenticated using (
    (select auth.uid()) = user_id
    and (started_at >= now() - interval '30 days' or public.is_premium((select auth.uid())))
  );
```

- **Limite free/premium:** o servidor **guarda todas as corridas** e aplica o limite na leitura, pela RLS ou por uma Edge Function `list-activities`. `is_premium` é uma função security definer que lê a tabela sincronizada com o RevenueCat. Os 30 dias são um placeholder da regra de produto. Assim a âncora continua válida, e quem faz upgrade vê o histórico na hora.
- **Escrita:** os clientes não têm policy de insert, update nem delete. Toda escrita passa pela Edge Function com service role.
- **Exclusões:**
  - um treino apagado no Saúde recebe `deleted_at`, e um `pg_cron` apaga de vez depois de 30 dias;
  - a exclusão de conta apaga de vez por cascata.
- **Duplicatas:**
  1. pela chave exata `(user_id, provider, external_id)`;
  2. se o usuário tem conexão direta pela API da marca, descartar as corridas do HealthKit cujo `source_bundle_id` pertence a ela, usando a tabela `healthkit_source_map(bundle_id, provider)` no servidor;
  3. por aproximação: início ±120 s e distância ±3%, preferindo a linha que veio da API direta.
- Ignorar treinos gravados pelo próprio Paceless (`com.paceless.app`).

## Exemplos de código

Fontes: tipos da v16.2.0 lidos via `npm pack`, e as skills oficiais em https://github.com/kingstinct/react-native-healthkit/tree/master/skills/react-native-healthkit/references. App de exemplo: https://github.com/kingstinct/react-native-healthkit/tree/master/apps/example (`apps/example/app/(tabs)/workouts/index.tsx`).

> No código real do repositório não pode haver comentários em `.ts`. Os comentários abaixo existem só neste markdown.

### Conectar ao Apple Saúde

```ts
import {
  AuthorizationRequestStatus, getRequestStatusForAuthorization,
  isHealthDataAvailable, requestAuthorization, type ObjectTypeIdentifier,
} from '@kingstinct/react-native-healthkit'

// Tipar como array mutável evita erro de tuple readonly (validar com tsc)
const READ: ObjectTypeIdentifier[] = [
  'HKWorkoutTypeIdentifier', 'HKWorkoutRouteTypeIdentifier',
  'HKQuantityTypeIdentifierHeartRate', 'HKQuantityTypeIdentifierDistanceWalkingRunning',
]

export async function connectAppleHealth(): Promise<'unavailable' | 'requested'> {
  if (!isHealthDataAvailable()) return 'unavailable'
  const status = await getRequestStatusForAuthorization({ toRead: READ })
  if (status === AuthorizationRequestStatus.shouldRequest) {
    await requestAuthorization({ toRead: READ })
  }
  return 'requested' // não significa "concedido": leitura negada é invisível
}
```

### Sincronizar uma página com âncora

```ts
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  isProtectedDataAvailable, queryQuantitySamples, queryWorkoutSamplesWithAnchor,
  WorkoutActivityType,
} from '@kingstinct/react-native-healthkit'
import { encodePolyline } from './polyline'

const PAGE = 10
const anchorKey = (userId: string) => `healthkit_anchor_${userId}`

export type RunPayload = {
  externalId: string; startedAt: string; endedAt: string; durationS: number
  distanceM: number | null; energyKcal: number | null; sourceBundleId: string
  avgHr: number | null; maxHr: number | null; polyline: string | null
  hr: [number, number][]
}

export async function syncPage(
  userId: string,
  upload: (runs: RunPayload[], deleted: string[]) => Promise<void>,
) {
  if (!isProtectedDataAvailable()) return { done: true, reason: 'locked' as const }
  const anchor = (await AsyncStorage.getItem(anchorKey(userId))) ?? undefined
  const { workouts, deletedSamples, newAnchor } = await queryWorkoutSamplesWithAnchor({
    limit: PAGE, anchor,
    filter: { workoutActivityType: WorkoutActivityType.running },
  })
  const runs: RunPayload[] = []
  for (const w of workouts) {
    try {
      if (w.sourceRevision?.source?.bundleIdentifier === 'com.paceless.app') continue
      const [hrStat, routes, hrSamples] = await Promise.all([
        w.getStatistic('HKQuantityTypeIdentifierHeartRate', 'count/min'),
        w.getWorkoutRoutes(),
        // filtro por treino, não por data: evita misturar fontes
        queryQuantitySamples('HKQuantityTypeIdentifierHeartRate', {
          limit: 0, unit: 'count/min', filter: { workout: w },
        }),
      ])
      const points = routes.flatMap(r => r.locations) // downsample aqui (~1 ponto / 5 s)
      runs.push({
        externalId: w.uuid,
        startedAt: w.startDate.toISOString(), endedAt: w.endDate.toISOString(),
        durationS: w.duration.quantity,
        distanceM: w.totalDistance?.quantity ?? null,
        energyKcal: w.totalEnergyBurned?.quantity ?? null,
        sourceBundleId: w.sourceRevision?.source?.bundleIdentifier ?? 'unknown',
        avgHr: hrStat?.averageQuantity?.quantity ?? null,
        maxHr: hrStat?.maximumQuantity?.quantity ?? null,
        polyline: points.length ? encodePolyline(points.map(p => [p.latitude, p.longitude])) : null,
        hr: hrSamples.map(s => [Math.round(s.startDate.getTime() / 1000), s.quantity]),
      })
    } finally {
      w.dispose() // proxies seguram memória nativa
    }
  }
  await upload(runs, deletedSamples.map(d => d.uuid))
  await AsyncStorage.setItem(anchorKey(userId), newAnchor) // só depois do upload OK
  return { done: workouts.length < PAGE, reason: 'ok' as const }
}
```

### Encoder de polyline (algoritmo Google, sem dependência)

```ts
export function encodePolyline(points: [number, number][], precision = 5): string {
  const f = 10 ** precision
  let out = '', pLat = 0, pLng = 0
  const enc = (v: number) => {
    let n = v < 0 ? ~(v << 1) : v << 1
    let s = ''
    while (n >= 0x20) { s += String.fromCharCode((0x20 | (n & 0x1f)) + 63); n >>= 5 }
    return s + String.fromCharCode(n + 63)
  }
  for (const [lat, lng] of points) {
    const la = Math.round(lat * f), ln = Math.round(lng * f)
    out += enc(la - pLat) + enc(ln - pLng); pLat = la; pLng = ln
  }
  return out
}
```

No servidor, decodificar com `@mapbox/polyline` ou com `ST_LineFromEncodedPolyline(text, 5)` do PostGIS.

### Upload com retry, sessão e gatilho por AppState

```ts
import { AppState, type AppStateStatus } from 'react-native'
import { supabase } from '@/lib/supabase'
import { syncPage, type RunPayload } from './syncPage'

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

async function ensureSession() {
  const { data } = await supabase.auth.getSession()
  const s = data.session
  if (!s) return null
  // em background o autoRefresh está parado: renova manualmente
  if ((s.expires_at ?? 0) * 1000 - Date.now() < 60_000) {
    const { data: r, error } = await supabase.auth.refreshSession()
    return error ? null : r.session
  }
  return s
}

export async function uploadRuns(runs: RunPayload[], deleted: string[]) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const { error } = await supabase.functions.invoke('ingest-healthkit-workouts', { body: { runs, deleted } })
    if (!error) return
    const status = (error as { context?: Response }).context?.status ?? 0 // validar com tsc
    if (status >= 400 && status < 500 && status !== 429) throw error
    await sleep(1000 * 2 ** attempt)
  }
  throw new Error('ingest_failed')
}

let running = false
export async function syncNow(maxPages: number) {
  if (running) return // single-flight: evita corrida na âncora
  running = true
  try {
    const session = await ensureSession()
    if (!session) return
    for (let i = 0; i < maxPages; i++) {
      const r = await syncPage(session.user.id, uploadRuns)
      if (r.done) break
    }
  } finally {
    running = false
  }
}

export function startForegroundSync() {
  void syncNow(20)
  const sub = AppState.addEventListener('change', (s: AppStateStatus) => {
    if (s === 'active') void syncNow(20)
  })
  return () => sub.remove()
}
```

### Segundo plano (fase futura, plugin `background: true`)

```ts
import { configureBackgroundTypes, subscribeToChanges, UpdateFrequency } from '@kingstinct/react-native-healthkit'

// uma vez, após a autorização
await configureBackgroundTypes(['HKWorkoutTypeIdentifier'], UpdateFrequency.immediate)

// no carregamento do módulo em app/_layout.tsx (eventos ficam em buffer até aqui)
subscribeToChanges('HKWorkoutTypeIdentifier', async ({ errorMessage }) => {
  if (errorMessage) return
  await syncNow(1) // uma página por despertar
})
```

### Edge Function `ingest-healthkit-workouts` (Deno)

```ts
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { z } from 'npm:zod@3.23.8'

const Run = z.object({
  externalId: z.string().uuid(),
  startedAt: z.string().datetime(), endedAt: z.string().datetime(),
  durationS: z.number().nonnegative().max(86400),
  distanceM: z.number().nonnegative().max(500000).nullable(),
  energyKcal: z.number().nonnegative().max(20000).nullable(),
  sourceBundleId: z.string().max(200),
  avgHr: z.number().min(20).max(250).nullable(),
  maxHr: z.number().min(20).max(250).nullable(),
  polyline: z.string().max(60000).nullable(),
  hr: z.array(z.tuple([z.number().int(), z.number()])).max(5000),
})
const Body = z.object({ runs: z.array(Run).max(10), deleted: z.array(z.string().uuid()).max(500) })

Deno.serve(async (req) => {
  const url = Deno.env.get('SUPABASE_URL')!
  const userClient = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } })
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) return new Response('unauthorized', { status: 401 })

  const parsed = Body.safeParse(await req.json())
  if (!parsed.success) return Response.json(parsed.error.flatten(), { status: 400 })

  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const now = new Date().toISOString()
  // guarda TUDO; o limite free é aplicado na leitura (RLS / list-activities)
  if (parsed.data.runs.length) {
    const { error } = await admin.from('activities').upsert(parsed.data.runs.map(r => ({
      user_id: user.id, provider: 'healthkit', external_id: r.externalId,
      source_bundle_id: r.sourceBundleId, started_at: r.startedAt, ended_at: r.endedAt,
      duration_s: r.durationS, distance_m: r.distanceM, energy_kcal: r.energyKcal,
      avg_hr: r.avgHr, max_hr: r.maxHr, route_polyline: r.polyline, hr_series: r.hr,
      deleted_at: null, updated_at: now,
    })), { onConflict: 'user_id,provider,external_id' })
    if (error) return Response.json({ error: error.message }, { status: 500 })
  }
  if (parsed.data.deleted.length) {
    await admin.from('activities').update({ deleted_at: now })
      .eq('user_id', user.id).eq('provider', 'healthkit').in('external_id', parsed.data.deleted)
  }
  return Response.json({ accepted: parsed.data.runs.length })
})
```

CORS não é necessário, porque o `fetch` nativo não faz preflight e a versão web nunca chama esta função.

### Edge Function `delete-account` (diretriz 5.1.1(v) e LGPD)

Fonte: https://developer.apple.com/support/offering-account-deletion-in-your-app/

```ts
import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const url = Deno.env.get('SUPABASE_URL')!
  const userClient = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } })
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) return new Response('unauthorized', { status: 401 })
  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  // Storage pagina em 1000: fazer loop para usuários com muitos arquivos
  const { data: files } = await admin.storage.from('activities').list(user.id, { limit: 1000 })
  if (files?.length) await admin.storage.from('activities').remove(files.map(f => `${user.id}/${f.name}`))
  // hard delete; as FKs com on delete cascade apagam activities, connected_devices etc.
  const { error } = await admin.auth.admin.deleteUser(user.id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ deleted: true })
})
```

- Depois da exclusão, o app limpa `healthkit_anchor_{uid}` e avisa o usuário que os dados continuam no Apple Saúde.
- Se houver Sign in with Apple, também é preciso revogar os tokens pela REST API da Apple.

### Nota para a revisão (App Review Information)

> O Paceless lê treinos de corrida, rotas e frequência cardíaca do Apple Saúde (HealthKit) para montar o histórico do corredor e ajustar o plano de treino. Para testar: entre com a conta demo abaixo, vá em Perfil > Conexões > Apple Saúde > Conectar e conceda acesso. Os treinos aparecem em Histórico com o rótulo "via Apple Saúde". Os dados de saúde não são usados para publicidade e não são compartilhados com terceiros para marketing. Demo: [email] / [senha].
> (EN) Paceless reads running workouts, routes and heart rate from Apple Health to build the user's training history. Path: Profile > Connections > Apple Health > Connect. Health data is never used for advertising.

Anexar também um vídeo de 30 a 60 s gravado num aparelho real, mostrando a conexão, a tela de permissão do sistema e as corridas importadas, porque o simulador do revisor normalmente não tem treinos.

**Checklist de revisão**
- [ ] Linha "Apple Saúde" em Perfil > Conexões, com status e botão "Conectar"
- [ ] Rótulo "via Apple Saúde" em cada corrida importada
- [ ] Entitlements apenas do que é usado: sem `toShare` e sem background delivery
- [ ] Descrição da loja menciona a integração com o Apple Saúde
- [ ] Rótulo de privacidade e URL da política preenchidos
- [ ] Nenhum dado do HealthKit vai para PostHog, RevenueCat ou SDK de anúncio
- [ ] Exclusão de conta dentro do app funcionando
- [ ] Estado vazio explicativo quando não há treinos (o revisor nunca vê tela em branco)

**Testes**
- **Simulador:** semear dados com `saveWorkoutSample` e `saveWorkoutRoute` numa tela só de dev (`__DEV__`). A permissão de escrita fica apenas na variante de desenvolvimento (`app.config.ts` com `APP_VARIANT`) e nunca vai para produção.
- **iPhone real:**
  - importar cerca de 200 corridas;
  - apagar um treino no Saúde e conferir o espelhamento;
  - ativar o modo avião durante o upload e conferir que a âncora não avança;
  - testar permissões parciais;
  - testar com o aparelho bloqueado;
  - testar force-quit;
  - sincronizar Garmin, Polar e Coros para descobrir os bundle ids reais.
- **TestFlight:** o Pedro testa com os dados reais dele.

## Riscos e pontos a confirmar

- **Corridas da Garmin pelo Saúde sem rota:** os relatos da comunidade divergem (**a confirmar**). O Garmin Connect só transfere dados com o app em primeiro plano. Para usuários Garmin, a preferência é a API Garmin.
- **Polar e Coros gravam rota no Saúde?** **A confirmar.**
- **Bundle ids** de Garmin, Polar e Coros (`com.garmin.` etc.): ainda são palpites (**a confirmar**). Descobrir com um log no dev build e manter a tabela no servidor.
- **Segundo plano:** é de melhor esforço, não funciona depois de force-quit, e a janela e a frequência estão **a confirmar**. A execução do handler JS num cold launch ainda não foi testada no aparelho.
- **Limite de corpo da requisição** nas Edge Functions: **a confirmar**. O limite de 2 s de CPU é o mais apertado.
- **Deployment target mínimo do SDK 58:** **a confirmar**, conferir depois do prebuild.
- **Compatibilidade real da v16 com o SDK 58 / RN 0.88:** não foi comprovada com build. Passo 0 da implementação:
  1. instalar os pacotes;
  2. `npx expo prebuild -p ios --clean`;
  3. `eas build -p ios --profile development`;
  4. `npx tsc --noEmit`.
- Fixar a versão de `react-native-nitro-modules` igual à do app de exemplo da kingstinct.
- **Tipos a validar com `tsc`:** `READ` tipado, `FunctionsHttpError.context` e as chaves das estatísticas.
- **Uso de UserDefaults no Swift do `@react-native-healthkit/core`:** não foi feito grep (**a confirmar**).
- **A primeira criação da ASC API Key é exclusiva do Account Holder?** **A confirmar.**
- **Prazos da Apple:** o prazo de verificação da inscrição está **a confirmar**, e o preço em BRL de 2026 também.
- **MEI/EI:** pode bloquear a inscrição como Organization.
- **Alternativa `react-native-health`:** desatualizada (1.19.0, de 2024-10-15). Não usar.
- **Rejeições frequentes** como "política ausente" e "dados usados antes da permissão": não confirmadas como tendência em 2025-2026. A segunda continua valendo como regra para evitar crash: nunca consultar antes de autorizar.

## Fontes

- https://www.npmjs.com/package/@kingstinct/react-native-healthkit (v16.2.0, modificada em 2026-10-12, código lido via npm pack)
- https://www.npmjs.com/package/@react-native-healthkit/core
- https://www.npmjs.com/package/react-native-nitro-modules
- https://github.com/kingstinct/react-native-healthkit
- https://github.com/kingstinct/react-native-healthkit/tree/master/apps/example
- https://github.com/kingstinct/react-native-healthkit/blob/master/skills/react-native-healthkit/references/authorization.md
- https://github.com/kingstinct/react-native-healthkit/blob/master/skills/react-native-healthkit/references/subscriptions-and-background.md
- https://github.com/kingstinct/react-native-healthkit/blob/master/skills/react-native-healthkit/references/workouts-and-other-types.md
- https://github.com/agencyenterprise/react-native-health
- https://developer.apple.com/app-store/review/guidelines/ (lido em 2026-10-29)
- https://developer.apple.com/app-store/app-privacy-details/
- https://developer.apple.com/support/offering-account-deletion-in-your-app/
- https://developer.apple.com/documentation/healthkit/creating-a-workout-route
- https://developer.apple.com/documentation/healthkit/reading-route-data
- https://developer.apple.com/documentation/healthkit/hkworkoutroutequery
- https://developer.apple.com/documentation/healthkit/hkhealthstore/enablebackgrounddelivery(for:frequency:withcompletion:)
- https://developer.apple.com/forums/thread/803365 (force-quit, out/2025)
- https://developer.apple.com/forums/thread/813897 (rejeição 2.5.1, jan-fev/2026)
- https://developer.apple.com/help/account/membership/D-U-N-S/
- https://developer.apple.com/support/D-U-N-S/
- https://developer.apple.com/enroll/duns-lookup/
- https://developer.apple.com/br/support/fee-waiver/
- https://developer.apple.com/help/app-store-connect/manage-tax-information/provide-tax-information/
- https://developer.apple.com/licensing-trademarks/works-with-apple-health/
- https://developer.apple.com/health-fitness/works-with-apple-health/
- https://docs.expo.dev/app-signing/apple-developer-program-roles-and-permissions/
- https://docs.expo.dev/build/building-on-ci/
- https://docs.expo.dev/guides/apple-privacy/
- https://supabase.com/docs/guides/functions/limits
- https://forums.garmin.com/apps-software/mobile-apps-web/f/garmin-connect-mobile-ios/109531/health-app-not-syncing-correctly/697668
- https://forums.garmin.com/apps-software/mobile-apps-web/f/garmin-connect-mobile-ios/336260/garmin-connect-not-syncing-workouts-to-apple-health/1631387
- https://openwearables.io/docs/sdk/react-native (não aberto; **a confirmar**)
- https://magora-systems.com/duns-number-apple-developer/ (guia de terceiros)
- https://studio.adalo.com/blog/apple-developer-program-guide (guia de terceiros)
- `docs/relogios.md`
