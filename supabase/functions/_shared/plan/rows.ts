import { goals, levels, strengths, type Goal, type Level, type Strength } from './types.ts';

export interface ProfileSettings {
  goal: Goal;
  level: Level;
  trainingDays: number[];
  strength: Strength;
}

export interface ActivePlan {
  id: string;
  startedAt: string;
  settingsHash: string | null;
  tier: string | null;
}

export function oneOf<T extends string>(options: readonly T[], value: unknown): T | null {
  return options.find((option) => option === value) ?? null;
}

export function fieldsOf(raw: unknown): ReadonlyMap<string, unknown> {
  if (typeof raw !== 'object' || raw === null) return new Map<string, unknown>();
  return new Map<string, unknown>(Object.entries(raw));
}

function isDay(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 7;
}

export function parseProfile(raw: unknown): ProfileSettings | null {
  const fields = fieldsOf(raw);
  const goal = oneOf(goals, fields.get('goal'));
  const level = oneOf(levels, fields.get('level'));
  const days = fields.get('training_days');
  const list: unknown[] = Array.isArray(days) ? days : [];
  const trainingDays = list.filter(isDay);
  const strength = oneOf(strengths, fields.get('strength')) ?? 'no';
  if (goal === null || level === null || trainingDays.length === 0) return null;
  return { goal, level, trainingDays, strength };
}

export function parseActivePlan(raw: unknown): ActivePlan | null {
  const fields = fieldsOf(raw);
  const id = fields.get('id');
  const startedAt = fields.get('started_at');
  if (typeof id !== 'string' || typeof startedAt !== 'string') return null;
  const plan = fieldsOf(fields.get('plans'));
  const settingsHash = plan.get('settings_hash');
  const tier = plan.get('tier');
  return {
    id,
    startedAt,
    settingsHash: typeof settingsHash === 'string' ? settingsHash : null,
    tier: typeof tier === 'string' ? tier : null,
  };
}
