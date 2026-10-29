export function normalizeDays(days: readonly number[]): number[] {
  const valid = days.filter((day) => Number.isInteger(day) && day >= 1 && day <= 7);
  return [...new Set(valid)].sort((a, b) => a - b);
}

export function pickRunDays(trainingDays: readonly number[], cap: number): number[] {
  const days = normalizeDays(trainingDays);
  const count = days.length;
  if (count <= cap) return days;
  return Array.from({ length: cap }, (_, index) => days[Math.round((index * count) / cap)] ?? 0);
}

export function longRunDay(runDays: readonly number[]): number {
  return runDays.at(-1) ?? 0;
}

export function keyDay(runDays: readonly number[], longDay: number): number | null {
  const first = runDays.at(0);
  const middleCandidates = runDays.filter((day) => day !== first && day !== longDay);
  return middleCandidates.at(Math.floor(middleCandidates.length / 2)) ?? null;
}

export function strengthDays(runDays: readonly number[], longDay: number, key: number | null): number[] {
  const candidates = runDays.filter((day) => day !== longDay && day !== key);
  return candidates.filter((_, index) => index === 0 || index === 2);
}
