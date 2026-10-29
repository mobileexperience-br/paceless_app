import { comboGroup, comboIdForDays, type TrainingDayComboId } from '@/lib/trainingDayCombos';
import type { ProfileRow } from '@/types/database';
import type { OnboardingAnswers } from '@/types/onboarding';

export interface PlanDraft {
  goal: OnboardingAnswers['goal'] | null;
  level: OnboardingAnswers['level'] | null;
  daysPerWeek: OnboardingAnswers['daysPerWeek'] | null;
  trainingDays: TrainingDayComboId | null;
  strength: OnboardingAnswers['strength'] | null;
}

export const emptyPlanDraft: PlanDraft = {
  goal: null,
  level: null,
  daysPerWeek: null,
  trainingDays: null,
  strength: null,
};

export function draftFromProfile(row: ProfileRow | null): PlanDraft {
  if (!row) return emptyPlanDraft;
  const combo = comboIdForDays([...row.training_days].sort((a, b) => a - b));
  const consistent = combo !== null && comboGroup(combo) === row.days_per_week;
  return {
    goal: row.goal,
    level: row.level,
    daysPerWeek: row.days_per_week,
    trainingDays: consistent ? combo : null,
    strength: row.strength,
  };
}

export function draftsDiffer(a: PlanDraft, b: PlanDraft | null): boolean {
  if (b === null) return true;
  return (
    a.goal !== b.goal ||
    a.level !== b.level ||
    a.daysPerWeek !== b.daysPerWeek ||
    a.trainingDays !== b.trainingDays ||
    a.strength !== b.strength
  );
}

export function isPlanDraftComplete(draft: PlanDraft): boolean {
  return (
    draft.goal !== null &&
    draft.level !== null &&
    draft.daysPerWeek !== null &&
    draft.trainingDays !== null &&
    draft.strength !== null &&
    comboGroup(draft.trainingDays) === draft.daysPerWeek
  );
}
