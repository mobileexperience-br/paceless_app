# Decisões provisórias sobre o PRD v1.0

Onde o PRD (`docs/prd-v1.md`) deixa algo em aberto, adotamos um padrão conservador até o Pedro
(Product Owner) homologar. Cada item diz a fase que o introduziu. Trocar uma decisão aqui
significa revisar a spec da fase correspondente.

| ID | Tema (ref. PRD) | Decisão provisória | Fase |
|---|---|---|---|
| DP-01 | Público do plano (DEC-01, 1.3) | Só `total_beginner` e `beginner` recebem plano. Intermediário e avançado podem ser escolhidos, mas recebem "Seu plano ainda não está disponível" e entram no Início sem plano. | 1 |
| DP-02 | Objetivo x conteúdo (ONB-01) | Os 4 objetivos geram o mesmo plano-base de 5 km. O objetivo é gravado (perfil e plano) para uso futuro, mas não muda os treinos. | 1 |
| DP-03 | Duração e progressão (DEC-02, PLAN-01) | 8 semanas fixas, sem semana de recuperação nem polimento. Iniciante total: 1 estágio de caminhada/corrida por semana (estágios 1–8). Iniciante: estágios 5–8 nas semanas 1–4, depois corrida contínua leve (20/25/30/30 min) e 5 km em ritmo leve na última sessão da semana 8. Tudo em intensidade leve. Pendente validação por especialista (DEC-10). | 1 |
| DP-04 | Musculação no onboarding (STR é P1) | Pergunta removida do onboarding. `strength` padrão `'no'`, editável em Configurações do plano. | 1 |
| DP-05 | Rascunho pré-cadastro | Onboarding passa a acontecer depois da conta, com respostas gravadas direto no perfil. Rascunho em AsyncStorage e migração pós-signup removidos. Sem limpeza da chave antiga, porque banco e builds serão zerados. | 1 |
| DP-06 | Versão do template (US-ONB-01 CA4) | A versão do template é `plans.generator_version` (agora 3) e a data de início é `user_plans.started_at`. Não criamos tabela `plan_templates` nesta fase. | 1 |
| DP-07 | Mudar para nível não elegível com plano ativo | A geração é recusada (`422 level_not_supported`) sem mexer no banco: o plano anterior continua ativo e a tela mostra o aviso. | 1 |
| DP-08 | Portão de onboarding | Redireciona só quando o perfil foi lido e `onboarding_completed_at` é nulo. Se a leitura do perfil falhar, não redireciona (evita loop). | 1 |
| DP-09 | Disponibilidade (ONB-02) | Mantemos "quantos dias" + combinação pronta de dias. O mínimo de 2 dias já é garantido pelas opções, e Continuar fica bloqueado sem escolha. A escolha livre de dias fica para depois. | 1 |
| DP-10 | Paywall (2.1, DEC-07) | O PRD tira monetização do MVP até haver decisão comercial, mas mantemos o paywall por decisão do time. Ele aparece depois de "Seu plano está pronto", pode ser fechado e não aparece para quem recebeu "ainda não disponível". Plano grátis = 2 primeiras semanas. | 1 |
| DP-11 | Quando o onboarding conta como concluído | `onboarding_completed_at` é gravado quando a geração termina com plano ou com "não disponível". Se o app for fechado no "pronto" ou no paywall, a próxima abertura vai para o Início. Falha de rede não conclui. | 1 |
| DP-12 | Rótulos de nível | Cada nível tem uma descrição curta baseada nas personas do PRD (seção 3) para ajudar a pessoa a escolher. | 1 |
| DP-14 | Escala de sensação (RUN-04, US-RUN-02) | 5 níveis: Muito leve, Leve, Moderado, Difícil, Muito difícil (`very_easy`…`very_hard`), gravados em `activities.perceived_effort`. Opcional; pular deixa nulo. A atividade é salva ao finalizar; a sensação é gravada depois por update só dessa coluna. | 2 |
| DP-15 | Confirmação ao finalizar (US-RUN-01 CA2) | Botão de parar e o deslizar para finalizar abrem a mesma confirmação "Finalizar treino?". | 2 |
| DP-16 | Tempo decorrido x ativo (US-RUN-01 CA1) | "Tempo ativo" = cronômetro sem pausas (é a duração salva). "Tempo total" = relógio desde o início, inclusive pausas. | 2 |
| DP-17 | Blocos guiados (RUN-03) | O bloco atual é calculado só pelo tempo ativo e pelos passos da sessão do plano; não há avanço manual nem pular bloco. Ao acabar os blocos o treino continua até a pessoa finalizar. Treino livre não tem blocos. | 2 |
| DP-18 | Vibração e voz nas transições | Fora da fase: exigem lib nova (`expo-haptics`/`expo-speech`). Transição só visual (faixa "Agora: ..." por 4 s). Pendente aprovação de lib. | 2 |
| DP-19 | Idempotência (US-RUN-01 CA4) | O `id` da atividade é gerado no cliente no início do treino e guardado na sessão ativa; insert, nova tentativa e fila offline usam esse id (upsert ignora duplicado; fila substitui por id). | 2 |
| DP-20 | Sensação offline | Se a atividade ainda está na fila, a sensação entra no rascunho; se já foi enviada e o update falhar, fica numa fila local própria reenviada junto com a fila de atividades. | 2 |
