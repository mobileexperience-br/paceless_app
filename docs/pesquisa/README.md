# Pesquisa (Trilha R)

Propostas de cada tema, com concorrentes, opções para a nossa stack, escopo de MVP,
modelo de dados, esforço (P/M/G), riscos e perguntas para o Pedro.
Pesquisa de 19/10/2026; o que não foi confirmado está marcado **a verificar**.

| Tema | Recomendação em uma linha | Esforço |
|---|---|---|
| [relogios-e-saude.md](./relogios-e-saude.md) | Importar corridas via Health Connect (Android) e HealthKit (iOS); Garmin direto e Strava ficam fora (Garmin pausou novos acessos e a Strava proíbe uso de IA) | G |
| [notificacoes.md](./notificacoes.md) | Lembretes locais nos dias de treino com `expo-notifications`; push remoto só com o plano adaptativo; falta guardar quais dias o usuário treina | M |
| [compartilhar-corrida.md](./compartilhar-corrida.md) | Cartão 9:16 em três layouts (foto, claro, transparente) com `react-native-view-shot` e `expo-sharing`; Stories direto numa segunda etapa | M |
| [gamificacao.md](./gamificacao.md) | Meta semanal e marcos 5/7/10 km em vez de streak diário, com perdão automático e sem comparação | M |
| [musculacao.md](./musculacao.md) | Biblioteca própria e pequena em português, focada em quadril, core e pé; reaproveita a tela do mockup | M |

Respostas do Pedro de 20/10/2026 estão no fim de cada documento.

## Dependências entre os temas

- Importação de relógio, compartilhar e gamificação dependem da tabela `activities` (Trilha L, já existente e em uso).
- Notificações e gamificação dependem do plano (Fase 5) e dos dias escolhidos.
- Libs nativas novas (saúde, notificações, compartilhar) exigem novo build de desenvolvimento e aprovação antes de instalar.
