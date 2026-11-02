import type { EligibleLevel, IntervalStage } from './types.ts';

export const PLAN_WEEKS = 8;
export const FREE_WEEKS = 2;
export const PLAN_RACE_METERS = 5000;

export const maxRunSessions: Record<EligibleLevel, number> = {
  total_beginner: 3,
  beginner: 3,
};

export const intervalStages: readonly IntervalStage[] = [
  { stage: 1, runSec: 60, walkSec: 120, reps: 8 },
  { stage: 2, runSec: 90, walkSec: 120, reps: 7 },
  { stage: 3, runSec: 120, walkSec: 120, reps: 6 },
  { stage: 4, runSec: 180, walkSec: 90, reps: 6 },
  { stage: 5, runSec: 300, walkSec: 120, reps: 4 },
  { stage: 6, runSec: 480, walkSec: 120, reps: 3 },
  { stage: 7, runSec: 600, walkSec: 60, reps: 3 },
  { stage: 8, runSec: 900, walkSec: 60, reps: 2 },
];

export const continuousSessionMinutes: Readonly<Record<number, number>> = {
  5: 30,
  6: 35,
  7: 40,
  8: 40,
};
