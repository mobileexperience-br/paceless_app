import { useState, type ReactElement } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { Button, Card, IconBadge, Screen, ScreenHeader, Text } from '@/components';
import { colors, layout, radius, spacing } from '@/theme';

const benefits = [
  'Plano de corrida personalizado',
  'Treinos de força e mobilidade',
  'Acompanhamento de nutrição',
  'Histórico e métricas completas',
];

const plans = [
  { id: 'annual', title: 'Anual', price: '—', note: 'Melhor valor' },
  { id: 'monthly', title: 'Mensal', price: '—', note: '' },
] as const;

export default function PaywallScreen(): ReactElement {
  const router = useRouter();
  const [selected, setSelected] = useState<string>(plans[0].id);

  return (
    <Screen flush>
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

        <View style={styles.plans}>
          {plans.map((plan) => {
            const active = plan.id === selected;
            return (
              <Pressable
                key={plan.id}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                onPress={() => { setSelected(plan.id); }}
                style={styles.planPressable}
              >
                <Card style={[styles.plan, active && styles.planActive]}>
                  <Text variant="bodyStrong">{plan.title}</Text>
                  <Text variant="title2">{plan.price}</Text>
                  {plan.note ? (
                    <Text variant="caption" color={colors.primaryDeep}>
                      {plan.note}
                    </Text>
                  ) : null}
                </Card>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        <Button label="Assinar" onPress={() => { router.push('/signup'); }} />
        <Button
          label="Continuar sem assinar"
          variant="text"
          onPress={() => { router.push('/signup'); }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  plans: {
    flexDirection: 'row',
    gap: layout.cardGap,
  },
  planPressable: {
    flex: 1,
  },
  plan: {
    flex: 1,
    borderWidth: 2,
    borderRadius: radius.lg,
  },
  planActive: {
    borderColor: colors.primary,
  },
  footer: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing.xxl,
    gap: spacing.xs,
  },
});
