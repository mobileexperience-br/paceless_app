PRODUCT REQUIREMENTS DOCUMENT \| PRD TÉCNICO v1.0

Data-base: 29 de outubro de 2026 \| Status: rascunho para validação \|
Responsável funcional: Product Owner

Objetivo: especificar o MVP de formação de corredores iniciantes até 5
km contínuos e registrar o backlog de evolução sem confundir propostas
com decisões homologadas.

# Controle e rastreabilidade

  -----------------------------------------------------------------------
  Classificação                       Interpretação
  ----------------------------------- -----------------------------------
  Confirmado                          Decisão registrada ou
                                      funcionalidade explicitamente
                                      exibida nos mockups

  Proposto                            Possibilidade discutida sem
                                      homologação funcional completa

  Recomendado                         Especificação criada neste PRD para
                                      viabilizar engenharia

  P0 / P1 / P2                        Essencial ao MVP / próximo
                                      incremento / evolução posterior
  -----------------------------------------------------------------------

Observação: valores de tempo, calorias, distância e frequência cardíaca
vistos em mockups são exemplos de interface, não parâmetros prescritos.

# 1. Contexto e estratégia

# 1.1 Problema

Iniciantes frequentemente não sabem como dosar caminhada, corrida, força
e descanso. A comparação por pace pode desmotivar e a ausência de
progressão clara dificulta a consistência.

# 1.2 Proposta de valor

Acompanhar a jornada do zero até completar 5 km sem caminhar, por meio
de plano progressivo, execução guiada, acompanhamento de progresso e
reforço positivo.

# 1.3 Público

Primário: sedentários, iniciantes e pessoas que correm trechos curtos
sem completar 5 km continuamente. Os mockups também apresentam opções
intermediário e avançado, mas o suporte a essas jornadas não está no
escopo P0.

# 1.4 Resultados de produto

- Ativação: percentual de contas que concluem onboarding e recebem
  plano.

- Engajamento: percentual de usuários que concluem ao menos um treino na
  primeira semana.

- Aderência: sessões concluídas / sessões programadas elegíveis,
  excluindo descanso.

- Retenção: usuários ativos em D7 e D30, com definição de atividade
  instrumentada.

- Resultado: percentual que registra 5 km contínuos; validar qualidade
  do registro.

- Segurança: incidentes reportados, treinos interrompidos por dor e taxa
  de falsos avanços.

Metas numéricas são pendentes de baseline e não devem ser inventadas.

# 2. Escopo e releases

  -----------------------------------------------------------------------
  Release                 Incluído                Excluído / dependência
  ----------------------- ----------------------- -----------------------
  MVP P0                  Conta, onboarding,      IA generativa, feed
                          plano-base, calendário, social, receitas
                          execução, resumo,       completas, integrações
                          histórico, progresso,   de terceiros
                          descanso, conquistas    
                          simples                 

  R1 P1                   Musculação, nutrição    Depende de conteúdo
                          básica, hidratação,     validado e regras de
                          recuperação,            privacidade
                          notificações, gráficos  

  R2 P2                   Planos adaptativos      Depende de validação de
                          avançados, comunidade,  mercado, consentimento
                          temporadas,             e integrações
                          dispositivos,           
                          compartilhamento        
  -----------------------------------------------------------------------

# 2.1 Fora do escopo explícito do MVP

- Diagnóstico médico, prescrição clínica ou substituição de
  acompanhamento profissional.

- Garantia de completar 5 km em oito semanas.

- Ranking por velocidade como principal mecanismo de recompensa.

- Monetização, assinatura e paywall até decisão comercial.

# 3. Personas e jornadas

  -----------------------------------------------------------------------
  Persona                 Estado inicial          Necessidade
  ----------------------- ----------------------- -----------------------
  Iniciante total         Não corre ou está       Alternar caminhada e
                          retornando              corrida, aumentar
                                                  continuidade

  Iniciante irregular     Corre trechos curtos    Organizar frequência e
                                                  progressão sem exageros

  PO / suporte            Administra experiência  Diagnosticar falhas,
                                                  auditar evolução e
                                                  atender solicitações
  -----------------------------------------------------------------------

Jornada P0: boas-vindas \> conta \> objetivo \> disponibilidade \> nível
\> plano gerado \> dashboard \> detalhes \> execução \> resumo/sensação
\> salvar \> histórico/progresso \> próxima sessão.

