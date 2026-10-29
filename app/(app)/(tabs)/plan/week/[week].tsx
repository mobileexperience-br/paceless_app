import type { ReactElement } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Lock } from 'lucide-react-native';
import {
  Button,
  EmptyState,
  ProgressBar,
  Screen,
  ScreenHeader,
  Text,
} from '@/components';
import { DayRow } from '@/components/plan/DayRow';
import { NoPlanState, PlanError, PlanLoading } from '@/components/plan/PlanStates';
import { useActivePlan } from '@/hooks/useActivePlan';
import { localToday } from '@/lib/planDates';
import { findWeek, weekDays, weekStartDate } from '@/lib/planProgress';
import { createStyles, layout, sizes, spacing } from '@/theme';
import { useTheme, useThemedStyles } from '@/hooks/useTheme';
import type { ActivePlan, PlanWeek } from '@/types/training';

function parseWeekNumber(raw: string | undefined): number | null {
  if (raw === undefined || !/^\d+$/.test(raw)) return null;
  const value = Number(raw);
  return value >= 1 ? value : null;
}

export default function WeekScreen(): ReactElement {
  const { week } = useLocalSearchParams<{ week: string }>();
  const weekNumber = parseWeekNumber(week);
  const { plan, loading, error, reload } = useActivePlan();

  if (plan === null) {
    return (
      <Screen flush>
        <ScreenHeader showBack title="Semana" />
        {loading ? <PlanLoading /> : null}
        {!loading && error ? <PlanError message={error} onRetry={() => { void reload(); }} /> : null}
        {!loading && !error ? <NoPlanState /> : null}
      </Screen>
    );
  }

  const found = weekNumber === null ? null : findWeek(plan, weekNumber);
  if (weekNumber === null || found === null) {
    return <LockedOrMissing plan={plan} weekNumber={weekNumber} />;
  }

  return <WeekContent plan={plan} week={found} />;
}

interface WeekContentProps {
  plan: ActivePlan;
  week: PlanWeek;
}

function WeekContent({ plan, week }: WeekContentProps): ReactElement {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const today = localToday();
  const days = weekDays(week, weekStartDate(plan, week.weekNumber, today));
  const progress = week.total === 0 ? 0 : week.done / week.total;

  return (
    <Screen flush>
      <ScreenHeader showBack title={`Semana ${String(week.weekNumber)}`} />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text variant="caption" color={colors.textSecondary}>
          {`${String(week.done)} de ${String(week.total)} treinos`}
        </Text>
        <ProgressBar
          progress={progress}
          accessibilityValue={{ min: 0, max: week.total, now: week.done }}
          style={styles.progress}
        />
        <View style={styles.days}>
          {days.map((day) => (
            <DayRow
              key={day.date}
              day={day}
              todayDate={today}
              onSessionPress={(sessionId) => {
                router.push(`/plan/session/${sessionId}`);
              }}
            />
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

interface LockedOrMissingProps {
  plan: ActivePlan;
  weekNumber: number | null;
}

function LockedOrMissing({ plan, weekNumber }: LockedOrMissingProps): ReactElement {
  const { colors } = useTheme();
  const router = useRouter();
  const isLocked =
    weekNumber !== null && plan.tier === 'free' && weekNumber <= plan.fullWeeks;

  return (
    <Screen flush>
      <ScreenHeader showBack title={weekNumber === null ? 'Semana' : `Semana ${String(weekNumber)}`} />
      {isLocked ? (
        <EmptyState
          icon={<Lock size={sizes.iconXl * 2} color={colors.textSecondary} strokeWidth={sizes.iconStroke} />}
          title="Semana bloqueada"
          description="Disponível no Premium."
          action={
            <Button
              label="Ver planos"
              onPress={() => {
                router.push('/plan-paywall');
              }}
            />
          }
        />
      ) : (
        <EmptyState title="Semana não encontrada" />
      )}
    </Screen>
  );
}

const makeStyles = createStyles(() =>
  StyleSheet.create({
    body: {
      paddingHorizontal: layout.screenPadding,
      paddingBottom: layout.screenBottom,
    },
    progress: {
      marginTop: spacing.md,
    },
    days: {
      marginTop: spacing.lg,
    },
  }),
);
