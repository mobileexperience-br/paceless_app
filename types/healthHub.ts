import type { RoutePoint } from '@/lib/geo';

export type HealthProvider = 'healthkit' | 'health_connect';

export type DeviceProvider = HealthProvider | 'ble_hr';

export type ActivitySource = 'paceless' | HealthProvider;

export type HubAvailability = 'available' | 'unsupported' | 'needsUpdate';

export interface ConnectResult {
  granted: boolean;
  scopes: string[];
}

export interface ImportedWorkout {
  externalId: string;
  type: 'run' | 'walk';
  startedAt: Date;
  endedAt: Date;
  durationSeconds: number;
  distanceMeters: number;
  avgHeartRate: number | null;
  maxHeartRate: number | null;
  sourceName: string | null;
}

export interface ExportableWorkout {
  id: string;
  type: 'run' | 'walk';
  startedAt: Date;
  endedAt: Date;
  durationSeconds: number;
  distanceMeters: number;
  route: RoutePoint[] | null;
}
