import { trainingDayComboIds } from '@/lib/trainingDayCombos';

export const onboardingOptions = {
  goal: ['complete_5k', 'race', 'fitness', 'weight_loss'],
  level: ['total_beginner', 'beginner', 'intermediate', 'advanced'],
  daysPerWeek: ['two', 'three', 'four', 'five_plus'],
  trainingDays: trainingDayComboIds,
  strength: ['yes', 'maybe_later', 'no'],
} as const;

export const eligibleLevels = ['total_beginner', 'beginner'] as const;

export type OnboardingField = keyof typeof onboardingOptions;

export type OnboardingAnswers = {
  [K in OnboardingField]: (typeof onboardingOptions)[K][number];
};

export type PartialOnboardingAnswers = Partial<OnboardingAnswers>;

export type OnboardingStepKey = 'goal' | 'daysPerWeek' | 'trainingDays' | 'level';

export const onboardingStepKeys: readonly OnboardingStepKey[] = ['goal', 'daysPerWeek', 'trainingDays', 'level'];

export type LabeledField = Exclude<OnboardingField, 'trainingDays'>;

export type OnboardingLabels = {
  [K in LabeledField]: Record<OnboardingAnswers[K], string>;
};
