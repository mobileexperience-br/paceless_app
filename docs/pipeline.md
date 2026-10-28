# Pipeline de build e CI/CD (iOS e Android)

CI/CD com **EAS Workflows** (arquivos em `.eas/workflows/`). Tudo roda na
nuvem da Expo; não há GitHub Actions. Pré-requisito: o repositório GitHub
conectado ao projeto `@paceless/paceless` no painel da Expo.

## Situação em 28/10/2026

- Organização Expo `paceless`, projeto `@paceless/paceless`.
- Android: teste interno do Play ativo. `submit.production.android` usa a trilha
  `internal` com `releaseStatus: completed` (vai direto para os testers).
- Apple: conta pessoa física, Team ID `DVRNT6D9B2`, app `6828008435` no App Store
  Connect. Credenciais iOS (certificado e perfil de distribuição) guardadas no EAS.
  Chave de API do App Store Connect cadastrada na organização. Primeiro build iOS
  enviado ao TestFlight em 28/10.
- Variáveis do EAS: chaves do RevenueCat (teste em development e preview, `goog_`
  em production) e Client IDs do Google. Falta `EXPO_PUBLIC_REVENUECAT_IOS_KEY`.

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

Push na main (release.yml)
  └─ fingerprint (ambiente production)
       └─ get-build: existe build production com esse fingerprint? (Android e iOS, cada um)
            ├─ não (nativo mudou) → build production → submit
            │                        Android: Play, trilha interna, liberado
            │                        iOS: TestFlight
            └─ sim (só JS)        → EAS Update no canal production

Manual: iOS (ios-manual.yml)
  └─ escolhe perfil (preview | development | production)
       └─ build iOS → se perfil production e "submit" marcado → submit App Store Connect

Manual: produção (production.yml)
  └─ build Android + build iOS (production, em paralelo)
       └─ aprovação manual → submit Android (Play, trilha interna) + submit iOS
```

Como disparar os manuais: `npx eas-cli workflow:run .eas/workflows/ios-manual.yml`
(ou `production.yml`), ou pelo painel da Expo em Workflows.

## Decisões

- A `main` publica sozinha: mudança nativa vira build e vai para o teste
  interno do Play e para o TestFlight; mudança só de JS vira OTA no canal
  `production`. Isso substitui o antigo `preview.yml`, que gerava build de
  preview a cada push e duplicava o gasto de build.
- A **produção** do Play (e o envio para revisão da App Store) continua
  manual: promover no Play Console / App Store Connect depois de testar.
- `production.yml` pede aprovação manual entre build e submit, para dar
  tempo de testar o binário antes de enviar às lojas.
- `eas.json` guarda só IDs públicos (`appleTeamId`, `ascAppId`); a chave de
  API (`.p8`) fica no EAS, nunca no repositório.
- Para o submit iOS rodar na nuvem, a chave de API precisa estar ligada ao
  app para EAS Submit: `npx eas-cli credentials -p ios` → App Store Connect:
  Manage your API Key → usar a chave existente para EAS Submit (uma vez,
  em terminal interativo).

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
- Para economizar: o `release.yml` só builda quando o fingerprint nativo
  muda; mudança só de JS vira Update, que não gasta minuto de build.
- `development-simulator` e `development` só precisam ser refeitos quando
  o código nativo muda.

Ver também: [ota.md](./ota.md) e [publicacao-lojas.md](./publicacao-lojas.md).
