import { useMemo } from 'react';
import { useActivePlan } from '@/hooks/useActivePlan';
import { findSession } from '@/lib/planProgress';
import { expandBlocks, type WorkoutBlock } from '@/lib/workoutBlocks';
import type { PlanStep } from '@/types/training';

export function usePlanBlocks(userPlanWorkoutId: string | null): WorkoutBlock[] {
  const { plan } = useActivePlan();
  const session = userPlanWorkoutId !== null && plan !== null ? findSession(plan, userPlanWorkoutId) : null;
  const steps: PlanStep[] | null = session?.workout.kind === 'run' ? session.workout.steps : null;
  return useMemo(() => (steps === null ? [] : expandBlocks(steps)), [steps]);
}
