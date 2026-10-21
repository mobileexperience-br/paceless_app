import { useState, type ReactElement } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CircleAlert } from 'lucide-react-native';
import {
  Button,
  Input,
  Screen,
  ScreenHeader,
  SignInOverlay,
  SocialButton,
  Text,
} from '@/components';
import { useSession } from '@/hooks/useSession';
import { useSocialSignIn } from '@/hooks/useSocialSignIn';
import { validateCredentials } from '@/hooks/validateAuth';
import { createStyles, layout, spacing } from '@/theme';
import { useTheme, useThemedStyles } from '@/hooks/useTheme';

export default function LoginScreen(): ReactElement {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { signIn } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const social = useSocialSignIn();

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
            <CircleAlert size={16} color={colors.danger} strokeWidth={1.75} />
            <Text variant="caption" color={colors.danger} style={styles.errorText}>
              {error}
            </Text>
          </View>
        ) : null}

        <Button
          label={submitting ? 'Entrando...' : 'Entrar'}
          disabled={submitting || social.busy}
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
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={social.busy}
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
      <SignInOverlay visible={social.phase === 'exchanging'} />
    </Screen>
  );
}

const makeStyles = createStyles((colors) =>
  StyleSheet.create({
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
  }),
);
