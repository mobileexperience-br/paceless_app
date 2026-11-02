# Barra de navegação do Android acompanhando o app

Pesquisa feita em 2026-11-02. Nada foi implementado nem instalado.

## Resumo

- O app já está em edge-to-edge (`edgeToEdgeEnabled=true`, `targetSdkVersion` 36, tema com
  `navigationBarColor` transparente). O que pinta a barra de cinza-claro é o **scrim de
  contraste** que o Android aplica por padrão na navegação por 3 botões. Não é falta de
  edge-to-edge.
- Para tirar o scrim é preciso desligar `enforceNavigationBarContrast` no tema nativo. Isso só
  se faz pelo plugin do `expo-navigation-bar` (ou editando o `styles.xml`), então **exige build
  nativo novo**. Por OTA não dá.
- Depois do build, a cor dos ícones (claros ou escuros) se troca em JavaScript, por tela, com o
  componente `<NavigationBar style="..." />`, e isso sim vai por OTA.
- Recomendação: `expo-navigation-bar` `~58.0.4` + um componente fino ligado ao tema. Nenhuma
  outra biblioteca.

## 1. Estado atual do projeto

| Item | Situação |
| --- | --- |
| `app.json` | `userInterfaceStyle: "automatic"`. Sem `edgeToEdgeEnabled`, sem `androidNavigationBar` (nenhum dos dois precisa existir no SDK 58). `android.backgroundColor` ausente (docs/ota.md diz que ficou para o próximo build). |
| `expo-build-properties` | `compileSdkVersion` 37, `targetSdkVersion` 36, `minSdkVersion` 26. |
| `android/gradle.properties` (gerado pelo prebuild, pasta ignorada pelo git) | `edgeToEdgeEnabled=true`, `newArchEnabled=true`. |
| `android/.../styles.xml` (gerado) | `AppTheme` com `android:statusBarColor` e `android:navigationBarColor` transparentes. Não há `enforceNavigationBarContrast`. |
| Dependências relevantes | `expo-status-bar ~58.0.4`, `expo-system-ui ~58.0.7`, `react-native-safe-area-context ~5.10.1`, `react-native-screens ~4.30.1`, `react-native 0.88.1`. **Não** há `expo-navigation-bar` nem `react-native-edge-to-edge`. |
| `expo-system-ui` | `hooks/useWindowBackground.ts` chama `setBackgroundColorAsync(colors.background)`. Só pinta o fundo da janela (`decorView`); não mexe na barra de navegação. |
| Status bar | `components/ThemedStack.tsx` usa `<StatusBar style={isDark ? 'light' : 'dark'} />`. `welcome.tsx`, `workout/[id].tsx` e `workout/summary.tsx` forçam `style="light"`. |
| Safe area | `SafeAreaProvider` na raiz (`app/_layout.tsx`). `Screen` usa `SafeAreaView` com os quatro lados por padrão e pinta o fundo do próprio `SafeAreaView`. `welcome.tsx` usa imagem de fundo em `View` raiz + `SafeAreaView` por cima. |
| Barra de abas | `app/(app)/(tabs)/_layout.tsx` já soma `insets.bottom` na altura e no `paddingBottom` e usa `colors.surface` de fundo, então a cor do app já passa por trás da barra do sistema. |
| Tema | `ThemeProvider` resolve claro/escuro (preferência ou sistema) e entrega um `ThemeScope`. `ThemeScope scheme="dark"` é usado em `workout/[id].tsx`, `workout/summary.tsx` e `Dialog`. |
| Modais | `Dialog` e `WorkoutMenu` usam `<Modal statusBarTranslucent navigationBarTranslucent>` com `ModalSafeArea`. `SavingOverlay` e `SignInOverlay` usam só `statusBarTranslucent`. |

Fato sobre o código do React Native 0.88.1 instalado: `WindowUtil.kt` define
`LightNavigationBarColor = argb(0xe6, 0xFF, 0xFF, 0xFF)` e `DarkNavigationBarColor =
argb(0x80, 0x1b, 0x1b, 0x1b)`, as cores do scrim da plataforma. O cinza-claro visto no Galaxy A12
é compatível com o scrim claro (branco a 90%) sobre um app escuro.

Isso é uma inferência, não foi medido no aparelho. Confirmar no teste (seção 6).

## 2. Como funciona no Android 15/16 e quais são as opções

