import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { fetchAchievements } from '@/lib/achievements';
import { subscribeActivityChanges } from '@/lib/activityQueue';
import type { Achievement } from '@/types/achievements';

const LOAD_ERROR = 'Não foi possível carregar suas conquistas.';

export interface UseAchievements {
  achievements: Achievement[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export function useAchievements(): UseAchievements {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async (): Promise<void> => {
    try {
      setAchievements(await fetchAchievements());
      setError(null);
    } catch {
      setError(LOAD_ERROR);
    } finally {
      setLoading(false);
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

  return { achievements, loading, error, reload };
}
