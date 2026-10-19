import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Button,
  Input,
  Screen,
  ScreenHeader,
  SocialButton,
  Text,
} from '@/components';
import { colors, layout, spacing } from '@/theme';

export default function SignUpScreen() {
  const router = useRouter();

  return (
    <Screen flush scroll>
      <ScreenHeader showBack centerLabel="1 / 4" />

      <View style={styles.body}>
        <View style={styles.intro}>
          <Text variant="title1">Vamos criar sua conta</Text>
          <Text variant="caption" color={colors.textSecondary}>
            É rápido e fácil.
          </Text>
        </View>

        <View style={styles.form}>
          <Input placeholder="Nome completo" autoComplete="name" />
          <Input
            placeholder="E-mail"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
          />
          <Input placeholder="Senha" autoComplete="new-password" secure />
        </View>

        <Button label="Criar conta" onPress={() => router.replace('/(app)')} />

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text variant="caption" color={colors.textSecondary}>
            ou
          </Text>
          <View style={styles.line} />
        </View>

        <View style={styles.social}>
          <SocialButton provider="apple" />
          <SocialButton provider="google" />
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/login')}
          style={styles.footer}
        >
          <Text variant="caption" color={colors.textSecondary}>
            Já tem uma conta?{' '}
          </Text>
          <Text variant="captionStrong" color={colors.primaryDeep}>
            Entrar
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.lg,
    gap: spacing.xxl,
  },
  intro: {
    gap: spacing.xs,
  },
  form: {
    gap: spacing.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  social: {
    gap: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
