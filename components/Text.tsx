import type { ReactElement } from 'react';
import { Text as RNText, StyleSheet, type TextProps as RNTextProps } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { typography, type TypographyVariant } from '@/theme';

type TextProps = RNTextProps & {
  variant?: TypographyVariant;
  color?: string;
  center?: boolean;
};

export function Text({
  variant = 'body',
  color,
  center,
  style,
  ...rest
}: TextProps): ReactElement {
  const { colors } = useTheme();
  return (
    <RNText
      style={[typography[variant], { color: color ?? colors.ink }, center && styles.center, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
});
