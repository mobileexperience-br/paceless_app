import {
  BleErrorCode,
  State,
  type BleError,
  type Characteristic,
  type Subscription,
} from 'react-native-ble-plx';
import { parseHeartRate, type HeartRateReading } from '@/lib/heartRate/parseHeartRate.ts';
import type { StrapStatus } from '@/types/heartRate';
import { getBleManager, HEART_RATE_MEASUREMENT, HEART_RATE_SERVICE, waitForState } from './bleManager';
import { findNearbyStrap } from './fallbackScan';
import { watchPowerState, type PowerCallbacks } from './hrPowerState';

export interface StrapDevice {
  id: string;
  name: string | null;
}

export interface SessionHandlers {
  onReading: (reading: HeartRateReading, receivedAtMs: number) => void;
  onStatus: (status: StrapStatus) => void;
  onDeviceIdChanged: (id: string, name: string | null) => void;
}

const CONNECT_TIMEOUT_MS = 10000;
const RECONNECT_DELAYS_MS = [1000, 2000, 5000] as const;
const RECONNECT_STEADY_MS = 10000;
const FALLBACK_AFTER_FAILURES = 2;

export function startHeartRateSession(device: StrapDevice, handlers: SessionHandlers): () => void {
  const manager = getBleManager();
  let deviceId = device.id;
  let deviceName = device.name;
  let stopped = false;
  let powered = true;
  let connecting = false;
  let connected = false;
  let hasConnected = false;
  let failures = 0;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;
  let cancelFallback: (() => void) | null = null;
  let monitorSub: Subscription | null = null;
  let disconnectSub: Subscription | null = null;
  let stateSub: Subscription | null = null;
  const isStopped = (): boolean => stopped;
  const isPowered = (): boolean => powered;

  function dropLink(): void {
    monitorSub?.remove();
    monitorSub = null;
    disconnectSub?.remove();
    disconnectSub = null;
    connected = false;
  }

  function cancelLink(): void {
    void manager.cancelDeviceConnection(deviceId).catch(() => undefined);
  }

  function scheduleReconnect(): void {
    if (stopped || !powered || retryTimer !== null) return;
    dropLink();
    cancelLink();
    handlers.onStatus('reconnecting');
    retryTimer = setTimeout(() => {
      retryTimer = null;
      void connect();
    }, RECONNECT_DELAYS_MS[failures] ?? RECONNECT_STEADY_MS);
  }

  function onMeasurement(error: BleError | null, characteristic: Characteristic | null): void {
    if (stopped) return;
    if (error) {
      if (error.errorCode !== BleErrorCode.OperationCancelled) scheduleReconnect();
      return;
    }
    const value = characteristic?.value;
    const reading = value ? parseHeartRate(value) : null;
    if (reading !== null) handlers.onReading(reading, Date.now());
  }

  function runFallbackScan(): void {
    if (stopped) return;
    handlers.onStatus('reconnecting');
    cancelFallback = findNearbyStrap(
      { id: deviceId, name: deviceName },
      (found) => {
        cancelFallback = null;
        if (found.id !== deviceId) {
          deviceId = found.id;
          deviceName = found.name;
          handlers.onDeviceIdChanged(found.id, found.name);
        }
        void connect();
      },
      () => {
        cancelFallback = null;
        scheduleReconnect();
      },
    );
  }

  async function connect(): Promise<void> {
    if (stopped || !powered || connecting || connected) return;
    connecting = true;
    handlers.onStatus(hasConnected ? 'reconnecting' : 'connecting');
    try {
      await manager.connectToDevice(deviceId, { autoConnect: false, timeout: CONNECT_TIMEOUT_MS });
      await manager.discoverAllServicesAndCharacteristicsForDevice(deviceId);
      if (isStopped()) {
        cancelLink();
        return;
      }
      monitorSub = manager.monitorCharacteristicForDevice(
        deviceId,
        HEART_RATE_SERVICE,
        HEART_RATE_MEASUREMENT,
        onMeasurement,
        `hr-${deviceId}`,
      );
      disconnectSub = manager.onDeviceDisconnected(deviceId, () => {
        if (!stopped) scheduleReconnect();
      });
      connected = true;
      hasConnected = true;
      failures = 0;
      handlers.onStatus('connected');
    } catch {
      if (isStopped() || !isPowered()) return;
      failures += 1;
      if (failures === FALLBACK_AFTER_FAILURES) runFallbackScan();
      else scheduleReconnect();
    } finally {
      connecting = false;
    }
  }

  function pause(): void {
    if (retryTimer !== null) clearTimeout(retryTimer);
    retryTimer = null;
    cancelFallback?.();
    cancelFallback = null;
    dropLink();
    cancelLink();
  }

  const stop = (): void => {
    if (stopped) return;
    stopped = true;
    pause();
    stateSub?.remove();
    stateSub = null;
    void manager.cancelTransaction(`hr-${deviceId}`).catch(() => undefined);
  };

  const endWith = (status: StrapStatus): void => {
    handlers.onStatus(status);
    stop();
  };

  const powerCallbacks: PowerCallbacks = {
    onOff: (): void => {
      powered = false;
      pause();
      handlers.onStatus('bluetoothOff');
    },
    onOn: (): void => {
      if (powered) return;
      powered = true;
      failures = 0;
      void connect();
    },
    onUnauthorized: (): void => { endWith('unauthorized'); },
    onUnsupported: (): void => { endWith('idle'); },
  };

  async function start(): Promise<void> {
    const state = await waitForState(manager);
    if (stopped) return;
    if (state === State.Unauthorized || state === State.Unsupported) {
      endWith(state === State.Unauthorized ? 'unauthorized' : 'idle');
      return;
    }
    stateSub = watchPowerState(manager, powerCallbacks);
    if (state === State.PoweredOn) void connect();
    else if (state === State.PoweredOff) powerCallbacks.onOff();
    else {
      powered = false;
      handlers.onStatus('idle');
    }
  }

  void start().catch(() => {
    if (!stopped) handlers.onStatus('idle');
  });
  return stop;
}
