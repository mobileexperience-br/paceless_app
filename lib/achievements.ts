import { isRecord } from '@/lib/activities';
import { supabase } from '@/lib/supabase';
import type { Achievement } from '@/types/achievements';

interface CatalogRow {
  id: string;
  code: string;
  title: string;
  description: string | null;
}

function parseCatalogRow(value: unknown): CatalogRow | null {
  if (!isRecord(value)) return null;
  const { id, code, title, description } = value;
  if (typeof id !== 'string' || typeof code !== 'string' || typeof title !== 'string') {
    return null;
  }
  if (description !== null && typeof description !== 'string') return null;
  return { id, code, title, description };
}

function earnedDatesById(rows: unknown): Map<string, Date> {
  const earned = new Map<string, Date>();
  if (!Array.isArray(rows)) return earned;
  for (const row of rows) {
    if (!isRecord(row)) continue;
    const { achievement_id: achievementId, earned_at: earnedAt } = row;
    if (typeof achievementId !== 'string' || typeof earnedAt !== 'string') continue;
    earned.set(achievementId, new Date(earnedAt));
  }
  return earned;
}

function sortEarnedFirst(list: Achievement[]): Achievement[] {
  const earned = list
    .filter((item) => item.earnedAt !== null)
    .sort((a, b) => (b.earnedAt?.getTime() ?? 0) - (a.earnedAt?.getTime() ?? 0));
  const pending = list.filter((item) => item.earnedAt === null);
  return [...earned, ...pending];
}

export async function fetchAchievements(): Promise<Achievement[]> {
  if (!supabase) throw new Error('Supabase não configurado.');
  const [catalog, earned] = await Promise.all([
    supabase
      .from('achievements')
      .select('id,code,title,description,threshold')
      .order('threshold', { ascending: true })
      .order('code', { ascending: true }),
    supabase.from('user_achievements').select('achievement_id,earned_at'),
  ]);
  if (catalog.error) throw new Error(catalog.error.message);
  if (earned.error) throw new Error(earned.error.message);

  const earnedById = earnedDatesById(earned.data);
  const list = (Array.isArray(catalog.data) ? catalog.data : [])
    .map(parseCatalogRow)
    .filter((row): row is CatalogRow => row !== null)
    .map<Achievement>((row) => ({
      id: row.id,
      code: row.code,
      title: row.title,
      description: row.description,
      earnedAt: earnedById.get(row.id) ?? null,
    }));
  return sortEarnedFirst(list);
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function formatEarnedDate(date: Date): string {
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${String(date.getFullYear())}`;
}
