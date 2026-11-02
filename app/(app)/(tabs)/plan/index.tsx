import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Settings } from 'lucide-react-native';
import { Card, ListRow, Screen, ScreenTitle, Text } from '@/components';
import { NextSessionCard } from '@/components/plan/NextSessionCard';
import { NoPlanState, PlanError, PlanLoading } from '@/components/plan/PlanStates';
import { PlanHero } from '@/components/plan/PlanHero';
import { WeekList } from '@/components/plan/WeekList';
import { WeekStatusCard } from '@/components/plan/WeekStatusCard';
import { useActivePlan } from '@/hooks/useActivePlan';
import { usePlanWeekStatus } from '@/hooks/usePlanWeekStatus';
import { localToday } from '@/lib/planDates';
import { currentWeekNumber, findWeek, isPlanLocked, nextSession, planProgress } from '@/lib/planProgress';
import { createStyles, layout, sizes, spacing } from '@/theme';
import { useTheme, useThemedStyles } from '@/hooks/useTheme';

export default function PlanScreen(): ReactElement {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { plan, loading, error, reload } = useActivePlan();
  const week = usePlanWeekStatus();
  const today = localToday();

  const afterWeekAction = (action: () => Promise<void>): void => {
    void action().then(() => reload());
  };

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

  const weekNumber = currentWeekNumber(plan);
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

        {week.status !== null ? (
          <WeekStatusCard
            status={week.status}
            busy={week.busy}
            error={week.error}
            onAdvance={() => {
              afterWeekAction(week.advance);
            }}
            onRepeat={() => {
              afterWeekAction(week.repeat);
            }}
            onUnlock={() => {
              router.push('/plan-paywall');
            }}
          />
        ) : null}

        <NextSessionCard session={next} isToday={isToday} locked={isPlanLocked(plan)} />

        <Text variant="title3" style={styles.sectionTitle}>
          Semanas
        </Text>
        <WeekList plan={plan} />

        <Card flush>
          <ListRow
            title="Configurações do plano"
            leading={<Settings size={sizes.iconLg} color={colors.ink} strokeWidth={sizes.iconStroke} />}
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
