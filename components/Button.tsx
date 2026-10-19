import { type ReactNode, type ReactElement } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { Text } from './Text';
import { colors, layout, radius, spacing } from '@/theme';

type ButtonVariant = 'primary' | 'secondary' | 'text';

interface ButtonProps {
  label: string;
  variant?: ButtonVariant;
  icon?: ReactNode;
  disabled?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export function Button({
  label,
  variant = 'primary',
  icon,
  disabled,
  onPress,
  style,
}: ButtonProps): ReactElement {
  const isText = variant === 'text';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        isText && styles.textBase,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'primary' && pressed && styles.primaryPressed,
        variant === 'secondary' && pressed && styles.secondaryPressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text
        variant={isText ? 'body' : 'bodyStrong'}
        color={variant === 'text' ? colors.primaryDeep : colors.ink}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: layout.controlHeight,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBase: {
    height: undefined,
    paddingVertical: spacing.sm,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  primaryPressed: {
    backgroundColor: colors.primaryPressed,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryPressed: {
    backgroundColor: colors.track,
  },
  disabled: {
    opacity: 0.4,
  },
  icon: {
    marginRight: spacing.sm,
  },
});
