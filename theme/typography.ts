import type { TextStyle } from 'react-native';

/**
 * O mockup especifica SF Pro. Inter é a fonte do Google Fonts mais próxima.
 * Os cinco primeiros estilos vêm do painel DESIGN SYSTEM; os demais foram
 * medidos nas telas.
 */
export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export type TypographyVariant =
  | 'title1'
  | 'title2'
  | 'title3'
  | 'body'
  | 'bodyStrong'
  | 'caption'
  | 'captionStrong'
  | 'label'
  | 'metric'
  | 'timer';

export const typography: Record<TypographyVariant, TextStyle> = {
  title1: { fontFamily: fonts.bold, fontSize: 28, lineHeight: 34 },
  title2: { fontFamily: fonts.semibold, fontSize: 22, lineHeight: 28 },
  title3: { fontFamily: fonts.semibold, fontSize: 18, lineHeight: 24 },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 22 },
  bodyStrong: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22 },
  caption: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 },
  captionStrong: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 20 },
  label: { fontFamily: fonts.medium, fontSize: 11, lineHeight: 14 },
  metric: { fontFamily: fonts.bold, fontSize: 22, lineHeight: 28 },
  timer: { fontFamily: fonts.bold, fontSize: 48, lineHeight: 56 },
};
