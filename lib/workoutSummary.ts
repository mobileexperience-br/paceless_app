import type { WorkoutType } from '@/lib/activities';
import type { NewActivity } from '@/hooks/useSaveActivity';
import type { DistanceUnit } from '@/types/preferences';
import type { Split } from '@/lib/splits';
import type { HeartRateSummary } from '@/types/heartRate';

export type SummaryStatus = 'saved' | 'queued' | 'failed';

export interface WorkoutSummary {
  type: WorkoutType;
  startedAt: string;
  durationSeconds: number;
  distanceMeters: number;
  averagePaceSecondsPerKm: number | null;
  splits: Split[];
  status: SummaryStatus;
  distanceUnit: DistanceUnit;
  draft: NewActivity;
  heartRate: HeartRateSummary | null;
  discardSession: () => Promise<void>;
}

const monthNames = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
] as const;

let current: WorkoutSummary | null = null;

export function setWorkoutSummary(summary: WorkoutSummary | null): void {
  current = summary;
}

export function getWorkoutSummary(): WorkoutSummary | null {
  return current;
}

function twoDigits(value: number): string {
  return String(value).padStart(2, '0');
}

export function formatWorkoutDateTime(isoDate: string): string {
  const date = new Date(isoDate);
  const month = monthNames[date.getMonth()] ?? '';
  return `${date.getDate()} de ${month}, ${twoDigits(date.getHours())}:${twoDigits(date.getMinutes())}`;
}