# 4. Épicos, histórias e critérios de aceite

# EP-01 Identidade e conta

  -----------------------------------------------------------------------
  ID                Requisito /       Prioridade        Origem
                    comportamento                       
  ----------------- ----------------- ----------------- -----------------
  AUTH-01           Cadastro por      P0                Mockup +
                    e-mail e senha,                     recomendado
                    validação de                        
                    campos e                            
                    confirmação de                      
                    conta                               

  AUTH-02           Login, logout e   P0                Mockup +
                    recuperação de                      recomendado
                    senha                               

  AUTH-03           Perfil editável,  P0                Mockup + LGPD
                    preferências e                      
                    exclusão de conta                   

  AUTH-04           Apple/Google como P1                Mockup, pendente
                    provedores                          
                    opcionais                           
  -----------------------------------------------------------------------

## US-AUTH-01 \| criar minha conta

Como novo usuário, quero criar minha conta, para manter meu progresso
entre sessões.

Critérios de aceite:

- CA1: E-mail inválido e senha fora da política são rejeitados com
  mensagens acessíveis.

- CA2: Conta existente não é duplicada.

- CA3: Sessão autenticada é persistida com armazenamento seguro de
  credenciais.

- CA4: Após cadastro, usuário sem onboarding é redirecionado à etapa
  pendente.

# EP-02 Onboarding

  -----------------------------------------------------------------------
  ID                Requisito /       Prioridade        Origem
                    comportamento                       
  ----------------- ----------------- ----------------- -----------------
  ONB-01            Selecionar        P0                Mockup
                    objetivo:                           
                    completar 5 km,                     
                    prova,                              
                    condicionamento                     
                    ou emagrecer                        

  ONB-02            Selecionar ao     P0                Mockup
                    menos dois dias                     
                    disponíveis por                     
                    semana                              

  ONB-03            Selecionar nível: P0                Mockup
                    iniciante total,                    
                    iniciante,                          
                    intermediário ou                    
                    avançado                            

  ONB-04            Definir jornada   P0                Confirmado +
                    elegível e gerar                    recomendado
                    plano                               

  ONB-05            Histórico de      P1                Recomendado
                    limitações e                        
                    lesões, com                         
                    consentimento e                     
                    aviso                               
  -----------------------------------------------------------------------

## US-ONB-01 \| receber um plano inicial adequado

Como iniciante, quero receber um plano inicial adequado, para ter uma
rotina viável.

Critérios de aceite:

- CA1: Continuar fica bloqueado com menos de dois dias selecionados.

- CA2: Objetivo, nível e disponibilidade são persistidos.

- CA3: Usuários fora do público do plano-base recebem mensagem clara,
  não um plano inadequado.

- CA4: O plano criado referencia versão de template e data de início.

# EP-03 Planejamento e calendário

  -----------------------------------------------------------------------
  ID                Requisito /       Prioridade        Origem
                    comportamento                       
  ----------------- ----------------- ----------------- -----------------
  PLAN-01           Plano-base de     P0                Mockup
                    oito semanas,                       
                    organizado por                      
                    semanas e sessões                   

  PLAN-02           Treinos com       P0                Mockup
                    aquecimento,                        
                    principal e                         
                    desaquecimento                      

  PLAN-03           Dias de descanso  P0                Mockup
                    visíveis no                         
                    calendário                          

  PLAN-04           Repetir semana    P0                Recomendado
                    sem perder                          
                    histórico                           

  PLAN-05           Reagendar sessão  P1                Recomendado
                    respeitando                         
                    disponibilidade                     

  PLAN-06           Ajuste            P2                Proposto
                    automatizado de                     
                    carga conforme                      
                    tolerância                          
  -----------------------------------------------------------------------

## US-PLAN-01 \| consultar meus treinos da semana

Como corredor, quero consultar meus treinos da semana, para saber o que
fazer e quando descansar.

Critérios de aceite:

- CA1: A semana exibe cada dia com treino, duração, intensidade ou
  descanso.

- CA2: Sessão concluída tem status distinto de pendente e interrompida.

- CA3: Mudança de semana preserva sessões anteriores.

- CA4: O sistema não avança automaticamente se regras mínimas de
  conclusão não forem satisfeitas.

