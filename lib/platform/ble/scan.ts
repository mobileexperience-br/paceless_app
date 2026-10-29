import { BleErrorCode, type BleError } from 'react-native-ble-plx';
import type { ScannedStrap } from '@/types/heartRate';
import { getBleManager, HEART_RATE_SERVICE } from './bleManager';

export type ScanFailure = 'bluetoothOff' | 'unauthorized' | 'failed';

const SCAN_DURATION_MS = 20000;
const UNNAMED_DEVICE = 'Sensor sem nome';

function failureFor(error: BleError): ScanFailure {
  if (error.errorCode === BleErrorCode.BluetoothPoweredOff) return 'bluetoothOff';
  if (error.errorCode === BleErrorCode.BluetoothUnauthorized) return 'unauthorized';
  return 'failed';
}

export function scanHeartRateDevices(
  onDevice: (device: ScannedStrap) => void,
  onError: (failure: ScanFailure) => void,
): () => void {
  const manager = getBleManager();
  const seen = new Set<string>();
  let active = true;
  const stop = (): void => {
    if (!active) return;
    active = false;
    clearTimeout(timer);
    void manager.stopDeviceScan().catch(() => undefined);
  };
  const fail = (failure: ScanFailure): void => {
    if (!active) return;
    stop();
    onError(failure);
  };
  const timer = setTimeout(stop, SCAN_DURATION_MS);
  manager
    .startDeviceScan([HEART_RATE_SERVICE], { allowDuplicates: false }, (error, device) => {
      if (!active) return;
      if (error) {
        fail(failureFor(error));
        return;
      }
      if (device === null || seen.has(device.id)) return;
      seen.add(device.id);
      onDevice({ id: device.id, name: device.name ?? device.localName ?? UNNAMED_DEVICE });
    })
    .catch(() => {
      fail('failed');
    });
  return stop;
}
