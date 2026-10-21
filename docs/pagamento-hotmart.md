# Pagamento pela Hotmart (em discussão)

Levantado em 21/10/2026.

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