### Regras da plataforma

- Com `targetSdk` 35 ou maior, o app é edge-to-edge no Android 15+ e, no Android 16, o opt-out
  deixa de existir. O RN 0.88 liga o mesmo comportamento nos Androids mais antigos pelo
  `edgeToEdgeEnabled=true`, que é o caso do Android 13 do A12.
  Fonte: https://developer.android.com/develop/ui/views/layout/edge-to-edge
- Padrão do sistema: barra de status e barra de gestos transparentes; **a barra de 3 botões fica
  translúcida (scrim)**. Para ela ficar transparente: `Window.setNavigationBarContrastEnforced(false)`
  (no tema: `android:enforceNavigationBarContrast=false`, API 29+). Mesma página.
- Navegação por gestos: a barra já é transparente; só a "pílula" muda de cor conforme
  `isAppearanceLightNavigationBars`. Não há scrim.
- Ícones: `WindowInsetsController.isAppearanceLightNavigationBars` (true = ícones escuros, para
  fundo claro). Mesma página, seção "System bar icons".
- Abaixo do Android 10 não existe o atributo de contraste; o `expo-navigation-bar` simula com
  `navigationBarColor` transparente (minSdk do app é 26, então o caso Android 8 e 9 existe).

### Opções avaliadas

| Opção | Estado em 2026 | Serve? |
| --- | --- | --- |
| `expo-navigation-bar` `~58.0.4` | Mantida pela Expo. Desde a 56 expõe `<NavigationBar style hidden />`, `NavigationBar.setStyle`, `setHidden`, e a opção `enforceContrast` no config plugin. | **Sim.** É o que resolve o problema. |
| Funções antigas do `expo-navigation-bar` (`setBackgroundColorAsync`, `setBorderColorAsync`, `setButtonStyleAsync`, `setPositionAsync`, `setBehaviorAsync` e os getters) | Viraram no-op na 55.0.8 e foram **removidas na 56.0.0**. Também saíram as opções de plugin `backgroundColor`, `borderColor`, `behavior`, `position`. | Não. Cor de fundo da barra não existe mais; a barra é transparente e o fundo vem do conteúdo do app. |
| `setVisibilityAsync`, `getVisibilityAsync`, `useVisibility`, `addVisibilityListener`, `setStyle` solto | Depreciadas na 56 (usar o componente e `NavigationBar.setHidden`). | Não usar. |
| `react-native-edge-to-edge` (e o `SystemBars` dela) | **Depreciada** pelo próprio autor: o README manda usar o `edgeToEdgeEnabled=true` do RN (0.86+) e `@zoontek/react-native-navigation-bar` para o estilo. O `expo-navigation-bar` 56 removeu a dependência dela. | Não. |
| `expo-system-ui` | `setBackgroundColorAsync` só pinta o fundo da janela. Útil como pano de fundo contra flash/overscroll; não controla a barra. | Já está no app; manter. |
| `StatusBar` do `expo-status-bar` | Controla só a barra de status. | Não mexe na barra de navegação. |
| API nativa do RN (`StatusBar`, `Modal navigationBarTranslucent`) | Não há API do RN para o contraste nem para o estilo dos ícones da barra de navegação. | Insuficiente sozinha. |
| Escrever módulo nativo próprio | Possível, mas reimplementa o que o `expo-navigation-bar` já faz. | Desnecessário. |

Fontes:
- https://docs.expo.dev/versions/latest/sdk/navigation-bar/
- https://docs.expo.dev/develop/user-interface/system-bars/
- Changelog: https://github.com/expo/expo/blob/main/packages/expo-navigation-bar/CHANGELOG.md
- Código Android: https://github.com/expo/expo/blob/main/packages/expo-navigation-bar/android/src/main/java/expo/modules/navigationbar/NavigationBarModule.kt
- Plugin: https://github.com/expo/expo/blob/main/packages/expo-navigation-bar/plugin/src/withNavigationBar.ts
- Depreciação da lib: https://github.com/zoontek/react-native-edge-to-edge

### O que o `expo-navigation-bar` 58 faz (lido no código-fonte)

- Plugin: com `enforceContrast: false`, grava no `AppTheme` os itens
  `android:enforceNavigationBarContrast=false` (e `expoEnforceNavigationBarContrast=false` para o
  Android 8 e 9). O padrão do plugin é `true`.
