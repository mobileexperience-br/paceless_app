# Teste em aparelho Android físico via adb (guia para agentes)

Guia para uma sessão de agente (Claude Code ou similar, sem ver a tela em tempo real) controlar e testar o Paceless em um Android físico usando só comandos de shell.

## Legenda de confiança

- **[VALIDADO]** rodado nesta máquina/aparelho em 2026-11-02, somente leitura.
- **[PESQUISA]** vem da documentação ou de artigos, não foi executado aqui (porque gera input, instala ou muda estado e o aparelho estava reservado para um loop de QA).
- **[PESQUISA, VERIFICAR]** fonte fraca ou comportamento que varia por versão/fabricante; confirme na primeira vez.

## Ambiente de referência desta máquina

| Item | Valor | Status |
| --- | --- | --- |
| adb | `/home/jonatas/Android/Sdk/platform-tools` (v37.0.1), fora do PATH padrão | [VALIDADO] |
| Aparelho | Samsung Galaxy A12 `SM-A127M`, serial `RX8T10EZ26E`, USB | [VALIDADO] |
| Android | 13 (SDK 33), tela 720x1600, densidade 300 (override 280) | [VALIDADO] |
| Teclado | Samsung HoneyBoard (+ voz do Google) | [VALIDADO] |
| Locale | `pt-BR` | [VALIDADO] |
| App | `com.paceless.app`, activity `.MainActivity`, versionName 1.0.0, versionCode 5, minSdk 26, targetSdk 36 | [VALIDADO] |
| scrcpy | 4.1 em `/usr/local/bin/scrcpy` | [VALIDADO] |
| ffmpeg, ImageMagick (`convert`), python3 | instalados | [VALIDADO] |
| Maestro | NÃO instalado; Java local é 11 (Maestro exige 17+) | [VALIDADO] |

Preparação de toda sessão:

```bash
export PATH="$PATH:/home/jonatas/Android/Sdk/platform-tools"
export ANDROID_SERIAL=RX8T10EZ26E   # faz todo adb usar esse aparelho, sem precisar de -s
adb devices -l
```

