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

/**
 * Mesma anatomia da tela de cadastro do mockup, sem o campo de nome e sem o
 * indicador de passo.
 */
export default function LoginScreen() {
  const router = useRouter();

  return (
    <Screen flush scroll>
      <ScreenHeader showBack />

      <View style={styles.body}>
        <View style={styles.intro}>
          <Text variant="title1">Que bom te ver de volta</Text>
          <Text variant="caption" color={colors.textSecondary}>
            Entre para continuar seu plano.
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            placeholder="E-mail"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
          />
          <Input placeholder="Senha" autoComplete="current-password" secure />
        </View>

        <Button label="Entrar" onPress={() => router.replace('/(app)')} />

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
          onPress={() => router.push('/signup')}
          style={styles.footer}
        >
          <Text variant="caption" color={colors.textSecondary}>
            Não tem conta?{' '}
          </Text>
          <Text variant="captionStrong" color={colors.primaryDeep}>
            Criar conta
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
