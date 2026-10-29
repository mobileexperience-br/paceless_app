import { Linking, Platform } from 'react-native';
import { isUsableReading } from '@/lib/heartRate/heartRateFilter.ts';
import type { BluetoothPreparation, StrapStatus } from '@/types/heartRate';
import { requestBlePermissions } from './ble/blePermissions';
import { waitForBluetoothReady } from './ble/prepareBluetooth';
import { startHeartRateSession } from './ble/hrSession';

export { checkBlePermissions } from './ble/blePermissions';
export { scanHeartRateDevices } from './ble/scan';
export type { ScanFailure } from './ble/scan';
export type { ScannedStrap } from '@/types/heartRate';
export { startHeartRateSession };

const BLUETOOTH_SETTINGS_INTENT = 'android.settings.BLUETOOTH_SETTINGS';

export type { BluetoothPreparation, StrapStatus } from '@/types/heartRate';

export function bleSupported(): boolean {
  return true;
}

export async function prepareBluetooth(): Promise<BluetoothPreparation> {
  const permission = await requestBlePermissions();
  if (permission === 'blocked') return 'blocked';
  if (permission === 'denied') return 'unauthorized';
  return waitForBluetoothReady();
}

export async function openBluetoothSettings(): Promise<void> {
  if (Platform.OS !== 'android') {
    await Linking.openSettings();
    return;
  }
  try {
    await Linking.sendIntent(BLUETOOTH_SETTINGS_INTENT);
  } catch {
    await Linking.openSettings();
  }
}

export function previewDevice(id: string, onBpm: (bpm: number | null) => void): () => void {
  return startHeartRateSession(
    { id, name: null },
    {
      onReading: (reading) => {
        if (isUsableReading(reading)) onBpm(reading.bpm);
      },
      onStatus: (status: StrapStatus) => {
        if (status === 'reconnecting' || status === 'bluetoothOff' || status === 'unauthorized') onBpm(null);
      },
      onDeviceIdChanged: () => undefined,
    },
  );
}
