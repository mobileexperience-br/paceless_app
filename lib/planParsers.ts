import { isRecord } from '@/lib/activities';
import { parsePlanSteps } from '@/lib/planSteps';
import type {
  PlanTier,
  PlanWorkout,
  UserPlanWorkoutStatus,
  WorkoutIntensity,
} from '@/types/training';

const workoutKinds = ['run', 'strength', 'rest'] as const;
const intensities: readonly WorkoutIntensity[] = ['easy', 'moderate', 'hard'];
const tiers: readonly PlanTier[] = ['free', 'full'];
const sessionStatuses: readonly UserPlanWorkoutStatus[] = ['planned', 'done', 'skipped'];

export interface ParsedWeek {
  weekNumber: number;
  title: string;
  workouts: PlanWorkout[];
}

export interface ParsedUserPlan {
  userPlanId: string;
  startedAt: string;
  name: string;
  tier: PlanTier;
  fullWeeks: number;
  weeks: ParsedWeek[];
}

export interface SessionRow {
  id: string;
  planWorkoutId: string;
  date: string;
  status: UserPlanWorkoutStatus;
  completedAt: string | null;
}

function textField(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];
  return typeof value === 'string' ? value : null;
}

function numberField(record: Record<string, unknown>, key: string): number | null {
  const value = record[key];
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function oneOf<T extends string>(options: readonly T[], value: unknown): T | null {
  return options.find((option) => option === value) ?? null;
}

function listOf(value: unknown): unknown[] {
  if (!Array.isArray(value)) return [];
  const items: unknown[] = value;
  return items;
}

function parseWorkout(value: unknown, weekId: string): PlanWorkout | null {
  if (!isRecord(value)) return null;
  const id = textField(value, 'id');
  const title = textField(value, 'title');
  const dayOfWeek = numberField(value, 'day_of_week');
  const position = numberField(value, 'position');
  const kind = oneOf(workoutKinds, value['kind']);
  if (id === null || title === null || dayOfWeek === null || position === null || kind === null) {
    return null;
  }
  return {
    id,
    plan_week_id: weekId,
    day_of_week: dayOfWeek,
    position,
    title,
    description: textField(value, 'description'),
    kind,
    intensity: oneOf(intensities, value['intensity']),
    zone: numberField(value, 'zone'),
    target_duration_minutes: numberField(value, 'target_duration_minutes'),
    target_distance_meters: numberField(value, 'target_distance_meters'),
    steps: parsePlanSteps(value['steps']),
  };
}

function parseWeek(value: unknown): ParsedWeek | null {
  if (!isRecord(value)) return null;
  const weekId = textField(value, 'id');
  const weekNumber = numberField(value, 'week_number');
  if (weekId === null || weekNumber === null) return null;
  const workouts = listOf(value['plan_workouts'])
    .map((item) => parseWorkout(item, weekId))
    .filter((workout): workout is PlanWorkout => workout !== null);
  return { weekNumber, title: textField(value, 'title') ?? '', workouts };
}

export function parseUserPlan(value: unknown): ParsedUserPlan | null {
  if (!isRecord(value)) return null;
  const userPlanId = textField(value, 'id');
  const startedAt = textField(value, 'started_at');
  const plan = value['plan'];
  if (userPlanId === null || startedAt === null || !isRecord(plan)) return null;
  const name = textField(plan, 'name');
  if (name === null) return null;
  const weeks = listOf(plan['plan_weeks'])
    .map(parseWeek)
    .filter((week): week is ParsedWeek => week !== null)
    .sort((a, b) => a.weekNumber - b.weekNumber);
  const weekCount = numberField(plan, 'weeks') ?? weeks.length;
  return {
    userPlanId,
    startedAt,
    name,
    tier: oneOf(tiers, plan['tier']) ?? 'free',
    fullWeeks: numberField(plan, 'full_weeks') ?? weekCount,
    weeks,
  };
}

function parseSessionRow(value: unknown): SessionRow | null {
  if (!isRecord(value)) return null;
  const id = textField(value, 'id');
  const planWorkoutId = textField(value, 'plan_workout_id');
  const date = textField(value, 'scheduled_date');
  const status = oneOf(sessionStatuses, value['status']);
  if (id === null || planWorkoutId === null || date === null || status === null) return null;
  return { id, planWorkoutId, date, status, completedAt: textField(value, 'completed_at') };
}

export function parseSessionRows(value: unknown): SessionRow[] {
  return listOf(value)
    .map(parseSessionRow)
    .filter((row): row is SessionRow => row !== null);
}
