import { useState, type ReactElement } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
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
import { usePremium, type PurchaseResult } from '@/hooks/usePremium';
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
  const [selectedId, setSelectedId] = useState<PlanId>('annual');
  const [message, setMessage] = useState<string | null>(null);
  const selected = plans.find((plan) => plan.id === selectedId) ?? plans[0];
  const ready = status === 'ready' && selected !== undefined;

  const finish = (result: PurchaseResult): void => {
    setMessage(result.error);
    if (result.success) {
      router.push('/signup');
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
    <Screen flush scroll>
      <ScreenHeader showBack />

      <View style={styles.body}>
        <View style={styles.intro}>
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
            <ActivityIndicator color={colors.primaryDeep} />
          </View>
        ) : null}

        {status === 'unavailable' ? (
          <Text variant="body" color={colors.textSecondary}>
            Assinaturas indisponíveis no momento.
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

        {message ? (
          <Text variant="caption" color={colors.danger}>
            {message}
          </Text>
        ) : null}
      </View>

      <View style={styles.footer}>
        {ready ? (
          <>
            <Button label="Assinar" disabled={busy} onPress={handlePurchase} />
            <Button
              label="Restaurar compras"
              variant="text"
              disabled={busy}
              onPress={handleRestore}
            />
          </>
        ) : null}
        <Button
          label="Continuar sem assinar"
          variant="text"
          onPress={() => { router.push('/signup'); }}
        />
      </View>
    </Screen>
  );
}

const makeStyles = createStyles(() =>
  StyleSheet.create({
    body: {
      flex: 1,
      paddingHorizontal: layout.screenPadding,
      paddingTop: spacing.xxl,
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
