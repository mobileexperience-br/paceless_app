import { useState, type ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AlertTriangle, CalendarCheck, Check, CloudOff, HeartOff } from 'lucide-react-native';
import { Button, Screen, StatRow, Text, type Stat } from '@/components';
import { HeartRateSummaryCard } from '@/components/workout/HeartRateSummaryCard';
import { SplitsTable } from '@/components/workout/SplitsTable';
import { PerceivedEffortPicker } from '@/components/workout/PerceivedEffortPicker';
import { useWorkoutDialogs } from '@/components/workout/workoutDialogs';
import { useSaveActivity } from '@/hooks/useSaveActivity';
import { formatElapsed } from '@/hooks/useStopwatch';
import { activityLabels } from '@/lib/activities';
import { distanceLabel, formatDistanceStat, formatPaceForUnit, paceLabel } from '@/lib/units';
import {
  formatWorkoutDateTime,
  getWorkoutSummary,
  setWorkoutSummary,
  type SummaryStatus,
} from '@/lib/workoutSummary';
import { layout, palettes, sizes, spacing, workout } from '@/theme';
import { useTheme } from '@/hooks/useTheme';
import { ThemeScope } from '@/providers/ThemeProvider';

const MS_PER_SECOND = 1000;

const statusMessages: Record<SummaryStatus, string> = {
  saved: 'Treino salvo',
  queued: 'Treino guardado. Será enviado quando houver conexão.',
  failed: 'Não foi possível guardar o treino. Toque em tentar de novo para salvá-lo.',
};

function WorkoutSummaryContent(): ReactElement {
  const { colors } = useTheme();
  const router = useRouter();
  const { showGpsHelp } = useWorkoutDialogs();
  const { save, saving } = useSaveActivity();
  const summary = getWorkoutSummary();
  const [status, setStatus] = useState<SummaryStatus>(summary?.status ?? 'failed');

  if (!summary) return <Redirect href="/" />;

  const failed = status === 'failed';
  const linkedToPlan = summary.draft.user_plan_workout_id !== null && !failed;
  const StatusIcon = failed ? AlertTriangle : status === 'saved' ? Check : CloudOff;
  const statusColor = failed ? colors.danger : colors.primary;
  const totalElapsedMs = new Date(summary.draft.ended_at).getTime() - new Date(summary.draft.started_at).getTime();
  const stats: Stat[] = [
    {
      value: formatDistanceStat(summary.distanceMeters === 0 ? null : summary.distanceMeters, summary.distanceUnit),
      label: `Distância (${distanceLabel(summary.distanceUnit)})`,
    },
    { value: formatElapsed(summary.durationSeconds * MS_PER_SECOND), label: 'Tempo ativo' },
    { value: formatPaceForUnit(summary.averagePaceSecondsPerKm, summary.distanceUnit), label: `Ritmo médio (${paceLabel(summary.distanceUnit)})` },
  ];

  const retry = async (): Promise<void> => {
    const result = await save(summary.draft, summary.heartRate?.samples ?? []);
    if (result === 'failed') return;
    await summary.discardSession();
    setWorkoutSummary({ ...summary, status: result });
    setStatus(result);
  };

  return (
    <Screen dark scroll edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar style="light" />
      <View style={styles.heading}>
        <Text variant="title1" color={palettes.dark.ink}>
          {activityLabels[summary.type]}
        </Text>
        <Text variant="caption" color={palettes.dark.textSecondary}>
          {formatWorkoutDateTime(summary.startedAt)}
        </Text>
      </View>

      <View style={styles.status}>
        <StatusIcon size={workout.statusIconSize} color={statusColor} strokeWidth={2} />
        <Text variant="caption" color={failed ? colors.danger : palettes.dark.ink} style={styles.statusText}>
          {statusMessages[status]}
        </Text>
      </View>
      {linkedToPlan ? (
        <View style={styles.status}>
          <CalendarCheck size={workout.statusIconSize} color={colors.primary} strokeWidth={sizes.iconStroke} />
          <Text variant="caption" color={palettes.dark.ink} style={styles.statusText}>
            {status === 'queued'
              ? 'Será marcado no plano quando a conexão voltar'
              : 'Treino do plano concluído'}
          </Text>
        </View>
      ) : null}
      {failed ? (
        <Button
          label={saving ? 'Salvando...' : 'Tentar de novo'}
          disabled={saving}
          onPress={() => {
            void retry();
          }}
          style={styles.retry}
        />
      ) : null}

      <StatRow stats={stats} dark style={styles.stats} />
      <Text variant="caption" color={palettes.dark.textSecondary} style={styles.totalTime}>
        {`Tempo total ${formatElapsed(totalElapsedMs)}`}
      </Text>
      {summary.heartRate !== null && summary.heartRate.avg > 0 ? (
        <HeartRateSummaryCard summary={summary.heartRate} />
      ) : (
        <View style={styles.noGps}>
          <HeartOff size={workout.statusIconSize} color={palettes.dark.textSecondary} strokeWidth={sizes.iconStroke} />
          <Text variant="caption" color={palettes.dark.textSecondary} style={styles.statusText}>
            Frequência cardíaca indisponível
          </Text>
        </View>
      )}

      {summary.distanceMeters === 0 ? (
        <View style={styles.noGps}>
          <Text variant="caption" color={palettes.dark.textSecondary} style={styles.statusText}>
            Sem dados de GPS neste treino
          </Text>
          <Button label="Ajuda com GPS" variant="text" onPress={showGpsHelp} />
        </View>
      ) : (
        <>
          <Text variant="title3" color={palettes.dark.ink} style={styles.sectionTitle}>
            Parciais
          </Text>
          <SplitsTable splits={summary.splits} unit={summary.distanceUnit} />
        </>
      )}

      {failed ? null : (
        <View style={styles.effort}>
          <PerceivedEffortPicker activityId={summary.draft.id} />
        </View>
      )}

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
  retry: {
    marginTop: spacing.md,
  },
  stats: {
    marginTop: layout.sectionGap,
  },
  totalTime: {
    marginTop: spacing.sm,
  },
  effort: {
    marginTop: layout.sectionGap,
  },
  noGps: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
