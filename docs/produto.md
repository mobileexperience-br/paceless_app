# Produto

Visão do produto, a partir da reunião de 19/10/2026 (Jonatas + Pedro).
Onde a nota não confirma, está marcado **a confirmar**.

Legenda de status: **Hoje** (existe no app) · **Planejado** · **Por último**.
"Hoje" aqui significa só a camada visual; ver [estado-atual.md](./estado-atual.md).

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
| Onboarding | Perguntas iniciais ao usuário | Hoje (só visual; respostas não persistem) |
| Paywall e assinatura | Assinatura via RevenueCat | Hoje (só visual) |
| Plano, semana e treino | Telas do plano de corrida | Hoje (só visual, sem dados) |
| Atividades | Histórico de corridas | Hoje (estado vazio) |
| Jornada 5 → 7 → 10 km | Progressão segura, sem lesão | Planejado |
| Plano adaptativo | Todo domingo à noite a IA gera o plano da semana seguinte, com base nas métricas e resultados enviados pelo corredor (a partir de relógio). Agenda respeita os dias disponíveis (ex.: 2 dias/semana → quarta e sábado) | Planejado |
| Trilha para avançados | Manter recorrência (assinatura) | Planejado |
| Gamificação e motivação | Escopo a definir | Planejado (a confirmar) |
| Compartilhamento | Compartilhar métricas da corrida nas redes, com opções de layout (estilo Strava): com foto de fundo, sem foto, transparente; escolha de quais métricas exibir | Planejado |
| Integração com relógio | Origem das métricas do plano adaptativo. Quais relógios/plataformas: a confirmar | Planejado |
| Nutrição com IA | Anamnese (diabetes, intolerância à lactose etc.) e proposta de dieta voltada à corrida. Existe aba visual, vazia | **Por último** |

## Concorrentes

| Concorrente | Observação |
|---|---|
| Strava | Experiência genérica |
| Runna (Garmin) | Experiência genérica |
| "Vila" | Nome transcrito, **a confirmar** |

## Sinais de mercado

- Prova com mais de 13 mil pessoas e 3 mil corredores (leitura exata do
  número: a confirmar).
- Cerca de 300 provas por fim de semana no Brasil.
- Possível parceria com organizadores de prova.

## Validação de mercado

- Revisão crítica externa com especialista (Igor): a agendar.
- Estudo de mercado: pendente.

## Perguntas em aberto

| Pergunta | Status |
|---|---|
| Nome do terceiro concorrente ("Vila") | a confirmar |
| Stack: as notas do Gemini dizem "adoção de Flutter", mas a transcrição não sustenta. O time segue com Expo | a confirmar |
| Escopo da gamificação | a confirmar |
| Relógios/plataformas suportados | a confirmar |
| Documento de requisitos detalhado | Pendente com o Pedro |
| Notas de desenvolvimento do Pedro | Pendente com o Pedro |
| Estudo de mercado e revisão com o Igor | Pendente |
| Modelo de parceria com organizadores de prova | a confirmar |

Publicação nas lojas: [publicacao-lojas.md](./publicacao-lojas.md).
