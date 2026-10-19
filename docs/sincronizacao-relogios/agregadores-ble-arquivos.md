# Sincronização com relógios: agregadores, BLE e arquivos

Trilha WS3. Pesquisa feita em 19/10/2026 (páginas oficiais e npm consultados nesta data).
Itens não confirmados em fonte oficial estão marcados **a verificar**.
Complementa [relogios-e-saude.md](../pesquisa/relogios-e-saude.md) (Health Connect / HealthKit) e
[produto.md](../produto.md). Preços de agregadores mudam e quase todos pedem "falar com vendas":
tratar os números como ordem de grandeza.

Estado atual do app (verificado no código): a gravação usa só `expo-location` em primeiro plano
(`hooks/useRunTracker.ts`; `app.json` com background e foreground service desligados), e a tela
`app/(app)/workout/[id].tsx` mostra "FC média (bpm)" com valor `—`. A tabela `activities` ainda não
tem colunas de FC, `source` nem `external_id`.

## 1. Agregadores

### 1.1 Comparativo

Custo estimado: usuários **conectados** (com relógio ligado) = 1 mil e 10 mil, na lista pública, sem
desconto. O número real tende a ser menor que a base total (nem todo usuário liga um relógio).

| Agregador | Preço público | ~1 mil conectados | ~10 mil conectados | Marcas (confirmadas na fonte) | Escrever treino no relógio | SDK React Native | Webhook | Residência / compliance |
|---|---|---|---|---|---|---|---|---|
| [Terra](https://tryterra.co/pricing) | US$ 499/mês (US$ 399 anual), 100 mil créditos. 200 créditos (US$ 1) por usuário-fonte ativo/mês; eventos acima de 400 custam 0,5 crédito; crédito cai com volume | ~US$ 1.000/mês | ~US$ 10.000/mês (desconto de volume: a verificar) | 500+. Garmin, Polar, Suunto, Whoop, Oura, Strava, Samsung (SDK), Apple (SDK), Coros (consulta a cada 5-10 min) ([lista](https://docs.tryterra.co/reference/health-and-fitness-api/supported-integrations.md)) | Sim, add-on **Planned Workouts** (Garmin, Coros, Suunto, Wahoo, Huawei, Zepp, Apple/WorkoutKit); 10 créditos (US$ 0,05) por envio ([compatibilidade](https://docs.tryterra.co/planned-workouts-api/provider-compatibility.md)) | Sim, [doc](https://docs.tryterra.co/unified-api/mobile-only-sources/react-native.md) (Apple Health e Samsung via SDK). Streaming API aceita qualquer strap BLE | Sim, é o modelo principal (também destinos prontos) | SOC 2 Tipo 2 declarado. Região/residência: **não encontrada**. DPA em [tryterra.co/dpa](https://tryterra.co/dpa). Brasil/LGPD: **a verificar** |
| [ROOK](https://www.tryrook.io/pricing) | Plano fixo por teto de usuários ativos: Core US$ 399 (750), Core+ US$ 999 (5 mil), Business US$ 1.999 (15 mil) | ~US$ 999/mês | ~US$ 1.999/mês | 500+. Na doc vista: Garmin, Polar, Whoop, Oura, Fitbit, Withings, Apple Health, Health Connect. Coros, Suunto, Amazfit, Samsung: **não aparecem** | **a verificar** | **a verificar** (a página consultada não cita) | **a verificar** | Residência: **a verificar** |
| [Thryve](https://www.thryve.health/pricing) | Start Up desde EUR 499 (500 usuários, +EUR 0,50 cada); Scale Up desde EUR 1.000 (5 mil usuários, só startups com menos de 10 anos; +EUR 999 por 10 mil) | ~EUR 750 (Start Up) ou EUR 1.000 | ~EUR 2.000 | 500+ (lista por marca: **a verificar**) | **a verificar** | **a verificar** | **a verificar** | Dados **hospedados na Alemanha** (UE). Transferência internacional a partir do Brasil: ver 1.2 |
| [Junction (ex-Vital)](https://www.junction.com/pricing) | Launch US$ 300/mês até 500 usuários conectados; acima disso Enterprise sob consulta | Enterprise (preço **a verificar**) | Enterprise (**a verificar**) | 300+. Apple HealthKit, Health Connect, Samsung Health (SDK), Whoop, Oura, Strava (precisa app OAuth próprio desde jul/2026). Garmin/Polar/Coros: **a verificar** ([changelog](https://docs.junction.com/changelog/wearables/providers.md)) | **a verificar** | Sim: [`@tryvital/vital-health-react-native`](https://www.npmjs.com/package/@tryvital/vital-health-react-native) 6.0.4 (HealthKit, Health Connect, Samsung Health) | Sim (eventos de dados) | Residência: **a verificar** |
| [Sahha](https://sahha.ai/pricing) | Starter US$ 299/mês (1.000 usuários, +US$ 0,40); Pro US$ 1.499 (10 mil, +US$ 0,20) | ~US$ 299/mês | ~US$ 1.499/mês | Foco em scores de saúde/sono; fontes: **a verificar** (Garmin não confirmado) | Não esperado | **a verificar** | **a verificar** | HIPAA (BAA) no Pro. LGPD: **a verificar** |
| [Spike](https://www.spikeapi.com/pricing) | Desde US$ 450/mês; por usuário só "falar com vendas" | **a verificar** | **a verificar** | "40+ provedores, 500+ dispositivos" (lista: **a verificar**) | **a verificar** | SDK único (RN: **a verificar**) | **a verificar** | **a verificar** |
| [Open Wearables](https://openwearables.io) | Código aberto, licença MIT, auto-hospedado (Docker Compose). Custo = infra + engenharia | Infra própria (o Supabase não substitui; precisa de servidor, o que contraria a decisão "backend só Supabase") | idem | Whoop, Garmin, Oura, Apple Health, Strava, Polar, Suunto, Samsung Health, Health Connect, Fitbit, Ultrahuman (status por provedor: **a verificar**) | Planejado/"exploring" para Polar e Coros ([roadmap](https://openwearables.io/docs/roadmap.md)) | **Não**: o SDK móvel citado é Flutter (Apple Health); RN fora do roadmap | **a verificar** | Você controla a residência (pode ser no Brasil). Você vira o operador dos dados |

Leitura rápida:

- Nenhum dos sete publica preço por usuário limpo. **Terra** é o único com write-back (treino para o relógio) documentado e com RN confirmado, mas é o mais caro por usuário (~US$ 1 por usuário-fonte/mês, que só fecha conta se a assinatura premium for bem maior que isso; o preço do premium ainda não está definido no repositório).
- **ROOK** e **Sahha** têm preço fixo previsível e baixo por usuário (US$ 0,10-0,20 em escala), mas falta confirmar RN e marcas.
- **Open Wearables** conflita com a stack (servidor próprio, sem SDK RN).

### 1.2 Brasil, LGPD e lock-in

- Dado de saúde é dado pessoal **sensível** (LGPD, art. 11): consentimento específico e destacado, e exclusão junto com a conta (já é regra do projeto).
- Agregador fora do Brasil = **transferência internacional** (LGPD art. 33; regulamentada pela ANPD em 2024 com cláusulas-padrão: **a verificar** o texto vigente). Precisa de DPA, lista de suboperadores e base legal. Nenhum fornecedor acima anuncia região no Brasil (**a verificar** com cada um). Thryve (Alemanha) é o único com residência declarada, na UE.
- O agregador vira **operador** na LGPD: entra na política de privacidade (já há rascunho em `docs/legal/`) e na lista de suboperadores.
- A promessa de produto é privacidade ("sem exposição"). Dado do usuário passando por terceiro precisa de aviso claro.
- **Lock-in**: o risco real é o ID de usuário e o histórico ficarem no agregador. Mitigação: gravar tudo em `activities` (`source`, `external_id`) pelo nosso webhook; o agregador vira só um "cano". Trocar de fornecedor = reconectar relógios (o usuário reautoriza), não migrar dados.

## 2. Construir ou comprar

| Caminho | Cobre | Custo | Esforço | Observações |
|---|---|---|---|---|
| **Health Connect + HealthKit** (direto) | Tudo que o relógio escreve nos hubs do SO: Garmin, Samsung, Apple Watch, Polar, Coros, Amazfit, Suunto, via app do fabricante | Zero por usuário | M + M (já planejado) | Dado local, sem terceiro, bom para LGPD. Depende do usuário manter o app do fabricante sincronizando. Sem escrever treino no relógio |
| **Garmin direto** ([Connect Developer Program](https://developer.garmin.com/gc-developer-program/overview/)) | Activity API (envio de atividades), Health API, **Training API** (publicar treino estruturado no relógio) | Sem taxa de licença; alguns dados podem exigir licença/pedido mínimo de dispositivos | M-G | **Só uso comercial/empresa.** Resposta em 2 dias úteis; integração típica de 1 a 4 semanas ([FAQ](https://developer.garmin.com/gc-developer-program/program-faq/)). Modelo de webhook (ping/push): **a verificar**. Exige CNPJ e Edge Function para receber dados |
| **Agregador** (ex.: Terra) | Garmin, Polar, Coros, Suunto, Whoop, Oura e outros em uma integração + write-back | US$ 400-1.000+/mês no começo | M | Evita cadastro em cada marca. Na tabela do Terra, Garmin e Coros aparecem com "credenciais: necessárias" (você mesmo se cadastra nas marcas) e Suunto/Zepp com inscrições fechadas: então o agregador pode **não** eliminar todo o trâmite com a Garmin (**a verificar** com o Terra) |
| **BLE direto** (seção 3) | FC (e cadência/ritmo) ao vivo durante o treino | Zero | M | Só durante a corrida; não traz histórico do relógio |
| **Arquivo** (seção 4) | Qualquer relógio, uma corrida por vez | Zero | P-M | Fallback universal, sem aprovação de ninguém |

Conclusão da comparação: para iniciantes no Brasil, o grosso dos relógios (Garmin, Samsung, Amazfit, Apple Watch, Polar) já chega via Health Connect/HealthKit. O agregador só compensa se (a) a necessidade for **enviar o treino do plano para o relógio** (diferencial real contra Strava/Runna) em muitas marcas, ou (b) Garmin direto não for aprovado a tempo.

## 3. BLE direto: cinta/banda de FC e footpod

### 3.1 Como alimenta a "FC média" da tela de treino

1. Na tela de pré-treino, botão "Conectar sensor de FC": varre dispositivos anunciando o serviço **Heart Rate (0x180D)**, o usuário escolhe e o app guarda o `id` do dispositivo.
2. Ao iniciar o treino, conecta e assina notificações da característica **Heart Rate Measurement (0x2A37)** (cerca de 1 Hz).
3. Cada notificação (base64 na `react-native-ble-plx`) é decodificada: o bit 0 do byte de flags diz se o BPM é de 8 ou 16 bits; os bits 1-2 indicam contato do sensor (descartar leitura sem contato ou BPM 0); o bit 3 indica energia gasta e o bit 4 intervalos RR (ignorar no MVP, úteis para HRV depois).
4. O hook de treino mantém `hrNow`, soma ponderada pelo tempo (só enquanto o treino não está em pausa) e `hrMax`. A "FC média" da tela vem de `soma/tempo`; sem sensor continua `—` (estado vazio, sem mock).
5. Ao salvar: `avg_hr`, `max_hr` e `source` em `activities` (colunas **novas**; ver seção 6). Série de FC por amostra fica para a tabela `activity_samples` já esboçada na pesquisa anterior.
6. Se a conexão cair, reconectar com backoff e marcar o intervalo como sem dado (não interpolar).

O mesmo caminho serve ao plano adaptativo: FC média e máxima por corrida, sem depender do relógio depois.

**Footpod / sensores de passada (RSC, 0x1814, medição 0x2A53)**: dá velocidade (unidade 1/256 m/s), cadência e, opcionalmente, passada e distância total. Útil em esteira ou túnel sem GPS. Poucos iniciantes têm; fica fora do MVP. Muitos relógios com modo de transmissão de FC (broadcast) também expõem 0x180D, o que permite usar o relógio como cinta (o Apple Watch não faz isso).

### 3.2 Bibliotecas

| Opção | Versão (npm, out/2026) | Observações |
|---|---|---|
| [`react-native-ble-plx`](https://github.com/dotintent/react-native-ble-plx) (upstream) | 3.5.1, MIT, última publicação fev/2026 | Config plugin Expo oficial. Peer `react-native: *`. Compatibilidade com RN 0.88 / SDK 58: **a verificar** (testar em dev build). Não roda no Expo Go |
| `@sfourdrinier/react-native-ble-plx` (fork) | 3.9.3, jul/2026 | Fork de terceiro com TurboModule; exige RN >= 0.86 (o app usa 0.88). Risco de manutenção por ser fork individual |
| [`react-native-ble-manager`](https://www.npmjs.com/package/react-native-ble-manager) | 12.5.3, Apache-2.0, set/2026 | Alternativa ativa; API baseada em eventos; plugin Expo: **a verificar** |
| Terra Streaming API | pago | Já abstrai BLE (qualquer strap), mas é mais um fornecedor para algo simples |

Recomendação: avaliar a upstream no dev build; se falhar no RN 0.88, testar `react-native-ble-manager` antes do fork. Regra do projeto: **não instalar sem aprovação**.

### 3.3 Setup Expo (EAS)

Opções do plugin (README oficial): `isBackgroundEnabled` (Android, padrão `false`), `neverForLocation` (Android 12+, marcado como experimental), `modes` (iOS `UIBackgroundModes`: `peripheral` e/ou `central`), `bluetoothAlwaysPermission` (texto do iOS). Qualquer mudança exige novo `prebuild` e novo build de desenvolvimento.

| Plataforma | Permissões e config |
|---|---|
| Android 12+ (API 31+) | `BLUETOOTH_SCAN` e `BLUETOOTH_CONNECT` em tempo de execução (o plugin declara). Com `neverForLocation` não pede localização. Como já pedimos GPS, a localização é pedida de qualquer forma |
| Android 11 ou menos | Localização obrigatória para varredura BLE |
| iOS | `NSBluetoothAlwaysUsageDescription` (texto em PT-BR, ex.: "O Paceless usa o Bluetooth para ler a frequência cardíaca da sua cinta durante o treino.") |
| Lojas | Atualizar [publicacao-lojas.md](../publicacao-lojas.md): declarar Bluetooth e dado de FC; na Apple, App Privacy "Saúde e fitness" |

### 3.4 Segundo plano e bateria

- Hoje o rastreio de GPS é só em primeiro plano. **O mesmo limite vale para o BLE**: com a tela bloqueada, o iOS suspende o app e as notificações param. Decisão única para GPS e BLE (gravação em segundo plano), não duas.
- Para segundo plano: **iOS** precisa de `UIBackgroundModes: bluetooth-central` (via `modes: ['central']`) e restauração de estado (`restoreStateIdentifier`). **Android 14+** exige serviço em primeiro plano com tipo declarado: `connectedDevice` (permissão `FOREGROUND_SERVICE_CONNECTED_DEVICE`) ou `health` (`FOREGROUND_SERVICE_HEALTH`), declarado também no Play Console ([doc Android](https://developer.android.com/develop/background-work/services/fgs/service-types)). O app desliga hoje esse serviço em `app.json`.
- Bateria: notificações de FC a ~1 Hz custam pouco; o consumo dominante é GPS e tela. A cinta usa bateria própria (pilha de botão, meses de uso). Evitar varredura contínua: varrer só na tela de conexão e reconectar pelo `id` salvo.
- Cintas com mais de uma conexão BLE (ex.: Polar H10) permitem relógio e app lerem ao mesmo tempo; modelos baratos aceitam uma só (**a verificar** por modelo). Cintas só ANT+ não funcionam no celular.

## 4. Importação de arquivo (.FIT, .GPX, .TCX)

### 4.1 UX

1. Perfil > Dispositivos conectados > "Importar corrida de arquivo".
2. `expo-document-picker` (58.0.4) abre o seletor do sistema. `.fit` não tem tipo MIME padrão, então usar `type: '*/*'` e validar a extensão e o cabeçalho (bytes 8-11 = `.FIT`); `.gpx` e `.tcx` são XML.
3. Tela de **prévia**: data, duração, distância, ritmo, FC média e mini-mapa. Botões "Salvar" e "Cancelar". Erros claros: arquivo vazio, sem GPS, esporte diferente de corrida.
4. Salvar em `activities` com `source = 'file'` e `external_id` = hash do arquivo, evitando duplicar o mesmo arquivo. Dedup contra corrida gravada pelo app ou vinda do relógio: mesma janela de início (±2 min) e duração parecida; perguntar ao usuário.
5. Como obter o arquivo: Garmin Connect (web) > "Exportar original" (devolve um `.zip` com o `.fit`; suportar zip é **a verificar**), Strava > "Exportar GPX". No celular, o caminho é "Compartilhar > Salvar em Arquivos". Receber direto de outros apps (share extension / intent) exige lib extra: fora do escopo.

### 4.2 Parsing

| Formato | Biblioteca | Notas |
|---|---|---|
| FIT | [`fit-file-parser`](https://www.npmjs.com/package/fit-file-parser) 6.2.2 (MIT, out/2026) | JavaScript puro. Alternativa oficial: [`@garmin/fitsdk`](https://www.npmjs.com/package/@garmin/fitsdk) 21.218.0 (licença própria do FIT SDK: ler os termos antes de usar, **a verificar**) |
| GPX, TCX | [`@tmcw/togeojson`](https://www.npmjs.com/package/@tmcw/togeojson) 7.1.3 (BSD-2) | Precisa de `DOMParser` (no RN, um polyfill como `@xmldom/xmldom`). Alternativa sem DOM: `fast-xml-parser` 5.11.2 (MIT). `gpxparser` está parado desde 2022 |

Leitura do arquivo: `expo-file-system` (58.x) com `copyToCacheDirectory` no picker; API exata de leitura binária no SDK 58: **a verificar**.

Campos do FIT: mensagem `session` (início, tempo, distância, FC média e máxima, esporte) e mensagens `record` (posição em semicírculos: graus = valor x 180 / 2^31, FC, tempo). Reduzir a rota (amostragem) antes de gravar em `activities.route` (jsonb, já existe).

Onde parsear: no cliente (o arquivo já está no aparelho) e enviar só o resumo e a rota reduzida; a validação final (limites plausíveis de distância/tempo) fica no banco ou numa Edge Function, em linha com a regra de verificar no servidor.

## 5. Recomendação e esforço

| Ordem | Item | Esforço | Motivo |
|---|---|---|---|
| 1 | Health Connect + HealthKit (já recomendado) | G (M+M) | Cobre quase todos os relógios, custo zero, melhor para LGPD |
| 2 | Importação de arquivo FIT/GPX/TCX | P-M | Fallback universal; sem aprovação de terceiros; libs MIT; só cliente + colunas novas |
| 3 | FC ao vivo por cinta BLE | M | Preenche a "FC média" da tela existente com dado em tempo real, sem relógio; depende da decisão de segundo plano |
| 4 | Garmin direto | M-G | Só se houver CNPJ e Garmin for requisito; traz Training API (treino no relógio) |
| 5 | Agregador (Terra) | M | Só se a prioridade for **enviar treino do plano ao relógio** em várias marcas, ou se Garmin direto atrasar; custa ~US$ 400-500/mês antes do primeiro usuário |

Em resumo: **não contratar agregador agora**. O MVP (itens 1-3) não tem custo recorrente e mantém o dado no aparelho e no nosso Supabase. Reavaliar o agregador (Terra como primeira opção, ROOK como alternativa barata) quando houver demanda comprovada por Coros/Polar/Suunto na nuvem ou por treino no relógio, com DPA e residência confirmados.

### Riscos

| Risco | Mitigação |
|---|---|
| Preço do agregador cresce linear com usuários conectados (Terra) | Começar com plano fixo (ROOK/Sahha) ou adiar; atrelar a premium |
| Transferência internacional / LGPD | DPA, cláusulas-padrão, aviso no consentimento; preferir quem declarar região (**a verificar**) |
| `react-native-ble-plx` não validada com RN 0.88 | Prova de conceito em dev build antes de comprometer; plano B `react-native-ble-manager` |
| iOS suspende o app com tela bloqueada, cortando FC e GPS | Decidir segundo plano uma vez, para GPS e BLE |
| Duplicidade (app, relógio, arquivo) | `UNIQUE (user_id, source, external_id)` e regra de janela de tempo |
| Garmin e outros mudando regras de API | Camada própria `activities`; a fonte é só um campo |
| Revisão das lojas (Bluetooth, FC, saúde) | Textos de permissão e privacidade antes do envio |

## 6. Mudanças de dados implícitas (nada foi alterado)

`activities` hoje não tem `avg_hr`, `max_hr`, `source` nem `external_id` (ver `supabase/migrations/20261019180000_create_activities.sql`). As três trilhas (Health Connect/HealthKit, BLE e arquivo) precisam das mesmas colunas e do índice único; vale uma migration única, combinada com o esboço de [relogios-e-saude.md](../pesquisa/relogios-e-saude.md).

## Fontes principais

[Terra preços](https://tryterra.co/pricing) · [Terra docs](https://docs.tryterra.co/llms.txt) · [ROOK](https://www.tryrook.io/pricing) · [Thryve](https://www.thryve.health/pricing) · [Junction](https://www.junction.com/pricing) · [Sahha](https://sahha.ai/pricing) · [Spike](https://www.spikeapi.com/pricing) · [Open Wearables](https://openwearables.io) · [Garmin Developer Program](https://developer.garmin.com/gc-developer-program/overview/) · [react-native-ble-plx](https://github.com/dotintent/react-native-ble-plx) · [Android foreground service types](https://developer.android.com/develop/background-work/services/fgs/service-types) · [Bluetooth SIG Heart Rate Service](https://www.bluetooth.com/specifications/specs/heart-rate-service-1-0/)
