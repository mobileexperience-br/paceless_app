import { useContext } from 'react';
import { PreferencesContext, type PreferencesValue } from '@/providers/PreferencesProvider';

export function usePreferences(): PreferencesValue {
  const value = useContext(PreferencesContext);
  if (!value) {
    throw new Error('usePreferences must be used within PreferencesProvider');
  }
  return value;
}
