import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CalendarDays, CircleCheck, Lock } from 'lucide-react-native';
import { Card, ListRow } from '@/components';
import { PremiumLockCard } from '@/components/plan/PremiumLockCard';
import { createStyles, sizes, spacing } from '@/theme';
import { useTheme, useThemedStyles } from '@/hooks/useTheme';
import type { ActivePlan } from '@/types/training';

interface WeekListProps {
  plan: ActivePlan;
}

const lockedSubtitle = 'Disponível no Premium';

export function WeekList({ plan }: WeekListProps): ReactElement {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const isFree = plan.tier === 'free';
  const hasLocked = isFree && plan.fullWeeks > plan.weeks.length;
  const lockedNumbers = hasLocked
    ? Array.from({ length: plan.fullWeeks - plan.weeks.length }, (_, index) => plan.weeks.length + index + 1)
    : [];

  return (
    <View style={styles.wrapper}>
      {isFree ? (
        <PremiumLockCard
          freeWeeks={plan.weeks.length}
          fullWeeks={plan.fullWeeks}
          locked={hasLocked}
        />
      ) : null}
      <Card flush>
        {plan.weeks.map((week, index) => {
          const complete = week.total > 0 && week.done === week.total;
          const isLast = index === plan.weeks.length - 1 && lockedNumbers.length === 0;
          return (
            <ListRow
              key={week.weekNumber}
              title={`Semana ${String(week.weekNumber)}`}
              subtitle={week.title}
              value={`${String(week.done)}/${String(week.total)}`}
              leading={
                complete ? (
                  <CircleCheck size={sizes.iconTab} color={colors.primaryDeep} strokeWidth={sizes.iconStroke} />
                ) : (
                  <CalendarDays size={sizes.iconTab} color={colors.ink} strokeWidth={sizes.iconStroke} />
                )
              }
              showChevron
              divider={!isLast}
              onPress={() => {
                router.push(`/plan/week/${String(week.weekNumber)}`);
              }}
            />
          );
        })}
        {lockedNumbers.map((weekNumber, index) => (
          <ListRow
            key={weekNumber}
            title={`Semana ${String(weekNumber)}`}
            subtitle={lockedSubtitle}
            accessibilityLabel={`Semana ${String(weekNumber)}, bloqueada. ${lockedSubtitle}`}
            accessibilityHint="Abre a assinatura"
            accessibilityState={{ disabled: true }}
            leading={<Lock size={sizes.iconTab} color={colors.textSecondary} strokeWidth={sizes.iconStroke} />}
            showChevron
            divider={index < lockedNumbers.length - 1}
            onPress={() => {
              router.push('/plan-paywall');
            }}
          />
        ))}
      </Card>
    </View>
  );
}

const makeStyles = createStyles(() =>
  StyleSheet.create({
    wrapper: {
      gap: spacing.md,
    },
  }),
);
