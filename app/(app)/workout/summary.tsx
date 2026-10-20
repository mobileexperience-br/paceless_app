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
import { layout, palettes, spacing, workout } from '@/theme';
import { useTheme } from '@/hooks/useTheme';
import { ThemeScope } from '@/providers/ThemeProvider';

const MS_PER_SECOND = 1000;

const statusMessages: Record<SummaryStatus, string> = {
  saved: 'Treino salvo',
  queued: 'Treino guardado. Será enviado quando houver conexão.',
  failed: 'Não foi possível guardar o treino. Entre na sua conta novamente.',
};

function WorkoutSummaryContent(): ReactElement {
  const { colors } = useTheme();
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
        <Text variant="title1" color={palettes.dark.ink}>
          {activityLabels[summary.type]}
        </Text>
        <Text variant="caption" color={palettes.dark.textSecondary}>
          Treino livre
        </Text>
      </View>

      <View style={styles.status}>
        <StatusIcon size={workout.statusIconSize} color={colors.primary} strokeWidth={2} />
        <Text variant="caption" color={palettes.dark.ink} style={styles.statusText}>
          {statusMessages[summary.status]}
        </Text>
      </View>

      <StatRow stats={stats} dark style={styles.stats} />

      <Text variant="title3" color={palettes.dark.ink} style={styles.sectionTitle}>
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

export default function WorkoutSummaryScreen(): ReactElement {
  return <ThemeScope scheme="dark"><WorkoutSummaryContent /></ThemeScope>;
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
