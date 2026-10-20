import type { ReactElement } from 'react';
import { Redirect, Stack } from 'expo-router';
import { useOnboardingSync } from '@/hooks/useOnboardingSync';
import { useSession } from '@/hooks/useSession';
import { colors } from '@/theme';

export default function AppLayout(): ReactElement | null {
  const { session, loading } = useSession();
  useOnboardingSync();

  if (loading) {
    return null;
  }
  if (!session) {
    return <Redirect href="/welcome" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="workout/[id]" options={{ animation: 'fade' }} />
      <Stack.Screen name="workout/summary" options={{ animation: 'fade' }} />
    </Stack>
  );
}
