import { supabase } from '@/lib/supabase';
import { parsePlanWeekStatus } from '@/lib/planWeekStatusParser';
import type { PlanWeekStatus } from '@/types/planWeek';

async function callWeekRpc(name: string, today: string): Promise<PlanWeekStatus | null> {
  if (!supabase) throw new Error('Supabase não configurado.');
  const response = await supabase.rpc(name, { p_today: today });
  if (response.error) throw new Error(response.error.message);
  const payload: unknown = response.data;
  return parsePlanWeekStatus(payload);
}

export function fetchPlanWeekStatus(today: string): Promise<PlanWeekStatus | null> {
  return callWeekRpc('get_plan_week_status', today);
}

export function advancePlanWeek(today: string): Promise<PlanWeekStatus | null> {
  return callWeekRpc('advance_plan_week', today);
}

export function repeatPlanWeek(today: string): Promise<PlanWeekStatus | null> {
  return callWeekRpc('repeat_plan_week', today);
}
