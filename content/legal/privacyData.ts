import type { LegalSection } from './types';

export const privacyDataSections: LegalSection[] = [
  {
    heading: '1. Quem somos (controlador)',
    paragraphs: [
      'O Paceless é um aplicativo de corrida para iniciantes. O controlador dos seus dados pessoais é [RAZÃO SOCIAL], CNPJ [CNPJ], com sede em [ENDEREÇO].',
    ],
    bullets: [
      'Contato para privacidade: [E-MAIL DE CONTATO]',
      'Encarregado pelo tratamento de dados pessoais (DPO): [a definir]',
    ],
  },
  {
    heading: '2. Dados que coletamos',
    bullets: [
      'E-mail e senha (ou identificador do login com Google ou Apple): você informa ao criar a conta. Usado para criar e acessar sua conta.',
      'Nome: você informa (opcional). Usado para personalizar o app.',
      'Respostas do onboarding (objetivo, nível de experiência, dias de treino por semana, interesse em musculação): você informa. Usadas para montar e adaptar seu plano.',
      'Localização precisa (GPS): vem do aparelho, somente com o app aberto e durante o treino, após sua permissão. Usada para medir distância, ritmo e desenhar a rota.',
      'Dados da atividade (data, duração, distância, ritmo médio, rota, tipo): gerados ao salvar um treino. Usados para histórico e evolução.',
      'Status e validade da assinatura, identificador de usuário na assinatura: vêm das lojas, via RevenueCat. Usados para liberar recursos premium.',
      'Dados técnicos básicos de funcionamento (ex.: identificador de instalação no serviço de assinaturas): coletados automaticamente. Usados para operar a assinatura e a segurança.',
    ],
    closing: [
      'Não coletamos localização em segundo plano, dados de pagamento (o pagamento é feito pela Apple ou pelo Google), contatos, fotos ou dados médicos. Hoje não usamos ferramentas de publicidade nem de análise de comportamento. Se isso mudar, esta política será atualizada antes. [revisar quando entrar analytics]',
      'Os dados de treino (como a rota e o ritmo) são dados sobre sua atividade física. Tratamos esses dados com o cuidado devido a dados sensíveis, apenas para o funcionamento do app.',
    ],
  },
  {
    heading: '3. Bases legais (LGPD, art. 7º e 11)',
    bullets: [
      'Criar conta, registrar treinos, entregar o plano: execução de contrato (art. 7º, V).',
      'Localização durante o treino e dados de atividade física: consentimento (art. 7º, I e art. 11, I), dado ao conceder a permissão do aparelho; você pode revogar a qualquer momento.',
      'Assinatura, cobrança e prevenção a fraude: execução de contrato e legítimo interesse (art. 7º, V e IX).',
      'Cumprir obrigações legais e defender direitos: obrigação legal e exercício regular de direitos (art. 7º, II e VI).',
      'Segurança do serviço: legítimo interesse (art. 7º, IX).',
    ],
    closing: [
      '[Advogado: validar a classificação de dados de atividade física/saúde como sensíveis e as bases do art. 11.]',
    ],
  },
  {
    heading: '4. Com quem compartilhamos (operadores e terceiros)',
    paragraphs: ['Não vendemos seus dados. Usamos prestadores que tratam dados em nosso nome:'],
    bullets: [
      'Supabase: banco de dados, autenticação e funções. Recebe conta, perfil, atividades e status da assinatura.',
      'RevenueCat: gestão de assinaturas. Recebe identificador de usuário, status e histórico de compra.',
      'Apple e Google: login social (se você escolher), pagamento e gerenciamento da assinatura na loja. Recebem dados do login social e da compra.',
      'Expo / EAS: construção e distribuição do app. Recebe dados técnicos de build; não recebe seus dados de treino.',
    ],
    closing: [
      'Também podemos divulgar dados por ordem judicial ou obrigação legal. [Listar país/região dos servidores do Supabase e RevenueCat.]',
    ],
  },
  {
    heading: '5. Transferência internacional',
    paragraphs: [
      'Alguns prestadores podem armazenar dados fora do Brasil. Fazemos a transferência com base na LGPD (art. 33), por meio de cláusulas contratuais e garantias dos prestadores. [Advogado: confirmar mecanismo e região do projeto Supabase.]',
    ],
  },
  {
    heading: '6. Por quanto tempo guardamos',
    bullets: [
      'Conta, perfil e atividades: enquanto sua conta existir. Apagados ao excluir a conta.',
      'Status da assinatura: enquanto a conta existir; registros de compra no RevenueCat/lojas seguem as políticas deles e prazos fiscais.',
      'Registros que a lei exige guardar (ex.: fiscais): pelo prazo legal [definir].',
      'Backups: removidos em até [definir, ex.: 30 dias] após a exclusão.',
    ],
  },
];
