import type { PlanStep } from '@/types/training';

export type BlockKind = 'warmup' | 'run' | 'walk' | 'cooldown' | 'strength';

export interface WorkoutBlock {
  kind: BlockKind;
  label: string;
  startSec: number;
  endSec: number;
}

export interface BlockPosition {
  index: number;
  current: WorkoutBlock | null;
  next: WorkoutBlock | null;
  remainingSec: number;
  done: boolean;
}

export const blockKindLabels: Record<BlockKind, string> = {
  warmup: 'Aquecimento',
  run: 'Corrida',
  walk: 'Caminhada',
  cooldown: 'Desaquecimento',
  strength: 'Fortalecimento',
};

const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;

function appendBlocks(steps: PlanStep[], blocks: WorkoutBlock[]): void {
  for (const step of steps) {
    if (step.kind === 'repeat') {
      for (let round = 0; round < step.times; round += 1) appendBlocks(step.steps, blocks);
      continue;
    }
    if (!Number.isFinite(step.durationSec) || step.durationSec <= 0) continue;
    const startSec = blocks[blocks.length - 1]?.endSec ?? 0;
    blocks.push({
      kind: step.kind,
      label: step.label,
      startSec,
      endSec: startSec + Math.round(step.durationSec),
    });
  }
}

export function expandBlocks(steps: PlanStep[]): WorkoutBlock[] {
  const blocks: WorkoutBlock[] = [];
  appendBlocks(steps, blocks);
  return blocks;
}

export function blockAt(blocks: WorkoutBlock[], activeSec: number): BlockPosition {
  const elapsed = Math.max(0, activeSec);
  const index = blocks.findIndex((block) => elapsed < block.endSec);
  const current = blocks[index] ?? null;
  if (current === null) {
    return { index: blocks.length, current: null, next: null, remainingSec: 0, done: blocks.length > 0 };
  }
  return {
    index,
    current,
    next: blocks[index + 1] ?? null,
    remainingSec: Math.ceil(current.endSec - elapsed),
    done: false,
  };
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function formatBlockTime(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / SECONDS_PER_HOUR);
  const minutes = Math.floor((total % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  const remainder = total % SECONDS_PER_MINUTE;
  if (hours > 0) return `${hours}:${pad(minutes)}:${pad(remainder)}`;
  return `${minutes}:${pad(remainder)}`;
}
