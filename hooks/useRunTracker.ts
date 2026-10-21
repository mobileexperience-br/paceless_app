import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { paceSecondsPerKm, type RoutePoint } from '@/lib/geo';
import type { Split } from '@/lib/splits';
import { drainFixes, subscribeFixes } from '@/lib/trackBuffer';
import {
  applyFix,
  createTrack,
  currentPace,
  signalFor,
  trackSplits,
  type GpsSignal,
  type LastFix,
  type TrackState,
} from '@/lib/trackProcessor';
import {
  isForegroundPermissionGranted,
  openTrackingSession,
  startTracking,
  stopTracking,
  type LocationState,
  type TrackingMode,
} from '@/lib/trackingSession';

export type { LocationState, TrackingMode } from '@/lib/trackingSession';
export type { GpsSignal } from '@/lib/trackProcessor';

const CLOCK_INTERVAL_MS = 1000;
const SIGNAL_INTERVAL_MS = 2000;

interface RunTrackerOptions {
  active: boolean;
  elapsedSeconds: number;
  splitMeters: number;
  restored?: TrackState | null;
}

export interface TrackSnapshot {
  distanceMeters: number;
  route: RoutePoint[];
  splits: Split[];
}

export interface RunTracker {
  permission: LocationState;
  canAskAgain: boolean;
  signal: GpsSignal;
  mode: TrackingMode;
  retryTracking: () => void;
  track: TrackState;
  distanceMeters: number;
  currentPaceSecondsPerKm: number | null;
  averagePaceSecondsPerKm: number | null;
  route: RoutePoint[];
  splits: Split[];
  stop: () => Promise<TrackSnapshot>;
}

export function useRunTracker({
  active,
  elapsedSeconds,
  splitMeters,
  restored = null,
}: RunTrackerOptions): RunTracker {
  const [permission, setPermission] = useState<LocationState>(
    Platform.OS === 'web' ? 'unavailable' : 'checking',
  );
  const [canAskAgain, setCanAskAgain] = useState<boolean>(true);
  const [mode, setMode] = useState<TrackingMode>('background');
  const [lastFix, setLastFix] = useState<LastFix | null>(null);
  const [signalNowMs, setSignalNowMs] = useState<number>(() => Date.now());
  const [track, setTrack] = useState<TrackState>(
    () => restored ?? createTrack(splitMeters),
  );
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const activeRef = useRef<boolean>(active);
  const rebaseRef = useRef<boolean>(restored !== null);
  const trackRef = useRef<TrackState>(track);
  const mountedRef = useRef<boolean>(true);
  const sessionRef = useRef<number>(0);
  const resumeRef = useRef<boolean>(restored !== null);
  const permissionRef = useRef<LocationState>(permission);
  const retryRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    permissionRef.current = permission;
  }, [permission]);

  useEffect(() => {
    if (permission !== 'granted') return undefined;
    const id = setInterval((): void => {
      setSignalNowMs(Date.now());
    }, SIGNAL_INTERVAL_MS);
    return (): void => {
      clearInterval(id);
    };
  }, [permission]);

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
    const newest = fixes[fixes.length - 1];
    if (newest) setLastFix({ timestamp: newest.timestamp, accuracy: newest.accuracy });
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
      const result = await startTracking(session, resumeRef.current);
      if (!mountedRef.current) {
        await stopTracking(session);
        return;
      }
      setPermission(result.state);
      setCanAskAgain(result.canAskAgain);
      setMode(result.mode);
      if (resumeRef.current) void consume();
    };

    retryRef.current = (): void => {
      void begin();
    };
    void begin();
    const appStateSubscription = AppState.addEventListener('change', (next): void => {
      if (next !== 'active' || permissionRef.current !== 'denied') return;
      void isForegroundPermissionGranted().then((granted) => {
        if (granted && mountedRef.current) void begin();
      });
    });
    return (): void => {
      mountedRef.current = false;
      unsubscribe();
      appStateSubscription.remove();
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

  const retryTracking = useCallback((): void => {
    retryRef.current();
  }, []);

  const hasSignal = permission === 'granted' && track.distanceMeters > 0;
  return {
    permission,
    canAskAgain,
    signal: signalFor(lastFix, signalNowMs),
    mode,
    retryTracking,
    track,
    distanceMeters: track.distanceMeters,
    currentPaceSecondsPerKm: active && hasSignal ? currentPace(track, elapsedSeconds, nowMs) : null,
    averagePaceSecondsPerKm: hasSignal ? paceSecondsPerKm(track.distanceMeters, elapsedSeconds) : null,
    route: track.route,
    splits: trackSplits(track),
    stop,
  };
}
