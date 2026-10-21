import { useCallback, useState } from 'react';
import { Platform } from 'react-native';
import { appleSignIn, googleSignIn } from '@/lib/platform/socialAuth';
import type { SocialResult } from '@/lib/platform/socialResult';

export type { SocialResult };

type SocialProviderName = 'google' | 'apple';

interface UseSocialSignIn {
  signInWithGoogle: () => Promise<SocialResult>;
  signInWithApple: () => Promise<SocialResult>;
  loading: SocialProviderName | null;
  appleSupported: boolean;
}

export function useSocialSignIn(): UseSocialSignIn {
  const [loading, setLoading] = useState<SocialProviderName | null>(null);

  const run = useCallback(
    async (
      provider: SocialProviderName,
      action: () => Promise<SocialResult>,
    ): Promise<SocialResult> => {
      setLoading(provider);
      try {
        return await action();
      } finally {
        setLoading(null);
      }
    },
    [],
  );

  const signInWithGoogle = useCallback(() => run('google', googleSignIn), [run]);
  const signInWithApple = useCallback(() => run('apple', appleSignIn), [run]);

  return { signInWithGoogle, signInWithApple, loading, appleSupported: Platform.OS === 'ios' };
}
