# Ambiente web (somente desenvolvimento)

O app roda no navegador como ambiente de teste **local**. O alvo continua sendo
mobile: a web serve para inspecionar telas, navegação e fluxos sem precisar de
aparelho ou emulador. Não é um produto e não será publicado.

## Como rodar

```bash
npm run web
```

Abre em `http://localhost:8081` (ou outra porta com `--port`). Para simular o
celular, use o modo responsivo do DevTools em 412x915. É preciso ter o `.env`
com as variáveis do Supabase, como no mobile.

## O que funciona

- Welcome, onboarding completo, paywall, login, cadastro e telas legais.
- Login e cadastro por e-mail e senha (Supabase).
- Login com Google via `signInWithOAuth`, redirecionando de volta para a origem
  local. A URL (ex.: `http://localhost:8081`) precisa estar em
  Authentication > URL Configuration > Redirect URLs no Supabase.
- Tema claro/escuro (segue a preferência do app; "sistema" segue o navegador).
- Persistência local (AsyncStorage vira `localStorage`).

## O que não funciona

- Rastreamento GPS: a tela de treino mostra o aviso de que distância e ritmo só
  existem no app para celular. Não há dados falsos.
- Assinaturas: o paywall mostra "Assinatura disponível no app." e não há compra,
  restauração nem gestão de assinatura.
- Login com Apple: indisponível ("Disponível no app.").
- Foto de perfil pela câmera e serviço em primeiro plano: só no app.

## Como está organizado

Diferenças de plataforma ficam em `lib/platform/`, em pares `nome.ts` (nativo) e
`nome.web.ts` (web) com a mesma interface. O Metro escolhe o arquivo certo; as
telas não testam `Platform.OS` para isso.

| Adapter | Nativo | Web |
|---|---|---|
| `appColorScheme` | `Appearance.setColorScheme` | sem efeito (o tema vem do `ThemeProvider`) |
| `socialAuth` | Google e Apple nativos | Google por OAuth; Apple indisponível |
| `detectSessionInUrl` | `false` | `true`, para concluir o retorno do OAuth |
| `subscriptionsUnavailableMessage` | "Assinaturas indisponíveis no momento." | "Assinatura disponível no app." |

Arquivo novo em `lib/platform/` só é visto pelo Metro depois de reiniciar o
servidor com `--clear`.
