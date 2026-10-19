export interface FaqEntry {
  question: string;
  answer: string;
}

export const faq: FaqEntry[] = [
  {
    question: 'Como crio minha conta?',
    answer:
      'Depois do onboarding e da tela de assinatura, você cria a conta com e-mail e senha, Google ou Apple. Você pode ver seus dados em Perfil > Minha conta.',
  },
  {
    question: 'Para que servem as perguntas do onboarding?',
    answer:
      'Elas ajudam o Paceless a conhecer seu objetivo, seu nível de experiência e quantos dias por semana você pode treinar.',
  },
  {
    question: 'Como registro uma corrida?',
    answer:
      'Inicie um treino de corrida e o Paceless usa o GPS do aparelho para medir distância, ritmo e desenhar a rota. Ao terminar, você salva a atividade.',
  },
  {
    question: 'Por que o app pede permissão de localização?',
    answer:
      'A localização é usada apenas com o app aberto e durante o treino, para calcular distância e ritmo. Você pode negar ou revogar a permissão nos ajustes do aparelho, mas sem ela o app não registra a rota.',
  },
  {
    question: 'A distância ou o ritmo ficaram imprecisos. Por quê?',
    answer:
      'As estimativas dependem do sinal de GPS, que pode variar com prédios, árvores, túneis e o clima. Para melhores resultados, aguarde o sinal estabilizar antes de começar a correr.',
  },
  {
    question: 'Onde vejo minhas atividades salvas?',
    answer:
      'No histórico de atividades. Cada atividade guarda data, duração, distância, ritmo médio e rota.',
  },
  {
    question: 'Como funciona a assinatura premium?',
    answer:
      'Há planos mensal e anual. O preço e o período aparecem na tela de assinatura antes da compra. O pagamento é cobrado pela App Store ou pelo Google Play e a assinatura renova automaticamente até ser cancelada.',
  },
  {
    question: 'Como restauro uma compra?',
    answer:
      'Na tela de assinatura, toque em "Restaurar compras". Use a mesma conta da loja (ID Apple ou conta Google) com a qual você assinou.',
  },
  {
    question: 'Como cancelo a assinatura?',
    answer:
      'O cancelamento é feito na loja, não no app. No iPhone: Ajustes > seu nome > Assinaturas. No Android: Google Play > Pagamentos e assinaturas > Assinaturas. Você também pode abrir esse caminho em Perfil > Gerenciar assinatura. O acesso premium segue até o fim do período já pago.',
  },
  {
    question: 'Como excluo minha conta?',
    answer:
      'Em Perfil > Minha conta > Excluir conta. A exclusão apaga sua conta, seu perfil e suas atividades e não pode ser desfeita. Ela não cancela a assinatura: cancele também na loja para não ser cobrado.',
  },
  {
    question: 'Quais dados o Paceless coleta?',
    answer:
      'Dados da conta, respostas do onboarding, localização durante o treino, atividades salvas e o status da assinatura. Não vendemos seus dados. Os detalhes estão na Política de privacidade, em Ajuda e suporte.',
  },
  {
    question: 'O Paceless substitui um médico ou treinador?',
    answer:
      'Não. O Paceless não é um serviço médico. Consulte um profissional de saúde antes de começar ou mudar sua rotina de exercícios e pare se sentir dor, tontura ou mal-estar.',
  },
];
