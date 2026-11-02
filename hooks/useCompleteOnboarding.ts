import { useCallback, useState } from 'react';
import { useActivePlan } from '@/hooks/useActivePlan';
import { useGeneratePlan } from '@/hooks/useGeneratePlan';
import { useProfile } from '@/hooks/useProfile';
import { useSession } from '@/hooks/useSession';
import { offerReminderPermission, syncReminders } from '@/lib/notificationSettings';
import { registerPushToken } from '@/lib/pushTokens';
import { supabase } from '@/lib/supabase';

export type CompletionStatus = 'idle' | 'generating' | 'ready' | 'unavailable' | 'failed';

interface UseCompleteOnboarding {
  status: CompletionStatus;
  error: string | null;
  run: () => Promise<void>;
}

const completionError = 'Não foi possível concluir. Tente novamente.';

export function useCompleteOnboarding(): UseCompleteOnboarding {
  const { user } = useSession();
  const userId = user?.id ?? null;
  const { profile, refresh } = useProfile();
  const { reload } = useActivePlan();
  const { generate } = useGeneratePlan();
  const [status, setStatus] = useState<CompletionStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const markCompleted = useCallback(async (): Promise<boolean> => {
    if (!supabase || userId === null) return false;
    try {
      const result = await supabase
        .from('profiles')
        .update({ onboarding_completed_at: new Date().toISOString() })
        .eq('id', userId)
        .select('id');
      const rows: unknown = result.data;
      return !result.error && Array.isArray(rows) && rows.length > 0;
    } catch {
      return false;
    }
  }, [userId]);

  const remindIfReady = useCallback(
    async (days: readonly number[]): Promise<void> => {
      if (userId === null) return;
      const permission = await offerReminderPermission(userId, days).catch(() => null);
      if (permission === 'granted') void registerPushToken(userId);
      await syncReminders(userId, days).catch(() => undefined);
    },
    [userId],
  );

  const run = useCallback(async (): Promise<void> => {
    setStatus('generating');
    setError(null);
    const result = await generate();
    const target: CompletionStatus | null =
      result.code === 'ok' ? 'ready' : result.code === 'level_not_supported' ? 'unavailable' : null;
    if (target === null) {
      setStatus('failed');
      setError(result.error);
      return;
    }
    if (!(await markCompleted())) {
      setStatus('failed');
      setError(completionError);
      return;
    }
    await refresh();
    if (target === 'ready') {
      await reload();
      await remindIfReady(profile?.training_days ?? []);
    }
    setStatus(target);
  }, [generate, markCompleted, profile, refresh, reload, remindIfReady]);

  return { status, error, run };
}
