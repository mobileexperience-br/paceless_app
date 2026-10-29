import { isRecord } from '@/lib/activities';
import type { PlanStep } from '@/types/training';

type LeafKind = Exclude<PlanStep, { kind: 'repeat' }>['kind'];

const leafKinds: readonly LeafKind[] = ['warmup', 'cooldown', 'run', 'walk', 'strength'];

function leafKindOf(value: unknown): LeafKind | null {
  return leafKinds.find((kind) => kind === value) ?? null;
}

function parseStep(value: unknown): PlanStep | null {
  if (!isRecord(value)) return null;
  if (value['kind'] === 'repeat') {
    const times = value['times'];
    if (typeof times !== 'number' || !Number.isInteger(times) || times < 1) return null;
    return { kind: 'repeat', times, steps: parsePlanSteps(value['steps']) };
  }
  const kind = leafKindOf(value['kind']);
  const durationSec = value['durationSec'];
  const label = value['label'];
  if (kind === null || typeof durationSec !== 'number' || typeof label !== 'string') return null;
  return { kind, durationSec, label };
}

export function parsePlanSteps(value: unknown): PlanStep[] {
  if (!Array.isArray(value)) return [];
  const items: unknown[] = value;
  const steps: PlanStep[] = [];
  for (const item of items) {
    const step = parseStep(item);
    if (step) steps.push(step);
  }
  return steps;
}
