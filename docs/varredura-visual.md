# Varredura visual

Inventário de telas e estados para inspeção visual (layout, espaçamento, usabilidade). Regras de negócio estão fora do escopo.

## Ambiente

- Worktree: `/mnt/dados/projects/github/paceless_visual` (branch `fix/visual-sweep`).
- App web em `http://localhost:8097` (Metro com recarregamento automático). Nunca usar a porta 8081.
- Inspecionar com viewport mobile (ex.: 390x844) nos temas claro e escuro.
- Na web não funcionam GPS, compras e login Apple. Isso não é bug.

## Conta de teste

1. Em `/signup`, criar a conta com e-mail `qa+visual@paceless.test` e uma senha forte.
2. Confirmar o e-mail via MCP Supabase (`execute_sql`, projeto `twfqvvfpnspbdaytrerm`):
   `update auth.users set email_confirmed_at = now() where email = 'qa+visual@paceless.test';`
3. Entrar em `/login`.
4. Estado "sem plano": no onboarding, escolher nível intermediário.
5. Estado "com plano": em `/plan/settings`, trocar o nível para iniciante.

## Inventário

### Pré-auth (deslogado)

| Tela | Rota | Como chegar | Estado |
|---|---|---|---|
| Welcome | `/welcome` | abrir o app deslogado | nenhum |
| Cadastro | `/signup` | botão na welcome | vazio, com erro de validação, enviando |
| Login | `/login` | link na welcome/cadastro | vazio, credencial inválida, e-mail não confirmado |
| Verificar e-mail | `/verify-email` | após cadastro sem confirmação | nenhum |
| Esqueci a senha | `/forgot-password` | link no login | vazio, enviado, erro |
| Termos | `/legal/terms` | link legal no cadastro | rolagem longa |
| Privacidade | `/legal/privacy` | link legal no cadastro | rolagem longa |
| Callback de auth | `/auth/callback` | retorno de link | carregando |

### Onboarding

| Tela | Rota | Como chegar | Estado |
|---|---|---|---|
| Objetivo | `/onboarding` (passo 1) | primeiro login | nenhuma opção marcada e marcada |
| Dias por semana | `/onboarding` (passo 2) | avançar | mínimo 2 dias |
| Quais dias | `/onboarding` (passo 3) | avançar | combinações de dias |
| Preparo atual (nível) | `/onboarding` (passo 4) | avançar | iniciante e intermediário |
| Demais passos de `lib/onboardingSteps.ts` | `/onboarding` | avançar | conferir cada um, header `n / total` e barra de progresso |
| Plan-ready: gerando | `/onboarding/plan-ready` | concluir onboarding | `idle`/`generating` |
| Plan-ready: pronto | idem | nível iniciante | `ready` |
| Plan-ready: indisponível | idem | nível intermediário | `unavailable` |
| Plan-ready: falha | idem | erro de rede (DevTools offline) | `failed` com `InlineError` |
| Paywall do plano | `/plan-paywall` | CTA do plan-ready ou PremiumLockCard | seletor de plano, disclosure |

### Abas

| Tela | Rota | Estado |
|---|---|---|
| Início sem plano | `/` | NoPlanCard, QuickAccess |
| Início com plano | `/` | TodayCard, WeekProgressCard, PlanCard, LastWorkoutCard |
| Plano sem plano | `/plan` | NoPlanState |
| Plano com plano | `/plan` | PlanHero, NextSessionCard, WeekList |
| Plano carregando/erro | `/plan` | PlanLoading, PlanError (offline) |
| Semana | `/plan/week/1` | DayRow, WeekStatusCard |
| Sessão | `/plan/session/<id>` | StepList, SessionStatus, AttemptHistory |
| Configurações do plano | `/plan/settings` | OptionSection, diálogos de confirmação |
| Atividades vazia | `/activities` | ActivitiesEmpty |
| Atividades com dados | `/activities` | HistoryHeader, ActivityRow (precisa de treino salvo) |
| Nutrição | `/nutrition` | conteúdo e bloqueio premium |
| Perfil | `/profile` | Avatar, lista de itens, sair (diálogo) |
| Conta | `/profile/account` | AvatarEditor, NameField, excluir conta (diálogo) |
| Dispositivos | `/profile/devices` | HubCard, HubActions, BrandGuide, ConsentSection |
| Faixa cardíaca | `/profile/heart-rate-strap` | StrapCard, StrapDeviceList vazia |
| Frequência cardíaca | `/profile/heart-rate` | nenhum |
| Consentimento de saúde | `/profile/health-consent` | aceito e não aceito |
| Notificações | `/profile/notifications` | PermissionNotice, ReminderTimeStepper |
| Preferências | `/profile/preferences` | tema claro/escuro/sistema |
| Ajuda | `/profile/help` | nenhum |
| FAQ | `/profile/faq` | itens expandidos e recolhidos |
| Privacidade | `/profile/privacy` | rolagem longa |
| Termos | `/profile/terms` | rolagem longa |

