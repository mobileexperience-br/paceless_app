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
import { colors } from '@/theme';

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

async function requestNotificationPermission(): Promise<void> {
  if (Platform.OS !== 'android' || Platform.Version < ANDROID_NOTIFICATION_API) return;
  try {
    await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
  } catch {
    return;
  }
}

export async function startTracking(): Promise<LocationState> {
  if (Platform.OS === 'web') return 'unavailable';
  try {
    const response = await requestForegroundPermissionsAsync();
    if (!response.granted) return 'denied';
    await requestNotificationPermission();
    await drainFixes();
    try {
      await startLocationUpdatesAsync(TRACKING_TASK, {
        ...updateOptions,
        activityType: ActivityType.Fitness,
        pausesUpdatesAutomatically: false,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: 'Paceless — treino em andamento',
          notificationBody: 'Registrando distância e ritmo do seu treino.',
          notificationColor: colors.primary,
          killServiceOnDestroy: true,
        },
      });
    } catch {
      fallback = await watchPositionAsync(updateOptions, (location) => {
        void appendFixes(toFixes({ locations: [location] }));
      });
    }
    return 'granted';
  } catch {
    return 'unavailable';
  }
}

export async function stopTracking(): Promise<void> {
  fallback?.remove();
  fallback = null;
  if (Platform.OS === 'web') return;
  try {
    if (await hasStartedLocationUpdatesAsync(TRACKING_TASK)) {
      await stopLocationUpdatesAsync(TRACKING_TASK);
    }
  } catch {
    return;
  }
}
