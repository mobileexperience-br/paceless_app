# Barra de navegação: riscos da navegação por gestos e do iPhone

Pesquisa feita em 2026-11-02, complementar a [barra-navegacao-android.md](./barra-navegacao-android.md).
Nada foi implementado. O código do `expo-navigation-bar` 58.0.4 e do React Native 0.88.1 foi lido
direto dos pacotes publicados no npm (`npm pack`), não de resumo.

## Resumo

- **Gestos:** no modo gestos o app **não controla de forma confiável** a cor da pílula. A documentação
  oficial diz que o sistema aplica "dynamic color adaptation": a pílula escurece sobre conteúdo claro e
  clareia sobre conteúdo escuro, conforme o que está atrás dela. No AOSP isso é feito por amostragem de
  luminância dos pixels. A flag `isAppearanceLightNavigationBars` (que o `NavigationBar` usa) é só uma
  dica, e perde para a amostragem. A mitigação real é de **layout**: garantir que o que está atrás da
  pílula tenha contraste claro (cor sólida do tema, ou gradiente sobre a foto), e usar `style` coerente
  com esse fundo para o caso em que o sistema respeita a flag.
- **3 botões:** com `enforceContrast: false` a barra fica transparente e a cor dos ícones vem de `style`.
  É aqui que o `NavigationBar` resolve de fato.
- **iPhone:** `expo-navigation-bar` é no-op. O componente renderiza `null` e as funções só dão
  `console.warn`. Nada quebra. O home indicator do iOS é adaptativo, e o cuidado é só de fundo e safe area.
- Nenhuma lib nova além de `expo-navigation-bar` é necessária. Detectar o modo gestos exigiria código
  nativo; a recomendação é **não detectar** e fazer o layout valer nos dois modos.

## 1. Navegação por gestos (Android)

### 1.1 A pílula acompanha `APPEARANCE_LIGHT_NAVIGATION_BARS`?

**Resposta curta: não de forma garantida.**

Fatos citáveis:

- Android Developers, guia de system bars, seção "Gesture navigation mode": ao mirar o Android 15 ou
  chamar `enableEdgeToEdge`, o sistema desenha a barra de gestos transparente e "applies dynamic color
  adaptation. [...] the handle in the navigation bar changes to a dark color if it's placed above light
  content, and vice-versa". O mesmo guia diz que "Transparent gesture navigation bars are always
  recommended" e que não se deve pôr fundo na barra de gestos.
  https://developer.android.com/design/ui/mobile/guides/foundations/system-bars
- Código do SystemUI (AOSP, `NavigationBar.java`): em modo gestual o sistema roda um
  `RegionSamplingHelper` sobre a região do home handle. O callback faz
  `getLightTransitionsController().setIconsDark(!isRegionDark, true)`. A amostragem só para quando o
  modo da barra é `MODE_OPAQUE`; nesse caso força ícones claros (`setIconsDark(false)`).
  https://github.com/aosp-mirror/platform_frameworks_base/blob/main/packages/SystemUI/src/com/android/systemui/navigationbar/views/NavigationBar.java
  (trechos `onBarTransition`, `onRegionDarknessChanged`, `setNavBarMode`, `isSamplingEnabled`).
- `WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS` (API 30) é descrita só como "changes the
  foreground color for light navigation bars so that the items on the bar can be read clearly". Não há
  promessa de efeito sobre a pílula.
  https://developer.android.com/reference/android/view/WindowInsetsController#APPEARANCE_LIGHT_NAVIGATION_BARS
- A própria doc do `expo-navigation-bar` diz que `setStyle` só tem efeito quando "the device navigation
  bar is using buttons" e `enforceContrast` é `false`. Não há nota específica sobre gestos.
  https://docs.expo.dev/versions/latest/sdk/navigation-bar/

Interpretação (inferência a partir das fontes acima, não medida em aparelho): a flag e a amostragem
escrevem no mesmo controlador de ícones. Em AOSP/Pixel a amostragem corre continuamente e tende a
prevalecer, então a pílula acompanha o **conteúdo atrás dela**, não o `style`. Se o conteúdo atrás tiver
contraste ruim (ex.: gradiente intermediário), a pílula pode ficar pouco legível, e nenhuma flag corrige.

