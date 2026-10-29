import type {
  ConnectResult,
  HealthProvider,
  HubAvailability,
  ImportedWorkout,
} from '@/types/healthHub';

export function currentProvider(): HealthProvider | null {
  return null;
}

export function getAvailability(): Promise<HubAvailability> {
  return Promise.resolve('unsupported');
}

export function requestAccess(): Promise<ConnectResult> {
  return Promise.resolve({ granted: false, scopes: [] });
}

export function checkAccess(): Promise<boolean> {
  return Promise.resolve(false);
}

export function readRecentWorkouts(): Promise<ImportedWorkout[]> {
  return Promise.resolve([]);
}

export function writeWorkout(): Promise<boolean> {
  return Promise.resolve(false);
}

export function openHubSettings(): Promise<void> {
  return Promise.resolve();
}

export function openStoreForUpdate(): Promise<void> {
  return Promise.resolve();
}
