import type { ReactElement } from 'react';
import { Image, Pressable, StyleSheet, type ImageSourcePropType, type ViewStyle } from 'react-native';
import logoApple from '@/assets/logo-apple.png';
import logoGoogle from '@/assets/logo-google.png';
import { Text } from './Text';
import { createStyles, layout, radius, spacing } from '@/theme';
import { useThemedStyles } from '@/hooks/useTheme';

type SocialProvider = 'apple' | 'google';

interface SocialButtonProps {
  provider: SocialProvider;
  onPress?: () => void;
  disabled?: boolean;
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

export function SocialButton({ provider, onPress, disabled, style }: SocialButtonProps): ReactElement {
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.button, pressed && styles.pressed, style]}
    >
      <Image source={logos[provider]} style={styles.logo} resizeMode="contain" />
      <Text variant="bodyStrong">{labels[provider]}</Text>
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
    logo: {
      width: 20,
      height: 20,
    },
  }),
);
