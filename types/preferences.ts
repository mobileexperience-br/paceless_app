export const distanceUnits = ['km', 'mi'] as const;
export const themePreferences = ['system', 'light', 'dark'] as const;

export type DistanceUnit = (typeof distanceUnits)[number];
export type ThemePreference = (typeof themePreferences)[number];

export interface Preferences {
  distanceUnit: DistanceUnit;
  theme: ThemePreference;
}

export const defaultPreferences: Preferences = {
  distanceUnit: 'km',
  theme: 'system',
};
