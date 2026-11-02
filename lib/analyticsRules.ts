import type { PlanWeekStatus } from '@/types/planWeek';

export const MAX_SENT_KEYS = 200;
export const FRESH_SIGNUP_WINDOW_MS = 60_000;
export const ACHIEVEMENT_CRITERIA_VERSION = 1;

export function isWeeklyGoalCompleted(status: PlanWeekStatus | null): boolean {
  return status !== null && status.eligible > 0 && status.completed >= status.eligible;
}

export function weeklyGoalKey(status: PlanWeekStatus): string {
  return `weekly_goal_completed:${status.userPlanId}:${status.currentWeek}:${status.currentAttempt}`;
}

export function achievementKey(code: string): string {
  return `achievement_awarded:${code}`;
}

export function rememberKey(sent: readonly string[], key: string): { sent: string[]; isNew: boolean } {
  if (sent.includes(key)) return { sent: [...sent], isNew: false };
  return { sent: [...sent, key].slice(-MAX_SENT_KEYS), isNew: true };
}

export function isFreshSignup(createdAt: string | undefined, lastSignInAt: string | undefined): boolean {
  if (createdAt === undefined || lastSignInAt === undefined) return false;
  const created = Date.parse(createdAt);
  const signedIn = Date.parse(lastSignInAt);
  if (Number.isNaN(created) || Number.isNaN(signedIn)) return false;
  return Math.abs(signedIn - created) <= FRESH_SIGNUP_WINDOW_MS;
}

export function templateVersionLabel(version: unknown): string {
  if (typeof version === 'number' && Number.isInteger(version) && version > 0) return `v${version}`;
  return 'unknown';
}

export function analyticsSessionId(planSessionId: string | null, activityId: string): string {
  return planSessionId ?? activityId;
}
