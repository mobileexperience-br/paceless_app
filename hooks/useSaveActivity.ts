import { useCallback } from 'react';
import { randomUUID } from 'expo-crypto';
import type { ActivityDraft } from '@/lib/activities';
import { enqueueActivity, insertActivity } from '@/lib/activityQueue';
import { useSession } from '@/hooks/useSession';

export type SaveResult = 'saved' | 'queued';

export type NewActivity = Omit<ActivityDraft, 'id' | 'user_id'>;

interface UseSaveActivity {
  save: (activity: NewActivity) => Promise<SaveResult>;
}

export function useSaveActivity(): UseSaveActivity {
  const { user } = useSession();
  const userId = user?.id ?? null;

  const save = useCallback(
    async (activity: NewActivity): Promise<SaveResult> => {
      if (userId === null) return 'queued';
      const draft: ActivityDraft = { ...activity, id: randomUUID(), user_id: userId };
      if (await insertActivity(draft)) return 'saved';
      await enqueueActivity(draft);
      return 'queued';
    },
    [userId],
  );

  return { save };
}
