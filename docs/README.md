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
| [publicacao-lojas.md](./publicacao-lojas.md) | Checklist de Google Play e App Store, e passos de EAS |
| [colaboracao.md](./colaboracao.md) | Como a gente trabalha junto: branches, PR, review, padrões de código |
| [design-system.md](./design-system.md) | Origem e uso dos tokens, e o que foi feito fora do mockup |
| [decisoes.md](./decisoes.md) | Registro de decisões (o que, por quê, quando) |

Regras de código e arquitetura continuam no [CLAUDE.md](../CLAUDE.md) — ele é
a fonte da verdade. Estes docs não repetem as regras, só apontam para elas.

## Como manter

- Terminou uma fase → marca no `roadmap.md` e atualiza o `estado-atual.md`.
- Tomou uma decisão que muda o rumo → uma entrada em `decisoes.md`.
- Doc desatualizado é pior que doc nenhum: atualiza no mesmo PR da mudança.
