import { combosForGroup, trainingDayCombos } from '@/lib/trainingDayCombos';
import type {
  LabeledStepKey,
  OnboardingAnswers,
  OnboardingLabels,
  OnboardingStepKey,
  PartialOnboardingAnswers,
} from '@/types/onboarding';

export const onboardingLabels: OnboardingLabels = {
  goal: {
    start_running: 'Começar a correr',
    run_5k: 'Correr 5 km',
    run_10k: 'Correr 10 km',
    fitness: 'Ganhar condicionamento',
  },
  level: {
    never_ran: 'Nunca corri',
    sometimes: 'Corro de vez em quando',
    weekly: 'Corro toda semana',
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

export interface OnboardingOption {
  id: string;
  label: string;
}

export interface OnboardingStepConfig {
  key: OnboardingStepKey;
  title: string;
  subtitle: string;
  options: OnboardingOption[];
}

function buildStep<K extends LabeledStepKey>(
  key: K,
  title: string,
  subtitle: string,
  labels: Record<OnboardingAnswers[K], string>,
): OnboardingStepConfig {
  const options = Object.entries<string>(labels).map(([id, label]) => ({ id, label }));
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
    'level',
    'Como está seu preparo hoje?',
    'Seja honesto — dá para evoluir de qualquer ponto.',
    onboardingLabels.level,
  ),
  buildStep(
    'daysPerWeek',
    'Quantos dias por semana?',
    'Você pode ajustar isso depois.',
    onboardingLabels.daysPerWeek,
  ),
  {
    key: 'trainingDays',
    title: 'Quais dias?',
    subtitle: 'Escolha a combinação que cabe na sua semana.',
    options: trainingDayCombos.map(({ id, label }) => ({ id, label })),
  },
  buildStep(
    'strength',
    'Quer incluir musculação?',
    'Treino de força reduz lesão e melhora o ritmo.',
    onboardingLabels.strength,
  ),
];

const goalSummaries: Record<OnboardingAnswers['goal'], string> = {
  start_running: 'Plano para começar a correr',
  run_5k: 'Plano para correr 5 km',
  run_10k: 'Plano para correr 10 km',
  fitness: 'Plano para ganhar condicionamento',
};

export function summarizeAnswers(answers: PartialOnboardingAnswers): string | null {
  const goal = answers.goal ? goalSummaries[answers.goal] : null;
  const combo = trainingDayCombos.find(({ id }) => id === answers.trainingDays);
  const days = combo
    ? `${combo.days.length} dias: ${combo.label.charAt(0).toLowerCase()}${combo.label.slice(1)}`
    : null;
  const parts = [goal, days].filter((part): part is string => part !== null);
  return parts.length > 0 ? parts.join(' · ') : null;
}

export function optionsForStep(
  step: OnboardingStepConfig,
  answers: PartialOnboardingAnswers,
): OnboardingOption[] {
  if (step.key !== 'trainingDays') return step.options;
  return combosForGroup(answers.daysPerWeek).map(({ id, label }) => ({ id, label }));
}
