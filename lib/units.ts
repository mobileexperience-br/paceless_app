import { formatPace } from '@/lib/geo';
import type { DistanceUnit } from '@/types/preferences';

const METERS_PER_KM = 1000;
const KM_PER_MILE = 1.609344;
const EMPTY_VALUE = '—';

export function metersToUnit(distanceMeters: number, unit: DistanceUnit): number {
  const km = distanceMeters / METERS_PER_KM;
  return unit === 'mi' ? km / KM_PER_MILE : km;
}

export function formatDistance(
  distanceMeters: number,
  unit: DistanceUnit,
  decimals: number,
): string {
  return metersToUnit(distanceMeters, unit).toFixed(decimals).replace('.', ',');
}

export function formatDistanceStat(distanceMeters: number | null, unit: DistanceUnit): string {
  return distanceMeters === null ? EMPTY_VALUE : formatDistance(distanceMeters, unit, 2);
}

export function distanceLabel(unit: DistanceUnit): string {
  return unit === 'mi' ? 'mi' : 'km';
}

export function paceLabel(unit: DistanceUnit): string {
  return unit === 'mi' ? 'min/mi' : 'min/km';
}

export function formatPaceForUnit(secondsPerKm: number | null, unit: DistanceUnit): string {
  if (secondsPerKm === null) return EMPTY_VALUE;
  return formatPace(unit === 'mi' ? secondsPerKm * KM_PER_MILE : secondsPerKm);
}
