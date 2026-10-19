import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import { useSession } from '@/hooks/useSession';
import { parseProfileRow } from '@/lib/profileRow';
import { loadPreferences, savePreferences } from '@/lib/preferencesStorage';
import { supabase } from '@/lib/supabase';
import {
  defaultPreferences,
  type DistanceUnit,
  type Preferences,
  type ThemePreference,
} from '@/types/preferences';

export interface PreferencesValue extends Preferences {
  error: string | null;
  setDistanceUnit: (unit: DistanceUnit) => Promise<void>;
  setTheme: (theme: ThemePreference) => Promise<void>;
}

const SAVE_ERROR = 'Não foi possível salvar a preferência. Tente novamente.';

export const PreferencesContext = createContext<PreferencesValue | null>(null);

async function fetchPreferences(userId: string): Promise<Preferences | null> {
  if (!supabase) return null;
  const result = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  const raw: unknown = result.data;
  const row = parseProfileRow(raw);
  return row ? { distanceUnit: row.distance_unit, theme: row.theme } : null;
}

async function pushPreferences(userId: string, next: Preferences): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: userId, distance_unit: next.distanceUnit, theme: next.theme });
  return error === null;
}

export function PreferencesProvider({ children }: { children: ReactNode }): ReactElement {
  const { user } = useSession();
  const userId = user?.id ?? null;
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [error, setError] = useState<string | null>(null);
  const latest = useRef<Preferences>(defaultPreferences);

  const apply = useCallback((next: Preferences): void => {
    latest.current = next;
    setPreferences(next);
  }, []);

  useEffect(() => {
    let active = true;
    void loadPreferences().then((cached) => {
      if (active) apply(cached);
    });
    return (): void => {
      active = false;
    };
  }, [apply]);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    void fetchPreferences(userId).then((remote) => {
      if (!active || !remote) return;
      apply(remote);
      void savePreferences(remote);
    });
    return (): void => {
      active = false;
    };
  }, [userId, apply]);

  const update = useCallback(
    async (patch: Partial<Preferences>): Promise<void> => {
      const previous = latest.current;
      const next = { ...previous, ...patch };
      setError(null);
      apply(next);
      void savePreferences(next);
      if (!userId) return;
      if (await pushPreferences(userId, next)) return;
      apply(previous);
      void savePreferences(previous);
      setError(SAVE_ERROR);
    },
    [userId, apply],
  );

  const setDistanceUnit = useCallback(
    (distanceUnit: DistanceUnit): Promise<void> => update({ distanceUnit }),
    [update],
  );
  const setTheme = useCallback(
    (theme: ThemePreference): Promise<void> => update({ theme }),
    [update],
  );

  const value = useMemo<PreferencesValue>(
    () => ({ ...preferences, error, setDistanceUnit, setTheme }),
    [preferences, error, setDistanceUnit, setTheme],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}
