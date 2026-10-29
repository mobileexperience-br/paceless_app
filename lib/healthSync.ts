import { currentUserId } from '@/lib/activityQueue';
import { fetchConnection, markStatus, markSynced } from '@/lib/connectedDevices';
import { importWindowStart, importWorkouts } from '@/lib/healthImport';
import { withSyncLock } from '@/lib/healthSyncLock';
import { checkAccess, currentProvider, readRecentWorkouts } from '@/lib/platform/healthHub';
import type { HealthProvider } from '@/types/healthHub';

const AUTO_SYNC_THROTTLE_MS = 15 * 60 * 1000;

export type SyncOutcome =
  | { status: 'ok'; imported: number }
  | { status: 'revoked' }
  | { status: 'failed' };

export async function syncHub(provider: HealthProvider): Promise<SyncOutcome> {
  try {
    const userId = await currentUserId();
    if (userId === null) return { status: 'failed' };
    if (!(await checkAccess())) {
      await markStatus(provider, 'error');
      return { status: 'revoked' };
    }
    const workouts = await readRecentWorkouts(importWindowStart(new Date()));
    const imported = await importWorkouts(provider, userId, workouts);
    await markSynced(provider);
    return { status: 'ok', imported };
  } catch {
    return { status: 'failed' };
  }
}

export async function runAutoSync(now: Date = new Date()): Promise<void> {
  try {
    const provider = currentProvider();
    if (provider === null) return;
    const connection = await fetchConnection(provider);
    if (connection?.status !== 'connected') return;
    const last = connection.lastSyncAt;
    if (last && now.getTime() - last.getTime() < AUTO_SYNC_THROTTLE_MS) return;
    await withSyncLock(() => syncHub(provider));
  } catch {
    return;
  }
}
