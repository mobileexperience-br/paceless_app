import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useSession } from '@/hooks/useSession';
import { runAutoSync } from '@/lib/healthSync';

export function useHealthAutoSync(): void {
  const { user } = useSession();
  const userId = user?.id ?? null;

  useEffect(() => {
    if (userId) void runAutoSync();
  }, [userId]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state): void => {
      if (state === 'active' && userId) void runAutoSync();
    });
    return (): void => {
      subscription.remove();
    };
  }, [userId]);
}
