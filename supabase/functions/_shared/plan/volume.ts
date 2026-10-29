import { maxWeeklyMinutes, planWeeks, startWeeklyMinutes } from './tables.ts';
import type { BuildPlanInput, Goal, Level, WeekKind } from './types.ts';

const growthFactor = 1.1;
const recoveryFactor = 0.8;
const taperFactor = 0.7;
const minSessionMinutes = 20;
const maxLongMinutes = 90;

export interface SessionMinutes {
  long: number;
  other: number;
}

export function isRaceGoal(goal: Goal): boolean {
  return goal === 'run_5k' || goal === 'run_10k';
}

export function isRecoveryWeek(week: number, total: number): boolean {
  return week % 4 === 0 && week !== total;
}

export function isTaperWeek(goal: Goal, week: number, total: number): boolean {
  return isRaceGoal(goal) && week === total && total > 1;
}

export function weekKind(goal: Goal, week: number, total: number): WeekKind {
  if (isTaperWeek(goal, week, total)) return 'taper';
  if (isRecoveryWeek(week, total)) return 'recovery';
  return 'normal';
}

export function roundToFive(value: number): number {
  return Math.round(value / 5) * 5;
}

export function rawWeeklyMinutes(goal: Goal, level: Level): number[] {
  const total = planWeeks[goal][level];
  const base = startWeeklyMinutes[level];
  const values: number[] = [];
  let normal = base;
  for (let week = 1; week <= total; week += 1) {
    const kind = weekKind(goal, week, total);
    if (week === 1) {
      values.push(base);
    } else if (kind === 'taper') {
      values.push((values.at(-1) ?? base) * taperFactor);
    } else if (kind === 'recovery') {
      values.push(normal * recoveryFactor);
    } else {
      normal *= growthFactor;
      values.push(normal);
    }
  }
  return values;
}

export function weeklyMinutes(input: Pick<BuildPlanInput, 'goal' | 'level'>, week: number): number {
  const raw = rawWeeklyMinutes(input.goal, input.level).at(week - 1) ?? 0;
  return Math.min(roundToFive(raw), maxWeeklyMinutes[input.level]);
}

function clampSession(minutes: number): number {
  return Math.min(maxLongMinutes, Math.max(minSessionMinutes, minutes));
}

export function sessionMinutes(weekly: number, runCount: number): SessionMinutes {
  if (runCount <= 1) {
    const only = clampSession(roundToFive(weekly));
    return { long: only, other: only };
  }
  const longShare = runCount === 2 ? 0.55 : 0.35;
  const long = clampSession(roundToFive(weekly * longShare));
  const other = clampSession(roundToFive((weekly - long) / (runCount - 1)));
  return { long, other };
}
