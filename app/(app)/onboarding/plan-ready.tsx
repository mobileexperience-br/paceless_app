import { useEffect, useRef, type ReactElement } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AlertTriangle, CalendarCheck, ClipboardList, Hourglass } from 'lucide-react-native';
import { Button, InlineError, Screen, Text } from '@/components';
import { useCompleteOnboarding } from '@/hooks/useCompleteOnboarding';
import { useTheme, useThemedStyles } from '@/hooks/useTheme';
import { onboardingSteps } from '@/lib/onboardingSteps';
import { createStyles, layout, sizes, spacing } from '@/theme';

export default function PlanReadyScreen(): ReactElement {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { status, error, missingStep, run } = useCompleteOnboarding();
  const started = useRef(false);
  const missingTitle = onboardingSteps.find((step) => step.key === missingStep)?.title ?? '';

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void run();
  }, [run]);

  const retry = (): void => {
    void run();
  };

  return (
    <Screen flush>
      <View style={styles.body}>
        {status === 'ready' ? (
          <>
            <CalendarCheck size={sizes.iconHero} color={colors.primaryDeep} strokeWidth={sizes.iconStroke} />
            <Text variant="title1" center>
              Seu plano está pronto
            </Text>
            <Text variant="body" center color={colors.textSecondary}>
              São 8 semanas para você chegar aos 5 km no seu ritmo. As 2 primeiras já estão liberadas.
            </Text>
            <Button
              label="Continuar"
              style={styles.cta}
              onPress={() => {
                router.replace('/plan-paywall');
              }}
            />
          </>
        ) : null}

        {status === 'unavailable' ? (
          <>
            <Hourglass size={sizes.iconHero} color={colors.textSecondary} strokeWidth={sizes.iconStroke} />
            <Text variant="title1" center>
              Seu plano ainda não está disponível
            </Text>
            <Text variant="body" center color={colors.textSecondary}>
              Por enquanto, o plano é para quem está começando. Avisaremos quando houver um plano para o seu
              nível. Você pode mudar seu nível em Configurações do plano.
            </Text>
            <Button
              label="Ir para o início"
              style={styles.cta}
              onPress={() => {
                router.replace('/(app)');
              }}
            />
          </>
        ) : null}

        {status === 'incomplete' ? (
          <>
            <ClipboardList size={sizes.iconHero} color={colors.primaryDeep} strokeWidth={sizes.iconStroke} />
            <Text variant="title1" center>
              Falta uma etapa do seu plano
            </Text>
            <Text variant="body" center color={colors.textSecondary}>
              Responda &quot;{missingTitle}&quot; para montarmos seu plano.
            </Text>
            <Button
              label="Responder etapa"
              style={styles.cta}
              onPress={() => {
                router.replace('/onboarding');
              }}
            />
          </>
        ) : null}

        {status === 'failed' ? (
          <>
            <AlertTriangle size={sizes.iconHero} color={colors.danger} strokeWidth={sizes.iconStroke} />
            <Text variant="title1" center>
              Não foi possível montar seu plano
            </Text>
            <InlineError message={error} />
            <Button label="Tentar novamente" style={styles.cta} onPress={retry} />
          </>
        ) : null}

        {status === 'idle' || status === 'generating' ? (
          <>
            <ActivityIndicator size="large" color={colors.primaryDeep} accessibilityLabel="Montando seu plano" />
            <Text variant="title2" center>
              Montando seu plano...
            </Text>
          </>
        ) : null}
      </View>
    </Screen>
  );
}

const makeStyles = createStyles(() =>
  StyleSheet.create({
    body: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.md,
      paddingHorizontal: layout.screenPadding,
    },
    cta: {
      alignSelf: 'stretch',
    },
  }),
);
