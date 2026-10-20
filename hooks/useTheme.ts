import { useContext, useMemo } from 'react';
import { ThemeContext, type ThemeValue } from '@/providers/ThemeProvider';
import type { Palette } from '@/theme';

export function useTheme(): ThemeValue {
  return useContext(ThemeContext);
}

export function useThemedStyles<T>(factory: (colors: Palette) => T): T {
  const { colors } = useContext(ThemeContext);
  return useMemo(() => factory(colors), [factory, colors]);
}
