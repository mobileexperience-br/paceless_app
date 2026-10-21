import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { SelectableCard } from './SelectableCard';
import { Text } from '../Text';
import { useTheme, useThemedStyles } from '@/hooks/useTheme';
import type { Plan, PlanId } from '@/hooks/useOfferings';
import { createStyles, layout } from '@/theme';

interface PlanSelectorProps {
  plans: Plan[];
  selectedId: PlanId | undefined;
  onSelect: (id: PlanId) => void;
}

export function PlanSelector({ plans, selectedId, onSelect }: PlanSelectorProps): ReactElement {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <View accessibilityRole="radiogroup" style={styles.plans}>
      {plans.map((plan) => (
        <SelectableCard
          key={plan.id}
          active={plan.id === selectedId}
          onPress={() => { onSelect(plan.id); }}
          pressableStyle={styles.planPressable}
        >
          <Text variant="bodyStrong">{plan.title}</Text>
          <Text variant="title2">{plan.price}</Text>
          {plan.note ? (
            <Text variant="caption" color={colors.primaryDeep}>
              {plan.note}
            </Text>
          ) : null}
        </SelectableCard>
      ))}
    </View>
  );
}

const makeStyles = createStyles(() =>
  StyleSheet.create({
    plans: {
      flexDirection: 'row',
      gap: layout.cardGap,
    },
    planPressable: {
      flex: 1,
    },
  }),
);
