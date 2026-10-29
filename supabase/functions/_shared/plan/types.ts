export const goals = ['start_running', 'run_5k', 'run_10k', 'fitness'] as const;
export const levels = ['never_ran', 'sometimes', 'weekly'] as const;
export const strengths = ['yes', 'maybe_later', 'no'] as const;
export const tiers = ['free', 'full'] as const;

export type Goal = (typeof goals)[number];
export type Level = (typeof levels)[number];
export type Strength = (typeof strengths)[number];
export type Tier = (typeof tiers)[number];

export type StepKind = 'warmup' | 'cooldown' | 'run' | 'walk' | 'strength';

export type PlanStep =
  | { kind: StepKind; durationSec: number; label: string }
  | { kind: 'repeat'; times: number; steps: PlanStep[] };

export type WeekKind = 'normal' | 'recovery' | 'taper';

export interface IntervalStage {
  stage: number;
  runSec: number;
  walkSec: number;
  reps: number;
}

export interface GeneratedWorkout {
  day_of_week: number;
  position: number;
  title: string;
  description: string;
  kind: 'run' | 'strength';
  intensity: 'easy' | 'moderate' | null;
  zone: number | null;
  target_duration_minutes: number | null;
  target_distance_meters: number | null;
  scheduled_date: string;
  steps: PlanStep[];
}

export interface GeneratedWeek {
  week_number: number;
  title: string;
  workouts: GeneratedWorkout[];
}

export interface GeneratedPlan {
  name: string;
  description: string;
  goal: Goal;
  level: Level;
  sessions_per_week: number;
  tier: Tier;
  full_weeks: number;
  settings_hash: string;
  generator_version: number;
  weeks: GeneratedWeek[];
}

export interface BuildPlanInput {
  goal: Goal;
  level: Level;
  trainingDays: readonly number[];
  strength: Strength;
  tier: Tier;
  startDate: string;
}
