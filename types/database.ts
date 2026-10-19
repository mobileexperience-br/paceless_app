import type { OnboardingAnswers } from '@/types/onboarding';

export interface ProfileRow {
  id: string;
  name: string | null;
  goal: OnboardingAnswers['goal'] | null;
  level: OnboardingAnswers['level'] | null;
  days_per_week: OnboardingAnswers['daysPerWeek'] | null;
  strength: OnboardingAnswers['strength'] | null;
  onboarding_completed_at: string | null;
  created_at: string;
  updated_at: string;
}