### 1.2 Versões do Android e fabricantes

| Versão | O que muda (fonte) |
| --- | --- |
| Android 8 e 9 (API 26-28) | Não há navegação por gestos nativa nem `enforceNavigationBarContrast`. O `expo-navigation-bar` simula com `navigationBarColor = TRANSPARENT` (polyfill de `enforceContrast` na 57.0.1). Só barra de botões. |
| Android 10 (API 29) | Surgem a navegação por gestos e `Window.setNavigationBarContrastEnforced` / `android:enforceNavigationBarContrast`. |
| Android 11 (API 30) | Surge `WindowInsetsController` e `APPEARANCE_LIGHT_NAVIGATION_BARS`. Em versões anteriores o `WindowInsetsControllerCompat` cai para a flag antiga `SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR` (API 26). |
| Android 15 (API 35) | Com `targetSdk` 35+, edge-to-edge forçado: gestos transparentes, 3 botões com scrim translúcido. https://developer.android.com/develop/ui/views/layout/edge-to-edge |
| Android 16 (API 36) | O opt-out do edge-to-edge deixa de existir (já registrado na pesquisa anterior). |

Em todas as versões 10 a 16 o comportamento do modo gestos descrito pelo guia é o mesmo: barra
transparente + adaptação automática. O que varia é **a implementação do SystemUI de cada fabricante**.

**Samsung One UI: não encontrei fonte oficial nem issue confirmando** se o One UI respeita ou ignora a
flag no modo gestos. A busca (docs Samsung, GitHub, comunidade Samsung) só retornou pedidos de barra
transparente e PRs de apps RN que corrigem o sintoma "barra de 3 botões com cor errada" desligando o
scrim, sem relato de pílula. Tratar como **desconhecido** e testar em Galaxy com gestos ligados (o A12 do
projeto pode ser alternado em Configurações > Tela > Barra de navegação > Gestos de deslizar). Não
afirmar nada sobre One UI no código ou na doc do app.

Observação sobre bug de emulador: a doc do Expo avisa que no emulador do Android 15 `setStyle` pode não
ter efeito. Testar em aparelho.

### 1.3 `isNavigationBarContrastEnforced`: gestos x 3 botões

- Doc: "Sets whether the system should ensure that the navigation bar has enough contrast when a fully
  transparent background is requested." (`Window.setNavigationBarContrastEnforced`, API 29)
  https://developer.android.com/reference/android/view/Window
- Guia de edge-to-edge: para barra transparente "gesture navigation bar" basta edge-to-edge; para a de
  **3 botões** é preciso `setNavigationBarContrastEnforced(false)`, "otherwise there will be a translucent
  scrim applied". Ou seja, o scrim existe só nos 3 botões.
  https://developer.android.com/develop/ui/views/layout/edge-to-edge (seção "System bar protection")
- Consequência: `enforceContrast: false` é **inofensivo no modo gestos** (a barra já é transparente) e
  **necessário nos 3 botões**. O mesmo valor serve para os dois, sem ramificar por modo.
- Detalhe do RN 0.88.1 (`WindowUtil.kt`, `Window.enableEdgeToEdge()`): lê
  `android.R.attr.enforceNavigationBarContrast` do tema (padrão `true`), aplica em
  `isNavigationBarContrastEnforced` e **só chama `isAppearanceLightNavigationBars = !isDarkMode` quando
  o contraste está habilitado**. Com `enforceContrast: false` o RN **não define** a aparência inicial dos
  ícones; o primeiro valor vem do `windowLightNavigationBar` do tema (padrão claro/escuro do tema) até o
  JS chamar `setStyle`. Por isso o componente deve montar cedo (no `ThemedStack`), para o primeiro frame
  não sair com ícones errados.

### 1.4 Como o `expo-navigation-bar` 58.0.4 expõe isso

Lido em `src/NavigationBar.android.ts`, `android/.../NavigationBarModule.kt` e `plugin/`:

