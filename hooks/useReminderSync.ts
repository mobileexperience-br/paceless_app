import { useCallback, useEffect, useRef } from 'react';
import { router } from 'expo-router';
import { useProfile } from '@/hooks/useProfile';
import { useSession } from '@/hooks/useSession';
import { syncReminders } from '@/lib/notificationSettings';
import { cancelReminders, useReminderTapRedirect } from '@/lib/platform/reminders';

export function useReminderSync(): void {
  const { user } = useSession();
  const userId = user?.id ?? null;
  const { profile, loading: profileLoading } = useProfile();
  const trainingDays = profile?.training_days;
  const previousUserId = useRef<string | null>(userId);

  useEffect(() => {
    if (!userId || profileLoading) return;
    void syncReminders(userId, trainingDays ?? []);
  }, [userId, profileLoading, trainingDays]);

  useEffect(() => {
    const previous = previousUserId.current;
    previousUserId.current = userId;
    if (previous !== null && userId === null) void cancelReminders();
  }, [userId]);

  const openPlan = useCallback((): void => {
    router.push('/plan');
  }, []);
  useReminderTapRedirect(openPlan);
}
