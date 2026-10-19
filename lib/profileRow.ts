import { onboardingOptions } from '@/types/onboarding';
import type { ProfileRow } from '@/types/database';
import { defaultPreferences, distanceUnits, themePreferences } from '@/types/preferences';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function textOrNull(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function optionOrNull<T extends string>(options: readonly T[], value: unknown): T | null {
  const found = options.find((option) => option === value);
  return found ?? null;
}

export function parseProfileRow(raw: unknown): ProfileRow | null {
  if (!isRecord(raw)) return null;
  const { id, created_at: createdAt, updated_at: updatedAt } = raw;
  if (typeof id !== 'string' || typeof createdAt !== 'string' || typeof updatedAt !== 'string') {
    return null;
  }
  return {
    id,
    name: textOrNull(raw['name']),
    avatar_path: textOrNull(raw['avatar_path']),
    goal: optionOrNull(onboardingOptions.goal, raw['goal']),
    level: optionOrNull(onboardingOptions.level, raw['level']),
    days_per_week: optionOrNull(onboardingOptions.daysPerWeek, raw['days_per_week']),
    strength: optionOrNull(onboardingOptions.strength, raw['strength']),
    onboarding_completed_at: textOrNull(raw['onboarding_completed_at']),
    distance_unit:
      optionOrNull(distanceUnits, raw['distance_unit']) ?? defaultPreferences.distanceUnit,
    theme: optionOrNull(themePreferences, raw['theme']) ?? defaultPreferences.theme,
    created_at: createdAt,
    updated_at: updatedAt,
  };
}
