import { Platform } from 'react-native';
import * as healthConnect from '@/lib/platform/healthConnectHub';
import * as healthKit from '@/lib/platform/healthKitHub';
import type {
  ConnectResult,
  ExportableWorkout,
  HealthProvider,
  HubAvailability,
  ImportedWorkout,
} from '@/types/healthHub';

interface HealthAdapter {
  getAvailability: () => Promise<HubAvailability>;
  requestAccess: () => Promise<ConnectResult>;
  checkAccess: () => Promise<boolean>;
  readRecentWorkouts: (since: Date) => Promise<ImportedWorkout[]>;
  writeWorkout: (workout: ExportableWorkout) => Promise<boolean>;
  openHubSettings: () => Promise<void>;
  openStoreForUpdate: () => Promise<void>;
}

const adapters: Record<HealthProvider, HealthAdapter> = {
  healthkit: healthKit,
  health_connect: healthConnect,
};

export function currentProvider(): HealthProvider | null {
  if (Platform.OS === 'ios') return 'healthkit';
  if (Platform.OS === 'android') return 'health_connect';
  return null;
}

function activeAdapter(): HealthAdapter | null {
  const provider = currentProvider();
  return provider === null ? null : adapters[provider];
}

export async function getAvailability(): Promise<HubAvailability> {
  const adapter = activeAdapter();
  return adapter ? adapter.getAvailability() : 'unsupported';
}

export async function requestAccess(): Promise<ConnectResult> {
  const adapter = activeAdapter();
  return adapter ? adapter.requestAccess() : { granted: false, scopes: [] };
}

export async function checkAccess(): Promise<boolean> {
  const adapter = activeAdapter();
  return adapter ? adapter.checkAccess() : false;
}

export async function readRecentWorkouts(since: Date): Promise<ImportedWorkout[]> {
  const adapter = activeAdapter();
  return adapter ? adapter.readRecentWorkouts(since) : [];
}

export async function writeWorkout(workout: ExportableWorkout): Promise<boolean> {
  const adapter = activeAdapter();
  return adapter ? adapter.writeWorkout(workout) : false;
}

export async function openHubSettings(): Promise<void> {
  await activeAdapter()?.openHubSettings();
}

export async function openStoreForUpdate(): Promise<void> {
  await activeAdapter()?.openStoreForUpdate();
}
