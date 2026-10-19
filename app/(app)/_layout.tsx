import type { ReactElement } from 'react';
import { Redirect, Stack } from 'expo-router';
import { useSession } from '@/hooks/useSession';
import { colors } from '@/theme';

export default function AppLayout(): ReactElement | null {
  const { session, loading } = useSession();

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
      <Stack.Screen name="week/[week]" />
      <Stack.Screen name="workout/[id]" options={{ animation: 'fade' }} />
    </Stack>
  );
}
