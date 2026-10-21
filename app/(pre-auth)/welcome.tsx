import type { ReactElement } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, SignInOverlay, SocialButton, Text } from '@/components';
import { useSocialSignIn } from '@/hooks/useSocialSignIn';
import { createStyles, layout, palettes, sizes, spacing } from '@/theme';
import { useTheme, useThemedStyles } from '@/hooks/useTheme';
import heroWelcome from '@/assets/hero-welcome.jpg';
import logoMark from '@/assets/logo-mark.png';

export default function WelcomeScreen(): ReactElement {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const social = useSocialSignIn();

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <Image source={heroWelcome} style={styles.hero} resizeMode="cover" />
      <View style={styles.scrim} />

      <SafeAreaView edges={['top', 'bottom', 'left', 'right']} style={styles.safe}>
        <View style={styles.brand}>
          <Image
            source={logoMark}
            style={styles.logoMark}
            resizeMode="contain"
          />
          <Text variant="body" center color={colors.white}>
            Seu treinador de bolso{'\n'}para começar a correr.
          </Text>
        </View>

        <View style={styles.actions}>
          <Button label="Criar conta" disabled={social.busy} onPress={() => { router.push('/onboarding'); }} />
          {social.appleSupported ? (
            <SocialButton
              provider="apple"
              disabled={social.busy}
              pending={social.provider === 'apple'}
              onPress={() => { void social.signInWithApple(); }}
            />
          ) : null}
          <SocialButton
            provider="google"
            disabled={social.busy}
            pending={social.provider === 'google'}
            onPress={() => { void social.signInWithGoogle(); }}
          />

          <Pressable
            accessibilityRole="button"
            disabled={social.busy}
            onPress={() => { router.push('/login'); }}
            style={styles.footer}
          >
            <Text variant="caption" color={colors.white}>
              Já tem uma conta?{' '}
            </Text>
            <Text variant="captionStrong" color={colors.primary}>
              Entrar
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
      <SignInOverlay visible={social.phase === 'exchanging'} />
    </View>
  );
}

const makeStyles = createStyles((colors) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: palettes.dark.background,
    },
    hero: {
      ...StyleSheet.absoluteFill,
      backgroundColor: colors.textSecondary,
    },
    scrim: {
      ...StyleSheet.absoluteFill,
      backgroundColor: colors.scrim,
    },
    safe: {
      flex: 1,
      justifyContent: 'flex-end',
      paddingHorizontal: layout.screenPadding,
      paddingBottom: spacing.xxl,
    },
    brand: {
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.huge,
    },
    logoMark: {
      width: sizes.logoMarkWidth,
      height: sizes.logoMarkHeight,
    },
    actions: {
      gap: spacing.md,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: spacing.sm,
    },
  }),
);
