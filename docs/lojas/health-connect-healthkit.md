# Apple Saúde (HealthKit) e Health Connect: checklist de publicação

Checklist das exigências das lojas para a fase 1 de relógios, que lê e grava treinos no
Apple Saúde e no Health Connect. Plano geral em [relogios.md](../relogios.md). Visão consolidada em
[checklist.md](./checklist.md). Textos de LGPD e política de privacidade em
[legal/politica-de-privacidade.md](../legal/politica-de-privacidade.md) (ainda sem seção de dados de saúde).

Status das pendências: `[x]` feito no repositório · `[ ]` pendente · `[?]` a verificar.

## Google Play (Health Connect)

### Declaração de apps de saúde (Play Console)

Caminho: Play Console > app > Política e programas > Conteúdo do app > **Apps de saúde**
(seção Health Connect). O formulário antigo foi aposentado.

Permissões declaradas. Cada uma precisa de justificativa separada para leitura e para gravação:

| Permissão (`android.permission.health.*`) | Acesso | Justificativa para o formulário |
|---|---|---|
| `READ_EXERCISE` | Leitura | Importar corridas e caminhadas feitas com relógios e apps de terceiros para mostrar o histórico do usuário. |
| `WRITE_EXERCISE` | Gravação | Gravar no Health Connect as corridas e caminhadas registradas no Paceless. |
| `READ_DISTANCE` | Leitura | Obter a distância das corridas importadas. |
| `WRITE_DISTANCE` | Gravação | Gravar a distância das corridas registradas no Paceless. |
| `READ_HEART_RATE` | Leitura | Mostrar a frequência cardíaca média e máxima das corridas importadas. |
| `WRITE_HEART_RATE` | Gravação | Reservada para a fase 2 (frequência cardíaca ao vivo). Hoje o app não grava FC. Avaliar se remove antes do envio. |
| `WRITE_EXERCISE_ROUTE` | Gravação | Gravar a rota GPS da corrida registrada no Paceless, se o usuário permitir. Pode ser removida se a Play não aceitar a justificativa. |

- [ ] Preencher a declaração com as 7 permissões acima (ou 6, se `WRITE_HEART_RATE` sair antes do envio).
- [ ] Uso dos dados: "Funcionalidade do app". Não usar para publicidade, não vender, não compartilhar com terceiros para marketing.
- [ ] Leitura de rota de outro app não é pedida (o app não lê `READ_EXERCISE_ROUTES`).
- [ ] Prazo: o Google não publica. Enviar a declaração junto com o primeiro build da trilha interna, semanas antes do lançamento.

### Outros itens da Play

- [x] Intent de rationale no manifesto: adicionada pelo config plugin `react-native-health-connect`. Aponta para a tela principal, não para a política de privacidade (o plugin local para apontar para a política está fora da fase 1). Risco de rejeição: verificar antes do envio.
- [ ] Política de privacidade com seção de dados de saúde (Health Connect): URL na ficha da loja e no formulário. **Pendente de texto aprovado pelo Pedro e revisão de advogado.**
- [ ] Data safety: "Saúde e fitness" coletado, vinculado ao usuário, não compartilhado, finalidade funcionalidade do app. Atualizar a seção 3 de [google-play.md](./google-play.md).
- [x] `minSdkVersion` 26 (configurado com `expo-build-properties`). Exclui Android 7.0 e 7.1, que pode ser uma perda pequena (medir em Play Console > Estatísticas).
- [x] `targetSdkVersion` e `compileSdkVersion` 36.
- [ ] Teste no dispositivo: Android 14 ou superior (Health Connect embutido) e Android 9 a 13 (app separado da Play Store). Confirmar o estado "Health Connect não instalado" com o botão "Abrir Play Store".
- [ ] Conta de teste para o revisor (App access), se a Play pedir.

## App Store (HealthKit)

### Capacidade e configuração

- [ ] Capability **HealthKit** no App ID `com.paceless.app`. O EAS sincroniza ao fazer o build iOS.
- [x] Plugin `@kingstinct/react-native-healthkit` em `app.json`, com `background: false` (entitlement de entrega em segundo plano desligado).
- [x] Textos de uso no `Info.plist`: `NSHealthShareUsageDescription` e `NSHealthUpdateUsageDescription` em PT-BR.
- [ ] Confirmar no build que o Info.plist gerado traz as duas chaves e o entitlement `com.apple.developer.healthkit` (sem `com.apple.developer.healthkit.background-delivery`).
- [ ] Conferir se o build real pede só leitura de `HKWorkoutType`, `HKWorkoutRouteType`, distância e FC (sem `toShare` extra).

### Privacidade e rótulo

- [x] Privacy manifest (`NSPrivacyCollectedDataTypeHealth`) incluído em `app.json`, com Linked true, Tracking false e finalidade funcionalidade do app.
- [ ] Rótulo App Privacy: **Saúde e fitness > Saúde** e **Saúde e fitness > Fitness** coletados, vinculados ao usuário, não usados para rastrear, finalidade funcionalidade do app. Atualizar a seção 4 de [app-store.md](./app-store.md).
- [ ] Nenhum dado do HealthKit usado para publicidade.
- [ ] Nenhum dado do HealthKit enviado ao iCloud nem a PostHog, RevenueCat ou SDK de anúncios.
- [x] Consentimento explícito antes de qualquer pedido de permissão (tela `profile/health-consent`).
- [x] Exclusão de conta dentro do app: a Edge Function `delete-account` apaga o usuário, e as tabelas `connected_devices` e `activities` caem em cascata (`on delete cascade`).

### Nota para o revisor (App Review Information)

- [ ] Texto para o revisor, em PT-BR e EN:

> O Paceless lê treinos de corrida e caminhada do Apple Saúde (HealthKit) para montar o histórico do corredor, e grava no Apple Saúde as corridas registradas no app. Para testar: entre com a conta de teste, vá em Perfil > Dispositivos conectados > Conectar Apple Saúde, leia a tela de consentimento e conceda o acesso. Os treinos importados aparecem em Atividades com o rótulo "Apple Saúde". Os dados de saúde não são usados para publicidade.
>
> (EN) Paceless reads running and walking workouts from Apple Health to build the user's history, and writes the runs recorded in the app back to Apple Health. Path: Profile > Connected devices > Connect Apple Health. Health data is never used for advertising.

- [ ] Vídeo de 30 a 60 s em aparelho real: tela de consentimento, permissão do sistema e treinos importados. O simulador normalmente não tem treinos.
- [ ] Se o revisor não tiver treinos, o estado vazio explica o motivo (já implementado: "Nenhum treino novo nos últimos 30 dias." e a dica sobre Ajustes > Saúde).

### Testes obrigatórios antes do envio

- [ ] Negar a permissão de leitura e confirmar que a lista não quebra (HealthKit não revela a negativa).
- [ ] Revogar em Ajustes > Saúde e confirmar que a sincronização para sem erro.
- [ ] Gravar uma corrida no Paceless e conferir distância e duração no Apple Saúde, com rota.
- [ ] Desconectar com "apagar importados" e conferir que `activities` com `source = 'healthkit'` sumiu.

## Itens de texto que dependem do Pedro

- [ ] Seção "Dados de saúde" na política de privacidade (ver [legal/politica-de-privacidade.md](../legal/politica-de-privacidade.md)).
- [ ] Revisão jurídica da base legal (LGPD, dado sensível: consentimento específico e destacado).
