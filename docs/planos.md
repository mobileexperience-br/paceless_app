# Planos de treino gerados por regras

Como o Paceless monta o plano de corrida do usuário. A geração é **determinística e sem IA**:
a mesma entrada sempre dá o mesmo plano. O código vive em
`supabase/functions/_shared/plan/` (módulo puro, com testes em `generate.test.ts`) e é
chamado pela Edge Function `generate-plan` (ver [edge-functions.md](./edge-functions.md)).

> **Todos os números deste documento estão marcados como "a validar com o Pedro".**
> Nada aqui é regra fechada até o Pedro revisar. Quando ele mudar um número, muda a
> tabela em `tables.ts` (ou a regra em `volume.ts`, `days.ts`, `intervals.ts`), sobe
> `GENERATOR_VERSION` e roda os testes.

## Entradas

Vêm do perfil (`profiles`) e do início escolhido pelo usuário:

| Entrada | Valores | De onde |
| --- | --- | --- |
| Objetivo (`goal`) | `start_running` (começar a correr), `run_5k`, `run_10k`, `fitness` | Configurações do plano |
| Preparo (`level`) | `never_ran` (nunca corri), `sometimes` (corro às vezes), `weekly` (corro toda semana) | Configurações do plano |
| Dias de treino (`training_days`) | 1 a 7 (1 = segunda, 7 = domingo) | Configurações do plano |
| Musculação (`strength`) | `yes`, `maybe_later`, `no` | Configurações do plano |
| Início (`startDate`) | Data local `AAAA-MM-DD` | Hoje, ou a data original do plano em upgrade |

## 4.1 Duração do plano (semanas)

*(a validar com o Pedro)*

| Objetivo \ preparo | Nunca corri | Corro às vezes | Corro toda semana |
| --- | --- | --- | --- |
| Começar a correr | 8 | 6 | 6 |
| Rumo aos 5 km | 10 | 8 | 6 |
| Rumo aos 10 km | 12 | 10 | 8 |
| Condicionamento | 8 | 8 | 8 |

## 4.2 Volume semanal

*(a validar com o Pedro)*

| Preparo | Minutos na semana 1 | Máx. de corridas por semana | Teto de minutos por semana |
| --- | --- | --- | --- |
| Nunca corri | 60 | 3 | 150 |
| Corro às vezes | 75 | 4 | 200 |
| Corro toda semana | 100 | 5 | 260 |

Regras de progressão:

- Cada semana normal aumenta **10%** sobre a semana normal anterior (*a validar com o Pedro*).
- **Semana de recuperação:** a cada 4 semanas (semanas 4, 8, 12...), exceto a última.
  Ela tem **80%** da semana normal anterior, e a semana seguinte volta da última semana
  normal, sem contar a recuperação (*a validar com o Pedro*).
- **Polimento (taper):** só em 5 km e 10 km, na última semana, com **70%** da semana
  anterior. Nessa semana acontece a sessão de prova (*a validar com o Pedro*).
- Os minutos são arredondados para múltiplos de 5 e limitados ao teto.

## 4.3 Dias de corrida

*(a validar com o Pedro)*

- Número de corridas na semana = o menor entre os dias de treino escolhidos e o máximo da
  tabela 4.2. Os dias que sobram **não viram descanso** e não geram sessão.
- Os dias de corrida são escolhidos a intervalos regulares dentro dos dias de treino.
  Exemplo: com 6 dias e 3 corridas, entram o 1º, o 3º e o 5º dia da lista.
- **Corrida longa:** sempre o último dia de corrida da semana (sábado ou domingo, quando
  o usuário escolheu esses dias).
- **Treino de ritmo ou fartlek:** só para 5 km e 10 km, preparo "corro às vezes" ou
  "corro toda semana", a partir da semana 3, fora da recuperação e do polimento, e só
  quando a semana tem 3 ou mais corridas. Cai no dia do meio, entre o primeiro dia e o dia
  longo. Nas semanas pares é treino de ritmo; nas ímpares, fartlek.
- **Musculação** (só com `strength = yes`): até 2 sessões por semana, no mesmo dia de uma
  corrida, na segunda sessão do dia. Nunca cai no dia longo nem no dia de ritmo. Pega o
  primeiro e o terceiro dia candidatos.

## 4.4 Minutos por sessão

*(a validar com o Pedro)*

- Com 3 ou mais corridas: a longa tem **35%** do volume da semana. Com 2 corridas: **55%**.
  O resto é dividido igualmente entre as outras corridas.
