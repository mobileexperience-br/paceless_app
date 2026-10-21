# Retomar treino após o app ser encerrado

Se o processo do app morre no meio de um treino (sistema, usuário ou crash), o treino pode ser retomado na próxima abertura.

## O que é persistido

Dois lugares no AsyncStorage:

- `paceless:track-buffer` (já existia): fixes de GPS gravados pela task de background (`lib/trackingTask.ts`). Continua sendo alimentado enquanto a task estiver viva, mesmo sem tela.
- `paceless:active-session` e `paceless:active-session-route` (novos, `lib/activeSession.ts`): snapshot da sessão. Tipo (corrida/caminhada), início, estado do cronômetro (tempo acumulado e instante em que está rodando), distância, tempo em movimento, parciais (splits), amostras de ritmo, último ponto e a rota. A rota fica em chave separada para manter a chave principal pequena. As duas são gravadas juntas com `multiSet`.

## Quando grava

`hooks/useActiveSessionSync.ts` agrupa as gravações: no máximo uma a cada 10 s enquanto chegam lotes de localização, e uma gravação imediata ao pausar, retomar ou trocar o tipo. A gravação é assíncrona e serializada em fila, sem bloquear a UI. Rotas com mais de 20 000 pontos são gravadas com metade dos pontos, para ficar longe do limite de linha do AsyncStorage no Android.

## Quando limpa

- Ao concluir o treino (depois de salvar ou enfileirar a atividade).
- Ao descartar pelo menu, voltar ou botão físico de voltar.
- Ao escolher "Descartar" no aviso de retomada (também para a task de localização e esvazia o buffer).
- Automaticamente se a última atividade for mais antiga que 12 h (`SESSION_MAX_IDLE_MS`). A última atividade é o maior entre a última gravação do snapshot e o último fix no buffer.

## Fluxo ao abrir o app

`hooks/useResumeWorkout.ts` roda uma vez no layout `(app)`, depois do login:

1. Lê a sessão e valida (estrutura e validade de 12 h).
2. Se existe, mostra o diálogo "Retomar treino?" com "Retomar treino" e "Descartar". Descartar pede uma segunda confirmação, para que fechar o diálogo sem querer não apague o treino.
3. Retomar abre `/workout/atual?resume=1`, que restaura tipo, início, cronômetro, distância, rota e parciais.

## Estado do cronômetro e da task

- Se a task de localização ainda está rodando (`hasStartedLocationUpdatesAsync`), ela é reaproveitada, o buffer não é esvaziado e o treino volta rodando. Os fixes acumulados no buffer enquanto o app estava fechado entram na distância. O primeiro fix após a retomada vira novo ponto de base, sem somar a distância em linha reta do intervalo.
- Se a task não está rodando (processo morto junto com o serviço), o treino volta pausado, com o tempo contado até a última gravação, para não somar o tempo em que o app esteve fechado. A task é reiniciada e o usuário continua pelo botão de retomar. Fixes antigos do buffer não são contados em distância nesse caso.

## Limites conhecidos

- No pior caso perdem-se até 10 s de dados recentes do snapshot (os fixes do buffer não se perdem).
- Frequência cardíaca e outros sensores ainda não são persistidos, pois não existem no treino atual.
