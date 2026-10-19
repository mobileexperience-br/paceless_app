import { Text as RNText, StyleSheet, type TextProps as RNTextProps } from 'react-native';
import { colors, typography, type TypographyVariant } from '@/theme';

type TextProps = RNTextProps & {
  variant?: TypographyVariant;
  color?: string;
  center?: boolean;
};

export function Text({
  variant = 'body',
  color = colors.ink,
  center,
  style,
  ...rest
}: TextProps) {
  return (
    <RNText
      style={[typography[variant], { color }, center && styles.center, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
});
