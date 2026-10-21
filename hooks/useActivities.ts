import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  activitySelect,
  draftToActivity,
  parseActivities,
  type Activity,
} from '@/lib/activities';
import {
  flushPendingActivities,
  readQueue,
  subscribeActivityChanges,
} from '@/lib/activityQueue';
import { useSession } from '@/hooks/useSession';
import { supabase } from '@/lib/supabase';

const FETCH_LIMIT = 200;

interface UseActivities {
  activities: Activity[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  load: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useActivities(): UseActivities {
  const { user } = useSession();
  const userId = user?.id ?? null;
  const [remote, setRemote] = useState<Activity[]>([]);
  const [pending, setPending] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const readPending = useCallback(async (): Promise<void> => {
    const queue = await readQueue();
    setPending(queue.filter((draft) => draft.user_id === userId).map(draftToActivity));
  }, [userId]);

  const fetchAll = useCallback(async (): Promise<void> => {
    await readPending();
    if (!supabase) {
      setRemote([]);
      setError('Serviço não configurado.');
      return;
    }
    await flushPendingActivities();
    await readPending();
    try {
      const { data, error: queryError } = await supabase
        .from('activities')
        .select(activitySelect)
        .order('started_at', { ascending: false })
        .limit(FETCH_LIMIT);
      if (queryError) {
        setError('Não foi possível carregar suas atividades.');
        return;
      }
      setRemote(parseActivities(data));
      setError(null);
    } catch {
      setError('Sem conexão. Puxe para atualizar.');
    }
  }, [readPending]);

  useEffect(
    () =>
      subscribeActivityChanges(() => {
        void fetchAll();
      }),
    [fetchAll],
  );

  const load = useCallback(async (): Promise<void> => {
    await fetchAll();
    setLoading(false);
  }, [fetchAll]);

  const refresh = useCallback(async (): Promise<void> => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  }, [fetchAll]);

  const activities = useMemo<Activity[]>(() => {
    const remoteIds = new Set(remote.map((activity) => activity.id));
    const unsynced = pending.filter((activity) => !remoteIds.has(activity.id));
    return [...unsynced, ...remote].sort(
      (a, b) => b.startedAt.getTime() - a.startedAt.getTime(),
    );
  }, [remote, pending]);

  return { activities, loading, refreshing, error, load, refresh };
}
