import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  defaultPreferences,
  distanceUnits,
  isValidMaxHeartRate,
  themePreferences,
  type Preferences,
} from '@/types/preferences';

export const PREFERENCES_STORAGE_KEY = 'paceless:preferences';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function pick<T extends string>(options: readonly T[], value: unknown, fallback: T): T {
  return options.find((option) => option === value) ?? fallback;
}

export function parsePreferences(raw: unknown): Preferences {
  if (!isRecord(raw)) return defaultPreferences;
  return {
    distanceUnit: pick(distanceUnits, raw['distanceUnit'], defaultPreferences.distanceUnit),
    theme: pick(themePreferences, raw['theme'], defaultPreferences.theme),
    maxHeartRate: isValidMaxHeartRate(raw['maxHeartRate']) ? raw['maxHeartRate'] : null,
  };
}

export async function loadPreferences(): Promise<Preferences> {
  try {
    const stored = await AsyncStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (stored === null) return defaultPreferences;
    const parsed: unknown = JSON.parse(stored);
    return parsePreferences(parsed);
  } catch {
    return defaultPreferences;
  }
}

export async function savePreferences(preferences: Preferences): Promise<void> {
  try {
    await AsyncStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    return;
  }
}
