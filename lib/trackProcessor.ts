import { haversineMeters, type RoutePoint } from '@/lib/geo';
import { advanceSplits, withPartialSplit, type Split } from '@/lib/splits';

export interface RawFix {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: number;
}

export interface Sample {
  timestamp: number;
  meters: number;
}

export interface TrackState {
  distanceMeters: number;
  movingMs: number;
  last: RoutePoint | null;
  jumps: number;
  route: RoutePoint[];
  samples: Sample[];
  splits: Split[];
  splitStartMs: number;
  splitMeters: number;
}

export const MAX_ACCURACY_METERS = 25;
const MAX_SPEED_METERS_PER_SECOND = 12;
const MAX_CONSECUTIVE_JUMPS = 3;
const MS_PER_SECOND = 1000;
const METERS_PER_KM = 1000;
const SAMPLE_RETENTION_MS = 60000;
const WINDOW_MS = 30000;
const WINDOW_METERS = 150;
const MIN_WINDOW_SECONDS = 5;
const MIN_WINDOW_METERS = 10;
const STALE_MS = 15000;
const PACE_MIN_METERS = 100;
const PACE_MIN_SECONDS = 30;

export type GpsSignal = 'searching' | 'weak' | 'good';

export interface LastFix {
  timestamp: number;
  accuracy: number | null;
}

export function signalFor(lastFix: LastFix | null, nowMs: number): GpsSignal {
  if (!lastFix) return 'searching';
  const poorAccuracy = lastFix.accuracy === null || lastFix.accuracy > MAX_ACCURACY_METERS;
  if (nowMs - lastFix.timestamp > STALE_MS || poorAccuracy) return 'weak';
  return 'good';
}

export function createTrack(splitMeters: number): TrackState {
  return {
    distanceMeters: 0,
    movingMs: 0,
    last: null,
    jumps: 0,
    route: [],
    samples: [],
    splits: [],
    splitStartMs: 0,
    splitMeters,
  };
}

function trimSamples(samples: Sample[], latest: number): Sample[] {
  return samples.filter((sample) => latest - sample.timestamp <= SAMPLE_RETENTION_MS);
}

export function applyFix(state: TrackState, fix: RawFix, active: boolean): TrackState {
  if (fix.accuracy === null || fix.accuracy > MAX_ACCURACY_METERS) return state;
  const point: RoutePoint = {
    latitude: fix.latitude,
    longitude: fix.longitude,
    timestamp: fix.timestamp,
  };
  const previous = state.last;
  if (!previous) {
    if (!active) return { ...state, last: point };
    return {
      ...state,
      last: point,
      route: [...state.route, point],
      samples: [{ timestamp: point.timestamp, meters: state.distanceMeters }],
    };
  }

  const seconds = (point.timestamp - previous.timestamp) / MS_PER_SECOND;
  const meters = haversineMeters(previous, point);
  const isJump = seconds <= 0 || meters / seconds > MAX_SPEED_METERS_PER_SECOND;
  if (isJump && state.jumps < MAX_CONSECUTIVE_JUMPS) return { ...state, jumps: state.jumps + 1 };
  const base: TrackState = { ...state, jumps: 0, last: point };
  if (!active) return { ...base, samples: [] };
  if (isJump) {
    return {
      ...base,
      route: [...state.route, point],
      samples: [{ timestamp: point.timestamp, meters: state.distanceMeters }],
    };
  }

  const distanceMeters = state.distanceMeters + meters;
  const movingMs = state.movingMs + seconds * MS_PER_SECOND;
  const progress = advanceSplits(
    { splits: state.splits, splitStartMs: state.splitStartMs },
    state.distanceMeters,
    distanceMeters,
    state.movingMs,
    movingMs,
    state.splitMeters,
  );
  return {
    ...base,
    distanceMeters,
    movingMs,
    route: [...state.route, point],
    samples: [
      ...trimSamples(state.samples, point.timestamp),
      { timestamp: point.timestamp, meters: distanceMeters },
    ],
    splits: progress.splits,
    splitStartMs: progress.splitStartMs,
  };
}

export function currentPace(
  state: TrackState,
  elapsedSeconds: number,
  nowMs: number,
): number | null {
  if (state.distanceMeters < PACE_MIN_METERS && elapsedSeconds < PACE_MIN_SECONDS) return null;
  const { samples } = state;
  const latest = samples[samples.length - 1];
  if (!latest || nowMs - latest.timestamp > STALE_MS) return null;
  let start = latest;
  for (let i = samples.length - 2; i >= 0; i -= 1) {
    const candidate = samples[i];
    if (!candidate) break;
    if (
      latest.timestamp - candidate.timestamp > WINDOW_MS ||
      latest.meters - candidate.meters > WINDOW_METERS
    ) {
      break;
    }
    start = candidate;
  }
  const windowSeconds = (latest.timestamp - start.timestamp) / MS_PER_SECOND;
  const windowMeters = latest.meters - start.meters;
  if (windowSeconds < MIN_WINDOW_SECONDS || windowMeters < MIN_WINDOW_METERS) return null;
  return windowSeconds / (windowMeters / METERS_PER_KM);
}

export function trackSplits(state: TrackState): Split[] {
  return withPartialSplit(
    { splits: state.splits, splitStartMs: state.splitStartMs },
    state.distanceMeters,
    state.movingMs,
    state.splitMeters,
  );
}
