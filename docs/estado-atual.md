# Estado atual

Diagnóstico atualizado em 2026-10-21, commit `2e1f5ca` (OTA `315fb07c` em production). A versão original é de
2026-10-19 (commit `6ddcd07`), quando o app era só a camada visual.

## Resumo

O app já tem autenticação, onboarding persistido, perfil no banco, assinatura
(RevenueCat), corrida com GPS e histórico de atividades. Ainda não existem
plano de corrida com dados reais, Nutrição, Musculação, notificações nem
dispositivos conectados: essas telas mostram estado vazio. O tema claro e o
escuro estão implementados.

| Área | Situação |
|---|---|
| Design system (`theme/`, `components/`) | Feito. Tokens do mockup, tema claro/escuro (`ThemeProvider`), diálogo próprio no lugar de `Alert.alert` |
| Supabase (auth, banco, edge functions) | Ativo no projeto `twfqvvfpnspbdaytrerm`. As 15 migrations de `supabase/migrations/` estão aplicadas no remoto. Edge Function `delete-account` (v2) publicada. `revenuecat-webhook` escrita, **não publicada** (faltam os segredos). Ver [banco-de-dados.md](./banco-de-dados.md) e [edge-functions.md](./edge-functions.md) |
| Login | E-mail e senha, Google e Apple nativos (`signInWithIdToken`), tela de verificação de e-mail, `SessionProvider` e guard de rota. Ver [login-social.md](./login-social.md) |
| RevenueCat | SDK `react-native-purchases` no app; paywall com ofertas reais, compra e restaurar. Chave de teste em development e preview, chave `goog_` em production (EAS). Projeto ligado ao Google Play (conta de serviço, tópico Pub/Sub, notificação de teste recebida). Ver [assinaturas.md](./assinaturas.md) |
| AsyncStorage | Onboarding (`paceless:onboarding`), preferências, fila offline de atividades e buffer de pontos do GPS |
| `hooks/`, `lib/`, `providers/` | Existem. Telas falam com o Supabase só via hooks |
| Corrida com GPS | Rastreio em segundo plano (serviço em primeiro plano), pausar, retomar, bloqueio de tela, resumo com parciais, tipos corrida e caminhada, fila offline |
| Testes | Nenhum automatizado. `tsc` e `eslint --max-warnings 0` rodam no lefthook |
| Assets reais | `hero-welcome.jpg`, ícones e splash prontos. Faltam a ilustração do plano e as fotos de Musculação e Nutrição (ver README → "Assets pendentes") |
| Build e publicação | Organização Expo `paceless`, projeto `@paceless/paceless`, EAS Update e EAS Workflows configurados. Build de produção Android (AAB, versionCode 2) no teste interno do Play; correções seguem por OTA. Ver [pipeline.md](./pipeline.md) e [publicacao-lojas.md](./publicacao-lojas.md) |

Também já na `main`: combinações de dias de treino, retomada do treino após o app
ser encerrado, ambiente web local ([ambiente-web.md](./ambiente-web.md)) e as
correções da revisão de usabilidade (auth com "Esqueci a senha", perfil, início,
histórico, onboarding, paywall, salvamento do treino, sinal de GPS e bloqueio).

## Tela por tela

### Pré-auth

| Tela | Situação | O que falta |
|---|---|---|
| `welcome` | Pronto, com `hero-welcome.jpg` | Login social (Google; Apple só no iOS) |
| `onboarding` | Cinco passos, incluindo combinações predefinidas de dias de treino (`profiles.training_days`), salvos no AsyncStorage e retomados | Escolha livre de dias (decisão pendente) |
| `paywall` | Ofertas reais do RevenueCat, compra, restaurar, divulgação da assinatura e links de Termos e Privacidade | Validar a compra em sandbox no aparelho; o webhook ainda não está publicado |
| `signup` / `login` | Formulário controlado com validação, Google e Apple, aviso de Termos | |
| `verify-email` | Pronto | |

### App

