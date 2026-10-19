import { Image, Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { Text } from './Text';
import { colors, layout, radius, spacing } from '@/theme';

type SocialProvider = 'apple' | 'google';

type SocialButtonProps = {
  provider: SocialProvider;
  onPress?: () => void;
  style?: ViewStyle;
};

const labels: Record<SocialProvider, string> = {
  apple: 'Continuar com Apple',
  google: 'Continuar com Google',
};

const logos: Record<SocialProvider, number> = {
  apple: require('@/assets/logo-apple.png'),
  google: require('@/assets/logo-google.png'),
};

export function SocialButton({ provider, onPress, style }: SocialButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed, style]}
    >
      <Image source={logos[provider]} style={styles.logo} resizeMode="contain" />
      <Text variant="bodyStrong">{labels[provider]}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
});
