# Pendências com o Pedro

Lista enviada no WhatsApp em 19/10/2026 (22 itens). Este arquivo registra o que já voltou.

## Respondido

| Item | Resposta | Data |
|---|---|---|
| 1. Organização Expo | Criada (`paceless`), projeto transferido | 19/10 |
| 2. Google Play Console | A conta antiga foi encerrada por inatividade (2021). Ele criou conta nova e convidou o Jonatas como Admin. Procurou o D-U-N-S, então a ideia é conta de organização | 20/10 |
| 3. Apple Developer | Ainda falta. Ele está em dúvida entre PF e PJ | 20/10 |
| 4. RevenueCat | Conta criada, convite enviado. Chave do Test Store cadastrada no `.env` e no EAS (development e preview) | 20/10 |
| 5. Google Cloud | Projeto criado, convite enviado | 20/10 |
| 6. Supabase | Marcado como feito | 20/10 |
| 22. Expo x Flutter | Não respondeu explicitamente; seguimos em Expo | — |

## Google Play: conta encerrada

- Conta encerrada por inatividade não volta: é preciso registrar uma conta nova e pagar a taxa única de novo.
- Decidir se a conta nova será **pessoal** (exige teste fechado com 12 testadores por 14 dias antes da produção) ou de **organização** (exige CNPJ e D-U-N-S, sem a regra dos 12 testadores).
- Ver [lojas/google-play.md](./lojas/google-play.md).

## Em aberto

Item 3 (Apple, PF ou PJ) e itens 7 a 21: preços, grátis x premium, relógios, dias de treino, gamificação, musculação, Stories, iPad, concorrente, dados jurídicos, advogado, hospedagem das páginas legais, documento de requisitos, anotações, conversa com o Igor.

Em 20/10 de manhã ele avisou por áudio que ia juntar "todas as informações combinadas" e mandar em seguida.

## Configuração Google (20/10)

- Google Cloud: projeto `paceless`. Tela OAuth externa em modo de teste, domínio autorizado `twfqvvfpnspbdaytrerm.supabase.co` (o Google recusa `supabase.co`, que é sufixo público).
- Clientes OAuth Web, Android (SHA-1 de desenvolvimento) e iOS criados. Client IDs no `.env` e no EAS (três ambientes).
- Supabase: provider Google ativo, com os três Client IDs e "Skip nonce check".
- Conta de serviço `paceless-play-publisher@paceless.iam.gserviceaccount.com`, convidada no Play Console. Chave JSON fica fora do repositório.
- RevenueCat: app Play Store `com.paceless.app`. Chave `goog_` em `production`; development e preview seguem com a chave de teste.
- Play Console (conta de organização "MXPBR"): o app ainda não foi criado porque falta o Pedro verificar o telefone da conta.
- Falta: cliente OAuth Android com o SHA-1 de produção e o da assinatura do Play, depois do primeiro build enviado.

## Situação em 20/10 à tarde

- Convites aceitos: Google Cloud, Play Console, RevenueCat, Supabase e Expo.
- E-mails do Pedro: `mobileexperiencebr@gmail.com` (dono do Google Cloud, Owner no RevenueCat, dono do Play Console MXPBR) e `pedrinhoadias@gmail.com`. Os dois estão nos contatos do desenvolvedor da tela OAuth.
- Bloqueios:
  - JSON da conta de serviço ainda não enviado ao RevenueCat (Jonatas). Sem ele, não dá para criar o tópico Pub/Sub.
  - Pedro precisa concluir a verificação do Play Console: identidade e os dois telefones (contato e desenvolvedor) em "Detalhes da conta". Sem isso o app não pode ser criado.
