import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useSession } from '@/hooks/useSession';
import { registerPushToken } from '@/lib/pushTokens';

export function usePushTokenSync(): void {
  const { user } = useSession();
  const userId = user?.id ?? null;

  useEffect(() => {
    if (userId) void registerPushToken(userId);
  }, [userId]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state): void => {
      if (state === 'active' && userId) void registerPushToken(userId);
    });
    return (): void => {
      subscription.remove();
    };
  }, [userId]);
}
