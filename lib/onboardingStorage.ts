import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  onboardingOptions,
  onboardingStepKeys,
  type OnboardingAnswers,
  type OnboardingState,
  type OnboardingStepKey,
  type PartialOnboardingAnswers,
} from '@/types/onboarding';

export const ONBOARDING_STORAGE_KEY = 'paceless:onboarding';

export const initialOnboardingState: OnboardingState = {
  step: 0,
  answers: {},
  completed: false,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isOption<K extends OnboardingStepKey>(
  key: K,
  value: unknown,
): value is OnboardingAnswers[K] {
  const options: readonly unknown[] = onboardingOptions[key];
  return options.includes(value);
}

export function withAnswer(
  answers: PartialOnboardingAnswers,
  key: OnboardingStepKey,
  value: unknown,
): PartialOnboardingAnswers {
  switch (key) {
    case 'goal':
      return isOption('goal', value) ? { ...answers, goal: value } : answers;
    case 'level':
      return isOption('level', value) ? { ...answers, level: value } : answers;
    case 'daysPerWeek':
      return isOption('daysPerWeek', value) ? { ...answers, daysPerWeek: value } : answers;
    case 'strength':
      return isOption('strength', value) ? { ...answers, strength: value } : answers;
  }
}

function parseAnswers(raw: unknown): PartialOnboardingAnswers {
  if (!isRecord(raw)) return {};
  return onboardingStepKeys.reduce<PartialOnboardingAnswers>(
    (acc, key) => withAnswer(acc, key, raw[key]),
    {},
  );
}

function parseState(raw: unknown): OnboardingState | null {
  if (!isRecord(raw)) return null;
  const step = raw['step'];
  const completed = raw['completed'];
  if (typeof step !== 'number' || !Number.isInteger(step)) return null;
  if (step < 0 || step >= onboardingStepKeys.length) return null;
  if (typeof completed !== 'boolean') return null;
  return { step, completed, answers: parseAnswers(raw['answers']) };
}

export async function loadOnboardingState(): Promise<OnboardingState> {
  try {
    const stored = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (stored === null) return initialOnboardingState;
    const parsed: unknown = JSON.parse(stored);
    return parseState(parsed) ?? initialOnboardingState;
  } catch {
    return initialOnboardingState;
  }
}

export async function saveOnboardingState(state: OnboardingState): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state));
  } catch {
    return;
  }
}

export async function clearOnboardingState(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ONBOARDING_STORAGE_KEY);
  } catch {
    return;
  }
}

export async function readOnboardingAnswers(): Promise<OnboardingAnswers | null> {
  const { answers } = await loadOnboardingState();
  const { goal, level, daysPerWeek, strength } = answers;
  if (!goal || !level || !daysPerWeek || !strength) return null;
  return { goal, level, daysPerWeek, strength };
}
