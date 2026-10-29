import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { getReminderPermission } from '@/lib/platform/reminders';
import type { PushPlatform } from '@/types/notifications';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readProjectId(): string | null {
  const extra: unknown = Constants.expoConfig?.extra;
  const eas: unknown = isRecord(extra) ? extra['eas'] : undefined;
  const fromExtra: unknown = isRecord(eas) ? eas['projectId'] : undefined;
  const projectId: unknown = fromExtra ?? Constants.easConfig?.projectId;
  return typeof projectId === 'string' ? projectId : null;
}

export async function getExpoPushToken(): Promise<string | null> {
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') return null;
  if ((await getReminderPermission()) !== 'granted') return null;
  const projectId = readProjectId();
  if (projectId === null) return null;
  try {
    const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
    return data;
  } catch {
    return null;
  }
}

export function pushPlatform(): PushPlatform | null {
  if (Platform.OS === 'ios' || Platform.OS === 'android') return Platform.OS;
  return null;
}
