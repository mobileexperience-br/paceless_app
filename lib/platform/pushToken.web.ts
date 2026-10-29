import type { PushPlatform } from '@/types/notifications';

export function getExpoPushToken(): Promise<string | null> {
  return Promise.resolve(null);
}

export function pushPlatform(): PushPlatform | null {
  return null;
}