`ANDROID_SERIAL` é lida pelo adb (variável documentada em [adb](https://developer.android.com/tools/adb)); evita erro "more than one device/emulator".

Pasta de trabalho para artefatos (nunca dentro do repo):

```bash
OUT=/tmp/paceless-qa; mkdir -p "$OUT"
```

---

## 1. Pré-requisitos e checagem

### 1.1 Estado do aparelho [VALIDADO]

```bash
adb devices -l                         # deve listar "device" (não "unauthorized"/"offline")
adb shell getprop ro.product.model     # SM-A127M
adb shell getprop ro.build.version.release   # 13
adb shell getprop ro.build.version.sdk       # 33
adb shell wm size                      # Physical size: 720x1600
adb shell wm density
adb shell dumpsys battery | head -12
adb shell dumpsys power | grep mWakefulness=          # Awake | Asleep
adb shell dumpsys window | grep -E "isKeyguardShowing" # true = bloqueado
```

### 1.2 Vários aparelhos / conexões [PESQUISA]

- `adb -s <serial> <comando>` escolhe o alvo; `-d` = único USB; `-e` = único emulador. Ou `export ANDROID_SERIAL=...`.
- Regra deste projeto: **um único agente por aparelho**. Antes de começar, verifique se outra sessão não está usando (ex.: `ps aux | grep -E "adb|maestro|scrcpy"`).
- Se o servidor adb travar: `adb kill-server && adb start-server`.

### 1.3 adb sem fio (Android 11+) [PESQUISA]

Fonte: [documentação adb](https://developer.android.com/tools/adb#connect-to-a-device-over-wi-fi).

No aparelho: Opções do desenvolvedor > Depuração sem fio > ativar. "Parear dispositivo com código" mostra IP:porta de pareamento e um código de 6 dígitos.

```bash
adb pair 192.168.0.50:37099        # pede o código de 6 dígitos
adb connect 192.168.0.50:41234     # porta da tela principal da Depuração sem fio (diferente da de pareamento)
adb devices -l                     # aparece como 192.168.0.50:41234
adb disconnect 192.168.0.50:41234
```

Atalho com USB já conectado (Android 10 e anteriores, e ainda funciona em muitos aparelhos; pode precisar reaplicar após reboot) [PESQUISA, VERIFICAR]:

```bash
adb tcpip 5555 && adb connect <ip-do-aparelho>:5555
```

Com os dois (USB e Wi-Fi) o aparelho aparece duas vezes; use `-s` ou `ANDROID_SERIAL`.

### 1.4 Manter a tela ligada [PESQUISA, leitura VALIDADA]

Valores lidos aqui: `stay_on_while_plugged_in=2` (já configurado: ligada em USB) e `screen_off_timeout=60000` (60 s).

```bash
adb shell svc power stayon usb                    # ligada enquanto no USB (true = qualquer carregador)
adb shell settings put global stay_on_while_plugged_in 3   # 1=AC 2=USB 4=sem fio, soma = combinações
adb shell settings put system screen_off_timeout 600000    # 10 min, para sessão sem cabo
adb shell settings get system screen_off_timeout           # [VALIDADO] leitura
```

Ao terminar a sessão, restaure o timeout original (anote o valor antes: 60000).

### 1.5 Desbloquear [PESQUISA]

```bash
adb shell input keyevent KEYCODE_WAKEUP        # acorda (não desbloqueia)
adb shell input swipe 360 1400 360 400 300     # desliza o keyguard para cima (sem PIN)
adb shell input text 1234 && adb shell input keyevent KEYCODE_ENTER   # se houver PIN numérico
```

Recomendação para o aparelho de teste: sem PIN ou "deslizar" apenas (Configurações > Tela de bloqueio). Samsung pode exigir confirmar PIN em configurações sensíveis. Em tela com biometria/padrão, o agente não consegue desbloquear: peça ao humano.

Checar se está desbloqueado e qual app está em primeiro plano [VALIDADO]:

```bash
adb shell dumpsys window | grep -E "mCurrentFocus|isKeyguardShowing"
adb shell dumpsys activity activities | grep topResumedActivity
```

Atenção: `mCurrentFocus` pode aparecer mais de uma vez (uma linha por display/janela). Se alguma linha mostrar `Application Error: com.paceless.app`, há diálogo de crash na tela (visto uma vez neste aparelho durante a validação; o buffer `-b crash` estava vazio, então pode ter sido um ANR/diálogo antigo). Sempre confirme com screenshot.

---

## 2. Instalar, abrir, fechar e limpar o app

### 2.1 Instalar / atualizar [PESQUISA]

```bash
adb install -r caminho/app-preview.apk          # -r reinstala preservando dados
adb install -r -d app.apk                       # -d permite downgrade de versionCode
adb install -r -g app.apk                       # -g concede todas as permissões de runtime declaradas
adb uninstall com.paceless.app                  # apaga tudo (inclui AsyncStorage)
```

Se der `INSTALL_FAILED_UPDATE_INCOMPATIBLE` (assinatura diferente): desinstale antes. `INSTALL_FAILED_USER_RESTRICTED`: ver seção 10.

### 2.2 Abrir [VALIDADO o nome da activity; execução PESQUISA]

Activity resolvida aqui: `com.paceless.app/.MainActivity`.

```bash
adb shell am start -n com.paceless.app/.MainActivity
adb shell monkey -p com.paceless.app -c android.intent.category.LAUNCHER 1   # alternativa sem saber a activity
adb shell am start -W -n com.paceless.app/.MainActivity   # -W espera e imprime TotalTime (cold start)
adb shell cmd package resolve-activity --brief com.paceless.app   # [VALIDADO] descobre a activity
```

Deep link (esquema definido no app.json do projeto; confira antes): `adb shell am start -a android.intent.action.VIEW -d "paceless://rota"`.

### 2.3 Fechar e limpar [PESQUISA]

```bash
adb shell am force-stop com.paceless.app       # mata o processo (equivale a "Forçar parada")
adb shell pm clear com.paceless.app            # apaga dados + cache + concede de novo o estado de primeiro uso
adb shell pm clear --cache-only com.paceless.app   # só cache (Android 13 pode não suportar; verificar)
```

`pm clear` também revoga permissões de runtime: o onboarding e os pedidos de permissão voltam. Usa-se para "estado limpo entre rodadas".

### 2.4 Permissões [PESQUISA; estado atual VALIDADO]

Estado lido agora (tudo `granted=false`): `POST_NOTIFICATIONS`, `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`, `BLUETOOTH_CONNECT`, `BLUETOOTH_SCAN`, `CAMERA`. O `dumpsys package` deste build NÃO listou `ACTIVITY_RECOGNITION` entre as permissões solicitadas; se o app passar a usar passos/atividade, confirme que a permissão está no manifest antes de usar `pm grant`.

```bash
adb shell pm grant  com.paceless.app android.permission.ACCESS_FINE_LOCATION
adb shell pm grant  com.paceless.app android.permission.ACCESS_COARSE_LOCATION
adb shell pm grant  com.paceless.app android.permission.POST_NOTIFICATIONS      # Android 13+
adb shell pm grant  com.paceless.app android.permission.ACTIVITY_RECOGNITION    # só se declarada
adb shell pm revoke com.paceless.app android.permission.ACCESS_FINE_LOCATION
adb shell dumpsys package com.paceless.app | grep -E "permission\..*granted="   # [VALIDADO] leitura
```

Localização em segundo plano (`ACCESS_BACKGROUND_LOCATION`) é concedida separadamente e só depois da de primeiro plano. `pm grant` só funciona para permissões de runtime declaradas no manifest do app.

### 2.5 Versão instalada [VALIDADO]

```bash
adb shell dumpsys package com.paceless.app | grep -E "versionName|versionCode|firstInstallTime|lastUpdateTime"
```

Resultado hoje: `versionCode=5`, `versionName=1.0.0`, `lastUpdateTime=2026-11-02 19:16:31`. Isto mostra a versão do **binário nativo**, não do bundle JS da OTA.

### 2.6 Carregar a OTA (EAS Update, canal `preview`) [PESQUISA + doc do projeto]

Veja `docs/ota.md`. Comportamento: o app baixa a atualização no primeiro início e a aplica no segundo.

```bash
adb shell am force-stop com.paceless.app
adb shell am start -n com.paceless.app/.MainActivity     # 1o início: baixa a OTA
sleep 15                                                 # tempo para o download (rede boa)
adb shell am force-stop com.paceless.app
adb shell am start -n com.paceless.app/.MainActivity     # 2o início: roda o bundle novo
```

Para confirmar que a OTA entrou, procure no logcat (seção 7) por `expo-updates` e pelo updateId, ou tenha uma tela/rodapé de versão no app (fingerprint do commit). Só `force-stop` + `start` garante um novo início; apenas voltar do segundo plano não conta.

---

## 3. Ver a tela

O agente não vê o aparelho. **Regra: depois de toda ação, capture e leia o PNG com a ferramenta Read antes de concluir qualquer coisa.**

### 3.1 Screenshot [PESQUISA]

```bash
adb exec-out screencap -p > "$OUT/tela.png"       # exec-out evita corromper binário (diferente de shell)
```

Reduzir para economizar tokens (720x1600 -> 360 de largura costuma bastar para ler layout; use largura maior se o texto ficar ilegível) [ImageMagick e ffmpeg presentes, VALIDADO a existência]:

```bash
convert "$OUT/tela.png" -resize 50% "$OUT/tela-s.png"
# ou JPEG leve:
convert "$OUT/tela.png" -resize 50% -quality 70 "$OUT/tela-s.jpg"
```

Função pronta:

```bash
shot() { adb exec-out screencap -p | convert png:- -resize 50% "$OUT/${1:-tela}.png"; echo "$OUT/${1:-tela}.png"; }
```

Depois: `Read /tmp/paceless-qa/tela.png`. Se a tela vier preta: aparelho dormindo, janela com `FLAG_SECURE` (screenshot bloqueado) ou DRM. Checar `mWakefulness`.

Observação de coordenadas: ao reduzir 50%, multiplique as coordenadas lidas na imagem por 2 antes de usar em `input tap`. O sistema real é 720x1600.

### 3.2 Vídeo [PESQUISA]

```bash
adb shell screenrecord --time-limit 30 --size 360x800 --bit-rate 2000000 /sdcard/rec.mp4
adb pull /sdcard/rec.mp4 "$OUT/rec.mp4" && adb shell rm /sdcard/rec.mp4
```

Limite de 180 s por gravação. Para o agente "ver" um vídeo, extraia quadros:

```bash
ffmpeg -i "$OUT/rec.mp4" -vf fps=1,scale=360:-1 "$OUT/f_%03d.png"
```

Rodar em background (`&`) enquanto interage; encerrar com `adb shell pkill -l SIGINT screenrecord` para finalizar o arquivo corretamente [PESQUISA, VERIFICAR].

---

## 4. Encontrar elementos

### 4.1 uiautomator dump [PESQUISA]

```bash
adb shell uiautomator dump /sdcard/ui.xml     # usar sempre caminho explícito
adb pull /sdcard/ui.xml "$OUT/ui.xml"
# alternativa sem arquivo no aparelho:
adb exec-out uiautomator dump /dev/tty        # imprime o XML no stdout (termina com "UI hierchary dumped to: /dev/tty")
```

Cada `<node>` tem `text`, `content-desc`, `resource-id`, `class`, `clickable`, `bounds="[x1,y1][x2,y2]"`. Centro = `((x1+x2)/2, (y1+y2)/2)`.

### 4.2 Script Python: achar e tocar por texto [PESQUISA; lógica de parsing testada com XML sintético]

Salve fora do repo, por exemplo em `/tmp/paceless-qa/tap.py` (ou combine antes se quiser versionar).

```python
#!/usr/bin/env python3
import re
import subprocess
import sys
import xml.etree.ElementTree as ET

BOUNDS = re.compile(r"\[(\d+),(\d+)\]\[(\d+),(\d+)\]")


def adb(*args):
    return subprocess.run(["adb", *args], capture_output=True, check=True).stdout


def dump_nodes():
    raw = adb("exec-out", "uiautomator", "dump", "/dev/tty").decode("utf-8", "replace")
    start = raw.find("<?xml")
    end = raw.rfind("</hierarchy>") + len("</hierarchy>")
    return list(ET.fromstring(raw[start:end]).iter("node"))


def find(nodes, query, exact=False):
    q = query.lower()
    hits = []
    for n in nodes:
        for key in ("text", "content-desc", "resource-id"):
            v = n.get(key, "")
            if v and ((v.lower() == q) if exact else (q in v.lower())):
                m = BOUNDS.match(n.get("bounds", ""))
                if m:
                    x1, y1, x2, y2 = map(int, m.groups())
                    hits.append((key, v, (x1 + x2) // 2, (y1 + y2) // 2))
                break
    return hits


def main():
    if len(sys.argv) < 2:
        sys.exit("uso: tap.py <texto|desc|id> [--exact] [--no-tap] [--index N]")
    query = sys.argv[1]
    exact = "--exact" in sys.argv
    index = int(sys.argv[sys.argv.index("--index") + 1]) if "--index" in sys.argv else 0
    hits = find(dump_nodes(), query, exact)
    if not hits:
        sys.exit(f"nao encontrado: {query}")
    for i, (key, value, x, y) in enumerate(hits):
        print(f"[{i}] {key}={value!r} centro=({x},{y})")
    _, _, x, y = hits[index]
    if "--no-tap" not in sys.argv:
        adb("shell", "input", "tap", str(x), str(y))
        print(f"tap em ({x},{y})")


main()
```

Uso:

```bash
python3 -I "$OUT/tap.py" "Começar" --exact          # toca no primeiro match exato
python3 -I "$OUT/tap.py" "treino" --no-tap          # só lista candidatos e coordenadas
python3 -I "$OUT/tap.py" "Salvar" --index 1         # segundo match
```

Se `uiautomator dump` falhar com "could not get idle state", a tela tem animação contínua (ver 4.4).

### 4.3 Limitações em React Native [PESQUISA, VERIFICAR no build real]

- `accessibilityLabel` aparece como `content-desc` ([Appium/RN, discussão](https://discuss.appium.io/t/react-native-ui-element-access-via-testid/7845)).
- `testID`: desde o React Native 0.64 passou a ser exposto como `resource-id` no Android ([thread](https://kiwix.lema.org/stackoverflow.com_en_all_2023-11/questions/45381602/how-to-add-resource-id-to-android-in-react-native), [issue antiga #9777](https://github.com/facebook/react-native/issues/9777), [artigo](https://dev.to/nextlevelbeard/an-end-to-the-abuse-of-accessibility-ids-5d2j)); há relato de que não cobre todos os componentes (ex.: `TextInput`). Fontes comunitárias: confirme com um dump no build real do Paceless (SDK 58 é bem mais novo que 0.64, então deve funcionar). A doc oficial de [acessibilidade do RN](https://reactnative.dev/docs/accessibility) não descreve esse mapeamento.
- `<Text>` aparece com `text`; botões `Pressable` costumam ter `text` vazio e o rótulo está em um filho. Procure o filho e toque nas coordenadas dele (cai dentro do botão), ou dê `testID`/`accessibilityLabel` ao botão.
- Agrupamento: um container com `accessible` junta os textos filhos em um único `content-desc`. Com `accessible={false}` os filhos aparecem separados.
- Ícones lucide (SVG) não têm texto; precisam de `accessibilityLabel` para serem achados por nome. Recomendação ao implementar telas: dar `testID` estável a controles importantes (botão de iniciar treino, abas, campos do login).
- Modais nativos e diálogos do sistema (permissão, teclado) estão em outras janelas; o dump mostra a janela ativa.
- `TextInput` com `secureTextEntry`: o dump não mostra o valor.

### 4.4 Telas com animação [PESQUISA]

O `uiautomator dump` espera a UI ficar ociosa. Animações infinitas (Lottie, loops do Reanimated, cronômetro) podem impedir isso e dar erro ou XML parcial. Alternativas: esperar a animação terminar (`sleep`), tentar de novo, ou usar screenshot + coordenadas relativas medidas na imagem. Nunca conclua "elemento ausente" só porque o dump falhou.

---

## 5. Interagir

Todos os comandos abaixo são [PESQUISA] (geram input; não executados neste aparelho). Coordenadas em pixels reais (720x1600).

```bash
adb shell input tap 360 800
adb shell input swipe 360 1200 360 400 300        # rolar para baixo (conteúdo sobe), 300 ms
adb shell input swipe 360 400 360 1200 300        # rolar para cima
adb shell input swipe 600 800 100 800 250         # swipe horizontal
adb shell input swipe 360 800 360 800 1500        # segurar (long press) = swipe sem deslocamento com duração
adb shell input keyevent KEYCODE_BACK             # ou 4
adb shell input keyevent KEYCODE_HOME             # 3
adb shell input keyevent KEYCODE_APP_SWITCH       # 187, recentes
adb shell input keyevent KEYCODE_ENTER            # 66
adb shell input keyevent KEYCODE_WAKEUP           # 224
adb shell input keyevent KEYCODE_DEL              # backspace
```

Aparelho com 3 botões: BACK/HOME/RECENTES funcionam via keyevent, não é preciso tocar nos botões de navegação.

### Digitar texto

```bash
adb shell input text 'usuario@teste.com'      # aspas simples; @ e . funcionam
adb shell input text 'Ola%smundo'             # %s = espaço
```

Caracteres especiais do shell (`& ( ) < > | ; $ ' " \ *`) quebram o comando: escape com `\` dentro de aspas, ou evite. **Acentos e "ç", "ã" NÃO funcionam com `input text`** (só ASCII). Opções [PESQUISA, VERIFICAR]:

1. Preferir dados de teste em ASCII (e-mail e senha da conta de teste sem acento). É o caminho mais simples.
2. [ADBKeyBoard](https://github.com/senzhk/ADBKeyBoard) (instala um IME): `adb shell ime set com.android.adbkeyboard/.AdbIME` e `adb shell am broadcast -a ADB_INPUT_TEXT --es msg 'ação'`. Exige instalar APK no aparelho (combine antes) e voltar ao teclado original depois (`adb shell ime set com.samsung.android.honeyboard/.service.HoneyBoardService`, valor lido neste aparelho).
3. scrcpy com `--keyboard=uhid` (`-K`): o humano digita do teclado do PC (inclusive acentos, conforme layout) ([README do scrcpy](https://github.com/Genymobile/scrcpy)).
4. Maestro `inputText` (seção 8); comportamento com Unicode no Android depende da versão, teste.

Limpar um campo: selecione e apague (`input keyevent KEYCODE_MOVE_END` e vários `KEYCODE_DEL`), ou `adb shell input keycombination 113 29` (CTRL+A, Android 12+) seguido de `KEYCODE_DEL` [PESQUISA, VERIFICAR].

### Slider "deslizar para finalizar" e gestos

Use `swipe` com duração lenta (400 a 800 ms) do início ao fim da trilha. Meça as extremidades na screenshot ou pelo `bounds` do elemento do slider:

```bash
adb shell input swipe 120 1350 600 1350 600     # do handle (x=120) até o fim (x=600), 600 ms
```

Se o gesto do app usa `PanResponder`/Reanimated, swipes muito rápidos (<150 ms) podem virar fling e não completar; swipes lentos e retos funcionam melhor. Pare-e-segure: `swipe x y x y 2000`.

### Boas práticas ao rolar listas

Faça um swipe por vez, espere ~500 ms, capture e leia. Rolagem por swipe longo pode sobrepassar o item.

---

## 6. Simular condições

Todos [PESQUISA], salvo indicação. Registre o estado inicial para restaurar depois.

### Rede e modo avião

```bash
adb shell svc wifi disable ; adb shell svc wifi enable
adb shell svc data disable ; adb shell svc data enable
adb shell cmd connectivity airplane-mode enable     # Android 11+; disable para voltar [VERIFICAR em Samsung]
adb shell settings get global airplane_mode_on      # [VALIDADO] leitura = 0
```

`settings put global airplane_mode_on 1` sozinho não aplica sem broadcast em versões novas; prefira `cmd connectivity airplane-mode`. Ao testar offline, lembre-se de que em USB o adb continua funcionando. Se o adb estiver por Wi-Fi, desligar o Wi-Fi derruba a conexão.

### Localização falsa (aparelho físico)

`adb emu geo fix` só existe em emulador. Em físico:

1. Instalar um app de mock location (ex.: "Fake GPS", "GPS JoyStick"), ativá-lo em Opções do desenvolvedor > "Selecionar app de localização fictícia", e iniciar a rota nele.
2. `adb shell appops set <pacote-do-mock> android:mock_location allow` ajuda a conceder a função sem abrir a tela [PESQUISA, VERIFICAR].
3. Para testes reais de corrida, a alternativa é caminhar/correr com o aparelho; GPS indoor costuma não fixar.

Instalar app de terceiros exige aprovação (regra do projeto: não instalar o que não foi combinado). Confirme se o app de teste aceita local mockada (apps que checam `isMock` rejeitam).

### Fonte, tema, rotação

```bash
adb shell settings get system font_scale             # [VALIDADO] 1.0
adb shell settings put system font_scale 1.3         # grande; voltar com 1.0
adb shell cmd uimode night                           # [VALIDADO] "Night mode: no"
adb shell cmd uimode night yes                       # escuro; no = claro; auto
adb shell settings put system accelerometer_rotation 0
adb shell settings put system user_rotation 1        # 0=retrato, 1=paisagem esquerda, 3=paisagem direita
adb shell wm density 360 ; adb shell wm density reset  # simular outra densidade (o aparelho já tem override 280; anote!)
```

Cuidado: neste aparelho existe `Override density: 280` (configuração do usuário). Nunca rode `wm density reset` ou `wm size reset` sem anotar e restaurar o valor original.

### Bateria

```bash
adb shell dumpsys battery                    # [VALIDADO] leitura
adb shell dumpsys battery set level 15       # simula 15 %
adb shell dumpsys battery set status 3       # 3 = descarregando
adb shell dumpsys battery unplug             # simula sem carregador
adb shell dumpsys battery reset              # SEMPRE restaurar ao fim
adb shell cmd battery set ac 0               # alternativa
adb shell dumpsys deviceidle force-idle      # modo Doze (reset: dumpsys deviceidle unforce)
```

### Segundo plano e processo morto

```bash
adb shell input keyevent KEYCODE_HOME                       # vai para segundo plano
adb shell am kill com.paceless.app                          # só mata se estiver em segundo plano (simula o sistema)
adb shell am send-trim-memory com.paceless.app RUNNING_CRITICAL   # simula pressão de memória
adb shell am force-stop com.paceless.app                    # mata de verdade (também para alarmes/jobs)
adb shell dumpsys activity processes | grep -A3 com.paceless.app   # [VALIDADO o comando existe; saída varia]
```

Depois de `am kill`, reabra pelo ícone/recentes e verifique se o treino em andamento foi restaurado (veja `docs/retomar-treino.md`).

---

## 7. Logs e depuração

```bash
adb logcat -c                                              # limpar antes do cenário
adb logcat -d -v time ReactNativeJS:V '*:S'                # console.log/erros do JS (tag ReactNativeJS; no Hermes aparece assim)
adb logcat -d -b crash                                     # [VALIDADO] buffer de crash (estava vazio)
adb logcat -d -s AndroidRuntime:E                          # exceções Java/Kotlin (crash nativo)
adb logcat -d | grep -iE "expo-updates|EXUpdates|ExpoUpdates"   # OTA
adb logcat -d | grep -E "FATAL|ANR in|Process: com.paceless.app"
adb logcat -d --pid=$(adb shell pidof -s com.paceless.app) # tudo do processo atual do app
adb logcat -v time -t 200                                  # últimas 200 linhas
adb logcat -b all -d > "$OUT/log.txt"                      # tudo para arquivo, depois filtre com grep
```

Dicas:

- `-d` imprime e sai (essencial para agente; sem `-d` o logcat bloqueia para sempre). Para seguir em tempo real use timeout: `timeout 30 adb logcat ...`.
- Crash do JS em release mostra `ReactNativeJS` com a mensagem e `AndroidRuntime` com `com.facebook.react.common.JavascriptException`. Stack traces minificados exigem sourcemap.
- Limite de buffer é pequeno (256 KB padrão); limpe com `-c` antes do cenário e leia logo depois.
- Verificar tela atual [VALIDADO]: `adb shell dumpsys activity activities | grep topResumedActivity` e `adb shell dumpsys window | grep mCurrentFocus`. No Paceless há uma única activity (`MainActivity`), então a "tela" do expo-router não aparece ali; use screenshot/dump de UI.
- Fonte: [logcat](https://developer.android.com/tools/logcat), [dumpsys](https://developer.android.com/tools/dumpsys).

---

## 8. Ferramentas de nível acima

| Ferramenta | Uso | Instalar? | Quando usar |
| --- | --- | --- | --- |
| **scrcpy** | Espelha e controla o aparelho no PC | já instalado (4.1) [VALIDADO] | Humano acompanha e interage; gravação |
| **Maestro** | Fluxos YAML de E2E | sim: CLI + Java 17+ | Roteiros repetíveis, esperas automáticas |
| **Appium** | Servidor WebDriver (UiAutomator2) | sim, pesado (Node, drivers) | Só se precisar de WebDriver/CI existente |

### scrcpy [flags confirmadas por `scrcpy --help` aqui e pela doc]

```bash
scrcpy -s RX8T10EZ26E                       # espelhar e controlar
scrcpy -S -w                                # --turn-screen-off, --stay-awake: espelha com a tela do aparelho apagada
scrcpy --no-control                         # só olhar, sem enviar input (seguro com agente rodando)
scrcpy --no-window --record="$OUT/s.mp4"    # grava sem abrir janela
scrcpy -m1024 --no-audio -K                 # menos resolução; teclado físico via UHID (acentos)
scrcpy --show-touches                       # mostra toques (-t)
```

Fontes: [README](https://github.com/Genymobile/scrcpy), [device.md](https://github.com/Genymobile/scrcpy/blob/master/doc/device.md). Não é adequado para o agente ver a tela (não há leitura direta de frames), mas é ótimo para o humano acompanhar. Cuidado: com o scrcpy aberto e controle ligado, o mouse/teclado do humano gera input e atrapalha o agente; combine com `--no-control`. Pode coexistir com `adb exec-out screencap`.

### Maestro [PESQUISA]

Fonte: [instalação CLI](https://docs.maestro.dev/maestro-cli/how-to-install-maestro-cli), [React Native](https://docs.maestro.dev/platform-support/react-native), [requisitos](https://docs.maestro.dev/getting-started/installing-maestro).

```bash
curl -fsSL "https://get.maestro.mobile.dev" | bash     # exige Java 17+ (aqui há Java 11: instalar JDK 17 antes)
maestro --help
maestro test flow.yaml
```

Pontos: a doc lista suporte a API 29, 30, 31, 33 e 34 (o aparelho é API 33, compatível); seleciona elementos por texto visível ou por `id:` (mapeado de `testID`), então vale a pena colocar `testID` nas telas; faz esperas automáticas de UI e retentativas, o que elimina boa parte dos `sleep`. Exemplo de fluxo mínimo:

```yaml
appId: com.paceless.app
---
- launchApp:
    clearState: true
- assertVisible: "Começar"
- tapOn: "Começar"
- takeScreenshot: /tmp/paceless-qa/onboarding
```

Vantagens para LLM: saída textual clara de pass/fail, fluxos curtos em YAML, menos coordenadas fixas. Desvantagens: precisa instalar, Java 17, pode competir com adb manual pelo aparelho (usa seu próprio driver instrumentado no aparelho). Para escolher o aparelho, use `ANDROID_SERIAL` ou confira `maestro test --help` (a doc consultada não confirmou a flag `--device`).

### Appium

Exige servidor Node, driver UiAutomator2 e configuração de capabilities; é maior que o necessário para este projeto. Considere apenas se houver necessidade de integrar com uma suíte WebDriver existente.

Recomendação: começar com adb puro (este guia); se os roteiros virarem repetitivos, adotar Maestro com `testID` nas telas; usar scrcpy `--no-control` para o humano acompanhar.

---

## 9. Roteiro-modelo ponta a ponta no Paceless [PESQUISA, adaptar às telas reais]

Pré-condições: aparelho livre (nenhum outro agente), conta de teste combinada com o time (nunca use dados pessoais), senha ASCII, `docs/ota.md` lido.

```bash
export PATH="$PATH:/home/jonatas/Android/Sdk/platform-tools" ANDROID_SERIAL=RX8T10EZ26E
OUT=/tmp/paceless-qa/$(date +%H%M%S); mkdir -p "$OUT"
shot() { adb exec-out screencap -p | convert png:- -resize 50% "$OUT/$1.png"; echo "$OUT/$1.png"; }

adb shell svc power stayon usb
adb shell input keyevent KEYCODE_WAKEUP
adb logcat -c
adb shell pm clear com.paceless.app
for p in ACCESS_FINE_LOCATION ACCESS_COARSE_LOCATION POST_NOTIFICATIONS; do adb shell pm grant com.paceless.app android.permission.$p; done

adb shell am force-stop com.paceless.app
adb shell am start -W -n com.paceless.app/.MainActivity; sleep 15       # 1o início: baixa OTA
adb shell am force-stop com.paceless.app
adb shell am start -n com.paceless.app/.MainActivity; sleep 8           # 2o início: OTA aplicada
shot 01-abertura
```

Ler `01-abertura.png`. Depois, ciclo para cada passo: agir, esperar, capturar, ler, decidir.

1. **Onboarding**: avançar com `tap.py "Continuar"` (ou o texto real), screenshot a cada tela. Pré-auth: Onboarding, Paywall, Auth, nesta ordem (`CLAUDE.md`).
2. **Paywall**: conferir presença; fechar/continuar conforme o fluxo (não concluir compra real).
3. **Login**: `tap.py "E-mail"`; `input text 'conta@teste.com'`; campo senha; `input text 'SenhaSemAcento1'`; `KEYCODE_ENTER` (ou botão). Se o teclado cobrir o botão, `KEYCODE_BACK` uma vez para fechar o teclado e capturar.
4. **Abas**: tocar em cada aba (por `content-desc`/texto), screenshot de cada uma; checar lista vazia vs. dados reais (sem mock).
5. **Treino**: iniciar treino (botão de iniciar), esperar o cronômetro, screenshot depois de alguns segundos; opcionalmente HOME e `am kill` para testar a retomada; reabrir e conferir.
6. **Finalizar**: gesto de deslizar (seção 5), confirmar tela de resumo e que o treino aparece no histórico.
7. **Logs**: `adb logcat -d -v time ReactNativeJS:V AndroidRuntime:E '*:S' > "$OUT/log.txt"` e `adb logcat -d -b crash`; reportar qualquer `FATAL`, `Error` ou aviso novo.
8. **Encerrar**: restaurar configurações alteradas (`dumpsys battery reset`, `font_scale 1.0`, `uimode night no` se mudou), `force-stop`, relatar com caminhos das screenshots.

### Boas práticas para o agente

- **Screenshot depois de cada ação** e leia a imagem antes de decidir. Sem ver, não afirme que passou.
- **Espere animações**: `sleep 0.5` a 1 s após cada toque, mais em transições de tela e rede. Prefira esperar por um elemento aparecer (loop com dump) a dormir fixo.
- **Não confie só em coordenadas fixas**: use o `bounds` do dump ou a posição lida na screenshot da rodada atual; o layout muda com teclado, fonte grande e conteúdo.
- **Um único agente por aparelho**; ver se há scrcpy/Maestro/outras sessões. Não rodar testes em paralelo no mesmo aparelho.
- **Limpar estado entre rodadas**: `pm clear`, e restaurar configurações de sistema alteradas.
- **Não gerar efeitos externos**: sem compras reais, sem enviar mensagens a terceiros, sem usar contas pessoais.
- **Falhas**: guarde screenshot + log de cada falha com horário; tente reproduzir uma vez antes de reportar.
- **Registrar o que foi feito**: comandos, versão do app (`dumpsys package`) e se a OTA foi aplicada.

---

## 10. Problemas comuns

| Sintoma | Causa e solução |
| --- | --- |
| `unauthorized` | Desbloqueie o aparelho e aceite o diálogo "Permitir depuração USB". Se não aparece: `adb kill-server`, revogar autorizações em Opções do desenvolvedor > "Revogar autorizações de depuração USB", reconectar o cabo. |
| `offline` | `adb kill-server && adb start-server`; trocar cabo/porta; reconectar. |
| `no devices/emulators found` | Cabo só de carga, depuração USB desligada, modo USB em "somente carregar". Regras udev no Linux (ver [doc](https://developer.android.com/studio/run/device#setting-up)). |
| `more than one device/emulator` | Usar `-s <serial>` ou `ANDROID_SERIAL`. |
| Tela preta no screenshot | Aparelho dormindo (`KEYCODE_WAKEUP`) ou janela segura (FLAG_SECURE). |
| Tela bloqueada | Ver 1.5; para PIN/biometria, o humano desbloqueia. |
| Teclado cobre campos/botões | `KEYCODE_BACK` fecha o teclado; role a tela; ou `adb shell settings put secure show_ime_with_hard_keyboard 0` [VERIFICAR]. Capture a tela depois de fechar. |
| `INSTALL_FAILED_USER_RESTRICTED` ou "instalar via USB" bloqueado | Em Xiaomi/MIUI: ative "Instalar via USB" e "Depuração USB (configurações de segurança)" (exige conta Mi e SIM). Em Samsung: desative "Auto Blocker" (Configurações > Segurança e privacidade) que bloqueia instalação via cabo; desative "Verificar apps via USB" se necessário. O scrcpy também avisa sobre a opção de segurança da Xiaomi ([README](https://github.com/Genymobile/scrcpy)). |
| `input text` com `&`, `(`, `;` quebra | Escape com `\` dentro de aspas; ou use ASCII simples. |
| Acentos ou "ç" não digitam | `input text` é só ASCII; ver seção 5 (ADBKeyBoard, scrcpy `-K`, dados ASCII). |
| `uiautomator dump` falha ("idle state") | Animação em andamento; esperar e repetir. Fallback: screenshot. |
| `INJECT_EVENTS permission` | Samsung/Xiaomi exigem "Depurar USB (configurações de segurança)" ou equivalente para `input`; em Samsung geralmente não. |
| App abre e fecha / diálogo "Application Error" | `adb logcat -d -b crash`, `AndroidRuntime:E`; checar OTA incompatível com o binário (runtime version). |
| OTA não aplicou | Abrir duas vezes (2.6) e checar rede; ver logs `expo-updates`. |
| `adb: command not found` | `export PATH="$PATH:/home/jonatas/Android/Sdk/platform-tools"`. |

---

## Referências

- [Android Debug Bridge](https://developer.android.com/tools/adb)
- [Logcat](https://developer.android.com/tools/logcat)
- [dumpsys](https://developer.android.com/tools/dumpsys)
- [Executar apps em dispositivo físico](https://developer.android.com/studio/run/device)
- [scrcpy](https://github.com/Genymobile/scrcpy) e [device.md](https://github.com/Genymobile/scrcpy/blob/master/doc/device.md)
- [Maestro: instalação](https://docs.maestro.dev/getting-started/installing-maestro), [CLI](https://docs.maestro.dev/maestro-cli/how-to-install-maestro-cli), [React Native](https://docs.maestro.dev/platform-support/react-native)
- [React Native: acessibilidade](https://reactnative.dev/docs/accessibility)
- [testID e resource-id (comunidade)](https://discuss.appium.io/t/react-native-ui-element-access-via-testid/7845)
