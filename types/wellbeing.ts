export type AchievementKind = 'milestone' | 'personal';
export type AchievementMetric =
  | 'distance_meters'
  | 'duration_seconds'
  | 'activities_count'
  | 'weeks_met';
export type DeviceProvider = 'health_connect' | 'healthkit' | 'garmin' | 'strava';
export type DeviceStatus = 'connected' | 'disconnected' | 'error';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface WeeklyGoalRow {
  id: string;
  user_id: string;
  week_start: string;
  target_sessions: number;
  target_distance_meters: number | null;
  created_at: string;
  updated_at: string;
}

export interface AchievementRow {
  id: string;
  code: string;
  title: string;
  description: string | null;
  kind: AchievementKind;
  metric: AchievementMetric;
  threshold: number;
  created_at: string;
}

export interface UserAchievementRow {
  id: string;
  user_id: string;
  achievement_id: string;
  activity_id: string | null;
  earned_at: string;
}

export interface NotificationSettingsRow {
  user_id: string;
  training_reminders: boolean;
  reminder_time: string;
  training_days: number[];
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface ConnectedDeviceRow {
  id: string;
  user_id: string;
  provider: DeviceProvider;
  status: DeviceStatus;
  granted_scopes: string[];
  connected_at: string;
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NutritionGoalsRow {
  user_id: string;
  kcal: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  created_at: string;
  updated_at: string;
}

export interface MealRow {
  id: string;
  user_id: string;
  meal_date: string;
  meal_type: MealType;
  name: string | null;
  kcal: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AnamnesisRow {
  user_id: string;
  restrictions: string[];
  conditions: string[];
  consented_at: string;
  created_at: string;
  updated_at: string;
}