### Outras telas

| Tela | Rota | Estado |
|---|---|---|
| Conquistas | `/achievements` | lista vazia e com itens (AchievementRow) |
| Musculação | `/strength` | conteúdo e bloqueio premium |
| Treino | `/workout/<id>` (ou `/workout/atual`) | GpsNotice, HeartRateNotice, controles, SlideToFinish, menu; na web só o que renderizar sem GPS |
| Resumo do treino | `/workout/summary` | SplitsTable, HeartRateSummaryCard, PerceivedEffortPicker, SavingOverlay |

### Diálogos (useDialog)

Disparar e inspecionar: sair (Perfil), excluir conta e trocar avatar (Conta), mudanças em Configurações do plano, compra/restauração no Paywall, Musculação, diálogos do treino (`components/workout/workoutDialogs.tsx`: finalizar, descartar), login social (`hooks/useSocialSignIn.ts`).

### Estados transversais

- Vazio: EmptyState, ActivitiesEmpty, NoPlanState, NoPlanCard, conquistas sem itens.
- Carregando: PlanLoading, plan-ready gerando, botões em estado de envio, SavingOverlay.
- Erro: PlanError, InlineError nos formulários e no plan-ready.

## Checklist visual (aplicar em cada item, nos dois temas)

- [ ] Texto encostando nas bordas ou cortado.
- [ ] Botão sem padding horizontal ou com largura inconsistente com as outras telas.
- [ ] Alinhamento e espaçamentos irregulares (fora dos tokens de `theme/`).
- [ ] Elementos sobrepostos ou atrás da tab bar / safe area.
- [ ] Contraste ruim no tema claro ou escuro.
- [ ] Ícones desproporcionais.
- [ ] Hierarquia tipográfica inconsistente.
- [ ] Estados vazios fora do padrão (EmptyState).
- [ ] Rolagem quebrada (conteúdo inalcançável, rolagem dupla).
- [ ] Alvo de toque pequeno (menor que 44x44).

## Status por rodada

### Rodada 1

- Varredura não executada: o QA não conseguiu abrir o navegador.
  - `chrome-devtools`: ECONNREFUSED em 127.0.0.1:9222 (nenhum Chrome com porta de debug).
  - Plugin `chrome-devtools-mcp`: perfil `~/.cache/chrome-devtools-mcp/chrome-profile` travado por outro Chrome.
- Nenhum problema visual levantado e nenhuma correção feita nesta rodada.
- Próxima rodada: subir um Chrome headless isolado com `--remote-debugging-port=9222` e perfil temporário, e refazer a varredura completa.

### Rodada 2

- Navegador: Chrome headless isolado em `127.0.0.1:9222` (perfil temporário) funcionou com `chrome-devtools` MCP. Screenshots salvos em `shots/r2`.
- Coberto em 412x915 (claro e escuro) e 360x640 (escuro): welcome, cadastro, login, esqueci a senha, termos. Sem overflow horizontal e sem erros de console na welcome.
- Não coberto: telas logadas (abas, plano, sessão, configurações, perfil, treino, diálogos). Bloqueio: a conta de teste não pôde ser criada.
  - `qa+visual@paceless.test` é rejeitada pelo Supabase (`email_address_invalid`), e `example.com` também.
  - Por isso a seção "Conta de teste" precisa de outro e-mail aceito pelo projeto.
