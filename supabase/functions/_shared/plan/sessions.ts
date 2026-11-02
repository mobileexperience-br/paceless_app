import { stepsSeconds, buildGoalSteps, buildIntervalSteps, buildRunSteps, buildStrengthSteps } from './steps.ts';
import {
  easyDescription,
  goalDescription,
  goalTitle,
  intervalDescription,
  sessionTitles,
  strengthDescription,
} from './copy.ts';
import type { GeneratedWorkout, IntervalStage } from './types.ts';

export type RunSession =
  | { type: 'easy'; minutes: number }
  | { type: 'intervals'; stage: IntervalStage }
  | { type: 'goal'; meters: number };

interface RunContent {
  title: string;
  description: string;
  steps: GeneratedWorkout['steps'];
  intensity: 'easy';
  zone: number;
}

function runContent(session: RunSession): RunContent {
  switch (session.type) {
    case 'easy':
      return { title: sessionTitles.easy, description: easyDescription(session.minutes), steps: buildRunSteps(session.minutes), intensity: 'easy', zone: 2 };
    case 'intervals':
      return { title: sessionTitles.intervals, description: intervalDescription(session.stage), steps: buildIntervalSteps(session.stage), intensity: 'easy', zone: 2 };
    case 'goal':
      return { title: goalTitle(), description: goalDescription(session.meters), steps: buildGoalSteps(), intensity: 'easy', zone: 2 };
  }
}

function minutesOf(workout: { steps: GeneratedWorkout['steps'] }): number {
  return Math.round(stepsSeconds(workout.steps) / 60);
}

export function runWorkout(session: RunSession, dayOfWeek: number, scheduledDate: string): GeneratedWorkout {
  const content = runContent(session);
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
