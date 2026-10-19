# Roadmap

Uma fase por vez. Cada fase começa com um plano aprovado e termina com o
critério de pronto verificado (+ `tsc` e `eslint` limpos).

Status: `[ ]` não começou · `[~]` em andamento · `[x]` pronta

> A ordem segue a dependência técnica: não dá pra migrar dado pré-cadastro
> sem auth, nem limitar free/premium sem assinatura. Ordem a validar com o
> Pedro antes de começar a Fase 1.

---

## Fase 0 — Faxina `[~]`

Resolver as dívidas do [estado-atual.md](./estado-atual.md) antes de construir.

- [~] Tirar mock data das telas → estado vazio (Início e Plano feitos; falta Treino)
- [~] Tamanhos hardcoded → tokens (feito, exceto `workout/[id]` e `profile`)
- [x] Unificar `AGENTS.md` / `CLAUDE.md`
- Decidir destino do `public/GG Simulator.html`
- Criar `.env.example`
- [x] Remover todos os comentários de JS/TS (contexto em `docs/design-system.md`)
- [x] Lint e TS no máximo de rigor (ver `decisoes.md`)

**Pronto quando:** `grep` por "Alex", "New To Running", "Corrida leve" em
`app/` não acha nada; `tsc` e `eslint` limpos.

## Fase 1 — Onboarding persistido `[ ]`

- Tipar as respostas do onboarding (hoje são strings soltas)
- Salvar no AsyncStorage a cada passo
- `hooks/` com o primeiro hook de acesso a dados

**Pronto quando:** responder o onboarding, matar o app e reabrir mantém as
respostas.

## Fase 2 — Supabase + Auth `[ ]`

- `lib/supabase.ts` (precisa aprovar instalação de `@supabase/supabase-js`)
- Signup / login por e-mail com formulário controlado e validação
- Sessão persistida; guard de rota (`app/index.tsx` decide welcome × app)
- "Sair" desloga de verdade
- Apple / Google: decidir se entra aqui ou depois

**Pronto quando:** criar conta, fechar o app, reabrir e cair logado no
Início; sair volta pro welcome.

## Fase 3 — Migração pré-cadastro → banco `[ ]`

- Schema inicial (perfil + respostas do onboarding) com RLS
- Após signup, subir o que está no AsyncStorage e limpar o local
- Início e Perfil mostram nome real

**Pronto quando:** dado do onboarding aparece no banco ligado ao usuário
e o "Olá, {nome}" é real.

## Fase 4 — Assinatura (RevenueCat) `[ ]`

- `lib/revenuecat.ts` (aprovar instalação de `react-native-purchases`;
  exige dev build, não roda no Expo Go)
- Paywall com ofertas reais
- Webhook RevenueCat → Edge Function → status premium no banco
- Edge Function de verificação de limite free × premium

**Pronto quando:** compra em sandbox libera premium e o servidor (não o
client) confirma.

## Fase 5 — Plano de corrida `[ ]`

- Modelo de plano / semana / treino no banco
- Geração do plano a partir do onboarding (regra a definir — fixa por
  objetivo ou via IA em Edge Function)
- Plano, Semana e Próximo treino com dados reais

## Fase 6 — Treino em andamento `[ ]`

- Cronômetro, pausar, parar, slider de finalizar
- Distância e ritmo (GPS — biblioteca a aprovar)
- Salvar atividade; tela Atividades com histórico e filtros

## Publicação nas lojas `[ ]` (paralela, começar cedo)

Corre em paralelo às fases de feature; teste fechado e revisão têm prazo
próprio. Checklist em [publicacao-lojas.md](./publicacao-lojas.md).

- Contas Google Play e Apple; teste fechado (12 testers)
- Exclusão de conta no app (trilha H); termos, privacidade e suporte (trilha I)
- Sign in with Apple se houver login Google
- Build e envio via EAS

## Depois (sem ordem ainda)

- Musculação (treinos e exercícios)
- Notificações
- Dispositivos conectados (FC média)
- Assets reais
- Testes

## Por último — Nutrição

IA a partir de anamnese (diabetes, intolerância à lactose etc.), com dieta
voltada à corrida (meta, refeições, receitas). Decidido na reunião de
19/10/2026: só depois de todo o resto. Ver [produto.md](./produto.md).
