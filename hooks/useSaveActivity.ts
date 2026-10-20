import { useCallback, useEffect, useRef } from 'react';
import { randomUUID } from 'expo-crypto';
import type { ActivityDraft } from '@/lib/activities';
import { enqueueActivity, insertActivity } from '@/lib/activityQueue';
import { useSession } from '@/hooks/useSession';

export type SaveResult = 'saved' | 'queued' | 'failed';

export type NewActivity = Omit<ActivityDraft, 'id' | 'user_id'>;

interface UseSaveActivity {
  save: (activity: NewActivity) => Promise<SaveResult>;
}

export function useSaveActivity(): UseSaveActivity {
  const { user } = useSession();
  const userIdRef = useRef<string | null>(user?.id ?? null);

  useEffect(() => {
    if (user) userIdRef.current = user.id;
  }, [user]);

  const save = useCallback(
    async (activity: NewActivity): Promise<SaveResult> => {
      const userId = userIdRef.current;
      if (userId === null) return 'failed';
      const draft: ActivityDraft = { ...activity, id: randomUUID(), user_id: userId };
      if (await insertActivity(draft)) return 'saved';
      await enqueueActivity(draft);
      return 'queued';
    },
    [],
  );

  return { save };
}
