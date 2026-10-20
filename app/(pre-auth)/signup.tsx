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
import { LegalNotice } from '@/components/LegalNotice';
import { useSession } from '@/hooks/useSession';
import { useSocialSignIn, type SocialResult } from '@/hooks/useSocialSignIn';
import { validateSignUp } from '@/hooks/validateAuth';
import { createStyles, layout, spacing } from '@/theme';
import { useTheme, useThemedStyles } from '@/hooks/useTheme';

export default function SignUpScreen(): ReactElement {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { signUp } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const social = useSocialSignIn();

  const handleSocial = async (action: () => Promise<SocialResult>): Promise<void> => {
    setError(null);
    const result = await action();
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.signedIn) {
      router.replace('/(app)');
    }
  };

  const submit = async (): Promise<void> => {
    const invalid = validateSignUp(name, email, password);
    if (invalid) {
      setError(invalid);
      return;
    }
    setError(null);
    setSubmitting(true);
    const result = await signUp(name.trim(), email.trim(), password);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.needsConfirmation) {
      router.replace({ pathname: '/verify-email', params: { email: email.trim() } });
      return;
    }
    router.replace('/(app)');
  };

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
          <Input
            placeholder="Nome completo"
            autoComplete="name"
            value={name}
            onChangeText={setName}
          />
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
            autoComplete="new-password"
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
          label={submitting ? 'Criando conta...' : 'Criar conta'}
          disabled={submitting}
          onPress={() => { void submit(); }}
        />

        <LegalNotice />

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
              disabled={social.loading !== null}
              onPress={() => { void handleSocial(social.signInWithApple); }}
            />
          ) : null}
          <SocialButton
            provider="google"
            disabled={social.loading !== null}
            onPress={() => { void handleSocial(social.signInWithGoogle); }}
          />
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => { router.push('/login'); }}
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
