import { stepsSeconds, buildFartlekSteps, buildGoalSteps, buildIntervalSteps, buildRunSteps, buildStrengthSteps, buildTempoSteps } from './steps.ts';
import {
  easyDescription,
  fartlekDescription,
  goalDescription,
  goalTitle,
  intervalDescription,
  longDescription,
  sessionTitles,
  strengthDescription,
  tempoDescription,
} from './copy.ts';
import { isRaceGoal } from './volume.ts';
import type { GeneratedWorkout, Goal, IntervalStage } from './types.ts';

export type RunSession =
  | { type: 'easy'; minutes: number }
  | { type: 'long'; minutes: number }
  | { type: 'intervals'; stage: IntervalStage }
  | { type: 'tempo' }
  | { type: 'fartlek' }
  | { type: 'goal'; meters: number };

interface RunContent {
  title: string;
  description: string;
  steps: GeneratedWorkout['steps'];
  intensity: 'easy' | 'moderate';
  zone: number;
}

function longTitle(goal: Goal, minutes: number): string {
  if (isRaceGoal(goal) || minutes >= 40) return sessionTitles.long;
  return sessionTitles.easy;
}

function runContent(goal: Goal, session: RunSession): RunContent {
  switch (session.type) {
    case 'easy':
      return { title: sessionTitles.easy, description: easyDescription(session.minutes), steps: buildRunSteps(session.minutes), intensity: 'easy', zone: 2 };
    case 'long':
      return { title: longTitle(goal, session.minutes), description: longDescription(session.minutes), steps: buildRunSteps(session.minutes), intensity: 'easy', zone: 2 };
    case 'intervals':
      return { title: sessionTitles.intervals, description: intervalDescription(session.stage), steps: buildIntervalSteps(session.stage), intensity: 'easy', zone: 2 };
    case 'tempo':
      return { title: sessionTitles.tempo, description: tempoDescription, steps: buildTempoSteps(), intensity: 'moderate', zone: 3 };
    case 'fartlek':
      return { title: sessionTitles.fartlek, description: fartlekDescription, steps: buildFartlekSteps(), intensity: 'moderate', zone: 3 };
    case 'goal':
      return { title: goalTitle(session.meters), description: goalDescription(session.meters), steps: buildGoalSteps(), intensity: 'moderate', zone: 3 };
  }
}

function minutesOf(workout: { steps: GeneratedWorkout['steps'] }): number {
  return Math.round(stepsSeconds(workout.steps) / 60);
}

export function runWorkout(goal: Goal, session: RunSession, dayOfWeek: number, scheduledDate: string): GeneratedWorkout {
  const content = runContent(goal, session);
  const isGoal = session.type === 'goal';
  return {
    day_of_week: dayOfWeek,
    position: 1,
    title: content.title,
    description: content.description,
    kind: 'run',
    intensity: content.intensity,
    zone: content.zone,
    target_duration_minutes: isGoal ? null : minutesOf(content),
    target_distance_meters: session.type === 'goal' ? session.meters : null,
    scheduled_date: scheduledDate,
    steps: content.steps,
  };
}

export function strengthWorkout(dayOfWeek: number, scheduledDate: string): GeneratedWorkout {
  const steps = buildStrengthSteps();
  return {
    day_of_week: dayOfWeek,
    position: 2,
    title: sessionTitles.strength,
    description: strengthDescription(stepsSeconds(steps)),
    kind: 'strength',
    intensity: null,
    zone: null,
    target_duration_minutes: minutesOf({ steps }),
    target_distance_meters: null,
    scheduled_date: scheduledDate,
    steps,
  };
}
