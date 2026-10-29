# Relógios, pulseiras e cintas cardíacas: planejamento

Pesquisa aprofundada por marca, com cadastros, exemplos de código e o checklist do Pedro: [integracoes-relogios/](./integracoes-relogios/README.md).

Planejado em 29/10/2026. Atualiza a pesquisa de [pesquisa/relogios-e-saude.md](./pesquisa/relogios-e-saude.md)
(19/10). Marcas pedidas pelo Pedro: **Garmin, Apple Watch, Samsung, Coros e Polar**, além das
**cintas cardíacas**.

## Os quatro caminhos para receber dados

| Caminho | Como funciona | Quando o dado chega | Exemplos |
|---|---|---|---|
| **1. Central de saúde do celular** | O app do relógio grava no Apple Saúde (HealthKit) ou no Health Connect (Android); o Paceless lê de lá | Depois da corrida, quando o app da marca sincroniza | Apple Watch, Samsung, e Garmin, Coros e Polar se o usuário ativar a sincronização no app da marca |
| **2. Nuvem da marca (API)** | O usuário autoriza (OAuth) e a marca envia as atividades ao nosso servidor | Depois da corrida, por webhook | Garmin Connect API, Polar AccessLink, Coros Partner API |
| **3. Bluetooth direto (BLE)** | O celular conecta na cinta ou no relógio e lê a frequência cardíaca **ao vivo** | Durante a corrida, segundo a segundo | Cintas Polar H10, Garmin HRM, Coros HRM, Wahoo TICKR; relógios no modo "transmitir FC" |
| **4. App no relógio** | Um app nosso roda no próprio relógio | Durante a corrida, no pulso | watchOS (Apple), Wear OS (Samsung), Connect IQ (Garmin) |

É assim que a comunidade faz: os apps de corrida combinam o caminho 1 (cobertura ampla e barata),
o 2 para as marcas mais usadas e o 3 para a FC ao vivo. O caminho 4 vem depois, quando o produto já
está maduro.

## Situação de cada marca (out/2026)