# EP-04 Execução da corrida

  -----------------------------------------------------------------------
  ID                Requisito /       Prioridade        Origem
                    comportamento                       
  ----------------- ----------------- ----------------- -----------------
  RUN-01            Iniciar, pausar,  P0                Mockup
                    retomar, bloquear                   
                    tela e finalizar                    
                    sessão                              

  RUN-02            Exibir            P0                Mockup
                    cronômetro,                         
                    distância, pace e                   
                    FC quando                           
                    disponível                          

  RUN-03            Exibir blocos de  P0                Recomendado
                    treino e orientar                   
                    transições                          

  RUN-04            Salvar resumo com P0                Mockup
                    sensação                            
                    pós-treino                          

  RUN-05            Registrar voltas  P1                Arte de
                    com tempo,                          estatísticas
                    distância, ritmo                    
                    e total                             

  RUN-06            GPS e sensores    P1                Recomendado
                    externos com                        
                    qualidade e                         
                    permissões                          
                    explícitas                          
  -----------------------------------------------------------------------

## US-RUN-01 \| registrar uma sessão

Como corredor em treino, quero registrar uma sessão, para visualizar
execução e evolução.

Critérios de aceite:

- CA1: Cronômetro respeita pausa e retomada, distinguindo tempo
  decorrido e ativo.

- CA2: Finalizar exige confirmação para evitar toque acidental.

- CA3: Dados ausentes de FC são exibidos como indisponíveis, nunca zero
  medido.

- CA4: Salvar duas vezes a mesma sessão não gera duplicidade.

- CA5: Interrupção ou fechamento do app tem estratégia explícita de
  recuperação local.

## US-RUN-02 \| avaliar como me senti após o treino

Como corredor, quero avaliar como me senti após o treino, para registrar
tolerância ao esforço.

Critérios de aceite:

- CA1: Resumo mostra duração, distância e ritmo quando medidos.

- CA2: Usuário pode escolher sensação percebida ou pular.

- CA3: Sessão salva atualiza histórico e progresso uma única vez.

# EP-05 Dashboard e progresso

  -----------------------------------------------------------------------
  ID                Requisito /       Prioridade        Origem
                    comportamento                       
  ----------------- ----------------- ----------------- -----------------
  DASH-01           Saudação, semana  P0                Mockup
                    atual, progresso                    
                    e próximo treino                    

  DASH-02           Acesso rápido a   P0                Mockup
                    plano, corrida e                    
                    módulos                             

  DASH-03           Histórico e       P0                Mockup
                    indicadores de                      
                    sessões,                            
                    distância e tempo                   

  DASH-04           Gráficos por      P1                Mockup
                    período e                           
                    modalidade                          

  DASH-05           Indicador de      P1                Recomendado
                    maior corrida                       
                    contínua                            
  -----------------------------------------------------------------------

## US-DASH-01 \| ver meu próximo treino e progresso

Como usuário recorrente, quero ver meu próximo treino e progresso, para
retomar a jornada rapidamente.

Critérios de aceite:

- CA1: Tela mostra plano ativo e próxima sessão elegível.

- CA2: Progresso é calculado sobre sessões programadas e concluídas, sem
  contar descanso como falha.

- CA3: Sem plano ativo, é exibida ação para iniciar onboarding/plano.

# EP-06 Gamificação

  -----------------------------------------------------------------------
  ID                Requisito /       Prioridade        Origem
                    comportamento                       
  ----------------- ----------------- ----------------- -----------------
  GAME-01           Conquista por     P0                Diretriz definida
                    primeiro treino e                   
                    semana concluída                    

  GAME-02           XP, níveis e      P1                Mockup + diretriz
                    sequências                          

  GAME-03           Temporadas e      P2                Proposto
                    desafios                            

  GAME-04           Mascote em        P1                Identidade
                    mensagens e                         definida
                    marcos                              
  -----------------------------------------------------------------------

## US-GAME-01 \| receber reconhecimento por consistência

Como iniciante, quero receber reconhecimento por consistência, para
manter motivação.

Critérios de aceite:

- CA1: Conquista é concedida apenas uma vez por condição.

- CA2: Descanso planejado não quebra sequência de consistência.

- CA3: Não há incentivo a ignorar dor, fadiga ou orientação de descanso.

