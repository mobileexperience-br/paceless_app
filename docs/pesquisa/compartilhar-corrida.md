# Compartilhar corrida

Pesquisa feita em 19/10/2026. Itens sem fonte confirmada estão como **a verificar**.

## O que os concorrentes fazem

| App | Compartilhamento |
|---|---|
| Strava | "Sticker Stats" desde a primavera de 2025: adesivo transparente com distância, tempo e desenho da rota, copiável para sobrepor a uma foto ou enviado direto aos Stories do Instagram ([BikeRadar](https://www.bikeradar.com/news/strava-sticker-stats-spring-2025-updates)). Atividade privada não compartilha |
| Nike Run Club | Compartilhamento da corrida com imagem (detalhes atuais: a verificar) |
| Runna | A verificar |
| Garmin Connect | A verificar |

Pedido do produto ([produto.md](../produto.md)): layouts **com foto de fundo, sem foto e transparente**, e escolha de **quais métricas** exibir.

## Opções técnicas

| Necessidade | Lib | Notas |
|---|---|---|
| Renderizar um componente RN como imagem | [`react-native-view-shot`](https://docs.expo.dev/versions/latest/sdk/captureRef) (`captureRef`) | Na lista de libs do Expo; versão do SDK 58: a verificar. Usar `format: 'png'`; **transparência: a verificar em aparelho real** (iOS e Android) |
| Escolher foto de fundo | `expo-image-picker` | Dev build, permissão de galeria |
| Compartilhar a imagem (folha do sistema) | `expo-sharing` | Abre a folha de compartilhamento; não escolhe app de destino |
| Salvar na galeria | `expo-media-library` | Permissão de fotos |
| Direto aos Stories do Instagram | [`react-native-share`](https://github.com/react-native-share/react-native-share) (`INSTAGRAM_STORIES`) | Exige Facebook App ID (obrigatório desde jan/2023, segundo a doc); aceita `backgroundImage` e `stickerImage`; consultas a esquemas no manifest/Info.plist (a verificar se o config plugin cuida disso). Lib nativa nova: aprovação |
| Mapa/rota desenhado | `react-native-svg` (já instalado) | Desenhar a polilinha da rota sem mapa de terceiros |

Observação de LGPD/privacidade: a rota do adesivo pode revelar casa/trabalho. Por padrão **não mostrar o início e o fim exatos** ou oferecer "ocultar trajeto".

## Escopo recomendado para o MVP

1. Tela "Compartilhar" aberta ao fim da corrida e a partir de uma atividade.
2. Três layouts: **Foto** (foto escolhida + scrim), **Claro** (fundo `background`), **Transparente** (PNG sem fundo, para colocar sobre foto em outro app).
3. Alternar métricas: distância, tempo, ritmo, FC média (só se houver), data.
4. Saída: folha de compartilhamento do sistema (`expo-sharing`) + salvar na galeria.
5. **Instagram Stories direto fica para a segunda etapa** (exige Facebook App ID e testes por aparelho).
6. Sem mapa de terceiros: rota em SVG.

## Proposta de layout (usa só tokens de `theme/`)

Proporção 9:16 (1080x1920 na captura).

| Elemento | Token |
|---|---|
| Margem | `layout.screenPadding` |
| Distância (destaque) | `typography.timer` (48/56, bold), cor `colors.dark.text` sobre foto/escuro; `colors.ink` no layout claro |
| Rótulos das métricas | `typography.label` (11/14), `colors.dark.textSecondary` |
| Valores secundários (tempo, ritmo, FC) | `typography.metric` (22/28) |
| Traçado da rota | stroke `colors.primary`, via `react-native-svg` |
| Selo "Paceless" | `typography.captionStrong`, ponto/underline em `colors.primary` |
| Cantos de cartão, se houver | `radius.xl` |
| Espaçamento interno | `spacing.xxl`, `spacing.lg` |
| Scrim sobre a foto | `colors.scrim` |

Esboço do layout Foto:

```
+---------------------------+
| (foto)                    |
|                           |
|                           |
|        ~~ rota ~~         |
|                           |
|  5,20                     |   timer, colors.dark.text
|  QUILÔMETROS              |   label
|                           |
|  32:10   6:11   152       |   metric
|  TEMPO   RITMO  FC MÉD.   |   label
|                  Paceless |
+---------------------------+
```

Transparente: mesmo bloco, sem scrim e sem fundo; texto branco com leve sombra para legibilidade (sombra: sem token hoje, **decisão de design**).

Regras do projeto: nada de emoji; qualquer ícone vem de lucide-react-native; sem valores hardcoded fora do tema. Fonte Inter, que precisa estar carregada antes da captura.

## Modelo de dados

Quase nenhum. Nada precisa ir ao servidor.

| Onde | O quê |
|---|---|
| `activities` (já existe na trilha L) | Fonte das métricas e da rota (`route` ou amostras) |
| AsyncStorage (opcional) | Últimas escolhas: layout e métricas ligadas |
| `activities.share_count` ou evento de analytics (opcional) | Medir uso: a decidir |

## Esforço

**M**: componente do cartão, três layouts, captura e compartilhamento, permissões de galeria. Stories direto: +P/M. Depende de a corrida ter distância e (para a rota) pontos GPS salvos pela Trilha L.

## Riscos

- Transparência do PNG e dimensões diferentes por aparelho (`PixelRatio`): testar em iOS e Android.
- Fonte não carregada na captura gera texto com fonte errada.
- Rota exata expõe localização.
- Instagram muda a API/intent de Stories; Facebook App ID depende de conta Meta.
- Novas libs nativas: build de desenvolvimento novo.

## Perguntas para o Pedro

1. Stories direto é requisito do MVP ou a folha do sistema basta?
2. Quais métricas entram por padrão? FC só quando existir?
3. Mostrar rota? Com início/fim ocultos por padrão?
4. A marca "Paceless" aparece sempre (viralidade) ou o usuário pode tirar?
5. Corrida sem foto: usar um fundo de marca (verde `primary`) como quarta opção?
