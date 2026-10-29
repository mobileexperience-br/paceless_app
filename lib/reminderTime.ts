import type { Weekday } from '@/lib/trainingDayCombos';
import type { ReminderTime } from '@/types/notifications';

const fallbackTime: ReminderTime = { hour: 7, minute: 0 };
const minuteStep = 15;
const minuteSlots = 4;
const defaultTimezone = 'America/Sao_Paulo';

function wrap(value: number, size: number): number {
  return ((value % size) + size) % size;
}

function isWeekday(value: number): value is Weekday {
  return Number.isInteger(value) && value >= 1 && value <= 7;
}

export function padTwo(value: number): string {
  return String(value).padStart(2, '0');
}

export function parseReminderTime(value: string): ReminderTime {
  const parts = value.split(':');
  const hour = Number(parts[0]);
  const minute = Number(parts[1]);
  const valid =
    Number.isInteger(hour) && hour >= 0 && hour <= 23 && Number.isInteger(minute) && minute >= 0 && minute <= 59;
  return valid ? { hour, minute } : fallbackTime;
}

export function formatReminderTime(time: ReminderTime): string {
  return `${padTwo(time.hour)}:${padTwo(time.minute)}`;
}

export function stepHour(time: ReminderTime, delta: number): ReminderTime {
  return { hour: wrap(time.hour + delta, 24), minute: time.minute };
}

export function stepMinute(time: ReminderTime, delta: number): ReminderTime {
  const slot = Math.floor(time.minute / minuteStep) % minuteSlots;
  return { hour: time.hour, minute: wrap(slot + delta, minuteSlots) * minuteStep };
}

export function isoDaysFrom(values: readonly number[]): Weekday[] {
  const unique = [...new Set(values.filter(isWeekday))];
  return unique.sort((a, b) => a - b);
}

export function deviceTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || defaultTimezone;
}
