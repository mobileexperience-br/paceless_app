import { useRef, useState, type ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Button,
  Input,
  Screen,
  ScreenHeader,
  SignInOverlay,
  SocialButton,
  Text,
} from '@/components';
import { FooterLink } from '@/components/FooterLink';
import { InlineError } from '@/components/InlineError';
import type { InputRef } from '@/components/Input';
import { useSession } from '@/hooks/useSession';
import { useSocialSignIn } from '@/hooks/useSocialSignIn';
import { validateCredentials } from '@/hooks/validateAuth';
import { createStyles, layout, sizes, spacing } from '@/theme';
import { useTheme, useThemedStyles } from '@/hooks/useTheme';

export default function LoginScreen(): ReactElement {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { signIn } = useSession();
  const passwordRef = useRef<InputRef>(null);
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
            label="E-mail"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            keyboardType="email-address"
            returnKeyType="next"
            submitBehavior="submit"
            error={error !== null}
            value={email}
            onChangeText={setEmail}
            onSubmitEditing={() => { passwordRef.current?.focus(); }}
          />
          <Input
            label="Senha"
            inputRef={passwordRef}
            autoCapitalize="none"
            autoComplete="current-password"
            textContentType="password"
            returnKeyType="go"
            secure
            error={error !== null}
            value={password}
            onChangeText={setPassword}
            onSubmitEditing={() => { void submit(); }}
          />
          <FooterLink
            action="Esqueci minha senha"
            disabled={social.busy}
            onPress={() => { router.push({ pathname: '/forgot-password', params: { email } }); }}
          />
        </View>

        <InlineError message={error} />

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

        <FooterLink
          prompt="Não tem conta?"
          action="Criar conta"
          disabled={social.busy}
          onPress={() => { router.push('/signup'); }}
        />
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
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    line: {
      flex: 1,
      height: sizes.hairline,
      backgroundColor: colors.border,
    },
    social: {
      gap: spacing.md,
    },
  }),
);
