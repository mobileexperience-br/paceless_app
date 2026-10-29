import { useEffect } from 'react';
import { useSession } from '@/hooks/useSession';
import { localToday } from '@/lib/planDates';
import { clearOnboardingState, readOnboardingAnswers } from '@/lib/onboardingStorage';
import { parseProfileRow } from '@/lib/profileRow';
import { trainingDaysFor } from '@/lib/trainingDayCombos';
import { supabase } from '@/lib/supabase';

async function syncOnboarding(userId: string): Promise<void> {
  if (!supabase) return;
  const answers = await readOnboardingAnswers();
  if (!answers) return;
  const result = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (result.error) return;
  const raw: unknown = result.data;
  if (parseProfileRow(raw)?.onboarding_completed_at) {
    await clearOnboardingState();
    return;
  }
  const { error: upsertError } = await supabase.from('profiles').upsert(
    {
      id: userId,
      goal: answers.goal,
      level: answers.level,
      days_per_week: answers.daysPerWeek,
      training_days: [...trainingDaysFor(answers.trainingDays)],
      strength: answers.strength,
      onboarding_completed_at: new Date().toISOString(),
    },
    { onConflict: 'id', defaultToNull: false },
  );
  if (upsertError) return;
  let generated = false;
  try {
    const response = await supabase.functions.invoke('generate-plan', { body: { startDate: localToday() } });
    generated = response.error === null;
  } catch {
    generated = false;
  }
  if (!generated) {
    await clearOnboardingState();
    return;
  }
  await clearOnboardingState();
}

export function useOnboardingSync(): void {
  const { user } = useSession();
  const userId = user?.id ?? null;

  useEffect(() => {
    if (!userId) return;
    void syncOnboarding(userId).catch(() => undefined);
  }, [userId]);
}