- **`style`** (prop e `setStyle`): valores `'light' | 'dark' | 'auto' | 'inverted'`. Convenção invertida
  em relação ao nome do fundo: `'light'` = ícones **claros** (para fundo escuro); `'dark'` = ícones
  **escuros** (para fundo claro). O módulo mapeia `style == "dark"` para
  `isAppearanceLightNavigationBars = true`.
  - Armadilha: `'auto'` e `'inverted'` resolvem por `Appearance.getColorScheme()` (tema **do sistema**),
    não pelo tema escolhido no app. Como o Paceless tem preferência própria (`ThemeProvider`), **passar
    sempre `'light'` ou `'dark'` explícito**, nunca `'auto'`.
  - Armadilha: o padrão da pilha vazia é `style: 'light'`.
- **`setStyle` aplica a aparência sempre**, também no modo gestos. No módulo:
  `isNavigationBarContrastEnforced = isContrastEnforced` (valor do tema) e depois
  `isAppearanceLightNavigationBars = hasLightBackground`. Como a amostragem do SystemUI pode sobrescrever
  (1.1), não há garantia de efeito visual na pílula.
- **Plugin** (`app.json`): `enforceContrast` (padrão `true`) grava `android:enforceNavigationBarContrast`
  (`tools:targetApi=29`) e `expoEnforceNavigationBarContrast` no `AppTheme`. `style` grava
  `android:windowLightNavigationBar`; `hidden` grava `expoNavigationBarHidden`. `barStyle` e
  `visibility` estão depreciados.
