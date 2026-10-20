import type { Palette } from './colors';

export function createStyles<T>(factory: (colors: Palette) => T): (colors: Palette) => T {
  return factory;
}
