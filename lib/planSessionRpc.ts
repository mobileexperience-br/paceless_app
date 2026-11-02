import { notifyActivitiesChanged } from '@/lib/activityQueue';
import { supabase } from '@/lib/supabase';

export type SessionTransition = 'in_progress' | 'paused' | 'interrupted';
export type InterruptReason = 'discarded' | 'too_short';

export async function reportPlanSession(
  sessionId: string,
  to: SessionTransition,
  reason?: InterruptReason,
): Promise<void> {
  if (!supabase) return;
  try {
    const { error } = await supabase.rpc('transition_plan_session', {
      p_session: sessionId,
      p_to: to,
      p_reason: reason ?? null,
    });
    if (error) return;
    notifyActivitiesChanged();
  } catch {
    return;
  }
}
