import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Settings } from 'lucide-react-native';
import { Card, ListRow, Screen, ScreenTitle, Text } from '@/components';
import { NextSessionCard } from '@/components/plan/NextSessionCard';
import { NoPlanState, PlanError, PlanLoading } from '@/components/plan/PlanStates';
import { PlanHero } from '@/components/plan/PlanHero';
import { WeekList } from '@/components/plan/WeekList';
import { useActivePlan } from '@/hooks/useActivePlan';
import { localToday } from '@/lib/planDates';
import { currentWeekNumber, findWeek, isPlanLocked, nextSession, planProgress } from '@/lib/planProgress';
import { createStyles, layout, sizes, spacing } from '@/theme';
import { useTheme, useThemedStyles } from '@/hooks/useTheme';

export default function PlanScreen(): ReactElement {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { plan, loading, error, reload } = useActivePlan();
  const today = localToday();

  if (plan === null) {
    return (
      <Screen scroll flush>
        <ScreenTitle title="Plano" />
        <View style={styles.body}>
          {loading ? <PlanLoading /> : null}
          {!loading && error ? <PlanError message={error} onRetry={() => { void reload(); }} /> : null}
          {!loading && !error ? <NoPlanState /> : null}
        </View>
      </Screen>
    );
  }

  const weekNumber = currentWeekNumber(plan, today);
  const currentWeek = findWeek(plan, weekNumber);
  const progress = planProgress(plan);
  const next = nextSession(plan, today);
  const isToday = next?.date === today;

  return (
    <Screen scroll flush>
      <ScreenTitle title="Plano" />
      <View style={styles.body}>
        <PlanHero
          name={plan.name}
          weekNumber={weekNumber}
          fullWeeks={plan.fullWeeks}
          weekTitle={currentWeek?.title ?? ''}
          done={progress.done}
          total={progress.total}
        />

        <NextSessionCard session={next} isToday={isToday} locked={isPlanLocked(plan)} />

        <Text variant="title3" style={styles.sectionTitle}>
          Semanas
        </Text>
        <WeekList plan={plan} />

        <Card flush>
          <ListRow
            title="Configurações do plano"
            leading={<Settings size={sizes.iconTab} color={colors.ink} strokeWidth={sizes.iconStroke} />}
            showChevron
            onPress={() => {
              router.push('/plan/settings');
            }}
          />
        </Card>
      </View>
    </Screen>
  );
}

const makeStyles = createStyles(() =>
  StyleSheet.create({
    body: {
      paddingHorizontal: layout.screenPadding,
      gap: layout.cardGap,
    },
    sectionTitle: {
      marginTop: spacing.sm,
    },
  }),
);
