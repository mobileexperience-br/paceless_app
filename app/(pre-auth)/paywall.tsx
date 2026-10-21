import { useState, type ReactElement } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import {
  Button,
  IconBadge,
  Screen,
  ScreenHeader,
  SubscriptionDisclosure,
  Text,
} from '@/components';
import { PlanSelector } from '@/components/paywall/PlanSelector';
import { useOfferings, type PlanId } from '@/hooks/useOfferings';
import { useOnboarding } from '@/hooks/useOnboarding';
import { usePremium, type PurchaseResult } from '@/hooks/usePremium';
import { summarizeAnswers } from '@/lib/onboardingSteps';
import { subscriptionsUnavailableMessage } from '@/lib/platform/subscriptionsUnavailableMessage';
import { createStyles, layout, spacing } from '@/theme';
import { useTheme, useThemedStyles } from '@/hooks/useTheme';

const benefits = [
  'Plano de corrida personalizado',
  'Treinos de força e mobilidade',
  'Acompanhamento de nutrição',
  'Histórico e métricas completas',
];

export default function PaywallScreen(): ReactElement {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { status, plans, reload } = useOfferings();
  const { busy, purchase, restore } = usePremium();
  const { answers } = useOnboarding();
  const [selectedId, setSelectedId] = useState<PlanId>('annual');
  const [message, setMessage] = useState<string | null>(null);
  const selected = plans.find((plan) => plan.id === selectedId) ?? plans[0];
  const ready = status === 'ready' && selected !== undefined;
  const summary = summarizeAnswers(answers);

  const finish = (result: PurchaseResult): void => {
    setMessage(result.error);
    if (result.success) {
      router.replace('/signup');
    }
  };

  const handlePurchase = (): void => {
    if (selected) {
      void purchase(selected.purchasePackage).then(finish);
    }
  };

  const handleRestore = (): void => {
    void restore().then(finish);
  };

  return (
    <Screen flush>
      <ScreenHeader showBack />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          {summary ? (
            <Text variant="bodyStrong" color={colors.primaryDeep}>
              {summary}
            </Text>
          ) : null}
          <Text variant="title1">Destrave o Paceless</Text>
          <Text variant="body" color={colors.textSecondary}>
            Seu plano completo, ajustado semana a semana.
          </Text>
        </View>

        <View style={styles.benefits}>
          {benefits.map((benefit) => (
            <View key={benefit} style={styles.benefit}>
              <IconBadge tone="soft" size={28}>
                <Check size={16} color={colors.primaryDeep} strokeWidth={3} />
              </IconBadge>
              <Text variant="body" style={styles.benefitLabel}>
                {benefit}
              </Text>
            </View>
          ))}
        </View>

        {status === 'loading' ? (
          <View style={styles.status}>
            <ActivityIndicator accessibilityLabel="Carregando planos" color={colors.primaryDeep} />
          </View>
        ) : null}

        {status === 'unavailable' ? (
          <Text variant="body" color={colors.textSecondary}>
            {subscriptionsUnavailableMessage}
          </Text>
        ) : null}

        {status === 'error' ? (
          <View style={styles.status}>
            <Text variant="body" color={colors.danger}>
              Não foi possível carregar os planos.
            </Text>
            <Button label="Tentar novamente" variant="text" onPress={reload} />
          </View>
        ) : null}

        {status === 'ready' ? (
          <PlanSelector plans={plans} selectedId={selected?.id} onSelect={setSelectedId} />
        ) : null}

        {ready ? <SubscriptionDisclosure plan={selected} /> : null}
      </ScrollView>

      <View style={styles.footer}>
        {message ? (
          <View accessibilityRole="alert" accessibilityLiveRegion="polite">
            <Text variant="caption" color={colors.danger} center>
              {message}
            </Text>
          </View>
        ) : null}
        {ready ? (
          <>
            <Button
              label={busy ? 'Processando...' : 'Assinar'}
              disabled={busy}
              onPress={handlePurchase}
            />
            <Button
              label="Restaurar compras"
              variant="text"
              disabled={busy}
              onPress={handleRestore}
            />
          </>
        ) : null}
        <Button
          label="Agora não"
          variant="text"
          disabled={busy}
          onPress={() => { router.replace('/signup'); }}
        />
        <Text variant="caption" color={colors.textSecondary} center>
          Você pode assinar depois pelo perfil.
        </Text>
      </View>
    </Screen>
  );
}

const makeStyles = createStyles(() =>
  StyleSheet.create({
    scroll: {
      flex: 1,
    },
    body: {
      paddingHorizontal: layout.screenPadding,
      paddingTop: spacing.xxl,
      paddingBottom: spacing.xxl,
      gap: spacing.xxl,
    },
    intro: {
      gap: spacing.sm,
    },
    benefits: {
      gap: spacing.md,
    },
    benefit: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    benefitLabel: {
      flex: 1,
    },
    status: {
      alignItems: 'center',
      gap: spacing.sm,
    },
    footer: {
      paddingHorizontal: layout.screenPadding,
      paddingBottom: spacing.xxl,
      gap: spacing.xs,
    },
  }),
);
