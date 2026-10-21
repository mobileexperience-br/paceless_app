# Gamificação

Pesquisa feita em 19/10/2026. O escopo está "a confirmar" em [produto.md](../produto.md).
Itens sem fonte confirmada estão como **a verificar**.

## Premissa de produto

O público sente **vergonha** (ver Problema em [produto.md](../produto.md)). Gamificação que
compara, expõe ou pune vai contra a proposta. Princípio: **competir só consigo mesmo, celebrar
progresso, nunca cobrar falta.**

## O que os concorrentes fazem

| App | Mecânicas |
|---|---|
| Strava | Placares, segmentos e desafios sociais (a verificar o catálogo atual) |
| Nike Run Club | Desafios de comunidade criados e compartilhados com amigos ([Nike](https://www.nike.com/a/running-goals)); medalhas/níveis: a verificar |
| Runna | Plano estruturado e progressão por semanas (a verificar mecânicas) |
| Garmin Coach | Plano adaptativo que ajusta conforme os treinos; sem foco social ([Garmin](https://www.garmin.com/en-GB/blog/which-adaptive-training-plan-is-right-for-you/)) |

## O que a pesquisa diz sobre streaks

- Mostrar a sequência aumenta a chance de manter o comportamento, **mas quebrar a sequência reduz a chance de continuar** nos dias seguintes, e dói menos quando a falha é do app do que quando o usuário "esqueceu" ([Psychology Today](https://www.psychologytoday.com/us/blog/ulterior-motives/202306/how-broken-streaks-sap-motivation), [Newswise](https://www.newswise.com/articles/research-explains-why-streaks-make-resolutions-stick)).
- Streaks podem gerar ansiedade e levar a comportamento contra o objetivo real ([Berkeley/Chibe](https://chibe.upenn.edu/event/rachel-gershon-phd%E2%94%82chibe-research-seminar/)); em corrida, o objetivo real inclui **descansar** para não se lesionar.
- Congelamentos e dias de descanso são padrão de mercado (ex.: [Uxcel](https://help.uxcel.com/articles/11024400-what-is-streak-freeze)). Que isso melhore retenção ou bem-estar não está provado nas fontes achadas.
- Números de ganho de engajamento de blogs de fornecedores (ex.: 340%) não têm fonte verificável; **não usar**.
- Pesquisa acadêmica específica (teoria da autodeterminação em apps de corrida): **a verificar**.

Conclusão de design: **streak diário é incompatível com corrida de iniciante** (precisa de dias de descanso).

## Proposta para o MVP

| Mecânica | Como funciona no Paceless | Por que não envergonha |
|---|---|---|
| **Meta semanal** (substitui streak) | "2 de 3 treinos da semana". Barra já existe no mockup (Progresso da semana) | Reinicia toda semana; nada "quebra" |
| **Semanas consecutivas cumpridas** | Conta semanas em que a meta do plano foi atingida; **dia de descanso planejado conta como cumprido**; 1 semana de perdão automática por mês | Perdão automático, sem pedir nem pagar |
| **Marcos da jornada** (níveis) | Primeiro treino, primeira corrida de 20 min, 1 km, 3 km, **5 km**, 7 km, **10 km** | São o objetivo do produto e não comparam ninguém |
| **Conquistas pessoais** (medalhas) | Primeira corrida, melhor ritmo próprio, mais longa, 4 semanas seguidas, voltei após pausa | "Voltei" celebra retorno em vez de punir ausência |
| Mensagem pós-treino | "Treino concluído" + 1 dado de progresso vs. você mesmo | Foco no esforço |

### O que NÃO fazer

- Sem ranking, sem comparação com outros, sem lista de amigos.
- Sem "você perdeu sua sequência!", sem contagem de dias parados, sem notificação de culpa.
- Sem moeda/loja de itens, sem XP numérico complexo no MVP.
- Mostrar conquistas só ao próprio usuário; compartilhar é escolha (ver [compartilhar-corrida.md](./compartilhar-corrida.md)).

### Tom das mensagens (exemplos)

| Situação | Texto |
|---|---|
| Voltou depois de dias | "Bom te ver de volta. Vamos retomar com um treino leve." |
| Semana incompleta | "Semana fechada. A próxima começa do zero, no seu ritmo." |
| Marco de 5 km | "Você completou 5 km. Isso é seu." |

Textos são rascunho; revisar com o Pedro.

## Modelo de dados (esboço)

| Tabela | Colunas |
|---|---|
| `achievement_definitions` | `code`, `title`, `description`, `kind` (`milestone`, `personal`), `threshold` (JSON simples) |
| `user_achievements` | `user_id`, `code`, `earned_at`, `activity_id` (opcional) |
| `weekly_goals` | `user_id`, `week_start`, `target_sessions`, `completed_sessions`, `met` |
| `journey_stage` (coluna em `profiles`) | `stage` (`start`, `5k`, `7k`, `10k`) e `stage_reached_at` |

Cálculo no **servidor** (view ou Edge Function ao salvar atividade), pois o app não deve ser a única fonte de regra de progresso; mesma lógica da regra free/premium. Detalhes de RLS: leitura só do próprio `user_id`.

## Esforço

- Meta semanal + marcos da jornada: **M**.
- Conquistas pessoais com tela de medalhas: **M**.
- Depende da tabela `activities` (trilha L) e do plano (Fase 5). Sem plano, só marcos por distância.

## Riscos

- Medalhas sem contexto viram ruído e dão trabalho de arte (assets).
- Regra de "semana cumprida" precisa casar com o plano adaptativo, que ainda não existe.
- Incentivar distância/velocidade pode empurrar o iniciante para lesão: marcos devem respeitar a progressão do plano.
- Free vs premium: o que é gratuito? A decidir (limite verificado no servidor).

## Perguntas para o Pedro

1. Aceita trocar "streak diário" por "meta semanal + semanas seguidas com perdão"?
2. Marcos da jornada (1, 3, 5, 7, 10 km) estão certos? Algum marco de tempo (ex.: 30 min contínuos)?
3. Haverá algum elemento social (opt-in) ou fica 100% individual?
4. Medalhas entram no MVP ou só a meta semanal?
5. Quem escreve e revisa o tom das mensagens?

**Resposta do Pedro (20/10/2026):** gamificação aprovada, com meta semanal sem sequência e conquistas de 1, 3, 5, 7 e 10 km. Elemento social, medalhas no MVP e o tom das mensagens seguem abertos. O schema já existe (`weekly_goals`, `achievements`, `user_achievements`), mas ainda não há tela.
