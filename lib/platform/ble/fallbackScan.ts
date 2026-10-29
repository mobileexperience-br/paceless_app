import type { Device } from 'react-native-ble-plx';
import { getBleManager, HEART_RATE_SERVICE } from './bleManager';

export interface StrapIdentity {
  id: string;
  name: string | null;
}

const FALLBACK_SCAN_MS = 10000;

function matchesStrap(target: StrapIdentity, scanned: Device): boolean {
  if (scanned.id === target.id) return true;
  const scannedName = scanned.name ?? scanned.localName;
  return target.name !== null && scannedName === target.name;
}

export function findNearbyStrap(
  target: StrapIdentity,
  onFound: (strap: StrapIdentity) => void,
  onMissing: () => void,
): () => void {
  const manager = getBleManager();
  let active = true;
  const stopScan = (): void => {
    active = false;
    clearTimeout(timer);
    void manager.stopDeviceScan().catch(() => undefined);
  };
  const finish = (found: StrapIdentity | null): void => {
    if (!active) return;
    stopScan();
    if (found) onFound(found);
    else onMissing();
  };
  const timer = setTimeout(() => {
    finish(null);
  }, FALLBACK_SCAN_MS);
  manager
    .startDeviceScan([HEART_RATE_SERVICE], null, (error, scanned) => {
      if (!active) return;
      if (error) {
        finish(null);
        return;
      }
      if (scanned !== null && matchesStrap(target, scanned)) {
        finish({ id: scanned.id, name: scanned.name ?? scanned.localName ?? target.name });
      }
    })
    .catch(() => {
      finish(null);
    });
  return (): void => {
    if (active) stopScan();
  };
}
