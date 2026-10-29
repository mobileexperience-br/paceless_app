import { useEffect } from 'react';
import { Linking, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { reminderMessage } from '@/lib/reminderCopy';
import type { Weekday } from '@/lib/trainingDayCombos';
import type { ReminderPermission, ReminderPlan, ReminderTime } from '@/types/notifications';

const channelId = 'training-reminders';
const reminderUrl = '/plan';

let queue: Promise<void> = Promise.resolve();

function serialize(task: () => Promise<void>): Promise<void> {
  const run = queue.then(task);
  queue = run.catch((): void => undefined);
  return run;
}

function toPermission(status: Notifications.PermissionStatus, canAskAgain: boolean): ReminderPermission {
  if (status === Notifications.PermissionStatus.GRANTED) return 'granted';
  if (status === Notifications.PermissionStatus.DENIED && !canAskAgain) return 'denied';
  return 'undetermined';
}

function scheduleDay(day: Weekday, time: ReminderTime): Promise<string> {
  const message = reminderMessage(day);
  return Notifications.scheduleNotificationAsync({
    content: { title: message.title, body: message.body, data: { url: reminderUrl } },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: (day % 7) + 1,
      hour: time.hour,
      minute: time.minute,
      channelId,
    },
  });
}

async function scheduleNow(plan: ReminderPlan): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!plan.enabled || plan.days.length === 0) return;
  if ((await getReminderPermission()) !== 'granted') return;
  await Promise.all(plan.days.map((day) => scheduleDay(day, plan.time)));
}

export function configureReminders(): void {
  Notifications.setNotificationHandler({
    handleNotification: () =>
      Promise.resolve({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
  });
  if (Platform.OS === 'android') {
    void Notifications.setNotificationChannelAsync(channelId, {
      name: 'Lembretes de treino',
      importance: AndroidImportance.DEFAULT,
      description: 'Avisos nos seus dias de treino',
    });
    void Notifications.setNotificationChannelAsync('general', {
      name: 'Avisos',
      importance: AndroidImportance.DEFAULT,
      description: 'Novidades do seu plano e da sua conta',
    });
  }
}

export async function getReminderPermission(): Promise<ReminderPermission> {
  const status = await Notifications.getPermissionsAsync();
  return toPermission(status.status, status.canAskAgain);
}

export async function requestReminderPermission(): Promise<ReminderPermission> {
  const status = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowSound: true, allowBadge: false },
  });
  return toPermission(status.status, status.canAskAgain);
}

export function scheduleReminders(plan: ReminderPlan): Promise<void> {
  return serialize(async (): Promise<void> => {
    try {
      await scheduleNow(plan);
    } catch {
      return;
    }
  });
}

export function cancelReminders(): Promise<void> {
  return serialize(async (): Promise<void> => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch {
      return;
    }
  });
}

export function useReminderTapRedirect(onUrl: (url: string) => void): void {
  const response = Notifications.useLastNotificationResponse();
  useEffect(() => {
    if (!response) return;
    const data: Record<string, unknown> | undefined = response.notification.request.content.data;
    const url: unknown = data?.['url'];
    if (typeof url !== 'string') return;
    onUrl(url);
    Notifications.clearLastNotificationResponse();
  }, [response, onUrl]);
}

export function openSystemSettings(): void {
  void Linking.openSettings();
}