- No `onCreate` da activity, um listener lê o atributo e chama `isNavigationBarContrastEnforced =
  false` antes do JS subir. Ou seja, o scrim some já na abertura, sem piscar.
- `setStyle('light' | 'dark')` ajusta `isAppearanceLightNavigationBars`. `'dark'` = ícones
  escuros (fundo claro), `'light'` = ícones claros (fundo escuro). A doc diz que só tem efeito com
  botões e `enforceContrast` falso; o código aplica a aparência sempre, então a pílula do modo
  gestos provavelmente também troca (verificar no aparelho).
- Desde a 57, `setStyle` e `setHidden` também são aplicados às janelas de `<Modal>` do RN
  (`ExtraWindowEventListener`). Isso cobre `Dialog` e `WorkoutMenu`.
- O componente funciona em pilha, igual ao `StatusBar`: vale a props do último montado, e ao
  desmontar volta ao anterior (bug de restauração corrigido na 58.0.2). No iOS o componente
  renderiza `null`; as funções imperativas apenas dão `console.warn`.
- Aviso da doc: no emulador do Android 15 `setStyle` pode não ter efeito por bug do emulador;
  testar em aparelho ou outra versão.
- Peer dependencies: `expo`, `react`, `react-native` (`*`). Sem dependência nativa extra.

## 3. Recomendação

**Usar `expo-navigation-bar` `~58.0.4` (instalar com `npx expo install expo-navigation-bar`) e
um componente `SystemBars` que liga o tema ao status bar e à barra de navegação.**

Passos, em ordem:

1. **Plugin** em `app.json`: `["expo-navigation-bar", { "enforceContrast": false }]`. Isso torna
   a barra de 3 botões transparente, e a imagem do `welcome` e as cores do app passam a
   aparecer por trás dela.
2. **Componente** (ex.: `components/SystemBars.tsx`), lendo `useTheme()`:
   `<StatusBar style={isDark ? 'light' : 'dark'} />` e
   `<NavigationBar style={isDark ? 'light' : 'dark'} />`. Aceitar um `scheme` opcional para as
   telas que forçam um tema sem passar por `ThemeScope`.
3. **Onde montar:**
   - `ThemedStack`: substitui o `StatusBar` atual. Cobre tema claro e escuro do app.
   - `welcome.tsx`: `scheme="dark"` (foto escura, ícones claros). Montar apenas com a tela
     focada (`useIsFocused()` do expo-router), pois a pilha só olha a ordem de montagem.
   - `workout/[id].tsx` e `workout/summary.tsx`: já dentro de `ThemeScope scheme="dark"`; trocar
     o `StatusBar style="light"` por `SystemBars` (também focado).
   - Telas das abas ficam sob o `ThemedStack`; não precisam de nada, porque o tema é o mesmo.
   - `plan-paywall` (modal de pilha) e `onboarding`: só precisam de componente próprio se o fundo
     for diferente do tema.
4. **Modais RN** (`Dialog`, `WorkoutMenu`): como o módulo aplica o estilo às janelas de Modal, em
   geral herdam o que está ativo. O `Dialog` com `tone="dark"` sobre app claro tem scrim escuro
   embaixo; avaliar se vale um `SystemBars` dentro dele. Se sim, é um uso no `Dialog`, mas não
   fazer antes de ver no aparelho.
5. **Safe area:** nada a mudar na estrutura. A barra de abas já soma `insets.bottom`, o `Screen`
   já reserva a borda inferior, `Dialog` e `WorkoutMenu` já usam `insets.bottom`. O que muda é
   visual: por trás do inset passa a aparecer a cor da própria tela (já pintada pelo
   `SafeAreaView` e pelo `ThemedStack`) em vez do cinza do scrim. Telas que usam `edges` sem
   `bottom` (workout usa `['top','left','right']`) precisam ser olhadas: o conteúdo e os botões
   inferiores dessa tela já usam `insets.bottom` manualmente (`useSafeAreaInsets` em
   `workout/[id].tsx`), então devem ficar certos, mas confirmar.
6. **Manter** `useWindowBackground` (expo-system-ui). Continua útil como fundo da janela.

### Build e OTA

- Plugin novo e módulo nativo novo: muda o fingerprint (`runtimeVersion.policy: "fingerprint"`).
  **Precisa de build novo** (EAS). OTA para o build atual não chega.
