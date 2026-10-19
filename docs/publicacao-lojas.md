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
