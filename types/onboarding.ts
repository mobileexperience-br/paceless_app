import { trainingDayComboIds } from '@/lib/trainingDayCombos';

export const onboardingOptions = {
  goal: ['start_running', 'run_5k', 'run_10k', 'fitness'],
  level: ['never_ran', 'sometimes', 'weekly'],
  daysPerWeek: ['two', 'three', 'four', 'five_plus'],
  trainingDays: trainingDayComboIds,
  strength: ['yes', 'maybe_later', 'no'],
} as const;

export type OnboardingStepKey = keyof typeof onboardingOptions;

export type OnboardingAnswers = {
  [K in OnboardingStepKey]: (typeof onboardingOptions)[K][number];
};

export type PartialOnboardingAnswers = Partial<OnboardingAnswers>;

export const onboardingStepKeys: readonly OnboardingStepKey[] = [
  'goal',
  'level',
  'daysPerWeek',
  'trainingDays',
  'strength',
];

export interface OnboardingState {
  step: number;
  answers: PartialOnboardingAnswers;
  completed: boolean;
}

export type LabeledStepKey = Exclude<OnboardingStepKey, 'trainingDays'>;

export type OnboardingLabels = {
  [K in LabeledStepKey]: Record<OnboardingAnswers[K], string>;
};
