import type { ReactElement } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationBar } from 'expo-navigation-bar';
import { useIsFocused } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import type { ColorScheme } from '@/theme';

interface SystemBarsProps {
  scheme?: ColorScheme | undefined;
}

export function SystemBars({ scheme }: SystemBarsProps): ReactElement {
  const theme = useTheme();
  const effective = scheme ?? theme.scheme;
  const iconStyle = effective === 'dark' ? 'light' : 'dark';
  return (
    <>
      <StatusBar style={iconStyle} />
      <NavigationBar style={iconStyle} />
    </>
  );
}

export function FocusedSystemBars({ scheme }: SystemBarsProps): ReactElement | null {
  const focused = useIsFocused();
  return focused ? <SystemBars scheme={scheme} /> : null;
}