# EP-07 Musculação

  -----------------------------------------------------------------------
  ID                Requisito /       Prioridade        Origem
                    comportamento                       
  ----------------- ----------------- ----------------- -----------------
  STR-01            Biblioteca de     P1                Mockup
                    treinos Força A,                    
                    B, C e Core                         

  STR-02            Lista de          P1                Mockup
                    exercícios e                        
                    detalhes por                        
                    sessão                              

  STR-03            Criar treino      P1                Mockup
                    personalizado                       

  STR-04            Registrar séries, P1                Recomendado
                    repetições e                        
                    carga                               
  -----------------------------------------------------------------------

## US-STR-01 \| registrar treino de força

Como corredor, quero registrar treino de força, para acompanhar
fortalecimento complementar.

Critérios de aceite:

- CA1: Treino apresenta exercícios, duração prevista e nível.

- CA2: Conclusão gera atividade vinculada ao usuário.

- CA3: Treino de força não é contabilizado como corrida.

# EP-08 Nutrição

  -----------------------------------------------------------------------
  ID                Requisito /       Prioridade        Origem
                    comportamento                       
  ----------------- ----------------- ----------------- -----------------
  NUT-01            Resumo diário de  P1                Mockup
                    calorias e                          
                    proteína                            

  NUT-02            Adicionar         P1                Mockup
                    refeições por                       
                    período do dia                      

  NUT-03            Plano, receitas e P1                Mockup
                    lista de compras                    

  NUT-04            Metas ajustáveis  P1                Recomendado
                    sem prescrição                      
                    universal                           
  -----------------------------------------------------------------------

## US-NUT-01 \| registrar minhas refeições

Como usuário, quero registrar minhas refeições, para visualizar consumo
diário.

Critérios de aceite:

- CA1: Total diário reflete entradas persistidas.

- CA2: Edição ou exclusão recalcula totais sem duplicar.

- CA3: Estimativas e fontes de valores nutricionais são identificadas.

# EP-09 Hidratação e recuperação

  -----------------------------------------------------------------------
  ID                Requisito /       Prioridade        Origem
                    comportamento                       
  ----------------- ----------------- ----------------- -----------------
  WELL-01           Registrar água e  P1                Pilar +
                    visualizar                          recomendado
                    progresso diário                    

  WELL-02           Lembretes         P1                Recomendado
                    configuráveis                       

  WELL-03           Registrar sono,   P1                Pilar +
                    fadiga e                            recomendado
                    desconforto                         

  WELL-04           Exibir descanso   P0                Mockup
                    programado                          

  WELL-05           Orientação para   P1                Recomendado
                    procurar                            
                    avaliação em                        
                    sinais de alerta                    
  -----------------------------------------------------------------------

## US-WELL-01 \| registrar fadiga e desconfortos

Como corredor, quero registrar fadiga e desconfortos, para não avançar
cegamente.

Critérios de aceite:

- CA1: Relato importante de dor exibe orientação conservadora.

- CA2: O sistema não prescreve diagnóstico ou tratamento.

- CA3: Dados de saúde possuem consentimento e controles de acesso
  adequados.

# EP-10 Comunidade, IA e integrações

  -------------------------------------------------------------------------
  ID                Requisito /         Prioridade        Origem
                    comportamento                         
  ----------------- ------------------- ----------------- -----------------
  EXT-01            Aba de comunidade e P2                Mockup
                    escopo social a                       
                    definir                               

  EXT-02            Planos adaptativos  P2                Proposto
                    com motor auditável                   
                    de regras                             

  EXT-03            IA para mensagens   P2                Proposto
                    contextualizadas,                     
                    com revisão                           

  EXT-04            Dispositivos        P2                Mockup, contrato
                    conectados e                          pendente
                    provedores externos                   
  -------------------------------------------------------------------------

# 5. Regras de negócio transversais

  -----------------------------------------------------------------------
  ID                                  Regra
  ----------------------------------- -----------------------------------
  BR-01                               Aderência semanal = sessões
                                      elegíveis concluídas / sessões
                                      programadas elegíveis; dias de
                                      descanso não entram no denominador.

  BR-02                               Uma sessão tem estados scheduled,
                                      in_progress, paused, completed,
                                      interrupted e cancelled, com
                                      transições validadas.

  BR-03                               Avanço de semana não deve ocorrer
                                      somente pela passagem do
                                      calendário; política de conclusão
                                      precisa ser homologada.

  BR-04                               Conclusão de 5 km contínuos exige
                                      regra validada para pausas, lacunas
                                      de GPS e precisão; ainda pendente.

  BR-05                               Dados de FC, calorias e distância
                                      devem ter origem: medido, estimado
                                      ou manual.

  BR-06                               Recompensas e XP são idempotentes,
                                      e descanso prescrito não é
                                      penalizado.

  BR-07                               Metas de nutrição e hidratação são
                                      configuráveis, não prescrições
                                      automáticas universais.

  BR-08                               Exclusão de conta dispara fluxo de
                                      eliminação/anonimização conforme
                                      bases legais e retenções
                                      aplicáveis.
  -----------------------------------------------------------------------

