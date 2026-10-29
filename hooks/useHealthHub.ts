import { useCallback, useRef, useState } from 'react';
import { notifyActivitiesChanged } from '@/lib/activityQueue';
import {
  deleteImported,
  fetchConnection,
  markStatus,
  saveConnection,
  type DeviceConnection,
} from '@/lib/connectedDevices';
import { syncHub } from '@/lib/healthSync';
import { withSyncLock } from '@/lib/healthSyncLock';
import {
  currentProvider,
  getAvailability,
  requestAccess,
} from '@/lib/platform/healthHub';
import type { HealthProvider, HubAvailability } from '@/types/healthHub';

const CONNECT_ERROR = 'Não foi possível conectar. Verifique as permissões e tente de novo.';
const SAVE_ERROR = 'Não foi possível salvar a conexão. Tente novamente.';
const SYNC_ERROR = 'Não foi possível sincronizar. Tente novamente.';
const DISCONNECT_ERROR = 'Não foi possível desconectar. Tente novamente.';

export interface HealthHub {
  provider: HealthProvider | null;
  availability: HubAvailability | null;
  connection: DeviceConnection | null;
  syncing: boolean;
  lastImported: number | null;
  error: string | null;
  refresh: () => Promise<void>;
  connect: () => Promise<boolean>;
  sync: () => Promise<void>;
  disconnect: (removeData: boolean) => Promise<void>;
}

export function useHealthHub(): HealthHub {
  const provider = currentProvider();
  const [availability, setAvailability] = useState<HubAvailability | null>(null);
  const [connection, setConnection] = useState<DeviceConnection | null>(null);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [lastImported, setLastImported] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const syncingRef = useRef<boolean>(false);

  const refresh = useCallback(async (): Promise<void> => {
    if (provider === null) return;
    try {
      const current = await getAvailability();
      setAvailability(current);
      setConnection(current === 'available' ? await fetchConnection(provider) : null);
    } catch {
      return;
    }
  }, [provider]);

  const sync = useCallback(async (): Promise<void> => {
    if (provider === null || syncingRef.current) return;
    syncingRef.current = true;
    setSyncing(true);
    setError(null);
    try {
      const outcome = await withSyncLock(() => syncHub(provider));
      if (outcome?.status === 'ok') setLastImported(outcome.imported);
      if (outcome?.status === 'failed') setError(SYNC_ERROR);
      if (outcome?.status === 'revoked') setLastImported(null);
      await refresh();
    } finally {
      syncingRef.current = false;
      setSyncing(false);
    }
  }, [provider, refresh]);

  const connect = useCallback(async (): Promise<boolean> => {
    if (provider === null) return false;
    setError(null);
    const access = await requestAccess().catch(() => null);
    if (!access?.granted) {
      setError(CONNECT_ERROR);
      return false;
    }
    try {
      await saveConnection(provider, access.scopes);
    } catch {
      setError(SAVE_ERROR);
      return false;
    }
    await sync();
    return true;
  }, [provider, sync]);

  const disconnect = useCallback(
    async (removeData: boolean): Promise<void> => {
      if (provider === null) return;
      setError(null);
      try {
        await markStatus(provider, 'disconnected');
        if (removeData) await deleteImported(provider);
        setLastImported(null);
        notifyActivitiesChanged();
      } catch {
        setError(DISCONNECT_ERROR);
      }
      await refresh();
    },
    [provider, refresh],
  );

  return {
    provider,
    availability,
    connection,
    syncing,
    lastImported,
    error,
    refresh,
    connect,
    sync,
    disconnect,
  };
}
