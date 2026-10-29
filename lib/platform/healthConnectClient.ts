import {
  getGrantedPermissions,
  initialize,
  requestPermission,
  type Permission,
} from 'react-native-health-connect';
import type { ConnectResult } from '@/types/healthHub';

export const REQUIRED_READ_SESSION: Permission = { accessType: 'read', recordType: 'ExerciseSession' };

const WANTED_PERMISSIONS = [
  { accessType: 'read', recordType: 'ExerciseSession' },
  { accessType: 'write', recordType: 'ExerciseSession' },
  { accessType: 'read', recordType: 'Distance' },
  { accessType: 'write', recordType: 'Distance' },
  { accessType: 'read', recordType: 'HeartRate' },
  { accessType: 'write', recordType: 'HeartRate' },
  { accessType: 'write', recordType: 'ExerciseRoute' },
] as const;

let initialized = false;

export async function ensureInitialized(): Promise<void> {
  if (initialized) return;
  const ready = await initialize();
  if (!ready) throw new Error('Health Connect indisponível.');
  initialized = true;
}

function scopeOf(permission: { accessType: string; recordType: string }): string {
  return `${permission.accessType}:${permission.recordType}`;
}

export async function requestHealthConnectPermissions(): Promise<ConnectResult> {
  await ensureInitialized();
  const granted = await requestPermission([...WANTED_PERMISSIONS]);
  const hasRead = granted.some(
    (permission) =>
      permission.accessType === REQUIRED_READ_SESSION.accessType &&
      permission.recordType === REQUIRED_READ_SESSION.recordType,
  );
  if (!hasRead) return { granted: false, scopes: [] };
  return { granted: true, scopes: granted.map(scopeOf) };
}

export async function hasReadSessionAccess(): Promise<boolean> {
  await ensureInitialized();
  const granted = await getGrantedPermissions();
  return granted.some(
    (permission) =>
      permission.accessType === REQUIRED_READ_SESSION.accessType &&
      permission.recordType === REQUIRED_READ_SESSION.recordType,
  );
}

export async function hasWriteRouteAccess(): Promise<boolean> {
  await ensureInitialized();
  const granted = await getGrantedPermissions();
  return granted.some(
    (permission) => permission.accessType === 'write' && permission.recordType === 'ExerciseRoute',
  );
}
