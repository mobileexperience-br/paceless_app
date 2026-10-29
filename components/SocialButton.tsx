import type { ReactElement } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, type ImageSourcePropType, type ViewStyle } from 'react-native';
import logoApple from '@/assets/logo-apple.png';
import logoGoogle from '@/assets/logo-google.png';
import { Text } from './Text';
import { createStyles, layout, radius, sizes, spacing } from '@/theme';
import { useTheme, useThemedStyles } from '@/hooks/useTheme';

type SocialProvider = 'apple' | 'google';

interface SocialButtonProps {
  provider: SocialProvider;
  onPress?: () => void;
  disabled?: boolean;
  pending?: boolean;
  style?: ViewStyle;
}

const labels: Record<SocialProvider, string> = {
  apple: 'Continuar com Apple',
  google: 'Continuar com Google',
};

const logos: Record<SocialProvider, ImageSourcePropType> = {
  apple: logoApple,
  google: logoGoogle,
};

export function SocialButton({ provider, onPress, disabled, pending, style }: SocialButtonProps): ReactElement {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  const blocked = disabled === true || pending === true;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={blocked}
      accessibilityState={{ disabled: blocked, busy: pending === true }}
      accessibilityLabel={pending ? 'Conectando' : labels[provider]}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        disabled && !pending && styles.disabled,
        style,
      ]}
    >
      {pending ? (
        <ActivityIndicator color={colors.primaryDeep} size="small" style={styles.logo} />
      ) : (
        <Image source={logos[provider]} style={styles.logo} resizeMode="contain" />
      )}
      <Text variant="bodyStrong">{pending ? 'Conectando...' : labels[provider]}</Text>
    </Pressable>
  );
}

const makeStyles = createStyles((colors) =>
  StyleSheet.create({
    button: {
      height: layout.controlHeight,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.md,
    },
    pressed: {
      backgroundColor: colors.track,
    },
    disabled: {
      opacity: 0.4,
    },
    logo: {
      width: sizes.iconMd,
      height: sizes.iconMd,
    },
  }),
);
