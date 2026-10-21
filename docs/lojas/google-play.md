# Google Play: requisitos de publicação

Pesquisa da Trilha S1 (19/10/2026). Fontes oficiais linkadas em cada item;
o que não deu para confirmar está como **a verificar**. Visão geral e status em
[checklist.md](./checklist.md). App iOS: [app-store.md](./app-store.md).

## 1. Conta de desenvolvedor

| Tema | Regra | Fonte |
|---|---|---|
| Tipo de conta | Pessoal ou organização. Organização exige D-U-N-S e dados da empresa (a verificar detalhes atuais) | [Ajuda do Play Console](https://support.google.com/googleplay/android-developer/answer/13634885) |
| Taxa | Única, US$ 25 | [Ajuda](https://support.google.com/googleplay/android-developer/answer/6112435) |
| Teste fechado (contas pessoais criadas após 13/11/2023) | Mínimo de **12 testers com opt-in contínuo por 14 dias** antes de pedir acesso à produção. Contas de organização não precisam. Nenhuma mudança em 2026 encontrada | [Requisitos de teste](https://support.google.com/googleplay/android-developer/answer/14151465) |
| Verificação de identidade | Obrigatória (documento; organização: D-U-N-S) | [Ajuda](https://support.google.com/googleplay/android-developer/answer/10841920) (a verificar) |

Decisão tomada: conta de **organização** (MXPBR, verificada em 21/10/2026),
que dispensa os 12 testers x 14 dias. Se fosse conta pessoal, o teste fechado
teria de começar cedo e manter os 12 testers ativos (cair abaixo disso pode
reiniciar a contagem, segundo fontes secundárias).

## 2. Nível de API alvo (target API)

- Desde **31/08/2026**, novos apps e atualizações precisam ter `targetSdk` **36
  (Android 16)** ou superior. Dá para pedir extensão até 01/11/2026 no Play
  Console. A API 37 é a próxima.
  [Fonte](https://developer.android.com/google/play/requirements/target-sdk).
- Expo SDK 58: conferir no manifesto gerado que `targetSdkVersion` >= 36; se
  não, fixar via `expo-build-properties` (a verificar no primeiro build, em andamento).
- Android App Bundle (`.aab`) é obrigatório para apps novos. O perfil
  `production` do `eas.json` gera AAB por padrão (`development` e `preview`
  geram APK, só para teste).

## 3. Formulário Data safety (Segurança dos dados)

Fonte: [Fornecer informações para a seção Segurança dos dados](https://support.google.com/googleplay/android-developer/answer/10787469).

| Pergunta | Resposta |
|---|---|
| O app coleta ou compartilha dados do usuário? | Sim |
| Dados criptografados em trânsito? | Sim (HTTPS/TLS com Supabase e RevenueCat) |
| Usuário pode pedir exclusão dos dados? | Sim: no app (Perfil > Conta) e por URL web (seção 4) |
| Política de privacidade | URL pública ([rascunho](../legal/politica-de-privacidade.md)) |

Mapeamento por tipo de dado. Na regra do Google, enviar dados a um prestador de
serviço que os trata só em nome do app (Supabase, RevenueCat) normalmente **não
conta como "compartilhar"** (conferir o texto atual da ajuda, a verificar).

| Dado (categoria Google) | Coletado | Compartilhado | Opcional? | Finalidade | Onde |
|---|---|---|---|---|---|
| Endereço de e-mail | Sim | Não | Não (conta) | Gerenciamento de conta; funcionalidade | Supabase Auth |
| Nome | Sim | Não | Sim | Funcionalidade; personalização | `profiles.name` |
| IDs de usuário | Sim | Não (RevenueCat como prestador) | Não | Gerenciamento de conta; assinatura | Supabase, RevenueCat |
| Localização precisa (e aproximada) | Sim, durante o treino ativo (inclusive com a tela bloqueada, via serviço em primeiro plano) | Não | Sim (sem permissão não grava corrida) | Funcionalidade do app | `activities.route` |
| Informações de fitness | Sim: distância, duração, ritmo, rota, tipo | Não | Sim | Funcionalidade; personalização | `activities` |
| Informações de saúde | Não são dados médicos. Objetivo, nível e dias por semana do onboarding ficam em `profiles`; declarar como fitness/personalização | Não | Sim | Personalização | `profiles` |
| Histórico de compras | Sim (status e validade da assinatura) | Não (RevenueCat como prestador) | Só quem assina | Funcionalidade; gerenciamento de conta | `subscriptions`, RevenueCat |
| Informações de pagamento | **Não** (Google Play processa) | n/a | n/a | n/a | n/a |
| Login social (Google/Apple) | E-mail/nome vindos do token; já contados acima | Não | n/a | Autenticação | Supabase Auth |
| Falhas e diagnóstico | **Hoje não** (sem Sentry/analytics) | n/a | n/a | n/a | n/a |
| Anúncios | Não | Não | n/a | n/a | n/a |

Observações:

- Entrando analytics, crash reporting, push ou integração com relógios/Health
  Connect, **refazer este mapa** antes do envio.
- O SDK do RevenueCat pode registrar identificadores de instalação; conferir a
  página de privacidade deles ao preencher (a verificar).
- A localização é "coletada" porque a rota é enviada ao servidor ao salvar.

## 4. Exclusão de conta

Fonte: [Exclusão de conta no Play](https://support.google.com/googleplay/android-developer/answer/13327111).

| Requisito | Situação |
|---|---|
| Caminho de exclusão **dentro do app**, fácil de achar | Feito: Perfil > Conta > excluir (Edge Function `delete-account`) |
| **URL web** para pedir exclusão (sem precisar do app), informada no Play Console (Data safety > exclusão de dados) | **Falta.** Criar página pública com instruções + e-mail/formulário (`[E-MAIL DE CONTATO]`) |
| Informar o que é apagado e o que fica retido (e por quanto tempo) | Na política de privacidade (rascunho cobre) e na página web |
| Desativar/congelar não conta | OK: a função apaga o usuário e as tabelas caem em cascata (`on delete cascade`) |

## 5. Permissões

| Permissão | Uso | Declaração |
|---|---|---|
| `ACCESS_FINE_LOCATION` / `ACCESS_COARSE_LOCATION` | Distância/ritmo/rota durante o treino iniciado pelo usuário, inclusive com a tela bloqueada | Somente "durante o uso"; sem formulário de localização em segundo plano |
| `ACCESS_BACKGROUND_LOCATION` | **Não usada** (`isAndroidBackgroundLocationEnabled: false`, mantida em `blockedPermissions`) | Conferir no manifesto final que não aparece |
| `FOREGROUND_SERVICE` / `FOREGROUND_SERVICE_LOCATION` | Serviço em primeiro plano do tipo `location` com notificação persistente "Paceless — treino em andamento" (`isAndroidForegroundServiceEnabled: true`) | Declaração de serviço em primeiro plano no Play Console (tipo Localização) com vídeo |
| `POST_NOTIFICATIONS` | Exibir a notificação do serviço em primeiro plano (Android 13+) | Permissão em tempo de execução pedida ao iniciar o treino |

Política: [Permissões de localização](https://support.google.com/googleplay/android-developer/answer/9799150).
Decisão: o rastreio com tela bloqueada usa serviço em primeiro plano iniciado
com o app visível e a permissão "durante o uso". Isso dispensa
`ACCESS_BACKGROUND_LOCATION` e o formulário de localização em segundo plano. O
`expo-location` documenta que `startLocationUpdatesAsync` com `foregroundService`
não exige a permissão de segundo plano.

Declaração de serviço em primeiro plano (Play Console > Conteúdo do app):
- Tipo: Localização. Descrição: o usuário inicia um treino e o app registra
  distância, ritmo e rota até ele finalizar; o serviço para ao finalizar,
  descartar ou fechar o treino.
- Vídeo (obrigatório): mostrar iniciar o treino, a notificação persistente
  aparecendo, o bloqueio da tela, o treino continuando e a finalização.

## 6. Política de assinaturas e pagamentos

Fonte: [Política de pagamentos do Play](https://support.google.com/googleplay/android-developer/answer/9858738) (link exato a verificar).

- Cobrança digital no app usa o **Google Play Billing** (RevenueCat usa isso).
- Antes da compra, informar claramente: preço, periodicidade, o que inclui,
  que renova automaticamente até cancelar e como cancelar.
- Teste grátis (se houver): duração e preço depois dele.
- Cancelamento: Play Store > Pagamentos e assinaturas > Assinaturas. Citar no
  paywall ou nos termos.

Paywall hoje: mostra título, preço (vindo da loja), "Restaurar compras", o
bloco `SubscriptionDisclosure` (renovação automática, como cancelar) e links
de Termos e Privacidade. Feito.

## 7. Declarações do App content

| Declaração | Resposta sugerida |
|---|---|
| Política de privacidade | URL obrigatória |
| Acesso ao app | Há login: fornecer **conta de teste** (seção 10) |
| Anúncios | Não contém |
| Público-alvo | Adultos (18+) sugerido, evita regras de "Families". Decidir com o Pedro |
| Apps de saúde (Health apps declaration) | O Play pede o formulário para apps com recursos de saúde/fitness. Paceless: atividade física/bem-estar, sem dados médicos, sem Health Connect. Textos exatos a verificar no console. [Ajuda](https://support.google.com/googleplay/android-developer/answer/14738291) (a verificar) |
| Aviso médico | Incluir nos termos/no app: o plano não substitui orientação médica |
| ID de publicidade | Não usa; conferir se algum SDK injeta `AD_ID` e remover se sim (a verificar) |
| Financeiro, notícias, governo, COVID | Não se aplica |

## 8. Classificação indicativa

Fonte: [Classificação de conteúdo](https://support.google.com/googleplay/android-developer/answer/9859655).
Categoria do questionário: a verificar (provavelmente "Utilitário/Referência"
ou "Esportes"). Respostas esperadas: sem violência, sexo, linguagem imprópria,
drogas ou jogos de azar; **sem conteúdo gerado por usuário visível a outros**
(o compartilhamento em redes é futuro e deve ser reavaliado); sem
compartilhamento de localização com outros usuários. Resultado esperado: Livre.

## 9. Ficha da loja

Fonte: [Recursos de visualização](https://support.google.com/googleplay/android-developer/answer/9866151).

| Item | Especificação | Status |
|---|---|---|
| Nome | até 30 caracteres | "Paceless" |
| Descrição curta | até 80 caracteres, PT-BR | a escrever |
| Descrição completa | até 4000 caracteres, PT-BR | a escrever |
| Ícone | 512x512 PNG, até 1 MB | `store/google-play/icon-512.png` (`npm run store:assets`) |
| Feature graphic | 1024x500 PNG/JPEG | `store/google-play/feature-1024x500.png` (textos a aprovar) |
| Capturas de celular | 2 a 8; lados entre 320 e 3840 px; proporção máx. 2:1 (ideal 9:16) | em `store/google-play/screenshots/`, tiradas no aparelho com dados reais |
| Tablet 7"/10" | opcional | opcional |
| Categoria | Saúde e fitness | |
| Contato | e-mail público (`[E-MAIL DE CONTATO]`) | |

## 10. Acesso do revisor (conta de teste)

1. Criar no Supabase de produção um usuário revisor com senha forte, e-mail
   confirmado e onboarding concluído.
2. Dar a ele o entitlement `premium`: conta de licença de teste do Play
   (License testing) ou linha manual em `subscriptions`.
3. Informar e-mail/senha em "Instruções de acesso" e explicar que a permissão
   de localização é pedida ao iniciar o treino.
4. Dizer que Google/Apple login pode ser ignorado em favor de e-mail/senha.

## 11. Sequência de lançamento

1. Conta aprovada, app criado, ficha e App content preenchidos.
2. `eas build -p android --profile production` e `eas submit` para teste
   interno, depois teste fechado (12 x 14 dias se conta pessoal), depois pedir
   produção. Reservar margem para a revisão de contas novas.
