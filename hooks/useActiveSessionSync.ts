import { useCallback, useEffect, useRef, type RefObject } from 'react';
import { clearActiveSession, saveActiveSession, type ActiveSession } from '@/lib/activeSession';

const WRITE_INTERVAL_MS = 10000;

interface ActiveSessionSyncOptions extends Omit<ActiveSession, 'updatedAt' | 'startedAt'> {
  startedAtRef: RefObject<Date>;
}

interface ActiveSessionSync {
  clear: () => Promise<void>;
}

export function useActiveSessionSync(snapshot: ActiveSessionSyncOptions): ActiveSessionSync {
  const latestRef = useRef(snapshot);
  const lastWriteRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closedRef = useRef<boolean>(false);
  const lastShapeRef = useRef<string>('');

  const write = useCallback((): void => {
    timerRef.current = null;
    if (closedRef.current) return;
    lastWriteRef.current = Date.now();
    const { startedAtRef, ...rest } = latestRef.current;
    void saveActiveSession({
      ...rest,
      startedAt: startedAtRef.current.getTime(),
      updatedAt: lastWriteRef.current,
    });
  }, []);

  const { stopwatch, type, track } = snapshot;
  const shape = `${type}:${String(stopwatch.startedAt !== null)}`;

  useEffect(() => {
    latestRef.current = snapshot;
  });

  useEffect(() => {
    if (closedRef.current) return;
    const shapeChanged = shape !== lastShapeRef.current;
    lastShapeRef.current = shape;
    if (timerRef.current !== null && !shapeChanged) return;
    if (timerRef.current !== null) clearTimeout(timerRef.current);
    const wait = shapeChanged ? 0 : Math.max(0, lastWriteRef.current + WRITE_INTERVAL_MS - Date.now());
    timerRef.current = setTimeout(write, wait);
  }, [shape, track, write]);

  useEffect(
    () => (): void => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
      timerRef.current = null;
    },
    [],
  );

  const clear = useCallback(async (): Promise<void> => {
    closedRef.current = true;
    if (timerRef.current !== null) clearTimeout(timerRef.current);
    timerRef.current = null;
    await clearActiveSession();
  }, []);

  return { clear };
}
