import type { HeartRateReading } from './parseHeartRate.ts';

const MIN_VALID_BPM = 30;
const MAX_VALID_BPM = 230;

export function isValidBpm(bpm: number): boolean {
  return bpm >= MIN_VALID_BPM && bpm <= MAX_VALID_BPM;
}

export function isUsableReading(reading: HeartRateReading): boolean {
  return reading.contact !== 'lost' && isValidBpm(reading.bpm);
}
