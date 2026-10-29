import { intervalStages, sometimesIntervalStageByWeek } from './tables.ts';
import { isRecoveryWeek } from './volume.ts';
import type { IntervalStage, Level } from './types.ts';

function stageNumber(level: Level, week: number, total: number): number | null {
  if (level === 'weekly') return null;
  if (level === 'sometimes') return sometimesIntervalStageByWeek[week] ?? null;
  let stage = 0;
  for (let current = 1; current <= week; current += 1) {
    if (!isRecoveryWeek(current, total)) stage += 1;
  }
  return stage;
}

export function intervalStageForWeek(level: Level, week: number, total: number): IntervalStage | null {
  const stageNo = stageNumber(level, week, total);
  if (stageNo === null) return null;
  return intervalStages.find((stage) => stage.stage === stageNo) ?? null;
}
