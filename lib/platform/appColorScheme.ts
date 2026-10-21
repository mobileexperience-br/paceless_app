import { Appearance } from 'react-native';
import type { ThemePreference } from '@/types/preferences';

export function setAppColorScheme(theme: ThemePreference): void {
  Appearance.setColorScheme(theme === 'system' ? 'unspecified' : theme);
}
