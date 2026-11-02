import AsyncStorage from '@react-native-async-storage/async-storage';
import { isActivityType, isPerceivedEffort, isRecord, type ActivityDraft } from '@/lib/activities';
import type { RoutePoint } from '@/lib/geo';

export const PENDING_ACTIVITIES_KEY = 'paceless:pending-activities';

const MAX_QUEUED_ROUTE_POINTS = 1500;

function withPlanLink(draft: ActivityDraft): ActivityDraft {
  const link: unknown = draft.user_plan_workout_id;
  const avgHeartRate: unknown = draft.avg_heart_rate;
  const maxHeartRate: unknown = draft.max_heart_rate;
  const effort: unknown = draft.perceived_effort;
  return {
    ...draft,
    user_plan_workout_id: typeof link === 'string' ? link : null,
    avg_heart_rate: typeof avgHeartRate === 'number' ? avgHeartRate : null,
    max_heart_rate: typeof maxHeartRate === 'number' ? maxHeartRate : null,
    perceived_effort: isPerceivedEffort(effort) ? effort : null,
  };
}

function isDraft(value: unknown): value is ActivityDraft {
  if (!isRecord(value)) return false;
  return (
    typeof value['id'] === 'string' &&
    typeof value['user_id'] === 'string' &&
    isActivityType(value['type']) &&
    typeof value['started_at'] === 'string' &&
    typeof value['ended_at'] === 'string' &&
    typeof value['duration_seconds'] === 'number' &&
    typeof value['distance_meters'] === 'number'
  );
}

export async function readQueue(): Promise<ActivityDraft[]> {
  try {
    const stored = await AsyncStorage.getItem(PENDING_ACTIVITIES_KEY);
    if (stored === null) return [];
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    const items: unknown[] = parsed;
    return items.filter(isDraft).map(withPlanLink);
  } catch {
    return [];
  }
}

export async function writeQueue(queue: readonly ActivityDraft[]): Promise<boolean> {
  try {
    if (queue.length === 0) await AsyncStorage.removeItem(PENDING_ACTIVITIES_KEY);
    else await AsyncStorage.setItem(PENDING_ACTIVITIES_KEY, JSON.stringify(queue));
    return true;
  } catch {
    return false;
  }
}

export function decimateRoute(route: RoutePoint[] | null): RoutePoint[] | null {
  if (route === null || route.length <= MAX_QUEUED_ROUTE_POINTS) return route;
  const step = (route.length - 1) / (MAX_QUEUED_ROUTE_POINTS - 1);
  const points: RoutePoint[] = [];
  for (let index = 0; index < MAX_QUEUED_ROUTE_POINTS; index += 1) {
    const point = route[Math.round(index * step)];
    if (point) points.push(point);
  }
  return points;
}
