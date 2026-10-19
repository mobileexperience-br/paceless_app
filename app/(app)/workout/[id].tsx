import { useEffect, useRef, useState, type ReactElement } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatRow, Text, type Stat } from '@/components';
import { GpsNotice } from '@/components/workout/GpsNotice';
import { SlideToFinish } from '@/components/workout/SlideToFinish';
import { WorkoutControls } from '@/components/workout/WorkoutControls';
import { WorkoutTopBar } from '@/components/workout/WorkoutTopBar';
import { useRunTracker } from '@/hooks/useRunTracker';
import { useSaveActivity, type NewActivity } from '@/hooks/useSaveActivity';
import { useStopwatch } from '@/hooks/useStopwatch';
import { usePreferences } from '@/hooks/usePreferences';
import { distanceLabel, formatDistanceStat, formatPaceForUnit, paceLabel } from '@/lib/units';
import { colors, layout, spacing } from '@/theme';

const MS_PER_SECOND = 1000;
const MIN_SAVE_SECONDS = 10;

export default function WorkoutScreen(): ReactElement {
  const router = useRouter();
  const { distanceUnit } = usePreferences();
  const { elapsedMs, formatted, running, start, pause, resume } = useStopwatch();
  const [locked, setLocked] = useState<boolean>(false);
  const [finishing, setFinishing] = useState<boolean>(false);
  const startedAtRef = useRef<Date>(new Date());
  const { save } = useSaveActivity();
  const elapsedSeconds = Math.floor(elapsedMs / MS_PER_SECOND);
  const tracker = useRunTracker({ active: running, elapsedSeconds });
  const tracking = tracker.permission === 'granted';

  useEffect(() => {
    startedAtRef.current = new Date();
    start();
  }, [start]);

  const stats: Stat[] = [
    {
      value: formatDistanceStat(tracking ? tracker.distanceMeters : null, distanceUnit),
      label: `Distância (${distanceLabel(distanceUnit)})`,
    },
    {
      value: formatPaceForUnit(tracker.currentPaceSecondsPerKm, distanceUnit),
      label: `Ritmo (${paceLabel(distanceUnit)})`,
    },
    { value: '—', label: 'FC média (bpm)' },
  ];

  const leave = (): void => {
    router.back();
  };

  const togglePause = (): void => {
    if (running) pause();
    else resume();
  };

  const finish = async (): Promise<void> => {
    if (finishing) return;
    setFinishing(true);
    pause();
    if (elapsedSeconds < MIN_SAVE_SECONDS) {
      leave();
      return;
    }
    const draft: NewActivity = {
      type: 'run',
      started_at: startedAtRef.current.toISOString(),
      ended_at: new Date().toISOString(),
      duration_seconds: elapsedSeconds,
      distance_meters: Math.round(tracker.distanceMeters),
      avg_pace_seconds_per_km: tracker.averagePaceSecondsPerKm,
      route: tracker.route.length > 0 ? tracker.route : null,
    };
    const result = await save(draft);
    if (result === 'queued') {
      Alert.alert(
        'Treino guardado',
        'Não foi possível enviar agora. Ele será enviado quando houver conexão.',
        [{ text: 'OK', onPress: leave }],
      );
      return;
    }
    leave();
  };

  const confirmDiscard = (): void => {
    Alert.alert('Sair do treino?', 'O treino em andamento será descartado.', [
      { text: 'Continuar', style: 'cancel' },
      { text: 'Descartar', style: 'destructive', onPress: leave },
    ]);
  };

  const confirmStop = (): void => {
    Alert.alert('Parar treino?', 'O treino será encerrado e salvo.', [
      { text: 'Continuar', style: 'cancel' },
      { text: 'Parar', style: 'destructive', onPress: (): void => { void finish(); } },
    ]);
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
        <WorkoutTopBar onBack={confirmDiscard} />

        <View style={styles.heading}>
          <Text variant="title1" color={colors.dark.text}>
            Treino livre
          </Text>
        </View>

        <View style={styles.timer}>
          <Text variant="timer" center color={colors.primary}>
            {formatted}
          </Text>
          <Text variant="caption" center color={colors.dark.textSecondary}>
            Duração
          </Text>
        </View>

        <View style={styles.stats}>
          <StatRow stats={stats} dark />
          <GpsNotice state={tracker.permission} />
        </View>

        <View style={styles.controls}>
          <WorkoutControls
            paused={!running}
            locked={locked}
            onTogglePause={togglePause}
            onStop={confirmStop}
            onToggleLock={() => { setLocked((prev) => !prev); }}
          />
        </View>

        <SlideToFinish disabled={locked || finishing} onFinish={() => { void finish(); }} />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  safe: {
    flex: 1,
    paddingHorizontal: layout.screenPadding,
  },
  heading: {
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  timer: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.sm,
  },
  stats: {
    marginBottom: spacing.huge,
  },
  controls: {
    marginBottom: spacing.huge,
  },
});
