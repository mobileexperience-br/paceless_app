# Publicação nas lojas

Começar cedo, em paralelo às features: os prazos das lojas (teste fechado,
revisão) não dependem do código. Fase no [roadmap.md](./roadmap.md).

Status: `[ ]` não começou · `[~]` em andamento · `[x]` pronto

Situação em 21/10/2026: AAB 1.0.0 (versionCode 2) no teste interno do Play, com link
de participação; atualizações seguem por OTA ([ota.md](./ota.md)). Ficha da loja
ainda vazia; Apple sem conta.

Detalhamento dos requisitos (pesquisa S1, 19/10/2026):

- [lojas/google-play.md](./lojas/google-play.md): conta, teste fechado, API alvo, Data safety, exclusão de conta, permissões, assinaturas, ficha.
- [lojas/app-store.md](./lojas/app-store.md): assinaturas 3.1, Sign in with Apple, exclusão 5.1.1(v), App Privacy, privacy manifest, classificação, criptografia.
- [lojas/checklist.md](./lojas/checklist.md): checklist único com o que já está feito e o que falta.
- Rascunhos legais (revisar com advogado): [política de privacidade](./legal/politica-de-privacidade.md) e [termos de uso](./legal/termos-de-uso.md).

## Google Play

| Item | Status | Observação |
|---|---|---|
| Conta de desenvolvedor | `[x]` | Organização MXPBR, verificada. Play App Signing ativo |
| App criado no Play Console | `[x]` | ID `4972516548397125859`, `com.paceless.app`, pt-BR, gratuito |
| Teste fechado com 12 testers | n/a | Só vale para conta pessoal; a conta é de organização |
| Exclusão de conta dentro do app | `[x]` | Edge Function `delete-account` v2 publicada |
| Política de privacidade (link) | `[~]` | Texto dentro do app pronto; falta a URL pública (rascunho a revisar com advogado) |
| Contato de suporte | `[~]` | Variável `EXPO_PUBLIC_SUPPORT_EMAIL`; falta definir o e-mail |
| Ficha da loja (textos, ícone, capturas de tela) | `[~]` | Ícone e gráfico prontos em `store/`; textos definidos; falta preencher no Play e tirar as capturas |
| Declarações de dados/segurança do app ("Conteúdo do app") | `[ ]` | Pendente; lista em [pendencias-pedro.md](./pendencias-pedro.md) |
| Primeiro AAB enviado | `[x]` | Teste interno: https://play.google.com/apps/internaltest/4701520311255768220 |

## Apple App Store

| Item | Status | Observação |
|---|---|---|
| Apple Developer Program (taxa anual) | `[ ]` | Conta não criada; Pedro decidindo PF ou PJ |
| Exclusão de conta dentro do app | `[x]` | Obrigatório |
| Política de privacidade (link) | `[~]` | Falta a URL pública |
| URL de suporte | `[ ]` | Obrigatório |
| Sign in with Apple | `[~]` | Código pronto; falta a capability no App ID (depende da conta) |
| Ficha da loja (textos, ícone, capturas de tela) | `[ ]` | |
| Privacidade do app (App Privacy) | `[ ]` | |

## Termos, privacidade e suporte

Exigidos pelas duas lojas. Os textos já estão dentro do app (`content/legal/`); faltam a revisão jurídica, os placeholders e as URLs públicas.

## EAS (Expo Application Services)

Publicação via EAS. Passos em alto nível:

1. Conta Expo: organização `paceless`, projeto `@paceless/paceless` (feito).
2. `eas.json` configurado (feito).
3. Perfis de build no `eas.json`: `development` (dev build; necessário
   para RevenueCat), `preview` (distribuição interna/testers) e `production` (feito).
4. Cadastrar no EAS as variáveis de ambiente de cada perfil (as do `.env`,
   ver CLAUDE.md). Nunca versionar chaves.
5. Build: `eas build --platform android|ios --profile <perfil>`.
6. Envio: `eas submit` para Google Play e App Store Connect. As credenciais
   (service account do Play, conta Apple) ficam com quem é dono das contas e
   são guardadas no EAS, nunca no repositório.

Identificadores no `app.json`: `com.paceless.app` (Android e iOS). Versionamento: ver "O que foi implementado".

## O que foi implementado (trilha S2)

- Paywall: bloco de divulgação da assinatura (título, preço da loja, período, renovação automática, cobrança na conta Apple/Google, 24h para cancelar, onde cancelar) com links de Termos e Privacidade. Só aparece com os planos carregados.
- Perfil: linha "Gerenciar assinatura" (só para premium), abre a `managementURL` do RevenueCat, com fallback para a página de assinaturas da loja.
- Ajuda e suporte: "Excluir conta pela web" aparece quando `EXPO_PUBLIC_ACCOUNT_DELETION_URL` (https) está definida. A página em si ainda precisa ser publicada.
- `app.json`: `ITSAppUsesNonExemptEncryption: false`, privacy manifest do iOS (APIs de motivo obrigatório e dados coletados, sem rastreamento) e `android.blockedPermissions` (localização em segundo plano, armazenamento externo, sobreposição de tela, vibração).
- Versionamento: `eas.json` usa `appVersionSource: remote` com `autoIncrement` em produção; `buildNumber` e `versionCode` não ficam no `app.json`. Só `version` é editada à mão.
- `eas.json`: `submit.production` com Android na trilha `internal` (rascunho) e iOS vazio. A service account do Play e as credenciais Apple ficam no EAS, nunca no repositório.
- Perfil `preview`: precisa das mesmas variáveis `EXPO_PUBLIC_*` cadastradas no EAS para o ambiente de preview.
- Exclusão de conta: o alerta avisa que a assinatura ativa não é cancelada. Aviso de saúde no último passo do onboarding e em Ajuda e suporte.
