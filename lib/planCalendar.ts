const dayMs = 86_400_000;

const weekdayNames = [
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
  'Domingo',
] as const;

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

function dayAndMonth(date: string): { day: string; month: string } {
  const [, monthPart = '01', dayPart = '01'] = date.split('-');
  return {
    day: String(Number(dayPart)),
    month: monthNames[Number(monthPart) - 1] ?? '',
  };
}

export function addDays(date: string, days: number): string {
  const ms = Date.parse(`${date}T00:00:00Z`) + days * dayMs;
  return new Date(ms).toISOString().slice(0, 10);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / dayMs);
}

export function mondayOf(date: string): string {
  const isoWeekday = (new Date(`${date}T00:00:00Z`).getUTCDay() + 6) % 7;
  return addDays(date, -isoWeekday);
}

export function weekdayName(date: string): string {
  const isoWeekday = (new Date(`${date}T00:00:00Z`).getUTCDay() + 6) % 7;
  return weekdayNames[isoWeekday] ?? '';
}

export function formatDayCaption(date: string): string {
  const { day, month } = dayAndMonth(date);
  return `${day} ${month}`;
}

export function formatLongDate(date: string): string {
  const { day, month } = dayAndMonth(date);
  return `${weekdayName(date)}, ${day} de ${month}`;
}
