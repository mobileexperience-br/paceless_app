import {
  comboGroup,
  comboIdForDays,
  trainingDayComboIds,
  type TrainingDayComboId,
} from '@/lib/trainingDayCombos';
import type { ProfileRow } from '@/types/database';
import {
  eligibleLevels,
  onboardingOptions,
  onboardingStepKeys,
  type OnboardingAnswers,
  type OnboardingField,
  type OnboardingStepKey,
  type PartialOnboardingAnswers,
} from '@/types/onboarding';

export function answersFromProfile(row: ProfileRow | null): PartialOnboardingAnswers {
  if (!row) return {};
  const answers: PartialOnboardingAnswers = {};
  if (row.goal) answers.goal = row.goal;
  if (row.level) answers.level = row.level;
  if (row.days_per_week) answers.daysPerWeek = row.days_per_week;
  const combo = comboIdForDays([...row.training_days].sort((a, b) => a - b));
  if (combo !== null && row.days_per_week !== null && comboGroup(combo) === row.days_per_week) {
    answers.trainingDays = combo;
  }
  return answers;
}

export function pendingStep(answers: PartialOnboardingAnswers): OnboardingStepKey | null {
  return onboardingStepKeys.find((key) => answers[key] === undefined) ?? null;
}

export function isEligibleLevel(level: OnboardingAnswers['level']): boolean {
  return eligibleLevels.some((item) => item === level);
}

function isOption<K extends OnboardingField>(key: K, value: string): value is OnboardingAnswers[K] {
  const options: readonly string[] = onboardingOptions[key];
  return options.includes(value);
}

function isTrainingDayCombo(value: string): value is TrainingDayComboId {
  return trainingDayComboIds.some((id) => id === value);
}

function withDaysPerWeek(
  answers: PartialOnboardingAnswers,
  daysPerWeek: OnboardingAnswers['daysPerWeek'],
): PartialOnboardingAnswers {
  const { trainingDays, ...rest } = answers;
  const keep = trainingDays !== undefined && comboGroup(trainingDays) === daysPerWeek;
  return keep ? { ...rest, daysPerWeek, trainingDays } : { ...rest, daysPerWeek };
}

export function applyAnswer(
  answers: PartialOnboardingAnswers,
  key: OnboardingStepKey,
  value: string,
): PartialOnboardingAnswers {
  switch (key) {
    case 'goal':
      return isOption('goal', value) ? { ...answers, goal: value } : answers;
    case 'level':
      return isOption('level', value) ? { ...answers, level: value } : answers;
    case 'daysPerWeek':
      return isOption('daysPerWeek', value) ? withDaysPerWeek(answers, value) : answers;
    case 'trainingDays':
      return isTrainingDayCombo(value) && comboGroup(value) === answers.daysPerWeek
        ? { ...answers, trainingDays: value }
        : answers;
  }
}
