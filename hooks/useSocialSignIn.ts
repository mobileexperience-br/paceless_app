import { useCallback, useRef, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useDialog } from './useDialog';
import { appleSignIn, googleSignIn } from '@/lib/platform/socialAuth';
import type { SocialResult } from '@/lib/platform/socialResult';

export type SocialPhase = 'idle' | 'picker' | 'exchanging';
export type SocialProviderName = 'google' | 'apple';

interface UseSocialSignIn {
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  provider: SocialProviderName | null;
  phase: SocialPhase;
  busy: boolean;
  appleSupported: boolean;
}

const enteringAnnouncement = 'Entrando na sua conta';

export function useSocialSignIn(): UseSocialSignIn {
  const router = useRouter();
  const { alert } = useDialog();
  const [provider, setProvider] = useState<SocialProviderName | null>(null);
  const [phase, setPhase] = useState<SocialPhase>('idle');
  const running = useRef(false);

  const run = useCallback(
    async (
      next: SocialProviderName,
      action: (onToken: () => void) => Promise<SocialResult>,
    ): Promise<void> => {
      if (running.current) {
        return;
      }
      running.current = true;
      setProvider(next);
      setPhase('picker');
      const onToken = (): void => {
        setPhase('exchanging');
        AccessibilityInfo.announceForAccessibility(enteringAnnouncement);
      };
      const result = await action(onToken);
      if (result.signedIn) {
        router.replace('/(app)');
        return;
      }
      running.current = false;
      setProvider(null);
      setPhase('idle');
      if (result.error) {
        await alert({ title: 'Não foi possível entrar', message: result.error });
      }
    },
    [alert, router],
  );

  const signInWithGoogle = useCallback(() => run('google', googleSignIn), [run]);
  const signInWithApple = useCallback(() => run('apple', appleSignIn), [run]);

  return {
    signInWithGoogle,
    signInWithApple,
    provider,
    phase,
    busy: phase !== 'idle',
    appleSupported: Platform.OS === 'ios',
  };
}
