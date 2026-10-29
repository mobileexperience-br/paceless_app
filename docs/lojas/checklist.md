# Checklist consolidado de publicação

Resumo de [google-play.md](./google-play.md) e [app-store.md](./app-store.md).
"Onde resolve": **código** · **painel** (consoles das lojas, Supabase,
RevenueCat) · **documento** (texto/arquivo a produzir) · **Pedro** (decisão ou
ação dele como dono das contas).

Status: `[x]` já feito no repositório · `[ ]` pendente · `[?]` a verificar

## Já feito no repositório

| Item | Loja | Onde | Status |
|---|---|---|---|
| Exclusão de conta dentro do app (Edge Function `delete-account`) | Ambas | código | `[x]` |
| Restaurar compras no paywall | Apple (obrig.) / Play | código | `[x]` |
| Sign in with Apple (código, `usesAppleSignIn`) | Apple 4.8 | código | `[x]` |
| Links de Termos/Privacidade via env (`EXPO_PUBLIC_TERMS_URL`, `EXPO_PUBLIC_PRIVACY_URL`), no cadastro e em Ajuda | Ambas | código | `[x]` |
| Termos, Privacidade e Perguntas frequentes dentro do app (telas internas; usadas quando a URL da env não está definida) | Ambas | código | `[x]` |
| Localização "durante o uso" com serviço em primeiro plano (tipo `location`) e modo `location` no iOS; sem `ACCESS_BACKGROUND_LOCATION` | Ambas | código | `[x]` |
| Texto de permissão de localização em PT-BR | Apple / Play | código | `[x]` |
| Dados protegidos por RLS; tabelas em cascata na exclusão | Ambas | código | `[x]` |
| `bundleIdentifier` / `package` = `com.paceless.app` | Ambas | código | `[x]` |

## Código (para a trilha de código)

| Item | Loja | Onde | Status |
|---|---|---|---|
| Paywall: texto de renovação automática, duração/preço do plano, como cancelar | Ambas | código | `[x]` |
| Paywall: links de Termos e Privacidade (reusar `LegalNotice`) | Ambas | código | `[x]` |
| `ITSAppUsesNonExemptEncryption: false` em `ios.infoPlist` | Apple | código | `[x]` |
| `ios.privacyManifests` (required reason APIs de RN/AsyncStorage/RevenueCat etc.) | Apple | código | `[x]` |
| Tela de exclusão: avisar que a assinatura da loja não é cancelada junto | Apple / Play | código | `[x]` |
| Revogar token Sign in with Apple na exclusão | Apple | código | `[?]` |
| Conferir manifesto Android: sem `ACCESS_BACKGROUND_LOCATION`, com `FOREGROUND_SERVICE_LOCATION` e `POST_NOTIFICATIONS` apenas, sem `AD_ID` indevido; `targetSdk` >= 36 | Play | código | `[?]` |
| Decidir `supportsTablet` (hoje `true` exige capturas e UI de iPad; Pedro: iPad é secundário) | Apple | código / Pedro | `[ ]` |
| Aviso "não substitui orientação médica" no app | Ambas | código + documento | `[x]` |
| Perfis `production` do EAS com as variáveis (`EXPO_PUBLIC_*`) cadastradas (chave `goog_` e Google Client IDs feitos; conferir o restante) | Ambas | painel (EAS) | `[~]` |
| Reavaliar Data safety/App Privacy se entrar analytics, push, relógio ou compartilhamento | Ambas | documento | `[ ]` |

## Documentos e páginas web

