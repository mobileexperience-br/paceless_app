# Plataformas: Health Connect e HealthKit

Pesquisa WS1, feita em 19/10/2026. Itens sem fonte oficial confirmada estão como **a verificar**.
Contexto: [produto.md](../produto.md) e [pesquisa/relogios-e-saude.md](../pesquisa/relogios-e-saude.md).
Este documento aprofunda aquela pesquisa; onde divergir, vale este.

## Resumo

- Health Connect (Android) e HealthKit (iOS) são o caminho recomendado: sem contrato com fabricante, sem custo, e o dado só sai do aparelho com autorização do usuário.
- **Rota GPS** é o ponto frágil: o Android exige consentimento por rota e não a entrega em segundo plano; vários fabricantes não a escrevem no Health Connect (a verificar por marca).
- As bibliotecas existem e são mantidas. As duas exigem dev build (EAS) e aprovação para instalar (regra do projeto).
- MVP: importar corridas (início, duração, distância, FC média) dos últimos 30 dias, Android primeiro. Esforço total **G**; Android **M**, iOS **M**.

## 1. Tipos de dado e permissões

### Health Connect (Android)

Fonte: [data types](https://developer.android.com/health-and-fitness/health-connect/data-types), [ler dados](https://developer.android.com/health-and-fitness/health-connect/read-data), [rotas](https://developer.android.com/health-and-fitness/health-connect/features/exercise-routes).

| Dado | Record | Leitura | Escrita |
|---|---|---|---|
| Sessão de exercício (corrida = `EXERCISE_TYPE_RUNNING` ou `_TREADMILL`; voltas e segmentos) | `ExerciseSessionRecord` | `READ_EXERCISE` | `WRITE_EXERCISE` |
| Rota GPS (anexada à sessão) | `ExerciseRoute` | `READ_EXERCISE_ROUTES` | `WRITE_EXERCISE_ROUTE` |
| Frequência cardíaca (série de amostras) | `HeartRateRecord` | `READ_HEART_RATE` | `WRITE_HEART_RATE` |
| Passos | `StepsRecord` | `READ_STEPS` | `WRITE_STEPS` |
| Cadência de passos (série) | `StepsCadenceRecord` | `READ_STEPS` | `WRITE_STEPS` |
| Distância | `DistanceRecord` | `READ_DISTANCE` | `WRITE_DISTANCE` |
| Velocidade (série) | `SpeedRecord` | `READ_SPEED` | `WRITE_SPEED` |
| VO2 máx | `Vo2MaxRecord` | `READ_VO2_MAX` | `WRITE_VO2_MAX` |
| Elevação ganha | `ElevationGainedRecord` | `READ_ELEVATION_GAINED` | `WRITE_ELEVATION_GAINED` |

Regras que importam:

| Tema | Regra | Impacto |
|---|---|---|
| Histórico | Por padrão só dados dos 30 dias anteriores à primeira permissão. Mais que isso exige `READ_HEALTH_DATA_HISTORY`. Reinstalar reinicia a janela | MVP não precisa; permissão extra passa por revisão |
| Segundo plano | Exige `READ_HEALTH_DATA_IN_BACKGROUND` (concedida pelo usuário) e WorkManager. Sem ela, só em primeiro plano | MVP: sincronizar ao abrir o app |
| Rota | Rota de outro app **não** é entregue em segundo plano (`ConsentRequired`, mesmo com "Sempre permitir"); leitura de terceiros pede consentimento pontual do usuário, por rota | Importar rota só durante interação, com tela explicando. Atrito alto; fora do MVP |
| Changes API | Token de mudanças expira se não usado em **30 dias**; recuperação: reler e deduplicar por id ([sync](https://developer.android.com/health-and-fitness/health-connect/sync-data)) | Guardar `last_sync_at` e o id do Health Connect |
| Limites de taxa | Há limites periódicos e diários de leitura/escrita, mais estritos em segundo plano. **Números não publicados** na [página oficial](https://developer.android.com/health-and-fitness/health-connect/rate-limiting) | Paginar (1000 por página), usar `aggregate()` para totais, recuar ao receber exceção |
| Disponibilidade | Embutido no Android 14+; Android 9 a 13 precisa do app Health Connect da Play Store (minSdk 26 da lib). Percentual de aparelhos no Brasil: **a verificar** | Tratar "Health Connect não instalado" na UI |

### HealthKit (iOS)

Fonte: [HKWorkoutRouteBuilder](https://developer.apple.com/documentation/healthkit/hkworkoutroutebuilder), [diretrizes](https://developer.apple.com/app-store/review/guidelines/). A página de documentação não retornou texto completo; o que segue vem de conhecimento prévio e está marcado onde precisa de conferência.

| Dado | Tipo HealthKit | Observação |
|---|---|---|
| Treino | `HKWorkout` (`.running`) | Duração, distância e energia via estatísticas |
| Rota GPS | `HKWorkoutRoute` / `HKSeriesType.workoutRoute()` | Leitura via `HKWorkoutRouteQuery`; permissão própria de leitura |
| FC | `HKQuantityType(.heartRate)` | Amostras; `HKStatisticsQuery` para média e máx |
| Distância, passos | `.distanceWalkingRunning`, `.stepCount` | |
| Velocidade, potência, passada de corrida | `.runningSpeed`, `.runningPower`, `.runningStrideLength` (iOS 16+) | Dependem do relógio; **a verificar** |
| Cadência de corrida | Sem tipo dedicado conhecido; derivar de passos e tempo | **a verificar** |
| VO2 máx | `.vo2Max` | |

Regras: o app **não sabe se a leitura foi negada** (a Apple devolve vazio por privacidade), então "sem dados" deve ser um estado normal na UI. Entrega em segundo plano (`enableBackgroundDelivery`) exige entitlement próprio; fora do MVP. Dados de saúde ficam inacessíveis com o aparelho bloqueado.

## 2. Quais relógios escrevem em cada hub

Regra geral: o relógio fala com o **app do fabricante**, e este escreve no hub. Os dados chegam quando o app do fabricante sincroniza, não em tempo real.

| Marca / plataforma | Health Connect | HealthKit | Rota GPS | Atraso | Confiança |
|---|---|---|---|---|---|
| **Apple Watch** | Não (só iOS) | Sim, nativo | Sim (`HKWorkoutRoute`) | Minutos, ao sincronizar com o iPhone | Alta |
| **Garmin** (Garmin Connect) | Sim, desde 2025, só Garmin para Health Connect (unidirecional). FC, distância, velocidade, passos, calorias, sono ([Tom's Guide](https://www.tomsguide.com/wellness/fitness-trackers/garmin-clarifies-what-data-its-sharing-with-google-health-connect-heres-the-full-list), [newsletter Google](https://developer.android.com/health-and-fitness/community/newsletters/2025/08)) | **A verificar** (oficial) | **A verificar.** Listas encontradas não citam rota; dinâmica de corrida e potência ficam no Garmin Connect | Após sync do Garmin Connect | Média |
| **Samsung** (Galaxy Watch) | Sim, via Samsung Health no celular, desde a v6.22.5 ([Samsung](https://developer.samsung.com/health/blog/accessing-samsung-health-data-through-health-connect)) | Não | **A verificar.** Fonte de terceiros diz que o GPS detalhado não vai | Quando o relógio reconecta ao celular | Média |
| **Polar** (Flow) | Sim, no app Android; inclui "rota do exercício, se disponível" ([Polar](https://support.polar.com/en/flow-app-health-connect)) | **A verificar** | Sim, segundo o Polar | Sincroniza ao abrir o app, segundo blog de terceiros | Média |
| **Coros** | **A verificar** (sem fonte oficial achada; documentado: Strava) | **A verificar** | A verificar | - | Baixa |
| **Suunto** | **A verificar** (documentado: Strava) | **A verificar** | A verificar | - | Baixa |
| **Amazfit / Zepp** | Sim, com métricas avançadas só no app Zepp (blog de terceiros) | Sim (review 2026) | **A verificar** | Após sync do Zepp | Baixa |
| **Xiaomi** (Mi Fitness) | Passos, FC, sono, calorias (blog de terceiros). Treino com GPS: **a verificar** | **A verificar** | A verificar | - | Baixa |
| **Wear OS** (Pixel Watch etc.) | Sim, via app do fabricante (Fitbit/Google ou Samsung Health). Detalhe por modelo: **a verificar** | Não | **A verificar** | - | Baixa |

Conclusão prática: **sessão + FC + distância** é o conjunto realista na maioria das marcas; **rota e dinâmica de corrida não podem ser prometidas**. Garmin direto e Strava estão bloqueados (ver pesquisa anterior). Validar com relógios reais (Garmin, Apple Watch, Galaxy Watch, Amazfit) antes de anunciar compatibilidade.

## 3. Bibliotecas (Expo SDK 58, RN 0.88)

Versões consultadas no npm em 19/10/2026. O projeto usa `expo ^58` e `react-native 0.88.0`.

| Lib | Versão / publicação | Plataforma | Expo e nova arquitetura | Notas |
|---|---|---|---|---|
| [`react-native-health-connect`](https://github.com/matinzd/react-native-health-connect) | 4.1.3 (ago/2026) | Android | Peer `expo *`, `react-native *`. Plugin Expo embutido; README declara suporte a arquitetura antiga e nova. Exige `expo-build-properties` (minSdk 26, compile/target SDK 36). **Não roda no Expo Go** | Compat. real com SDK 58 e RN 0.88: **a verificar** com `expo prebuild` num branch. `expo-health-connect` está depreciado; os dois juntos quebram o build |
| [`@kingstinct/react-native-healthkit`](https://github.com/kingstinct/react-native-healthkit) | 16.2.0 (12/out/2026) | iOS | Peer `react >=19`, `react-native >=0.79`, `react-native-nitro-modules >=0.35` (dependência nova). Plugin Expo com `NSHealthShareUsageDescription`, `NSHealthUpdateUsageDescription`, `background` | Mantida ativamente. Rota via `getWorkoutRoutes()`. Escrita de treino: README não documenta; **a verificar** na API |
| `react-native-health` | 1.19.0 (out/2024) | iOS | Peer `react-native >=0.67.3` | Sem publicação há 2 anos. **Descartar** |

Ambas exigem **novo build de desenvolvimento no EAS**. Pela regra do projeto, instalar só após aprovação do plano. `react-native-nitro-modules` conta como dependência nova.

## 4. Lojas, políticas e LGPD

### Google Play

Fonte: [publicar app com Health Connect](https://developer.android.com/health-and-fitness/health-connect/publish).

| Exigência | Detalhe |
|---|---|
| Declaração de apps de saúde (Play Console, Conteúdo do app) | Selecionar recursos de saúde e justificar cada tipo de dado (categoria "Atividade e fitness"). Pedir só o mínimo |
| Seção Segurança dos dados | Declarar coleta de dados de saúde e fitness |
| Política de privacidade | Mesma URL na ficha da loja e na tela de permissões do Health Connect. Já há rascunho em [docs/legal](../legal/) |
| Alterar tipos depois | Reenviar a declaração; nova versão do app pode gerar nova revisão |
| Formulário antigo do Google | README da lib diz que o formulário avulso é aposentado em 3/set/2026; aprovação até 7 dias, mais 5 a 7 dias úteis para propagar. Prazos exatos: **a verificar** |
| Tela de justificativa de permissões (Android 14+) | Activity no manifesto; detalhe: **a verificar** na doc de permissões |

Escopo mínimo sugerido para o MVP: `READ_EXERCISE`, `READ_HEART_RATE`, `READ_DISTANCE`. Sem `READ_EXERCISE_ROUTES`, histórico nem segundo plano. Escrita (`WRITE_EXERCISE`, `WRITE_DISTANCE`) só na fase 2.

### Apple

Fonte: [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/).

| Exigência | Detalhe |
|---|---|
| Capability HealthKit e entitlement | Habilitar no App ID (o config plugin e o EAS cuidam) |
| Textos de uso | `NSHealthShareUsageDescription` (ler) e `NSHealthUpdateUsageDescription` (escrever), claros sobre a finalidade (5.1.1(ii)) |
| 2.5.1 | HealthKit deve servir a fins de saúde e fitness |
| 5.1.2(vi) e 5.1.3(i) | Dado do HealthKit **não** pode ser usado para marketing, publicidade nem mineração de uso, nem por terceiros; só para benefício direto ao usuário ou gestão de saúde. Informar quais dados são coletados |
| 5.1.3(ii) | Não escrever dado falso ou impreciso no HealthKit; não guardar informação de saúde no iCloud |
| 2.5.18 | Sem anúncios segmentados com dado de saúde |
| 5.1.1(i) e (iii) | Política de privacidade no App Store Connect e no app; minimização |
| 1.4.1 | Lembrar o usuário de consultar médico; o aviso de saúde da compliance recente já cobre |

**Atenção ao plano adaptativo por IA:** as regras permitem uso para gestão de saúde em benefício do usuário, mas enviar dado do HealthKit a um modelo de terceiros (via Edge Function) deve constar na política de privacidade e ser conferido com o jurídico. A Apple não proíbe IA nominalmente (diferente da Strava); como a revisão interpreta: **a verificar**.

### LGPD

Dado de saúde é **dado pessoal sensível** (art. 5º, II, e art. 11 da LGPD).

- Consentimento específico e destacado, separado do aceite geral, para importar dados do relógio, com finalidade explícita (plano de treino).
- Minimização: só os tipos usados; sem rota se não houver uso.
- Exclusão junto com a conta e ação "Desconectar e apagar dados importados".
- Dados trafegam só ao Supabase (RLS por `user_id`); sem chave de terceiros no app; sem compartilhamento com anunciantes.
- Base legal e relatório de impacto (RIPD): **a verificar** com advogado.

## 5. Escrever as corridas do Paceless de volta nos hubs

| Aspecto | Health Connect | HealthKit |
|---|---|---|
| Viável? | Sim: `ExerciseSessionRecord` (com `exerciseRoute`), `DistanceRecord`, `HeartRateRecord` se houver | Sim: `HKWorkout` + `HKWorkoutRouteBuilder` |
| Permissões extras | `WRITE_EXERCISE`, `WRITE_DISTANCE`, `WRITE_EXERCISE_ROUTE` | Compartilhar `workoutType` e `workoutRoute` (`NSHealthUpdateUsageDescription`) |
| Dedup própria | `clientRecordId` = `activities.id`, `clientRecordVersion` = versão ou timestamp. Escrita é upsert | Guardar o UUID do `HKWorkout` na linha; metadata de sync (`HKMetadataKeySyncIdentifier` e versão): **a verificar** nomes na doc atual |
| Armadilhas | Atualizar sessão sem rota, tendo permissão de rota, **apaga** a rota existente. Apagar sessão por intervalo não apaga a distância associada | Não gravar dado impreciso (5.1.3(ii)) |
| Ao importar | Ignorar registros cujo `dataOrigin` seja o nosso pacote | Ignorar a `HKSource` do nosso bundle |

Efeito: a corrida aparece em outros apps que leem o hub (Samsung Health, Garmin Connect não lê, Strava via hub depende do app). Escrever é **opcional** e fica para a fase 2.

## 6. Mapeamento para o schema

Estado atual: `activities` tem `type`, `started_at`, `ended_at`, `duration_seconds`, `distance_meters`, `avg_pace_seconds_per_km`, `route jsonb`, sem `source` nem `external_id` ([migration](../../supabase/migrations/20261019180000_create_activities.sql)). RLS de select, insert e delete (sem update).

### Colunas novas em `activities` (proposta; nada alterado agora)

| Coluna | Uso |
|---|---|
| `source` text (`paceless`, `health_connect`, `healthkit`), default `paceless` | Origem |
| `external_id` text | Id do registro no hub (`metadata.id` ou UUID do `HKWorkout`) |
| `origin_app` text | Pacote/bundle de origem, para mostrar "via Garmin Connect" |
| `avg_hr`, `max_hr` smallint | FC resumida (MVP) |
| `imported_at` timestamptz | |
| `merged_into` uuid (nulo) | Dedup entre fontes (abaixo) |
| Único parcial `(user_id, source, external_id)` onde `external_id` não é nulo | Evita reimportar |

`route jsonb` já comporta uma rota importada, mas séries longas ficam melhor em tabela própria.

### Tabelas novas (fase 2)

| Tabela | Conteúdo |
|---|---|
| `activity_streams` | `activity_id`, `t_offset_s`, `hr`, `lat`, `lng`, `altitude`, `cadence`, `speed`. Alternativa: arrays ou `jsonb` por atividade para reduzir linhas (1 h a 1 Hz = 3600 linhas) |
| `activity_splits` | `activity_id`, `km_index`, `duration_s`, `avg_hr`. Podem ser calculados a partir do stream |
| `connected_devices` (equivale a `health_connections` da pesquisa anterior) | `user_id`, `provider` (`health_connect`, `healthkit`), `granted_scopes`, `connected_at`, `last_sync_at`, `changes_token` (Android), `anchor` (iOS), `revoked_at` |

Tudo com RLS por `user_id` e `ON DELETE CASCADE`. `activities` hoje não tem política de update; upsert na importação vai precisar dela, ou de Edge Function.

### Dedup: mesma corrida gravada pelo app e pelo relógio

| Camada | Regra |
|---|---|
| 1. Idempotência | Único `(user_id, source, external_id)`; reimportar não duplica |
| 2. Eco do nosso app | Ao escrever no hub, guardar o id; ao ler, descartar o que for do nosso pacote |
| 3. Mesma corrida, fontes diferentes | Candidata se `started_at` difere até ~2 min, duração até ~5% e distância até ~5%. A mais rica (FC/rota do relógio) vira principal; a outra recebe `merged_into` e fica fora das métricas do plano |
| 4. Conflito de valores | Sugestão: priorizar o relógio (tem FC) e mostrar a origem. **Decisão de produto** |

Limiares são sugestões, a calibrar com dados reais. No MVP, calcular no cliente ao importar basta; mover para Edge Function se o plano adaptativo exigir consistência no servidor.

## 7. Recomendação e esforço

| Fase | Entrega | Esforço |
|---|---|---|
| 0 | Validar compat. SDK 58 e EAS dev build com as duas libs; testar com 3 ou 4 relógios reais; abrir a declaração do Play | P |
| 1 (MVP) | Android: conectar Health Connect, importar corridas dos últimos 30 dias (início, duração, distância, FC média), mostrar origem, dedup camadas 1 a 3, migration (`source`, `external_id`, FC), `connected_devices` | **M** |
| 1b | iOS: mesmo escopo com HealthKit | **M** |
| 2 | Escrever de volta; FC em série e rota importada (consentimento por rota no Android); splits; segundo plano | M a G |
| 3 | Histórico acima de 30 dias, dinâmica de corrida, VO2 máx | M |

Total do MVP (1 + 1b + dedup + telas + lojas): **G**, como na pesquisa anterior. Android primeiro; MVP sem rota é a escolha certa, dado o consentimento por rota e a ausência de rota em várias marcas.

### Perguntas em aberto

1. Quais relógios o público brasileiro usa de fato? Garmin sem rota via hub basta para o plano adaptativo?
2. O plano precisa de FC por amostra ou só da média?
3. Aceitamos a prioridade "relógio sobre GPS do celular" na dedup?
4. Aprovar `react-native-health-connect`, `@kingstinct/react-native-healthkit` e `react-native-nitro-modules`.
5. Parecer jurídico sobre envio de dado de saúde à IA (LGPD e Apple 5.1.3).

## Fontes

- [Health Connect: tipos de dados](https://developer.android.com/health-and-fitness/health-connect/data-types)
- [Health Connect: ler dados](https://developer.android.com/health-and-fitness/health-connect/read-data)
- [Health Connect: sincronizar dados](https://developer.android.com/health-and-fitness/health-connect/sync-data)
- [Health Connect: rotas de exercício](https://developer.android.com/health-and-fitness/health-connect/features/exercise-routes)
- [Health Connect: limites de taxa](https://developer.android.com/health-and-fitness/health-connect/rate-limiting)
- [Health Connect: publicar](https://developer.android.com/health-and-fitness/health-connect/publish)
- [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [HKWorkoutRouteBuilder](https://developer.apple.com/documentation/healthkit/hkworkoutroutebuilder)
- [Polar e Health Connect](https://support.polar.com/en/flow-app-health-connect)
- [Samsung Health e Health Connect](https://developer.samsung.com/health/blog/accessing-samsung-health-data-through-health-connect)
- [Garmin e Health Connect (Tom's Guide)](https://www.tomsguide.com/wellness/fitness-trackers/garmin-clarifies-what-data-its-sharing-with-google-health-connect-heres-the-full-list)
- [react-native-health-connect](https://github.com/matinzd/react-native-health-connect) e [react-native-healthkit](https://github.com/kingstinct/react-native-healthkit)