- Mínimo de 20 min por sessão. A longa tem no máximo 90 min.
- Com 1 corrida por semana (dia único escolhido): ela é a longa e usa o volume da semana,
  limitado a 90 min.
- Em objetivo "começar a correr" e "condicionamento", a longa só recebe o nome "Corrida longa"
  com 40 min ou mais. Abaixo disso, o nome é "Corrida leve".
- Em 5 km e 10 km, a longa sempre se chama "Corrida longa".
- O treino de ritmo e o fartlek têm duração fixa pelos blocos (ver 4.7), e não pelo volume.

## 4.5 Caminhada e corrida (intervalos)

*(a validar com o Pedro)*

Vale para **quem nunca correu, em qualquer objetivo**, e para quem "corre às vezes" nas
duas primeiras semanas. Quem "corre toda semana" não tem intervalos.

| Estágio | Corrida | Caminhada | Repetições |
| --- | --- | --- | --- |
| 1 | 1 min | 2 min | 8 |
| 2 | 1 min 30 s | 2 min | 7 |
| 3 | 2 min | 2 min | 6 |
| 4 | 3 min | 1 min 30 s | 6 |
| 5 | 5 min | 2 min | 4 |
| 6 | 8 min | 2 min | 3 |
| 7 | 10 min | 1 min | 3 |
| 8 | corrida contínua | | |

- **Nunca corri:** a semana usa o estágio igual ao número da semana. Na recuperação,
  repete o estágio da semana anterior. Do estágio 8 em diante, a corrida vira contínua,
  no volume da seção 4.4.
- **Corro às vezes:** semana 1 no estágio 5, semana 2 no estágio 6. Depois, corrida contínua.
- Em uma semana com intervalos, a sessão é: 5 min de caminhada, as repetições e 5 min
  de caminhada. A duração do bloco substitui o volume da seção 4.4.
- Os intervalos valem para **todas** as corridas da semana, inclusive a longa.

## 4.6 Datas

- A âncora é a segunda-feira da semana do início. Se algum dia de corrida da semana 1 cair
  antes do início, a semana 1 começa na **segunda seguinte**.
- Data de cada treino: `âncora + (semana − 1) × 7 + (dia − 1)`.
- Nenhum treino cai antes da data de início.
- Datas são `AAAA-MM-DD` e calculadas em UTC, sem fuso. O início vem do aparelho
  (data local) e é validado no servidor, com tolerância de 1 dia para o fuso.
- **Fuso horário de "hoje":** o servidor assume `America/Sao_Paulo` para decidir o que já
  passou (vira `skipped`) e o que ainda é planejado (`p_today` em `generate-plan/index.ts`).
  Usuários em outros fusos podem ver a fronteira entre passado e futuro deslocada em um dia.

## 4.7 Estrutura das sessões

*(a validar com o Pedro)*

| Sessão | Passos | Intensidade / zona | Duração alvo |
| --- | --- | --- | --- |
| Corrida leve ou longa | Caminhada 5 min, corrida (total − 10 min), caminhada 5 min | Fácil / 2 | Total da sessão |
| Caminhada e corrida | Caminhada 5 min, repetições (corrida + caminhada), caminhada 5 min | Fácil / 2 | Soma dos passos |
| Treino de ritmo (semana par) | Caminhada 10 min, 3 × (5 min em ritmo moderado + 2 min leves), caminhada 5 min | Moderada / 3 | Soma dos passos (36 min) |
| Fartlek (semana ímpar) | Caminhada 10 min, 6 × (1 min forte + 2 min leves), caminhada 5 min | Moderada / 3 | Soma dos passos (33 min) |
| Prova (última semana, 5 km e 10 km) | Caminhada 10 min, corrida na distância da prova, caminhada 5 min | Moderada / 3 | Sem tempo alvo: a distância é o alvo (5.000 m ou 10.000 m) |
| Fortalecimento | 3 rodadas de: agachamento 45 s, elevação de quadril 45 s, prancha 30 s, panturrilha 45 s, descanso 60 s | Sem zona | Soma dos passos (11 min) |

Pontos para o Pedro decidir:

- **Fortalecimento:** a especificação pedia cerca de 20 min, mas os passos dão
  3 × (45 + 45 + 30 + 45 + 60) s = 675 s, cerca de **11 min** (o app mostra 11 min 15 s).
  A descrição imprime a duração calculada pelos passos, sem valor fixo. Os passos não mudam
  até o Pedro dizer o que quer (mais rodadas, aquecimento ou outro bloco).
- **Prova:** o passo de corrida não tem tempo alvo (`durationSec = 0` no código). Quem
  mostra o treino deve usar a distância, não o tempo.

## Plano grátis e premium

