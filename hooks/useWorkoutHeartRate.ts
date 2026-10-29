import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { AppState } from 'react-native';
import { clearActiveSamples, loadActiveSamples, saveActiveSamples } from '@/lib/activeHeartRate';
import { isUsableReading } from '@/lib/heartRate/heartRateFilter.ts';
import type { HeartRateReading } from '@/lib/heartRate/parseHeartRate.ts';
import { addSample, summarize } from '@/lib/heartRate/heartRateStats.ts';
import { zoneFor } from '@/lib/heartRate/heartRateZones.ts';
import { checkBlePermissions, startHeartRateSession } from '@/lib/platform/heartRateBle';
import { cachedStrap, DEFAULT_STRAP_NAME, fetchSavedStrap, saveStrap } from '@/lib/strapDevice';
import type {
  HeartRateSample,
  HeartRateSummary,
  HeartRateZone,
  SavedStrap,
  StrapStatus,
} from '@/types/heartRate';

export type WorkoutStrapStatus = StrapStatus | 'none';

export interface WorkoutHeartRate {
  status: WorkoutStrapStatus;
  bpm: number | null;
  zone: HeartRateZone | null;
  finish: () => HeartRateSummary | null;
  discard: () => void;
}

interface WorkoutHeartRateOptions {
  running: boolean;
  startedAtRef: RefObject<Date>;
  maxHeartRate: number | null;
  sessionKey: string;
}

const MS_PER_SECOND = 1000;
const STALE_READING_MS = 5000;
const STALE_CHECK_MS = 1000;
const PERSIST_INTERVAL_MS = 30000;

export function useWorkoutHeartRate({
  running,
  startedAtRef,
  maxHeartRate,
  sessionKey,
}: WorkoutHeartRateOptions): WorkoutHeartRate {
  const [status, setStatus] = useState<WorkoutStrapStatus>('none');
  const [bpm, setBpm] = useState<number | null>(null);
  const samplesRef = useRef<HeartRateSample[]>([]);
  const runningRef = useRef<boolean>(running);
  const lastValidAtRef = useRef<number>(0);
  const stopRef = useRef<(() => void) | null>(null);
  const closedRef = useRef<boolean>(false);

  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (Date.now() - lastValidAtRef.current > STALE_READING_MS) setBpm(null);
    }, STALE_CHECK_MS);
    return (): void => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const persist = (): void => {
      if (samplesRef.current.length === 0) return;
      void saveActiveSamples(sessionKey, samplesRef.current);
    };
    const timer = setInterval(persist, PERSIST_INTERVAL_MS);
    const subscription = AppState.addEventListener('change', (next) => {
      if (next === 'background') persist();
    });
    return (): void => {
      clearInterval(timer);
      subscription.remove();
    };
  }, [sessionKey]);

  useEffect(() => {
    let active = true;
    let attachedId: string | null = null;
    closedRef.current = false;

    const record = (reading: HeartRateReading, receivedAtMs: number): void => {
      if (!isUsableReading(reading)) return;
      lastValidAtRef.current = receivedAtMs;
      setBpm(reading.bpm);
      if (!runningRef.current) return;
      const elapsedMs = receivedAtMs - startedAtRef.current.getTime();
      const tOffsetS = Math.max(0, Math.floor(elapsedMs / MS_PER_SECOND));
      samplesRef.current = addSample(samplesRef.current, { tOffsetS, bpm: reading.bpm });
    };

    const detach = (): void => {
      stopRef.current?.();
      stopRef.current = null;
      attachedId = null;
      setStatus('none');
    };

    const attach = (strap: SavedStrap): void => {
      attachedId = strap.id;
      void checkBlePermissions()
        .then((granted) => {
          if (!active || closedRef.current || attachedId !== strap.id) return;
          if (!granted) {
            setStatus('unauthorized');
            return;
          }
          stopRef.current = startHeartRateSession(strap, {
            onReading: record,
            onStatus: setStatus,
            onDeviceIdChanged: (id, name) => {
              void saveStrap({ id, name: name ?? DEFAULT_STRAP_NAME }).catch(() => undefined);
            },
          });
          setStatus('connecting');
        })
        .catch(() => undefined);
    };

    const load = async (): Promise<void> => {
      samplesRef.current = await loadActiveSamples(sessionKey);
      const cached = await cachedStrap();
      if (cached) attach(cached);
      const fresh = await fetchSavedStrap().then(
        (strap) => ({ ok: true as const, strap }),
        () => ({ ok: false as const }),
      );
      if (!active || !fresh.ok) return;
      if (fresh.strap === null) {
        if (attachedId !== null) detach();
        return;
      }
      if (fresh.strap.id === attachedId) return;
      if (attachedId !== null) detach();
      attach(fresh.strap);
    };
    void load();

    return (): void => {
      active = false;
      closedRef.current = true;
      stopRef.current?.();
      stopRef.current = null;
    };
  }, [sessionKey, startedAtRef]);

  const finish = useCallback((): HeartRateSummary | null => {
    closedRef.current = true;
    stopRef.current?.();
    stopRef.current = null;
    const samples = samplesRef.current;
    samplesRef.current = [];
    void clearActiveSamples();
    return summarize(samples, maxHeartRate);
  }, [maxHeartRate]);

  const discard = useCallback((): void => {
    closedRef.current = true;
    stopRef.current?.();
    stopRef.current = null;
    samplesRef.current = [];
    void clearActiveSamples();
  }, []);

  const zone = bpm !== null && maxHeartRate !== null ? zoneFor(bpm, maxHeartRate) : null;

  return { status, bpm, zone, finish, discard };
}
