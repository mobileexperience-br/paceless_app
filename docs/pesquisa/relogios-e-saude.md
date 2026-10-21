# Relógios e dados de saúde

Pesquisa feita em 19/10/2026. Itens sem fonte confirmada estão como **a verificar**.
Contexto: o plano adaptativo (ver [produto.md](../produto.md)) precisa de métricas
de corrida (distância, ritmo, FC) vindas do relógio do corredor.

## O que os concorrentes fazem

| App | Como obtém dados de relógio |
|---|---|
| Strava | Recebe uploads de Garmin, Apple Watch, Wear OS etc. (lista exata: a verificar) |
| Runna (hoje da Strava) | Planos estruturados e sincronização com relógios (detalhes atuais: a verificar). A Strava [comprou a Runna em 2025](https://the5krunner.com/2025/04/17/strava-acquires-runna-training-app/) e manteve os apps separados |
| Nike Run Club | Registra a própria corrida (GPS, ritmo, FC) no celular; [guias em áudio e planos](https://www.nike.com/a/running-goals) |
| Garmin Coach | Plano adaptativo gratuito dentro do Garmin Connect, só para relógios Garmin compatíveis ([Garmin](https://www.garmin.com/en-GB/blog/which-adaptive-training-plan-is-right-for-you/)) |

## Opções de fonte de dados

| Fonte | O que dá | Esforço | Situação (out/2026) |
|---|---|---|---|
| **Health Connect** (Android) | Sessões de exercício, FC, distância, vindas de qualquer app/relógio que escreva nele | M | Recomendada. Cobre o que o usuário sincronizar com o Health Connect |
| **HealthKit** (iOS) | Workouts, FC | M | Recomendada. Exige build nativo e capability HealthKit |
| **Garmin Connect Developer Program** (Health/Activity API) | Dados direto da nuvem Garmin, OAuth 1.0a | G | **Bloqueada.** Gratuita só para empresas aprovadas; relatos de set/2026 dizem que [novas aplicações estão pausadas desde a primavera](https://the5krunner.com/2026/09/14/garmin-developer-api-access-paused/). Confirmar direto com a Garmin |
| **Strava API** | Atividades do usuário | M | Restrita. Ver abaixo |
| Importar arquivo FIT/GPX | Corridas avulsas | P | Plano B manual, sem dependência de terceiros |

### Strava: o que mudou em 2026

Segundo [TryTerra](https://tryterra.co/blog/strava-api-changes-2026) e [TechRepublic](https://www.techrepublic.com/article/news-strava-api-scraping-crackdown/) (fontes secundárias; o contrato oficial manda):

- Desenvolvedor no nível Standard precisa de assinatura Strava.
- Um app novo conecta 1 atleta, sobe para 10 sem revisão; acima disso precisa de aprovação (até 9.999).
- A política **proíbe usar dados da API em aplicações de IA** (prompts, embeddings, RAG), inclusive dados derivados.
- Cache limitado a 7 dias.

Consequência direta: **o plano adaptativo por IA não deve se alimentar de dados vindos da API Strava.** Strava fica fora do MVP.

## Bibliotecas Expo

| Lib | Plataforma | Notas |
|---|---|---|
| [`react-native-health-connect`](https://github.com/matinzd/react-native-health-connect) | Android | Plugin Expo embutido desde a v4 (o `expo-health-connect` está depreciado); exige `expo-build-properties` (minSdk 26, compile/target SDK 36 segundo a doc atual). Compatibilidade com SDK 58: **a verificar** |
| [`@kingstinct/react-native-healthkit`](https://www.npmjs.com/package/@kingstinct/react-native-healthkit) | iOS | Config plugin; não roda no Expo Go; exige capability HealthKit. Compatibilidade com SDK 58: **a verificar** |
| `react-native-health` | iOS | Alternativa mais antiga; manutenção: a verificar |
| Agregador (Terra, Thryve, Spike) | Ambos | Atalho que cobre Garmin etc., mas é pago e o dado passa por terceiro, o que pesa contra a promessa de privacidade. Só considerar se Garmin for requisito |

Ambas as libs nativas exigem **novo APK/IPA de desenvolvimento** (EAS), como as demais da Sprint 02. Regra do projeto: não instalar sem aprovação.

## Lojas

- Google Play: declarar o uso do Health Connect no formulário de apps de saúde do Play Console, com justificativa por permissão e política de privacidade igual à exibida no Health Connect ([Google](https://developer.android.com/health-and-fitness/health-connect/publish)). Pedir só os tipos de dado usados.
- Ler histórico além de 30 dias e ler em segundo plano são permissões separadas (`READ_HEALTH_DATA_HISTORY`, `READ_HEALTH_DATA_IN_BACKGROUND`) ([Android](https://developer.android.com/health-and-fitness/health-connect/data-types)). O MVP não precisa de nenhuma.
- Apple: texto de uso de HealthKit no Info.plist e política de privacidade; critérios de revisão: a verificar.
- Atualizar [publicacao-lojas.md](../publicacao-lojas.md) quando isso for decidido.

## Escopo recomendado para o MVP

1. Em **Dispositivos conectados** (Perfil), botão "Conectar Apple Saúde" (iOS) ou "Conectar Health Connect" (Android).
2. Importar, ao conectar e ao abrir o app, as **corridas dos últimos 30 dias**: início, duração, distância, FC média.
3. Mostrar na tela Atividades junto às corridas gravadas pelo app, com a origem indicada.
4. Sem rota/GPS importada, sem FC contínua, sem sincronização em segundo plano.
5. Sem Garmin direto e sem Strava.

A importação **não** é a gravação com GPS (Trilha L); as duas gravam na mesma tabela `activities`.

## Modelo de dados (esboço)

Reaproveitar `activities` da trilha L em vez de criar outra tabela.

| Tabela | Colunas novas / relevantes |
|---|---|
| `activities` | `source` (`paceless`, `health_connect`, `healthkit`), `external_id`, `started_at`, `duration_s`, `distance_m`, `avg_hr`, `max_hr` (opcional), `imported_at`. Único por (`user_id`, `source`, `external_id`) para não duplicar |
| `health_connections` | `user_id`, `provider`, `granted_scopes`, `connected_at`, `last_sync_at` |
| `activity_samples` (depois) | `activity_id`, `t_offset_s`, `hr`, `lat`, `lng`. Fora do MVP |

RLS por `user_id` em todas, com `ON DELETE CASCADE` (regra de [decisoes.md](../decisoes.md)).

## Esforço

**G** no total: M para Android, M para iOS, mais dedup com GPS próprio, telas e declaração nas lojas. Android primeiro é M.

## Riscos

- Duplicidade: corrida gravada pelo app que também aparece via relógio.
- Qualidade do dado depende do app de origem (relógio -> app do fabricante -> Health Connect).
- Revisão das lojas por permissão de saúde pode atrasar a publicação.
- Garmin e Strava mudando regras: não construir sobre eles agora.
- Dado de saúde é sensível (LGPD): consentimento explícito e exclusão junto com a conta.

## Perguntas para o Pedro

1. Quais relógios o público-alvo usa? Se for Garmin direto, aceitamos depender de Health Connect/HealthKit e importar FIT manual?
2. O plano adaptativo precisa só de distância/ritmo/FC média, ou de FC por amostra?
3. Aceitamos Android primeiro?
4. O plano adaptativo vai usar IA com esses dados? Isso impede o uso da API Strava.
5. Existe contato na Garmin para o programa de desenvolvedores?

**Resposta do Pedro (20/10/2026):** os relógios a suportar são Garmin, Apple Watch, Samsung, Coros e Polar. As demais perguntas seguem abertas.
