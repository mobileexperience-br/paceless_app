import type { LegalSection } from './types';

export const privacyRightsSections: LegalSection[] = [
  {
    heading: '7. Seus direitos (LGPD, art. 18)',
    paragraphs: [
      'Você pode pedir: confirmação do tratamento, acesso, correção, anonimização, bloqueio ou eliminação, portabilidade, informação sobre compartilhamento, revogação do consentimento e revisão de decisões automatizadas. Para exercer, escreva para [E-MAIL DE CONTATO]. Respondemos em até [15 dias]. Você também pode reclamar à Autoridade Nacional de Proteção de Dados (ANPD).',
    ],
  },
  {
    heading: '8. Como excluir sua conta e seus dados',
    bullets: [
      'No app: Perfil > Conta > Excluir conta. Apaga conta, perfil, atividades e status da assinatura.',
      'Sem o app: [URL DA PÁGINA DE EXCLUSÃO] ou e-mail [E-MAIL DE CONTATO] com o e-mail da conta.',
      'Assinatura: excluir a conta não cancela a assinatura. Cancele na App Store (Ajustes > seu nome > Assinaturas) ou no Google Play (Pagamentos e assinaturas > Assinaturas) para não ser cobrado.',
    ],
  },
  {
    heading: '9. Permissão de localização',
    paragraphs: [
      'Pedimos acesso à localização apenas ao iniciar um treino, para calcular distância e ritmo. Você pode negar ou revogar nas configurações do aparelho; sem ela o app não registra a rota.',
    ],
  },
  {
    heading: '10. Segurança',
    paragraphs: [
      'Usamos conexão criptografada (HTTPS/TLS), controle de acesso por usuário no banco de dados (cada pessoa só lê seus dados) e chaves de servidor fora do app. Nenhum sistema é 100% seguro; em caso de incidente relevante, comunicaremos você e a ANPD conforme a lei.',
    ],
  },
  {
    heading: '11. Crianças e adolescentes',
    paragraphs: [
      'O app é destinado a maiores de [18] anos. [Advogado: definir idade mínima e tratamento de menores, LGPD art. 14.]',
    ],
  },
  {
    heading: '12. Mudanças nesta política',
    paragraphs: [
      'Podemos atualizar este texto. Mudanças relevantes serão avisadas no app. A data no topo mostra a versão vigente.',
    ],
  },
  {
    heading: '13. Contato',
    paragraphs: ['[RAZÃO SOCIAL] · [E-MAIL DE CONTATO] · DPO: [a definir]'],
  },
];
