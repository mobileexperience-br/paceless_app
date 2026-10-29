import { randomUUID } from 'expo-crypto';
import { isRecord } from '@/lib/activities';
import { filterNewWorkouts, type Span } from '@/lib/healthDedupe';
import { notifyActivitiesChanged } from '@/lib/activityQueue';
import { paceSecondsPerKm } from '@/lib/geo';
import { supabase } from '@/lib/supabase';
import type { HealthProvider, ImportedWorkout } from '@/types/healthHub';

export const IMPORT_WINDOW_DAYS = 30;

const MS_PER_DAY = 86400000;
const MIN_HEART_RATE = 20;
const MAX_HEART_RATE = 250;
const UPSERT_CONFLICT = 'user_id,source,external_id';

export interface ImportedActivityRow {
  id: string;
  user_id: string;
  type: ImportedWorkout['type'];
  started_at: string;
  ended_at: string;
  duration_seconds: number;
  distance_meters: number;
  avg_pace_seconds_per_km: number | null;
  route: null;
  splits: null;
  user_plan_workout_id: null;
  source: HealthProvider;
  external_id: string;
  source_name: string | null;
  avg_heart_rate: number | null;
  max_heart_rate: number | null;
}

export function importWindowStart(now: Date): Date {
  return new Date(now.getTime() - IMPORT_WINDOW_DAYS * MS_PER_DAY);
}

function heartRateOrNull(value: number | null): number | null {
  if (value === null || !Number.isFinite(value)) return null;
  const rounded = Math.round(value);
  return rounded >= MIN_HEART_RATE && rounded <= MAX_HEART_RATE ? rounded : null;
}

export function toActivityRow(
  workout: ImportedWorkout,
  provider: HealthProvider,
  userId: string,
): ImportedActivityRow {
  const duration = Math.max(0, Math.round(workout.durationSeconds));
  const distance = Math.max(0, Math.round(workout.distanceMeters));
  return {
    id: randomUUID(),
    user_id: userId,
    type: workout.type,
    started_at: workout.startedAt.toISOString(),
    ended_at: workout.endedAt.toISOString(),
    duration_seconds: duration,
    distance_meters: distance,
    avg_pace_seconds_per_km: distance > 0 ? paceSecondsPerKm(distance, duration) : null,
    route: null,
    splits: null,
    user_plan_workout_id: null,
    source: provider,
    external_id: workout.externalId,
    source_name: workout.sourceName,
    avg_heart_rate: heartRateOrNull(workout.avgHeartRate),
    max_heart_rate: heartRateOrNull(workout.maxHeartRate),
  };
}

function parseOwnSpans(rows: unknown): Span[] {
  if (!Array.isArray(rows)) return [];
  const items: unknown[] = rows;
  const spans: Span[] = [];
  for (const row of items) {
    if (!isRecord(row)) continue;
    const start = row['started_at'];
    const end = row['ended_at'];
    if (typeof start !== 'string' || typeof end !== 'string') continue;
    spans.push({ start: new Date(start), end: new Date(end) });
  }
  return spans;
}

export async function importWorkouts(
  provider: HealthProvider,
  userId: string,
  workouts: ImportedWorkout[],
): Promise<number> {
  if (!supabase) throw new Error('Serviço não configurado.');
  const windowStart = importWindowStart(new Date()).toISOString();
  const own = await supabase
    .from('activities')
    .select('started_at,ended_at')
    .eq('source', 'paceless')
    .gte('started_at', windowStart);
  if (own.error) throw new Error(own.error.message);
  const fresh = filterNewWorkouts(workouts, parseOwnSpans(own.data));
  if (fresh.length === 0) {
    notifyActivitiesChanged();
    return 0;
  }
  const rows = fresh.map((workout) => toActivityRow(workout, provider, userId));
  const inserted = await supabase
    .from('activities')
    .upsert(rows, { onConflict: UPSERT_CONFLICT, ignoreDuplicates: true })
    .select('id');
  if (inserted.error) throw new Error(inserted.error.message);
  notifyActivitiesChanged();
  return Array.isArray(inserted.data) ? inserted.data.length : 0;
}
