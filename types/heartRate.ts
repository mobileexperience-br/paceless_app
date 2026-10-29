export type StrapStatus =
  | 'idle'
  | 'bluetoothOff'
  | 'unauthorized'
  | 'connecting'
  | 'connected'
  | 'reconnecting';

export type BluetoothPreparation = 'ready' | 'bluetoothOff' | 'unauthorized' | 'blocked' | 'unsupported';

export interface SavedStrap {
  id: string;
  name: string;
}

export interface ScannedStrap {
  id: string;
  name: string;
}

export type { HeartRateReading, SensorContact } from '@/lib/heartRate/parseHeartRate.ts';
export type { HeartRateZone } from '@/lib/heartRate/heartRateZones.ts';
export type { HeartRateSample, HeartRateSummary } from '@/lib/heartRate/heartRateStats.ts';