| Tela | Situação | O que falta |
|---|---|---|
| `(tabs)/index` (Início) | Saudação com o nome do perfil, card do plano em estado vazio, "Iniciar treino" | Plano, progresso e próximo treino com dados reais (Fase 5) |
| `(tabs)/plan` | Estado vazio ("Nenhum plano ativo") | Plano de corrida real; ilustração do plano (`AssetPlaceholder`) |
| `(tabs)/plan/week/[week]` | Estado vazio ("Semana sem treinos") | Treinos vindos do plano |
| `(tabs)/activities` | Histórico real de `activities`, com filtros e pull to refresh | |
| `(tabs)/nutrition` | Estado vazio | Tudo (por último no roadmap) |
| `strength` (stack, fora das abas) | Diálogo "Em breve" | "Novo treino", biblioteca de exercícios |
| `(tabs)/profile` | Conta (nome, foto), preferências (unidade e tema), Termos, Privacidade, FAQ, ajuda, gerenciar assinatura, sair e excluir conta | Notificações e Dispositivos conectados são estados vazios |
| `workout/[id]` | Rastreio por GPS em segundo plano, cronômetro sem contar a pausa, bloqueio, deslizar para finalizar | Contagem inicial e haptics (decisão pendente) |
| `workout/summary` | Resumo, parciais por km e tipo de atividade; salva em `activities` com fila offline | |

## Dívidas encontradas

Coisas que quebram as próprias regras do `CLAUDE.md`, ou pendências conhecidas.

1. ~~**Mock data em tela**~~ **Resolvido** — Início, Plano e Treino não têm
   dados fixos.
2. ~~**Tamanhos hardcoded**~~ **Resolvido** — tokens em `theme/sizes.ts`.
3. ~~**`AGENTS.md` duplica o `CLAUDE.md`**~~ **Resolvido** — `AGENTS.md` só
   aponta para o `CLAUDE.md`.
4. ~~**Estrutura documentada que não existe**~~ **Resolvido** — `hooks/`,
   `lib/` e `providers/` existem.
5. **`public/GG Simulator.html`**: moldura de simulador iOS em HTML. Não está
   claro se faz parte do app — confirmar com o Pedro e remover se não for.
6. ~~**Sem `.env.example`**~~ **Resolvido** — `.env.example` existe.
7. ~~**Comentários no código**~~ **Resolvido** — removidos; contexto em
   [design-system.md](./design-system.md).
8. **Limite free × premium no servidor**: ainda não existe Edge Function que
   verifique o limite; só `enroll_in_plan` exige premium nos planos pagos.
9. **`revenuecat-webhook` não publicada**: faltam `REVENUECAT_WEBHOOK_AUTH` e
   `REVENUECAT_SECRET_KEY`. Sem ela, `public.subscriptions` não é alimentada.
10. **`supportsTablet: true`** no `app.json` exige UI e capturas de iPad; o
    Pedro disse que iPad é secundário (celular é a prioridade).

## Decisões pendentes (usuário)

1. Botão central das abas: histórico ou iniciar treino?
2. Plano, Nutrição e Musculação: tela "Em breve" ou manter estado vazio?
3. Início do cronômetro: contagem de 3 s, primeiro fix do GPS ou botão "Iniciar"?
4. Finalizar: só deslizar ou manter "Parar"?
5. Instalar `expo-haptics` / `expo-speech` (exige build)?
6. Google na tela de boas-vindas pula o onboarding: remover ou redirecionar?
7. Escolha livre de dias de treino?

Para o próximo build: token de 64 px para controles secundários, `android.backgroundColor`
e o script `store:assets` (mudam o fingerprint).

## Ações manuais pendentes

- Preencher a ficha da loja no Play (texto pronto) e tirar as capturas (dá para usar a web).
- RevenueCat: "Check again" na validação do JSON.
- Supabase: adicionar `http://localhost:8081` e o redirect de redefinir senha nas URLs de redirecionamento.
- Pedro: dados jurídicos ([RAZÃO SOCIAL], [CNPJ], [DATA]), conta Apple, duração do freemium e decisão sobre Hotmart.

## Verificação

`npx tsc --noEmit` e `npx eslint . --max-warnings 0` rodam no lefthook a cada
commit e push.
