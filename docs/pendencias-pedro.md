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
| 7. Preço | R$ 267 anual e R$ 37 mensal | 20/10 |
| 8. Grátis x premium | Período freemium de 15 ou 30 dias (duração a definir) | 20/10 |
| 9. Relógios | Garmin, Apple Watch, Samsung, Coros e Polar | 20/10 |
| 10. Dias de treino | Quantidade de dias com combinações predefinidas (ex.: ter/qui/sáb ou qua/sex/dom) | 20/10 |
| 11. Gamificação | Aprovada: meta semanal sem sequência, conquistas de 1, 3, 5, 7 e 10 km | 20/10 |
| 12. Musculação | Educador físico com apoio de IA; ele vai buscar um parceiro | 20/10 |
| 13. Stories do Instagram | Muito importante, mas não pode travar a primeira versão | 20/10 |
| 14. iPad | Pode ter, prioridade é celular | 20/10 |
| 15. Concorrente | Zyla | 20/10 |
| Área admin | Não quer no app: área web separada, em outro domínio, por segurança e LGPD | 20/10 |
| Troca de plano | Feita pelo usuário no app, cobrança gerida pela loja; intervenção manual só em suporte | 20/10 |
| 22. Expo x Flutter | Não respondeu explicitamente; seguimos em Expo | — |

## Google Play: conta encerrada

- Conta encerrada por inatividade não volta: é preciso registrar uma conta nova e pagar a taxa única de novo.
- Decidir se a conta nova será **pessoal** (exige teste fechado com 12 testadores por 14 dias antes da produção) ou de **organização** (exige CNPJ e D-U-N-S, sem a regra dos 12 testadores).
- Ver [lojas/google-play.md](./lojas/google-play.md).

## Em aberto

Item 3 (Apple, PF ou PJ) e itens 16 a 21: dados jurídicos (razão social, CNPJ, e-mail, responsável LGPD), advogado, hospedagem das páginas legais, documento de requisitos, anotações, conversa com o Igor. Duração do freemium (15 ou 30 dias).

Em 20/10 de manhã ele avisou por áudio que ia juntar "todas as informações combinadas" e mandar em seguida.

## Configuração Google (20/10)

- Google Cloud: projeto `paceless`. Tela OAuth externa em modo de teste, domínio autorizado `twfqvvfpnspbdaytrerm.supabase.co` (o Google recusa `supabase.co`, que é sufixo público).
- Clientes OAuth Web, Android (SHA-1 de desenvolvimento) e iOS criados. Client IDs no `.env` e no EAS (três ambientes).
- Supabase: provider Google ativo, com os três Client IDs e "Skip nonce check".
- Conta de serviço `paceless-play-publisher@paceless.iam.gserviceaccount.com`, convidada no Play Console. Chave JSON fica fora do repositório.
- RevenueCat: app Play Store `com.paceless.app`. Chave `goog_` em `production`; development e preview seguem com a chave de teste.
- Play Console (conta de organização "MXPBR"): verificado; app criado em 21/10 (ver abaixo).
- Falta: cliente OAuth Android com o SHA-1 de produção e o da assinatura do Play, depois do primeiro build enviado.

## Situação em 20/10 à tarde

- Convites aceitos: Google Cloud, Play Console, RevenueCat, Supabase e Expo.
- E-mails do Pedro: `mobileexperiencebr@gmail.com` (dono do Google Cloud, Owner no RevenueCat, dono do Play Console MXPBR) e `pedrinhoadias@gmail.com`. Os dois estão nos contatos do desenvolvedor da tela OAuth.
- Bloqueios desta data (JSON no RevenueCat e verificação do Play Console) resolvidos em 21/10.

## Atualização 20/10, 16h

- Pedro avisou que validou o telefone e a documentação do Play Console. Falta o agente do navegador confirmar e criar o app.

## Play Console: app criado (21/10)

- App Paceless criado na conta MXPBR (ID `4972516548397125859`), `com.paceless.app`, pt-BR, gratuito, com proteção automática ligada. As três declarações foram aceitas.
- A conta de serviço `paceless-play-publisher` tem permissões na conta inteira, o que já cobre o app.
- Chave de assinatura do Google Play (conferida no `deployment_cert.der`):
  - SHA-1 `D5:98:4A:5B:B2:B8:2C:5F:FC:C9:5E:EE:FE:A1:FE:89:F4:59:74:85`
  - SHA-256 `34:C5:69:3C:CB:B3:61:B3:F1:0D:7E:FD:A8:8D:E2:85:A7:35:10:32:0A:93:79:46:2E:78:43:49:C7:07:EC:43`
- "Conteúdo do app" pendente: política de privacidade (URL pública), anúncios, acesso ao app (conta de teste para o revisor), classificação de conteúdo, público-alvo, segurança dos dados, ID de publicidade, apps governamentais, recursos financeiros, apps de saúde. Serviço em primeiro plano e exclusão de conta devem aparecer após o primeiro build.
- Cliente OAuth "Paceless Android (Play)" criado com o SHA-1 do Play: `336845760115-22tqqcc1s4eitrk040vpifkrlh0qgpjf.apps.googleusercontent.com`. Supabase com os quatro Client IDs.
- RevenueCat: JSON da conta de serviço salvo. A conta `paceless-play-publisher` recebeu o papel `roles/pubsub.admin` no projeto `paceless`.
- Tópico `projects/paceless/topics/Play-Store-Notifications` criado pelo RevenueCat ("Connected to Google"). Configurado no Play Console com todas as notificações; o teste foi recebido em 21/10 às 10:48 UTC.
- Validação do JSON com aviso: "package name was not found" nas compras de assinatura. Clicar em "Check again" depois do primeiro AAB numa faixa de teste.
