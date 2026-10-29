import type { IntervalStage, PlanStep } from './types.ts';

const walkingWarmup: PlanStep = { kind: 'warmup', durationSec: 300, label: 'Aquecimento (caminhada)' };
const walkingCooldown: PlanStep = { kind: 'cooldown', durationSec: 300, label: 'Desaquecimento (caminhada)' };
const easyRun = (durationSec: number): PlanStep => ({ kind: 'run', durationSec, label: 'Corrida leve' });
const walk = (durationSec: number): PlanStep => ({ kind: 'walk', durationSec, label: 'Caminhada' });

export function stepsSeconds(steps: readonly PlanStep[]): number {
  return steps.reduce(
    (total, step) => total + (step.kind === 'repeat' ? step.times * stepsSeconds(step.steps) : step.durationSec),
    0,
  );
}

export function buildRunSteps(minutes: number): PlanStep[] {
  return [walkingWarmup, easyRun((minutes - 10) * 60), walkingCooldown];
}

export function buildIntervalSteps(stage: IntervalStage): PlanStep[] {
  return [
    walkingWarmup,
    { kind: 'repeat', times: stage.reps, steps: [easyRun(stage.runSec), walk(stage.walkSec)] },
    walkingCooldown,
  ];
}

export function buildTempoSteps(): PlanStep[] {
  return [
    { kind: 'warmup', durationSec: 600, label: 'Aquecimento (caminhada)' },
    {
      kind: 'repeat',
      times: 3,
      steps: [
        { kind: 'run', durationSec: 300, label: 'Ritmo moderado' },
        easyRun(120),
      ],
    },
    walkingCooldown,
  ];
}

export function buildFartlekSteps(): PlanStep[] {
  return [
    { kind: 'warmup', durationSec: 600, label: 'Aquecimento (caminhada)' },
    {
      kind: 'repeat',
      times: 6,
      steps: [
        { kind: 'run', durationSec: 60, label: 'Tiro' },
        easyRun(120),
      ],
    },
    walkingCooldown,
  ];
}

export function buildGoalSteps(): PlanStep[] {
  return [
    { kind: 'warmup', durationSec: 600, label: 'Aquecimento (caminhada)' },
    { kind: 'run', durationSec: 0, label: 'Ritmo moderado' },
    walkingCooldown,
  ];
}

export function buildStrengthSteps(): PlanStep[] {
  const exercise = (label: string, durationSec: number): PlanStep => ({ kind: 'strength', durationSec, label });
  return [
    {
      kind: 'repeat',
      times: 3,
      steps: [
        exercise('Agachamento', 45),
        exercise('Elevação de quadril', 45),
        exercise('Prancha', 30),
        exercise('Panturrilha', 45),
        exercise('Descanso', 60),
      ],
    },
  ];
}