- **`hidden` / `setHidden`**: usa `systemBarsBehavior = BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE` e
  `hide/show(navigationBars())`. No modo gestos os gestos continuam funcionando com a barra oculta
  ("When the gesture navigation is enabled, the system gestures can be triggered regardless the
  visibility of system bars", doc de `BEHAVIOR_DEFAULT`). Esconder a pílula é possível, mas o app não
  precisa disso; **não usar `hidden`** no Paceless (a tela de treino precisa da barra para o usuário sair).
- **Visibilidade**: `getVisibilityAsync`, `useVisibility`, `addVisibilityListener` e
  `setVisibilityAsync` estão depreciados e inconsistentes entre si em Android recente (eventos usam a
  flag legada). Não usar.
- **Modais**: desde a 57.0.0 `setStyle`/`setHidden` são aplicados também às janelas dos `<Modal>` do RN
  (`ExtraWindowEventListener`). Novas janelas copiam a aparência atual da janela da activity em
  `onExtraWindowCreate`. O `ReactModalHostView` do RN 0.88 só sincroniza `isAppearanceLightStatusBars`
  (status), não a da barra de navegação, então quem cobre a barra de navegação do `Dialog` é o Expo.
  Consequência: o estilo da barra dentro do modal é o que estava ativo quando ele abriu; um `Dialog`
  escuro aberto sobre tela clara só muda se montar um `NavigationBar` dentro dele (ver 1.5).
- **Pilha**: último `NavigationBar` montado vence; ao desmontar volta o anterior (corrigido na 58.0.2).
  Atualização feita com `setImmediate` (fim do frame), então várias trocas no mesmo frame viram uma.
  No expo-router, telas empilhadas **continuam montadas**, então a tela de baixo não "solta" o controle
  ao ir para a de cima, e uma tela que volta ao foco não remonta. Por isso usar montagem condicionada ao
  foco (`useIsFocused`), como a pesquisa anterior já previa.
- `console.warn` e `UnavailabilityError`: só nas funções depreciadas e imperativas em plataformas não
  Android (ver seção 2).

### 1.5 Combinação mais robusta por tipo de tela

Princípio: **a cor atrás da barra é do app (conteúdo), o `style` só deve combinar com ela**. Em gestos o
sistema adapta sozinho; em 3 botões o `style` manda. Sempre `enforceContrast: false`.

| Tela | Fundo atrás da barra | `NavigationBar style` | Cuidado |
| --- | --- | --- | --- |
| Telas claras (tema claro) | `colors.background` / `colors.surface` claro, sólido | `dark` | Pintar a faixa inferior com o mesmo fundo (o `Screen` já faz via `SafeAreaView` com `bottom`). |
| Telas escuras (tema escuro) | fundo escuro sólido | `light` | Idem. |
| Tela de treino (sempre escura) | `palettes.dark.background` sólido | `light` | Hoje o `SafeAreaView` ignora `bottom` e a tela soma `insets.bottom` à mão; garantir que a faixa inferior seja a mesma cor escura sólida, sem gradiente claro. |
| Welcome (foto) | foto com overlay | `light` | A pílula (gestos) é decidida pela amostragem da foto. Garantir **overlay escuro uniforme** na parte inferior (gradiente que termina em escuro opaco o bastante), para a amostragem dar "região escura" e a pílula sair clara em qualquer aparelho, inclusive Samsung. Não depender do `style`. |
| Modais (`Dialog`, `WorkoutMenu`) | scrim escuro do próprio modal | `light` dentro do modal | `navigationBarTranslucent` já cobre a área. Montar um `NavigationBar style="light"` dentro do conteúdo do modal se o fundo atrás for escuro e a tela de baixo for clara. Verificar, pois a pilha é global e o modal compartilha o mesmo estado. |
| `SavingOverlay`, `SignInOverlay` | usam só `statusBarTranslucent` | herdam | Adicionar `navigationBarTranslucent` é decisão separada (não fazia parte do pedido). |

Regras gerais:

1. Sempre `enforceContrast: false` no plugin.
2. Sempre `style` explícito (`'light'` ou `'dark'`), derivado do tema do app, nunca `'auto'`.
3. Fundo sólido e opaco atrás da barra, sem faixas de transição de cor na região da pílula
   (a amostragem do AOSP trabalha por luminância média da região e fica instável em fronteiras).
4. Na foto do welcome, gradiente escuro garantido na base.
5. Não usar `hidden`.

### 1.6 Detectar gestos em runtime e vale tratar diferente?

Opções:

| Método | Disponível sem lib nova? | Observação |
| --- | --- | --- |
| `Settings.Secure.getInt(resolver, "navigation_mode")` (0 = 3 botões, 1 = 2 botões, 2 = gestos) | **Não**, exige módulo nativo. | Chave de configuração do sistema, não é constante pública do SDK. Funciona na prática em AOSP e na maioria dos fabricantes, mas não é contrato documentado. Não encontrei fonte oficial; tratar como não garantido. |
| Recurso `config_navBarInteractionMode` | Não, mesmo problema. | Interno do framework. |
| `WindowInsets.Type.tappableElement()` | Não, exige nativo. | API pública (AndroidX 1.5.0). Em gestos o inset tappable inferior é 0 e o de `systemGestures` é positivo; em 3 botões os dois valem a altura da barra. A doc do AndroidX não descreve isso na página da classe consultada; a distinção vem da doc do `getTappableElementInsets`, não confirmada aqui. |
| `useSafeAreaInsets().bottom` (heurística) | **Sim** (já instalado). | Gestos costumam dar inset pequeno (~16-24 dp) e 3 botões ~48 dp. É heurística: varia por aparelho, fabricante e orientação. Serve só para log/diagnóstico, não para decisão de produto. |

A própria doc antiga do `expo-navigation-bar` admitia: "there is currently no native Android API to
detect if 'Gesture Navigation' is enabled or not" (texto da doc/fonte de versões anteriores, citado pela
busca; não verifiquei se ainda consta na 58, e o código atual não tem nenhuma menção a gestos).

**Vale tratar diferente? Não.** Com fundo sólido do tema + `enforceContrast: false` + `style` coerente,
o resultado é correto nos dois modos: 3 botões usa o `style`, gestos usa a adaptação do sistema e o
fundo sólido já dá o contraste certo. Detectar o modo exigiria módulo nativo próprio, sem ganho visual.
Se um dia for necessário (ex.: relatório de pílula ilegível), medir com `insets.bottom` apenas para
telemetria.

## 2. iPhone (e iPad)

### 2.1 `expo-navigation-bar` no iOS

Confirmado no código do pacote 58.0.4 (`src/NavigationBar.ts`, resolvido no iOS/web):

- `NavigationBar(props)` retorna `null`.
- `NavigationBar.setStyle` e `NavigationBar.setHidden` só fazem
  `console.warn('... is only available on Android')`. Não lançam erro.
