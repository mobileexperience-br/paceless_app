# Checklist de go-live do MVP

Fonte: PRD v1, seção 14. Atualizado na fase 5 (`docs/spec-fase5.md`).
Status: OK, Parcial (falta verificar em dispositivo real ou homologar) ou Pendente.

| # | Critério (PRD 14) | Status | Evidência / o que falta |
|---|---|---|---|
| 1 | Criar conta, concluir onboarding e receber plano elegível | Parcial | Fase 1 (fluxo conta → onboarding → plano → paywall). Falta rodar em iOS e Android com banco novo. |
| 2 | Plano, calendário, descanso e sessões consistentes | Parcial | Fases 1 e 3; testes `planCalendar`, `planProgress`, `generate`. Falta testar virada de semana em dispositivo. |
| 3 | Treino iniciado, pausado, retomado, finalizado e salvo sem perda ou duplicação | Parcial | Fases 2 e 3: id gerado no cliente (DP-19), fila offline, retomada após crash. Falta roteiro manual (abaixo). |
| 4 | Histórico e dashboard refletem dados persistidos | Parcial | Fase 4 (`get_progress_summary`, histórico). Falta conferir com dados reais. |
| 5 | Progresso e conquistas não recompensam duplicadas nem penalizam descanso | Parcial | Trigger com `on conflict do nothing` (DP-32), descanso sem linha (DP-31). Sem teste SQL automatizado (DP-43). |
| 6 | Falhas de rede e permissões negadas com estados e mensagens claros | Parcial | Auditoria da fase 5 (spec seção 4) e correção no Início. Falta passar o roteiro em modo avião. |
| 7 | LGPD, segurança, monitoramento, suporte e rollback verificados | Pendente | Existem termos/privacidade e exclusão de conta. Faltam: provedor de crash/monitoramento (lib nova), alerta de falha de sync, canal de suporte definido, plano de rollback (OTA em `docs/ota.md` + migrations reversas). |
| 8 | DEC-01 a DEC-06 e DEC-09 homologadas | Pendente | Decisões provisórias em `docs/decisoes-provisorias-prd.md` aguardam o Pedro: DEC-01 (DP-01), DEC-02 (DP-03), DEC-03 (sem decisão), DEC-04 (sem decisão), DEC-05 (sem decisão), DEC-06 (GPS próprio + HealthKit/Health Connect já implementados), DEC-09 (DP-25, DP-31). |

## Requisitos não funcionais (PRD 10)

| Categoria | Status | Nota |
|---|---|---|
| Desempenho | Pendente | Sem benchmark de P95. |
| Confiabilidade | Parcial | Idempotência por id do cliente e fila offline. |
| Disponibilidade | Pendente | Depende do plano do Supabase. |
| Acessibilidade | Parcial | Labels e `accessibilityRole` nas telas; falta auditoria WCAG 2.2 AA. |
| Segurança | Parcial | RLS, lógica sensível em Edge Function/RPC; falta revisão de rate limit. |
| Privacidade | Parcial | Analytics sem dados pessoais (DP-38); falta política de retenção. |
| Observabilidade | Pendente | Só log de dev; precisa lib aprovada. |
| Compatibilidade | Pendente | Definir versões mínimas iOS/Android. |
| Qualidade | Parcial | `npm test` cobre lógica pura; faltam SQL, E2E e testes em dispositivo. |

## Roteiro manual em dispositivo real

1. Conta nova por e-mail e por Google/Apple → onboarding → plano pronto → paywall → Início.
2. Iniciar treino do plano, pausar, retomar, finalizar → resumo "salvo" → sessão concluída no plano.
3. Repetir o passo 2 em modo avião → resumo "guardado" → religar a rede → atividade aparece uma só vez.
4. Matar o app no meio do treino → reabrir → retomar → finalizar sem duplicar.
5. Negar GPS → aviso no treino; negar notificações → aviso no perfil.
6. Início, Plano, Histórico e Conquistas em modo avião → mensagens de erro com "Tentar novamente".
7. Excluir conta → dados somem e volta para a tela inicial.
8. Com `__DEV__`, conferir no console os eventos `[analytics]` de cada passo e que nenhum traz e-mail, nome ou localização.
