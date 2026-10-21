# Produto

Visão do produto, a partir da reunião de 19/10/2026 (Jonatas + Pedro) e das
respostas do Pedro de 20/10/2026 ([pendencias-pedro.md](./pendencias-pedro.md)).
Onde a nota não confirma, está marcado **a confirmar**.

Legenda de status: **Hoje** (existe no app) · **Planejado** · **Por último**.
Detalhes do que existe em [estado-atual.md](./estado-atual.md).

## Visão

App de corrida focado em **iniciantes**. Acompanhar a pessoa até completar
5 km, depois 7 km, depois 10 km, progredindo com segurança, sem lesão e com
a sensação de ser acompanhada. Respeita a privacidade e a individualidade.

## Problema

- O Brasil tem cerca de 15 milhões de novos corredores.
- Vergonha ou medo de lesão.
- Não conseguem completar uma prova de 5 km correndo.
- Sem acesso a assessoria esportiva presencial.

## Público

| Segmento | Papel |
|---|---|
| Iniciante | Foco principal. Jornada 5 km → 7 km → 10 km |
| Corredor avançado | Trilha para manter recorrência (assinatura) |

## Proposta de valor

Treino que se adapta a cada pessoa, com acompanhamento sem exposição.
Strava e similares dão experiência genérica; o Paceless se diferencia pela
**personalização**.

## Funcionalidades

| Funcionalidade | Descrição | Status |
|---|---|---|
| Onboarding | Perguntas iniciais ao usuário, salvas no aparelho e migradas para o perfil após o cadastro | Hoje |
| Login | E-mail e senha, Google e Apple | Hoje |
| Paywall e assinatura | Assinatura via RevenueCat. Preço definido: R$ 267/ano e R$ 37/mês. Freemium de 15 ou 30 dias (duração a definir). Forma de pagamento (lojas × Hotmart) em discussão: [pagamento-hotmart.md](./pagamento-hotmart.md) | Hoje (ofertas reais; webhook ainda não publicado) |
| Corrida com GPS | Rastreio em segundo plano, resumo, parciais, histórico em Atividades | Hoje |
| Plano, semana e treino | Telas do plano de corrida | Hoje (estado vazio, sem plano real) |
| Dias de treino | Quantidade de dias com combinações predefinidas (ex.: ter/qui/sáb ou qua/sex/dom) | Em desenvolvimento |
| Jornada 5 → 7 → 10 km | Progressão segura, sem lesão | Planejado |
| Plano adaptativo | Todo domingo à noite a IA gera o plano da semana seguinte, com base nas métricas e resultados enviados pelo corredor (a partir de relógio). Agenda respeita os dias disponíveis (ex.: 2 dias/semana → quarta e sábado) | Planejado |
| Trilha para avançados | Manter recorrência (assinatura) | Planejado |
| Gamificação e motivação | Aprovada pelo Pedro: meta semanal sem sequência e conquistas de 1, 3, 5, 7 e 10 km ([pesquisa](./pesquisa/gamificacao.md)) | Planejado |
| Compartilhamento | Compartilhar métricas da corrida nas redes, com opções de layout (estilo Strava): com foto de fundo, sem foto, transparente; escolha de quais métricas exibir | Planejado (Stories: muito importante, mas não pode travar a primeira versão) |
| Integração com relógio | Origem das métricas do plano adaptativo. Relógios: Garmin, Apple Watch, Samsung, Coros e Polar | Planejado |
| Musculação | Conteúdo de educador físico com apoio de IA; o Pedro vai buscar um parceiro | Planejado |
| Área admin | Web separada, em outro domínio (não no app), por segurança e LGPD | Planejado |
| Nutrição com IA | Anamnese (diabetes, intolerância à lactose etc.) e proposta de dieta voltada à corrida. Existe aba visual, vazia | **Por último** |

## Concorrentes

| Concorrente | Observação |
|---|---|
| Strava | Experiência genérica |
| Runna (Garmin) | Experiência genérica |
| Zyla | Concorrente indicado pelo Pedro em 20/10 (provavelmente o "Vila" transcrito nas notas da reunião; a confirmar) |

## Sinais de mercado

- Prova com mais de 13 mil pessoas e 3 mil corredores (leitura exata do
  número: a confirmar).
- Cerca de 300 provas por fim de semana no Brasil.
- Possível parceria com organizadores de prova.

## Validação de mercado

- Revisão crítica externa com especialista (Igor): a agendar.
- Estudo de mercado: pendente.

## Plataformas

Celular é a prioridade. iPad pode ter, mas é secundário. Troca de plano é
feita pelo usuário no app, com a cobrança gerida pela loja; intervenção manual
só pelo suporte.

## Perguntas em aberto

| Pergunta | Status |
|---|---|
| Stack: as notas do Gemini dizem "adoção de Flutter", mas a transcrição não sustenta. O Pedro não respondeu explicitamente; o time segue com Expo | a confirmar |
| Duração do freemium (15 ou 30 dias) | a definir |
| Pagamento: lojas (RevenueCat) × Hotmart | em discussão |
| Apple Developer: conta pessoa física ou jurídica | Pedro decidindo |
| Documento de requisitos detalhado | Pendente com o Pedro |
| Notas de desenvolvimento do Pedro | Pendente com o Pedro |
| Estudo de mercado e revisão com o Igor | Pendente |
| Modelo de parceria com organizadores de prova | a confirmar |

Publicação nas lojas: [publicacao-lojas.md](./publicacao-lojas.md).
