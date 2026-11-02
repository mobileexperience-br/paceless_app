import { trainingDaysFor } from '@/lib/trainingDayCombos';
import { supabase } from '@/lib/supabase';
import type { ProfileRow } from '@/types/database';
import type { OnboardingStepKey, PartialOnboardingAnswers } from '@/types/onboarding';

type ProfilePatch = Partial<Pick<ProfileRow, 'goal' | 'level' | 'days_per_week' | 'training_days'>>;

export function patchForStep(key: OnboardingStepKey, answers: PartialOnboardingAnswers): ProfilePatch | null {
  switch (key) {
    case 'goal':
      return answers.goal ? { goal: answers.goal } : null;
    case 'level':
      return answers.level ? { level: answers.level } : null;
    case 'daysPerWeek':
      if (!answers.daysPerWeek) return null;
      return answers.trainingDays
        ? { days_per_week: answers.daysPerWeek }
        : { days_per_week: answers.daysPerWeek, training_days: [] };
    case 'trainingDays':
      return answers.trainingDays ? { training_days: [...trainingDaysFor(answers.trainingDays)] } : null;
  }
}

export async function saveOnboardingStep(
  userId: string,
  key: OnboardingStepKey,
  answers: PartialOnboardingAnswers,
): Promise<boolean> {
  const patch = patchForStep(key, answers);
  if (!supabase || !patch) return false;
  try {
    const result = await supabase.from('profiles').update(patch).eq('id', userId).select('id');
    const rows: unknown = result.data;
    return !result.error && Array.isArray(rows) && rows.length > 0;
  } catch {
    return false;
  }
}
