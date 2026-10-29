import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import { isActivityType, isRecord, type ActivityDraft } from '@/lib/activities';
import type { RoutePoint } from '@/lib/geo';
import { supabase } from '@/lib/supabase';

export const PENDING_ACTIVITIES_KEY = 'paceless:pending-activities';

const INSERT_TIMEOUT_MS = 10000;
const ROW_SECURITY_VIOLATION = '42501';
const MAX_QUEUED_ROUTE_POINTS = 1500;

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

function withPlanLink(draft: ActivityDraft): ActivityDraft {
  const link: unknown = draft.user_plan_workout_id;
  return { ...draft, user_plan_workout_id: typeof link === 'string' ? link : null };
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

export async function readQueue(): Promise<ActivityDraft[]> {
  try {
    const stored = await AsyncStorage.getItem(PENDING_ACTIVITIES_KEY);
    if (stored === null) return [];
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    const items: unknown[] = parsed;
    return items.filter(isDraft).map(withPlanLink);
  } catch {
    return [];
  }
}

async function writeQueue(queue: readonly ActivityDraft[]): Promise<boolean> {
  try {
    if (queue.length === 0) await AsyncStorage.removeItem(PENDING_ACTIVITIES_KEY);
    else await AsyncStorage.setItem(PENDING_ACTIVITIES_KEY, JSON.stringify(queue));
    return true;
  } catch {
    return false;
  }
}

function decimateRoute(route: RoutePoint[] | null): RoutePoint[] | null {
  if (route === null || route.length <= MAX_QUEUED_ROUTE_POINTS) return route;
  const step = (route.length - 1) / (MAX_QUEUED_ROUTE_POINTS - 1);
  const points: RoutePoint[] = [];
  for (let index = 0; index < MAX_QUEUED_ROUTE_POINTS; index += 1) {
    const point = route[Math.round(index * step)];
    if (point) points.push(point);
  }
  return points;
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
    const queue = await readQueue();
    const compact: ActivityDraft = { ...draft, route: decimateRoute(draft.route) };
    if (await writeQueue([...queue, compact])) return true;
    return writeQueue([...queue, { ...compact, route: null }]);
  });
  if (stored) notifyActivitiesChanged();
  return stored;
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
