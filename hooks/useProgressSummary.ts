import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { subscribeActivityChanges } from '@/lib/activityQueue';
import { localToday } from '@/lib/planDates';
import { fetchProgressSummary } from '@/lib/progressSummary';
import type { ProgressSummary } from '@/types/progress';

export interface UseProgressSummary {
  summary: ProgressSummary | null;
  error: boolean;
  reload: () => Promise<void>;
}

export function useProgressSummary(): UseProgressSummary {
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [error, setError] = useState<boolean>(false);

  const reload = useCallback(async (): Promise<void> => {
    try {
      setSummary(await fetchProgressSummary(localToday()));
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(
    () =>
      subscribeActivityChanges(() => {
        void reload();
      }),
    [reload],
  );

  useFocusEffect(
    useCallback((): void => {
      void reload();
    }, [reload]),
  );

  return { summary, error, reload };
}
