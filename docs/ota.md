# Atualização OTA (EAS Update)

Manda mudanças de **JavaScript e assets** direto para quem já tem o app, sem
passar pela loja. Lib nativa nova ou permissão nova continua exigindo build.

## Como está configurado

- `expo-updates` instalado; `app.json` com `updates.url` e
  `runtimeVersion: { policy: "fingerprint" }`.
- O fingerprint muda sozinho quando o código nativo muda — uma atualização só
  chega a builds compatíveis. Mudou lib nativa? Gera build novo.
- Cada perfil do `eas.json` tem um canal: `development`, `preview`, `production`.

## Publicar

```bash
npx eas-cli update --channel production --environment production --message "o que mudou"
npx eas-cli update --channel preview --environment preview --message "o que mudou"
```

Sempre passe `--environment`: sem ele, o update usa o `.env` local (chave de teste do
RevenueCat) e quebra as compras em produção. Os scripts `update:*` do `package.json`
não passam essa flag e ficam assim de propósito até o próximo build: mudar scripts do
`package.json` altera o fingerprint e o update deixaria de chegar ao build atual.

## Fingerprint (compatibilidade)

Antes de publicar, confira se o build instalado aceita o update:

```bash
npx eas-cli fingerprint:compare --build-id <id do build>
```

Entram no fingerprint: dependências nativas, `app.json` e os **scripts** do
`package.json`. Qualquer mudança nesses pontos exige build novo. Por isso o
`android.backgroundColor` e o script `store:assets` ficaram para o próximo build
(o fundo já é aplicado em tempo de execução por `useWindowBackground`).

O app baixa a atualização ao abrir e aplica na próxima abertura.

## Regras

- Testar no `preview` antes de mandar para `production`.
- Só correções e melhorias: Apple e Google proíbem mudar a finalidade do app
  ou contornar a revisão via OTA.
- `.env` não vai junto: as variáveis `EXPO_PUBLIC_*` precisam estar no EAS
  (`eas env`) para builds e updates feitos na nuvem.
