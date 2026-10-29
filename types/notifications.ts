import type { Weekday } from '@/lib/trainingDayCombos';

export interface NotificationSettingsRow {
  user_id: string;
  training_reminders: boolean;
  reminder_time: string;
  training_days: number[];
  timezone: string;
}

export interface ReminderTime {
  hour: number;
  minute: number;
}

export interface ReminderPlan {
  enabled: boolean;
  time: ReminderTime;
  days: readonly Weekday[];
}

export type ReminderPermission = 'granted' | 'denied' | 'undetermined' | 'unavailable';

export type PushPlatform = 'ios' | 'android';
