import { useCallback, useState } from 'react';
import { useActivePlan } from '@/hooks/useActivePlan';
import { useGeneratePlan } from '@/hooks/useGeneratePlan';
import { useProfile } from '@/hooks/useProfile';
import { useSession } from '@/hooks/useSession';
import { draftFromProfile, draftsDiffer, emptyPlanDraft, isPlanDraftComplete, type PlanDraft } from '@/lib/planDraft';
import { comboGroup, trainingDaysFor, type TrainingDayComboId } from '@/lib/trainingDayCombos';
import { supabase } from '@/lib/supabase';
import type { ProfileRow } from '@/types/database';
import type { OnboardingAnswers } from '@/types/onboarding';

export interface UsePlanSettings {
  loading: boolean;
  draft: PlanDraft;
  dirty: boolean;
  complete: boolean;
  saving: boolean;
  regenerating: boolean;
  needsRegeneration: boolean;
  missingPlan: boolean;
  error: string | null;
  setGoal: (value: OnboardingAnswers['goal']) => void;
  setLevel: (value: OnboardingAnswers['level']) => void;
  setDaysPerWeek: (value: OnboardingAnswers['daysPerWeek']) => void;
  setTrainingDays: (value: TrainingDayComboId) => void;
  setStrength: (value: OnboardingAnswers['strength']) => void;
  save: () => Promise<SaveOutcome>;
}

export type SaveOutcome = 'saved' | 'regeneration_failed' | 'failed';

const saveError = 'Não foi possível salvar as configurações. Tente novamente.';

export function usePlanSettings(): UsePlanSettings {
  const { user } = useSession();
  const userId = user?.id ?? null;
  const { profile, loading: profileLoading, refresh } = useProfile();
  const { generate, generating: regenerating } = useGeneratePlan();
  const { plan, loading: planLoading, reload } = useActivePlan();
  const [source, setSource] = useState<{ profile: ProfileRow | null } | null>(null);
  const [initial, setInitial] = useState<PlanDraft | null>(null);
  const [draft, setDraft] = useState<PlanDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [needsRegeneration, setNeedsRegeneration] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const missingPlan = !planLoading && plan === null;
  const canRegenerate = needsRegeneration || missingPlan;

  if (!profileLoading && source?.profile !== profile) {
    const next = draftFromProfile(profile);
    setSource({ profile });
    setInitial(next);
    if (draft === null || !draftsDiffer(draft, initial)) setDraft(next);
  }

  const dirty = draft !== null && draftsDiffer(draft, initial);
  const complete = draft !== null && isPlanDraftComplete(draft);

  const patch = useCallback((changes: Partial<PlanDraft>): void => {
    setError(null);
    setDraft((current) => (current ? { ...current, ...changes } : current));
  }, []);

  const setGoal = useCallback((value: OnboardingAnswers['goal']) => { patch({ goal: value }); }, [patch]);
  const setLevel = useCallback((value: OnboardingAnswers['level']) => { patch({ level: value }); }, [patch]);
  const setStrength = useCallback((value: OnboardingAnswers['strength']) => { patch({ strength: value }); }, [patch]);
  const setTrainingDays = useCallback((value: TrainingDayComboId) => { patch({ trainingDays: value }); }, [patch]);

  const setDaysPerWeek = useCallback((value: OnboardingAnswers['daysPerWeek']): void => {
    setError(null);
    setDraft((current) => {
      if (!current) return current;
      const keep = current.trainingDays !== null && comboGroup(current.trainingDays) === value;
      return { ...current, daysPerWeek: value, trainingDays: keep ? current.trainingDays : null };
    });
  }, []);

  const regenerate = useCallback(async (): Promise<SaveOutcome> => {
    setSaving(true);
    setError(null);
    const regeneration = await generate();
    setSaving(false);
    if (regeneration.error) {
      setNeedsRegeneration(true);
      setError(regeneration.error);
      return 'regeneration_failed';
    }
    setNeedsRegeneration(false);
    await reload();
    return 'saved';
  }, [generate, reload]);

  const save = useCallback(async (): Promise<SaveOutcome> => {
    const days = draft?.trainingDays ?? null;
    if (!draft || days === null || !complete || (!dirty && !canRegenerate)) return 'failed';
    if (!supabase || !userId) {
      setError('Serviço não configurado.');
      return 'failed';
    }
    if (!dirty) return regenerate();
    setSaving(true);
    setError(null);
    let saved = false;
    try {
      const result = await supabase
        .from('profiles')
        .update({
          goal: draft.goal,
          level: draft.level,
          days_per_week: draft.daysPerWeek,
          training_days: [...trainingDaysFor(days)],
          strength: draft.strength,
        })
        .eq('id', userId)
        .select('id');
      const rows: unknown = result.data;
      saved = !result.error && Array.isArray(rows) && rows.length > 0;
    } catch {
      saved = false;
    }
    if (!saved) {
      setSaving(false);
      setError(saveError);
      return 'failed';
    }
    setInitial(draft);
    await refresh();
    return regenerate();
  }, [draft, complete, dirty, canRegenerate, userId, refresh, regenerate]);

  return {
    loading: profileLoading || draft === null,
    draft: draft ?? emptyPlanDraft,
    dirty,
    complete,
    saving,
    regenerating,
    needsRegeneration,
    missingPlan,
    error,
    setGoal,
    setLevel,
    setDaysPerWeek,
    setTrainingDays,
    setStrength,
    save,
  };
}
