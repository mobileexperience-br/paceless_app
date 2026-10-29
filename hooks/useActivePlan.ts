import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { subscribeActivityChanges } from '@/lib/activityQueue';
import { fetchActivePlan } from '@/lib/planQueries';
import type { ActivePlan } from '@/types/training';
import { supabase } from '@/lib/supabase';

const LOAD_ERROR = 'Não foi possível carregar seu plano.';
const NOT_CONFIGURED = 'Serviço não configurado.';

interface PlanCache {
  userId: string;
  plan: ActivePlan | null;
}

let cache: PlanCache | null = null;
let lastUserId: string | null = null;

function currentCache(): PlanCache | null {
  return cache !== null && cache.userId === lastUserId ? cache : null;
}

function handleAuthChange(event: AuthChangeEvent, session: Session | null): void {
  const userId = session?.user.id ?? null;
  if (event === 'SIGNED_OUT' || userId !== lastUserId || userId !== (cache?.userId ?? null)) {
    cache = null;
  }
  lastUserId = userId;
}

if (supabase) {
  supabase.auth.onAuthStateChange(handleAuthChange);
}

export function clearActivePlanCache(): void {
  cache = null;
}

export interface UseActivePlan {
  plan: ActivePlan | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<ActivePlan | null>;
}

export function useActivePlan(): UseActivePlan {
  const [plan, setPlan] = useState<ActivePlan | null>(() => currentCache()?.plan ?? null);
  const [loading, setLoading] = useState<boolean>(() => currentCache() === null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async (): Promise<ActivePlan | null> => {
    if (!supabase) {
      setError(NOT_CONFIGURED);
      setLoading(false);
      return null;
    }
    try {
      const userId = (await supabase.auth.getSession()).data.session?.user.id ?? null;
      const next = await fetchActivePlan();
      cache = userId ? { userId, plan: next } : null;
      setPlan(next);
      setError(null);
      return next;
    } catch {
      if (cache === null) {
        setPlan(null);
      }
      setError(LOAD_ERROR);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback((): void => {
      void reload();
    }, [reload]),
  );

  useEffect(
    () =>
      subscribeActivityChanges(() => {
        void reload();
      }),
    [reload],
  );

  return { plan, loading, error, reload };
}
