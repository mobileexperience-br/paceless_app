import { normalizeDays } from './days.ts';
import type { BuildPlanInput } from './types.ts';

export const GENERATOR_VERSION = 2;

export type SettingsInput = Pick<BuildPlanInput, 'goal' | 'level' | 'trainingDays' | 'strength' | 'tier'>;

export function settingsHash(input: SettingsInput): string {
  return [
    `v${GENERATOR_VERSION}`,
    input.goal,
    input.level,
    normalizeDays(input.trainingDays).join(','),
    input.strength,
    input.tier,
  ].join('|');
}
