import { combosForGroup, trainingDayCombos } from '@/lib/trainingDayCombos';
import type {
  OnboardingAnswers,
  OnboardingLabels,
  OnboardingStepKey,
  PartialOnboardingAnswers,
} from '@/types/onboarding';

export const onboardingLabels: OnboardingLabels = {
  goal: {
    complete_5k: 'Completar 5 km',
    race: 'Fazer uma prova',
    fitness: 'Ganhar condicionamento',
    weight_loss: 'Emagrecer',
  },
  level: {
    total_beginner: 'Iniciante total',
    beginner: 'Iniciante',
    intermediate: 'Intermediário',
    advanced: 'Avançado',
  },
  daysPerWeek: {
    two: '2 dias',
    three: '3 dias',
    four: '4 dias',
    five_plus: '5 dias ou mais',
  },
  strength: {
    yes: 'Sim, quero',
    maybe_later: 'Talvez depois',
    no: 'Não, só corrida',
  },
};

export const levelDescriptions: Record<OnboardingAnswers['level'], string> = {
  total_beginner: 'Não corro ou estou voltando agora',
  beginner: 'Corro trechos curtos, mas ainda não 5 km sem parar',
  intermediate: 'Já corro 5 km sem parar',
  advanced: 'Treino corrida com regularidade há bastante tempo',
};

export interface OnboardingOption {
  id: string;
  label: string;
  description?: string;
}

export interface OnboardingStepConfig {
  key: OnboardingStepKey;
  title: string;
  subtitle: string;
  options: OnboardingOption[];
}

function buildStep(
  key: OnboardingStepKey,
  title: string,
  subtitle: string,
  labels: Readonly<Record<string, string>>,
  descriptions?: Readonly<Record<string, string>>,
): OnboardingStepConfig {
  const options = Object.entries(labels).map(([id, label]) => {
    const description = descriptions?.[id];
    return description === undefined ? { id, label } : { id, label, description };
  });
  return { key, title, subtitle, options };
}

export const onboardingSteps: readonly OnboardingStepConfig[] = [
  buildStep(
    'goal',
    'Qual é o seu objetivo?',
    'Isso define o plano que vamos montar.',
    onboardingLabels.goal,
  ),
  buildStep(
    'daysPerWeek',
    'Quantos dias por semana você pode treinar?',
    'Mínimo de 2 dias. Você pode ajustar depois.',
    onboardingLabels.daysPerWeek,
  ),
  {
    key: 'trainingDays',
    title: 'Quais dias?',
    subtitle: 'Escolha a combinação que cabe na sua semana.',
    options: trainingDayCombos.map(({ id, label }) => ({ id, label })),
  },
  buildStep(
    'level',
    'Como está seu preparo hoje?',
    'Seja honesto — dá para evoluir de qualquer ponto.',
    onboardingLabels.level,
    levelDescriptions,
  ),
];

export function optionsForStep(
  step: OnboardingStepConfig,
  answers: PartialOnboardingAnswers,
): OnboardingOption[] {
  if (step.key !== 'trainingDays') return step.options;
  return combosForGroup(answers.daysPerWeek).map(({ id, label }) => ({ id, label }));
}