- Depois do build, ajustes de cor, telas onde montar o componente e troca de `light`/`dark`
  entram por OTA normalmente, desde que o fingerprint não mude.
- Aproveitar o mesmo build para `android.backgroundColor` e outras pendências citadas em
  `docs/ota.md`.
- Regra do projeto: não instalar biblioteca sem aprovação. `expo-navigation-bar` é um módulo do
  próprio SDK 58 (`bundledNativeModules.json` lista `~58.0.4`), mas ainda assim precisa do
  "sim" explícito.

## 4. Riscos

| Risco | Detalhe e mitigação |
| --- | --- |
| iOS | Nada muda. O componente é `null` no iOS. Usar o componente e evitar `NavigationBar.setStyle(...)` imperativo, que dá `console.warn` fora do Android. |
| Tela de treino | Força `ThemeScope scheme="dark"`, mas o tema do app pode ser claro. Se o componente não estiver focado/desmontado ao sair, a barra fica com ícones claros sobre tela clara. A pilha restaura ao desmontar, mas telas empilhadas por baixo continuam montadas, então use render condicionado a foco. |
| Telas que ficam montadas (abas, pilha) | A pilha segue a ordem de montagem, não o foco. Mesma limitação que o `StatusBar` já tem hoje. Mitigar com `useIsFocused()` onde o estilo diverge do tema. |
| Modais | `Modal` abre uma janela própria. Desde a 57 o módulo copia estilo para elas, mas `navigationBarTranslucent` precisa continuar nos modais que desenham sob a barra. `SavingOverlay` e `SignInOverlay` não têm `navigationBarTranslucent`; conferir como ficam. Vale a pena revisar com o scrim do `Dialog` por cima. |
| Barra de 3 botões ocupa área | Com scrim desligado, os botões ficam sobre o conteúdo. Controles tocáveis no fim da tela precisam respeitar o inset (o app já faz). Conteúdo de baixo contraste (ex.: texto sobre foto clara) pode ficar com ícones ilegíveis; a escolha `light`/`dark` tem de seguir o que está realmente atrás. |
| Android 8 e 9 (minSdk 26) | Sem atributo de contraste; o módulo usa `navigationBarColor` transparente. Testar se houver aparelho. |
| Android 15 emulador | Bug conhecido: `setStyle` pode não ter efeito. Validar em aparelho real. |
| Pílula de gestos | A doc condiciona `setStyle` a botões + contraste desligado. Se a pílula de gestos não trocar de cor, é limitação a aceitar (o sistema escolhe sozinho pelo tema). |
| Splash | O tema da splash já tem barra transparente; com contraste desligado ela deve combinar. Conferir no primeiro frame. |
| Inferência não medida | Que o cinza vem do scrim está inferido do código; confirmar com a ordem de teste abaixo. |

## 5. Estimativa de esforço

- Código: cerca de meio dia (plugin, componente `SystemBars`, trocar `StatusBar` em 4 lugares,
  foco nas telas que divergem). Cabe em arquivos pequenos; não passa de 200 linhas.
- Build nativo no EAS (Android): 1 build, tempo de fila.
- Teste em aparelho: de 1 a 2 horas, em A12 (Android 13, 3 botões), um aparelho com gestos e, se
  possível, um Android 15/16.
- Total: cerca de 1 dia, com 1 build.

## 6. Plano de verificação

1. Antes de mexer: print da barra no A12 para registrar o cinza (confirma a hipótese do scrim).
2. Build com o plugin e `enforceContrast: false`: a barra deve ficar transparente em todas as
   telas, mostrando a foto no `welcome`.
3. Com o componente: ícones claros em telas escuras, escuros em claras, nos dois temas do app e
   no tema do sistema.
4. Fluxos: `welcome` para login, abas, treino (`workout/[id]` e `summary`), `plan-paywall`,
   `Dialog`, `WorkoutMenu`, voltar de cada um.
5. `npx tsc --noEmit` e `npx eslint .` ao fim (regra do projeto).

## Decisões fora do pedido

- Nada foi alterado no app. Só este arquivo foi criado.
- A recomendação de usar `useIsFocused` e de não tratar os modais antes do teste é minha.
- O CLAUDE.md não foi editado. Sugestão de regra permanente: "estilo da barra de status e da barra
  de navegação só pelo componente `SystemBars`; nunca chamar `StatusBar` ou `NavigationBar`
  direto numa tela".
