import { getExpoPushToken, pushPlatform } from '@/lib/platform/pushToken';
import { supabase } from '@/lib/supabase';

let registeredToken: string | null = null;

export async function registerPushToken(userId: string): Promise<void> {
  if (!supabase || !userId) return;
  try {
    const token = await getExpoPushToken();
    const platform = pushPlatform();
    if (token === null || platform === null) return;
    const result = await supabase
      .from('push_tokens')
      .upsert(
        { expo_token: token, platform, device_id: null },
        { onConflict: 'expo_token' },
      );
    if (result.error) return;
    registeredToken = token;
  } catch {
    return;
  }
}

export async function unregisterPushToken(): Promise<void> {
  const token = registeredToken;
  registeredToken = null;
  try {
    const target = token ?? (await getExpoPushToken());
    if (target === null || !supabase) return;
    await supabase.from('push_tokens').delete().eq('expo_token', target);
  } catch {
    return;
  }
}
