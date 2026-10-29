import { anchorMonday, dateFor } from './schedule.ts';
import { GENERATOR_VERSION, settingsHash } from './hash.ts';
import { intervalStageForWeek } from './intervals.ts';
import { keyDay, longRunDay, normalizeDays, pickRunDays, strengthDays } from './days.ts';
import { planDescription, planName, weekTitle } from './copy.ts';
import { runWorkout, strengthWorkout, type RunSession } from './sessions.ts';
import { maxRunSessions, planWeeks } from './tables.ts';
import { isRaceGoal, sessionMinutes, weeklyMinutes, weekKind } from './volume.ts';
import type { BuildPlanInput, Goal, GeneratedPlan, GeneratedWeek, GeneratedWorkout, IntervalStage, WeekKind } from './types.ts';

interface PlanSchedule {
  input: BuildPlanInput;
  runDays: number[];
  longDay: number;
  anchor: string;
  total: number;
}

interface WeekContext {
  week: number;
  kind: WeekKind;
  long: number;
  other: number;
  stage: IntervalStage | null;
  key: number | null;
}

function raceMeters(goal: Goal): number {
  return goal === 'run_5k' ? 5000 : 10000;
}

function keyDayFor(schedule: PlanSchedule, week: number, kind: WeekKind): number | null {
  const eligible =
    isRaceGoal(schedule.input.goal) &&
    schedule.input.level !== 'never_ran' &&
    week >= 3 &&
    kind === 'normal' &&
    schedule.runDays.length >= 3;
  return eligible ? keyDay(schedule.runDays, schedule.longDay) : null;
}

function sessionFor(schedule: PlanSchedule, context: WeekContext, day: number): RunSession {
  const { goal } = schedule.input;
  if (context.kind === 'taper' && day === schedule.longDay && isRaceGoal(goal)) {
    return { type: 'goal', meters: raceMeters(goal) };
  }
  if (context.stage) return { type: 'intervals', stage: context.stage };
  if (day === schedule.longDay) return { type: 'long', minutes: context.long };
  if (day === context.key) return context.week % 2 === 0 ? { type: 'tempo' } : { type: 'fartlek' };
  return { type: 'easy', minutes: context.other };
}

function buildWeek(schedule: PlanSchedule, week: number): GeneratedWeek {
  const { input, runDays, anchor, total } = schedule;
  const kind = weekKind(input.goal, week, total);
  const minutes = sessionMinutes(weeklyMinutes(input, week), runDays.length);
  const key = keyDayFor(schedule, week, kind);
  const context: WeekContext = {
    week,
    kind,
    long: minutes.long,
    other: minutes.other,
    stage: intervalStageForWeek(input.level, week, total),
    key,
  };
  const runs = runDays.map((day) =>
    runWorkout(input.goal, sessionFor(schedule, context, day), day, dateFor(anchor, week, day)),
  );
  const strengthOn = input.strength === 'yes' ? strengthDays(runDays, schedule.longDay, key) : [];
  const strength = strengthOn.map((day) => strengthWorkout(day, dateFor(anchor, week, day)));
  const workouts: GeneratedWorkout[] = [...runs, ...strength].sort(
    (a, b) => a.day_of_week - b.day_of_week || a.position - b.position,
  );
  return { week_number: week, title: weekTitle(week, kind), workouts };
}

export function buildPlan(input: BuildPlanInput): GeneratedPlan {
  const trainingDays = normalizeDays(input.trainingDays);
  const total = planWeeks[input.goal][input.level];
  const cap = Math.min(trainingDays.length, maxRunSessions[input.level]);
  const runDays = pickRunDays(trainingDays, cap);
  const firstRunDay = runDays.at(0);
  if (firstRunDay === undefined) throw new Error('Training days are required');
  const schedule: PlanSchedule = {
    input: { ...input, trainingDays },
    runDays,
    longDay: longRunDay(runDays),
    anchor: anchorMonday(input.startDate, firstRunDay),
    total,
  };
  const weekCount = input.tier === 'free' ? Math.min(2, total) : total;
  const weeks = Array.from({ length: weekCount }, (_, index) => buildWeek(schedule, index + 1));
  return {
    name: planName(input.goal, input.tier),
    description: planDescription,
    goal: input.goal,
    level: input.level,
    sessions_per_week: weeks.at(0)?.workouts.filter((workout) => workout.kind === 'run').length ?? 0,
    tier: input.tier,
    full_weeks: total,
    settings_hash: settingsHash(input),
    generator_version: GENERATOR_VERSION,
    weeks,
  };
}
