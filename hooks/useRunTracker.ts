import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import {
  Accuracy,
  requestForegroundPermissionsAsync,
  watchPositionAsync,
  type LocationObject,
  type LocationSubscription,
} from 'expo-location';
import { haversineMeters, paceSecondsPerKm, type RoutePoint } from '@/lib/geo';

export type LocationState = 'checking' | 'granted' | 'denied' | 'unavailable';

const MAX_ACCURACY_METERS = 25;
const MAX_SPEED_METERS_PER_SECOND = 12;
const MAX_CONSECUTIVE_JUMPS = 3;
const MIN_MOVING_SPEED = 0.5;
const MS_PER_SECOND = 1000;
const METERS_PER_KM = 1000;
const WATCH_INTERVAL_MS = 1000;
const WATCH_DISTANCE_METERS = 5;

interface RunTrackerOptions {
  active: boolean;
  elapsedSeconds: number;
}

interface RunTracker {
  permission: LocationState;
  distanceMeters: number;
  currentPaceSecondsPerKm: number | null;
  averagePaceSecondsPerKm: number | null;
  route: RoutePoint[];
}

export function useRunTracker({ active, elapsedSeconds }: RunTrackerOptions): RunTracker {
  const [permission, setPermission] = useState<LocationState>(
    Platform.OS === 'web' ? 'unavailable' : 'checking',
  );
  const [distanceMeters, setDistanceMeters] = useState<number>(0);
  const [speed, setSpeed] = useState<number | null>(null);
  const [route, setRoute] = useState<RoutePoint[]>([]);
  const activeRef = useRef<boolean>(active);
  const lastRef = useRef<RoutePoint | null>(null);
  const jumpsRef = useRef<number>(0);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    if (Platform.OS === 'web') return undefined;
    const holder: { cancelled: boolean; subscription: LocationSubscription | null } = {
      cancelled: false,
      subscription: null,
    };

    const isCancelled = (): boolean => holder.cancelled;

    const handle = (location: LocationObject): void => {
      const { latitude, longitude, accuracy, speed: rawSpeed } = location.coords;
      if (accuracy === null || accuracy > MAX_ACCURACY_METERS) return;
      const point: RoutePoint = { latitude, longitude, timestamp: location.timestamp };
      const previous = lastRef.current;

      if (previous) {
        const seconds = (point.timestamp - previous.timestamp) / MS_PER_SECOND;
        const meters = haversineMeters(previous, point);
        const isJump = seconds <= 0 || meters / seconds > MAX_SPEED_METERS_PER_SECOND;
        if (isJump && jumpsRef.current < MAX_CONSECUTIVE_JUMPS) {
          jumpsRef.current += 1;
          return;
        }
        const reanchored = isJump;
        jumpsRef.current = 0;
        lastRef.current = point;
        if (!activeRef.current) return;
        if (!reanchored) setDistanceMeters((prev) => prev + meters);
        setRoute((prev) => [...prev, point]);
        setSpeed(rawSpeed);
        return;
      }

      lastRef.current = point;
      if (!activeRef.current) return;
      setRoute((prev) => [...prev, point]);
      setSpeed(rawSpeed);
    };

    const begin = async (): Promise<void> => {
      try {
        const response = await requestForegroundPermissionsAsync();
        if (isCancelled()) return;
        if (!response.granted) {
          setPermission('denied');
          return;
        }
        const watcher = await watchPositionAsync(
          {
            accuracy: Accuracy.High,
            timeInterval: WATCH_INTERVAL_MS,
            distanceInterval: WATCH_DISTANCE_METERS,
          },
          handle,
        );
        if (isCancelled()) {
          watcher.remove();
          return;
        }
        holder.subscription = watcher;
        setPermission('granted');
      } catch {
        if (!isCancelled()) setPermission('unavailable');
      }
    };

    void begin();
    return (): void => {
      holder.cancelled = true;
      holder.subscription?.remove();
    };
  }, []);

  const hasSignal = permission === 'granted' && distanceMeters > 0;
  const currentPace =
    active && hasSignal && speed !== null && speed > MIN_MOVING_SPEED ? METERS_PER_KM / speed : null;

  return {
    permission,
    distanceMeters,
    currentPaceSecondsPerKm: currentPace,
    averagePaceSecondsPerKm: hasSignal ? paceSecondsPerKm(distanceMeters, elapsedSeconds) : null,
    route,
  };
}
