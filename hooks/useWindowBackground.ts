import { useEffect } from 'react';
import * as SystemUI from 'expo-system-ui';
import { useTheme } from '@/hooks/useTheme';

export function useWindowBackground(): void {
  const { colors } = useTheme();

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(colors.background);
  }, [colors.background]);
}