| Marca | Central do celular | Nuvem da marca | Bluetooth (FC ao vivo) |
|---|---|---|---|
| **Apple Watch** | HealthKit: caminho natural | Não existe API de nuvem | Não transmite FC por BLE para outros apps; ao vivo exige app watchOS |
| **Samsung** | Health Connect (Samsung Health sincroniza com ele) | Samsung Health Data SDK: acesso mediante parceria ([Samsung](https://developer.samsung.com/health/android/overview.html); o SDK antigo foi descontinuado em 31/07/2025) | Alguns modelos transmitem FC |
| **Garmin** | Sincroniza com Apple Saúde e Health Connect se o usuário ativar no Garmin Connect | **Reabriu em 21/10/2026** com planos Personal, Starter e Enterprise. Starter: Activity API (JSON e .FIT) e Health API, até 1.000 usuários, só envio por push, sem histórico ([Garmin](https://developerportal.garmin.com/developer-programs/connect-developer-api), [Sahha](https://sahha.ai/blog/garmin-connect-api-reopened-fees/)). Tem sandbox para testes | Cintas HRM e relógios no modo "transmitir FC" |
| **Coros** | Sincroniza com Apple Saúde e Health Connect | Partner API com cadastro e verificação ([Coros](https://support.coros.com/hc/en-us/articles/53181766856724-Partner-API-Access)) | Cinta Coros HRM; relógios transmitem FC |
| **Polar** | Sincroniza com Apple Saúde e Health Connect | **AccessLink aberto** (cadastro próprio, OAuth 2.0, modelo de transações) ([Polar](https://www.polar.com/us-en/developers/)) | Cinta H10, padrão de mercado |
| Strava | — | Restrita e proíbe uso dos dados em IA (ver pesquisa de 19/10) | — |

Itens a confirmar direto com cada marca antes de implementar: preços e termos do plano Starter da
Garmin, termos do Samsung Health Data SDK, prazo de aprovação da Coros.

## Cinta cardíaca: como funciona

- Toda cinta e relógio que transmite FC usa o mesmo **padrão Bluetooth**: serviço Heart Rate
  `0x180D`, característica Heart Rate Measurement `0x2A37`. Uma única implementação cobre todas
  as marcas.
- O app procura dispositivos com esse serviço, a pessoa escolhe a cinta uma vez, e nas próximas
  corridas o app reconecta sozinho.
- Lib usada pela comunidade: `react-native-ble-plx`, com config plugin da Expo. Não roda no Expo Go;
  precisa de build novo ([Expo](https://expo.dev/blog/how-to-build-a-bluetooth-low-energy-powered-expo-app)).
- Os dados chegam em Base64 e são decodificados segundo a especificação do Bluetooth SIG (FC em 8 ou
  16 bits, intervalos RR opcionais).
- Na corrida: FC atual na tela, zonas de FC, média e máxima no resumo, gravadas na atividade.

## Fases

### Fase 1: central de saúde do celular (maior cobertura, menor custo)

**Status (29/10/2026): implementado no branch `feat/wearables`, aguardando dev build.**

Feito no código (sem build nativo ainda):

- Config plugins em `app.json`: HealthKit, Health Connect, `expo-build-properties` (minSdk 26,
  compile e target 36), 7 permissões `android.permission.health.*`, Health na privacy manifest.
- Migration `20261029130000_activities_external_source.sql` (não aplicada no remoto): `source`,
  `external_id`, `source_name`, FC média e máxima, unique `(user_id, source, external_id)`.
- Perfil > Dispositivos conectados: conectar, status, última sincronização, "Sincronizar agora",
  desconectar com opção de apagar importados, "Abrir Play Store" quando o Health Connect falta
  ou precisa de atualização, e guia por marca (Garmin, COROS, Polar, Samsung, Apple Watch).
- Tela de consentimento `profile/health-consent` antes de qualquer permissão (LGPD).
- Importação dos últimos 30 dias na conexão, ao abrir o app (sincronização automática a cada
  15 minutos, em primeiro plano) e manualmente. Dedupe por id externo e por sobreposição de 50%
  com corridas do Paceless.
- Origem na lista de atividades ("Apple Saúde", "Garmin", etc.).
- Gravação das corridas e caminhadas do Paceless no Apple Saúde e no Health Connect ao terminar
  (distância, duração e rota). FC ainda não é gravada (o Paceless não grava FC até a fase 2).

Pendente para testar em aparelho (dev build):

- [ ] Permissão do Apple Saúde e tela de consentimento do Health Connect em Android 14 e Android 9 a 13.
- [ ] Importar treinos de Garmin, COROS, Polar e Samsung e confirmar o nome de cada origem.
  Os nomes de pacote do Health Connect (`brandByPackage` em `lib/healthHubLabels.ts`) são
  **a confirmar** em aparelho.
- [ ] Conferir se o Apple Saúde entrega rota e FC de treinos de outras marcas (a confirmar).
- [ ] Conferir no Apple Saúde a corrida gravada pelo Paceless, com distância e rota.
- [ ] Conferir os caminhos de menu de cada guia de marca em `lib/brandGuides.ts` (a confirmar).
- [ ] Dedupe: corrida gravada pelo Paceless não aparece duplicada depois de sincronizar.
- [ ] Desconectar com e sem "apagar importados" e conferir que a sincronização para.
- [ ] Revogar a permissão fora do app e conferir o estado "Permissão revogada. Conecte de novo.".
- [ ] Checklist de lojas em [lojas/health-connect-healthkit.md](./lojas/health-connect-healthkit.md).

Escolhas desta fase, além do pedido:

- A importação é feita pelo client, com insert sob RLS (sem Edge Function). Os dados são do próprio
  usuário. Os endpoints `ingest-*` de [integracoes-relogios/](./integracoes-relogios/README.md)
  podem vir depois.
- O Health Connect não aceita sessão e distância no mesmo `insertRecords` (a lib lança erro
  com tipos misturados). A gravação usa duas chamadas.
- Desconectar no Android não chama `revokeAllPermissions` (só vale após reiniciar o app). O app
  para de sincronizar e o usuário revoga em "Gerenciar permissões".
- A FC não é gravada (o Paceless não grava FC até a fase 2).

- iOS: `@kingstinct/react-native-healthkit`; Android: `react-native-health-connect` (plugin Expo
  embutido desde a v4, minSdk 26). Compatibilidade com o SDK 58: verificar na hora de instalar.
- Perfil > Dispositivos conectados: "Conectar Apple Saúde" ou "Conectar Health Connect", com texto
  explicando que relógios Garmin, Coros, Polar e Samsung também chegam por aqui se a sincronização
  estiver ligada no app da marca (com passo a passo por marca).
- Importar corridas dos últimos 30 dias: início, duração, distância, FC média e máxima. Mostrar em
  Atividades com a origem.
- **Gravar** as corridas do Paceless no Apple Saúde e no Health Connect (o usuário espera isso).
- Evitar duplicidade com a corrida gravada pelo próprio app (mesmo horário e duração).

### Fase 2: cinta cardíaca e FC ao vivo

**Status:** implementado, aguardando teste em aparelho real (cinta BLE e relógio que transmite FC).

Entregue no código (branch `feat/wearables`, ainda sem commit):

- Biblioteca `react-native-ble-plx` com config plugin (`central`, `neverForLocation`, sem `isBackgroundEnabled`).
- Tela **Dispositivos conectados > Cinta cardíaca**: pareamento com scan filtrado pelo serviço 0x180D,
  prévia de bpm antes de salvar, troca e remoção da cinta. Dados em `connected_devices` (provider `ble_hr`).
- Durante o treino: conexão automática com a cinta salva, bpm na tela, zona quando há FC máxima,
  aviso de desconexão e reconexão com backoff (1 s, 2 s, 5 s, depois a cada 10 s). Nunca bloqueia o treino.
- Preferência **Frequência cardíaca máxima** (100 a 230 bpm), sincronizada com `profiles.max_heart_rate`.
  Sem valor, o app mostra só os batimentos, sem zonas.
- Ao finalizar: média e máxima de FC gravadas em `activities`, e amostras por segundo em `activity_samples`.
  Se estiver offline, as amostras ficam numa fila local e são enviadas depois.
- Resumo pós-treino com FC média, máxima e tempo em cada zona (ou dica para definir a FC máxima).
- Permissões com explicação, e tratamento de Bluetooth desligado e de permissão negada ou bloqueada.
- Web: nada de BLE é carregado (`lib/platform/heartRateBle.web.ts`), e a tela de cinta não aparece.

Pendências (precisam de teste em aparelho):

- **Android em segundo plano:** confirmar se o serviço de localização em primeiro plano mantém a conexão
  BLE com a tela bloqueada. Se não manter, o plano é usar `connectedDevice` como tipo de serviço em primeiro plano.
- **`neverForLocation`:** testar com uma cinta Polar H10 ou um Garmin. Alguns aparelhos antigos podem
  exigir localização para o scan mesmo com a flag.
- **iOS, crash #1277:** o `react-native-ble-plx` pode travar no release ao usar `restoreStateIdentifier`.
  Por isso o `BleManager` é criado sem restauração de estado nesta fase.
- Confirmar no dev build que o `Info.plist` gerado tem `bluetooth-central` e `NSBluetoothAlwaysUsageDescription`
  (conferido por `npx expo config --type introspect`, mas não num build real).

### Fase 3: nuvem das marcas (Garmin e Polar)

- Pela regra do projeto, tudo no servidor: Edge Functions para OAuth, recebimento de webhook e
  importação. Segredos das marcas só como secret do Supabase.
- Garmin: cadastrar no plano Starter (até 1.000 usuários), receber Activity API por push.
- Polar: AccessLink (OAuth 2.0, transações).
- Vantagem sobre a fase 1: chega o arquivo `.FIT` completo (rota, FC por amostra) e funciona sem
  depender do app da marca sincronizar com o celular.

### Fase 4: Coros e Samsung por parceria

- Pedir acesso à Coros Partner API e ao Samsung Health Data SDK. Enquanto isso, elas seguem
  cobertas pela fase 1.

### Fase 5 (depois): app no relógio e treino enviado ao relógio

- App watchOS e Wear OS para correr só com o relógio; Connect IQ na Garmin.
- Mandar o treino do plano para o relógio (Garmin Training API) é um diferencial a avaliar.

## Modelo de dados

- `connected_devices` já existe (`provider` em `health_connect`, `healthkit`, `garmin`, `strava`).
  Acrescentar `polar`, `coros`, `samsung`, `ble_hr` e guardar o identificador da cinta pareada.
- `activities`: `source`, `external_id`, `avg_hr`, `max_hr`; único por (`user_id`, `source`,
  `external_id`).
- `activity_samples` (fase 2 e 3): `activity_id`, `t_offset_s`, `hr`, `lat`, `lng`.
- Tokens OAuth das marcas: tabela só acessível pelo servidor (sem política para o app).

## Lojas e LGPD

- Google Play: declaração de uso do Health Connect, permissões de Bluetooth com justificativa.
- Apple: capability HealthKit, textos de uso no Info.plist, Bluetooth em segundo plano durante a
  corrida.
- Dado de saúde é sensível: consentimento explícito, desconectar a qualquer momento, apagar junto com
  a conta (a Edge Function `delete-account` precisa cobrir as tabelas novas).

## Esforço e ordem sugerida

| Fase | Esforço | Precisa de build | Depende de terceiros |
|---|---|---|---|
| 1. Central de saúde | M | sim | não |
| 2. Cinta BLE | M | sim | não |
| 3. Garmin + Polar | G | não (servidor) | cadastro na Garmin e na Polar |
| 4. Coros + Samsung | M | talvez | aprovação |
| 5. App no relógio | G | sim | não |

Sugestão: fases 1 e 2 no mesmo build (cobre as cinco marcas e a FC ao vivo) e, em paralelo, o Pedro
inicia os cadastros da Garmin (Starter), da Polar e da Coros.

## Decisões para o Pedro

1. Aprovar as libs `@kingstinct/react-native-healthkit`, `react-native-health-connect` e
   `react-native-ble-plx` (todas exigem build novo).
2. Cadastrar a empresa no Garmin Connect Developer (plano Starter), na Polar AccessLink e na Coros.
3. O plano adaptativo vai usar FC por amostra ou só média? Define se a fase 3 é prioridade.
4. Mandar treino para o relógio é diferencial desejado?

## Fontes

- [Garmin Connect Developer Program](https://developerportal.garmin.com/developer-programs/connect-developer-api)
- [Sahha: Garmin reabriu em 2026](https://sahha.ai/blog/garmin-connect-api-reopened-fees/)
- [Gadgets & Wearables: Garmin Personal API](https://gadgetsandwearables.com/2026/10/21/garmin-connect-personal-api-health-data-access/)
- [Rook: acesso à API da Garmin](https://tryrook.io/blog/garmin-connect-api-access/)
- [Polar para desenvolvedores](https://www.polar.com/us-en/developers/)
- [Open Wearables: Polar API](https://openwearables.io/blog/polar-api-training-hrv-nightly-recharge-data)
- [Coros Partner API](https://support.coros.com/hc/en-us/articles/53181766856724-Partner-API-Access)
- [Samsung Health SDK (descontinuado) e Data SDK](https://developer.samsung.com/health/android/overview.html)
- [Expo: app com Bluetooth Low Energy](https://expo.dev/blog/how-to-build-a-bluetooth-low-energy-powered-expo-app)
- [Theodo: BLE em apps Expo](https://blog.theodo.com/2023/07/ble-integration-for-rn-apps)
- [react-native-health-connect](https://github.com/29ki/react-native-health-connect)
- [@kingstinct/react-native-healthkit](https://classic.yarnpkg.com/en/package/@kingstinct/react-native-healthkit)
