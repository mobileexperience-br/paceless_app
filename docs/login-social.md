# Login social (Google e Apple)

Login nativo via `signInWithIdToken` do Supabase. O app pega o token no
aparelho (Google Sign-In / Sign in with Apple) e entrega ao Supabase, sem
navegador.

## Situação em 21/10/2026

- Google Cloud (projeto `paceless`): clientes OAuth Web, Android de
  desenvolvimento, iOS e Android (Play, com o SHA-1 da chave de assinatura do
  Google Play `D5:98:4A:5B:B2:B8:2C:5F:FC:C9:5E:EE:FE:A1:FE:89:F4:59:74:85`) criados.
  A tela OAuth segue em **modo de teste**; publicar antes do lançamento.
- Supabase: provider Google ativo com os 4 Client IDs.
- Variáveis `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` e `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`
  no `.env` e no EAS.
- Apple: sem conta Apple Developer ainda (Pedro decidindo PF ou PJ). O código e o
  `usesAppleSignIn` estão prontos; a capability no App ID e o provider no Supabase
  dependem da conta.

Sem as variáveis abaixo o app continua funcionando: o botão do Google
mostra "Login social indisponível no momento." e o da Apple só aparece no iOS.

## 1. Google Cloud Console

1. Em https://console.cloud.google.com crie (ou escolha) um projeto.
2. APIs e serviços > Tela de permissão OAuth: configure o app (nome Paceless,
   e-mail de suporte, escopos `email`, `profile`, `openid`). Publique para
   produção quando for lançar.
3. APIs e serviços > Credenciais > Criar credenciais > ID do cliente OAuth. Crie
   os clientes (Web, iOS e um Android por certificado):
   - **Web application**: sem URIs. Guarde o Client ID e o Client Secret.
   - **iOS**: Bundle ID `com.paceless.app`. Guarde o Client ID.
   - **Android**: Package name `com.paceless.app` e o SHA-1 do certificado
     (passo 2). Crie um por certificado (desenvolvimento e produção).
4. SHA-1 do Android: rode `eas credentials`, escolha Android > o profile
   (`development` ou `production`) > Keystore e copie o "SHA1 Fingerprint".
   Se for publicar na Play Store, adicione também o SHA-1 da "App signing key"
   (Play Console > Integridade do app).

## 2. Variáveis de ambiente

No `.env` local e nos segredos/variáveis do EAS (o build lê no momento do build):

```
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=<Client ID do cliente Web>
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=<Client ID do cliente iOS>
```

O `idToken` precisa ser emitido para o cliente **Web**, por isso ele é usado
nos dois sistemas. O Client ID do iOS também gera o URL scheme do iOS
automaticamente (`app.config.ts`).

## 3. Supabase Dashboard

**Google**: Authentication > Providers > Google.
1. Ative o provider.
2. Client ID: o do cliente **Web**. Client Secret: o do cliente Web.
3. Em "Authorized Client IDs" adicione também o Client ID do iOS e do Android,
   separados por vírgula.
4. Se o login falhar com erro de nonce, ligue "Skip nonce check". O SDK nativo do
   Google no Android não permite definir nonce.

**Apple**: Authentication > Providers > Apple.
1. Ative o provider.
2. Em "Client IDs" coloque o Bundle ID `com.paceless.app` (login nativo no iOS).
   O Services ID só é necessário se um dia houver login Apple na web/Android; a
   chave secreta (JWT) só é exigida nesse fluxo OAuth.

## 4. Apple Developer

1. https://developer.apple.com > Certificates, Identifiers & Profiles >
   Identifiers > App ID `com.paceless.app`.
2. Marque a capability **Sign in with Apple** e salve.
3. Regenere o provisioning profile (o `eas build` faz isso sozinho ao rodar
   `eas credentials` / no próximo build iOS).
4. Opcional (só para fluxo web/OAuth): crie um Services ID e configure o domínio
   e a Return URL do Supabase (`https://<ref>.supabase.co/auth/v1/callback`).

## 5. Gerar o build

As libs são nativas, então é preciso um novo APK de desenvolvimento:

```bash
eas build --profile development --platform android
```

Para iOS: `eas build --profile development --platform ios` (precisa de conta
Apple Developer paga e dispositivo registrado).

## 6. Testar

- Android: tocar em "Continuar com Google" em Welcome, Criar conta e Entrar;
  cancelar o seletor não deve mostrar erro.
- iOS: "Continuar com Apple" e "Continuar com Google". No primeiro login com
  Apple o nome é salvo em `user_metadata` (`name` e `full_name`). A Apple só
  envia o nome na primeira autorização.
- Web: os botões mostram "Disponível no app.".
