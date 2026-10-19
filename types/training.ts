import type { OnboardingAnswers } from '@/types/onboarding';

export type Level = 'beginner' | 'intermediate' | 'advanced';
export type MuscleGroup =
  | 'full_body'
  | 'core'
  | 'glutes'
  | 'hips'
  | 'quads'
  | 'hamstrings'
  | 'calves'
  | 'feet'
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'arms';
export type ExerciseCategory = 'strength' | 'mobility' | 'core';
export type PlanGoal = OnboardingAnswers['goal'];
export type PlanLevel = OnboardingAnswers['level'];
export type WorkoutKind = 'run' | 'strength' | 'rest';
export type WorkoutIntensity = 'easy' | 'moderate' | 'hard';
export type UserPlanStatus = 'active' | 'paused' | 'completed' | 'cancelled';
export type UserPlanWorkoutStatus = 'planned' | 'done' | 'skipped';

export interface ExerciseRow {
  id: string;
  slug: string;
  name: string;
  muscle_group: MuscleGroup;
  category: ExerciseCategory;
  level: Level;
  description: string | null;
  instructions: string | null;
  media_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface StrengthWorkoutRow {
  id: string;
  owner_id: string | null;
  title: string;
  subtitle: string | null;
  duration_minutes: number | null;
  level: Level;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}

export interface StrengthWorkoutExerciseRow {
  id: string;
  strength_workout_id: string;
  exercise_id: string;
  position: number;
  sets: number;
  reps: number | null;
  duration_seconds: number | null;
  rest_seconds: number;
  created_at: string;
}

export interface PlanRow {
  id: string;
  owner_id: string | null;
  name: string;
  description: string | null;
  goal: PlanGoal;
  level: PlanLevel;
  weeks: number;
  sessions_per_week: number;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlanWeekRow {
  id: string;
  plan_id: string;
  week_number: number;
  title: string | null;
}

export interface PlanWorkoutRow {
  id: string;
  plan_week_id: string;
  day_of_week: number;
  position: number;
  title: string;
  kind: WorkoutKind;
  intensity: WorkoutIntensity | null;
  zone: number | null;
  target_duration_minutes: number | null;
  target_distance_meters: number | null;
  strength_workout_id: string | null;
  notes: string | null;
}

export interface UserPlanRow {
  id: string;
  user_id: string;
  plan_id: string;
  started_at: string;
  current_week: number;
  status: UserPlanStatus;
  created_at: string;
  updated_at: string;
}

export interface UserPlanWorkoutRow {
  id: string;
  user_id: string;
  user_plan_id: string;
  plan_workout_id: string | null;
  scheduled_date: string;
  status: UserPlanWorkoutStatus;
  activity_id: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}
