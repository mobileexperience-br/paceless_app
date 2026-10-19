import { useState, type ReactElement } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CircleAlert } from 'lucide-react-native';
import {
  Button,
  Input,
  Screen,
  ScreenHeader,
  SocialButton,
  Text,
} from '@/components';
import { useSession } from '@/hooks/useSession';
import { validateCredentials } from '@/hooks/validateAuth';
import { colors, layout, spacing } from '@/theme';

export default function LoginScreen(): ReactElement {
  const router = useRouter();
  const { signIn } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (): Promise<void> => {
    const invalid = validateCredentials(email, password);
    if (invalid) {
      setError(invalid);
      return;
    }
    setError(null);
    setSubmitting(true);
    const result = await signIn(email.trim(), password);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.replace('/(app)');
  };

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
            value={email}
            onChangeText={setEmail}
          />
          <Input
            placeholder="Senha"
            autoComplete="current-password"
            secure
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {error ? (
          <View style={styles.error}>
            <CircleAlert size={16} color={colors.ink} strokeWidth={1.75} />
            <Text variant="caption" style={styles.errorText}>
              {error}
            </Text>
          </View>
        ) : null}

        <Button
          label={submitting ? 'Entrando...' : 'Entrar'}
          disabled={submitting}
          onPress={() => { void submit(); }}
        />

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
          onPress={() => { router.push('/signup'); }}
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
  error: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  errorText: {
    flex: 1,
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
