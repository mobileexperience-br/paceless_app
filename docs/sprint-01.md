# Sprint 01 — telas e funcionalidades sem regra de negócio

Objetivo: destravar o que **não depende** de discussão de produto (plano de
corrida, nutrição, limites free/premium ficam para depois). Cada trilha roda em
paralelo, num **git worktree** próprio, com um agente Sonnet, e entra na `main`
quando passa no lint, nos tipos e no critério de pronto.

## Trilhas

### A — Sessão e autenticação
**Faz:**
- Instala `@supabase/supabase-js` e cria `lib/supabase.ts` (sessão no AsyncStorage)
- `hooks/useSession.ts`: sessão atual, `signIn`, `signUp`, `signOut`, loading
- Guard de rota em `app/index.tsx` (logado → app, deslogado → welcome) e no
  layout `(app)`
- Login e cadastro com formulário controlado, validação de e-mail/senha,
  estado de loading e mensagem de erro
- "Sair" no Perfil desloga de verdade
- `.env.example`

**Não faz:** Apple/Google, migração do onboarding pro banco, tabela `profiles`.
**Arquivos:** `lib/`, `hooks/useSession.ts`, `app/index.tsx`,
`app/(app)/_layout.tsx`, `app/(pre-auth)/login.tsx`, `signup.tsx`,
linha "Sair" de `profile.tsx`.
**Pronto quando:** criar conta, fechar o app, reabrir e cair logado; sair volta
para o welcome; abrir o app deslogado nunca mostra telas de `(app)`.

### B — Telas do menu do Perfil
**Faz:** uma tela por item, empilhada (sem tab bar), com `ScreenHeader` de
voltar e estado vazio quando não há dado:
- Minha conta — nome e e-mail da sessão (usa `useSession` da trilha A;
  até lá, estado vazio)
- Preferências — lista de opções (sem persistir ainda)
- Dispositivos conectados — estado vazio
- Notificações — estado vazio
- Ajuda e suporte — lista de links/contato

**Não faz:** editar conta, salvar preferências, integrar dispositivos.
**Arquivos:** `app/(app)/profile/*.tsx` (novos), `app/(app)/_layout.tsx`
(registrar rotas), navegação em `profile.tsx`.
**Pronto quando:** cada item do menu abre sua tela e volta; nenhum dado fake.

### C — Faxina (resto da Fase 0)
**Faz:**
- Tira mock data de Início e Plano ("Alex", "New To Running Plan",
  "Semana 1 de 8"…) → estado vazio
- Tamanhos hardcoded → tokens em `theme/` (exceto `workout/[id].tsx`, que é
  da trilha D)
- `AGENTS.md` passa a só apontar para o `CLAUDE.md`

**Arquivos:** `theme/`, `app/(app)/(tabs)/index.tsx`, `plan.tsx`,
`(tabs)/_layout.tsx`, `welcome.tsx`, `nutrition.tsx`, `AGENTS.md`.
**Pronto quando:** `grep` por "Alex", "New To Running", "Semana 1 de 8" em
`app/` não acha nada; nenhum número solto de tamanho nas telas.

### D — Treino em andamento (só a parte local)
**Faz:** cronômetro real, pausar/retomar, parar com confirmação, "deslize para
finalizar" funcionando (PanResponder do RN, sem lib nova), bloqueio de tela.
Tira o "Corrida leve / Zona 2" fixo e os tamanhos hardcoded do arquivo.
**Não faz:** GPS, distância, ritmo, FC, salvar atividade.
**Arquivos:** `app/(app)/workout/[id].tsx`, `hooks/useStopwatch.ts`,
componentes novos só desta tela.
**Pronto quando:** cronômetro conta, pausa e retoma sem perder tempo; deslizar
até o fim finaliza e volta; arquivos ≤200 linhas.

### E — Onboarding persistido (Fase 1)
**Faz:** respostas tipadas (union types em inglês), `hooks/useOnboarding.ts`
salvando no AsyncStorage a cada passo, retomando de onde parou.
**Arquivos:** `app/(pre-auth)/onboarding.tsx`, `hooks/useOnboarding.ts`,
`types/onboarding.ts`.
**Pronto quando:** responder 2 passos, matar o app, reabrir e continuar no
passo 3 com as respostas mantidas.

## Ordem e conflitos

```
Onda 1 (paralelo):  A  C  D  E
Onda 2:             B  (depois que A entrar na main — usa useSession)
```

Os arquivos de cada trilha quase não se cruzam. Pontos de contato:
- `profile.tsx`: A mexe só no "Sair"; B mexe na navegação dos outros itens.
- `app/(app)/_layout.tsx`: A (guard) e B (rotas) — B entra depois de A.
- `theme/`: só C adiciona tokens; D cria os tokens da tela de treino num
  bloco próprio (`theme/workout.ts`) para não colidir.

## Protocolo de cada agente

1. Trabalha no seu worktree, branch `feat/<trilha>`.
2. Commits em inglês, sem comentários no código, arquivos ≤200 linhas.
3. Antes de entrar: `git rebase main`, `npx tsc --noEmit` e
   `npx eslint . --max-warnings 0` limpos (o lefthook confere de novo).
4. Entra na `main` local com `--ff-only`. Se a `main` andou, rebase de novo.
5. **Não faz push** — revisão e push ficam comigo/com você no fim.
6. Ao terminar: relata o que fez, o que decidiu sozinho e como testar.

## Fora desta sprint (precisa de discussão)

Geração do plano de corrida, nutrição, musculação, paywall/RevenueCat,
limite free × premium, GPS e salvar atividade, migração do onboarding pro banco.
