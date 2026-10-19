import type { DistanceUnit } from '@/types/preferences';

export interface Split {
  index: number;
  meters: number;
  seconds: number;
}

const METERS_PER_KM = 1000;
const METERS_PER_MILE = 1609.344;

const MIN_PARTIAL_METERS = 100;
const MS_PER_SECOND = 1000;

export function splitMetersFor(unit: DistanceUnit): number {
  return unit === 'mi' ? METERS_PER_MILE : METERS_PER_KM;
}

interface SplitProgress {
  splits: Split[];
  splitStartMs: number;
}

export function advanceSplits(
  current: SplitProgress,
  previousMeters: number,
  nextMeters: number,
  previousMs: number,
  nextMs: number,
  splitMeters: number,
): SplitProgress {
  let splits = current.splits;
  let start = current.splitStartMs;
  let boundary = (splits.length + 1) * splitMeters;
  while (nextMeters >= boundary && nextMeters > previousMeters) {
    const fraction = (boundary - previousMeters) / (nextMeters - previousMeters);
    const boundaryMs = previousMs + fraction * (nextMs - previousMs);
    splits = [
      ...splits,
      {
        index: splits.length + 1,
        meters: splitMeters,
        seconds: Math.round((boundaryMs - start) / MS_PER_SECOND),
      },
    ];
    start = boundaryMs;
    boundary += splitMeters;
  }
  return { splits, splitStartMs: start };
}

export function withPartialSplit(
  progress: SplitProgress,
  distanceMeters: number,
  movingMs: number,
  splitMeters: number,
): Split[] {
  const partialMeters = distanceMeters - progress.splits.length * splitMeters;
  if (partialMeters < MIN_PARTIAL_METERS) return progress.splits;
  return [
    ...progress.splits,
    {
      index: progress.splits.length + 1,
      meters: Math.round(partialMeters),
      seconds: Math.round((movingMs - progress.splitStartMs) / MS_PER_SECOND),
    },
  ];
}
