import { useCallback, useEffect, useState } from 'react';
import {
  clearOnboardingState,
  initialOnboardingState,
  loadOnboardingState,
  saveOnboardingState,
  withAnswer,
} from '@/lib/onboardingStorage';
import {
  onboardingStepKeys,
  type OnboardingState,
  type OnboardingStepKey,
  type PartialOnboardingAnswers,
} from '@/types/onboarding';

interface UseOnboarding {
  loading: boolean;
  step: number;
  stepCount: number;
  stepKey: OnboardingStepKey;
  answers: PartialOnboardingAnswers;
  completed: boolean;
  isFirst: boolean;
  isLast: boolean;
  answer: (value: string) => void;
  next: () => void;
  back: () => void;
  reset: () => void;
}

const lastStep = onboardingStepKeys.length - 1;

export function useOnboarding(): UseOnboarding {
  const [state, setState] = useState<OnboardingState>(initialOnboardingState);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void loadOnboardingState().then((loaded) => {
      if (!active) return;
      setState(loaded);
      setLoading(false);
    });
    return (): void => {
      active = false;
    };
  }, []);

  const stepKey = onboardingStepKeys[state.step] ?? 'goal';

  const update = useCallback((nextState: OnboardingState): void => {
    setState(nextState);
    void saveOnboardingState(nextState);
  }, []);

  const answer = useCallback(
    (value: string): void => {
      update({ ...state, answers: withAnswer(state.answers, stepKey, value) });
    },
    [state, stepKey, update],
  );

  const next = useCallback((): void => {
    if (state.step < lastStep) {
      update({ ...state, step: state.step + 1 });
    } else {
      update({ ...state, completed: true });
    }
  }, [state, update]);

  const back = useCallback((): void => {
    if (state.step > 0) update({ ...state, step: state.step - 1 });
  }, [state, update]);

  const reset = useCallback((): void => {
    setState(initialOnboardingState);
    void clearOnboardingState();
  }, []);

  return {
    loading,
    step: state.step,
    stepCount: onboardingStepKeys.length,
    stepKey,
    answers: state.answers,
    completed: state.completed,
    isFirst: state.step === 0,
    isLast: state.step === lastStep,
    answer,
    next,
    back,
    reset,
  };
}
