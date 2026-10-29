import { State } from 'react-native-ble-plx';
import type { BluetoothPreparation } from '@/types/heartRate';
import { getBleManager, waitForState } from './bleManager';

export async function waitForBluetoothReady(): Promise<BluetoothPreparation> {
  const state = await waitForState(getBleManager());
  if (state === State.PoweredOn) return 'ready';
  if (state === State.Unauthorized) return 'unauthorized';
  if (state === State.Unsupported) return 'unsupported';
  return 'bluetoothOff';
}
