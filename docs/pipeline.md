# Pipeline de build e CI/CD (iOS e Android)

CI/CD com **EAS Workflows** (arquivos em `.eas/workflows/`). Tudo roda na
nuvem da Expo; não há GitHub Actions. Pré-requisito: o repositório GitHub
conectado ao projeto `@paceless/paceless` no painel da Expo.

## Situação em 21/10/2026

- Organização Expo `paceless`, projeto `@paceless/paceless`.
- Build Android de produção `ffce154b` (AAB, versionCode 2, fingerprint
  `6e33b60c…`) no teste interno do Play. Última OTA em production: `315fb07c`. `submit.production.android` usa a trilha `internal`
  como rascunho.
- Apple: conta ainda não criada (Pedro decidindo PF ou PJ), então todo o fluxo iOS
  abaixo segue bloqueado. `ascAppId` e `appleTeamId` seguem com placeholders.
- Variáveis do EAS: chaves do RevenueCat (teste em development e preview, `goog_`
  em production) e Client IDs do Google.

## Perfis do `eas.json`

| Perfil | Android | iOS | Canal | Precisa de conta Apple? |
|---|---|---|---|---|
| `development-simulator` | APK dev client | dev client para **Simulador** | `development` | **Não** |
| `development` | APK dev client | dev client em aparelho (ad hoc) | `development` | Sim |
| `preview` | APK | ad hoc (aparelhos registrados) | `preview` | Sim |
| `production` | AAB (loja) | App Store | `production` | Sim |

O build de simulador só roda em Mac (Simulador do Xcode); não instala em iPhone.

## Fluxos

```
Pull request para main
  └─ pull-request.yml: checkout → npm install → tsc --noEmit → eslint --max-warnings 0

Push na main
  └─ preview.yml: fingerprint (ambiente preview)
       └─ get-build: existe build Android preview com esse fingerprint?
            ├─ não (nativo mudou) → build Android preview (APK)
            └─ sim               → EAS Update no canal preview (Android)

Manual: iOS (ios-manual.yml)
  └─ escolhe perfil (preview | development | production)
       └─ build iOS → se perfil production e "submit" marcado → submit App Store Connect

Manual: produção (production.yml)
  └─ build Android + build iOS (production, em paralelo)
       └─ aprovação manual → submit Android (Play, rascunho) + submit iOS
```

Como disparar os manuais: `npx eas-cli workflow:run .eas/workflows/ios-manual.yml`
(ou `production.yml`), ou pelo painel da Expo em Workflows.

## Decisões

- A `main` só gera build iOS manualmente: sem conta Apple, um job iOS
  automático falharia a cada push. Por isso o iOS fica no `ios-manual.yml`.
- O update do `preview` na `main` é só Android enquanto não houver build iOS
  preview rastreado pelo workflow. Quando o iOS estiver ativo, dá para
  espelhar os jobs `get-build`/`build` para `platform: ios` (a verificar o
  desenho final com a conta ativa).
- `production.yml` pede aprovação manual entre build e submit, para dar
  tempo de testar o binário antes de enviar às lojas.
- `submit.production.ios` em `eas.json` tem placeholders
  (`REPLACE_WITH_...`); nenhum segredo vai para o repositório.

## O que está bloqueado até a conta Apple Developer existir

- Qualquer build iOS que não seja `development-simulator`
  (`development`, `preview`, `production`).
- Submit para App Store Connect / TestFlight.
- Registro de aparelhos para ad hoc.
- Capability Sign in with Apple no App ID (ver [login-social.md](./login-social.md)).
- Validar o fluxo de compra com RevenueCat em sandbox no iPhone.

Não bloqueado: PR checks, preview Android, `development-simulator` (num Mac),
produção Android.

## Passo a passo para o Pedro quando a conta estiver ativa

1. **Credenciais iOS:** `npx eas-cli credentials --platform ios`. Escolher o
   perfil `production`, entrar com o Apple ID e deixar o EAS criar o
   certificado de distribuição e o provisioning profile. Repetir para
   `preview` (ad hoc) se pedir.
2. **App ID:** conferir no portal Apple que `com.paceless.app` existe com as
   capabilities Sign in with Apple (e o que mais for exigido). O EAS cria o
   App ID na primeira build, mas a capability de Sign in with Apple deve ser
   conferida.
3. **Aparelhos para ad hoc:** `npx eas-cli device:create`, abrir o link/QR
   gerado no iPhone e instalar o perfil de registro. Listar com
   `npx eas-cli device:list`. A Apple pode levar de 24 a 72 horas para
   processar aparelho novo em conta recém-criada ou renovada. Limite de 100
   iPhones por ano em ad hoc. Aparelho novo exige build novo (ou re-sign).
4. **Registro do app no App Store Connect:** criar o app (nome Paceless,
   bundle `com.paceless.app`, idioma principal, SKU). Copiar o **Apple ID do
   app** (número, aba Informações do app) para `ascAppId` e o **Team ID**
   (developer.apple.com, Membership) para `appleTeamId` em `eas.json`.
5. **Chave de API para submit:** App Store Connect > Usuários e acesso >
   Integrações > Chaves da App Store Connect, criar chave com acesso de
   App Manager. Baixar o `.p8` (só baixa uma vez). Cadastrar no EAS com
   `npx eas-cli credentials --platform ios` (App Store Connect API Key) ou
   deixar o `eas submit` pedir. A chave fica no EAS; `*.p8` já está no
   `.gitignore`.
6. **Primeira build:** `npm run build:ios:dev` (dev client) e, depois,
   `npm run build:ios:preview`.
7. **Submit:** disparar `ios-manual.yml` com perfil `production` e
   `submit` marcado, ou `production.yml`. Acompanhar no TestFlight.
8. Preencher o restante do [checklist da App Store](./lojas/app-store.md).

## Instalar o dev build iOS no iPhone

1. Aparelho registrado (passo 3) e build `development` ou `preview` feito
   depois do registro.
2. No iPhone: Ajustes > Privacidade e Segurança > **Modo de Desenvolvedor**,
   ativar e reiniciar (iOS 16+; só aparece depois de instalar um app ad hoc).
3. Abrir o link da build (painel da Expo ou QR do `eas build`) no Safari do
   iPhone e tocar em Instalar.
4. Para o dev client, rodar `npm start` no computador e abrir o projeto pelo
   app instalado.

Simulador (sem conta Apple, num Mac): `npm run build:ios:sim`, baixar o
`.tar.gz`, extrair e arrastar o `.app` para o Simulador (ou
`eas build:run --platform ios`).

## Custos e limites do EAS (plano gratuito)

Valores mudam; conferir em expo.dev/pricing antes de depender deles.

- Builds do plano gratuito: cota mensal limitada, com fila de baixa
  prioridade (a verificar a cota atual de builds Android/iOS por mês).
- Workflows: minutos de CI e os jobs de build contam na mesma cota
  (a verificar).
- EAS Update: limite de usuários ativos mensais (MAU) e de armazenamento
  (a verificar).
- Para economizar: o `preview.yml` só builda quando o fingerprint nativo
  muda; mudança só de JS vira Update, que não gasta minuto de build.
- `development-simulator` e `development` só precisam ser refeitos quando
  o código nativo muda.

Ver também: [ota.md](./ota.md) e [publicacao-lojas.md](./publicacao-lojas.md).
