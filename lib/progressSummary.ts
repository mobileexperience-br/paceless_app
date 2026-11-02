import { isRecord } from '@/lib/activities';
import { supabase } from '@/lib/supabase';
import type { ProgressSummary, ProgressTotals } from '@/types/progress';

function finiteNumber(value: unknown): number | null {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  if (typeof value === 'string' && value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseTotals(value: unknown): ProgressTotals | null {
  if (!isRecord(value)) return null;
  const sessions = finiteNumber(value['sessions']);
  const distanceMeters = finiteNumber(value['distance_meters']);
  const durationSeconds = finiteNumber(value['duration_seconds']);
  if (sessions === null || distanceMeters === null || durationSeconds === null) return null;
  return { sessions, distanceMeters, durationSeconds };
}

export function parseProgressSummary(value: unknown): ProgressSummary | null {
  if (!isRecord(value)) return null;
  const weekStart = value['week_start'];
  if (typeof weekStart !== 'string') return null;
  const week = parseTotals(value['week']);
  const total = parseTotals(value['total']);
  if (week === null || total === null) return null;
  return { weekStart, week, total };
}

export async function fetchProgressSummary(today: string): Promise<ProgressSummary | null> {
  if (!supabase) throw new Error('Supabase não configurado.');
  const response = await supabase.rpc('get_progress_summary', { p_today: today });
  if (response.error) throw new Error(response.error.message);
  const payload: unknown = response.data;
  return parseProgressSummary(payload);
}
