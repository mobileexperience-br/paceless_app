# Cintas cardíacas Bluetooth (BLE Heart Rate Service)

> Pesquisa de 2026-10-29 (rodadas 1 e 2). Complementa `docs/relogios.md` (seção "Cinta cardíaca" e Fase 2). Itens sem fonte estão marcados como **a confirmar**.

## Resumo

- **O que é:** o celular atua como *central* BLE e se conecta direto à cinta (ou a um relógio em modo "transmitir FC") pelo serviço padrão do Bluetooth SIG **Heart Rate Service (0x180D)**. Ele assina as notificações de **Heart Rate Measurement (0x2A37)**. Não há API em nuvem, OAuth nem Edge Function de ingestão.
- **Opcionais:** Body Sensor Location (0x2A38), Heart Rate Control Point (0x2A39, que zera o Energy Expended) e bateria (Battery Service 0x180F / 0x2A19).
- **Vale para o Paceless?** Sim. É o caminho mais barato e universal para FC ao vivo durante a corrida, com RR (HRV) nas cintas de peito. Funciona com Polar, Garmin HRM, Wahoo, Coros etc. sem aprovação de ninguém.
- **Recomendação:** implementar na Fase 2 com `react-native-ble-plx@3.5.1` e o config plugin próprio dele. Antes disso, é obrigatório um **spike de dev build no SDK 58** (ver Riscos). O fallback é `react-native-ble-manager`.
- A lib nativa não roda no Expo Go, então exige um novo dev build. Instalar a lib (e `jest-expo`, se o Jest não estiver configurado) **depende de aprovação**, pela regra do CLAUDE.md.

## Cadastro e burocracia

**Não há cadastro, programa de parceiros, contrato nem taxa.** Garmin, Polar, Coros e Wahoo não precisam aprovar nada. Tudo acontece em contas que já existem (Play Console e App Store Connect). Na UI, use "compatível com cintas Bluetooth" e não logos de marcas (são marcas registradas).

**Custo:** as cintas de teste (cerca de R$ 400–700 cada, **a confirmar**), o tempo do Pedro com as declarações e a gravação do vídeo do FGS.

### Google Play Console (Pedro)

