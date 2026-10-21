export interface Palette {
  primary: string;
  primaryPressed: string;
  primarySoft: string;
  primaryDeep: string;
  onPrimary: string;
  ink: string;
  textSecondary: string;
  border: string;
  borderStrong: string;
  track: string;
  background: string;
  surface: string;
  white: string;
  danger: string;
  scrim: string;
}

const light: Palette = {
  primary: '#BCD243',
  primaryPressed: '#A9BE33',
  primarySoft: '#EBF4C3',
  primaryDeep: '#5F6F17',
  onPrimary: '#111111',
  ink: '#111111',
  textSecondary: '#687280',
  border: '#E5E7EB',
  borderStrong: '#868E9B',
  track: '#EDEEF0',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  white: '#FFFFFF',
  danger: '#D92D20',
  scrim: 'rgba(17, 17, 17, 0.45)',
};

const dark: Palette = {
  primary: '#BCD243',
  primaryPressed: '#A9BE33',
  primarySoft: '#2C3019',
  primaryDeep: '#BCD243',
  onPrimary: '#111111',
  ink: '#FFFFFF',
  textSecondary: '#A9A9A9',
  border: '#323232',
  borderStrong: '#6B6B6B',
  track: '#2A2A2A',
  background: '#111111',
  surface: '#1F1F1F',
  white: '#FFFFFF',
  danger: '#F97066',
  scrim: 'rgba(17, 17, 17, 0.45)',
};

export const palettes = { light, dark } as const;

export type ColorScheme = keyof typeof palettes;
