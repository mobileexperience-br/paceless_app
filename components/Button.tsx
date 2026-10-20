import { type ReactNode, type ReactElement } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { Text } from './Text';
import { createStyles, layout, type Palette, radius, spacing } from '@/theme';
import { useTheme, useThemedStyles } from '@/hooks/useTheme';

type ButtonVariant = 'primary' | 'secondary' | 'text' | 'danger';

interface ButtonProps {
  label: string;
  variant?: ButtonVariant;
  icon?: ReactNode;
  disabled?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

function labelColor(variant: ButtonVariant, colors: Palette): string {
  if (variant === 'text') return colors.primaryDeep;
  if (variant === 'danger') return colors.danger;
  return variant === 'primary' ? colors.onPrimary : colors.ink;
}

export function Button({
  label,
  variant = 'primary',
  icon,
  disabled,
  onPress,
  style,
}: ButtonProps): ReactElement {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
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
        variant === 'danger' && styles.danger,
        variant === 'primary' && pressed && styles.primaryPressed,
        (variant === 'secondary' || variant === 'danger') && pressed && styles.secondaryPressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text
        variant={isText ? 'body' : 'bodyStrong'}
        color={labelColor(variant, colors)}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const makeStyles = createStyles((colors) =>
  StyleSheet.create({
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
    danger: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.danger,
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
  }),
);
