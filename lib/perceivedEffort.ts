import AsyncStorage from '@react-native-async-storage/async-storage';
import { isPerceivedEffort, isRecord, type PerceivedEffort } from '@/lib/activities';
import { supabase } from '@/lib/supabase';

export const PENDING_EFFORTS_KEY = 'paceless:pending-efforts';

const UPDATE_TIMEOUT_MS = 10000;

export const perceivedEffortOptions: readonly PerceivedEffort[] = [
  'very_easy',
  'easy',
  'moderate',
  'hard',
  'very_hard',
];

export const perceivedEffortLabels: Record<PerceivedEffort, string> = {
  very_easy: 'Muito leve',
  easy: 'Leve',
  moderate: 'Moderado',
  hard: 'Difícil',
  very_hard: 'Muito difícil',
};

export type EffortSaveResult = 'saved' | 'queued' | 'failed';

export async function updateEffort(activityId: string, effort: PerceivedEffort): Promise<boolean> {
  if (!supabase) return false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<boolean>((resolve) => {
    timer = setTimeout(() => {
      resolve(false);
    }, UPDATE_TIMEOUT_MS);
  });
  const request = (async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .update({ perceived_effort: effort })
        .eq('id', activityId)
        .select('id');
      return error === null && data.length === 1;
    } catch {
      return false;
    }
  })();
  const updated = await Promise.race([request, timeout]);
  clearTimeout(timer);
  return updated;
}

async function readPendingEfforts(): Promise<Record<string, PerceivedEffort> | null> {
  try {
    const stored = await AsyncStorage.getItem(PENDING_EFFORTS_KEY);
    if (stored === null) return {};
    const parsed: unknown = JSON.parse(stored);
    if (!isRecord(parsed)) return {};
    const efforts: Record<string, PerceivedEffort> = {};
    for (const [activityId, value] of Object.entries(parsed)) {
      if (isPerceivedEffort(value)) efforts[activityId] = value;
    }
    return efforts;
  } catch {
    return null;
  }
}

async function writePendingEfforts(efforts: Record<string, PerceivedEffort>): Promise<boolean> {
  try {
    if (Object.keys(efforts).length === 0) await AsyncStorage.removeItem(PENDING_EFFORTS_KEY);
    else await AsyncStorage.setItem(PENDING_EFFORTS_KEY, JSON.stringify(efforts));
    return true;
  } catch {
    return false;
  }
}

export async function storePendingEffort(activityId: string, effort: PerceivedEffort): Promise<boolean> {
  const pending = await readPendingEfforts();
  if (pending === null) return false;
  return writePendingEfforts({ ...pending, [activityId]: effort });
}

let flushing = false;

export async function flushPendingEfforts(): Promise<void> {
  if (flushing || !supabase) return;
  flushing = true;
  try {
    const pending = await readPendingEfforts();
    if (pending === null) return;
    const sentIds: string[] = [];
    for (const [activityId, effort] of Object.entries(pending)) {
      if (await updateEffort(activityId, effort)) sentIds.push(activityId);
    }
    const latest = await readPendingEfforts();
    if (latest === null) return;
    const remaining = Object.fromEntries(
      Object.entries(latest).filter(([activityId]) => !sentIds.includes(activityId)),
    );
    await writePendingEfforts(remaining);
  } finally {
    flushing = false;
  }
}
