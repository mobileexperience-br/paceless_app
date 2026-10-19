import { useCallback } from 'react';
import type { ActivityDraft } from '@/lib/activities';
import { enqueueActivity, insertActivity } from '@/lib/activityQueue';

export type SaveResult = 'saved' | 'queued';

interface UseSaveActivity {
  save: (draft: ActivityDraft) => Promise<SaveResult>;
}

export function useSaveActivity(): UseSaveActivity {
  const save = useCallback(async (draft: ActivityDraft): Promise<SaveResult> => {
    if (await insertActivity(draft)) return 'saved';
    await enqueueActivity(draft);
    return 'queued';
  }, []);

  return { save };
}
