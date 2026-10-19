export const onboardingOptions = {
  goal: ['start_running', 'run_5k', 'run_10k', 'fitness'],
  level: ['never_ran', 'sometimes', 'weekly'],
  daysPerWeek: ['two', 'three', 'four', 'five_plus'],
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
  'strength',
];

export interface OnboardingState {
  step: number;
  answers: PartialOnboardingAnswers;
  completed: boolean;
}

export type OnboardingLabels = {
  [K in OnboardingStepKey]: Record<OnboardingAnswers[K], string>;
};
