import type { BluetoothPreparation } from '@/types/heartRate';

export type { BluetoothPreparation, StrapStatus } from '@/types/heartRate';

export function bleSupported(): boolean {
  return false;
}

export function checkBlePermissions(): Promise<boolean> {
  return Promise.resolve(false);
}

export function prepareBluetooth(): Promise<BluetoothPreparation> {
  return Promise.resolve('unsupported');
}

export function openBluetoothSettings(): Promise<void> {
  return Promise.resolve();
}

export function scanHeartRateDevices(): () => undefined {
  return () => undefined;
}

export function startHeartRateSession(): () => undefined {
  return () => undefined;
}

export function previewDevice(): () => undefined {
  return () => undefined;
}
