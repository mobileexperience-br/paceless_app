import type { Activity, ActivityType } from '@/lib/activities';
import { formatDistance } from '@/lib/units';
import type { DistanceUnit } from '@/types/preferences';

export const activityFilters = ['Todas', 'Corrida', 'Musculação'] as const;

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const DAYS_PER_WEEK = 7;
const MONDAY = 1;
const MS_PER_DAY = 86400000;

const filterTypes: Record<string, ActivityType | null> = {
  Todas: null,
  Corrida: 'run',
  Musculação: 'strength',
};

export interface WeeklySummary {
  workouts: number;
  distanceMeters: number;
  durationSeconds: number;
}

export function filterActivities(
  activities: readonly Activity[],
  filter: string,
): Activity[] {
  const type = filterTypes[filter] ?? null;
  return type === null ? [...activities] : activities.filter((a) => a.type === type);
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeek(now: Date): Date {
  const day = startOfDay(now);
  const offset = (day.getDay() - MONDAY + DAYS_PER_WEEK) % DAYS_PER_WEEK;
  day.setDate(day.getDate() - offset);
  return day;
}

export function summarizeWeek(activities: readonly Activity[], now: Date): WeeklySummary {
  const start = startOfWeek(now).getTime();
  return activities
    .filter((a) => a.startedAt.getTime() >= start)
    .reduce<WeeklySummary>(
      (acc, a) => ({
        workouts: acc.workouts + 1,
        distanceMeters: acc.distanceMeters + a.distanceMeters,
        durationSeconds: acc.durationSeconds + a.durationSeconds,
      }),
      { workouts: 0, distanceMeters: 0, durationSeconds: 0 },
    );
}

export function formatDuration(totalSeconds: number): string {
  const totalMinutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
  const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR);
  const minutes = totalMinutes % MINUTES_PER_HOUR;
  return hours > 0 ? `${String(hours)}h ${String(minutes)}m` : `${String(minutes)} min`;
}

export function formatWeekDistance(distanceMeters: number, unit: DistanceUnit): string {
  return formatDistance(distanceMeters, unit, 1);
}

export function dayLabel(date: Date, now: Date): string {
  const days = Math.round(
    (startOfDay(now).getTime() - startOfDay(date).getTime()) / MS_PER_DAY,
  );
  if (days === 0) return 'Hoje';
  if (days === 1) return 'Ontem';
  if (days > 1 && days < DAYS_PER_WEEK) return WEEKDAYS[date.getDay()] ?? '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
}