# 6. Mapa de telas e navegação

  -----------------------------------------------------------------------
  Grupo                   Telas                   Status
  ----------------------- ----------------------- -----------------------
  Acesso                  Boas-vindas, cadastro,  Mockup
                          login                   

  Onboarding              Objetivo, dias, nível,  Mockup
                          criação do plano        

  Principal               Dashboard, plano,       Mockup
                          calendário, detalhes    

  Execução                Cronômetro, pausa,      Mockup
                          encerramento, resumo    

  Histórico               Atividades, progresso,  Mockup
                          conquistas              

  Complementar            Musculação, exercícios, Mockup
                          nutrição, refeições,    
                          receitas                

  Evolução                Hidratação,             A especificar
                          recuperação, comunidade 

  Conta                   Perfil, preferências,   Mockup
                          notificações,           
                          dispositivos, ajuda     
  -----------------------------------------------------------------------

Decisão pendente NAV-01: alternativa A = Início / Plano / Progresso /
Comunidade / Perfil; alternativa B = Início / Plano / Atividades /
Nutrição / Perfil. Não implementar ambas sem escolha explícita.

# 7. Modelo de dados lógico recomendado

  -----------------------------------------------------------------------
  Entidade                Campos-chave            Relações
  ----------------------- ----------------------- -----------------------
  users                   id, email,              1:N plans, sessions,
                          display_name, status,   logs
                          created_at              

  onboarding_profiles     user_id, goal, level,   1:1 users
                          available_days,         
                          completed_at            

  plan_templates          id, version,            1:N training_plans
                          duration_weeks,         
                          eligibility_rules       

  training_plans          id, user_id,            1:N planned_sessions
                          template_id,            
                          start_date, status,     
                          current_week            

  planned_sessions        id, plan_id,            1:N workout_segments;
                          scheduled_date, type,   0:1 activity_session
                          status, order           

  workout_segments        id, planned_session_id, N:1 planned_sessions
                          kind, target_duration,  
                          intensity, order        

  activity_sessions       id, user_id,            1:N session_laps
                          planned_session_id,     
                          started_at, ended_at,   
                          active_seconds,         
                          distance_m, source,     
                          status                  

  session_laps            id, session_id,         N:1 activity_sessions
                          lap_index,              
                          duration_seconds,       
                          distance_m              

  strength_templates      id, title, level,       1:N strength_exercises
                          duration_min            

  meal_entries            id, user_id, eaten_at,  N:1 users
                          meal_type,              
                          calories_kcal,          
                          protein_g               

  hydration_logs          id, user_id,            N:1 users
                          consumed_at, volume_ml  

  recovery_logs           id, user_id, date,      N:1 users
                          sleep_rating, fatigue,  
                          pain_flag               

  achievements            id, code,               1:N user_achievements
                          criteria_version        

  user_achievements       id, user_id,            unique(user_id,
                          achievement_id,         achievement_id)
                          awarded_at              

  xp_transactions         id, user_id, event_id,  unique(event_id,
                          amount, created_at      user_id)

  device_connections      id, user_id, provider,  N:1 users
                          scope, connected_at     
  -----------------------------------------------------------------------

Diretrizes: UUIDs, timestamps UTC, unidade canônica metros/segundos,
versionamento de templates, índices por user_id e created_at, exclusão
lógica apenas quando justificada, migrações versionadas.

# 8. Contratos de API sugeridos

