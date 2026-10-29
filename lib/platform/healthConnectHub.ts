import { Linking } from 'react-native';
import {
  getSdkStatus,
  openHealthConnectSettings,
  SdkAvailabilityStatus,
} from 'react-native-health-connect';
import {
  ensureInitialized,
  hasReadSessionAccess,
  requestHealthConnectPermissions,
} from '@/lib/platform/healthConnectClient';
import type { HubAvailability } from '@/types/healthHub';

const PLAY_STORE_PACKAGE = 'com.google.android.apps.healthdata';
const MARKET_URL = `market://details?id=${PLAY_STORE_PACKAGE}&url=healthconnect%3A%2F%2Fonboarding`;
const WEB_STORE_URL = `https://play.google.com/store/apps/details?id=${PLAY_STORE_PACKAGE}`;

export async function getAvailability(): Promise<HubAvailability> {
  try {
    const status = await getSdkStatus();
    if (status === SdkAvailabilityStatus.SDK_UNAVAILABLE) return 'unsupported';
    if (status === SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED) {
      return 'needsUpdate';
    }
    await ensureInitialized();
    return 'available';
  } catch {
    return 'unsupported';
  }
}

export { requestHealthConnectPermissions as requestAccess, hasReadSessionAccess as checkAccess };
export { readHealthConnectWorkouts as readRecentWorkouts } from '@/lib/platform/healthConnectRead';
export { writeWorkoutToHealthConnect as writeWorkout } from '@/lib/platform/healthConnectWrite';

export function openHubSettings(): Promise<void> {
  openHealthConnectSettings();
  return Promise.resolve();
}

export async function openStoreForUpdate(): Promise<void> {
  try {
    await Linking.openURL(MARKET_URL);
  } catch {
    await Linking.openURL(WEB_STORE_URL);
  }
}
