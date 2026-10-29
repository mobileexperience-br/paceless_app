import { State, type BleManager, type Subscription } from 'react-native-ble-plx';

export interface PowerCallbacks {
  onOff: () => void;
  onOn: () => void;
  onUnauthorized: () => void;
  onUnsupported: () => void;
}

export function watchPowerState(manager: BleManager, callbacks: PowerCallbacks): Subscription {
  return manager.onStateChange((state) => {
    if (state === State.PoweredOff) callbacks.onOff();
    else if (state === State.PoweredOn) callbacks.onOn();
    else if (state === State.Unauthorized) callbacks.onUnauthorized();
    else if (state === State.Unsupported) callbacks.onUnsupported();
  }, false);
}
