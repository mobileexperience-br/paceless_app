import { fetchConnection } from '@/lib/connectedDevices';
import type { ActivityDraft, ActivityType, WorkoutType } from '@/lib/activities';
import { currentProvider, writeWorkout } from '@/lib/platform/healthHub';

function isWorkoutType(type: ActivityType): type is WorkoutType {
  return type !== 'strength';
}

export async function exportToHealthHub(draft: ActivityDraft): Promise<void> {
  try {
    const provider = currentProvider();
    if (provider === null || !isWorkoutType(draft.type)) return;
    const connection = await fetchConnection(provider);
    if (connection?.status !== 'connected') return;
    await writeWorkout({
      id: draft.id,
      type: draft.type,
      startedAt: new Date(draft.started_at),
      endedAt: new Date(draft.ended_at),
      durationSeconds: draft.duration_seconds,
      distanceMeters: draft.distance_meters,
      route: draft.route,
    });
  } catch {
    return;
  }
}
