import type { ImportedWorkout } from '@/types/healthHub';

export interface Span {
  start: Date;
  end: Date;
}

const MIN_OVERLAP_RATIO = 0.5;

function durationMs(span: Span): number {
  return span.end.getTime() - span.start.getTime();
}

export function overlaps(a: Span, b: Span): boolean {
  const intersection =
    Math.min(a.end.getTime(), b.end.getTime()) - Math.max(a.start.getTime(), b.start.getTime());
  if (intersection <= 0) return false;
  const shorter = Math.min(durationMs(a), durationMs(b));
  return intersection >= shorter * MIN_OVERLAP_RATIO;
}

export function filterNewWorkouts(imported: ImportedWorkout[], own: Span[]): ImportedWorkout[] {
  return imported.filter((workout) => {
    const span: Span = { start: workout.startedAt, end: workout.endedAt };
    return !own.some((activity) => overlaps(span, activity));
  });
}
