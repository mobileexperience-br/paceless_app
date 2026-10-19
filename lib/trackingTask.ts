import { Platform } from 'react-native';
import { defineTask } from 'expo-task-manager';
import { isRecord } from '@/lib/activities';
import { appendFixes } from '@/lib/trackBuffer';
import type { RawFix } from '@/lib/trackProcessor';

export const TRACKING_TASK = 'paceless-workout-tracking';

export function toFixes(data: unknown): RawFix[] {
  if (!isRecord(data)) return [];
  const locations = data['locations'];
  if (!Array.isArray(locations)) return [];
  const items: unknown[] = locations;
  const fixes: RawFix[] = [];
  for (const item of items) {
    if (!isRecord(item)) continue;
    const coords = item['coords'];
    const timestamp = item['timestamp'];
    if (!isRecord(coords) || typeof timestamp !== 'number') continue;
    const { latitude, longitude, accuracy } = coords;
    if (typeof latitude !== 'number' || typeof longitude !== 'number') continue;
    fixes.push({
      latitude,
      longitude,
      accuracy: typeof accuracy === 'number' ? accuracy : null,
      timestamp,
    });
  }
  return fixes;
}

if (Platform.OS !== 'web') {
  defineTask(TRACKING_TASK, async ({ data, error }) => {
    if (error) return;
    await appendFixes(toFixes(data));
  });
}
