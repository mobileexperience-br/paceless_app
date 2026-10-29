import { BleManager, State, type Subscription } from 'react-native-ble-plx';

export const HEART_RATE_SERVICE = '0000180d-0000-1000-8000-00805f9b34fb';
export const HEART_RATE_MEASUREMENT = '00002a37-0000-1000-8000-00805f9b34fb';

const STATE_TIMEOUT_MS = 5000;

let manager: BleManager | null = null;

export function getBleManager(): BleManager {
  manager ??= new BleManager();
  return manager;
}

export function waitForState(bleManager: BleManager, timeoutMs = STATE_TIMEOUT_MS): Promise<State> {
  return new Promise((resolve) => {
    let lastState: State = State.Unknown;
    let settled = false;
    let subscription: Subscription | null = null;
    const finish = (state: State): void => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      subscription?.remove();
      resolve(state);
    };
    const timer = setTimeout(() => {
      finish(lastState);
    }, timeoutMs);
    subscription = bleManager.onStateChange((state) => {
      lastState = state;
      if (state !== State.Unknown && state !== State.Resetting) finish(state);
    }, true);
  });
}
