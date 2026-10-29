import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useProfile } from '@/hooks/useProfile';
import { useSession } from '@/hooks/useSession';
import {
  fetchNotificationSettings,
  upsertNotificationSettings,
} from '@/lib/notificationSettings';
import { registerPushToken } from '@/lib/pushTokens';
import {
  cancelReminders,
  getReminderPermission,
  requestReminderPermission,
  scheduleReminders,
} from '@/lib/platform/reminders';
import { formatReminderTime, isoDaysFrom, parseReminderTime } from '@/lib/reminderTime';
import type { Weekday } from '@/lib/trainingDayCombos';
import type { ReminderPermission, ReminderTime } from '@/types/notifications';

export interface UseNotificationSettings {
  loading: boolean;
  enabled: boolean;
  time: ReminderTime;
  days: readonly Weekday[];
  permission: ReminderPermission;
  saving: boolean;
  error: string | null;
  toggle: (next: boolean) => Promise<void>;
  changeTime: (next: ReminderTime) => void;
}

interface SavedSettings {
  enabled: boolean;
  time: ReminderTime;
}

const defaultSettings: SavedSettings = { enabled: false, time: { hour: 7, minute: 0 } };
const saveError = 'Não foi possível salvar. Tente novamente.';
const debounceMs = 600;

export function useNotificationSettings(): UseNotificationSettings {
  const { user } = useSession();
  const userId = user?.id ?? null;
  const { profile, loading: profileLoading } = useProfile();
  const days = useMemo(() => isoDaysFrom(profile?.training_days ?? []), [profile]);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [saved, setSaved] = useState<SavedSettings>(defaultSettings);
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState<ReminderTime>(defaultSettings.time);
  const [permission, setPermission] = useState<ReminderPermission>('undetermined');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    void Promise.all([fetchNotificationSettings(userId), getReminderPermission()]).then(
      ([row, current]) => {
        if (!active) return;
        const next: SavedSettings = row
          ? { enabled: row.training_reminders, time: parseReminderTime(row.reminder_time) }
          : defaultSettings;
        setSaved(next);
        setEnabled(next.enabled);
        setTime(next.time);
        setPermission(current);
        setLoadedFor(userId);
      },
    );
    return (): void => {
      active = false;
    };
  }, [userId]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state): void => {
      if (state === 'active') void getReminderPermission().then(setPermission);
    });
    return (): void => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    return (): void => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const clearPending = useCallback((): void => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);

  const persistTime = useCallback(
    async (value: ReminderTime): Promise<void> => {
      if (!userId) return;
      setSaving(true);
      const ok = await upsertNotificationSettings(userId, {
        training_reminders: true,
        reminder_time: formatReminderTime(value),
        training_days: [...days],
      });
      setSaving(false);
      if (!ok) {
        setEnabled(saved.enabled);
        setTime(saved.time);
        setError(saveError);
        return;
      }
      setSaved({ enabled: true, time: value });
      await scheduleReminders({ enabled: true, time: value, days });
    },
    [userId, days, saved],
  );

  const toggle = useCallback(
    async (next: boolean): Promise<void> => {
      if (saving || !userId) return;
      clearPending();
      setError(null);
      if (next && permission !== 'granted') {
        const result = await requestReminderPermission();
        setPermission(result);
        if (result !== 'granted') return;
        void registerPushToken(userId);
      }
      setSaving(true);
      const ok = await upsertNotificationSettings(userId, {
        training_reminders: next,
        reminder_time: formatReminderTime(time),
        training_days: [...days],
      });
      setSaving(false);
      if (!ok) {
        setEnabled(saved.enabled);
        setError(saveError);
        return;
      }
      setEnabled(next);
      setSaved({ enabled: next, time });
      if (next) {
        await scheduleReminders({ enabled: true, time, days });
      } else {
        await cancelReminders();
      }
    },
    [saving, userId, clearPending, permission, time, days, saved],
  );

  const changeTime = useCallback(
    (next: ReminderTime): void => {
      clearPending();
      setTime(next);
      setError(null);
      timer.current = setTimeout(() => {
        timer.current = null;
        if (enabled) void persistTime(next);
      }, debounceMs);
    },
    [clearPending, enabled, persistTime],
  );

  return {
    loading: profileLoading || (userId !== null && loadedFor !== userId),
    enabled,
    time,
    days,
    permission,
    saving,
    error,
    toggle,
    changeTime,
  };
}
