import type { Stat } from '@/components';
import type { RunTracker } from '@/hooks/useRunTracker';
import { distanceLabel, formatDistanceStat, formatPaceForUnit, paceLabel } from '@/lib/units';
import type { DistanceUnit } from '@/types/preferences';

export function buildWorkoutStats(tracker: RunTracker, unit: DistanceUnit): Stat[] {
  const tracking = tracker.permission === 'granted';
  return [
    {
      value: formatDistanceStat(tracking ? tracker.distanceMeters : null, unit),
      label: `Distância (${distanceLabel(unit)})`,
    },
    {
      value: formatPaceForUnit(tracker.currentPaceSecondsPerKm, unit),
      label: `Ritmo (${paceLabel(unit)})`,
    },
    {
      value: formatPaceForUnit(tracker.averagePaceSecondsPerKm, unit),
      label: `Ritmo médio (${paceLabel(unit)})`,
    },
  ];
}
