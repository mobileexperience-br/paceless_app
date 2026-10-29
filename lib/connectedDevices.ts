import { isRecord } from '@/lib/activities';
import { notifyActivitiesChanged } from '@/lib/activityQueue';
import { supabase } from '@/lib/supabase';
import type { DeviceProvider } from '@/types/healthHub';

export type ConnectionStatus = 'connected' | 'disconnected' | 'error';

export interface DeviceConnection {
  id: string;
  status: ConnectionStatus;
  connectedAt: Date;
  lastSyncAt: Date | null;
  grantedScopes: string[];
}

const CONNECTION_COLUMNS = 'id,status,connected_at,last_sync_at,granted_scopes';
const NOT_CONFIGURED = 'Serviço não configurado.';

function requireClient(): NonNullable<typeof supabase> {
  if (!supabase) throw new Error(NOT_CONFIGURED);
  return supabase;
}

function isConnectionStatus(value: unknown): value is ConnectionStatus {
  return value === 'connected' || value === 'disconnected' || value === 'error';
}

function parseConnection(row: unknown): DeviceConnection | null {
  if (!isRecord(row)) return null;
  const id = row['id'];
  const status = row['status'];
  const connectedAt = row['connected_at'];
  const lastSyncAt = row['last_sync_at'];
  const scopes = row['granted_scopes'];
  if (typeof id !== 'string' || !isConnectionStatus(status) || typeof connectedAt !== 'string') {
    return null;
  }
  const scopeItems: unknown[] = Array.isArray(scopes) ? scopes : [];
  const grantedScopes = scopeItems.filter((scope): scope is string => typeof scope === 'string');
  return {
    id,
    status,
    connectedAt: new Date(connectedAt),
    lastSyncAt: typeof lastSyncAt === 'string' ? new Date(lastSyncAt) : null,
    grantedScopes,
  };
}

export async function fetchConnection(provider: DeviceProvider): Promise<DeviceConnection | null> {
  const { data, error } = await requireClient()
    .from('connected_devices')
    .select(CONNECTION_COLUMNS)
    .eq('provider', provider)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return parseConnection(data);
}

export async function saveConnection(provider: DeviceProvider, scopes: string[]): Promise<void> {
  const client = requireClient();
  const existing = await fetchConnection(provider);
  const result = existing
    ? await client
        .from('connected_devices')
        .update({ status: 'connected', granted_scopes: scopes, last_sync_at: null })
        .eq('provider', provider)
    : await client.from('connected_devices').insert({ provider, granted_scopes: scopes });
  if (result.error) throw new Error(result.error.message);
}

export async function markSynced(provider: DeviceProvider): Promise<void> {
  const { error } = await requireClient()
    .from('connected_devices')
    .update({ last_sync_at: new Date().toISOString() })
    .eq('provider', provider);
  if (error) throw new Error(error.message);
}

export async function markStatus(provider: DeviceProvider, status: ConnectionStatus): Promise<void> {
  const { error } = await requireClient()
    .from('connected_devices')
    .update({ status })
    .eq('provider', provider);
  if (error) throw new Error(error.message);
}

export async function deleteImported(provider: DeviceProvider): Promise<void> {
  const { error } = await requireClient().from('activities').delete().eq('source', provider);
  if (error) throw new Error(error.message);
  notifyActivitiesChanged();
}

export async function removeConnection(provider: DeviceProvider): Promise<void> {
  const { error } = await requireClient().from('connected_devices').delete().eq('provider', provider);
  if (error) throw new Error(error.message);
}
