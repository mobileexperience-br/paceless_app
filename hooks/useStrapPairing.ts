import { useCallback, useRef, useState } from 'react';
import {
  prepareBluetooth,
  previewDevice,
  scanHeartRateDevices,
  type BluetoothPreparation,
  type ScannedStrap,
} from '@/lib/platform/heartRateBle';

const SCAN_WINDOW_MS = 20000;
const READING_TIMEOUT_MS = 10000;

export type PairingPhase =
  | 'intro'
  | 'scanning'
  | 'notFound'
  | 'failed'
  | BluetoothPreparation;

export interface StrapPairing {
  phase: PairingPhase;
  devices: ScannedStrap[];
  selectedId: string | null;
  bpm: number | null;
  readingTimedOut: boolean;
  scanEnded: boolean;
  start: () => Promise<void>;
  rescan: () => void;
  select: (device: ScannedStrap) => void;
  stop: () => void;
}

export function useStrapPairing(): StrapPairing {
  const [phase, setPhase] = useState<PairingPhase>('intro');
  const [devices, setDevices] = useState<ScannedStrap[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [bpm, setBpm] = useState<number | null>(null);
  const [readingTimedOut, setReadingTimedOut] = useState<boolean>(false);
  const [scanEnded, setScanEnded] = useState<boolean>(false);
  const devicesRef = useRef<ScannedStrap[]>([]);
  const stopScanRef = useRef<(() => void) | null>(null);
  const stopPreviewRef = useRef<(() => void) | null>(null);
  const scanTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const readingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopPreview = useCallback((): void => {
    if (readingTimerRef.current !== null) clearTimeout(readingTimerRef.current);
    readingTimerRef.current = null;
    stopPreviewRef.current?.();
    stopPreviewRef.current = null;
  }, []);

  const stopScan = useCallback((): void => {
    if (scanTimerRef.current !== null) clearTimeout(scanTimerRef.current);
    scanTimerRef.current = null;
    stopScanRef.current?.();
    stopScanRef.current = null;
  }, []);

  const stop = useCallback((): void => {
    stopScan();
    stopPreview();
  }, [stopScan, stopPreview]);

  const launchScan = useCallback((): void => {
    stopScan();
    setScanEnded(false);
    setPhase('scanning');
    stopScanRef.current = scanHeartRateDevices(
      (device) => {
        if (devicesRef.current.some((known) => known.id === device.id)) return;
        devicesRef.current = [...devicesRef.current, device];
        setDevices(devicesRef.current);
      },
      (failure) => {
        stop();
        setPhase(failure);
      },
    );
    scanTimerRef.current = setTimeout(() => {
      scanTimerRef.current = null;
      stopScan();
      if (devicesRef.current.length === 0) setPhase('notFound');
      else setScanEnded(true);
    }, SCAN_WINDOW_MS);
  }, [stop, stopScan]);

  const start = useCallback(async (): Promise<void> => {
    const result = await prepareBluetooth();
    if (result !== 'ready') {
      setPhase(result);
      return;
    }
    stop();
    devicesRef.current = [];
    setDevices([]);
    setSelectedId(null);
    setBpm(null);
    launchScan();
  }, [launchScan, stop]);

  const rescan = useCallback((): void => {
    launchScan();
  }, [launchScan]);

  const select = useCallback(
    (device: ScannedStrap): void => {
      stopPreview();
      setSelectedId(device.id);
      setBpm(null);
      setReadingTimedOut(false);
      stopPreviewRef.current = previewDevice(device.id, setBpm);
      readingTimerRef.current = setTimeout(() => {
        readingTimerRef.current = null;
        setReadingTimedOut(true);
      }, READING_TIMEOUT_MS);
    },
    [stopPreview],
  );

  return { phase, devices, selectedId, bpm, readingTimedOut, scanEnded, start, rescan, select, stop };
}
