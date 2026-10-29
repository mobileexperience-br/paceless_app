import type { RoutePoint } from '@/lib/geo';
import type { Split } from '@/lib/splits';
import type { ActivitySource } from '@/types/healthHub';

export type ActivityType = 'run' | 'walk' | 'strength';

export type WorkoutType = 'run' | 'walk';

export const workoutTypes: readonly WorkoutType[] = ['run', 'walk'];

export const activityLabels: Record<ActivityType, string> = {
  run: 'Corrida',
  walk: 'Caminhada',
  strength: 'Musculação',
};

export interface ActivityDraft {
  id: string;
  user_id: string;
  type: ActivityType;
  started_at: string;
  ended_at: string;
  duration_seconds: number;
  distance_meters: number;
  avg_pace_seconds_per_km: number | null;
  route: RoutePoint[] | null;
  splits: Split[] | null;
  user_plan_workout_id: string | null;
  avg_heart_rate: number | null;
  max_heart_rate: number | null;
}

export interface Activity {
  id: string;
  type: ActivityType;
  startedAt: Date;
  durationSeconds: number;
  distanceMeters: number;
  source: ActivitySource;
  sourceName: string | null;
  pending?: boolean;
}

export const activitySelect = 'id,type,started_at,duration_seconds,distance_meters,source,source_name';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isActivityType(value: unknown): value is ActivityType {
  return value === 'run' || value === 'walk' || value === 'strength';
}

export function isActivitySource(value: unknown): value is ActivitySource {
  return value === 'paceless' || value === 'healthkit' || value === 'health_connect';
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function parseActivity(row: unknown): Activity | null {
  if (!isRecord(row)) return null;
  const { id, type, started_at: startedAt } = row;
  const duration = toNumber(row['duration_seconds']);
  const distance = toNumber(row['distance_meters']);
  const source: unknown = row['source'] ?? 'paceless';
  const sourceName: unknown = row['source_name'];
  if (typeof id !== 'string' || !isActivityType(type) || typeof startedAt !== 'string') {
    return null;
  }
  if (!isActivitySource(source)) return null;
  const date = new Date(startedAt);
  if (Number.isNaN(date.getTime()) || duration === null || distance === null) return null;
  return {
    id,
    type,
    startedAt: date,
    durationSeconds: duration,
    distanceMeters: distance,
    source,
    sourceName: typeof sourceName === 'string' ? sourceName : null,
  };
}

export function draftToActivity(draft: ActivityDraft): Activity {
  return {
    id: draft.id,
    type: draft.type,
    startedAt: new Date(draft.started_at),
    durationSeconds: draft.duration_seconds,
    distanceMeters: draft.distance_meters,
    source: 'paceless',
    sourceName: null,
    pending: true,
  };
}

export function parseActivities(rows: unknown): Activity[] {
  if (!Array.isArray(rows)) return [];
  const items: unknown[] = rows;
  const result: Activity[] = [];
  for (const row of items) {
    const activity = parseActivity(row);
    if (activity) result.push(activity);
  }
  return result;
}
