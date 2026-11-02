import { intervalStages } from './tables.ts';
import type { EligibleLevel, IntervalStage } from './types.ts';

export function stageNumberForWeek(level: EligibleLevel, week: number): number | null {
  if (level === 'total_beginner') return week;
  const stage = week + 4;
  return stage <= 8 ? stage : null;
}

export function intervalStageForWeek(level: EligibleLevel, week: number): IntervalStage | null {
  const stageNo = stageNumberForWeek(level, week);
  if (stageNo === null) return null;
  return intervalStages.find((stage) => stage.stage === stageNo) ?? null;
}