- Problema original (botão estranho dentro de card) não foi confirmado nem corrigido: sem tela logada não há como reproduzir. A varredura estática de `app/` e `components/` não achou cor hardcoded nem alvo menor que 44px.
- Conteúdo a revisar (não é layout): `legal/terms` mostra placeholders `[DATA]`, `[RAZÃO SOCIAL]`, `[CNPJ]` e `[Advogado: definir]`.
- Correções de código nesta rodada: nenhuma.
- Gates: `npx tsc --noEmit` ok, `npx eslint . --max-warnings 0` ok, `npm test` 60/60.

### Rodada 3 (análise do QA da rodada 2)

| ID | Severidade | Tela | Problema | Status |
|---|---|---|---|---|
| R2-1 | blocker (cobertura) | Telas logadas | Signup de teste caiu no rate limit do Supabase; sem conta QA, todas as rotas logadas redirecionam para `/welcome` | Aberto. Repetir o signup depois que o limite expirar ou usar um usuário de teste já confirmado. Criar usuário via SQL em produção só com autorização |
| R2-orig | major | Plano sem plano (`NoPlanState` em `components/plan/PlanStates.tsx`) | Botão "Configurar plano" estranho dentro do card | Causa provável achada no código: `Button` (`components/Button.tsx`) não tem `paddingHorizontal` no estilo `base`, então o rótulo encosta nas bordas quando o botão não é esticado. Correção enviada ao implementador: `paddingHorizontal: spacing.xl` no `base` |
| R2-2 | minor | Cadastro | Rodapé legal quebra em duas linhas com espaço grande | Aberto, conferir `app/(pre-auth)/signup.tsx` |
| R2-3 | — | Console pre-auth | Avisos de a11y/autofill na web e log do RevenueCat | Descartado: limitação da web, não é layout |

### Rodada 4 (análise do QA da rodada 3)

| ID | Severidade | Tela | Problema | Status |
|---|---|---|---|---|
| R3-1 | blocker (ambiente) | Servidor :8097 | Bundle servido não contém as correções do commit `be970e6` (Button com padding 0, rodapé legal antigo). `node_modules` do worktree é symlink para `paceless_app/node_modules`, e o Metro resolve código do repo principal | Aberto. Precisa reiniciar o Metro a partir do worktree com `--clear` (ou `node_modules` próprio). Fora do escopo do agente: depende do usuário/coordenador |
| R2-1 | blocker (cobertura) | Telas logadas | Signup de teste ainda em rate limit do Supabase | Aberto. Precisa de conta de teste confirmada fornecida pelo usuário |
| R2-orig | major | `NoPlanState` | Botão estranho no card | Corrigido no código (`be970e6`), não verificado visualmente |
| R2-2 | minor | Cadastro | Rodapé legal em duas linhas | Corrigido no código (`be970e6`), não verificado visualmente |
| R3-2 | minor | Cadastro 360x640 | Conteúdo abaixo da dobra | A conferir se a tela rola; rolagem em tela pequena é aceitável |
| R3-3 | — | Termos | Placeholders jurídicos | Conteúdo, não layout. Fora do escopo |

### Rodada 5 (análise do QA da rodada 4)

| ID | Severidade | Tela | Problema | Status |
|---|---|---|---|---|
| R4-1 | blocker (ambiente) | Servidor :8097 | O Metro iniciou às 17:30 a partir do worktree, com `--clear`. O `be970e6` (Button com `paddingHorizontal: spacing.xl`) é das 17:47 e o watcher não pegou a mudança, então o bundle continua antigo. Uma causa provável é o `node_modules` ser symlink para `paceless_app` | Aberto. O código está certo no worktree. Precisa que o coordenador ou o usuário reinicie o Metro do worktree com `--clear` (agentes não podem iniciar nem parar servidores) |
| R4-2 / R2-1 | blocker (cobertura) | Telas logadas | Sem conta de teste confirmada, as rotas logadas redirecionam para `/welcome` | Aberto. Depende de o usuário fornecer uma conta |
| R4-3 / R2-2 | minor | Cadastro | Rodapé legal em duas linhas | Corrigido no código (`be970e6`). Reavaliar quando o bundle for atualizado |
| R3-2 | minor | Cadastro 360x640 | Conteúdo abaixo da dobra | Resolvido: a tela rola e não tem overflow horizontal |
| R2-orig | major | `NoPlanState` | Botão estranho no card | Corrigido no código (`be970e6`), mas sem verificação visual (depende de R4-1 e R4-2) |

Correções de código nesta rodada: nenhuma, porque os bloqueios restantes são de ambiente.
