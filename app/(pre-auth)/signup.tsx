import { useRef, useState, type ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
import { LegalNotice } from '@/components/LegalNotice';
import { useSession } from '@/hooks/useSession';
import { useSocialSignIn } from '@/hooks/useSocialSignIn';
import { validateSignUp } from '@/hooks/validateAuth';
import { createStyles, layout, spacing } from '@/theme';
import { useTheme, useThemedStyles } from '@/hooks/useTheme';

export default function SignUpScreen(): ReactElement {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const params = useLocalSearchParams<{ name?: string; email?: string }>();
  const { signUp } = useSession();
  const emailRef = useRef<InputRef>(null);
  const passwordRef = useRef<InputRef>(null);
  const [name, setName] = useState(params.name ?? '');
  const [email, setEmail] = useState(params.email ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const social = useSocialSignIn();

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
      router.replace({
        pathname: '/verify-email',
        params: { email: email.trim(), name: name.trim() },
      });
      return;
    }
    router.replace('/(app)');
  };

  return (
    <Screen flush scroll>
      <ScreenHeader showBack />

      <View style={styles.body}>
        <View style={styles.intro}>
          <Text variant="title1">Vamos criar sua conta</Text>
          <Text variant="caption" color={colors.textSecondary}>
            Leva menos de um minuto.
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Nome completo"
            autoComplete="name"
            textContentType="name"
            autoCapitalize="words"
            returnKeyType="next"
            submitBehavior="submit"
            value={name}
            onChangeText={setName}
            onSubmitEditing={() => { emailRef.current?.focus(); }}
          />
          <Input
            label="E-mail"
            inputRef={emailRef}
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            keyboardType="email-address"
            returnKeyType="next"
            submitBehavior="submit"
            value={email}
            onChangeText={setEmail}
            onSubmitEditing={() => { passwordRef.current?.focus(); }}
          />
          <Input
            label="Senha"
            helper="Mínimo de 6 caracteres"
            inputRef={passwordRef}
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="go"
            secure
            value={password}
            onChangeText={setPassword}
            onSubmitEditing={() => { void submit(); }}
          />
        </View>

        <InlineError message={error} />

        <Button
          label={submitting ? 'Criando conta...' : 'Criar conta'}
          disabled={submitting || social.busy}
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
          prompt="Já tem uma conta?"
          action="Entrar"
          disabled={social.busy}
          onPress={() => { router.push('/login'); }}
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
      height: 1,
      backgroundColor: colors.border,
    },
    social: {
      gap: spacing.md,
    },
  }),
);
