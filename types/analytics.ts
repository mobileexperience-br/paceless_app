export type SignupMethod = 'email' | 'google' | 'apple';
export type WorkoutInterruptReason = 'discarded' | 'too_short';

export interface AnalyticsEventMap {
  signup_completed: { method: SignupMethod; app_version: string };
  onboarding_completed: { goal: string; level: string; days_count: number };
  plan_created: { template_version: string; duration_weeks: number };
  workout_started: { session_id: string; workout_type: string };
  workout_paused: { session_id: string; elapsed_seconds: number };
  workout_completed: { session_id: string; duration: number; distance: number; source: 'paceless' };
  workout_interrupted: { session_id: string; reason_optional: WorkoutInterruptReason | null };
  weekly_goal_completed: { plan_id: string; week_index: number };
  achievement_awarded: { achievement_code: string; criteria_version: number };
}

export type AnalyticsEventName = keyof AnalyticsEventMap;

export type AnalyticsValue = string | number | boolean | null;

export type AnalyticsPayload = Record<string, AnalyticsValue>;
