import AsyncStorage from '@react-native-async-storage/async-storage';
import { isActivityType, isRecord, type ActivityDraft } from '@/lib/activities';
import { supabase } from '@/lib/supabase';

export const PENDING_ACTIVITIES_KEY = 'paceless:pending-activities';

let flushing = false;
let queueLock: Promise<unknown> = Promise.resolve();

function withQueueLock<T>(job: () => Promise<T>): Promise<T> {
  const run = queueLock.then(job, job);
  queueLock = run.catch(() => undefined);
  return run;
}

function isDraft(value: unknown): value is ActivityDraft {
  if (!isRecord(value)) return false;
  return (
    typeof value['id'] === 'string' &&
    typeof value['user_id'] === 'string' &&
    isActivityType(value['type']) &&
    typeof value['started_at'] === 'string' &&
    typeof value['ended_at'] === 'string' &&
    typeof value['duration_seconds'] === 'number' &&
    typeof value['distance_meters'] === 'number'
  );
}

async function readQueue(): Promise<ActivityDraft[]> {
  try {
    const stored = await AsyncStorage.getItem(PENDING_ACTIVITIES_KEY);
    if (stored === null) return [];
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    const items: unknown[] = parsed;
    return items.filter(isDraft);
  } catch {
    return [];
  }
}

async function writeQueue(queue: readonly ActivityDraft[]): Promise<void> {
  try {
    if (queue.length === 0) await AsyncStorage.removeItem(PENDING_ACTIVITIES_KEY);
    else await AsyncStorage.setItem(PENDING_ACTIVITIES_KEY, JSON.stringify(queue));
  } catch {
    return;
  }
}

export async function insertActivity(draft: ActivityDraft): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('activities')
      .upsert(draft, { onConflict: 'id', ignoreDuplicates: true });
    return error === null;
  } catch {
    return false;
  }
}

export function enqueueActivity(draft: ActivityDraft): Promise<void> {
  return withQueueLock(async () => {
    const queue = await readQueue();
    await writeQueue([...queue, draft]);
  });
}

export async function flushPendingActivities(): Promise<number> {
  if (flushing || !supabase) return 0;
  flushing = true;
  try {
    const queue = await readQueue();
    const sentIds = new Set<string>();
    for (const draft of queue) {
      if (await insertActivity(draft)) sentIds.add(draft.id);
    }
    if (sentIds.size === 0) return 0;
    await withQueueLock(async () => {
      const latest = await readQueue();
      await writeQueue(latest.filter((draft) => !sentIds.has(draft.id)));
    });
    return sentIds.size;
  } finally {
    flushing = false;
  }
}