| Item | Loja | Onde | Status |
|---|---|---|---|
| Política de privacidade publicada em URL pública | Ambas | documento ([rascunho](../legal/politica-de-privacidade.md)) + advogado | `[ ]` |
| Termos de uso / EULA publicados | Ambas | documento ([rascunho](../legal/termos-de-uso.md)) + advogado | `[ ]` |
| Página web de **pedido de exclusão de conta/dados** (sem app) | Play (obrig.) | documento + site | `[ ]` |
| E-mail e URL de suporte | Ambas | Pedro | `[ ]` |
| Textos da ficha (nome, subtítulo, descrições curta e longa, palavras-chave) PT-BR | Ambas | documento | `[ ]` |
| Capturas: celular (Play 2 a 8; iPhone 6.9"), feature graphic 1024x500, ícone 512 (Play) e 1024 (Apple) | Ambas | documento / design | `[ ]` |

## Painéis e contas

| Item | Loja | Onde | Status |
|---|---|---|---|
| Decidir tipo de conta (organização evita 12 testers x 14 dias): organização | Play | Pedro | `[x]` |
| Criar conta Google Play Console (US$ 25) e verificar identidade (organização MXPBR, verificada) | Play | Pedro | `[x]` |
| Criar conta Apple Developer (US$ 99/ano) | Apple | Pedro | `[ ]` |
| Teste fechado: 12 testers, 14 dias contínuos (se conta pessoal) | Play | Pedro | n/a (conta de organização) |
| Criar apps nas lojas com `com.paceless.app` (Play: criado em 21/10; Apple: sem conta) | Ambas | painel | `[~]` |
| Criar assinaturas (grupo, anual e mensal) e ligar ao RevenueCat (RevenueCat já ligado ao Play; produtos pendentes até o primeiro AAB) | Ambas | painel | `[~]` |
| Capability Sign in with Apple no App ID; provider Apple/Google no Supabase (Google feito com 4 Client IDs; Apple depende da conta) | Apple / ambas | painel | `[~]` |
| Data safety: preencher conforme [seção 3](./google-play.md#3-formulário-data-safety-segurança-dos-dados) | Play | painel | `[ ]` |
| URL de exclusão de dados no Play Console | Play | painel | `[ ]` |
| Declaração de serviço em primeiro plano (tipo Localização) com vídeo do treino com tela bloqueada | Play | painel + Pedro | `[ ]` |
| Justificar `UIBackgroundModes: location` nas notas do revisor (treino iniciado pelo usuário, indicador de localização visível, para ao finalizar) | Apple | painel | `[ ]` |
| Teste em aparelho: corrida com tela bloqueada, notificação e consumo de bateria | Ambas | Pedro | `[ ]` |
| Declaração de apps de saúde, anúncios, público-alvo, classificação ([Health Connect](./health-connect-healthkit.md)) | Play | painel | `[ ]` |
| Capability HealthKit no App ID, texto de revisão e rótulo Saúde/Fitness ([HealthKit](./health-connect-healthkit.md)) | Apple | painel | `[ ]` |
| App Privacy (rótulos) conforme [seção 4](./app-store.md#4-app-privacy-rótulos-de-nutrição) | Apple | painel | `[ ]` |
| Questionário de classificação etária (incluindo as novas perguntas) | Apple | painel | `[ ]` |
| Conta de revisão (usuário com premium) e notas para o revisor | Ambas | painel + Pedro | `[ ]` |
| `eas build` production + `eas submit` (credenciais ficam no EAS). Android: AAB versionCode 2 em build, não enviado | Ambas | painel / Pedro | `[~]` |
| Webhook do RevenueCat e secrets das Edge Functions em produção (função escrita, não publicada; faltam os segredos) | Ambas | painel | `[~]` |
| Encarregado (DPO) e contato LGPD definidos | LGPD | Pedro | `[ ]` |
| Revisão jurídica dos textos legais | Ambas | Pedro (advogado) | `[ ]` |

> Nota: os itens `[x]` acima refletem o estado de 21/10/2026. O app tem Termos, Privacidade e FAQ dentro dele (conteúdo em `content/legal/` e `content/faq.ts`, sem o aviso de rascunho). As lojas continuam exigindo **URLs públicas** de Termos/Privacidade (e de exclusão de dados no Play), que ainda precisam ser hospedadas e configuradas nas envs. Os textos seguem como rascunho e precisam de revisão jurídica; os placeholders (`[RAZÃO SOCIAL]`, `[DATA]` etc.) ainda não foram preenchidos.

## Bluetooth e cinta cardíaca (fase 2)

- [ ] Testar o pareamento com uma cinta real (Polar H10 ou equivalente) em iOS e Android, incluindo a prévia de bpm antes de salvar.
- [ ] Testar o treino com a tela bloqueada no iPhone: a FC continua chegando com `bluetooth-central`.
- [ ] Testar no Android com a tela bloqueada: confirmar se o serviço de localização mantém a conexão BLE (ver `docs/relogios.md`).
- [ ] Testar `neverForLocation` no Android 12+ com a cinta e confirmar que o scan funciona sem localização ligada.
- [ ] Testar desligar o Bluetooth no meio do treino e ligar de novo (o app deve reconectar sozinho).
- [ ] Testar a permissão negada e bloqueada, e o botão de abrir configurações.
- [ ] Conferir o texto de `NSBluetoothAlwaysUsageDescription` e a nota de App Review na seção "Textos de permissão" da App Store.
- [ ] Conferir que a migration `20261029140000_ble_heart_rate.sql` foi aplicada no projeto antes do build de produção.

