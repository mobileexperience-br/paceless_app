import { zoneFor, type HeartRateZone } from './heartRateZones.ts';

export interface HeartRateSample {
  tOffsetS: number;
  bpm: number;
}

export interface HeartRateSummary {
  avg: number;
  max: number;
  samples: HeartRateSample[];
  secondsInZone: Record<HeartRateZone, number> | null;
}

export function addSample(samples: HeartRateSample[], sample: HeartRateSample): HeartRateSample[] {
  const last = samples.at(-1);
  if (last?.tOffsetS === sample.tOffsetS) {
    samples[samples.length - 1] = sample;
  } else {
    samples.push(sample);
  }
  return samples;
}

function emptyZoneSeconds(): Record<HeartRateZone, number> {
  return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
}

function secondsPerZone(samples: HeartRateSample[], maxHeartRate: number): Record<HeartRateZone, number> {
  const seconds = emptyZoneSeconds();
  for (const sample of samples) {
    seconds[zoneFor(sample.bpm, maxHeartRate)] += 1;
  }
  return seconds;
}

export function summarize(samples: HeartRateSample[], maxHeartRate: number | null): HeartRateSummary | null {
  if (samples.length === 0) return null;
  let total = 0;
  let max = 0;
  for (const sample of samples) {
    total += sample.bpm;
    max = Math.max(max, sample.bpm);
  }
  return {
    avg: Math.round(total / samples.length),
    max,
    samples,
    secondsInZone: maxHeartRate === null ? null : secondsPerZone(samples, maxHeartRate),
  };
}