*(a validar com o Pedro)*

- **Grátis:** só as **2 primeiras semanas** do mesmo plano, com `tier = free` e o nome
  "(2 semanas)". As semanas são iguais às do plano completo, então a regra de progressão
  não muda.
- **Premium:** o plano completo.
- O tier é decidido **no servidor**, pela linha em `subscriptions` (entitlement `premium`,
  ativa e não expirada). Hoje o webhook do RevenueCat ainda não está publicado, então
  **todo usuário é grátis**.
- **Upgrade para premium:** quando o usuário vira premium, o plano é regenerado com a
  **mesma data de início**. As semanas 1 e 2 não mudam, e o histórico fica.
- Na Parte 1 o app não dispara o upgrade. O parâmetro `force` existe para a Parte 2
  (depois do paywall, chamar `generate(true)`).

## Regeneração e histórico

- Salvar as configurações do plano (ou terminar o onboarding) chama `generate-plan`.
- Se as entradas do plano não mudaram (mesmo `settings_hash`: objetivo, preparo, dias,
  musculação, tier e versão do gerador), nada é gerado e o plano atual é devolvido. A checagem
  roda antes e dentro da RPC (sob lock), então duas chamadas seguidas não duplicam o plano.
- Se mudaram, o plano ativo é cancelado e um novo é criado, com início na próxima âncora válida.
  O histórico vai para o novo plano pela **data e posição** do treino:
  - treinos `done` e `skipped` do plano anterior são copiados para o treino de mesma data,
    mesma posição e mesmo tipo (status, atividade e data de conclusão);
  - treinos `planned` com data anterior a hoje viram `skipped` no plano anterior;
  - treinos `planned` de hoje em diante são apagados do plano anterior e recriados pelas regras;
  - se o novo plano não tem treino equivalente, o treino passado entra como `skipped` e o
    futuro entra como `planned`.
- Com `force`, o plano é regenerado mesmo sem mudança de entradas, com a mesma regra de histórico.
- **Done e skipped aparecem nos dois planos:** o plano cancelado mantém os treinos `done` e
  `skipped`, e o plano novo recebe uma cópia deles (mesma data, posição e atividade). Por isso
  as estatísticas precisam ler só o plano ativo (ver "Estatísticas" abaixo).
- Cada geração cria um novo registro em `plans` com `owner_id` do usuário. O catálogo
  (`owner_id` nulo) não é usado por esse fluxo.
- Duas chamadas ao mesmo tempo são serializadas por um lock do usuário no banco.
- **Falha na regeneração:** o perfil já fica salvo. O botão volta como **"Tentar novamente"**
  e só refaz a geração, sem gravar o perfil de novo. Ele some quando a geração funciona.
- **Estatísticas (Parte 2):** os números devem ler só o `user_plan` ativo (`status = 'active'`),
  ou ignorar planos cancelados. O histórico copiado para o plano novo mantém o mesmo
  `activity_id` do plano cancelado, então sem esse filtro a mesma atividade conta duas vezes.

## Desvios da especificação original

- **`p_today` e `p_force` na RPC:** foram mantidos. São necessários para tratar a corrida entre
  duas chamadas e para fazer a checagem do `settings_hash` dentro do lock. Sem eles, a checagem
  antes da RPC não garantiria nada.
- **Cópia do histórico para o plano novo:** foi mantida. Como consequência, `done` e `skipped`
  existem nos dois planos (ver "Regeneração e histórico").
- **Estatísticas (Parte 2):** precisam ler só `user_plans.status = 'active'`, ou deduplicar por
  `activity_id`. Essa regra é obrigatória para o cálculo não contar a mesma atividade duas vezes.

- **Vínculo treino x sessão (Parte 2):** o `lib/plannedWorkout.ts` foi removido. Ele tinha um
  escritor (a tela de detalhe da sessão) e nenhum leitor. O vínculo já viaja pela rota
  `session` e por `ActiveSession.userPlanWorkoutId`, então o módulo não fazia nada.

## Perguntas em aberto para o Pedro

1. **Perda de premium:** hoje não regeneramos sozinhos. O plano completo continua até a
   próxima mudança de configuração, e aí o plano novo sai grátis. Quer regenerar na hora
   em que a assinatura expira?
2. **Fortalecimento:** manter 11 min, ou subir para 20 min com mais rodadas? (ver seção 4.7)
3. **Recuperação:** a cada 4 semanas, e 80% do volume. Confirmar, ou trocar para o
   padrão de 3 semanas?
4. **Treino de ritmo e fartlek na semana de prova:** hoje a prova substitui o treino de
   ritmo. Confirmar.
