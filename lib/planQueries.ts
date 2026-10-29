import { localToday } from '@/lib/planDates';
import { sessionState } from '@/lib/planProgress';
import { parseSessionRows, parseUserPlan, type ParsedUserPlan, type SessionRow } from '@/lib/planParsers';
import { supabase } from '@/lib/supabase';
import type { ActivePlan, PlanSession, PlanWeek } from '@/types/training';

const userPlanSelect = [
  'id',
  'started_at',
  'status',
  'plan:plans(id,name,tier,weeks,full_weeks,sessions_per_week,plan_weeks(id,week_number,title,plan_workouts(id,day_of_week,position,title,description,kind,intensity,zone,target_duration_minutes,target_distance_meters,steps)))',
].join(',');

const sessionSelect = 'id,plan_workout_id,scheduled_date,status,activity_id,completed_at';

function bySchedule(a: PlanSession, b: PlanSession): number {
  return a.date.localeCompare(b.date) || a.workout.position - b.workout.position;
}

function assemble(plan: ParsedUserPlan, rows: SessionRow[], today: string): ActivePlan {
  const rowByWorkout = new Map(rows.map((row) => [row.planWorkoutId, row]));
  const weeks: PlanWeek[] = plan.weeks.map((week) => {
    const sessions: PlanSession[] = [];
    for (const workout of week.workouts) {
      const row = rowByWorkout.get(workout.id);
      if (!row) continue;
      sessions.push({
        id: row.id,
        workout,
        date: row.date,
        status: row.status,
        state: sessionState(row.status, row.date, today),
        completedAt: row.completedAt,
        weekNumber: week.weekNumber,
      });
    }
    sessions.sort(bySchedule);
    const done = sessions.filter((session) => session.status === 'done').length;
    return { weekNumber: week.weekNumber, title: week.title, sessions, done, total: sessions.length };
  });
  return {
    userPlanId: plan.userPlanId,
    name: plan.name,
    tier: plan.tier,
    weeks,
    fullWeeks: plan.fullWeeks,
    startedAt: plan.startedAt,
  };
}

export async function fetchActivePlan(): Promise<ActivePlan | null> {
  if (!supabase) throw new Error('Supabase não configurado.');
  const planResult = await supabase
    .from('user_plans')
    .select(userPlanSelect)
    .eq('status', 'active')
    .maybeSingle();
  if (planResult.error) throw new Error(planResult.error.message);
  const plan = parseUserPlan(planResult.data);
  if (!plan) return null;

  const sessionResult = await supabase
    .from('user_plan_workouts')
    .select(sessionSelect)
    .eq('user_plan_id', plan.userPlanId);
  if (sessionResult.error) throw new Error(sessionResult.error.message);

  return assemble(plan, parseSessionRows(sessionResult.data), localToday());
}
