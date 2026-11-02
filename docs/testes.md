# Testes

## Como rodar

```
npm test
```

O script roda `node --test` com `TZ=America/Sao_Paulo` (fuso do produto, DP-42) e carrega `scripts/test-hooks.mjs`, que resolve os imports `@/...`. Não há lib de teste nova.

Rode também `npx tsc --noEmit` e `npx eslint .` antes de terminar qualquer tarefa.

## O que cada arquivo cobre

| Arquivo | Cobertura (seção 11 do PRD) |
|---|---|
| `lib/planCalendar.test.ts` | Calendário: soma de dias, segunda-feira, diferença, nomes em PT-BR e virada de dia no fuso do produto |
| `lib/planProgress.test.ts` | Estados de sessão (concluída, em andamento, interrompida, cancelada, perdida, hoje, pendente), semana com descanso, progresso do plano |
| `lib/planWeekStatusParser.test.ts` | Aderência e avanço vindos do servidor (`get_plan_week_status`): aderência nula quando não há sessão elegível, motivos de bloqueio válidos |
| `lib/onboardingProgress.test.ts` | Elegibilidade de nível (DP-01) e próxima etapa do onboarding |
| `lib/workoutBlocks.test.ts` | Execução guiada: bloco atual, restante, fim do treino, tempo negativo |
| `lib/analyticsPayload.test.ts` | Privacidade dos eventos: lista permitida, corte de texto, arredondamento, NaN e null |
| `lib/analyticsRules.test.ts` | Deduplicação de conquistas e meta semanal, limite de 200 chaves, cadastro recente, rótulos |
| `supabase/functions/_shared/plan/generate.test.ts` | Gerador de plano: dois dias, nível fora do escopo, cadência, versão do gerador |

## Lacunas (não automatizadas)

Regras que moram em SQL não rodam com `node --test`: transições `transition_plan_session`, fechamento de semana, mínimo `ceil(2/3)`, conclusão pelo trigger da atividade, idempotência real de conquistas (`on conflict do nothing`) e acesso cruzado entre usuários (RLS). Exigem Supabase local com pgTAP (DP-43, pendente).

E2E, acessibilidade automatizada, rede instável, bateria e GPS degradado ficam no roteiro manual de `docs/go-live.md`.
