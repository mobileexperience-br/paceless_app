import AsyncStorage from '@react-native-async-storage/async-storage';
import { isRecord } from '@/lib/activities';
import { supabase } from '@/lib/supabase';
import type { HeartRateSample } from '@/types/heartRate';

export const PENDING_SAMPLES_KEY = 'paceless:pending-hr-samples';

const CHUNK_SIZE = 1000;

interface PendingSamples {
  userId: string;
  samples: HeartRateSample[];
}

type PendingMap = Record<string, PendingSamples>;

let pendingLock: Promise<unknown> = Promise.resolve();

function withPendingLock<T>(job: () => Promise<T>): Promise<T> {
  const run = pendingLock.then(job, job);
  pendingLock = run.catch(() => undefined);
  return run;
}

function parseSamples(items: unknown[]): HeartRateSample[] {
  return items
    .filter(isRecord)
    .map((item) => ({ tOffsetS: item['tOffsetS'], bpm: item['bpm'] }))
    .filter((item): item is HeartRateSample => typeof item.tOffsetS === 'number' && typeof item.bpm === 'number');
}

function parsePending(raw: unknown): PendingMap {
  if (!isRecord(raw)) return {};
  const result: PendingMap = {};
  for (const [activityId, entry] of Object.entries(raw)) {
    if (!isRecord(entry) || typeof entry['userId'] !== 'string' || !Array.isArray(entry['samples'])) continue;
    const items: unknown[] = entry['samples'];
    result[activityId] = { userId: entry['userId'], samples: parseSamples(items) };
  }
  return result;
}

async function readPending(): Promise<PendingMap> {
  try {
    const stored = await AsyncStorage.getItem(PENDING_SAMPLES_KEY);
    if (stored === null) return {};
    const parsed: unknown = JSON.parse(stored);
    return parsePending(parsed);
  } catch {
    return {};
  }
}

async function writePending(pending: PendingMap): Promise<void> {
  try {
    if (Object.keys(pending).length === 0) await AsyncStorage.removeItem(PENDING_SAMPLES_KEY);
    else await AsyncStorage.setItem(PENDING_SAMPLES_KEY, JSON.stringify(pending));
  } catch {
    return;
  }
}

export async function insertSamples(
  activityId: string,
  userId: string,
  samples: HeartRateSample[],
): Promise<boolean> {
  if (!supabase) return false;
  const rows = samples.map((sample) => ({
    activity_id: activityId,
    user_id: userId,
    t_offset_s: sample.tOffsetS,
    hr_bpm: sample.bpm,
  }));
  try {
    for (let start = 0; start < rows.length; start += CHUNK_SIZE) {
      const { error } = await supabase
        .from('activity_samples')
        .upsert(rows.slice(start, start + CHUNK_SIZE), {
          onConflict: 'activity_id,t_offset_s',
          ignoreDuplicates: true,
        });
      if (error) return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function enqueueSamples(activityId: string, userId: string, samples: HeartRateSample[]): Promise<void> {
  await withPendingLock(async () => {
    const pending = await readPending();
    pending[activityId] = { userId, samples };
    await writePending(pending);
  });
}

export async function persistSamples(activityId: string, userId: string, samples: HeartRateSample[]): Promise<void> {
  if (samples.length === 0) return;
  if (await insertSamples(activityId, userId, samples)) return;
  await enqueueSamples(activityId, userId, samples);
}

export async function flushPendingSamples(userId: string, queuedIds: ReadonlySet<string>): Promise<void> {
  const pending = await readPending();
  const sent = new Set<string>();
  for (const [activityId, entry] of Object.entries(pending)) {
    if (entry.userId !== userId || queuedIds.has(activityId)) continue;
    if (await insertSamples(activityId, entry.userId, entry.samples)) sent.add(activityId);
  }
  if (sent.size === 0) return;
  await withPendingLock(async () => {
    const latest = await readPending();
    const remaining = Object.fromEntries(Object.entries(latest).filter(([id]) => !sent.has(id)));
    await writePending(remaining);
  });
}
