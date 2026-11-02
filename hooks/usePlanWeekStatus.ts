import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { clearActivePlanCache } from '@/hooks/useActivePlan';
import { localToday } from '@/lib/planDates';
import {
  advancePlanWeek,
  fetchPlanWeekStatus,
  repeatPlanWeek,
} from '@/lib/planWeekStatus';
import type { PlanWeekStatus } from '@/types/planWeek';

const LOAD_ERROR = 'Não foi possível carregar a semana.';
const ACTION_ERROR = 'Não foi possível atualizar a semana.';

export interface UsePlanWeekStatus {
  status: PlanWeekStatus | null;
  loading: boolean;
  busy: boolean;
  error: string | null;
  advance: () => Promise<void>;
  repeat: () => Promise<void>;
  reload: () => Promise<void>;
}

export function usePlanWeekStatus(): UsePlanWeekStatus {
  const [status, setStatus] = useState<PlanWeekStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [busy, setBusy] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async (): Promise<void> => {
    try {
      setStatus(await fetchPlanWeekStatus(localToday()));
      setError(null);
    } catch {
      setError(LOAD_ERROR);
    } finally {
      setLoading(false);
    }
  }, []);

  const runAction = useCallback(
    async (action: (today: string) => Promise<PlanWeekStatus | null>): Promise<void> => {
      setBusy(true);
      try {
        setStatus(await action(localToday()));
        setError(null);
        clearActivePlanCache();
        await reload();
      } catch {
        setError(ACTION_ERROR);
      } finally {
        setBusy(false);
      }
    },
    [reload],
  );

  const advance = useCallback((): Promise<void> => runAction(advancePlanWeek), [runAction]);
  const repeat = useCallback((): Promise<void> => runAction(repeatPlanWeek), [runAction]);

  useFocusEffect(
    useCallback((): void => {
      void reload();
    }, [reload]),
  );

  return { status, loading, busy, error, advance, repeat, reload };
}
