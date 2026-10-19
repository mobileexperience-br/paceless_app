import { useCallback, useState } from 'react';
import { activitySelect, parseActivities, type Activity } from '@/lib/activities';
import { flushPendingActivities } from '@/lib/activityQueue';
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
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async (): Promise<void> => {
    if (!supabase) {
      setActivities([]);
      setError('Serviço não configurado.');
      return;
    }
    await flushPendingActivities();
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
      setActivities(parseActivities(data));
      setError(null);
    } catch {
      setError('Sem conexão. Puxe para atualizar.');
    }
  }, []);

  const load = useCallback(async (): Promise<void> => {
    await fetchAll();
    setLoading(false);
  }, [fetchAll]);

  const refresh = useCallback(async (): Promise<void> => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  }, [fetchAll]);

  return { activities, loading, refreshing, error, load, refresh };
}
