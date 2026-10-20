import { useCallback, useEffect, useState, type ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CircleAlert, MailCheck } from 'lucide-react-native';
import { Button, IconBadge, Screen, ScreenHeader, Text } from '@/components';
import { supabase } from '@/lib/supabase';
import { layout, spacing } from '@/theme';
import { useTheme } from '@/hooks/useTheme';

const COOLDOWN_SECONDS = 60;
const RESEND_ERROR = 'Não foi possível reenviar o e-mail. Tente novamente.';

export default function VerifyEmailScreen(): ReactElement {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = params.email ?? '';
  const [cooldown, setCooldown] = useState(COOLDOWN_SECONDS);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }
    const timer = setTimeout(() => { setCooldown(cooldown - 1); }, 1000);
    return (): void => { clearTimeout(timer); };
  }, [cooldown]);

  const resend = useCallback(async (): Promise<void> => {
    if (!supabase || !email) {
      setError(RESEND_ERROR);
      return;
    }
    setError(null);
    setSending(true);
    const { error: resendError } = await supabase.auth.resend({ type: 'signup', email });
    setSending(false);
    if (resendError) {
      setError(RESEND_ERROR);
      return;
    }
    setCooldown(COOLDOWN_SECONDS);
  }, [email]);

  const label = cooldown > 0 ? `Reenviar e-mail (${cooldown}s)` : 'Reenviar e-mail';

  return (
    <Screen flush scroll>
      <ScreenHeader />

      <View style={styles.body}>
        <View style={styles.intro}>
          <IconBadge>
            <MailCheck size={22} color={colors.primaryDeep} strokeWidth={1.75} />
          </IconBadge>
          <Text variant="title1">Confirme seu e-mail</Text>
          <Text variant="caption" color={colors.textSecondary}>
            Enviamos um link de confirmação para {email}. Abra o e-mail e toque no link para
            ativar sua conta.
          </Text>
        </View>

        {error ? (
          <View style={styles.error}>
            <CircleAlert size={16} color={colors.danger} strokeWidth={1.75} />
            <Text variant="caption" color={colors.danger} style={styles.errorText}>
              {error}
            </Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          <Button
            label={label}
            disabled={cooldown > 0 || sending}
            onPress={() => { void resend(); }}
          />
          <Button
            label="Voltar para o login"
            variant="text"
            onPress={() => { router.replace('/login'); }}
          />
        </View>
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
  error: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  errorText: {
    flex: 1,
  },
  actions: {
    gap: spacing.md,
  },
});
