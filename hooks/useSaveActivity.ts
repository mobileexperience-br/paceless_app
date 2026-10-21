import { useCallback, useEffect, useRef, useState } from 'react';
import { randomUUID } from 'expo-crypto';
import type { ActivityDraft } from '@/lib/activities';
import {
  currentUserId,
  enqueueActivity,
  insertActivity,
  notifyActivitiesChanged,
} from '@/lib/activityQueue';
import { useSession } from '@/hooks/useSession';

export type SaveResult = 'saved' | 'queued' | 'failed';

export type NewActivity = Omit<ActivityDraft, 'id' | 'user_id'>;

interface UseSaveActivity {
  saving: boolean;
  save: (activity: NewActivity) => Promise<SaveResult>;
}

export function useSaveActivity(): UseSaveActivity {
  const { user } = useSession();
  const userIdRef = useRef<string | null>(user?.id ?? null);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (user) userIdRef.current = user.id;
  }, [user]);

  const save = useCallback(async (activity: NewActivity): Promise<SaveResult> => {
    setSaving(true);
    try {
      const userId = userIdRef.current ?? (await currentUserId());
      if (userId === null) return 'failed';
      const draft: ActivityDraft = { ...activity, id: randomUUID(), user_id: userId };
      if (await insertActivity(draft)) {
        notifyActivitiesChanged();
        return 'saved';
      }
      return (await enqueueActivity(draft)) ? 'queued' : 'failed';
    } finally {
      setSaving(false);
    }
  }, []);

  return { saving, save };
}
