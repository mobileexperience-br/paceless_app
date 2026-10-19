# App Store: requisitos de publicação

Pesquisa da Trilha S1 (19/10/2026). Fontes oficiais linkadas; o que não foi
confirmado está como **a verificar**. Status consolidado em
[checklist.md](./checklist.md). Android: [google-play.md](./google-play.md).

Base: [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/).

## 1. Assinaturas auto-renováveis (3.1.1, 3.1.2)

Fontes: [Guidelines 3.1](https://developer.apple.com/app-store/review/guidelines/#in-app-purchase),
[App Store Subscriptions](https://developer.apple.com/app-store/subscriptions/).

| Exigência | Onde | Situação no Paceless |
|---|---|---|
| Compra digital via In-App Purchase (RevenueCat usa StoreKit) | App | OK |
| Título do plano, duração, preço (do `StoreKit`, não fixo no código) | Paywall | Parcial: título e preço vêm da loja; **duração** não aparece explicitamente |
| Texto de **renovação automática** e como cancelar (ex.: "Renova automaticamente até ser cancelada em Ajustes > Apple ID > Assinaturas") | Paywall | **Falta** |
| Preço mais destacado que o de qualquer valor "equivalente" (ex.: não destacar o mensal do anual de forma enganosa) | Paywall | Conferir design |
| Links funcionais para **Termos de Uso (EULA)** e **Política de Privacidade** | Paywall **e** metadados do App Store Connect | **Falta no paywall** (só no cadastro). Links lidos de `EXPO_PUBLIC_TERMS_URL` / `EXPO_PUBLIC_PRIVACY_URL` (precisam estar definidos nos builds) |
| Botão **Restaurar compras** | Paywall | Feito (`handleRestore`) |
| Política de privacidade no campo de URL do App Store Connect | Painel | Falta (precisa da URL) |
| EULA: usar o padrão da Apple ou o próprio em "License Agreement" / na descrição | Painel | Usar [termos de uso](../legal/termos-de-uso.md) próprios |
| Grupo de assinatura, localização PT-BR, captura de tela de revisão do paywall | Painel | Falta |
| Sem acesso a funções pagas que o usuário não pagou; sem bloquear "Restaurar" | App | OK |

Pendência no paywall: o fluxo é Onboarding > Paywall > Auth. O usuário compra
anônimo e a compra migra via `logIn`. Isso é aceito, mas o revisor precisa
conseguir ver o paywall com produtos carregados (os produtos precisam estar
"Ready to Submit" e anexados à versão).

## 2. Sign in with Apple (4.8)

Fonte: [Guideline 4.8](https://developer.apple.com/app-store/review/guidelines/#login-services).

- Como há login com Google, o app precisa oferecer um login equivalente que
  limite a coleta ao nome e e-mail, permita ocultar o e-mail e não rastreie
  para publicidade. **Sign in with Apple atende.** (Login por e-mail/senha
  próprio do app é isento, mas o Google exige o equivalente.)
- Código: feito (`expo-apple-authentication`, `usesAppleSignIn: true`).
- Painel: ativar a capability Sign in with Apple no App ID e configurar o
  provider no Supabase (ver [login-social.md](../login-social.md)).
- Se fizer login Apple, a Apple pode pedir **revogar o token** na exclusão da
  conta (5.1.1(v), seção 3). A Edge Function atual apaga o usuário no Supabase,
  mas **não revoga o token Apple** (a verificar se é exigido para login nativo
  por `signInWithIdToken`; a Apple recomenda a [REST API de revogação](https://developer.apple.com/documentation/sign_in_with_apple/revoke_tokens)).

## 3. Exclusão de conta (5.1.1(v))

Fontes: [Guideline 5.1.1](https://developer.apple.com/app-store/review/guidelines/#data-collection-and-storage),
[Oferecer exclusão de conta no app](https://developer.apple.com/support/offering-account-deletion-in-your-app/).

- Apps que criam conta devem permitir **iniciar a exclusão dentro do app**
  (não basta link para site ou e-mail). Feito: Perfil > Conta.
- Deve apagar a conta e dados associados, não só desativar. Feito (cascata).
- Se a Apple exigir confirmação adicional, tudo bem, desde que seja curta.
- Assinatura: deixar claro que excluir a conta **não cancela** a assinatura na
  Apple; orientar a cancelar em Ajustes (texto na tela de exclusão e nos
  termos). Conferir se a tela atual fala disso (a verificar).

## 4. App Privacy (rótulos de nutrição)

Fonte: [Detalhes de privacidade do app](https://developer.apple.com/app-store/app-privacy-details/).

Definições: "coletado" = dados que saem do aparelho para o servidor/terceiros
e são retidos mais que o necessário para atender à requisição. Prestadores
(Supabase, RevenueCat) entram como coleta do app. "Tracking" (rastreamento
para anúncios/dados de terceiros) = **Não**.

| Tipo de dado Apple | Coletado | Vinculado ao usuário | Usado para rastrear | Finalidade |
|---|---|---|---|---|
| Informações de contato > Endereço de e-mail | Sim | Sim | Não | Funcionalidade do app |
| Informações de contato > Nome | Sim | Sim | Não | Funcionalidade; personalização |
| Localização > Localização precisa | Sim (rota ao salvar) | Sim | Não | Funcionalidade do app |
| Saúde e fitness > Fitness | Sim (distância, duração, ritmo, rota) | Sim | Não | Funcionalidade; personalização |
| Saúde e fitness > Saúde | Não | n/a | n/a | n/a (sem dados médicos; objetivo/nível são preferências de treino, tratar como fitness) |
| Compras > Histórico de compras | Sim (status da assinatura) | Sim | Não | Funcionalidade do app |
| Identificadores > ID do usuário | Sim | Sim | Não | Funcionalidade do app |
| Identificadores > ID do dispositivo | **A verificar** (RevenueCat pode coletar identificador de instalação/IDFV) | Sim | Não | Funcionalidade do app |
| Dados de uso / Diagnóstico | Não hoje | n/a | n/a | Revisar se entrar analytics/crash |
| Informações financeiras | Não (Apple processa) | n/a | n/a | n/a |

Link da política de privacidade obrigatório. Se entrar analytics ou push,
refazer.

## 5. Privacy manifest (`PrivacyInfo.xcprivacy`)

Fontes: [Privacy manifest files](https://developer.apple.com/documentation/bundleresources/privacy-manifest-files),
[Expo: Apple privacy](https://docs.expo.dev/guides/apple-privacy/).

- Obrigatório declarar **motivos (reason codes)** para as "required reason
  APIs" (UserDefaults, timestamps de arquivo, boot time, espaço em disco,
  teclado ativo) usadas pelo app **e por SDKs**. Também listar domínios/dados
  de coleta.
- No Expo, configurar em `app.json`/`app.config.ts`, chave
  `expo.ios.privacyManifests`, com `NSPrivacyAccessedAPITypes` (par categoria +
  códigos, ex.: UserDefaults `CA92.1`) e, se quiser, `NSPrivacyCollectedDataTypes`.
- Os pacotes do Expo SDK trazem o próprio manifesto, mas a Apple pode não ler
  os de pods estáticos. Por isso o guia da Expo manda declarar no app as
  categorias usadas por dependências (React Native, AsyncStorage, RevenueCat,
  Supabase/GoogleSignIn). Rodar `npx expo install --fix` para ficar nas versões
  do SDK.
- Fluxo prático: gerar o build, abrir o relatório de privacidade do Xcode
  (Product > Archive > Generate Privacy Report) ou checar os e-mails "ITMS-91053"
  após o upload, e preencher os códigos pedidos. O `react-native-purchases` e o
  `@react-native-async-storage/async-storage` costumam exigir UserDefaults/
  timestamps (a verificar nas versões usadas).
- **Hoje o repositório não tem `ios.privacyManifests`.** Trabalho de código.

## 6. Textos de permissão (purpose strings)

- Localização: `NSLocationWhenInUseUsageDescription` já configurada via plugin
  `expo-location`: "O Paceless usa sua localização durante o treino para medir
  distância e ritmo." Em PT-BR, clara e específica (guideline 5.1.1(ii)).
- Não declarar "Always" nem Motion: o plugin já está com `false`. Conferir no
  `Info.plist` gerado que `NSLocationAlwaysAndWhenInUseUsageDescription` não
  aparece.
- Se o app não pedir permissão de localização no primeiro uso sem contexto
  (hoje pede ao iniciar treino), está dentro das regras.
- Adicionar tradução EN do texto se o app for lançado em outros países.

## 7. Conta demo para a revisão (2.1, 5.1.1)

Fonte: [App Review Information](https://developer.apple.com/help/app-store-connect/reference/app-information/app-review-information).

- Fornecer usuário e senha e-mail/senha de uma conta pronta (e-mail
  confirmado, onboarding feito, assinatura `premium` quando possível via
  sandbox/ajuste manual) no campo "Sign-in required".
- Notas: explicar fluxo Onboarding > Paywall > Cadastro, que a localização só é
  pedida ao iniciar o treino, que a compra usa sandbox e onde está a exclusão
  de conta. Colocar contato telefone + e-mail (`[E-MAIL DE CONTATO]`).
- Backend de produção precisa estar no ar durante a revisão.

## 8. Classificação etária

Fonte: [Valores e definições de classificação etária](https://developer.apple.com/help/app-store-connect/reference/app-information/age-ratings-values-and-definitions).

- A Apple usa desde 2025/26 as faixas **4+, 9+, 13+, 16+, 18+** e questionário
  novo (prazo original 31/01/2026, já passou: é preciso responder para enviar
  atualização). Em julho/2026 entraram perguntas sobre redes sociais/feeds de
  conteúdo de usuário; tornam-se obrigatórias em setembro/2026 (a verificar no
  [aviso oficial](https://developer.apple.com/news/)).
- Respostas esperadas para o Paceless: sem violência, sexo, jogos de azar,
  conteúdo gerado por usuário, chat ou feed. Perguntas de "temas médicos ou de
  bem-estar": o app oferece treino e planos de corrida, sem aconselhamento
  médico; responder com cautela (marcar o item de saúde/bem-estar se
  existir) e conferir a faixa resultante. Esperado: 4+ ou 9+.
- Se o compartilhamento em redes entrar, reavaliar.

## 9. Capturas de tela e metadados

Fonte: [Especificações de capturas de tela](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications) (valores abaixo vêm de fontes secundárias; conferir na página).

| Item | Especificação |
|---|---|
| iPhone 6.9" (principal) | 1320x2868 (ou 1290x2796) px, retrato; 1 a 10 imagens, PNG/JPEG. As demais telas escalam a partir desta |
| iPad 13" (necessário, pois `supportsTablet: true`) | 2064x2752 (ou 2048x2732) px. **Dica:** se não for entregar boa UI de tablet, setar `ios.supportsTablet: false` e evitar essas capturas |
| Nome (30), subtítulo (30), texto promocional (170), descrição (4000), palavras-chave (100) | PT-BR |
| Categoria | Saúde e fitness (principal) |
| URL de suporte | obrigatória |
| URL de marketing | opcional |
| Ícone | 1024x1024 sem transparência (EAS usa `assets/icon.png`; conferir) |
| Direitos autorais, contato de revisão | preencher |

## 10. Conformidade de exportação (criptografia)

Fonte: [Complying with Encryption Export Regulations](https://developer.apple.com/documentation/security/complying-with-encryption-export-regulations).

- O app usa só HTTPS/TLS padrão do sistema (isento). Declarar no `app.json`
  `expo.ios.infoPlist.ITSAppUsesNonExemptEncryption: false` para pular o
  questionário a cada build. **Hoje não está no `app.json`.** Se algum SDK
  trouxer criptografia própria não isenta, rever (a verificar).
- Para distribuição no Brasil e outros países, a isenção padrão cobre uso de
  criptografia só para autenticação/HTTPS.

## 11. Outros itens

| Item | Nota |
|---|---|
| Conta Apple Developer | Individual ou Organização (D-U-N-S); US$ 99/ano. Organização mostra o nome da empresa na loja |
| Versão do SDK/Xcode | Apple exige uploads com o SDK vigente (a verificar a regra do ano; EAS Build usa imagens atualizadas) |
| Funcionalidade mínima (4.2) | App com plano, treino, histórico; evitar "app vazio". Sem mock data |
| Saúde (1.4.1) | Dados de saúde e medições precisam ser razoavelmente precisos; avisos de que não substitui orientação médica |
| Privacidade (5.1.1) | Pedir só os dados necessários; política acessível dentro do app (Ajuda > Política de privacidade já existe) |
| TestFlight | Teste interno sem revisão; externo exige revisão beta |
