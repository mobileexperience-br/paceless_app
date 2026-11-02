import { AppState } from 'react-native';
import type { ActivityDraft, PerceivedEffort } from '@/lib/activities';
import { flushPendingSamples } from '@/lib/activitySamples';
import { flushPendingEfforts } from '@/lib/perceivedEffort';
import { decimateRoute, readQueue, writeQueue } from '@/lib/activityQueueStorage';
import { supabase } from '@/lib/supabase';

export { PENDING_ACTIVITIES_KEY, readQueue } from '@/lib/activityQueueStorage';

const INSERT_TIMEOUT_MS = 10000;
const ROW_SECURITY_VIOLATION = '42501';

type ActivityListener = () => void;

const listeners = new Set<ActivityListener>();
let appStateSubscription: ReturnType<typeof AppState.addEventListener> | null = null;

function startFlushOnForeground(): void {
  appStateSubscription = AppState.addEventListener('change', (state) => {
    if (state === 'active') void flushPendingActivities();
  });
}

function stopFlushOnForeground(): void {
  appStateSubscription?.remove();
  appStateSubscription = null;
}

export function subscribeActivityChanges(listener: ActivityListener): () => void {
  listeners.add(listener);
  if (appStateSubscription === null) startFlushOnForeground();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) stopFlushOnForeground();
  };
}

export function notifyActivitiesChanged(): void {
  listeners.forEach((listener) => {
    listener();
  });
}

let flushing = false;
let queueLock: Promise<unknown> = Promise.resolve();

function withQueueLock<T>(job: () => Promise<T>): Promise<T> {
  const run = queueLock.then(job, job);
  queueLock = run.catch(() => undefined);
  return run;
}

export async function currentUserId(): Promise<string | null> {
  if (!supabase) return null;
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.user.id ?? null;
  } catch {
    return null;
  }
}

export async function insertActivity(draft: ActivityDraft): Promise<boolean> {
  if (!supabase) return false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<boolean>((resolve) => {
    timer = setTimeout(() => {
      resolve(false);
    }, INSERT_TIMEOUT_MS);
  });
  const request = (async (): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('activities')
        .upsert(draft, { onConflict: 'id', ignoreDuplicates: true });
      if (error === null) return true;
      if (error.code !== ROW_SECURITY_VIOLATION || draft.user_plan_workout_id === null) return false;
      const retry = await supabase
        .from('activities')
        .upsert({ ...draft, user_plan_workout_id: null }, { onConflict: 'id', ignoreDuplicates: true });
      return retry.error === null;
    } catch {
      return false;
    }
  })();
  const inserted = await Promise.race([request, timeout]);
  clearTimeout(timer);
  return inserted;
}

export async function enqueueActivity(draft: ActivityDraft): Promise<boolean> {
  const stored = await withQueueLock(async () => {
    const others = (await readQueue()).filter((item) => item.id !== draft.id);
    const compact: ActivityDraft = { ...draft, route: decimateRoute(draft.route) };
    if (await writeQueue([...others, compact])) return true;
    return writeQueue([...others, { ...compact, route: null }]);
  });
  if (stored) notifyActivitiesChanged();
  return stored;
}

export async function patchQueuedEffort(id: string, effort: PerceivedEffort): Promise<boolean> {
  return withQueueLock(async () => {
    const queue = await readQueue();
    if (!queue.some((item) => item.id === id)) return false;
    const patched = queue.map((item) => (item.id === id ? { ...item, perceived_effort: effort } : item));
    return writeQueue(patched);
  });
}

export async function flushPendingActivities(): Promise<number> {
  if (flushing || !supabase) return 0;
  flushing = true;
  try {
    const userId = await currentUserId();
    if (userId === null) return 0;
    const queue = await readQueue();
    const sentIds = new Set<string>();
    for (const draft of queue) {
      if (draft.user_id !== userId) continue;
      if (await insertActivity(draft)) sentIds.add(draft.id);
    }
    const pendingIds = new Set(queue.filter((draft) => !sentIds.has(draft.id)).map((draft) => draft.id));
    void flushPendingSamples(userId, pendingIds);
    void flushPendingEfforts();
    if (sentIds.size === 0) return 0;
    await withQueueLock(async () => {
      const latest = await readQueue();
      await writeQueue(latest.filter((draft) => !sentIds.has(draft.id)));
    });
    notifyActivitiesChanged();
    return sentIds.size;
  } finally {
    flushing = false;
  }
}
