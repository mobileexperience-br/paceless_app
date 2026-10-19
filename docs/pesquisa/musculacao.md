# Musculação e mobilidade para corredores

Pesquisa feita em 19/10/2026. Itens sem fonte confirmada estão como **a verificar**.

## Por que existe

O onboarding já pergunta "Quer incluir musculação?" (`strength`: sim / talvez depois / não, só corrida) com o texto "Treino de força reduz lesão e melhora o ritmo". O mockup tem a tela **Musculação** (abas Treinos e Exercícios, cards Força A/B/C e Core, botão "Novo treino"), alcançada pelo Acesso rápido.

## Evidência (para não prometer demais)

- Em um ensaio de 2024 com corredores novatos, um programa de **quadril e core** duas vezes por semana, por 24 semanas, teve menos lesões em membros inferiores que o grupo de alongamento ([SCMP](https://www.scmp.com/lifestyle/health-wellness/article/3279615/how-avoid-running-injuries-beginners-stronger-hips-and-core-are-key-study-finds)).
- Um programa de **pé e tornozelo** por 8 semanas reduziu risco em quase 60% num estudo brasileiro citado por [The Conversation](https://theconversation.com/running-injuries-dont-happen-for-the-reasons-you-think-heres-the-three-best-ways-to-prevent-them-178475).
- Um programa curto e autoguiado (10 min, 3x/semana) em maratonistas de primeira viagem **não** reduziu lesões ([Marathon Handbook](https://marathonhandbook.com/strength-training-2/), fonte secundária).
- Os estudos são pequenos e nenhum isola "2 dias por semana". Redação do produto: "ajuda a reduzir o risco", nunca "evita lesão".

## O que os concorrentes fazem

| App | Força |
|---|---|
| Runna | Oferece treino de força e mobilidade junto ao plano (a verificar o escopo atual) |
| Nike Run Club | Foco em corrida; força: a verificar |
| Strava | Registra atividade de força, sem programa; a verificar |
| Garmin Coach | Plano de corrida; força: a verificar |

Nenhum item acima foi confirmado nas fontes desta pesquisa. Validar nos apps antes de usar como argumento.

## Opções de conteúdo

| Opção | Prós | Contras | Esforço |
|---|---|---|---|
| **Biblioteca própria curada** (tabela no Supabase) | Qualidade e tom controlados; sem dependência; combina com o público iniciante | Alguém precisa produzir/curar exercícios, textos e mídia | M (código) + conteúdo |
| **API/base aberta (ex.: wger)** | Rápido de popular; REST API | App sob AGPL, dados de exercício em CC BY-SA 3.0 (**atribuição + compartilhamento igual**), imagens com licenças variadas por item ([wger](https://wger.readthedocs.io/en/2.0/), [exercemus](https://github.com/exercemus/exercises)); conteúdo em inglês e voltado a academia, não a corredor; passa por chamada externa (via Edge Function, regra do projeto) | M |
| Base open-source de exercícios (ex.: free-exercise-db) | Dados prontos | Licença: **a verificar** | P |
| Vídeos de parceiro/fisioterapeuta | Mais confiável para iniciante | Custo e prazo; depende do Pedro/parceiros | G |

**Recomendação:** biblioteca própria e pequena (20 a 30 exercícios), em português, com programas curtos (15 a 25 min). Opcionalmente semear a lista a partir de uma base aberta **depois** de conferir a licença. Não consumir API externa no client.

## Como encaixa nas telas do mockup

| Mockup | Uso |
|---|---|
| Aba **Treinos** | Programas prontos: "Força A: corpo todo (45 min)", "Core (20 min)". No mockup, B é membros inferiores e C é superiores; para corredor, priorizar **quadril, glúteos, core, panturrilha e pé** |
| Aba **Exercícios** | Biblioteca pesquisável por grupo muscular |
| **Novo treino** | Montar treino próprio a partir da biblioteca (pode ficar para depois) |
| Atividades | Já mostra "Treino de força A" ao lado das corridas; precisa do mesmo registro |
| Plano/semana | Dias de força aparecem na agenda (ex.: Quarta: Treino de força A, 45 min) |
| Onboarding | `strength = yes` liga força no plano; `maybe_later` oferece depois; `no` esconde |

Mockup usa fotos de pessoas nos cards. Regra do projeto: sem mock; usar mídia real ou estado sem imagem (ícone lucide `Dumbbell`).

## Modelo de dados (esboço)

| Tabela | Colunas |
|---|---|
| `exercises` | `id`, `slug`, `name`, `muscle_group`, `category` (`strength`, `mobility`, `core`), `level`, `instructions` (texto), `media_url` (opcional), `tips`, `contraindication_note` |
| `strength_programs` | `id`, `title`, `focus`, `duration_min`, `level`, `is_premium` |
| `program_exercises` | `program_id`, `exercise_id`, `position`, `sets`, `reps` ou `duration_s`, `rest_s` |
| `strength_sessions` | `id`, `user_id`, `program_id` (nulo se avulso), `started_at`, `duration_s`, `completed` |
| `strength_session_sets` (opcional) | `session_id`, `exercise_id`, `set_no`, `reps`, `load_kg` |

`exercises` e `strength_programs` são leitura pública autenticada; sessões com RLS por `user_id` e cascade no delete da conta. Alternativa mais simples para registrar a sessão: gravar em `activities` com `type = 'strength'`.

## Escopo recomendado para o MVP

1. Conteúdo estático curado (seed), 3 programas curtos para corredor iniciante e ~25 exercícios com texto passo a passo.
2. Abas Treinos e Exercícios lendo do banco; detalhe do exercício.
3. Executar um programa (lista com séries/repetições e marcar feito) e **registrar a sessão** em Atividades.
4. Sem "Novo treino" personalizado, sem carga/peso, sem vídeo.
5. Aviso simples de segurança ("pare se sentir dor"); revisão do conteúdo por profissional.

## Esforço

**M** sem mídia e sem personalização; **G** com vídeos próprios e treino personalizado. O trabalho principal é de conteúdo, não de código.

## Riscos

- Responsabilidade por conteúdo de saúde: precisa de revisão de educador físico/fisioterapeuta.
- Licença de conteúdo/imagens (CC BY-SA exige atribuição e compartilhamento igual).
- Mídia aumenta o peso do app; vídeo exige hospedagem/CDN (Supabase Storage: a avaliar custo).
- Iniciante fazendo "Força A" de academia sem equipamento: priorizar peso corporal.

## Perguntas para o Pedro

1. Quem produz e revisa o conteúdo? Há fisioterapeuta ou educador físico envolvido?
2. Só peso corporal ou também equipamento de academia?
3. Força é grátis ou premium?
4. Precisa de vídeo/animação no MVP?
5. "Novo treino" personalizado entra agora ou depois?
6. Os 3 programas do mockup (A/B/C) ficam como estão ou viram foco em corrida?
