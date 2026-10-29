import { addDays, daysBetween, formatDayCaption, mondayOf, weekdayName } from '@/lib/planCalendar';
import type {
  ActivePlan,
  PlanSession,
  PlanSessionState,
  PlanWeek,
  PlanWorkout,
  UserPlanWorkoutStatus,
  WorkoutIntensity,
} from '@/types/training';

const SECONDS_PER_MINUTE = 60;

export interface WeekDay {
  date: string;
  label: string;
  caption: string;
  sessions: PlanSession[];
}

export function sessionState(
  status: UserPlanWorkoutStatus,
  date: string,
  today: string,
): PlanSessionState {
  if (status === 'done') return 'done';
  if (status === 'skipped') return 'missed';
  if (date < today) return 'missed';
  if (date === today) return 'today';
  return 'pending';
}

export function stateOn(session: PlanSession, today: string): PlanSessionState {
  return sessionState(session.status, session.date, today);
}

function sortedSessions(plan: ActivePlan): PlanSession[] {
  return plan.weeks
    .flatMap((week) => week.sessions)
    .sort((a, b) => a.date.localeCompare(b.date) || a.workout.position - b.workout.position);
}

function planAnchor(plan: ActivePlan, today: string): string {
  const first = sortedSessions(plan).at(0);
  if (!first) return mondayOf(today);
  return addDays(first.date, -(first.workout.day_of_week - 1));
}

export function weekStartDate(plan: ActivePlan, weekNumber: number, today: string): string {
  return addDays(planAnchor(plan, today), (weekNumber - 1) * 7);
}

export function currentWeekNumber(plan: ActivePlan, today: string): number {
  const elapsed = daysBetween(planAnchor(plan, today), today);
  if (elapsed < 0) return 1;
  return Math.min(plan.fullWeeks, Math.max(1, Math.floor(elapsed / 7) + 1));
}

export function isPlanLocked(plan: ActivePlan): boolean {
  return plan.tier === 'free' && plan.fullWeeks > plan.weeks.length;
}

export function nextSession(plan: ActivePlan, today: string): PlanSession | null {
  return (
    sortedSessions(plan).find((session) => {
      const state = stateOn(session, today);
      return state === 'today' || state === 'pending';
    }) ?? null
  );
}

export function todaySessions(plan: ActivePlan, today: string): PlanSession[] {
  return sortedSessions(plan).filter((session) => session.date === today);
}

export function findSession(plan: ActivePlan, sessionId: string): PlanSession | null {
  return sortedSessions(plan).find((session) => session.id === sessionId) ?? null;
}

export function findWeek(plan: ActivePlan, weekNumber: number): PlanWeek | null {
  return plan.weeks.find((week) => week.weekNumber === weekNumber) ?? null;
}

export function planProgress(plan: ActivePlan): { done: number; total: number } {
  const sessions = sortedSessions(plan);
  return {
    done: sessions.filter((session) => session.status === 'done').length,
    total: sessions.length,
  };
}

export function weekDays(week: PlanWeek, anchorDate: string): WeekDay[] {
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(anchorDate, index);
    return {
      date,
      label: weekdayName(date),
      caption: formatDayCaption(date),
      sessions: week.sessions.filter((session) => session.date === date),
    };
  });
}

export function formatStepDuration(seconds: number): string {
  if (seconds < SECONDS_PER_MINUTE) return `${String(seconds)} s`;
  const minutes = Math.floor(seconds / SECONDS_PER_MINUTE);
  const rest = seconds % SECONDS_PER_MINUTE;
  return rest === 0 ? `${String(minutes)} min` : `${String(minutes)} min ${String(rest)} s`;
}

export function formatKilometers(meters: number): string {
  const kilometers = meters / 1000;
  const value = Number.isInteger(kilometers) ? String(kilometers) : kilometers.toFixed(1).replace('.', ',');
  return `${value} km`;
}

export function distanceTargetLabel(workout: Pick<PlanWorkout, 'target_distance_meters'>): string | null {
  const meters = workout.target_distance_meters;
  return meters !== null && meters > 0 ? formatKilometers(meters) : null;
}

export function sessionTargetLabel(
  workout: Pick<PlanWorkout, 'target_distance_meters' | 'target_duration_minutes'>,
): string | null {
  const distance = distanceTargetLabel(workout);
  if (distance !== null) return distance;
  const minutes = workout.target_duration_minutes;
  if (minutes !== null && minutes > 0) return `${String(minutes)} min`;
  return null;
}

const intensityLabels: Record<WorkoutIntensity, string> = {
  easy: 'Leve',
  moderate: 'Moderada',
  hard: 'Forte',
};

export function intensityLabel(intensity: WorkoutIntensity | null): string | null {
  return intensity === null ? null : intensityLabels[intensity];
}

export function zoneLabel(zone: number | null): string | null {
  return zone === null ? null : `Zona ${String(zone)}`;
}