- `setVisibilityAsync`/`getVisibilityAsync` (depreciadas) também só dão `console.warn`; `getVisibilityAsync`
  devolve `'hidden'`. `addVisibilityListener` **lança** `UnavailabilityError` (uma razão a mais para não
  usá-la).
- A doc marca todas as APIs como "Supported platforms: Android".
  https://docs.expo.dev/versions/latest/sdk/navigation-bar/
- O plugin de config só escreve em `styles.xml` do Android; não toca em projeto iOS.

Portanto montar `<NavigationBar style=... />` em telas compartilhadas é seguro no iPhone. Só **não**
chamar `NavigationBar.setStyle(...)` imperativamente fora do componente, para não gerar
`console.warn` em dev no iOS; se precisar, guardar com `Platform.OS === 'android'`.

### 2.2 Home indicator e barra inferior

- No iOS não há barra de navegação do sistema colorível: o home indicator é uma barra fina desenhada
  pelo sistema por cima do conteúdo, e o app só controla **o que está atrás** dele. O app já usa
  `react-native-safe-area-context`, que reporta o inset inferior (34 pt em iPhone com home indicator, valor de memória).
- A cor do home indicator se adapta ao conteúdo atrás (comportamento do iOS; não consegui uma citação
  oficial do HIG com a frase exata, a página consultada não trouxe o texto). Mesma lógica do
  Android: **fundo sólido e coerente na faixa inferior**.
- Orientação da Apple: fundos e imagens podem ir até a borda; controles ficam dentro da safe area.
  https://developer.apple.com/design/human-interface-guidelines/layout (texto não retornou na consulta;
  conteúdo de memória, tratar como orientação geral).
- Status bar: `StatusBar` do `expo-status-bar` já cobre o topo. O componente de barra inferior não
  tem equivalente. Para o iOS não é preciso componente novo.
- Nas telas: `Screen` (SafeAreaView com `bottom`) pinta o fundo até a borda, o que já resolve. `welcome`
  usa foto de fundo na `View` raiz e `SafeAreaView` por cima, então a foto passa atrás do indicator;
  garantir o mesmo gradiente escuro na base (vale para o iOS também).

### 2.3 Tela de treino

- A tela usa `SafeAreaView edges={['top','left','right']}` e soma `insets.bottom` manualmente ao
  controle inferior. No iPhone isso mantém os botões acima do home indicator e o fundo escuro vai até a
  borda. Nenhuma mudança necessária só por causa do `NavigationBar`.
- Se algum dia houver vídeo/cronômetro "imersivo", o RN Screens oferece `autoHideHomeIndicator`
  (iOS; "whether the home indicator should prefer to stay hidden. Defaults to `false`"), via
  `screenOptions` do native stack. Não é necessário agora; mencionar apenas como opção.
  https://reactnavigation.org/docs/native-stack-navigator/
- Risco: o treino mantém o usuário com a tela ligada e tocando perto da borda inferior; manter os alvos
  de toque fora da zona de gesto do indicator (já é o caso ao usar `insets.bottom`).

### 2.4 iPad (`supportsTablet: true`)

- `app.json` tem `ios.supportsTablet: true` e `orientation: "portrait"`. Em iPad o app roda em tela
  cheia, Split View, Slide Over e (iPadOS 26) janelas redimensionáveis.
- O inset inferior em iPad com home indicator (iPad sem botão físico) é menor (cerca de 20 pt, valor de memória, não verificado); em
  janelas flutuantes ou Split View **pode ser 0**. Por isso nada deve depender de um valor fixo de
  inset, e sim de `useSafeAreaInsets()` (como já é).
- Em janelas de iPad menores que a tela, o conteúdo não encosta na borda do aparelho: o fundo atrás do
  indicator é o do próprio app, então a regra de "fundo sólido" continua valendo.
- Layout: a largura de iPad pode deixar o `welcome` com foto esticada. Fora do escopo da barra, mas
  vale incluir iPad no teste visual final. Não verifiquei se o iOS exige modos de orientação extras
  com `supportsTablet` e `orientation: portrait` (a App Store costuma exigir suporte a todas as
  orientações em iPad, exceto com `UIRequiresFullScreen`); confirmar com o time antes de publicar.

