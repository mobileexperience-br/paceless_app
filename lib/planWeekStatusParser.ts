import { isRecord } from '@/lib/activities';
import type { PlanWeekStatus, WeekBlockReason } from '@/types/planWeek';

const blockReasons: readonly WeekBlockReason[] = ['not_closed', 'below_minimum', 'locked'];

function numberOf(record: Record<string, unknown>, key: string): number | null {
  const value = record[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function textOf(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];
  return typeof value === 'string' ? value : null;
}

function booleanOf(record: Record<string, unknown>, key: string): boolean | null {
  const value = record[key];
  return typeof value === 'boolean' ? value : null;
}

function blockReasonOf(value: unknown): WeekBlockReason | null {
  return blockReasons.find((reason) => reason === value) ?? null;
}

export function parsePlanWeekStatus(value: unknown): PlanWeekStatus | null {
  if (!isRecord(value)) return null;
  const userPlanId = textOf(value, 'user_plan_id');
  const currentWeek = numberOf(value, 'current_week');
  const currentAttempt = numberOf(value, 'current_attempt');
  const weekStartedOn = textOf(value, 'week_started_on');
  const weekEndsOn = textOf(value, 'week_ends_on');
  const eligible = numberOf(value, 'eligible');
  const completed = numberOf(value, 'completed');
  const minimum = numberOf(value, 'minimum');
  const closed = booleanOf(value, 'closed');
  const canAdvance = booleanOf(value, 'can_advance');
  const canRepeat = booleanOf(value, 'can_repeat');
  const isLastWeek = booleanOf(value, 'is_last_week');
  if (
    userPlanId === null || currentWeek === null || currentAttempt === null ||
    weekStartedOn === null || weekEndsOn === null || eligible === null ||
    completed === null || minimum === null || closed === null ||
    canAdvance === null || canRepeat === null || isLastWeek === null
  ) {
    return null;
  }
  return {
    userPlanId,
    currentWeek,
    currentAttempt,
    weekStartedOn,
    weekEndsOn,
    eligible,
    completed,
    minimum,
    adherence: numberOf(value, 'adherence'),
    closed,
    canAdvance,
    canRepeat,
    isLastWeek,
    blockReason: blockReasonOf(value['block_reason']),
  };
}