5. **Teto de corridas:** 3, 4 e 5 por semana conforme o preparo. Confirmar, e confirmar
   se quem tem 6 ou 7 dias deve correr só 3 ou 4 vezes.
6. **Espalhamento dos dias de corrida:** com 5 dias de treino e 3 corridas, `round(i × n / cap)`
   (com n = 5 e cap = 3) escolhe dois dias seguidos: o 1º, o 3º e o 4º da lista. A alternativa
   `floor((i + 0.5) × n / cap)` escolhe o 1º, o 3º e o 5º, bem espaçados. Qual usar?
7. **Recuperação com intervalos:** a semana de recuperação repete o estágio da semana
   anterior (seção 4.5), então o volume não cai nela. As repetições devem ser reduzidas nessa
   semana?
8. **Queda de volume ao sair dos intervalos:** ao passar de intervalos para corrida contínua,
   o volume cai. Exemplo: 5 km, preparo "corro às vezes", a sessão longa vai de 40 para 30 min
   entre as semanas 2 e 3. Ajustar a transição para não cair?
9. **Histórico na regeneração e no upgrade:** treinos `done` e `skipped` são copiados para o
   novo plano pela data e posição; `planned` passados viram `skipped`; `planned` futuros são
   recriados pelas regras. Confirmar essa regra (ver "Regeneração e histórico").
10. **Salto para corrida contínua:** a primeira semana contínua pode subir bastante. Exemplo:
    10 km, preparo "nunca corri", dias [2, 4]. A semana 9 soma 86 min (2 × 43) e a semana 10
    soma 115 min (50 + 65, com a longa de 65 min). É um salto de cerca de 34%. Limitar a
    primeira semana contínua a 10–15% do volume real da semana anterior? Hoje não há teto de
    crescimento nesse ponto: a regra de 4.4 define os minutos, e a regra de 10% vale só
    entre semanas normais seguidas.

## Parte 2: itens registrados (sem mudança de código na Parte 1)

Achados da revisão de QA. São válidos, mas ficam para a Parte 2.

- **Saltos grandes de volume** *(a validar com o Pedro)*: exemplos do QA: `run_10k` com
  preparo "nunca corri" e dias [2, 4] vai de 60 para 115 min; `start_running` com preparo
  "às vezes" e 1 dia vai de 40 para 90 min. A pergunta 10 acima calcula 86 → 115 min para o
  primeiro caso. Conferir os números com `buildPlan` antes de validar com o Pedro.
  Correção sugerida: limitar a primeira semana contínua a cerca de 1,2× a última semana com
  intervalos.
- **Sem plano e sem como tentar de novo:** se a regeneração ou a sincronização do onboarding
  falha, o usuário pode ficar sem plano ativo. A Parte 2 precisa mostrar "Gerar plano" na tela
  do plano quando não há plano ativo, para que a geração possa ser refeita.
- **Plano terminado com hash igual:** a Parte 2 chama `generate(true)` quando o plano termina
  ou depois de um upgrade no paywall. Como o hash não muda, só `force` gera o novo ciclo. Decidir
  se o término cria um novo ciclo com as mesmas configurações e começando hoje. Lembrar que a
  cópia do histórico casa por data e posição, então ela quase não copia nada nesse caso.

## Parte 2: telas

As telas leem o plano ativo com `hooks/useActivePlan.ts` (consulta em `lib/planQueries.ts`). Toda a
lógica de estado é pura e está em `lib/planProgress.ts`.

**Estados da sessão.** A coluna `user_plan_workouts.status` tem três valores, e a tela calcula o
estado com `sessionState(status, data, hoje)`:

| Estado | Regra | Chip |
| --- | --- | --- |
| `done` | `status = 'done'` | Concluído |
| `missed` | `status = 'skipped'`, ou `planned` com data antes de hoje | Perdido |
| `today` | `planned` com data igual a hoje | Hoje |
| `pending` | os demais (`planned` futuro) | Pendente |

"Perdido" usa a data local do aparelho (`localToday()`). O servidor usa São Paulo, então uma
divergência de um dia na virada é aceitável.

**Descanso é inferido.** Dia sem sessão não vira linha no banco. A tela de semana mostra
"Descanso" nos dias sem sessão, e a Home mostra "Hoje é dia de descanso" quando não há treino
hoje e há uma próxima sessão.

**Semana atual e próximo treino.** A semana atual é a que contém hoje. Antes do início, é a
semana 1. Depois do fim do plano, é a última semana (`full_weeks`). O próximo treino é a primeira
sessão `today` ou `pending`, ordenada por data e posição. Musculação conta. Se há duas sessões no
mesmo dia, a Home mostra a primeira não concluída.

