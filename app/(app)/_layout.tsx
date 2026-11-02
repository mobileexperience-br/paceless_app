import type { ReactElement } from 'react';
import { Redirect, Stack, useSegments } from 'expo-router';
import { useHealthAutoSync } from '@/hooks/useHealthAutoSync';
import { useProfile } from '@/hooks/useProfile';
import { usePushTokenSync } from '@/hooks/usePushTokenSync';
import { useReminderSync } from '@/hooks/useReminderSync';
import { useResumeWorkout } from '@/hooks/useResumeWorkout';
import { useSession } from '@/hooks/useSession';
import { useTheme } from '@/hooks/useTheme';

export default function AppLayout(): ReactElement | null {
  const { colors } = useTheme();
  const { session, loading } = useSession();
  const { profile, loading: profileLoading } = useProfile();
  const segments = useSegments();
  useReminderSync();
  usePushTokenSync();
  useHealthAutoSync();
  useResumeWorkout(!loading && session !== null);

  if (loading) {
    return null;
  }
  if (!session) {
    return <Redirect href="/welcome" />;
  }
  if (profileLoading) {
    return null;
  }
  const inOnboarding = segments.includes('onboarding');
  if (profile?.onboarding_completed_at === null && !inOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
      <Stack.Screen name="workout/[id]" options={{ animation: 'fade', gestureEnabled: false }} />
      <Stack.Screen name="workout/summary" options={{ animation: 'fade' }} />
      <Stack.Screen name="plan-paywall" options={{ presentation: 'modal' }} />
      <Stack.Screen name="achievements" />
    </Stack>
  );
}
