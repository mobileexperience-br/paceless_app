# Estado atual

Diagnóstico de 2026-10-19, commit `6ddcd07`.

## Resumo

O app hoje é **só a camada visual**. As telas do mockup estão montadas com o
design system, mas não existe backend, persistência, autenticação, assinatura
nem lógica de treino. Toda navegação é "fake": qualquer botão de entrar leva
direto para o app.

| Área | Situação |
|---|---|
| Design system (`theme/`, `components/`) | Feito. Tokens extraídos do mockup, 15 componentes base |
| Telas (`app/`) | Layout pronto, sem dados |
| Supabase (auth, banco, edge functions) | Não existe. Sem `lib/`, sem dependência instalada |
| RevenueCat | Não existe. Paywall com preço `—` |
| AsyncStorage | Instalado, nunca usado |
| `hooks/` (acesso a dados) | Pasta não existe |
| Guard de rota (logado/deslogado) | Não existe. `app/index.tsx` sempre manda para `/welcome` |
| Testes | Nenhum |
| Assets reais | Faltam (ver README → "Assets pendentes") |

## Tela por tela

### Pré-auth

| Tela | Visual | O que falta |
|---|---|---|
| `welcome` | Pronto (com placeholder de foto) | Asset da foto de fundo |
| `onboarding` | Sem mockup, montado pelos tokens | Respostas ficam só em `useState` — se perdem ao sair da tela. Precisam ir pro AsyncStorage |
| `paywall` | Sem mockup, montado pelos tokens | Planos e preços do RevenueCat; compra real; "Continuar sem assinar" |
| `signup` | Pronto | Form não controlado (inputs sem estado), sem validação, sem Supabase. Apple/Google sem ação. `centerLabel="1 / 4"` fixo |
| `login` | Pronto | Mesmo que signup |

### App

| Tela | Visual | O que falta |
|---|---|---|
| `(tabs)/index` (Início) | Pronto | **Dados fixos no código**: "Olá, Alex!", avatar "A", "New To Running Plan", "Semana 1 de 8". Notificações sem ação |
| `(tabs)/plan` | Pronto | **Dados fixos**: nome do plano, "8 semanas • 3–4 treinos/semana". "Configurações do plano" sem ação. Duas linhas levam ambas a `/week/1` |
| `(tabs)/activities` | Pronto, estado vazio | Histórico real; filtro não filtra nada |
| `(tabs)/nutrition` | Pronto, estado vazio | Tudo. Abas Plano/Receitas sem conteúdo; "Adicionar" refeição sem ação |
| `(tabs)/strength` | Pronto, estado vazio | "Novo treino" sem ação |
| `(tabs)/profile` | Pronto | Itens sem ação; "Sair" só navega, não desloga |
| `week/[week]` | Pronto | Dias da semana sem treinos vindos de dados |
| `workout/[id]` | Pronto | **Dados fixos**: "Corrida leve / Zona 2". Cronômetro parado, sem GPS, sem pausar/parar, slider não desliza, nada é salvo |

## Dívidas encontradas

Coisas que quebram as próprias regras do `CLAUDE.md` — vale resolver antes
de empilhar feature em cima.

1. **Mock data em tela** (regra "sem mock data"): ~~Início e Plano~~
   **Resolvido** — agora mostram estado vazio ("Nenhum plano ativo").
   **Pendente:** Treino (`workout/[id]`), que fica para a trilha D.
2. **Tamanhos hardcoded** (regra "estilo sempre pelos tokens"): ~~`(tabs)/_layout`
   (64), `welcome` (220×139), `nutrition` (6), Início e Plano~~ **Resolvido** —
   tokens em `theme/sizes.ts`. **Pendente:** `workout/[id]` (56, 96, 64, 48, 44)
   e `profile` (56).
3. ~~**`AGENTS.md` duplica o `CLAUDE.md`**~~ **Resolvido** — `AGENTS.md` agora
   só aponta para o `CLAUDE.md`, que é a fonte da verdade.
4. **Estrutura documentada que não existe**: `hooks/` e `lib/` estão no
   `CLAUDE.md` mas não no repo. Normal nessa fase, só registrando.
5. **`public/GG Simulator.html`**: moldura de simulador iOS em HTML. Não está
   claro se faz parte do app — confirmar com o Pedro e remover se não for.
6. **Sem `.env.example`**: as variáveis estão só no README.
7. ~~**Comentários no código**~~ **Resolvido** — removidos; contexto em [design-system.md](./design-system.md).
   Era: (regra: nenhum comentário em JS/TS): ~70 linhas
   de comentário/JSDoc espalhadas por `theme/`, `components/` e `app/`.
   Alguns guardam contexto útil (o que veio do mockup, o que foi pedido à
   parte, assets pendentes) — esse contexto migra para `docs/` antes de apagar.

## Não verificado

- `npx tsc --noEmit` e `npx eslint .` **não foram rodados** neste diagnóstico:
  o repo está sem `node_modules`. Rodar após `npm install`.
