import AsyncStorage from '@react-native-async-storage/async-storage';
import { ACTIVE_HR_KEY } from '@/lib/activeHeartRate';
import { isRecord } from '@/lib/activities';
import { supabase } from '@/lib/supabase';
import type { SavedStrap } from '@/types/heartRate';

export const STRAP_CACHE_KEY = 'paceless:ble-hr-device';
export const DEFAULT_STRAP_NAME = 'Cinta cardíaca';

const PROVIDER = 'ble_hr';
const STRAP_COLUMNS = 'device_id,device_name';
const NOT_CONFIGURED = 'Serviço não configurado.';

function requireClient(): NonNullable<typeof supabase> {
  if (!supabase) throw new Error(NOT_CONFIGURED);
  return supabase;
}

function parseStrap(row: unknown): SavedStrap | null {
  if (!isRecord(row)) return null;
  const id = row['device_id'];
  const name = row['device_name'];
  if (typeof id !== 'string') return null;
  return { id, name: typeof name === 'string' ? name : DEFAULT_STRAP_NAME };
}

async function writeCache(strap: SavedStrap | null): Promise<void> {
  try {
    if (strap === null) await AsyncStorage.removeItem(STRAP_CACHE_KEY);
    else await AsyncStorage.setItem(STRAP_CACHE_KEY, JSON.stringify(strap));
  } catch {
    return;
  }
}

export async function cachedStrap(): Promise<SavedStrap | null> {
  try {
    const stored = await AsyncStorage.getItem(STRAP_CACHE_KEY);
    if (stored === null) return null;
    const parsed: unknown = JSON.parse(stored);
    return parseStrap(parsed);
  } catch {
    return null;
  }
}

export async function fetchSavedStrap(): Promise<SavedStrap | null> {
  if (!supabase) return cachedStrap();
  const { data, error } = await supabase
    .from('connected_devices')
    .select(STRAP_COLUMNS)
    .eq('provider', PROVIDER)
    .maybeSingle();
  if (error) throw new Error(error.message);
  const strap = parseStrap(data);
  await writeCache(strap);
  return strap;
}

export async function saveStrap(strap: SavedStrap): Promise<void> {
  const client = requireClient();
  const existing = await client.from('connected_devices').select('id').eq('provider', PROVIDER).maybeSingle();
  if (existing.error) throw new Error(existing.error.message);
  const result = existing.data
    ? await client
        .from('connected_devices')
        .update({ device_id: strap.id, device_name: strap.name, status: 'connected' })
        .eq('provider', PROVIDER)
    : await client
        .from('connected_devices')
        .insert({ provider: PROVIDER, device_id: strap.id, device_name: strap.name });
  if (result.error) throw new Error(result.error.message);
  await writeCache(strap);
}

export async function clearHeartRateLocalData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([STRAP_CACHE_KEY, ACTIVE_HR_KEY]);
  } catch {
    return;
  }
}

export async function removeStrap(): Promise<void> {
  const { error } = await requireClient().from('connected_devices').delete().eq('provider', PROVIDER);
  if (error) throw new Error(error.message);
  await writeCache(null);
}
