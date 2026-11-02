export type WeekBlockReason = 'not_closed' | 'below_minimum' | 'locked';

export interface PlanWeekStatus {
  userPlanId: string;
  currentWeek: number;
  currentAttempt: number;
  weekStartedOn: string;
  weekEndsOn: string;
  eligible: number;
  completed: number;
  minimum: number;
  adherence: number | null;
  closed: boolean;
  canAdvance: boolean;
  canRepeat: boolean;
  isLastWeek: boolean;
  blockReason: WeekBlockReason | null;
}
