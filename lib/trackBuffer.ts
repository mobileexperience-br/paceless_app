import AsyncStorage from '@react-native-async-storage/async-storage';
import { isRecord } from '@/lib/activities';
import type { RawFix } from '@/lib/trackProcessor';

export const TRACK_BUFFER_KEY = 'paceless:track-buffer';

const MAX_BUFFERED_FIXES = 5000;

type Listener = () => void;

const listeners = new Set<Listener>();
let chain: Promise<unknown> = Promise.resolve();

function enqueue<T>(job: () => Promise<T>): Promise<T> {
  const run = chain.then(job, job);
  chain = run.catch(() => undefined);
  return run;
}

function isFix(value: unknown): value is RawFix {
  if (!isRecord(value)) return false;
  return (
    typeof value['latitude'] === 'number' &&
    typeof value['longitude'] === 'number' &&
    (typeof value['accuracy'] === 'number' || value['accuracy'] === null) &&
    typeof value['timestamp'] === 'number'
  );
}

async function readFixes(): Promise<RawFix[]> {
  try {
    const stored = await AsyncStorage.getItem(TRACK_BUFFER_KEY);
    if (stored === null) return [];
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    const items: unknown[] = parsed;
    return items.filter(isFix);
  } catch {
    return [];
  }
}

export function appendFixes(fixes: readonly RawFix[]): Promise<void> {
  if (fixes.length === 0) return Promise.resolve();
  return enqueue(async () => {
    const current = await readFixes();
    const merged = [...current, ...fixes].slice(-MAX_BUFFERED_FIXES);
    try {
      await AsyncStorage.setItem(TRACK_BUFFER_KEY, JSON.stringify(merged));
    } catch {
      return;
    }
    listeners.forEach((listener) => {
      listener();
    });
  });
}

export function drainFixes(): Promise<RawFix[]> {
  return enqueue(async () => {
    const current = await readFixes();
    if (current.length > 0) {
      try {
        await AsyncStorage.removeItem(TRACK_BUFFER_KEY);
      } catch {
        return [];
      }
    }
    return current;
  });
}

export function subscribeFixes(listener: Listener): () => void {
  listeners.add(listener);
  return (): void => {
    listeners.delete(listener);
  };
}