## 3. Recomendações para a implementação

1. **Instalar** `expo-navigation-bar` com `npx expo install expo-navigation-bar` (esperado `~58.0.4`).
   Nenhuma outra lib.
2. **Plugin** em `app.json`: `["expo-navigation-bar", { "enforceContrast": false }]`. Não usar as opções
   `style`, `hidden`, `barStyle`, `visibility`. Exige build nativo novo (sem OTA).
3. **Componente** `SystemBars` (arquivo pequeno, <= 200 linhas): recebe `scheme?: 'light' | 'dark'`,
   resolve com `useTheme()` quando ausente, renderiza `StatusBar` e `NavigationBar` com
   `style={scheme === 'dark' ? 'light' : 'dark'}` (ícones claros em fundo escuro). **Sempre explícito**,
   nunca `'auto'`/`'inverted'`. Nunca passar `hidden`. No iOS o `NavigationBar` é `null`; não precisa de
   guarda de plataforma.
4. **Montagem**:
   - `ThemedStack`: trocar o `StatusBar` por `SystemBars` (monta cedo, evita ícones errados no primeiro
     frame, já que o RN não define a aparência inicial quando o contraste está desligado).
   - `welcome`, `workout/[id]`, `workout/summary`: `SystemBars scheme="dark"` apenas enquanto a tela
     estiver focada (`useIsFocused`).
   - Modais escuros (`Dialog`, `WorkoutMenu`): `SystemBars scheme="dark"` dentro do modal; o Expo 57+
     aplica nas janelas de Modal.
5. **Layout (a mitigação real da pílula)**: faixa inferior com cor sólida do tema e, no `welcome`, um
   gradiente escuro garantido na base da foto. Sem faixas de transição de cor na região do indicator.
   Vale para Android (gestos) e iPhone.
6. **Não detectar** modo gestos. Se quiser telemetria, logar `insets.bottom`; não usar para decisão.
7. **Não usar** as APIs depreciadas (`setVisibilityAsync`, `getVisibilityAsync`, `useVisibility`,
   `addVisibilityListener`, `setStyle` solto) nem `hidden`.
8. **Testes** (quando o aparelho estiver livre; não feitos aqui):
   - Galaxy A12 em 3 botões e em gestos, tema claro e escuro, welcome, treino, `Dialog`.
   - Se possível um Pixel/emulador com Android 14 ou 16 (cuidado com o bug do emulador do Android 15).
   - iPhone com home indicator e um iPad em tela cheia e em Split View: conferir fundo na base e inset.
   - Anotar se a pílula do Samsung segue ou não o `style` (item que ficou sem fonte).
9. **Não verificado** (declarar no relatório final): comportamento do One UI no modo gestos; a
   frase oficial do HIG sobre a cor do home indicator; exigência de orientações no iPad.

## Fontes

- Android, edge-to-edge: https://developer.android.com/develop/ui/views/layout/edge-to-edge
- Android, system bars (design): https://developer.android.com/design/ui/mobile/guides/foundations/system-bars
- `Window.setNavigationBarContrastEnforced`: https://developer.android.com/reference/android/view/Window
- `WindowInsetsController`: https://developer.android.com/reference/android/view/WindowInsetsController
- `WindowInsetsCompat.Type`: https://developer.android.com/reference/androidx/core/view/WindowInsetsCompat.Type
- AOSP SystemUI `NavigationBar.java` (amostragem de luminância):
  https://github.com/aosp-mirror/platform_frameworks_base/blob/main/packages/SystemUI/src/com/android/systemui/navigationbar/views/NavigationBar.java
- Expo, `expo-navigation-bar`: https://docs.expo.dev/versions/latest/sdk/navigation-bar/
- Expo, código e changelog: https://github.com/expo/expo/tree/main/packages/expo-navigation-bar
- React Native 0.88, `WindowUtil.kt` e `ReactModalHostView.kt`:
  https://github.com/facebook/react-native/tree/main/packages/react-native/ReactAndroid/src/main/java/com/facebook/react/views
- React Navigation, native stack (`autoHideHomeIndicator`): https://reactnavigation.org/docs/native-stack-navigator/
