import { useState, type ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MailCheck } from 'lucide-react-native';
import { Button, IconBadge, Input, Screen, ScreenHeader, Text } from '@/components';
import { InlineError } from '@/components/InlineError';
import { useSession } from '@/hooks/useSession';
import { validateEmail } from '@/hooks/validateAuth';
import { layout, spacing } from '@/theme';
import { useTheme } from '@/hooks/useTheme';

export default function ForgotPasswordScreen(): ReactElement {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const { resetPassword } = useSession();
  const [email, setEmail] = useState(params.email ?? '');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const submit = async (): Promise<void> => {
    const invalid = validateEmail(email);
    if (invalid) {
      setError(invalid);
      return;
    }
    setError(null);
    setSubmitting(true);
    const result = await resetPassword(email.trim());
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSentTo(email.trim());
  };

  return (
    <Screen flush scroll>
      <ScreenHeader showBack />

      <View style={styles.body}>
        {sentTo ? (
          <>
            <View style={styles.intro}>
              <IconBadge>
                <MailCheck size={22} color={colors.primaryDeep} strokeWidth={1.75} />
              </IconBadge>
              <Text variant="title1">Verifique seu e-mail</Text>
              <Text
                variant="caption"
                color={colors.textSecondary}
                accessibilityLiveRegion="polite"
              >
                Enviamos um link para {sentTo}. Abra o e-mail e toque no link para criar uma nova
                senha.
              </Text>
            </View>
            <Button
              label="Voltar para o login"
              onPress={() => { router.replace('/login'); }}
            />
          </>
        ) : (
          <>
            <View style={styles.intro}>
              <Text variant="title1">Esqueceu a senha?</Text>
              <Text variant="caption" color={colors.textSecondary}>
                Informe seu e-mail e enviaremos um link para criar uma nova senha.
              </Text>
            </View>
            <Input
              label="E-mail"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              keyboardType="email-address"
              returnKeyType="send"
              error={error !== null}
              value={email}
              onChangeText={setEmail}
              onSubmitEditing={() => { void submit(); }}
            />
            <InlineError message={error} />
            <Button
              label={submitting ? 'Enviando...' : 'Enviar link'}
              disabled={submitting}
              onPress={() => { void submit(); }}
            />
          </>
        )}
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
    gap: spacing.md,
  },
});
