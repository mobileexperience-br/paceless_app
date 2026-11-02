import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '@/components/Card';
import { ProgressBar } from '@/components/ProgressBar';
import { Text } from '@/components/Text';
import { formatDuration, formatWeekDistance, summarizeWeek } from '@/lib/activityStats';
import { distanceLabel } from '@/lib/units';
import { spacing } from '@/theme';
import { useTheme } from '@/hooks/useTheme';
import { usePreferences } from '@/hooks/usePreferences';
import type { Activity } from '@/lib/activities';
import type { PlanWeekStatus } from '@/types/planWeek';

interface WeekProgressCardProps {
  activities: readonly Activity[];
  status: PlanWeekStatus | null;
}

function workoutsLabel(count: number): string {
  if (count === 0) return 'Nenhum treino nesta semana';
  return count === 1 ? '1 treino nesta semana' : `${String(count)} treinos nesta semana`;
}

function weekLabel(status: PlanWeekStatus): string {
  const base = `Semana ${String(status.currentWeek)}`;
  return status.currentAttempt > 1 ? `${base} • tentativa ${String(status.currentAttempt)}` : base;
}

function planLines(status: PlanWeekStatus): string {
  const count = `${String(status.completed)} de ${String(status.eligible)} treinos concluídos`;
  if (status.adherence === null) return count;
  return `${count} • aderência ${String(Math.round(status.adherence * 100))}%`;
}

export function WeekProgressCard({ activities, status }: WeekProgressCardProps): ReactElement {
  const { distanceUnit: unit } = usePreferences();
  const week = summarizeWeek(activities, new Date());
  const { colors } = useTheme();
  const totals = `${formatWeekDistance(week.distanceMeters, unit)} ${distanceLabel(unit)} • ${formatDuration(week.durationSeconds)}`;
  const hasPlan = status !== null && status.eligible > 0;
  return (
    <Card>
      <Text variant="captionStrong">Progresso da semana</Text>
      {hasPlan ? (
        <View style={styles.planBlock}>
          <Text variant="caption" color={colors.textSecondary}>
            {weekLabel(status)}
          </Text>
          <ProgressBar
            progress={status.completed / status.eligible}
            style={styles.bar}
            accessibilityValue={{ min: 0, max: status.eligible, now: status.completed }}
          />
          <Text variant="caption" color={colors.textSecondary} style={styles.line}>
            {planLines(status)}
          </Text>
          <Text variant="caption" color={colors.textSecondary} style={styles.line}>
            Dias de descanso fazem parte do plano e não contam como falta.
          </Text>
        </View>
      ) : (
        <Text variant="caption" color={colors.textSecondary} style={styles.label}>
          {workoutsLabel(week.workouts)}
        </Text>
      )}
      {week.workouts > 0 ? (
        <Text variant="caption" color={colors.textSecondary} style={hasPlan ? styles.line : undefined}>
          {totals}
        </Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  label: {
    marginTop: spacing.xs,
  },
  planBlock: {
    marginTop: spacing.xs,
  },
  bar: {
    marginTop: spacing.sm,
  },
  line: {
    marginTop: spacing.xs,
  },
});
