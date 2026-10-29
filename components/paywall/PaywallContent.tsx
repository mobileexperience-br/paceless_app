import { useState, type ReactElement } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { Button, IconBadge, SubscriptionDisclosure, Text } from '@/components';
import { PlanSelector } from '@/components/paywall/PlanSelector';
import { useOfferings, type PlanId } from '@/hooks/useOfferings';
import { usePremium, type PurchaseResult } from '@/hooks/usePremium';
import { subscriptionsUnavailableMessage } from '@/lib/platform/subscriptionsUnavailableMessage';
import { createStyles, layout, sizes, spacing } from '@/theme';
import { useTheme, useThemedStyles } from '@/hooks/useTheme';

const benefits = [
  'Plano de corrida personalizado',
  'Treinos de força e mobilidade',
  'Acompanhamento de nutrição',
  'Histórico e métricas completas',
];

export interface PaywallSecondaryAction {
  label: string;
  onPress: () => void;
}

interface PaywallContentProps {
  intro?: string | null;
  hint?: string;
  secondary?: PaywallSecondaryAction;
  onPurchased: () => void;
}

export function PaywallContent({ intro, hint, secondary, onPurchased }: PaywallContentProps): ReactElement {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { status, plans, reload } = useOfferings();
  const { busy, purchase, restore } = usePremium();
  const [selectedId, setSelectedId] = useState<PlanId>('annual');
  const [message, setMessage] = useState<string | null>(null);
  const selected = plans.find((plan) => plan.id === selectedId) ?? plans[0];
  const ready = status === 'ready' && selected !== undefined;

  const finish = (result: PurchaseResult): void => {
    setMessage(result.error);
    if (result.success) onPurchased();
  };

  return (
    <>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          {intro ? (
            <Text variant="bodyStrong" color={colors.primaryDeep}>
              {intro}
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
                <Check size={sizes.iconSm} color={colors.primaryDeep} strokeWidth={3} />
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
              onPress={() => {
                void purchase(selected.purchasePackage).then(finish);
              }}
            />
            <Button
              label="Restaurar compras"
              variant="text"
              disabled={busy}
              onPress={() => {
                void restore().then(finish);
              }}
            />
          </>
        ) : null}
        {secondary ? (
          <Button label={secondary.label} variant="text" disabled={busy} onPress={secondary.onPress} />
        ) : null}
        {hint ? (
          <Text variant="caption" color={colors.textSecondary} center>
            {hint}
          </Text>
        ) : null}
      </View>
    </>
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
      flexGrow: 1,
      flexShrink: 1,
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
