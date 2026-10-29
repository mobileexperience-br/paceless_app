# Integrações com relógios: pesquisa aprofundada

Pesquisa de 29/10/2026, feita em rodadas de pesquisa e revisão. Cada arquivo traz cadastro e burocracia, dados disponíveis, autenticação, termos de uso, arquitetura no Paceless, exemplos de código (Edge Functions em Deno e app Expo), riscos e fontes com link.

**Para que serve esta pasta:**
- dar ao Pedro um roteiro de cadastros e burocracia que ele consiga seguir sozinho;
- dar ao time o detalhe técnico para implementar cada integração;
- guardar o que ainda está **a confirmar**, para não tratar suposição como fato.

O plano geral (fases, modelo de dados, decisões) continua em [../relogios.md](../relogios.md). Esta pasta aprofunda aquele plano. Quando os dois divergirem, vale o arquivo daqui, que é mais recente. Mesmo assim, confira o item na seção "Perguntas em aberto".

Regra que vale para tudo: segredo de API e troca de token OAuth só em Edge Function do Supabase, nunca no app ([CLAUDE.md](../../CLAUDE.md)).

## Provedores

| Provedor | Arquivo | Acesso em out/2026 | Custo | Esforço | Recomendação |
|---|---|---|---|---|---|
| Apple HealthKit | [apple-healthkit.md](./apple-healthkit.md) | Sem cadastro específico. Só exige a conta Apple Developer como Organização | US$ 99/ano da conta Apple (valor em BRL a confirmar) | M | **Fase 1, obrigatório no iOS.** Somente leitura, sincroniza ao abrir o app |
| Health Connect (Android) | [health-connect.md](./health-connect.md) | Aberto. Exige a declaração de apps de saúde no Play Console (revisão de até 7 dias) | Zero | M | **Fase 1.** Somente leitura. Cobre Garmin, Polar, COROS e Samsung pelo celular |
| Cinta cardíaca BLE | [ble-heart-rate.md](./ble-heart-rate.md) | Padrão aberto (0x180D). Sem cadastro | Cintas de teste (cerca de R$ 400 a 700 cada, a confirmar) | M | **Fase 2.** `react-native-ble-plx`, depois de um teste de dev build no SDK 58 |
| Garmin | [garmin.md](./garmin.md) | **Reabriu em 21/10/2026.** Starter: formulário com revisão humana, cerca de 1.000 usuários, só push, sem histórico anterior | Starter grátis. Enterprise: US$ 1.000 de entrada + valor por MAU (fonte da comunidade) | G | **Fase 3.** Pedir o Starter já. Inclui a Training API (enviar treino ao relógio) |
| Polar | [polar.md](./polar.md) | Self-service (AccessLink v3), sem revisão manual conhecida | Zero hoje (a licença permite cobrar no futuro) | M | **Fase 3.** Webhook `EXERCISE` mais uma conferência diária |
| COROS | [coros.md](./coros.md) | Partner API com pedido e aprovação. Prazo não publicado. Documentação privada | Nenhuma taxa publicada (pedir por escrito) | M | **Fase 4.** Pedir acesso já, porque o prazo é desconhecido |
| Samsung | [samsung.md](./samsung.md) | Data SDK só funciona com parceria aprovada. Sem ela, só em modo desenvolvedor | Nenhuma taxa conhecida | M (módulo nativo Kotlin) | **v1 pelo Health Connect.** Pedir a parceria em paralelo |
| Agregadores (Terra, ROOK, Thryve, Sahha, Spike, Junction, Open Wearables) | [agregadores.md](./agregadores.md) | Abertos, mas não dispensam a aprovação de cada marca | US$ 299 a 499/mês para 500 a 1.000 usuários. Open Wearables é grátis (MIT) | P a M | **Não usar agora.** Open Wearables serve só como código de referência. A Terra fica de plano B |
| Strava | [agregadores.md](./agregadores.md#strava-api-regras-de-2026) | API aberta. Novas regras desde 01/06/2026. O app começa com 10 atletas | API grátis. Pode exigir assinatura Strava do dev (a confirmar) | P | **Só upload** (exportar a corrida feita no app). Provavelmente proíbe uso em IA e passar os dados por agregador (a confirmar) |

Esforço: P = pequeno, M = médio, G = grande.

## Checklist consolidado do Pedro

A ordem vai da base, que destrava tudo, ao que tem prazo longo de aprovação, e por último ao que depende do backend pronto. Os detalhes de cada item (campos de formulário, textos prontos, perguntas) estão no arquivo do provedor.

### 1. Base da empresa (destrava todos os outros)

- [ ] CNPJ ativo de LTDA ou SLU, com razão social e endereço exatos. MEI pode ser forçado a se inscrever na Apple como pessoa física. ([apple-healthkit.md](./apple-healthkit.md))
- [ ] Domínio próprio, site público e e-mails corporativos compartilhados (`dev@`, `integracoes@`, `privacidade@`). Nada de Gmail.
- [ ] Gerenciador de senhas da empresa. Segredos e 2FA ficam ali, nunca em chat.
- [ ] Separar os documentos: cartão CNPJ, contrato social com os poderes do Pedro, descrição da empresa em inglês e logo PNG (512 px, 144x144 e 102x102).
- [ ] Decidir se algum LLM vai processar dados de saúde e qual fornecedor (com retenção zero, de preferência). A resposta entra nos formulários da Garmin, da Polar, do Health Connect e na política de privacidade.

### 2. LGPD e textos legais (pedidos por quase todos os formulários)

- [ ] Política de privacidade pública numa **URL única**, em PT-BR e EN. Ela cobre: dados de saúde (art. 11), cada marca como fonte, IA, retenção e exclusão, transferência internacional e contato do encarregado.
- [ ] Termos de Uso com a cláusula exigida pela Garmin (5.3), revisados por advogado.
- [ ] Nomear o encarregado (DPO) e publicar o contato. Com dado sensível, a dispensa para pequeno porte provavelmente não vale (validar com advogado).
- [ ] RIPD (relatório de impacto) curto antes do lançamento.
- [ ] Região do Supabase (`sa-east-1`?) e DPA assinado. Se ficar fora do Brasil, tratar a transferência internacional.
- [ ] Página web de exclusão de conta (exigida pelo Data safety da Play).
- [ ] Aprovar o texto da tela de consentimento de frequência cardíaca ([ble-heart-rate.md](./ble-heart-rate.md)).

### 3. Pedidos com prazo longo ou desconhecido (abrir logo)

- [ ] **Garmin Starter:** conta Garmin com e-mail corporativo e 2FA, depois o [formulário Starter](https://www.garmin.com/en-US/forms/StarterGarminConnectDeveloperAccess/) (os 16 campos e o rascunho do texto estão em [garmin.md](./garmin.md)). Planejar de 1 a 4 semanas de espera.
- [ ] **Garmin, perguntas por escrito** no Developer Contact form: receita derivada (5.2(e)), uso de LLM, limite do Starter e preço do Enterprise, mais membros no portal, sandbox.
- [ ] **COROS Partner API:** formulário "Submit an API Application" e e-mail para api@coros.com com as perguntas de [coros.md](./coros.md). Aceitar os termos só depois de ler o texto completo.
- [ ] **Samsung:** Samsung Account e Samsung Developers, Partnership Request (tirar print de todos os campos) e ticket com as 5 perguntas de [samsung.md](./samsung.md).
- [ ] **Strava** (se formos exportar): criar o app e perguntar por escrito se o modo "só upload" é permitido num app com coach de IA ([agregadores.md](./agregadores.md)).

### 4. Cadastros self-service

- [ ] **Polar:** conta Polar Flow da empresa e client em admin.polaraccesslink.com. O Client ID e o Secret aparecem **uma única vez**. Salvar PDF da licença aceita. Mandar as perguntas (a) a (f) para b2bhelpdesk@polar.com ([polar.md](./polar.md)).
- [ ] **Apple Developer como Organização:** D-U-N-S, inscrição, Paid Apps Agreement, impostos (W-8BEN-E com o contador), banco, convite ao Jonatas como Admin e API Key `.p8` ([apple-healthkit.md](./apple-healthkit.md)).
- [ ] **Play Console verificada** (identidade e D-U-N-S, se for conta de organização) e conta de teste para o revisor ([health-connect.md](./health-connect.md)).

### 5. Lojas (quando o build com as integrações estiver pronto)

- [ ] Play: declaração de apps de saúde e de permissões do Health Connect, Data safety (fitness, saúde, localização precisa) e declarações de foreground service (`location`, e `connectedDevice` se precisar) com vídeo.
- [ ] App Store: rótulo de privacidade (Health, Fitness, Precise Location), notas de revisão sobre HealthKit e `bluetooth-central`, e conta demo.
- [ ] Comprar o hardware de teste: 1 Polar H10, 1 cinta básica e acesso a um relógio Garmin atual.

### 6. Depois que o backend estiver no ar

- [ ] Garmin: criar o app no portal (Consumer Key e Secret), ativar Activity, Health e Training, configurar a URL do webhook em "On Hold" e baixar os PDFs do portal.
- [ ] COROS: preencher a URL do webhook quando a função estiver respondendo.
- [ ] Passar todos os segredos ao dev só por gerenciador de senhas, para irem a `supabase secrets set`.
- [ ] Guardar todas as respostas escritas das marcas em `docs/integracoes-relogios/anexos/`.

## Ordem de implementação no Paceless

1. **Fase 1: HealthKit e Health Connect**, somente leitura, no mesmo build. Cobre as cinco marcas pelo celular, sem depender de aprovação. Testar em aparelho real se chega a rota GPS, porque corridas da Garmin costumam chegar sem rota.
2. **Fase 2: cinta BLE**, no mesmo build ou no seguinte. FC ao vivo durante a corrida. Antes, um teste de dev build com `react-native-ble-plx` no SDK 58.
3. **Fase 3: Polar e Garmin pela nuvem**, em Edge Functions (OAuth, webhook, FIT guardado cru no Storage). A Polar vem primeiro porque o cadastro é imediato e o mesmo esqueleto serve para a Garmin quando ela aprovar. Depois vem a Training API da Garmin (enviar treino ao relógio).
4. **Fase 4: COROS pela nuvem** quando a parceria sair. Samsung direto só se o Health Connect não trouxer rota ou FC em alta resolução.
5. **Depois:** Strava só upload, se a resposta escrita permitir. Agregador só se os prazos apertarem.

As bibliotecas `@kingstinct/react-native-healthkit`, `react-native-health-connect` e `react-native-ble-plx` precisam de aprovação antes de instalar, e todas exigem um dev build novo.

## Perguntas em aberto

- **IA:** cada marca permite mandar dados a um LLM de terceiro para gerar o plano do próprio usuário? A Garmin exige consentimento e uma declaração de transparência (cláusula 15.10, a confirmar no texto). Polar, COROS e Samsung ainda não responderam. O Strava provavelmente proíbe.
- **Garmin:** a assinatura premium conta como "receita derivada da API" (5.2(e))? O que acontece ao passar de cerca de 1.000 usuários, e quanto custa o Enterprise? Existe sandbox para o Starter? (o [../relogios.md](../relogios.md) diz que sim, mas o [garmin.md](./garmin.md) não confirmou)
- **Garmin sem histórico:** no Starter, corridas anteriores à conexão não vêm. Elas chegam pelo Health Connect ou HealthKit, ou por importação do ZIP de exportação da Garmin?
- **COROS:** qual a base mínima de usuários, o prazo e os hosts de produção e sandbox?
- **Samsung:** a parceria aceita empresa brasileira e app só de leitura?
- **Polar:** existe revisão antes de produção? Pode adicionar mais administradores ao client?
- **Strava:** é obrigatório o dev ter assinatura paga? O texto oficial da API Policy não foi encontrado.
- **LGPD:** a região do Supabase, se o encarregado é obrigatório e se o fornecedor de IA vai garantir retenção zero.
- **Produto (Pedro):** o plano adaptativo usa FC por amostra ou só a média? Enviar treino ao relógio é prioridade? As respostas mudam a ordem das fases 3 e 4.
