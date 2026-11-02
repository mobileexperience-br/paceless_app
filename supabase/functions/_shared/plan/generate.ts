import { anchorMonday, dateFor } from './schedule.ts';
import { GENERATOR_VERSION, settingsHash } from './hash.ts';
import { intervalStageForWeek } from './intervals.ts';
import { longRunDay, normalizeDays, pickRunDays, strengthDays } from './days.ts';
import { planDescription, planName, weekTitle } from './copy.ts';
import { runWorkout, strengthWorkout, type RunSession } from './sessions.ts';
import { continuousSessionMinutes, FREE_WEEKS, maxRunSessions, PLAN_RACE_METERS, PLAN_WEEKS } from './tables.ts';
import type { BuildPlanInput, GeneratedPlan, GeneratedWeek, GeneratedWorkout } from './types.ts';

interface PlanSchedule {
  input: BuildPlanInput;
  runDays: number[];
  longDay: number;
  anchor: string;
}

function sessionFor(schedule: PlanSchedule, week: number, day: number): RunSession {
  const stage = intervalStageForWeek(schedule.input.level, week);
  if (stage) return { type: 'intervals', stage };
  if (week === PLAN_WEEKS && day === schedule.longDay) return { type: 'goal', meters: PLAN_RACE_METERS };
  return { type: 'easy', minutes: continuousSessionMinutes[week] ?? 30 };
}

function buildWeek(schedule: PlanSchedule, week: number): GeneratedWeek {
  const { input, runDays, anchor, longDay } = schedule;
  const runs = runDays.map((day) => runWorkout(sessionFor(schedule, week, day), day, dateFor(anchor, week, day)));
  const strengthOn = input.strength === 'yes' ? strengthDays(runDays, longDay, null) : [];
  const strength = strengthOn.map((day) => strengthWorkout(day, dateFor(anchor, week, day)));
  const workouts: GeneratedWorkout[] = [...runs, ...strength].sort(
    (a, b) => a.day_of_week - b.day_of_week || a.position - b.position,
  );
  return { week_number: week, title: weekTitle(week), workouts };
}

export function buildPlan(input: BuildPlanInput): GeneratedPlan {
  const trainingDays = normalizeDays(input.trainingDays);
  const runDays = pickRunDays(trainingDays, Math.min(trainingDays.length, maxRunSessions[input.level]));
  const firstRunDay = runDays.at(0);
  if (firstRunDay === undefined) throw new Error('Training days are required');
  const schedule: PlanSchedule = {
    input: { ...input, trainingDays },
    runDays,
    longDay: longRunDay(runDays),
    anchor: anchorMonday(input.startDate, firstRunDay),
  };
  const weekCount = input.tier === 'free' ? FREE_WEEKS : PLAN_WEEKS;
  const weeks = Array.from({ length: weekCount }, (_, index) => buildWeek(schedule, index + 1));
  return {
    name: planName(input.tier),
    description: planDescription,
    goal: input.goal,
    level: input.level,
    sessions_per_week: weeks.at(0)?.workouts.filter((workout) => workout.kind === 'run').length ?? 0,
    tier: input.tier,
    full_weeks: PLAN_WEEKS,
    settings_hash: settingsHash(input),
    generator_version: GENERATOR_VERSION,
    weeks,
  };
}
