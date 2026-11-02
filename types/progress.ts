export interface ProgressTotals {
  sessions: number;
  distanceMeters: number;
  durationSeconds: number;
}

export interface ProgressSummary {
  weekStart: string;
  week: ProgressTotals;
  total: ProgressTotals;
}
