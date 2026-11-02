import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { buildAnalyticsPayload } from '@/lib/analyticsPayload';
import { isFreshSignup, rememberKey } from '@/lib/analyticsRules';
import { supabase } from '@/lib/supabase';
import type { AnalyticsEventMap, AnalyticsEventName } from '@/types/analytics';

export const ANALYTICS_SENT_KEY = 'paceless:analytics-sent';

export function appVersion(): string {
  return Constants.expoConfig?.version ?? 'unknown';
}

export function track<K extends AnalyticsEventName>(name: K, props: AnalyticsEventMap[K]): void {
  try {
    const payload = buildAnalyticsPayload(name, props);
    if (__DEV__) console.info('[analytics]', name, payload);
  } catch {
    return;
  }
}

function parseSentKeys(raw: string | null): string[] {
  if (raw === null) return [];
  const parsed: unknown = JSON.parse(raw);
  return Array.isArray(parsed) && parsed.every((item): item is string => typeof item === 'string')
    ? parsed
    : [];
}

export async function trackOnce<K extends AnalyticsEventName>(
  key: string,
  name: K,
  props: AnalyticsEventMap[K],
): Promise<void> {
  try {
    const sent = parseSentKeys(await AsyncStorage.getItem(ANALYTICS_SENT_KEY));
    const result = rememberKey(sent, key);
    if (!result.isNew) return;
    await AsyncStorage.setItem(ANALYTICS_SENT_KEY, JSON.stringify(result.sent));
    track(name, props);
  } catch {
    return;
  }
}

export async function reportSocialSignup(method: 'google' | 'apple'): Promise<void> {
  if (!supabase) return;
  try {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;
    if (isFreshSignup(user?.created_at, user?.last_sign_in_at)) {
      track('signup_completed', { method, app_version: appVersion() });
    }
  } catch {
    return;
  }
}
