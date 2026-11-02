import { localToday } from '@/lib/planDates';
import { sessionState } from '@/lib/planProgress';
import {
  parseSessionRows,
  parseUserPlan,
  type ParsedUserPlan,
  type ParsedWeek,
  type SessionRow,
} from '@/lib/planParsers';
import { supabase } from '@/lib/supabase';
import type { ActivePlan, AttemptSummary, PlanSession, PlanWeek } from '@/types/training';

const userPlanSelect = [
  'id',
  'started_at',
  'status',
  'current_week',
  'current_attempt',
  'current_week_started_on',
  'plan:plans(id,name,tier,weeks,full_weeks,sessions_per_week,plan_weeks(id,week_number,title,plan_workouts(id,day_of_week,position,title,description,kind,intensity,zone,target_duration_minutes,target_distance_meters,steps)))',
].join(',');

const sessionSelect = 'id,plan_workout_id,scheduled_date,status,activity_id,completed_at,week_number,attempt';

function bySchedule(a: PlanSession, b: PlanSession): number {
  return a.date.localeCompare(b.date) || a.workout.position - b.workout.position;
}

function attemptSessions(week: ParsedWeek, rows: SessionRow[], attempt: number, today: string): PlanSession[] {
  const workoutById = new Map(week.workouts.map((workout) => [workout.id, workout]));
  return rows
    .filter((row) => row.attempt === attempt && row.status !== 'cancelled')
    .flatMap((row): PlanSession[] => {
      const workout = workoutById.get(row.planWorkoutId);
      if (!workout) return [];
      return [
        {
          id: row.id,
          workout,
          date: row.date,
          status: row.status,
          state: sessionState(row.status, row.date, today),
          completedAt: row.completedAt,
          weekNumber: week.weekNumber,
          attempt: row.attempt,
        },
      ];
    })
    .sort(bySchedule);
}

function previousAttempts(week: ParsedWeek, rows: SessionRow[], current: number): AttemptSummary[] {
  const workoutIds = new Set(week.workouts.map((workout) => workout.id));
  const attempts = [...new Set(rows.map((row) => row.attempt))]
    .filter((attempt) => attempt < current)
    .sort((a, b) => a - b);
  return attempts.map((attempt) => {
    const eligible = rows.filter(
      (row) => row.attempt === attempt && row.status !== 'cancelled' && workoutIds.has(row.planWorkoutId),
    );
    return {
      attempt,
      completed: eligible.filter((row) => row.status === 'completed').length,
      eligible: eligible.length,
    };
  });
}

function assembleWeek(week: ParsedWeek, rows: SessionRow[], today: string): PlanWeek {
  const weekRows = rows.filter((row) => row.weekNumber === week.weekNumber);
  const attempt = weekRows.reduce((highest, row) => Math.max(highest, row.attempt), 1);
  const sessions = attemptSessions(week, weekRows, attempt, today);
  return {
    weekNumber: week.weekNumber,
    title: week.title,
    attempt,
    sessions,
    history: previousAttempts(week, weekRows, attempt),
    done: sessions.filter((session) => session.status === 'completed').length,
    total: sessions.length,
  };
}

function assemble(plan: ParsedUserPlan, rows: SessionRow[], today: string): ActivePlan {
  return {
    userPlanId: plan.userPlanId,
    name: plan.name,
    tier: plan.tier,
    weeks: plan.weeks.map((week) => assembleWeek(week, rows, today)),
    fullWeeks: plan.fullWeeks,
    startedAt: plan.startedAt,
    currentWeek: plan.currentWeek,
    currentAttempt: plan.currentAttempt,
    currentWeekStartedOn: plan.currentWeekStartedOn,
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
