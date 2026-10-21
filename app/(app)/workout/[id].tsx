import { useEffect, useRef, useState, type ReactElement } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatRow, type Stat } from '@/components';
import { GpsNotice } from '@/components/workout/GpsNotice';
import { SlideToFinish } from '@/components/workout/SlideToFinish';
import { WorkoutControls } from '@/components/workout/WorkoutControls';
import { WorkoutMenu } from '@/components/workout/WorkoutMenu';
import { WorkoutHeading } from '@/components/workout/WorkoutHeading';
import { WorkoutTopBar } from '@/components/workout/WorkoutTopBar';
import { useWorkoutDialogs } from '@/components/workout/workoutDialogs';
import { useActiveSessionSync } from '@/hooks/useActiveSessionSync';
import { useRunTracker } from '@/hooks/useRunTracker';
import { useFinishWorkout } from '@/hooks/useFinishWorkout';
import { useStopwatch } from '@/hooks/useStopwatch';
import { usePreferences } from '@/hooks/usePreferences';
import { loadResumableSession, type ResumableSession } from '@/lib/activeSession';
import type { WorkoutType } from '@/lib/activities';
import { splitMetersFor } from '@/lib/splits';
import { distanceLabel, formatDistanceStat, formatPaceForUnit, paceLabel } from '@/lib/units';
import { layout, palettes, spacing, workout } from '@/theme';
import { ThemeScope } from '@/providers/ThemeProvider';
import type { DistanceUnit } from '@/types/preferences';

const MS_PER_SECOND = 1000;

function WorkoutContent({ resumed }: { resumed: ResumableSession | null }): ReactElement {
  useKeepAwake();
  const router = useRouter();
  const { confirmDiscard, confirmStop, showGpsHelp } = useWorkoutDialogs();
  const preferences = usePreferences();
  const [distanceUnit] = useState<DistanceUnit>(preferences.distanceUnit);
  const insets = useSafeAreaInsets();
  const { state, elapsedMs, formatted, running, start, pause, resume } = useStopwatch(resumed?.stopwatch);
  const [locked, setLocked] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [type, setType] = useState<WorkoutType>(resumed?.session.type ?? 'run');
  const startedAtRef = useRef<Date>(resumed ? new Date(resumed.session.startedAt) : new Date());
  const elapsedSeconds = Math.floor(elapsedMs / MS_PER_SECOND);
  const tracker = useRunTracker({
    active: running,
    elapsedSeconds,
    splitMeters: splitMetersFor(distanceUnit),
    restored: resumed?.session.track ?? null,
  });
  const { clear } = useActiveSessionSync({
    startedAtRef,
    type,
    stopwatch: state,
    track: tracker.track,
  });
  const { finishing, finish } = useFinishWorkout({
    type,
    startedAtRef,
    elapsedSeconds,
    tracker,
    distanceUnit,
    pause,
    clearSession: clear,
  });
  const tracking = tracker.permission === 'granted';

  useEffect(() => {
    if (resumed) return;
    startedAtRef.current = new Date();
    start();
  }, [start, resumed]);

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
    void clear();
    void tracker.stop();
    router.back();
  };

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', (): boolean => {
      if (!finishing) confirmDiscard(leave);
      return true;
    });
    return (): void => {
      subscription.remove();
    };
  });

  const togglePause = (): void => {
    if (running) pause();
    else resume();
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
        <WorkoutTopBar
          onBack={() => {
            confirmDiscard(leave);
          }}
          onMore={() => {
            setMenuOpen(true);
          }}
        />

        <WorkoutHeading type={type} formatted={formatted} />

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

export default function WorkoutScreen(): ReactElement | null {
  const { resume } = useLocalSearchParams<{ resume?: string }>();
  const [resumed, setResumed] = useState<ResumableSession | null>(null);
  const [ready, setReady] = useState<boolean>(resume !== '1');

  useEffect(() => {
    if (resume !== '1') return;
    void loadResumableSession().then((loaded) => {
      setResumed(loaded);
      setReady(true);
    });
  }, [resume]);

  if (!ready) return null;
  return <ThemeScope scheme="dark"><WorkoutContent resumed={resumed} /></ThemeScope>;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palettes.dark.background,
  },
  safe: {
    flex: 1,
    paddingHorizontal: layout.screenPadding,
  },
  stats: {
    marginBottom: spacing.huge,
  },
  controls: {
    marginBottom: spacing.huge,
  },
});
