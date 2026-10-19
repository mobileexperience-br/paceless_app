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
npm run update:development -- --message "o que mudou"
npm run update:preview -- --message "o que mudou"
npm run update:production -- --message "o que mudou"
```

O app baixa a atualização ao abrir e aplica na próxima abertura.

## Regras

- Testar no `preview` antes de mandar para `production`.
- Só correções e melhorias: Apple e Google proíbem mudar a finalidade do app
  ou contornar a revisão via OTA.
- `.env` não vai junto: as variáveis `EXPO_PUBLIC_*` precisam estar no EAS
  (`eas env`) para builds e updates feitos na nuvem.
