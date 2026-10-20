import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Check, CloudOff } from 'lucide-react-native';
import { Button, Screen, StatRow, Text, type Stat } from '@/components';
import { SplitsTable } from '@/components/workout/SplitsTable';
import { formatElapsed } from '@/hooks/useStopwatch';
import { activityLabels } from '@/lib/activities';
import { distanceLabel, formatDistanceStat, formatPaceForUnit, paceLabel } from '@/lib/units';
import { getWorkoutSummary, type SummaryStatus } from '@/lib/workoutSummary';
import { colors, layout, spacing, workout } from '@/theme';

const MS_PER_SECOND = 1000;

const statusMessages: Record<SummaryStatus, string> = {
  saved: 'Treino salvo',
  queued: 'Treino guardado. Será enviado quando houver conexão.',
  failed: 'Não foi possível guardar o treino. Entre na sua conta novamente.',
};

export default function WorkoutSummaryScreen(): ReactElement {
  const router = useRouter();
  const summary = getWorkoutSummary();

  if (!summary) return <Redirect href="/" />;

  const StatusIcon = summary.status === 'saved' ? Check : CloudOff;
  const stats: Stat[] = [
    { value: formatDistanceStat(summary.distanceMeters, summary.distanceUnit), label: `Distância (${distanceLabel(summary.distanceUnit)})` },
    { value: formatElapsed(summary.durationSeconds * MS_PER_SECOND), label: 'Duração' },
    { value: formatPaceForUnit(summary.averagePaceSecondsPerKm, summary.distanceUnit), label: `Ritmo médio (${paceLabel(summary.distanceUnit)})` },
  ];

  return (
    <Screen dark scroll edges={['top', 'bottom']}>
      <StatusBar style="light" />
      <View style={styles.heading}>
        <Text variant="title1" color={colors.dark.text}>
          {activityLabels[summary.type]}
        </Text>
        <Text variant="caption" color={colors.dark.textSecondary}>
          Treino livre
        </Text>
      </View>

      <View style={styles.status}>
        <StatusIcon size={workout.statusIconSize} color={colors.primary} strokeWidth={2} />
        <Text variant="caption" color={colors.dark.text} style={styles.statusText}>
          {statusMessages[summary.status]}
        </Text>
      </View>

      <StatRow stats={stats} dark style={styles.stats} />

      <Text variant="title3" color={colors.dark.text} style={styles.sectionTitle}>
        Parciais
      </Text>
      <SplitsTable splits={summary.splits} unit={summary.distanceUnit} />

      <View style={styles.action}>
        <Button
          label="Concluir"
          onPress={() => {
            router.replace('/');
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: {
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  statusText: {
    flex: 1,
  },
  stats: {
    marginTop: layout.sectionGap,
  },
  sectionTitle: {
    marginTop: layout.sectionGap,
    marginBottom: spacing.sm,
  },
  action: {
    marginTop: layout.sectionGap,
    marginBottom: layout.screenBottom,
  },
});