1. **Declaração de foreground service** (Política > Conteúdo do app > Permissões de serviço em primeiro plano). É obrigatória com `targetSdk ≥ 34` ([ajuda Play 13392821](https://support.google.com/googleplay/android-developer/answer/13392821)). **Para cada tipo** declarado no manifest:
   - a descrição da funcionalidade;
   - o impacto para o usuário se a tarefa for adiada ou interrompida;
   - o caso de uso, escolhido na lista do Play;
   - **um link de vídeo** mostrando como o usuário aciona a funcionalidade.
   - O app **já declara** `foregroundServiceType="location"` (via expo-location, com `isAndroidForegroundServiceEnabled: true`). Então a declaração de *location* e o vídeo dela provavelmente já são necessários, com ou sem BLE. Se for preciso adicionar `connectedDevice`, ele exige outra declaração e outro vídeo.
   - Sugestão de vídeo: YouTube não listado, 30–60 s. Iniciar corrida → aparece a notificação "Paceless rastreando" → bloquear a tela → desbloquear e mostrar a FC ainda atualizando.
2. **Segurança dos dados** (Data Safety):
   - marcar "Saúde e fitness > Informações de saúde" (frequência cardíaca) e "Informações de fitness";
   - coletado: sim;
   - compartilhado: não. **Se o treinador com IA enviar FC a um provedor de modelo, marcar como compartilhado** ou declarar o provedor como prestador de serviço (decisão do Pedro e do Jonatas);
   - criptografado em trânsito: sim; exclusão sob pedido: sim.
3. **Declaração de apps de saúde** (Conteúdo do app): preencher como "fitness / acompanhamento de atividade". O nome e os campos do formulário são **a confirmar**.

### App Store Connect (Pedro)

1. **Privacidade do app:**
   - "Saúde e fitness > Fitness" (já está no `privacyManifests` como `NSPrivacyCollectedDataTypeFitness`);
   - adicionar **"Saúde"** (`NSPrivacyCollectedDataTypeHealth`): vinculado ao usuário, sem rastreamento, finalidade "Funcionalidade do app". Adicionar também ao privacy manifest no `app.json`.
2. **Notas para o App Review** (justificativa do background mode `bluetooth-central`):
   > "Paceless connects to standard Bluetooth heart-rate chest straps (Bluetooth SIG Heart Rate Service 0x180D) during an active run. The `bluetooth-central` background mode keeps the heart-rate stream alive while the screen is locked during a workout the user started. No scanning or connection happens outside an active workout or the pairing screen. To test without a strap, the run works normally and simply shows no heart rate."

### Hardware de teste

- 1 **Polar H10** (aceita 2 conexões simultâneas, depois de ativar a opção).
- 1 cinta básica de conexão única, para testar o caso "já pareada com o relógio".
- Se possível, emprestar um Garmin de geração atual (Forerunner 2xx/9xx) com transmissão de FC por BLE.

### LGPD

- FC é **dado pessoal sensível** (saúde, art. 5º II). Exige **consentimento específico e destacado, para finalidade específica** (art. 11 I). Não pode se apoiar em legítimo interesse nem no aceite dos termos gerais.
- A política de privacidade precisa trazer o controlador (razão social e CNPJ) e o canal do **encarregado** (art. 41).
  - A Resolução CD/ANPD 2/2022 dispensa agentes de pequeno porte de *indicar* um encarregado, mas mantém a exigência do canal de contato. Se a dispensa vale com tratamento de dado sensível em escala é **a confirmar com advogado**. A dispensa não cobre tratamento de alto risco.
- **Região do Supabase:** se o projeto não estiver em `sa-east-1`, há transferência internacional (arts. 33–36). Opções:
  - (a) migrar para `sa-east-1`;
  - (b) cobrir a transferência com o DPA/cláusulas do Supabase e citá-la na política. O texto atual da Resolução ANPD 19/2024 sobre cláusulas-padrão é **a confirmar**.
  - O mesmo vale se o treinador com IA mandar FC a um provedor no exterior.
- **Direitos:** a FC entra no fluxo de exportação e exclusão da conta. Revogar o consentimento interrompe a coleta e oferece apagar o histórico de FC. As atividades ficam, sem a FC.
- **Rascunho da tela de consentimento** (no primeiro pareamento, com o toggle **desligado por padrão**):
  > **Frequência cardíaca**
  > Para mostrar sua frequência cardíaca, zonas e variabilidade (HRV) durante e depois dos treinos, o Paceless precisa ler e guardar os dados da sua cinta ou relógio. Esses são dados de saúde e só serão usados para isso [e para o seu treinador com IA]. Você pode desligar e apagar esse histórico quando quiser em Ajustes > Privacidade.
  > [ ] Concordo que o Paceless colete e armazene minha frequência cardíaca.
  > [Ler a Política de Privacidade]
- Gravar `consent_hr_at timestamptz` e `consent_hr_version text` no perfil. O ônus da prova do consentimento é do controlador (art. 8º §2º).

### Checklist do Pedro

- [ ] Comprar 1 Polar H10 e 1 cinta básica de conexão única
- [ ] Conseguir um relógio Garmin atual com "Transmitir frequência cardíaca" por BLE
- [ ] Play: declaração de FGS `location` com vídeo (provavelmente já necessária hoje)
- [ ] Play: declaração de FGS `connectedDevice` com vídeo (só se o teste de campo exigir)
- [ ] Play: atualizar Data Safety (informações de saúde + fitness)
- [ ] Play: preencher a declaração de apps de saúde
- [ ] Decidir com o Jonatas se a FC vai para o provedor de IA (impacta Data Safety e política)
- [ ] App Store: adicionar "Saúde" na privacidade do app
- [ ] App Store: colar as notas de App Review sobre `bluetooth-central`
- [ ] LGPD: confirmar a região do projeto Supabase (`sa-east-1`?) e decidir entre migrar ou cobrir a transferência
- [ ] LGPD: confirmar com advogado o encarregado e a dispensa da Res. 2/2022 com dado sensível
- [ ] LGPD: atualizar a política de privacidade (controlador, CNPJ, encarregado, FC, IA)
- [ ] Aprovar o texto da tela de consentimento

## Dados disponíveis

- **FC (bpm)** a cerca de 1 Hz (uma notificação por segundo na maioria das cintas).
- **Intervalos RR**: zero ou vários por pacote, em unidades de 1/1024 s, do mais antigo para o mais novo. Só em cintas de peito. Transmissão de relógio de pulso costuma mandar só bpm. Alguns sensores (Scosche Rhythm+2.0 / Rhythm24) não mandam RR nunca ([Adafruit #17](https://github.com/adafruit/Adafruit_CircuitPython_BLE_Heart_Rate/issues/17)).
- **Status de contato**: detectado, perdido ou não suportado.
- **Energy Expended** (kJ, opcional) e **bateria** (0x2A19).
- **Sem GPS e sem arquivo FIT.** O GPS vem do celular.

Layout do byte de flags do 0x2A37 (especificação SIG, conferida com o [parser da Adafruit](https://github.com/adafruit/Adafruit_CircuitPython_BLE_Heart_Rate/blob/master/adafruit_ble_heart_rate.py) e com a [doc HRS da Espressif](https://docs.espressif.com/projects/esp-iot-solution/en/latest/bluetooth/ble_hrs.html)):

| Bit | Significado |
|---|---|
| 0 | Formato da FC: 0 = uint8, 1 = uint16 LE (pode mudar a cada pacote) |
| 1 | Contato detectado |
| 2 | Recurso de contato suportado |
| 3 | Energy Expended presente (uint16 LE, kJ) |
| 4 | RR presentes (uint16 LE cada, 1/1024 s) |

Com o MTU padrão de 23 bytes (20 de payload), FC uint8 e sem energy, cabem no máximo (20−2)/2 = 9 RR por pacote. Com FC uint16 ou com energy, cabem 8 ou menos. Com MTU negociado maior, cabem mais. **O parser não deve assumir nenhum máximo.**

### Relógios que transmitem FC por BLE

A fonte é uma lista de terceiros, a [MyZone, de 2026-07-20](https://www.myzone.digital/app-support/which-garmin-devices-support-real-time-in-club-tracking-bluetooth-broadcasting). Ela mesma diz que a lista não é exaustiva. Os manuais oficiais mais antigos da Garmin ([FR245](https://www8.garmin.com/manuals/webhelp/forerunner245/EN-US/GUID-D8D363C2-0690-48D4-95E2-A3557E7D53C2.html), [FR945](https://www8.garmin.com/manuals/webhelp/forerunner945/EN-US/GUID-D8D363C2-0690-48D4-95E2-A3557E7D53C2.html)) citam só ANT+.

| Família | Modelos (MyZone 2026) | Status |
|---|---|---|
| Forerunner | 245, 255, 265, 745, 945, 955, 965, 970 | 255/265/955/965/970 provável; 245/945 **conflitante** |
| Fenix | 6, 7, 7 Pro, 8, 8 Pro | Fenix 6 **conflitante** |
| Epix | Gen 2, Pro | provável |
| Venu | 2, 2 Plus, 3, 4 | provável |
| Vivoactive | 4, 5 | provável |
| Enduro / MARQ Gen 2 / Tactix 7-8 | listados | provável |
| Instinct | não listado | **desconhecido, não prometer** |
| FR 45/55/645/735 e anteriores | não listados | assumir só ANT+: não funciona com celular |

- **Coros e Polar:** a maioria dos relógios atuais tem modo de transmissão por BLE (**a confirmar** por modelo).
- **Samsung:** varia por modelo.
- **Apple Watch:** não expõe 0x180D a apps de terceiros (**a confirmar**, não achei documento da Apple). Use o caminho HealthKit/watchOS que já está no plano.
- **Regra de UI:** escrever "Relógios com 'Transmitir frequência cardíaca' via Bluetooth", sem listar modelos. A tela de ajuda explica que "alguns relógios só transmitem por ANT+ e não funcionam com o celular".

### Polar H10

- Aceita **2 conexões Bluetooth simultâneas, mas só depois de ativar "2 dispositivos Bluetooth"** no app Polar. O padrão é 1 ([suporte Polar](https://support.polar.com/uk-en/can_i_pair_h10_with_several_devices)). A UI deve explicar isso a quem usa a H10 junto com um relógio. A Polar H9 aceita só 1 conexão ([Wareable](https://www.wareable.com/fitness-trackers/polar-h9-vs-polar-h10), fonte secundária).
- O [Polar BLE SDK](https://github.com/polarofficial/polar-ble-sdk) oficial (v8.x, só Android e iOS nativos, sem React Native) oferece na H10 ([PolarH10.md](https://raw.githubusercontent.com/polarofficial/polar-ble-sdk/master/documentation/products/PolarH10.md)):
  - FC + RR a 1 Hz;
  - ECG a 130 Hz;
  - ACC a 25–200 Hz.
- ECG e ACC usam o serviço proprietário PMD (UUID **a confirmar**), não o 0x180D. Eles exigem um módulo nativo próprio e ficam fora da Fase 2.
- A página não informa a precisão do RR. **Não anunciar "precisão de ECG".**

## Autenticação e sincronização

Não há OAuth nem tokens. A "autenticação" é a permissão do sistema operacional e o pareamento no app.

### Permissões

- **Android API 31 ou mais:** `BLUETOOTH_SCAN` + `BLUETOOTH_CONNECT`, com `neverForLocation`.
- **Android API 30 ou menos:** `ACCESS_FINE_LOCATION`, mais `BLUETOOTH`/`BLUETOOTH_ADMIN` legados com `maxSdkVersion 30`.
  - Nessas versões, o scan não retorna nada se a localização do sistema estiver desligada (**a confirmar**). Checar com `Location.hasServicesEnabledAsync()`.
- **iOS:** o sistema mostra o prompt quando o `BleManager` é criado. **Crie o manager de forma lazy, na tela de pareamento**, e não na abertura do app. `NSBluetoothAlwaysUsageDescription` vem do plugin. `NSBluetoothPeripheralUsageDescription` não é necessário.

### Configuração (app.json)

Use **só** o plugin upstream (ble-plx 3.5.1 publica `app.plugin.js`; ver o [package.json](https://raw.githubusercontent.com/dotintent/react-native-ble-plx/master/package.json)). **Não** adicione também `@config-plugins/react-native-ble-plx`, porque o plugin seria aplicado duas vezes.

```json
["react-native-ble-plx", {
  "isBackgroundEnabled": true,
  "modes": ["central"],
  "neverForLocation": true,
  "bluetoothAlwaysPermission": "O Paceless usa o Bluetooth para ler sua frequência cardíaca da cinta ou do relógio durante o treino."
}]
```

- `modes: ["central"]` adiciona `UIBackgroundModes: bluetooth-central` no iOS.
- `neverForLocation` põe `usesPermissionFlags="neverForLocation"` no `BLUETOOTH_SCAN`. Ele filtra alguns beacons. Cintas não são beacons, mas **é preciso testar**.
- `isBackgroundEnabled` só marca a feature `bluetooth_le` como obrigatória. **Não cria foreground service.**

### Fluxo de sincronização

1. Pareamento: scan filtrado por 0x180D, o usuário escolhe o dispositivo, o app salva `id` + `name` no AsyncStorage.
2. Ao iniciar o treino: `connectToDevice(savedId)`. Se falhar, faz scan por 0x180D e casa pelo `id` ou pelo `name`. Se o id mudou, atualiza `savedId`. No iOS o UUID do CoreBluetooth pode mudar depois de um reset de rede ou de um novo pareamento.
3. Ao desconectar: banner "cinta desconectada", o GPS continua, e o app tenta de novo com backoff de 1 s, 2 s, 5 s e depois a cada 10 s. Usar só `autoConnect: false` (`autoConnect: true` fica como experimento opcional; no iOS não tem efeito).
4. As amostras vão junto com a atividade pelo upload que já existe. **Não precisa de Edge Function.**

### Background

- **iOS:** `bluetooth-central` mantém as notificações de um periférico já conectado com a tela bloqueada. Scan em background só funciona com filtro de UUID, e é mais lento. A state restoration (`restoreStateIdentifier`) só cobre o caso de o iOS matar o app por memória, não o force-quit. É um "bom ter", porque a corrida já é recuperada pelo AsyncStorage.
- **Android:** com a tela apagada, o processo só sobrevive enquanto houver um FGS. O app já inicia um FGS de location em `lib/trackingSession.ts` (`startLocationUpdatesAsync` com `foregroundService`), em primeiro plano, quando o usuário toca em "Iniciar". Isso é obrigatório, porque `isAndroidBackgroundLocationEnabled: false`.
  - Hipótese: o FGS de location já mantém o processo vivo, e com ele os callbacks GATT. A documentação do Android não diz se GATT em background *exige* `connectedDevice` (**a confirmar por teste de campo**).
  - Se o teste falhar: usar `foregroundServiceType="location|connectedDevice"` no mesmo serviço, com um config plugin próprio (`withAndroidManifest`), mais `FOREGROUND_SERVICE_CONNECTED_DEVICE`. O pré-requisito em runtime é ter `BLUETOOTH_CONNECT` concedido ([tipos de FGS](https://developer.android.com/develop/background-work/services/fgs/service-types)). Isso gera uma declaração extra no Play, com vídeo.
  - Se o Doze no Android 15/16 limita notificações BLE dentro de um FGS é **a confirmar** (não achei fonte de 2025-26).

## Limites e termos de uso

- **Padrão aberto do Bluetooth SIG:** não há termos que restrinjam armazenar os dados ou usá-los com IA. Só os nomes de marca são protegidos.
- **Limites técnicos:**
  - cerca de 1 Hz de FC;
  - RR depende do MTU;
  - muitas cintas aceitam 1 conexão só (se a cinta estiver pareada com um relógio, o celular pode não vê-la);
  - a H10 aceita 2 conexões, se ativado.
- **IA:** sem restrição do provedor de hardware. Pela LGPD, a finalidade "treinador com IA" precisa estar no texto do consentimento. Se o modelo estiver fora do Brasil, isso é transferência internacional.
- **LGPD:** ver a seção de cadastro (consentimento do art. 11 I, encarregado, região, exclusão). `on delete cascade` cobre a exclusão da conta.
- **Lojas:** declaração de FGS com vídeo (Play), Data Safety, apps de saúde e justificativa do `bluetooth-central` (Apple).

## Arquitetura proposta (pesquisa)

```
[Cinta / relógio BLE 0x180D]
        │ notificações 0x2A37 (~1 Hz)
        ▼
[App Expo] lib/heartRate/
  ├─ permissions.ts    (permissões Android)
  ├─ bleManager.ts     (BleManager lazy, singleton)
  ├─ parseHeartRate.ts (decodificação dos bytes)
  └─ hrSession.ts      (máquina de estados de reconexão)
        │ junto com o FGS de location (lib/trackingSession.ts)
        ▼
[Buffer da atividade no AsyncStorage] → upload que já existe → Supabase (Postgres + RLS)
```

- Nenhuma Edge Function nova. Avg/max de FC são calculados no aparelho a partir dos valores filtrados e enviados com a atividade. As zonas precisam de `max_hr`/`lthr` no perfil.
- **Alinhamento no tempo:**
  - **FC:** `t_offset_s = floor((receivedAtMs − workoutStartMs)/1000)`. Se houver várias leituras no mesmo segundo, fica a última. **Não interpolar** segundos faltantes (regra "sem mock data").
  - **RR:** montar a linha do tempo por acumulação. `rrCursorMs` começa no horário da primeira notificação com RR, e cada RR soma ao cursor. A cada 60 s, se `|rrCursorMs − receivedAtMs| > 2000`, ressincroniza e marca um gap.
  - **Gaps:** abrir um gap quando `contact === 'lost'` e ao desconectar. Na reconexão, o cursor de RR recomeça.
  - **Artefatos:** descartar bpm `0`, `< 30` ou `> 230`; RR `< 300` ou `> 2000 ms`; e RR que difere mais de 20% da mediana dos últimos 5. Contar os descartes em `hr_artifacts_count`.
  - `contact === 'unsupported'` (relógio): aceitar a leitura se o bpm estiver na faixa.
  - Sem cinta: campos de FC `null`, nunca estimados.
- **Schema (proposta de migration da Fase 2):**

```sql
alter table activity_samples add column hr_bpm smallint;

create table activity_rr (
  activity_id uuid primary key references activities(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  start_offset_ms integer not null,
  rr_ms smallint[] not null,
  gaps jsonb not null default '[]'
);
alter table activity_rr enable row level security;
create policy "own rr" on activity_rr for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table profiles add column consent_hr_at timestamptz;
alter table profiles add column consent_hr_version text;
```

- `gaps` guarda `[{"at_index": n, "resync_offset_ms": t}]`. Uma corrida de 60 min a 150 bpm dá cerca de 9.000 smallints (≈18 KB), o que cabe bem numa linha por atividade.
- O nome da tabela `profiles` deve ser conferido no schema real (**a confirmar**).

## Exemplos de código

Os exemplos são adaptados para TypeScript. No código real do repositório **não vão comentários** (regra do projeto); aqui eles servem só de explicação.

### Parser sem `buffer` (`lib/heartRate/parseHeartRate.ts`)

O Hermes não tem `Buffer` global, e depender de uma dependência transitiva seria trazer uma lib sem aprovação. Este decodificador é TS puro e não depende de `atob`. A especificação é a do SIG, conferida com a [Adafruit](https://github.com/adafruit/Adafruit_CircuitPython_BLE_Heart_Rate/blob/master/adafruit_ble_heart_rate.py).

```ts
export type HeartRateReading = {
  bpm: number;
  contact: 'detected' | 'lost' | 'unsupported';
  energyKj: number | null;
  rrMs: number[];
};

const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export function base64ToBytes(input: string): Uint8Array {
  const clean = input.replace(/=+$/, '');
  const out = new Uint8Array(Math.floor((clean.length * 3) / 4));
  let buffer = 0;
  let bits = 0;
  let index = 0;
  for (const char of clean) {
    const value = BASE64_ALPHABET.indexOf(char);
    if (value < 0) throw new Error('invalid base64');
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out[index++] = (buffer >> bits) & 0xff;
    }
  }
  return out.subarray(0, index);
}

export function parseHeartRate(base64: string): HeartRateReading | null {
  const bytes = base64ToBytes(base64);
  if (bytes.length < 2) return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const flags = view.getUint8(0);
  const isUint16 = (flags & 0x01) !== 0;            // bit 0: formato da FC
  if (bytes.length < (isUint16 ? 3 : 2)) return null;
  const bpm = isUint16 ? view.getUint16(1, true) : view.getUint8(1);
  let offset = isUint16 ? 3 : 2;
  const contactSupported = (flags & 0x04) !== 0;     // bit 2
  const contact = !contactSupported ? 'unsupported' : (flags & 0x02) !== 0 ? 'detected' : 'lost';
  let energyKj: number | null = null;
  if ((flags & 0x08) !== 0 && offset + 2 <= bytes.length) {   // bit 3
    energyKj = view.getUint16(offset, true);
    offset += 2;
  }
  const rrMs: number[] = [];
  if ((flags & 0x10) !== 0) {                        // bit 4: RR em 1/1024 s
    while (offset + 2 <= bytes.length) {
      rrMs.push(Math.round((view.getUint16(offset, true) * 1000) / 1024));
      offset += 2;
    }
  }
  return { bpm, contact, energyKj, rrMs };
}
```

- O lint pode reclamar de `no-bitwise`. Nesse caso, desligar a regra só para este arquivo via `overrides` no config do ESLint, já que comentário `eslint-disable` não é permitido.

### Teste Jest (`lib/heartRate/parseHeartRate.test.ts`)

O Jest pode não estar configurado. `jest-expo` exige aprovação.

```ts
import { base64ToBytes, parseHeartRate } from './parseHeartRate';

const toBase64 = (bytes: number[]): string => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const [a, b = 0, c = 0] = bytes.slice(i, i + 3);
    const n = (a << 16) | (b << 8) | c;
    out += alphabet[(n >> 18) & 63] + alphabet[(n >> 12) & 63];
    out += i + 1 < bytes.length ? alphabet[(n >> 6) & 63] : '=';
    out += i + 2 < bytes.length ? alphabet[n & 63] : '=';
  }
  return out;
};

describe('parseHeartRate', () => {
  it('decodes base64 round trip', () => {
    expect(Array.from(base64ToBytes(toBase64([0x10, 0x48, 0x00, 0x04])))).toEqual([0x10, 0x48, 0x00, 0x04]);
  });
  it('reads uint8 bpm with contact detected', () => {
    expect(parseHeartRate(toBase64([0x06, 0x48]))).toEqual({ bpm: 72, contact: 'detected', energyKj: null, rrMs: [] });
  });
  it('flags contact lost', () => {
    expect(parseHeartRate(toBase64([0x04, 0x00]))?.contact).toBe('lost');
  });
  it('reads uint16 bpm', () => {
    expect(parseHeartRate(toBase64([0x01, 0x2c, 0x01]))?.bpm).toBe(300);
  });
  it('reads energy then rr', () => {
    expect(parseHeartRate(toBase64([0x18, 0x50, 0x10, 0x00, 0x00, 0x04, 0x00, 0x02]))).toEqual({
      bpm: 80, contact: 'unsupported', energyKj: 16, rrMs: [1000, 500],
    });
  });
  it('ignores a trailing odd byte', () => {
    expect(parseHeartRate(toBase64([0x10, 0x48, 0x00, 0x04, 0x01]))?.rrMs).toEqual([1000]);
  });
  it('rejects too short payloads', () => {
    expect(parseHeartRate(toBase64([0x01, 0x48]))).toBeNull();
  });
});
```

### Permissões (`lib/heartRate/permissions.ts`)

```ts
import { PermissionsAndroid, Platform } from 'react-native';

export async function requestBlePermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  if (Platform.Version >= 31) {
    const result = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    ]);
    return Object.values(result).every((r) => r === PermissionsAndroid.RESULTS.GRANTED);
  }
  const fine = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
  return fine === PermissionsAndroid.RESULTS.GRANTED;
}
```

### BleManager lazy (`lib/heartRate/bleManager.ts`)

```ts
import { BleManager, State } from 'react-native-ble-plx';

let instance: BleManager | null = null;

export function getBleManager(): BleManager {
  // criado só no pareamento ou ao iniciar corrida com cinta pareada (prompt do iOS em contexto)
  if (!instance) instance = new BleManager({ restoreStateIdentifier: 'paceless-hr', restoreStateFunction: () => undefined });
  return instance;
}

export function destroyBleManager(): void {
  instance?.destroy();
  instance = null;
}

export function waitPoweredOn(manager: BleManager, timeoutMs = 5000): Promise<boolean> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => { sub.remove(); resolve(false); }, timeoutMs);
    const sub = manager.onStateChange((state) => {
      if (state === State.PoweredOn) { clearTimeout(timer); sub.remove(); resolve(true); }
    }, true);
  });
}
```

No spike, testar com e sem `restoreStateIdentifier`. Não se sabe se o crash de release no iOS da issue #1277 tem relação com ele (**a confirmar**).

### Máquina de estados de reconexão (`lib/heartRate/hrSession.ts`)

Baseada na API da [wiki do ble-plx](https://github.com/dotintent/react-native-ble-plx/wiki).

```ts
import { BleError, BleManager, Device, Subscription } from 'react-native-ble-plx';
import { parseHeartRate, HeartRateReading } from './parseHeartRate';

export const HR_SERVICE = '0000180d-0000-1000-8000-00805f9b34fb';
export const HR_MEASUREMENT = '00002a37-0000-1000-8000-00805f9b34fb';
const BACKOFF_MS = [1000, 2000, 5000, 10000];

export type HrStatus = 'connecting' | 'streaming' | 'reconnecting' | 'stopped';

type Handlers = {
  onReading: (reading: HeartRateReading, receivedAtMs: number) => void;
  onStatus: (status: HrStatus, error?: BleError | Error) => void;
  onDeviceIdChanged: (id: string) => void;
};

export function startHrSession(manager: BleManager, saved: { id: string; name: string | null }, h: Handlers) {
  let deviceId = saved.id;
  let attempt = 0;
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let monitor: Subscription | null = null;
  let disconnectSub: Subscription | null = null;

  const cleanupLink = () => {
    monitor?.remove(); monitor = null;
    disconnectSub?.remove(); disconnectSub = null;
  };

  const scheduleRetry = (error?: BleError | Error) => {
    cleanupLink();
    if (stopped || timer) return;   // evita retry duplo (disconnect + erro do monitor)
    h.onStatus('reconnecting', error);
    const delay = BACKOFF_MS[Math.min(attempt, BACKOFF_MS.length - 1)];
    attempt += 1;
    timer = setTimeout(connect, delay);
  };

  const findByScan = (): Promise<Device | null> => new Promise((resolve) => {
    const giveUp = setTimeout(() => { manager.stopDeviceScan(); resolve(null); }, 8000);
    manager.startDeviceScan([HR_SERVICE], null, (error, device) => {
      if (error) { clearTimeout(giveUp); manager.stopDeviceScan(); resolve(null); return; }
      if (device && (device.id === deviceId || (saved.name && device.name === saved.name))) {
        clearTimeout(giveUp); manager.stopDeviceScan(); resolve(device);
      }
    });
  });

  const subscribe = async (device: Device) => {
    // listener registrado ANTES do discover/monitor
    disconnectSub = manager.onDeviceDisconnected(device.id, (error) => scheduleRetry(error ?? undefined));
    await device.discoverAllServicesAndCharacteristics();
    monitor = device.monitorCharacteristicForService(HR_SERVICE, HR_MEASUREMENT, (error, ch) => {
      if (error) { scheduleRetry(error); return; }
      const reading = ch?.value ? parseHeartRate(ch.value) : null;
      if (reading) h.onReading(reading, Date.now());
    });
    attempt = 0;
    h.onStatus('streaming');
  };

  async function connect() {
    timer = null;
    if (stopped) return;
    h.onStatus(attempt === 0 ? 'connecting' : 'reconnecting');
    try {
      const device = await manager.connectToDevice(deviceId, { autoConnect: false, timeout: 10000 });
      await subscribe(device);
    } catch (firstError) {
      const found = await findByScan();   // UUID do iOS pode ter mudado
      if (!found) { scheduleRetry(firstError as Error); return; }
      if (found.id !== deviceId) { deviceId = found.id; h.onDeviceIdChanged(found.id); }
      try { await subscribe(await found.connect({ autoConnect: false, timeout: 10000 })); }
      catch (e) { scheduleRetry(e as Error); }
    }
  }

  connect();

  return () => {
    stopped = true;
    if (timer) clearTimeout(timer);
    cleanupLink();
    manager.cancelDeviceConnection(deviceId).catch(() => undefined);
    h.onStatus('stopped');
  };
}
```

- Conferir no `tsc` qual nome existe nos tipos da 3.5.1: `discoverAllServicesAndCharacteristics` ou `discoverServicesAndCharacteristics`.
- Cobrir a proteção contra retry duplo com um teste Jest usando um manager falso.

### Repositórios open-source encontrados

- [friyiajr/BLESampleExpo](https://github.com/friyiajr/BLESampleExpo): companheiro do [post do blog da Expo](https://expo.dev/blog/how-to-build-a-bluetooth-low-energy-powered-expo-app). 111 estrelas, último push 2024-07 (**antigo**). Usa `react-native-base64` e ignora RR.
- [paradox-prakhar/vitalEdge](https://github.com/paradox-prakhar/vitalEdge): push em 2026-08, 1 estrela.
- [yoel3imari/smart-bracelet-app](https://github.com/yoel3imari/smart-bracelet-app), [wmcorless/myhealth](https://github.com/wmcorless/myhealth), [Balvorn/heart-monitor](https://github.com/Balvorn/heart-monitor) (2024-12).
- Conclusão: não existe um app fitness RN maduro de 2025-26 com RR e reconexão para usar de referência. Os exemplos acima já vão além desses repositórios.

## Riscos e pontos a confirmar

1. **Compatibilidade do ble-plx 3.5.1 com o SDK 58 / Nova Arquitetura (bloqueante).**
   - A lib não tem `codegenConfig`: é um módulo legado rodando via interop. O rewrite em TurboModule (PR #1331) ainda é draft.
   - Issues abertas:
     - [#1277](https://github.com/dotintent/react-native-ble-plx/issues/1277): crash em release iOS no `new BleManager()`;
     - #1278: correção temporária para o crash de release no iOS;
     - #1323: NPE no Android num timeout de GATT.
   - **Nenhuma fonte mostra a 3.x rodando no SDK 55+.** Desligar a Nova Arquitetura não é opção.
   - **Spike:** dev build no EAS; build de release no iOS; no Android, desligar a cinta no meio da sessão. Fallback: `react-native-ble-manager` (conferir `codegenConfig`) ou o PR #1331 se for mergeado. O fork `@sfourdrinier/react-native-ble-plx` fica só como último recurso (uma pessoa só mantém).
2. **FGS de location basta para BLE com a tela apagada no Android 14–16?** **A confirmar por teste de campo:**
   - Pixel (Android 15/16) e Samsung (One UI 7/8);
   - 30 min com a tela bloqueada;
   - passa com ≥ 55 amostras por minuto e nenhum buraco maior que 5 s.
   - Se falhar, adicionar `connectedDevice`.
3. **`neverForLocation`:** a H10 e um Garmin aparecem no scan filtrado no Android 12+? Testar também API ≤ 30 com a localização desligada.
4. **Suporte por modelo Garmin:** só existe a lista de terceiros, que conflita com os manuais antigos. Validar em hardware real.
5. **Apple Watch como 0x180D:** sem fonte da Apple em nenhum sentido.
6. **ble-plx no iOS:** confirmar se `connectToDevice` usa `retrievePeripheralsWithIdentifiers` (ver `BleModule.swift` no spike).
7. **Versões:** só a 3.5.1 do ble-plx está confirmada. As versões e datas de `@config-plugins/react-native-ble-plx` (7.0.0), `react-native-ble-manager` (12.6.0) e do fork (3.9.x) estão **a confirmar**.
8. **`atob` global no RN 0.88:** irrelevante, porque o parser não depende dele.
9. **Burocracia e LGPD:** o nome e os campos do formulário de apps de saúde do Play; a dispensa de encarregado com dado sensível; o texto da Res. ANPD 19/2024; a região do Supabase; o preço das cintas.
10. **Correções ao `docs/relogios.md`:**
    - `isBackgroundEnabled` não resolve o background no Android; incluir a estratégia de FGS na Fase 2;
    - incluir RR, status de contato e o limite de 1–2 conexões;
    - a Fase 2 não tem cadastro, mas tem as declarações nas lojas e o custo do hardware.

## Fontes

- https://github.com/dotintent/react-native-ble-plx
- https://github.com/dotintent/react-native-ble-plx/wiki
- https://raw.githubusercontent.com/dotintent/react-native-ble-plx/master/package.json
- https://github.com/dotintent/react-native-ble-plx/issues?q=new+architecture
- https://github.com/dotintent/react-native-ble-plx/issues/1277
- https://www.npmjs.com/package/react-native-ble-plx
- https://www.npmjs.com/package/@config-plugins/react-native-ble-plx
- https://www.npmjs.com/package/react-native-ble-manager
- https://cdn.jsdelivr.net/npm/@sfourdrinier/react-native-ble-plx@3.9.2/README.md
- https://cdn.jsdelivr.net/npm/@sfourdrinier/react-native-ble-plx@3.9.2/docs/EXPO_PLUGIN.md
- https://cdn.jsdelivr.net/npm/@sfourdrinier/react-native-ble-plx@3.9.2/ROADMAP.md
- https://expo.dev/blog/how-to-build-a-bluetooth-low-energy-powered-expo-app
- https://reactnativerelay.com/article/react-native-ble-plx-expo-tutorial-2026 (baixa autoridade)
- https://classic.yarnpkg.com/en/package/react-native-ble-plx
- https://lightrun.com/answers/dotintent-react-native-ble-plx-scanning-in-background-task
- https://github.com/adafruit/Adafruit_CircuitPython_BLE_Heart_Rate/blob/master/adafruit_ble_heart_rate.py
- https://github.com/adafruit/Adafruit_CircuitPython_BLE_Heart_Rate/issues/17
- https://docs.espressif.com/projects/esp-iot-solution/en/latest/bluetooth/ble_hrs.html
- https://docs.simpleble.org/recipes/heart-rate-monitor
- https://www.b4x.com/android/forum/threads/64102
- https://developer.apple.com/forums/thread/746471
- https://developer.android.com/develop/background-work/services/fgs/service-types
- https://support.google.com/googleplay/android-developer/answer/13392821
- https://pub.dev/packages/ble_keeper/changelog
- https://support.polar.com/uk-en/can_i_pair_h10_with_several_devices
- https://www.wareable.com/fitness-trackers/polar-h9-vs-polar-h10
- https://github.com/polarofficial/polar-ble-sdk
- https://raw.githubusercontent.com/polarofficial/polar-ble-sdk/master/documentation/products/PolarH10.md
- https://www.myzone.digital/app-support/which-garmin-devices-support-real-time-in-club-tracking-bluetooth-broadcasting
- https://www8.garmin.com/manuals/webhelp/forerunner245/EN-US/GUID-D8D363C2-0690-48D4-95E2-A3557E7D53C2.html
- https://www8.garmin.com/manuals/webhelp/forerunner945/EN-US/GUID-D8D363C2-0690-48D4-95E2-A3557E7D53C2.html
- https://github.com/friyiajr/BLESampleExpo
- https://github.com/paradox-prakhar/vitalEdge
- https://github.com/yoel3imari/smart-bracelet-app
- https://github.com/wmcorless/myhealth
- https://github.com/Balvorn/heart-monitor
- Repositório: `app.json`, `lib/trackingSession.ts`, `node_modules/expo-location/android/src/main/AndroidManifest.xml`

## Implementação no Paceless

Esta seção descreve o que foi construído na fase 2. Onde ela diverge da proposta acima, vale o código.

### Diagrama real

```
[Cinta / relógio BLE 0x180D]
        │ notificações 0x2A37
        ▼
lib/platform/ble/            (único lugar que importa react-native-ble-plx)
  ├─ bleManager.ts           BleManager singleton, waitForState
  ├─ blePermissions.ts       BLUETOOTH_SCAN/CONNECT (API 31+) ou localização (API < 31)
  ├─ prepareBluetooth.ts     estado do Bluetooth após permissão
  ├─ scan.ts                 scan filtrado por 0x180D, 20 s, dedupe por id
  ├─ fallbackScan.ts         reencontra a cinta por nome quando o id muda (iOS)
  └─ hrSession.ts            máquina de estados: conectar, monitorar, reconectar
        ▲
lib/platform/heartRateBle.ts     API pública (App só importa daqui)
lib/platform/heartRateBle.web.ts no-ops para web (ble-plx nunca é empacotado)
        ▲
lib/heartRate/               funções puras, sem dependência de React Native
  ├─ base64.ts, parseHeartRate.ts (0x2A37), heartRateFilter.ts
  ├─ heartRateZones.ts, heartRateStats.ts (addSample, summarize)
        ▲
hooks/useWorkoutHeartRate.ts     treino: status, bpm, zona, finish, discard
hooks/useStrapPairing.ts         tela de pareamento
hooks/useHeartRateStrap.ts       cinta salva (Supabase + cache local)
lib/strapDevice.ts               connected_devices (provider ble_hr) + cache
lib/activeHeartRate.ts           amostras do treino em andamento (retomada)
lib/activitySamples.ts           insert em activity_samples e fila pendente
```

### Fluxo

1. Pareamento: `prepareBluetooth` pede a permissão e espera o estado `PoweredOn`. O scan usa só o serviço 0x180D. Escolher uma cinta mostra a prévia de bpm (`previewDevice`) e só salva ao tocar em **Usar esta cinta**.
2. Treino: `useWorkoutHeartRate` lê a cinta do cache local (funciona offline) e atualiza do servidor em segundo plano. Sem cinta, nenhum `BleManager` é criado.
3. Sessão: conecta, descobre serviços, assina 0x2A37. Em desconexão ou falha, espera 1 s, 2 s, 5 s e depois 10 s. Após 2 falhas seguidas, procura a cinta por 10 s (o id do iOS pode mudar) e, se achar, salva o novo id.
4. Leituras com `contact === 'lost'`, fora de 30 a 230 bpm, ou sem valor são descartadas. Leituras `unsupported` (relógios) são aceitas.
5. Amostras: uma por segundo, `t_offset_s = floor((recebido − início)/1000)`. Duas leituras no mesmo segundo ficam com a última. Pausado: o bpm aparece, mas não é gravado.
6. Retomada: a cada 30 s e ao ir para o segundo plano, as amostras vão para `paceless:active-hr-samples` (com o id da sessão). Ao reabrir um treino, elas são recarregadas.
7. Fim: `finish()` para a sessão e gera `avg`/`max` e `secondsInZone` (se houver FC máxima). A atividade é salva com `avg_heart_rate` e `max_heart_rate`, e as amostras vão para `activity_samples`. Se a atividade estiver na fila offline, as amostras vão para `paceless:pending-hr-samples` e são enviadas depois do flush das atividades.

### Schema real (migration `20261029140000_ble_heart_rate.sql`)

- `connected_devices`: provider `ble_hr` aceito, colunas `device_id` e `device_name`, check que exige `device_id` para `ble_hr`, policies de insert e update ampliadas, `grant update (device_id, device_name)`.
- `profiles.max_heart_rate smallint` (100 a 230).
- `activity_samples (activity_id, user_id, t_offset_s, hr_bpm)`, chave primária `(activity_id, t_offset_s)`, RLS por dono e insert só em atividade própria.

**Diferenças em relação à proposta:**

- Não existe `activity_rr` e os intervalos RR não são gravados. Os RR são decodificados (`rrMs`), mas não são persistidos nesta fase.
- Não existem `consent_hr_at`/`consent_hr_version` nem `hr_artifacts_count`. O consentimento de saúde continua no fluxo já existente.
- Não há `lat`/`lng` em `activity_samples`, porque a rota já fica em `activities.route`.
- Não há data de nascimento. A zona usa só a FC máxima informada em Preferências.

### Limitações conhecidas

- Android em segundo plano depende de teste em aparelho (ver `docs/relogios.md`).
- `restoreStateIdentifier` não é usado (crash #1277 no iOS).
- O aviso de uso de dados (FC vinculada à conta e armazenada no servidor) aparece na tela de pareamento. Tocar em "Procurar cinta" é o aceite explícito. Não há flag de consentimento salva no banco.
- No sair da conta e na exclusão da conta, `clearHeartRateLocalData()` apaga o cache local da cinta (`paceless:ble-hr-device`) e as amostras do treino ativo (`paceless:active-hr-samples`). Amostras pendentes (`paceless:pending-hr-samples`) não são apagadas, porque são filtradas por usuário.
- Amostras pendentes de treinos salvos sem conexão são reenviadas em todo flush da fila de atividades (início do app, volta ao primeiro plano e após salvar).
- Só dispositivos com o serviço 0x180D aparecem no pareamento. Relógios que só transmitem FC por outro canal não aparecem.

