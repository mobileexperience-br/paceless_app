import { PermissionsAndroid, Platform } from 'react-native';
import {
  Accuracy,
  ActivityType,
  hasStartedLocationUpdatesAsync,
  requestForegroundPermissionsAsync,
  startLocationUpdatesAsync,
  stopLocationUpdatesAsync,
  watchPositionAsync,
  type LocationSubscription,
} from 'expo-location';
import { appendFixes, drainFixes } from '@/lib/trackBuffer';
import { TRACKING_TASK, toFixes } from '@/lib/trackingTask';
import { palettes } from '@/theme';

export type LocationState = 'checking' | 'granted' | 'denied' | 'unavailable';

const TIME_INTERVAL_MS = 1000;
const DISTANCE_INTERVAL_METERS = 5;
const ANDROID_NOTIFICATION_API = 33;

const updateOptions = {
  accuracy: Accuracy.BestForNavigation,
  timeInterval: TIME_INTERVAL_MS,
  distanceInterval: DISTANCE_INTERVAL_METERS,
};

let fallback: LocationSubscription | null = null;
let currentSession = 0;

async function requestNotificationPermission(): Promise<void> {
  if (Platform.OS !== 'android' || Platform.Version < ANDROID_NOTIFICATION_API) return;
  try {
    await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
  } catch {
    return;
  }
}

export function openTrackingSession(): number {
  currentSession += 1;
  return currentSession;
}

export async function isTrackingTaskRunning(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    return await hasStartedLocationUpdatesAsync(TRACKING_TASK);
  } catch {
    return false;
  }
}

export async function startTracking(session: number, resume = false): Promise<LocationState> {
  if (Platform.OS === 'web') return 'unavailable';
  try {
    const response = await requestForegroundPermissionsAsync();
    if (!response.granted) return 'denied';
    await requestNotificationPermission();
    if (resume && (await isTrackingTaskRunning())) return 'granted';
    if (!resume) await drainFixes();
    if (session !== currentSession) return 'unavailable';
    fallback?.remove();
    fallback = null;
    try {
      await startLocationUpdatesAsync(TRACKING_TASK, {
        ...updateOptions,
        activityType: ActivityType.Fitness,
        pausesUpdatesAutomatically: false,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: 'Paceless — treino em andamento',
          notificationBody: 'Registrando distância e ritmo do seu treino.',
          notificationColor: palettes.light.primary,
          killServiceOnDestroy: true,
        },
      });
    } catch {
      const subscription = await watchPositionAsync(updateOptions, (location) => {
        void appendFixes(toFixes({ locations: [location] }));
      });
      if (session === currentSession) fallback = subscription;
      else subscription.remove();
    }
    return 'granted';
  } catch {
    return 'unavailable';
  }
}

export async function discardTracking(): Promise<void> {
  await stopTracking(openTrackingSession());
  await drainFixes();
}

export async function stopTracking(session: number): Promise<void> {
  if (session !== currentSession) return;
  fallback?.remove();
  fallback = null;
  if (Platform.OS === 'web') return;
  try {
    if (await hasStartedLocationUpdatesAsync(TRACKING_TASK)) {
      if (session !== currentSession) return;
      await stopLocationUpdatesAsync(TRACKING_TASK);
    }
  } catch {
    return;
  }
}
