import type { AnalyticsEventMap, AnalyticsEventName, AnalyticsPayload, AnalyticsValue } from '@/types/analytics';

export const MAX_STRING_LENGTH = 64;

export const allowedProperties: { [K in AnalyticsEventName]: readonly (keyof AnalyticsEventMap[K])[] } = {
  signup_completed: ['method', 'app_version'],
  onboarding_completed: ['goal', 'level', 'days_count'],
  plan_created: ['template_version', 'duration_weeks'],
  workout_started: ['session_id', 'workout_type'],
  workout_paused: ['session_id', 'elapsed_seconds'],
  workout_completed: ['session_id', 'duration', 'distance', 'source'],
  workout_interrupted: ['session_id', 'reason_optional'],
  weekly_goal_completed: ['plan_id', 'week_index'],
  achievement_awarded: ['achievement_code', 'criteria_version'],
};

function normalize(value: unknown): AnalyticsValue | undefined {
  if (typeof value === 'string') return value.slice(0, MAX_STRING_LENGTH);
  if (typeof value === 'number') return Number.isFinite(value) ? Math.round(value) : undefined;
  if (typeof value === 'boolean' || value === null) return value;
  return undefined;
}

export function buildAnalyticsPayload<K extends AnalyticsEventName>(
  name: K,
  props: AnalyticsEventMap[K],
): AnalyticsPayload {
  const source: Record<string, unknown> = { ...props };
  const payload: AnalyticsPayload = {};
  for (const key of allowedProperties[name]) {
    const property = String(key);
    const value = normalize(source[property]);
    if (value !== undefined) payload[property] = value;
  }
  return payload;
}
