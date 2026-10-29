import AsyncStorage from '@react-native-async-storage/async-storage';
import { isRecord, workoutTypes, type WorkoutType } from '@/lib/activities';
import type { RoutePoint } from '@/lib/geo';
import type { Split } from '@/lib/splits';
import { peekLastFixTimestamp } from '@/lib/trackBuffer';
import type { Sample, TrackState } from '@/lib/trackProcessor';
import { discardTracking, isTrackingTaskRunning } from '@/lib/trackingSession';

export const ACTIVE_SESSION_KEY = 'paceless:active-session';
export const ACTIVE_ROUTE_KEY = 'paceless:active-session-route';

export const SESSION_MAX_IDLE_MS = 12 * 60 * 60 * 1000;

const MAX_PERSISTED_ROUTE_POINTS = 20000;

export interface StopwatchSnapshot {
  accumulatedMs: number;
  startedAt: number | null;
}

export interface ActiveSession {
  startedAt: number;
  type: WorkoutType;
  userPlanWorkoutId: string | null;
  updatedAt: number;
  stopwatch: StopwatchSnapshot;
  track: TrackState;
}

export interface ResumableSession {
  session: ActiveSession;
  stopwatch: StopwatchSnapshot;
}

let chain: Promise<unknown> = Promise.resolve();

function enqueue<T>(job: () => Promise<T>): Promise<T> {
  const run = chain.then(job, job);
  chain = run.catch(() => undefined);
  return run;
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isPoint(value: unknown): value is RoutePoint {
  return (
    isRecord(value) &&
    isNumber(value['latitude']) &&
    isNumber(value['longitude']) &&
    isNumber(value['timestamp'])
  );
}

function isSample(value: unknown): value is Sample {
  return isRecord(value) && isNumber(value['timestamp']) && isNumber(value['meters']);
}

function isSplit(value: unknown): value is Split {
  return (
    isRecord(value) &&
    isNumber(value['index']) &&
    isNumber(value['meters']) &&
    isNumber(value['seconds'])
  );
}

function listOf<T>(value: unknown, guard: (item: unknown) => item is T): T[] | null {
  if (!Array.isArray(value)) return null;
  const items: unknown[] = value;
  return items.every(guard) ? items : null;
}

function parseJson(stored: string | null): unknown {
  if (stored === null) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

function parseTrack(value: unknown, route: RoutePoint[]): TrackState | null {
  if (!isRecord(value)) return null;
  const { distanceMeters, movingMs, jumps, splitStartMs, splitMeters, last } = value;
  const samples = listOf(value['samples'], isSample);
  const splits = listOf(value['splits'], isSplit);
  if (
    !isNumber(distanceMeters) ||
    !isNumber(movingMs) ||
    !isNumber(jumps) ||
    !isNumber(splitStartMs) ||
    !isNumber(splitMeters) ||
    !samples ||
    !splits ||
    (last !== null && !isPoint(last))
  ) {
    return null;
  }
  return { distanceMeters, movingMs, last, jumps, route, samples, splits, splitStartMs, splitMeters };
}

function parseStopwatch(value: unknown): StopwatchSnapshot | null {
  if (!isRecord(value)) return null;
  const { accumulatedMs, startedAt } = value;
  if (!isNumber(accumulatedMs) || (startedAt !== null && !isNumber(startedAt))) return null;
  return { accumulatedMs, startedAt };
}

function parseSession(stored: unknown, route: unknown): ActiveSession | null {
  if (!isRecord(stored)) return null;
  const { startedAt, type, updatedAt } = stored;
  const planLink = stored['userPlanWorkoutId'];
  const points = listOf(route, isPoint);
  const stopwatch = parseStopwatch(stored['stopwatch']);
  const track = points ? parseTrack(stored['track'], points) : null;
  const workoutType = workoutTypes.find((candidate) => candidate === type);
  if (!isNumber(startedAt) || !isNumber(updatedAt) || !workoutType || !stopwatch || !track) {
    return null;
  }
  const userPlanWorkoutId = typeof planLink === 'string' ? planLink : null;
  return { startedAt, type: workoutType, userPlanWorkoutId, updatedAt, stopwatch, track };
}

function thinRoute(route: RoutePoint[]): RoutePoint[] {
  if (route.length <= MAX_PERSISTED_ROUTE_POINTS) return route;
  return route.filter((_, index) => index % 2 === 0);
}

export function saveActiveSession(session: ActiveSession): Promise<void> {
  const { route, ...track } = session.track;
  const body = JSON.stringify({ ...session, track });
  const routeBody = JSON.stringify(thinRoute(route));
  return enqueue(async () => {
    try {
      await AsyncStorage.multiSet([
        [ACTIVE_SESSION_KEY, body],
        [ACTIVE_ROUTE_KEY, routeBody],
      ]);
    } catch {
      return;
    }
  });
}

export function clearActiveSession(): Promise<void> {
  return enqueue(async () => {
    try {
      await AsyncStorage.multiRemove([ACTIVE_SESSION_KEY, ACTIVE_ROUTE_KEY]);
    } catch {
      return;
    }
  });
}

function readActiveSession(): Promise<ActiveSession | null> {
  return enqueue(async () => {
    try {
      const entries = await AsyncStorage.multiGet([ACTIVE_SESSION_KEY, ACTIVE_ROUTE_KEY]);
      const stored = entries.find(([key]) => key === ACTIVE_SESSION_KEY)?.[1] ?? null;
      const route = entries.find(([key]) => key === ACTIVE_ROUTE_KEY)?.[1] ?? null;
      return parseSession(parseJson(stored), parseJson(route));
    } catch {
      return null;
    }
  });
}

export async function discardActiveSession(): Promise<void> {
  await clearActiveSession();
  await discardTracking();
}

function restoreStopwatch(session: ActiveSession, taskRunning: boolean): StopwatchSnapshot {
  const { accumulatedMs, startedAt } = session.stopwatch;
  if (startedAt === null) return { accumulatedMs, startedAt: null };
  if (taskRunning) return { accumulatedMs, startedAt };
  return {
    accumulatedMs: accumulatedMs + Math.max(0, session.updatedAt - startedAt),
    startedAt: null,
  };
}

export async function loadResumableSession(): Promise<ResumableSession | null> {
  const session = await readActiveSession();
  if (!session) return null;
  const lastFixAt = await peekLastFixTimestamp();
  const lastActivityAt = Math.max(session.updatedAt, lastFixAt ?? 0);
  if (Date.now() - lastActivityAt > SESSION_MAX_IDLE_MS) {
    await discardActiveSession();
    return null;
  }
  const taskRunning = await isTrackingTaskRunning();
  return { session, stopwatch: restoreStopwatch(session, taskRunning) };
}
