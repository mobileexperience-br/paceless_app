const EARTH_RADIUS_METERS = 6371000;
const METERS_PER_KM = 1000;
const SECONDS_PER_MINUTE = 60;
const EMPTY_VALUE = '—';

export interface RoutePoint {
  latitude: number;
  longitude: number;
  timestamp: number;
}

interface Coordinate {
  latitude: number;
  longitude: number;
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function haversineMeters(a: Coordinate, b: Coordinate): number {
  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(a.latitude)) * Math.cos(toRadians(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function paceSecondsPerKm(distanceMeters: number, elapsedSeconds: number): number | null {
  if (distanceMeters <= 0 || elapsedSeconds <= 0) return null;
  return elapsedSeconds / (distanceMeters / METERS_PER_KM);
}

export function formatPace(secondsPerKm: number | null): string {
  if (secondsPerKm === null || !Number.isFinite(secondsPerKm) || secondsPerKm <= 0) {
    return EMPTY_VALUE;
  }
  const total = Math.round(secondsPerKm);
  const minutes = Math.floor(total / SECONDS_PER_MINUTE);
  const seconds = total % SECONDS_PER_MINUTE;
  return `${String(minutes)}:${String(seconds).padStart(2, '0')}`;
}

export function formatKm(distanceMeters: number, decimals: number): string {
  return (distanceMeters / METERS_PER_KM).toFixed(decimals).replace('.', ',');
}

export function formatDistanceStat(distanceMeters: number | null): string {
  return distanceMeters === null ? EMPTY_VALUE : formatKm(distanceMeters, 2);
}