**Bloqueio premium.** O free tem só as semanas 1 e 2 no banco, e a Edge Function não grava as
outras. A UI mostra as semanas `weeks + 1` até `full_weeks` como bloqueadas, com ícone de cadeado.
Tocar em uma delas, ou em "Ver planos" no card de upsell, abre `app/(app)/plan-paywall.tsx`
(modal). Semana bloqueada na URL mostra o estado "Semana bloqueada". Plano antigo sem
`full_weeks` não mostra semanas bloqueadas, mas o card de upsell continua se o tier for `free`.

**Compra no paywall.** Compra ou restauração com sucesso chama `generate(true)`, depois recarrega o
plano e fecha o modal. Se o plano recarregado ainda for `free`, mostra o aviso "Assinatura
confirmada. Seu plano completo será liberado em instantes.". O webhook do RevenueCat ainda não
está publicado, então essa situação é esperada até lá. O client não libera nada por conta própria.

**Vínculo com o treino.** O treino de uma sessão é iniciado com
`/workout/plano?session=<user_plan_workout_id>`. Esse id segue assim:

1. entra no `ActiveSession` (`userPlanWorkoutId`), então sobrevive ao `?resume=1`;
2. no finish, vai no draft da atividade como `user_plan_workout_id`. Treino curto (menos de 10 s)
   não vincula nada;
3. a atividade é gravada, e o trigger do banco marca a sessão como `done`. O client não faz
   `update` em `user_plan_workouts`.

**Fila offline.** Se o insert falha, a atividade vai para a fila com o vínculo. A sessão continua
`pending` até o flush. Depois do flush, o `notifyActivitiesChanged` recarrega o plano. O summary
avisa "Será marcado no plano quando a conexão voltar". Na fila, um draft antigo sem o campo é lido
como `null`.

Se a policy recusar o vínculo (o plano foi regenerado durante o treino, então a sessão não é mais
do plano ativo), a atividade é gravada **sem** o vínculo. Sem esse fallback, o draft ficaria
parado na fila para sempre.

O mesmo vale para a fila offline. Se o plano for regenerado antes do flush, a atividade da fila
é gravada **sem** o vínculo, e a sessão antiga não é marcada. A sessão do plano novo continua
`pending` até o treino ser feito de novo. Nenhuma atividade é perdida, só o vínculo com a sessão.

**Plano ausente.** Sem plano ativo, a tela de configurações mostra o botão "Gerar plano", mesmo
sem nenhuma alteração. Esse é o caminho de nova tentativa quando a geração falha no cadastro
(o onboarding salva as respostas no perfil e chama `generate-plan`; se a chamada falha, o estado
do onboarding é limpo mesmo assim, porque as respostas já estão no perfil). Ao tocar no botão,
o app gera o plano e recarrega a Home e a aba Plano.

**Musculação.** A sessão de musculação não tem treino guiado ainda. O detalhe mostra a
mensagem de que o registro chega em breve, e não mostra botão de início. Esse é o próximo passo
da fase, e precisa de decisão do produto.

**Não entra nesta fase.** Cronômetro por passo durante a corrida (os passos só aparecem no
detalhe). Marcar sessão como pulada manualmente. Planos gerados por IA.

## Limitações conhecidas

- **Volume nas semanas de intervalo:** nas semanas com caminhada e corrida, a soma de minutos
  pode passar da meta semanal, porque o gerador não recalcula o volume a partir dos intervalos.
  Correção prevista para uma fase própria do gerador.
- **Semana 3 mais leve:** em alguns cenários, a terceira semana sai mais leve do que as semanas 1
  e 2. A regra de progressão ainda não cobre esse caso.

## Pendências antes do merge

- A migration `20261029000000_generated_plans.sql` **não foi executada** em nenhum banco local
  ou de branch. Ela precisa ser validada antes do merge com estes cenários:
  1. chamar `replace_generated_plan` para um usuário novo;
  2. chamar de novo com configurações alteradas;
  3. chamar no upgrade de free para full (mesma data de início);
  4. excluir o usuário pela Edge Function `delete-account`.
- Não foi possível rodar `supabase db reset` nesta worktree: não há `supabase/config.toml` e a
  stack local do Supabase não está baixada (subir a stack exige rede).
- Teste de exclusão de conta com plano gerado, plano cancelado e sessão `done`: pendente de
  banco local.
- Os testes do gerador rodam com `node --test supabase/functions/_shared/plan/generate.test.ts`.
  Em Node 22, passar só o diretório não roda os testes.
