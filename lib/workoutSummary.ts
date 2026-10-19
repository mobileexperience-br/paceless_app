import type { WorkoutType } from '@/lib/activities';
import type { DistanceUnit } from '@/types/preferences';
import type { Split } from '@/lib/splits';

export type SummaryStatus = 'saved' | 'queued';

export interface WorkoutSummary {
  type: WorkoutType;
  durationSeconds: number;
  distanceMeters: number;
  averagePaceSecondsPerKm: number | null;
  splits: Split[];
  status: SummaryStatus;
  distanceUnit: DistanceUnit;
}

let current: WorkoutSummary | null = null;

export function setWorkoutSummary(summary: WorkoutSummary | null): void {
  current = summary;
}

export function getWorkoutSummary(): WorkoutSummary | null {
  return current;
}
