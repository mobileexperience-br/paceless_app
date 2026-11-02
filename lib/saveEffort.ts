import { patchQueuedEffort, notifyActivitiesChanged } from '@/lib/activityQueue';
import type { PerceivedEffort } from '@/lib/activities';
import {
  storePendingEffort,
  updateEffort,
  type EffortSaveResult,
} from '@/lib/perceivedEffort';

export async function savePerceivedEffort(
  activityId: string,
  effort: PerceivedEffort,
): Promise<EffortSaveResult> {
  if (await patchQueuedEffort(activityId, effort)) return 'queued';
  if (await updateEffort(activityId, effort)) {
    notifyActivitiesChanged();
    return 'saved';
  }
  return (await storePendingEffort(activityId, effort)) ? 'queued' : 'failed';
}
