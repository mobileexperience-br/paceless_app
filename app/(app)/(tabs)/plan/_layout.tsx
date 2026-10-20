import type { ReactElement } from 'react';
import { Stack } from 'expo-router';
import { colors } from '@/theme';

export default function PlanLayout(): ReactElement {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
