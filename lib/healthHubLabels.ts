import type { ActivitySource, HealthProvider } from '@/types/healthHub';

export const providerLabels: Record<HealthProvider, string> = {
  healthkit: 'Apple Saúde',
  health_connect: 'Health Connect',
};

export const brandByPackage: Record<string, string> = {
  'com.garmin.android.apps.connectmobile': 'Garmin',
  'com.sec.android.app.shealth': 'Samsung Health',
  'fi.polar.polarflow': 'Polar',
  'com.coros.coros': 'COROS',
};

export function sourceLabel(source: ActivitySource, sourceName: string | null): string | null {
  if (source === 'paceless') return null;
  return sourceName ?? providerLabels[source];
}
