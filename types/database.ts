import type { OnboardingAnswers } from '@/types/onboarding';
import type { DistanceUnit, ThemePreference } from '@/types/preferences';

export interface ProfileRow {
  id: string;
  name: string | null;
  avatar_path: string | null;
  goal: OnboardingAnswers['goal'] | null;
  level: OnboardingAnswers['level'] | null;
  days_per_week: OnboardingAnswers['daysPerWeek'] | null;
  training_days: number[];
  strength: OnboardingAnswers['strength'] | null;
  onboarding_completed_at: string | null;
  distance_unit: DistanceUnit;
  theme: ThemePreference;
  created_at: string;
  updated_at: string;
}

export * from '@/types/training';
export * from '@/types/wellbeing';
