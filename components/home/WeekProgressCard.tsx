import type { ReactElement } from 'react';
import { StyleSheet } from 'react-native';
import { Card } from '@/components/Card';
import { Text } from '@/components/Text';
import { formatDuration, formatWeekDistance, summarizeWeek } from '@/lib/activityStats';
import { distanceLabel } from '@/lib/units';
import { spacing } from '@/theme';
import { useTheme } from '@/hooks/useTheme';
import { usePreferences } from '@/hooks/usePreferences';
import type { Activity } from '@/lib/activities';

interface WeekProgressCardProps {
  activities: readonly Activity[];
}

function workoutsLabel(count: number): string {
  if (count === 0) return 'Nenhum treino nesta semana';
  return count === 1 ? '1 treino nesta semana' : `${String(count)} treinos nesta semana`;
}

export function WeekProgressCard({ activities }: WeekProgressCardProps): ReactElement {
  const { distanceUnit: unit } = usePreferences();
  const week = summarizeWeek(activities, new Date());
  const { colors } = useTheme();
  const totals = `${formatWeekDistance(week.distanceMeters, unit)} ${distanceLabel(unit)} • ${formatDuration(week.durationSeconds)}`;
  return (
    <Card>
      <Text variant="captionStrong">Progresso da semana</Text>
      <Text variant="caption" color={colors.textSecondary} style={styles.label}>
        {workoutsLabel(week.workouts)}
      </Text>
      {week.workouts > 0 ? (
        <Text variant="caption" color={colors.textSecondary}>
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
});
