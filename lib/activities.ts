import type { RoutePoint } from '@/lib/geo';
import type { Split } from '@/lib/splits';

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
}

export interface Activity {
  id: string;
  type: ActivityType;
  startedAt: Date;
  durationSeconds: number;
  distanceMeters: number;
}

export const activitySelect = 'id,type,started_at,duration_seconds,distance_meters';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isActivityType(value: unknown): value is ActivityType {
  return value === 'run' || value === 'walk' || value === 'strength';
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
  if (typeof id !== 'string' || !isActivityType(type) || typeof startedAt !== 'string') {
    return null;
  }
  const date = new Date(startedAt);
  if (Number.isNaN(date.getTime()) || duration === null || distance === null) return null;
  return { id, type, startedAt: date, durationSeconds: duration, distanceMeters: distance };
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
