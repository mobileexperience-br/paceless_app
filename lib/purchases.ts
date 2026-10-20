import { Platform } from 'react-native';
import Purchases from 'react-native-purchases';

export const PREMIUM_ENTITLEMENT = 'premium';

let configured = false;

function resolveApiKey(): string | undefined {
  if (Platform.OS === 'ios') {
    return process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
  }
  if (Platform.OS === 'android') {
    return process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
  }
  return undefined;
}

export function ensurePurchases(): boolean {
  if (configured) {
    return true;
  }
  const apiKey = resolveApiKey();
  if (!apiKey) {
    return false;
  }
  Purchases.configure({ apiKey });
  configured = true;
  return true;
}

let syncQueue: Promise<void> = Promise.resolve();

async function runPurchasesSync(userId: string | null): Promise<void> {
  try {
    if (userId) {
      await Purchases.logIn(userId);
    } else if (!(await Purchases.isAnonymous())) {
      await Purchases.logOut();
    }
  } catch {
    return;
  }
}

export function syncPurchasesUser(userId: string | null): Promise<void> {
  if (!ensurePurchases()) {
    return Promise.resolve();
  }
  syncQueue = syncQueue.then(() => runPurchasesSync(userId));
  return syncQueue;
}

export function isUserCancelled(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'userCancelled' in error &&
    error.userCancelled === true
  );
}
