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
| Localização só em primeiro plano, sem background nem foreground service | Ambas | código | `[x]` |
| Texto de permissão de localização em PT-BR | Apple / Play | código | `[x]` |
| Dados protegidos por RLS; tabelas em cascata na exclusão | Ambas | código | `[x]` |
| `bundleIdentifier` / `package` = `com.paceless.app` | Ambas | código | `[x]` |

## Código (para a trilha de código)

| Item | Loja | Onde | Status |
|---|---|---|---|
| Paywall: texto de renovação automática, duração/preço do plano, como cancelar | Ambas | código | `[ ]` |
| Paywall: links de Termos e Privacidade (reusar `LegalNotice`) | Ambas | código | `[ ]` |
| `ITSAppUsesNonExemptEncryption: false` em `ios.infoPlist` | Apple | código | `[ ]` |
| `ios.privacyManifests` (required reason APIs de RN/AsyncStorage/RevenueCat etc.) | Apple | código | `[ ]` |
| Tela de exclusão: avisar que a assinatura da loja não é cancelada junto | Apple / Play | código | `[?]` |
| Revogar token Sign in with Apple na exclusão | Apple | código | `[?]` |
| Conferir manifesto Android: sem `ACCESS_BACKGROUND_LOCATION`, sem `FOREGROUND_SERVICE`, sem `AD_ID` indevido; `targetSdk` >= 36 | Play | código | `[?]` |
| Decidir `supportsTablet` (hoje `true` exige capturas e UI de iPad) | Apple | código / Pedro | `[ ]` |
| Aviso "não substitui orientação médica" no app | Ambas | código + documento | `[ ]` |
| Perfis `production` do EAS com as variáveis (`EXPO_PUBLIC_*`) cadastradas | Ambas | painel (EAS) | `[ ]` |
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
| Decidir tipo de conta (organização evita 12 testers x 14 dias) | Play | Pedro | `[ ]` |
| Criar conta Google Play Console (US$ 25) e verificar identidade | Play | Pedro | `[ ]` |
| Criar conta Apple Developer (US$ 99/ano) | Apple | Pedro | `[ ]` |
| Teste fechado: 12 testers, 14 dias contínuos (se conta pessoal) | Play | Pedro | `[ ]` |
| Criar apps nas lojas com `com.paceless.app` | Ambas | painel | `[ ]` |
| Criar assinaturas (grupo, anual e mensal) e ligar ao RevenueCat | Ambas | painel | `[ ]` |
| Capability Sign in with Apple no App ID; provider Apple/Google no Supabase | Apple / ambas | painel | `[ ]` |
| Data safety: preencher conforme [seção 3](./google-play.md#3-formulário-data-safety-segurança-dos-dados) | Play | painel | `[ ]` |
| URL de exclusão de dados no Play Console | Play | painel | `[ ]` |
| Declaração de apps de saúde, anúncios, público-alvo, classificação | Play | painel | `[ ]` |
| App Privacy (rótulos) conforme [seção 4](./app-store.md#4-app-privacy-rótulos-de-nutrição) | Apple | painel | `[ ]` |
| Questionário de classificação etária (incluindo as novas perguntas) | Apple | painel | `[ ]` |
| Conta de revisão (usuário com premium) e notas para o revisor | Ambas | painel + Pedro | `[ ]` |
| `eas build` production + `eas submit` (credenciais ficam no EAS) | Ambas | painel / Pedro | `[ ]` |
| Webhook do RevenueCat e secrets das Edge Functions em produção | Ambas | painel | `[ ]` |
| Encarregado (DPO) e contato LGPD definidos | LGPD | Pedro | `[ ]` |
| Revisão jurídica dos textos legais | Ambas | Pedro (advogado) | `[ ]` |

> Nota: o app agora tem Termos, Privacidade e FAQ dentro dele (conteúdo em `content/legal/` e `content/faq.ts`, sem o aviso de rascunho). As lojas continuam exigindo **URLs públicas** de Termos/Privacidade (e de exclusão de dados no Play), que ainda precisam ser hospedadas e configuradas nas envs. Os textos seguem como rascunho e precisam de revisão jurídica; os placeholders (`[RAZÃO SOCIAL]`, `[DATA]` etc.) ainda não foram preenchidos.