Padrão sugerido: REST JSON sobre HTTPS; versão /v1; autenticação Bearer;
erros padronizados com code, message, details e request_id. Contratos
abaixo são propostas, não endpoints existentes.

  -------------------------------------------------------------------------------------
  Método                  Rota                                  Responsabilidade
  ----------------------- ------------------------------------- -----------------------
  POST                    /v1/auth/register                     Criar conta

  POST                    /v1/auth/login                        Autenticar

  GET/PATCH               /v1/me                                Ler/editar perfil

  PUT                     /v1/me/onboarding                     Salvar avaliação
                                                                inicial

  POST                    /v1/training-plans                    Gerar plano elegível

  GET                     /v1/training-plans/active             Consultar plano

  GET                     /v1/planned-sessions?from=&to=        Calendário

  GET                     /v1/planned-sessions/{id}             Detalhes e segmentos

  POST                    /v1/activity-sessions                 Iniciar sessão

  PATCH                   /v1/activity-sessions/{id}            Atualizar
                                                                estado/telemetria

  POST                    /v1/activity-sessions/{id}/complete   Finalizar e registrar
                                                                sensação

  GET                     /v1/activity-sessions                 Histórico paginado

  GET                     /v1/progress/summary                  Indicadores agregados

  GET                     /v1/achievements                      Conquistas

  GET/POST                /v1/meal-entries                      Nutrição (R1)

  GET/POST                /v1/hydration-logs                    Hidratação (R1)

  GET/POST                /v1/recovery-logs                     Recuperação (R1)
  -------------------------------------------------------------------------------------

# 8.1 Exemplo de payload

POST /v1/activity-sessions/{id}/complete

