import { useCallback, useEffect, useState } from 'react';
import { cachedStrap, fetchSavedStrap, removeStrap, saveStrap } from '@/lib/strapDevice';
import type { SavedStrap } from '@/types/heartRate';

const SAVE_ERROR = 'Não foi possível salvar a cinta. Tente novamente.';
const REMOVE_ERROR = 'Não foi possível remover a cinta. Tente novamente.';

export interface HeartRateStrap {
  strap: SavedStrap | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  save: (strap: SavedStrap) => Promise<boolean>;
  remove: () => Promise<boolean>;
}

export function useHeartRateStrap(): HeartRateStrap {
  const [strap, setStrap] = useState<SavedStrap | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    (): Promise<SavedStrap | null> => fetchSavedStrap().catch(() => cachedStrap()),
    [],
  );

  const refresh = useCallback(async (): Promise<void> => {
    setStrap(await load());
  }, [load]);

  useEffect(() => {
    let active = true;
    void load().then((next) => {
      if (!active) return;
      setStrap(next);
      setLoading(false);
    });
    return (): void => {
      active = false;
    };
  }, [load]);

  const save = useCallback(async (next: SavedStrap): Promise<boolean> => {
    setError(null);
    try {
      await saveStrap(next);
      setStrap(next);
      return true;
    } catch {
      setError(SAVE_ERROR);
      return false;
    }
  }, []);

  const remove = useCallback(async (): Promise<boolean> => {
    setError(null);
    try {
      await removeStrap();
      setStrap(null);
      return true;
    } catch {
      setError(REMOVE_ERROR);
      return false;
    }
  }, []);

  return { strap, loading, error, refresh, save, remove };
}
