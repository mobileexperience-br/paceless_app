# Publicação na Apple: passo a passo

Pedro, este guia é para colocar o Paceless no iPhone pelo TestFlight e, depois, na App Store. Os builds são feitos na nuvem da Expo (EAS), então ninguém precisa de Mac.

Como a sua conta Apple é de pessoa física, quem for convidado não acessa a parte de certificados. Por isso a peça principal é uma **chave de API**: com ela, o EAS faz quase todo o resto sozinho.

Resumo: você faz as partes 1, 2 e 4, que são uns 20 minutos no total. Nós fazemos a parte 3 e todo o resto.

---

## Parte 1 (você): dados da conta e chave de API

### 1.1 Aceitar os contratos
1. Entre em https://appstoreconnect.apple.com com a conta de desenvolvedor.
2. Abra **Negócios** (Business) e aceite os contratos pendentes.
3. Em **Contrato de apps pagos** (Paid Apps Agreement), preencha os **dados bancários** e os **dados fiscais**. Sem isso a Apple não deixa vender assinatura.

### 1.2 Pegar o Team ID
1. Entre em https://developer.apple.com/account e abra **Membership details**.
2. Copie o **Team ID**, que tem 10 caracteres, por exemplo `AB12CD34EF`.

### 1.3 Criar a chave de API (a mais importante)
1. No App Store Connect, abra **Usuários e Acesso** e depois a aba **Integrações**.
2. Escolha **App Store Connect API** e então **Chaves de equipe** (Team Keys).
   - Se for o primeiro acesso, clique em **Solicitar acesso** e aceite.
   - Se a opção de chave de equipe não aparecer, use **Chave individual**. Também serve.
3. Clique em **+** (Gerar chave):
   - Nome: `EAS Paceless`
   - Acesso: **Admin**
4. **Baixe o arquivo `.p8`.** A Apple só deixa baixar uma vez; se perder, é preciso criar outra chave.
5. Anote o **Key ID**, que aparece na linha da chave, e o **Issuer ID**, que aparece no topo da página.

### 1.4 Criar a chave de compras no app (para o RevenueCat)
1. Ainda em **Usuários e Acesso**, na aba **Integrações**, abra **Compra dentro do app** (In-App Purchase).
2. Clique em **+**, dê o nome `RevenueCat` e **baixe o `.p8`**. Anote também o **Key ID** dela.

### 1.5 Mandar para o Jhonatas
Mande os itens abaixo **por um canal privado**: Google Drive compartilhado só comigo, ou e-mail. **Não mande pelo WhatsApp.**

| Item | De onde vem |
|---|---|
| Team ID | 1.2 |
| `.p8` da API + Key ID + Issuer ID | 1.3 |
| `.p8` da compra no app + Key ID | 1.4 |

Pode avisar no WhatsApp quando tiver enviado.

---

## Parte 2 (você): convidar um usuário (opcional, mas ajuda)

Assim eu consigo ver o painel, o TestFlight e a revisão da Apple sem te pedir prints.

1. No App Store Connect, abra **Usuários e Acesso** e clique em **+**.
2. Use o e-mail que eu te passar, já com Apple ID criado.
3. Função: **Admin**.

---

## Parte 3 (nós): o que fazemos com a chave

1. Cadastrar a chave de API no EAS, com o projeto `@paceless/paceless`.
2. Registrar o identificador do app `com.paceless.app` com **Sign in with Apple** e gerar o certificado e o perfil de distribuição. O EAS faz isso automaticamente.
3. Preencher `appleTeamId` e `ascAppId` no `eas.json`.
4. Configurar o app iOS no RevenueCat com a chave de compras e ligar as assinaturas.
5. Cadastrar as variáveis do iOS no EAS: chave iOS do RevenueCat e login com Google no iOS.
6. Gerar o build de produção na nuvem (`eas build -p ios`) e enviar para o TestFlight (`eas submit -p ios`).
7. Depois: ficha da loja, capturas de tela, privacidade do app (App Privacy) e envio para revisão.

---

## Parte 4 (você): criar o app no App Store Connect

**Faça depois que eu avisar que a parte 3, passo 2, terminou**, porque o identificador do app só existe a partir daí.

1. No App Store Connect, abra **Apps**, clique em **+** e escolha **Novo app**.
2. Preencha:
   - Plataforma: **iOS**
   - Nome: **Paceless**
   - Idioma principal: **Português (Brasil)**
   - ID do pacote (Bundle ID): **com.paceless.app**
   - SKU: `paceless`
   - Acesso: Acesso total
3. Depois de criado, abra **Informações do app** e me mande o número do **Apple ID** do app (só números, por exemplo `6712345678`).
4. Crie as assinaturas em **Monetização**, **Assinaturas**:
   - Grupo: `Paceless Premium`
   - Mensal: R$ 37
   - Anual: R$ 267

   Se preferir, faço essa parte com o acesso da Parte 2.

---

## Parte 5: testar no iPhone (TestFlight)

1. Quando o build chegar, abra **TestFlight** no App Store Connect, vá em **Testes internos** e adicione a si mesmo e a quem tiver acesso à conta.
2. No iPhone, instale o app **TestFlight** da App Store e aceite o convite que chega por e-mail.
3. Para testers de fora da equipe, usamos **Teste externo** com link público. O primeiro build passa por uma revisão rápida da Apple, de mais ou menos um dia.

---

## Ainda pendente para publicar na loja (não trava o TestFlight)

- URL pública da Política de Privacidade e dos Termos (revisados por advogado).
- URL de suporte e e-mail de contato.
- Capturas de tela do iPhone.
