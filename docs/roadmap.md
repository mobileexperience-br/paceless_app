# Roadmap

Uma fase por vez. Cada fase começa com um plano aprovado e termina com o
critério de pronto verificado (+ `tsc` e `eslint` limpos).

Status: `[ ]` não começou · `[~]` em andamento · `[x]` pronta

> A ordem segue a dependência técnica: não dá pra migrar dado pré-cadastro
> sem auth, nem limitar free/premium sem assinatura.
>
> Situação em 21/10/2026: Fases 1, 2, 3 e 6 prontas; Fase 4 em andamento;
> Fase 5 não começou. Detalhes em [estado-atual.md](./estado-atual.md).

---

## Fase 0 — Faxina `[~]`

Resolver as dívidas do [estado-atual.md](./estado-atual.md) antes de construir.

- [x] Tirar mock data das telas → estado vazio
- [x] Tamanhos hardcoded → tokens
- [x] Unificar `AGENTS.md` / `CLAUDE.md`
- [ ] Decidir destino do `public/GG Simulator.html`
- [x] Criar `.env.example`
- [x] Remover todos os comentários de JS/TS (contexto em `docs/design-system.md`)
- [x] Lint e TS no máximo de rigor (ver `decisoes.md`)

**Pronto quando:** `grep` por "Alex", "New To Running", "Corrida leve" em
`app/` não acha nada; `tsc` e `eslint` limpos.

## Fase 1 — Onboarding persistido `[x]`

- [x] Tipar as respostas do onboarding
- [x] Salvar no AsyncStorage a cada passo
- [x] `hooks/` com o primeiro hook de acesso a dados

**Pronto quando:** responder o onboarding, matar o app e reabrir mantém as
respostas.

## Fase 2 — Supabase + Auth `[x]`

- [x] `lib/supabase.ts`
- [x] Signup / login por e-mail com formulário controlado e validação
- [x] Sessão persistida; guard de rota (`app/index.tsx` decide welcome × app)
- [x] "Sair" desloga de verdade
- [x] Apple / Google nativos (`signInWithIdToken`). Clientes OAuth criados e
  Supabase com os 4 Client IDs; tela OAuth do Google ainda em modo de teste

**Pronto quando:** criar conta, fechar o app, reabrir e cair logado no
Início; sair volta pro welcome.

## Fase 3 — Migração pré-cadastro → banco `[x]`

- [x] Schema inicial (perfil + respostas do onboarding) com RLS
- [x] Após signup, subir o que está no AsyncStorage e limpar o local
- [x] Início e Perfil mostram nome real

**Pronto quando:** dado do onboarding aparece no banco ligado ao usuário
e o "Olá, {nome}" é real.

## Fase 4 — Assinatura (RevenueCat) `[~]`

- [x] `lib/purchases.ts` com `react-native-purchases` (exige dev build, não
  roda no Expo Go)
- [x] Paywall com ofertas reais
- [x] RevenueCat ligado ao Google Play (conta de serviço, Pub/Sub, notificação
  de teste recebida)
- [~] Webhook RevenueCat → Edge Function → status premium no banco: função
  escrita, **não publicada** (faltam os segredos)
- [ ] Edge Function de verificação de limite free × premium
- [ ] Conferir produtos e offering `default` no RevenueCat e no Play (as
  credenciais mostram "package name not found" até o primeiro AAB)
- [ ] Definir a duração do freemium (15 ou 30 dias). Discutir com o Pedro:
  cobrar pela Hotmart ou pelas lojas ([pagamento-hotmart.md](./pagamento-hotmart.md))

**Pronto quando:** compra em sandbox libera premium e o servidor (não o
client) confirma.

## Fase 5 — Plano de corrida `[ ]`

- [x] Modelo de plano / semana / treino no banco (migrations aplicadas; as
  telas ainda mostram estado vazio)
- [x] Dias de treino: quantidade + combinações predefinidas (`lib/trainingDayCombos.ts`, coluna `profiles.training_days`)
- [x] Parte 1: geração do plano fixa por regras (sem IA) na Edge Function `generate-plan`,
  regenerada ao salvar as configurações e após o onboarding. Regras em
  [planos.md](./planos.md), a validar com o Pedro. Pendente de deploy: aplicar a migration, publicar a função e testar no projeto remoto
- Parte 2: Plano, Semana e Próximo treino com dados reais, e upgrade para premium (`generate(true)` depois do paywall)

## Fase 6 — Treino em andamento `[x]`

- [x] Cronômetro, pausar, parar, slider de finalizar
- [x] Distância e ritmo (GPS com `expo-location`, rastreio em segundo plano)
- [x] Salvar atividade; tela Atividades com histórico e filtros
- Retomar o treino após o app ser encerrado: em andamento (não é parte da fase pronta)

## Publicação nas lojas `[ ]` (paralela, começar cedo)

Corre em paralelo às fases de feature; teste fechado e revisão têm prazo
próprio. Checklist em [publicacao-lojas.md](./publicacao-lojas.md).

- [x] Conta Google Play (organização MXPBR, verificada) e app criado
- [ ] Conta Apple (Pedro decidindo PF ou PJ)
- Teste fechado de 12 testers por 14 dias: não se aplica (conta de organização)
- [x] Exclusão de conta no app
- [~] Termos, privacidade e suporte: telas no app prontas; faltam as URLs públicas
- [x] Sign in with Apple no código
- [~] Build e envio via EAS: primeiro AAB de produção (versionCode 2) em
  andamento, ainda não enviado ao Play

## Depois (sem ordem ainda)

- Musculação (educador físico com apoio de IA; Pedro busca um parceiro)
- Notificações
- Dispositivos conectados (Garmin, Apple Watch, Samsung, Coros e Polar)
- Gamificação (aprovada: meta semanal sem sequência, conquistas de 1, 3, 5, 7 e 10 km)
- Compartilhar corrida / Stories (importante, mas não bloqueia a primeira versão)
- Área admin web separada, em outro domínio (fora do app)
- Assets reais
- Testes

## Por último — Nutrição

IA a partir de anamnese (diabetes, intolerância à lactose etc.), com dieta
voltada à corrida (meta, refeições, receitas). Decidido na reunião de
19/10/2026: só depois de todo o resto. Ver [produto.md](./produto.md).
