import type { Goal, IntervalStage, Level } from './types.ts';

export const planWeeks: Record<Goal, Record<Level, number>> = {
  start_running: { never_ran: 8, sometimes: 6, weekly: 6 },
  run_5k: { never_ran: 10, sometimes: 8, weekly: 6 },
  run_10k: { never_ran: 12, sometimes: 10, weekly: 8 },
  fitness: { never_ran: 8, sometimes: 8, weekly: 8 },
};

export const startWeeklyMinutes: Record<Level, number> = {
  never_ran: 60,
  sometimes: 75,
  weekly: 100,
};

export const maxRunSessions: Record<Level, number> = {
  never_ran: 3,
  sometimes: 4,
  weekly: 5,
};

export const maxWeeklyMinutes: Record<Level, number> = {
  never_ran: 150,
  sometimes: 200,
  weekly: 260,
};

export const intervalStages: readonly IntervalStage[] = [
  { stage: 1, runSec: 60, walkSec: 120, reps: 8 },
  { stage: 2, runSec: 90, walkSec: 120, reps: 7 },
  { stage: 3, runSec: 120, walkSec: 120, reps: 6 },
  { stage: 4, runSec: 180, walkSec: 90, reps: 6 },
  { stage: 5, runSec: 300, walkSec: 120, reps: 4 },
  { stage: 6, runSec: 480, walkSec: 120, reps: 3 },
  { stage: 7, runSec: 600, walkSec: 60, reps: 3 },
];

export const sometimesIntervalStageByWeek: Readonly<Record<number, number>> = {
  1: 5,
  2: 6,
};
