import type { ReactElement } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, SocialButton, Text } from '@/components';
import { colors, layout, spacing } from '@/theme';
import heroWelcome from '@/assets/hero-welcome.jpg';
import logoMark from '@/assets/logo-mark.png';

export default function WelcomeScreen(): ReactElement {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <Image source={heroWelcome} style={styles.hero} resizeMode="cover" />
      <View style={styles.scrim} />

      <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
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
          <Button label="Criar conta" onPress={() => { router.push('/onboarding'); }} />
          <SocialButton provider="apple" />
          <SocialButton provider="google" />

          <Pressable
            accessibilityRole="button"
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.ink,
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
    width: 220,
    height: 139,
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
});
