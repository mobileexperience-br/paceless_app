import type { ReactElement, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { SystemBars } from '@/components/SystemBars';
import { useTheme } from '@/hooks/useTheme';
import { useWindowBackground } from '@/hooks/useWindowBackground';

export function ThemedStack({ children }: { children: ReactNode }): ReactElement {
  const { colors } = useTheme();
  useWindowBackground();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <SystemBars />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        {children}
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
