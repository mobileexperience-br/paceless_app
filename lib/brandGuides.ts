import type { HealthProvider } from '@/types/healthHub';

export interface BrandGuide {
  id: string;
  name: string;
  steps: Record<HealthProvider, string>;
}

export const brandGuides: readonly BrandGuide[] = [
  {
    id: 'garmin',
    name: 'Garmin',
    steps: {
      healthkit:
        'No Garmin Connect, toque em Mais > Configurações > Apps conectados > Apple Saúde e ative Atividades e Frequência cardíaca.',
      health_connect:
        'No Garmin Connect, toque em Mais > Configurações > Apps conectados > Health Connect e ative Atividades.',
    },
  },
  {
    id: 'coros',
    name: 'COROS',
    steps: {
      healthkit:
        'No app COROS, vá em Perfil > Configurações > Apps de terceiros > Apple Saúde e ative a sincronização.',
      health_connect:
        'No app COROS, vá em Perfil > Configurações > Apps de terceiros > Health Connect e ative.',
    },
  },
  {
    id: 'polar',
    name: 'Polar',
    steps: {
      healthkit: 'No Polar Flow, abra Configurações > Conexões gerais > Apple Saúde e ative.',
      health_connect: 'No Polar Flow, abra Configurações > Health Connect e ative a sincronização.',
    },
  },
  {
    id: 'samsung',
    name: 'Samsung',
    steps: {
      healthkit:
        'O Samsung Health não sincroniza com o Apple Saúde. Use um Android com o Health Connect.',
      health_connect:
        'No Samsung Health, toque em Mais (três pontos) > Configurações > Health Connect e permita compartilhar Exercícios e Frequência cardíaca.',
    },
  },
  {
    id: 'apple-watch',
    name: 'Apple Watch',
    steps: {
      healthkit:
        'Os treinos do app Exercício já vão para o Saúde automaticamente. Basta conectar acima.',
      health_connect: 'O Apple Watch só funciona com iPhone.',
    },
  },
];
