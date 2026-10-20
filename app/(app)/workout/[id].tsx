import { useEffect, useRef, useState, type ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatRow, Text, type Stat } from '@/components';
import { GpsNotice } from '@/components/workout/GpsNotice';
import { SlideToFinish } from '@/components/workout/SlideToFinish';
import { WorkoutControls } from '@/components/workout/WorkoutControls';
import { WorkoutMenu } from '@/components/workout/WorkoutMenu';
import { WorkoutTopBar } from '@/components/workout/WorkoutTopBar';
import { useWorkoutDialogs } from '@/components/workout/workoutDialogs';
import { useRunTracker } from '@/hooks/useRunTracker';
import { useFinishWorkout } from '@/hooks/useFinishWorkout';
import { useStopwatch } from '@/hooks/useStopwatch';
import { usePreferences } from '@/hooks/usePreferences';
import { activityLabels, type WorkoutType } from '@/lib/activities';
import { splitMetersFor } from '@/lib/splits';
import { distanceLabel, formatDistanceStat, formatPaceForUnit, paceLabel } from '@/lib/units';
import { colors, layout, spacing, workout } from '@/theme';

const MS_PER_SECOND = 1000;

export default function WorkoutScreen(): ReactElement {
  useKeepAwake();
  const router = useRouter();
  const { confirmDiscard, confirmStop, showGpsHelp } = useWorkoutDialogs();
  const { distanceUnit } = usePreferences();
  const insets = useSafeAreaInsets();
  const { elapsedMs, formatted, running, start, pause, resume } = useStopwatch();
  const [locked, setLocked] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [type, setType] = useState<WorkoutType>('run');
  const startedAtRef = useRef<Date>(new Date());
  const elapsedSeconds = Math.floor(elapsedMs / MS_PER_SECOND);
  const tracker = useRunTracker({
    active: running,
    elapsedSeconds,
    splitMeters: splitMetersFor(distanceUnit),
  });
  const { finishing, finish } = useFinishWorkout({
    type,
    startedAtRef,
    elapsedSeconds,
    tracker,
    distanceUnit,
    pause,
  });
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
    void tracker.stop();
    router.back();
  };

  const togglePause = (): void => {
    if (running) pause();
    else resume();
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView edges={['top']} style={styles.safe}>
        <WorkoutTopBar
          onBack={() => {
            confirmDiscard(leave);
          }}
          onMore={() => {
            setMenuOpen(true);
          }}
        />

        <View style={styles.heading}>
          <Text variant="title1" color={colors.dark.text}>
            {activityLabels[type]}
          </Text>
          <Text variant="caption" color={colors.dark.textSecondary}>
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
            onStop={() => {
              confirmStop(() => {
                void finish();
              });
            }}
            onToggleLock={() => {
              setLocked((prev) => !prev);
            }}
          />
        </View>

        <View style={{ paddingBottom: insets.bottom + workout.sliderBottomGap }}>
          <SlideToFinish
            disabled={locked || finishing}
            onFinish={() => {
              void finish();
            }}
          />
        </View>
      </SafeAreaView>

      <WorkoutMenu
        visible={menuOpen}
        type={type}
        onClose={() => {
          setMenuOpen(false);
        }}
        onSelectType={setType}
        onDiscard={() => {
          confirmDiscard(leave);
        }}
        onHelp={showGpsHelp}
      />
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
