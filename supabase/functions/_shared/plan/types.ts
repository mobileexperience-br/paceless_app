export const goals = ['complete_5k', 'race', 'fitness', 'weight_loss'] as const;
export const levels = ['total_beginner', 'beginner', 'intermediate', 'advanced'] as const;
export const eligibleLevels = ['total_beginner', 'beginner'] as const;
export const strengths = ['yes', 'maybe_later', 'no'] as const;
export const tiers = ['free', 'full'] as const;

export type Goal = (typeof goals)[number];
export type Level = (typeof levels)[number];
export type EligibleLevel = (typeof eligibleLevels)[number];
export type Strength = (typeof strengths)[number];
export type Tier = (typeof tiers)[number];

export type StepKind = 'warmup' | 'cooldown' | 'run' | 'walk' | 'strength';

export type PlanStep =
  | { kind: StepKind; durationSec: number; label: string }
  | { kind: 'repeat'; times: number; steps: PlanStep[] };

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
  level: EligibleLevel;
  sessions_per_week: number;
  tier: Tier;
  full_weeks: number;
  settings_hash: string;
  generator_version: number;
  weeks: GeneratedWeek[];
}

export interface BuildPlanInput {
  goal: Goal;
  level: EligibleLevel;
  trainingDays: readonly number[];
  strength: Strength;
  tier: Tier;
  startDate: string;
}
