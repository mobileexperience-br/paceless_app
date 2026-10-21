import { createContext, useEffect, useMemo, type ReactElement, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { usePreferences } from '@/hooks/usePreferences';
import { setAppColorScheme } from '@/lib/platform/appColorScheme';
import { palettes, type ColorScheme, type Palette } from '@/theme';

export interface ThemeValue {
  scheme: ColorScheme;
  isDark: boolean;
  colors: Palette;
}

export const ThemeContext = createContext<ThemeValue>({
  scheme: 'light',
  isDark: false,
  colors: palettes.light,
});

function buildTheme(scheme: ColorScheme): ThemeValue {
  return { scheme, isDark: scheme === 'dark', colors: palettes[scheme] };
}

export function ThemeScope({
  scheme,
  children,
}: {
  scheme: ColorScheme;
  children: ReactNode;
}): ReactElement {
  const value = useMemo(() => buildTheme(scheme), [scheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function ThemeProvider({ children }: { children: ReactNode }): ReactElement {
  const { theme } = usePreferences();
  const system = useColorScheme();

  useEffect(() => {
    setAppColorScheme(theme);
  }, [theme]);

  const scheme: ColorScheme =
    theme === 'system' ? (system === 'dark' ? 'dark' : 'light') : theme;
  return <ThemeScope scheme={scheme}>{children}</ThemeScope>;
}
