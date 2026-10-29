import { Linking } from 'react-native';
import {
  isHealthDataAvailableAsync,
  requestAuthorization,
  WorkoutRouteTypeIdentifier,
  WorkoutTypeIdentifier,
} from '@kingstinct/react-native-healthkit';
import { readHealthKitWorkouts } from '@/lib/platform/healthKitRead';
import { writeWorkoutToHealthKit } from '@/lib/platform/healthKitWrite';
import type { ConnectResult, HubAvailability } from '@/types/healthHub';

const DISTANCE_TYPE = 'HKQuantityTypeIdentifierDistanceWalkingRunning';
const HEART_RATE_TYPE = 'HKQuantityTypeIdentifierHeartRate';
const READ_TYPES = [WorkoutTypeIdentifier, HEART_RATE_TYPE, DISTANCE_TYPE] as const;
const SHARE_TYPES = [WorkoutTypeIdentifier, WorkoutRouteTypeIdentifier, DISTANCE_TYPE] as const;
const HEALTH_APP_URL = 'x-apple-health://';

export async function getAvailability(): Promise<HubAvailability> {
  try {
    return (await isHealthDataAvailableAsync()) ? 'available' : 'unsupported';
  } catch {
    return 'unsupported';
  }
}

export async function requestAccess(): Promise<ConnectResult> {
  const shown = await requestAuthorization({ toRead: [...READ_TYPES], toShare: [...SHARE_TYPES] });
  return { granted: shown, scopes: [...READ_TYPES, ...SHARE_TYPES] };
}

export function checkAccess(): Promise<boolean> {
  return Promise.resolve(true);
}

export { readHealthKitWorkouts as readRecentWorkouts, writeWorkoutToHealthKit as writeWorkout };

export async function openHubSettings(): Promise<void> {
  try {
    await Linking.openURL(HEALTH_APP_URL);
  } catch {
    await Linking.openSettings();
  }
}

export function openStoreForUpdate(): Promise<void> {
  return Promise.resolve();
}
