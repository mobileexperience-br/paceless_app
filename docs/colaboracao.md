# Colaboração

Proposta de como trabalhar a dois no repo. **Rascunho — combinar com o Pedro.**

## Fluxo

- `main` sempre roda. Nada vai direto pra ela.
- Uma branch por fase ou por tarefa: `fase-1/onboarding-storage`,
  `fix/mock-data-inicio`.
- PR pequeno, um assunto só. Descrição diz o que mudou, por quê e como testar.
- O outro revisa antes do merge.
- Lefthook roda sozinho (instalado no `npm install`): no **commit**, lint nos
  arquivos staged + `tsc`; no **push**, lint e `tsc` no projeto todo. Falhou,
  não passa — corrige, não pula com `--no-verify`.

## Padrão de código

As regras estão no [CLAUDE.md](../CLAUDE.md). As que mais pegam em review:

- **Código em inglês, docs em português.** Nomes, commits e tabelas do banco
  em inglês. Markdown (`docs/`, README) em português. Texto que aparece para
  o usuário segue o idioma do app (PT-BR).
- **Zero comentário em JS/TS.** Nem `//`, nem `/* */`, nem JSDoc. Nome bom
  substitui comentário; contexto e decisões vão em `docs/`.
- **Sem mock data.** Dado real ou estado vazio — nunca "Alex" de exemplo.
- **Tokens sempre.** Cor, tamanho, espaçamento, raio vêm de `theme/`.
- **Mockup é lei.** Replicar fielmente; mudar só combinando antes.
- **Sem `any`.** Tipos simples.
- **lucide**, nunca emoji na UI.
- **Cirúrgico.** PR não "aproveita" pra reformatar o que não é do assunto.
- **Lib nova só com aprovação.** Discute no PR / issue antes de instalar.
- **Segredo nunca no app.** Chave de API externa só em Edge Function.

## Onde as coisas moram

- Tela → `app/`. Tela não fala com Supabase direto: usa um hook de `hooks/`.
- Config de cliente (Supabase, RevenueCat) → `lib/`.
- Componente reaproveitável → `components/` (e exporta em `components/index.ts`).

## Pontos para alinhar com o Pedro

- Ele concorda com a ordem do [roadmap](./roadmap.md)?
- Quem pega qual fase? Dá pra paralelizar Fase 0 com Fase 1.
- Onde fica o projeto Supabase e quem tem acesso?
- Conta RevenueCat / App Store / Play já existe?
- `public/GG Simulator.html` — para que serve?
