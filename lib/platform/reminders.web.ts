import type { ReminderPermission, ReminderPlan } from '@/types/notifications';

export function configureReminders(): void {
  return;
}

export function getReminderPermission(): Promise<ReminderPermission> {
  return Promise.resolve('unavailable');
}

export function requestReminderPermission(): Promise<ReminderPermission> {
  return Promise.resolve('unavailable');
}

export function scheduleReminders(_plan: ReminderPlan): Promise<void> {
  return Promise.resolve();
}

export function cancelReminders(): Promise<void> {
  return Promise.resolve();
}

export function useReminderTapRedirect(_onUrl: (url: string) => void): void {
  return;
}

export function openSystemSettings(): void {
  return;
}
