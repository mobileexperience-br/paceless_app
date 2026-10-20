import type { ReactElement } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Card } from '../Card';
import { Text } from '../Text';
import { useTheme, useThemedStyles } from '@/hooks/useTheme';
import type { Plan, PlanId } from '@/hooks/useOfferings';
import { createStyles, layout, radius } from '@/theme';

interface PlanSelectorProps {
  plans: Plan[];
  selectedId: PlanId | undefined;
  onSelect: (id: PlanId) => void;
}

export function PlanSelector({ plans, selectedId, onSelect }: PlanSelectorProps): ReactElement {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.plans}>
      {plans.map((plan) => {
        const active = plan.id === selectedId;
        return (
          <Pressable
            key={plan.id}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            onPress={() => { onSelect(plan.id); }}
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
  );
}

const makeStyles = createStyles((colors) =>
  StyleSheet.create({
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
  }),
);
