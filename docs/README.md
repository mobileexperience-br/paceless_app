# Docs — Paceless

Planejamento e acordos do projeto. O código diz *como* está; esta pasta diz
*onde estamos, para onde vamos e por quê*.

| Arquivo | Para quê |
|---|---|
| [estado-atual.md](./estado-atual.md) | Diagnóstico do que existe hoje, tela por tela, e as dívidas encontradas |
| [produto.md](./produto.md) | Visão, problema, público, funcionalidades (hoje × planejado × por último), concorrentes e perguntas em aberto |
| [roadmap.md](./roadmap.md) | Fases de trabalho, em ordem, com critério de pronto de cada uma |
| [sprint-01.md](./sprint-01.md) | Trilhas paralelas da sprint 01 |
| [sprint-02.md](./sprint-02.md) | Trilhas paralelas da sprint 02 |
| [ota.md](./ota.md) | Atualização OTA com EAS Update: canais e como publicar |
| [pipeline.md](./pipeline.md) | Build e CI/CD com EAS Workflows: fluxos, o que depende da conta Apple e passo a passo do iOS |
| [publicacao-lojas.md](./publicacao-lojas.md) | Checklist de Google Play e App Store, e passos de EAS |
| [lojas/](./lojas/checklist.md) | Requisitos de publicação: [Google Play](./lojas/google-play.md), [App Store](./lojas/app-store.md) e [checklist consolidado](./lojas/checklist.md) |
| [legal/](./legal/politica-de-privacidade.md) | Rascunhos (revisar com advogado): [política de privacidade](./legal/politica-de-privacidade.md) e [termos de uso](./legal/termos-de-uso.md) |
| [pesquisa/](./pesquisa/README.md) | Propostas da Trilha R: relógios e saúde, notificações, compartilhar corrida, gamificação e musculação |
| [ambiente-web.md](./ambiente-web.md) | Rodar o app no navegador para desenvolvimento: o que funciona e o que não |
| [colaboracao.md](./colaboracao.md) | Como a gente trabalha junto: branches, PR, review, padrões de código |
| [design-system.md](./design-system.md) | Origem e uso dos tokens, e o que foi feito fora do mockup |
| [pendencias-pedro.md](./pendencias-pedro.md) | O que o Pedro já respondeu e o que falta |
| [pagamento-hotmart.md](./pagamento-hotmart.md) | Em discussão: cobrar pela Hotmart ou pelas lojas, com regras, custos e integração |
| [../store/](../store/README.md) | Ícone, gráfico de recursos e capturas das lojas, e como gerar de novo |
| [decisoes.md](./decisoes.md) | Registro de decisões (o que, por quê, quando) |

Regras de código e arquitetura continuam no [CLAUDE.md](../CLAUDE.md) — ele é
a fonte da verdade. Estes docs não repetem as regras, só apontam para elas.

## Como manter

- Terminou uma fase → marca no `roadmap.md` e atualiza o `estado-atual.md`.
- Tomou uma decisão que muda o rumo → uma entrada em `decisoes.md`.
- Doc desatualizado é pior que doc nenhum: atualiza no mesmo PR da mudança.
