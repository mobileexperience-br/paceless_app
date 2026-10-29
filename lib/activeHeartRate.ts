import AsyncStorage from '@react-native-async-storage/async-storage';
import { isRecord } from '@/lib/activities';
import type { HeartRateSample } from '@/types/heartRate';

export const ACTIVE_HR_KEY = 'paceless:active-hr-samples';

interface StoredActiveSamples {
  sessionKey: string;
  samples: HeartRateSample[];
}

function parseSample(value: unknown): HeartRateSample | null {
  if (!isRecord(value)) return null;
  const tOffsetS = value['tOffsetS'];
  const bpm = value['bpm'];
  if (typeof tOffsetS !== 'number' || typeof bpm !== 'number') return null;
  return { tOffsetS, bpm };
}

function parseStored(raw: unknown): StoredActiveSamples | null {
  if (!isRecord(raw) || typeof raw['sessionKey'] !== 'string' || !Array.isArray(raw['samples'])) {
    return null;
  }
  const items: unknown[] = raw['samples'];
  const samples = items.map(parseSample).filter((sample): sample is HeartRateSample => sample !== null);
  return { sessionKey: raw['sessionKey'], samples };
}

export async function saveActiveSamples(sessionKey: string, samples: HeartRateSample[]): Promise<void> {
  try {
    await AsyncStorage.setItem(ACTIVE_HR_KEY, JSON.stringify({ sessionKey, samples }));
  } catch {
    return;
  }
}

export async function loadActiveSamples(sessionKey: string): Promise<HeartRateSample[]> {
  try {
    const stored = await AsyncStorage.getItem(ACTIVE_HR_KEY);
    if (stored === null) return [];
    const parsed = parseStored(JSON.parse(stored));
    return parsed?.sessionKey === sessionKey ? parsed.samples : [];
  } catch {
    return [];
  }
}

export async function clearActiveSamples(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ACTIVE_HR_KEY);
  } catch {
    return;
  }
}
