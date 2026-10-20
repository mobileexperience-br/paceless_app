import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { paceSecondsPerKm, type RoutePoint } from '@/lib/geo';
import type { Split } from '@/lib/splits';
import { drainFixes, subscribeFixes } from '@/lib/trackBuffer';
import { applyFix, currentPace, createTrack, trackSplits, type TrackState } from '@/lib/trackProcessor';
import {
  openTrackingSession,
  startTracking,
  stopTracking,
  type LocationState,
} from '@/lib/trackingSession';

export type { LocationState } from '@/lib/trackingSession';

const CLOCK_INTERVAL_MS = 1000;

interface RunTrackerOptions {
  active: boolean;
  elapsedSeconds: number;
  splitMeters: number;
}

export interface TrackSnapshot {
  distanceMeters: number;
  route: RoutePoint[];
  splits: Split[];
}

export interface RunTracker {
  permission: LocationState;
  distanceMeters: number;
  currentPaceSecondsPerKm: number | null;
  averagePaceSecondsPerKm: number | null;
  route: RoutePoint[];
  splits: Split[];
  stop: () => Promise<TrackSnapshot>;
}

export function useRunTracker({ active, elapsedSeconds, splitMeters }: RunTrackerOptions): RunTracker {
  const [permission, setPermission] = useState<LocationState>(
    Platform.OS === 'web' ? 'unavailable' : 'checking',
  );
  const [track, setTrack] = useState<TrackState>(() => createTrack(splitMeters));
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const activeRef = useRef<boolean>(active);
  const rebaseRef = useRef<boolean>(false);
  const trackRef = useRef<TrackState>(track);
  const mountedRef = useRef<boolean>(true);
  const sessionRef = useRef<number>(0);

  useEffect(() => {
    activeRef.current = active;
    if (active) rebaseRef.current = true;
  }, [active]);

  useEffect(() => {
    if (!active) return undefined;
    const id = setInterval((): void => {
      setNowMs(Date.now());
    }, CLOCK_INTERVAL_MS);
    return (): void => {
      clearInterval(id);
    };
  }, [active]);

  const consume = useCallback(async (): Promise<void> => {
    const fixes = await drainFixes();
    if (!mountedRef.current || fixes.length === 0) return;
    const rebase = rebaseRef.current;
    rebaseRef.current = false;
    const prev = trackRef.current;
    const start: TrackState = rebase ? { ...prev, last: null, jumps: 0 } : prev;
    const next = fixes.reduce((state, fix) => applyFix(state, fix, activeRef.current), start);
    trackRef.current = next;
    setTrack(next);
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') return undefined;
    mountedRef.current = true;
    const session = openTrackingSession();
    sessionRef.current = session;

    const unsubscribe = subscribeFixes((): void => {
      void consume();
    });

    const begin = async (): Promise<void> => {
      const result = await startTracking(session);
      if (!mountedRef.current) {
        await stopTracking(session);
        return;
      }
      setPermission(result);
    };

    void begin();
    return (): void => {
      mountedRef.current = false;
      unsubscribe();
      void stopTracking(session);
    };
  }, [consume]);

  const stop = useCallback(async (): Promise<TrackSnapshot> => {
    await stopTracking(sessionRef.current);
    await consume();
    const latest = trackRef.current;
    return {
      distanceMeters: latest.distanceMeters,
      route: latest.route,
      splits: trackSplits(latest),
    };
  }, [consume]);

  const hasSignal = permission === 'granted' && track.distanceMeters > 0;
  return {
    permission,
    distanceMeters: track.distanceMeters,
    currentPaceSecondsPerKm: active && hasSignal ? currentPace(track, elapsedSeconds, nowMs) : null,
    averagePaceSecondsPerKm: hasSignal ? paceSecondsPerKm(track.distanceMeters, elapsedSeconds) : null,
    route: track.route,
    splits: trackSplits(track),
    stop,
  };
}