{ \"ended_at\": \"2026-10-29T13:30:00Z\", \"active_seconds\": 1802,
\"distance_m\": 3020, \"avg_heart_rate_bpm\": 152, \"perceived_effort\":
3, \"source\": \"device\", \"client_event_id\": \"uuid\" }

Resposta: { \"id\": \"uuid\", \"status\": \"completed\",
\"progress_updated\": true, \"awarded_achievements\": \[\] }.
Client_event_id garante idempotência e protege contra duplicação
offline.

# 9. Eventos e analytics

  -----------------------------------------------------------------------
  Evento                  Quando                  Propriedades mínimas
  ----------------------- ----------------------- -----------------------
  signup_completed        Conta criada            method, app_version

  onboarding_completed    Perfil inicial          goal, level, days_count
                          finalizado              

  plan_created            Plano gerado            template_version,
                                                  duration_weeks

  workout_started         Treino iniciado         session_id,
                                                  workout_type

  workout_paused          Treino pausado          session_id,
                                                  elapsed_seconds

  workout_completed       Sessão concluída        session_id, duration,
                                                  distance, source

  workout_interrupted     Treino interrompido     session_id,
                                                  reason_optional

  weekly_goal_completed   Semana elegível         plan_id, week_index
                          concluída               

  achievement_awarded     Conquista concedida     achievement_code,
                                                  criteria_version
  -----------------------------------------------------------------------

Evitar enviar e-mail, nome, localização precisa ou informações de saúde
para analytics sem base legal, necessidade e configuração adequada.

# 10. Requisitos não funcionais

  -----------------------------------------------------------------------
  Categoria                           Critério de aceite proposto
  ----------------------------------- -----------------------------------
  Desempenho                          P95 de respostas de leitura \<= 500
                                      ms em ambiente de referência,
                                      excluindo rede; definir SLO
                                      definitivo após benchmark.

  Confiabilidade                      Nenhuma sessão concluída pode ser
                                      duplicada por retry; sincronização
                                      offline deve reconciliar conflitos.

  Disponibilidade                     Meta inicial sugerida de 99,5%
                                      mensal para API; homologar com
                                      orçamento.

  Acessibilidade                      Contraste, labels acessíveis,
                                      tamanho de toque e escalabilidade
                                      de fonte; testar WCAG 2.2 AA onde
                                      aplicável.

  Segurança                           HTTPS, tokens curtos, armazenamento
                                      seguro, rate limit, validação
                                      server-side e princípio do menor
                                      privilégio.

  Privacidade                         LGPD: finalidade, transparência,
                                      minimização, consentimento quando
                                      aplicável, direitos do titular e
                                      política de retenção.

  Observabilidade                     Logs estruturados sem dados
                                      sensíveis, métricas de erros,
                                      tracing e alertas de falha de
                                      sincronização.

  Compatibilidade                     Definir versões mínimas iOS/Android
                                      e política de suporte antes do
                                      desenvolvimento.

  Qualidade                           Testes unitários, integração, E2E,
                                      acessibilidade, rede instável,
                                      bateria e GPS degradado.
  -----------------------------------------------------------------------

# 11. Estratégia de testes e Definition of Done

- Cada história possui critérios de aceite automatizáveis e evidências
  de teste.

- Testes de estado: iniciar \> pausar \> retomar \> concluir; finalizar
  após crash; duas requisições simultâneas.

- Testes de calendário: fuso horário, mudança de dia, semanas
  incompletas e descanso.

- Testes de plano: usuário com dois dias disponíveis, nível fora do
  escopo, repetição de semana.

- Testes de medição: GPS indisponível, FC ausente, distância zero, pausa
  prolongada.

- Testes de segurança: acesso cruzado entre usuários, autenticação
  expirada, exclusão de conta.

- Validação em dispositivos reais, incluindo app em segundo plano e
  permissões negadas.

- Documentação de API e migrações revisadas; telemetria, acessibilidade
  e rollback preparados.

# 12. Dependências e riscos

  -----------------------------------------------------------------------
  Risco                   Impacto                 Mitigação
  ----------------------- ----------------------- -----------------------
  Prescrição de treinos   Alto                    Conteúdo validado por
  inadequados                                     profissional habilitado
                                                  e regras conservadoras

  GPS impreciso e falso   Alto                    Qualidade do sinal,
  marco de 5 km                                   detecção de pausas e
                                                  política de validação

  MVP excessivamente      Alto                    Gate P0 restrito à
  amplo                                           jornada central

  Dados de saúde          Alto                    Privacy by design e
  sensíveis                                       revisão jurídica LGPD

  Desalinhamento entre    Médio                   Aprovar design system e
  duas navegações e duas                          fluxo único
  paletas                                         

  Dependência de          Médio                   Interfaces desacopladas
  provedores externos                             e fallback manual

  Gamificação estimulando Alto                    Recompensar aderência
  excesso de treino                               segura e descanso
                                                  programado
  -----------------------------------------------------------------------

# 13. Decisões abertas para o Product Owner

  -------------------------------------------------------------------------
  ID                      Decisão                   Impacto
  ----------------------- ------------------------- -----------------------
  DEC-01                  Foco exclusivo em         Elegibilidade e
                          iniciantes ou planos para conteúdo
                          níveis                    
                          intermediário/avançado?   

  DEC-02                  Oito semanas fixas ou     Motor de progressão
                          janela adaptável?         

  DEC-03                  Como homologar 5 km       Marco principal
                          contínuos com pausas e    
                          GPS?                      

  DEC-04                  Qual navegação inferior é Arquitetura UI
                          oficial?                  

  DEC-05                  #BCD243 ou #A3FF00 como   Design system
                          verde principal?          

  DEC-06                  GPS próprio,              Arquitetura mobile
                          HealthKit/Health Connect  
                          ou integração externa?    

  DEC-07                  Monetização e paywall?    Entitlements e billing

  DEC-08                  Qual tecnologia mobile,   Implementação
                          backend e infraestrutura? 

  DEC-09                  Quais critérios de        Segurança e gamificação
                          conclusão semanal e       
                          progressão?               

  DEC-10                  Quem valida o conteúdo de Qualidade e
                          corrida, força e          responsabilidade
                          nutrição?                 
  -------------------------------------------------------------------------

# 14. Critérios de go-live do MVP

- Usuário consegue criar conta, concluir onboarding e receber plano
  elegível.

- Plano, calendário, descanso e sessões estão consistentes.

- Treino pode ser iniciado, pausado, retomado, finalizado e salvo sem
  perda ou duplicação.

- Histórico e dashboard refletem dados persistidos.

- Progresso e conquistas não recompensam sessões duplicadas nem
  penalizam descanso prescrito.

- Falhas de rede e permissões negadas têm estados e mensagens claros.

- Fluxos LGPD, segurança, monitoramento, suporte e rollback foram
  verificados.

- Decisões DEC-01 a DEC-06 e DEC-09 foram homologadas antes do release
  correspondente.

# 15. Próximas ações

1\. Homologar decisões abertas. 2. Validar plano de oito semanas com
especialista em corrida. 3. Converter US em tickets com estimativa e
dependências. 4. Prototipar fluxos críticos. 5. Implementar vertical
slice: onboarding \> plano \> sessão \> progresso. 6. Executar beta
fechado e medir ativação, aderência e incidentes.

Fim do PRD v1.0 \| Documento-base para refinamento técnico, não
aprovação automática de propostas.
