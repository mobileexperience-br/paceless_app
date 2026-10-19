import { Stack } from 'expo-router';
import { colors } from '@/theme';

export default function AppLayout() {
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
