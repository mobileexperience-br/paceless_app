# Assinaturas (RevenueCat)

Como as assinaturas funcionam e o que o Pedro precisa configurar. Nada abaixo
foi aplicado ou publicado: migration, Edge Function e segredos ainda precisam
ser executados manualmente.

## Como funciona

- O app usa `react-native-purchases` (`lib/purchases.ts`). O SDK é configurado
  uma vez, por plataforma, com a chave pública do RevenueCat.
- Sem chave, ou na web, o app entra em estado "não configurado": o paywall
  mostra "Assinaturas indisponíveis no momento" e segue com "Continuar sem
  assinar".
- O paywall é aberto antes do cadastro, então a compra acontece com um usuário
  anônimo do RevenueCat. Quando a pessoa cria conta ou entra, o app chama
  `logIn(user.id)` e o RevenueCat transfere a compra para o id do Supabase.
  No logout, o app chama `logOut()`.
- `isPremium` no app (`hooks/usePremium.ts`) serve só para UI. A fonte da
  verdade é a tabela `public.subscriptions`, alimentada pelo webhook
  `revenuecat-webhook`. Limites free x premium devem ser checados no servidor
  lendo essa tabela.

## Compras só funcionam no build nativo

O RevenueCat precisa do SDK nativo e das lojas. Compras não funcionam na web
nem no Expo Go. Use o development build (`eas build --profile development`) ou
um build de produção, instalado em aparelho ou emulador com conta de teste da
loja (sandbox da App Store, testers de licença do Google Play).

## Passo a passo no RevenueCat

1. Criar o projeto "Paceless" em app.revenuecat.com.
2. Adicionar os apps ao projeto: App Store (bundle `com.paceless.app`) e Play
   Store (package `com.paceless.app`). Conectar as credenciais de cada loja
   conforme o assistente do RevenueCat pede (chave de In-App Purchase da App
   Store Connect; conta de serviço do Google Play).
3. Criar os produtos de assinatura nas lojas (um grupo de assinatura com plano
   anual e mensal) e cadastrá-los em Product catalog > Products.
4. Criar o entitlement `premium` e anexar os dois produtos (anual e mensal).
   O id precisa ser exatamente `premium`.
5. Criar o offering `default`, marcá-lo como Current e adicionar dois
   packages: `$rc_annual` (produto anual) e `$rc_monthly` (produto mensal).
   O paywall lê apenas esses dois packages.
6. Em API keys, copiar as chaves públicas do SDK (uma por plataforma, não a
   chave secreta) e colocar no `.env` e nos segredos do EAS:
   - `EXPO_PUBLIC_REVENUECAT_IOS_KEY` (começa com `appl_`)
   - `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` (começa com `goog_`)

## Banco e webhook (Supabase)

1. Aplicar a migration `supabase/migrations/*_create_subscriptions.sql`
   (`supabase db push`).
2. Definir os segredos da função:
   - `REVENUECAT_WEBHOOK_AUTH`: valor secreto escolhido por você, por exemplo
     `Bearer <string-aleatoria-longa>`. Deve ser idêntico ao header que o
     RevenueCat enviar.
   - `REVENUECAT_SECRET_KEY` (opcional, recomendado): chave secreta v1 do
     RevenueCat (`sk_...`). Usada para consultar o RevenueCat quando chega um
     evento `TRANSFER`, que acontece quando a compra anônima é movida para o
     usuário recém-cadastrado. Sem ela, a assinatura desse usuário só aparece
     na tabela no próximo evento (renovação, por exemplo).
3. Publicar a função sem verificação de JWT, pois o RevenueCat não envia JWT do
   Supabase: `supabase functions deploy revenuecat-webhook --no-verify-jwt`.
4. No RevenueCat, em Integrations > Webhooks, criar um webhook com:
   - URL: `https://<project-ref>.supabase.co/functions/v1/revenuecat-webhook`
   - Authorization header value: o mesmo valor de `REVENUECAT_WEBHOOK_AUTH`
   - Ambientes: sandbox e produção
5. Usar "Send test event" para validar. Resposta esperada: 200.

## Tabela `public.subscriptions`

Uma linha por usuário e entitlement: `user_id`, `entitlement`, `is_active`,
`expires_at`, `updated_at`. O usuário só consegue ler a própria linha; apenas a
função (service role) escreve.

## Testando

1. Build de desenvolvimento com as chaves no `.env`.
2. Abrir o paywall: os preços devem vir da loja.
3. Comprar com conta sandbox, criar conta e conferir a linha em
   `public.subscriptions`.
4. Em outro aparelho ou após reinstalar, entrar na conta e usar "Restaurar
   compras".

## Em discussão: pagamento pela Hotmart (21/10)

O Pedro sugeriu cobrar pela Hotmart, depois de o Jonatas perguntar se o pagamento seria pela Stripe, presencial ou fora do app. **Ainda não foi decidido.** Precisamos conversar antes de mudar qualquer coisa no plano atual (RevenueCat com Google Play Billing e Apple IAP).

Pontos para a conversa:

- **Regra das lojas:** assinatura de conteúdo digital vendida dentro do app precisa usar o sistema de cobrança da loja, salvo nos programas de cobrança alternativa.
  - Apple no Brasil: o acordo com o Cade (em vigor desde 18/06/2026, iOS 26.5) permite link e pagamento externo, mas ainda cobra taxa (as matérias citam de 5% a 15%). Apps usados por menores não podem ter link de pagamento externo.
  - Google Play: o Brasil aparece como mercado de cobrança alternativa (desconto de 4% na taxa), mas com suporte, disputas e PCI por nossa conta. Conferir as regras atuais no Play Console.
- **Venda fora do app:** a pessoa compra na Hotmart (site, Instagram) e só faz login no app. O app não pode ter botão ou link para comprar fora sem entrar num desses programas.
- **Integração:** o webhook da Hotmart precisaria liberar o premium no Supabase (Edge Function), em paralelo ao RevenueCat. O RevenueCat aceita compras web por integração com a Stripe, não com a Hotmart.
- **Custos:** taxa da Hotmart contra a comissão da loja (15% no programa de pequenas empresas).
- **Experiência:** a compra dentro do app converte mais. Fluxo Onboarding → Paywall → Auth.
- **Freemium de 15 ou 30 dias:** nas lojas, o teste grátis é nativo. Na Hotmart, seria controlado por nós.

Fontes: [Poder360](https://www.poder360.com.br/poder-tech/apple-libera-apps-de-lojas-rivais-e-pagamentos-externos-no-brasil/), [Tecnoblog](https://tecnoblog.net/noticias/apple-ainda-podera-cobrar-taxas-no-brasil-veja-aliquotas/), [CNN Brasil](https://www.cnnbrasil.com.br/economia/negocios/cade-faz-acordo-para-apple-oferecer-pagamento-e-lojas-de-apps-alternativos/), [Google Play: cobrança alternativa](https://support.google.com/googleplay/android-developer/answer/12570971).
