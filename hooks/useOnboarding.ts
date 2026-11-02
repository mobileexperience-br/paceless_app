import { useCallback, useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useSession } from '@/hooks/useSession';
import { answersFromProfile, applyAnswer, pendingStep } from '@/lib/onboardingProgress';
import { saveOnboardingStep } from '@/lib/onboardingSave';
import { onboardingStepKeys, type OnboardingStepKey, type PartialOnboardingAnswers } from '@/types/onboarding';

interface UseOnboarding {
  loading: boolean;
  stepIndex: number;
  stepCount: number;
  stepKey: OnboardingStepKey;
  answers: PartialOnboardingAnswers;
  selected: string | null;
  isFirst: boolean;
  isLast: boolean;
  saving: boolean;
  error: string | null;
  answer: (value: string) => void;
  next: () => Promise<boolean>;
  back: () => void;
}

const lastIndex = onboardingStepKeys.length - 1;
const saveError = 'Não foi possível salvar sua resposta. Tente novamente.';

export function useOnboarding(): UseOnboarding {
  const { user } = useSession();
  const userId = user?.id ?? null;
  const { profile, loading: profileLoading, refresh } = useProfile();
  const [initialized, setInitialized] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<PartialOnboardingAnswers>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!initialized && !profileLoading && userId !== null) {
    const restored = answersFromProfile(profile);
    const pending = pendingStep(restored) ?? 'level';
    setInitialized(true);
    setAnswers(restored);
    setStepIndex(onboardingStepKeys.indexOf(pending));
  }

  const stepKey = onboardingStepKeys[stepIndex] ?? 'goal';
  const selected = answers[stepKey] ?? null;

  const answer = useCallback(
    (value: string): void => {
      setError(null);
      setAnswers((current) => applyAnswer(current, stepKey, value));
    },
    [stepKey],
  );

  const next = useCallback(async (): Promise<boolean> => {
    if (selected === null || userId === null) return false;
    setSaving(true);
    setError(null);
    const saved = await saveOnboardingStep(userId, stepKey, answers);
    if (!saved) {
      setSaving(false);
      setError(saveError);
      return false;
    }
    await refresh();
    setSaving(false);
    if (stepIndex < lastIndex) setStepIndex(stepIndex + 1);
    return true;
  }, [answers, refresh, selected, stepIndex, stepKey, userId]);

  const back = useCallback((): void => {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  }, [stepIndex]);

  return {
    loading: profileLoading || !initialized,
    stepIndex,
    stepCount: onboardingStepKeys.length,
    stepKey,
    answers,
    selected,
    isFirst: stepIndex === 0,
    isLast: stepIndex === lastIndex,
    saving,
    error,
    answer,
    next,
    back,
  };
}
