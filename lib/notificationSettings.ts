import {
  cancelReminders,
  requestReminderPermission,
  scheduleReminders,
} from '@/lib/platform/reminders';
import { deviceTimezone, formatReminderTime, isoDaysFrom, parseReminderTime } from '@/lib/reminderTime';
import { supabase } from '@/lib/supabase';
import type { NotificationSettingsRow, ReminderPermission } from '@/types/notifications';

export interface NotificationSettingsPatch {
  training_reminders: boolean;
  reminder_time: string;
  training_days: number[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseSettingsRow(raw: unknown): NotificationSettingsRow | null {
  if (!isRecord(raw)) return null;
  const userId = raw['user_id'];
  const reminders = raw['training_reminders'];
  const time = raw['reminder_time'];
  const days = raw['training_days'];
  const timezone = raw['timezone'];
  if (
    typeof userId !== 'string' ||
    typeof reminders !== 'boolean' ||
    typeof time !== 'string' ||
    typeof timezone !== 'string' ||
    !Array.isArray(days)
  ) {
    return null;
  }
  return {
    user_id: userId,
    training_reminders: reminders,
    reminder_time: time,
    training_days: days.filter((item): item is number => typeof item === 'number'),
    timezone,
  };
}

export async function fetchNotificationSettings(userId: string): Promise<NotificationSettingsRow | null> {
  if (!supabase) return null;
  try {
    const result = await supabase
      .from('notification_settings')
      .select('user_id, training_reminders, reminder_time, training_days, timezone')
      .eq('user_id', userId)
      .maybeSingle();
    if (result.error) return null;
    const raw: unknown = result.data;
    return parseSettingsRow(raw);
  } catch {
    return null;
  }
}

export async function upsertNotificationSettings(
  userId: string,
  patch: NotificationSettingsPatch,
): Promise<boolean> {
  if (!supabase) return false;
  try {
    const result = await supabase
      .from('notification_settings')
      .upsert({ user_id: userId, ...patch, timezone: deviceTimezone() }, { onConflict: 'user_id' })
      .select('user_id');
    const rows: unknown = result.data;
    return !result.error && Array.isArray(rows) && rows.length > 0;
  } catch {
    return false;
  }
}

export async function offerReminderPermission(
  userId: string,
  profileDays: readonly number[],
): Promise<ReminderPermission | null> {
  if (!supabase) return null;
  try {
    const result = await supabase.from('notification_settings').insert({
      user_id: userId,
      training_reminders: false,
      reminder_time: '07:00',
      training_days: isoDaysFrom(profileDays),
      timezone: deviceTimezone(),
    });
    if (result.error) return null;
    return await requestReminderPermission();
  } catch {
    return null;
  }
}

function sameDays(stored: readonly number[], days: readonly number[]): boolean {
  return isoDaysFrom(stored).join(',') === isoDaysFrom(days).join(',');
}

export async function syncReminders(userId: string, profileDays: readonly number[]): Promise<void> {
  const row = await fetchNotificationSettings(userId);
  if (!row?.training_reminders) {
    await cancelReminders();
    return;
  }
  const time = parseReminderTime(row.reminder_time);
  const days = isoDaysFrom(profileDays);
  await scheduleReminders({ enabled: true, time, days });
  if (!sameDays(row.training_days, days)) {
    await upsertNotificationSettings(userId, {
      training_reminders: true,
      reminder_time: formatReminderTime(time),
      training_days: days,
    });
  }
}
