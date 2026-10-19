# Publicação nas lojas

Começar cedo, em paralelo às features: os prazos das lojas (teste fechado,
revisão) não dependem do código. Fase no [roadmap.md](./roadmap.md).

Status: `[ ]` não começou · `[~]` em andamento · `[x]` pronto

Detalhamento dos requisitos (pesquisa S1, 19/10/2026):

- [lojas/google-play.md](./lojas/google-play.md): conta, teste fechado, API alvo, Data safety, exclusão de conta, permissões, assinaturas, ficha.
- [lojas/app-store.md](./lojas/app-store.md): assinaturas 3.1, Sign in with Apple, exclusão 5.1.1(v), App Privacy, privacy manifest, classificação, criptografia.
- [lojas/checklist.md](./lojas/checklist.md): checklist único com o que já está feito e o que falta.
- Rascunhos legais (revisar com advogado): [política de privacidade](./legal/politica-de-privacidade.md) e [termos de uso](./legal/termos-de-uso.md).

## Google Play

| Item | Status | Observação |
|---|---|---|
| Conta de desenvolvedor | `[ ]` | |
| Teste fechado com 12 testers | `[ ]` | Obrigatório para contas pessoais novas. Pedro tem amigos corredores para isso |
| Exclusão de conta dentro do app | `[ ]` em andamento (trilha H) | Obrigatório |
| Política de privacidade (link) | `[ ]` em andamento (trilha I) | Obrigatório |
| Contato de suporte | `[ ]` em andamento (trilha I) | Obrigatório |
| Ficha da loja (textos, ícone, capturas de tela) | `[ ]` | |
| Declarações de dados/segurança do app | `[ ]` | |

## Apple App Store

| Item | Status | Observação |
|---|---|---|
| Apple Developer Program (taxa anual) | `[ ]` | |
| Exclusão de conta dentro do app | `[ ]` em andamento (trilha H) | Obrigatório |
| Política de privacidade (link) | `[ ]` em andamento (trilha I) | Obrigatório |
| URL de suporte | `[ ]` em andamento (trilha I) | Obrigatório |
| Sign in with Apple | `[ ]` | Obrigatório se houver outro login social (Google) |
| Ficha da loja (textos, ícone, capturas de tela) | `[ ]` | |
| Privacidade do app (App Privacy) | `[ ]` | |

## Termos, privacidade e suporte

Exigidos pelas duas lojas. Em andamento na trilha I.

## EAS (Expo Application Services)

Publicação via EAS. Passos em alto nível:

1. Criar/entrar na conta Expo e instalar o `eas-cli` (ferramenta nova: aprovar antes).
2. `eas build:configure` para gerar o `eas.json`.
3. Definir perfis de build no `eas.json`: `development` (dev build; necessário
   para RevenueCat), `preview` (distribuição interna/testers) e `production`.
4. Cadastrar no EAS as variáveis de ambiente de cada perfil (as do `.env`,
   ver CLAUDE.md). Nunca versionar chaves.
5. Build: `eas build --platform android|ios --profile <perfil>`.
6. Envio: `eas submit` para Google Play e App Store Connect. As credenciais
   (service account do Play, conta Apple) ficam com quem é dono das contas e
   são guardadas no EAS, nunca no repositório.

Já definido no `app.json`: `ios.bundleIdentifier = com.paceless.app`.
Identificadores já no `app.json`: `com.paceless.app` (Android e iOS). Versionamento: a confirmar.

## O que foi implementado (trilha S2)

- Paywall: bloco de divulgação da assinatura (título, preço da loja, período, renovação automática, cobrança na conta Apple/Google, 24h para cancelar, onde cancelar) com links de Termos e Privacidade. Só aparece com os planos carregados.
- Perfil: linha "Gerenciar assinatura" (só para premium), abre a `managementURL` do RevenueCat, com fallback para a página de assinaturas da loja.
- Ajuda e suporte: "Excluir conta pela web" aparece quando `EXPO_PUBLIC_ACCOUNT_DELETION_URL` (https) está definida. A página em si ainda precisa ser publicada.
- `app.json`: `ITSAppUsesNonExemptEncryption: false`, privacy manifest do iOS (APIs de motivo obrigatório e dados coletados, sem rastreamento) e `android.blockedPermissions` (localização em segundo plano, armazenamento externo, sobreposição de tela, vibração).
- Versionamento: `eas.json` usa `appVersionSource: remote` com `autoIncrement` em produção; `buildNumber` e `versionCode` não ficam no `app.json`. Só `version` é editada à mão.
- `eas.json`: `submit.production` com Android na trilha `internal` (rascunho) e iOS vazio. A service account do Play e as credenciais Apple ficam no EAS, nunca no repositório.
- Perfil `preview`: precisa das mesmas variáveis `EXPO_PUBLIC_*` cadastradas no EAS para o ambiente de preview.
- Exclusão de conta: o alerta avisa que a assinatura ativa não é cancelada. Aviso de saúde no último passo do onboarding e em Ajuda e suporte.
