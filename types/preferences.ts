export const distanceUnits = ['km', 'mi'] as const;
export const themePreferences = ['system', 'light', 'dark'] as const;
export const MIN_MAX_HR = 100;
export const MAX_MAX_HR = 230;

export type DistanceUnit = (typeof distanceUnits)[number];
export type ThemePreference = (typeof themePreferences)[number];

export interface Preferences {
  distanceUnit: DistanceUnit;
  theme: ThemePreference;
  maxHeartRate: number | null;
}

export const defaultPreferences: Preferences = {
  distanceUnit: 'km',
  theme: 'system',
  maxHeartRate: null,
};

export function isValidMaxHeartRate(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= MIN_MAX_HR && value <= MAX_MAX_HR;
}
