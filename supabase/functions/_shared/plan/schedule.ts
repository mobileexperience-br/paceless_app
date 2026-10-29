export const dayMs = 86_400_000;

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export function parseDate(value: string): number {
  return Date.parse(`${value}T00:00:00Z`);
}

export function formatDate(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export function isValidDate(value: string): boolean {
  if (!datePattern.test(value)) return false;
  const ms = parseDate(value);
  return !Number.isNaN(ms) && formatDate(ms) === value;
}

export function anchorMonday(startDate: string, firstRunDay: number): string {
  const start = parseDate(startDate);
  const isoWeekday = ((new Date(start).getUTCDay() + 6) % 7) + 1;
  const monday = start - (isoWeekday - 1) * dayMs;
  const firstRun = monday + (firstRunDay - 1) * dayMs;
  return formatDate(firstRun < start ? monday + 7 * dayMs : monday);
}

export function dateFor(anchor: string, week: number, day: number): string {
  return formatDate(parseDate(anchor) + ((week - 1) * 7 + (day - 1)) * dayMs);
}
