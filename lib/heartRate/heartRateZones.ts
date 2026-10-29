export type HeartRateZone = 1 | 2 | 3 | 4 | 5;

export const zoneBounds = [0.5, 0.6, 0.7, 0.8, 0.9] as const;

export const zoneLabels: Record<HeartRateZone, string> = {
  1: 'Z1 Muito leve',
  2: 'Z2 Leve',
  3: 'Z3 Moderado',
  4: 'Z4 Forte',
  5: 'Z5 Máximo',
};

export function zoneFor(bpm: number, maxHeartRate: number): HeartRateZone {
  const ratio = bpm / maxHeartRate;
  if (ratio >= zoneBounds[4]) return 5;
  if (ratio >= zoneBounds[3]) return 4;
  if (ratio >= zoneBounds[2]) return 3;
  if (ratio >= zoneBounds[1]) return 2;
  return 1;
}
