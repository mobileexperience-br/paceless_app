import { useEffect, useRef, useState, type ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatRow } from '@/components';
import { GpsNotice } from '@/components/workout/GpsNotice';
import { SlideToFinish } from '@/components/workout/SlideToFinish';
import { WorkoutControls } from '@/components/workout/WorkoutControls';
import { WorkoutMenu } from '@/components/workout/WorkoutMenu';
import { WorkoutHeading } from '@/components/workout/WorkoutHeading';
import { WorkoutTopBar } from '@/components/workout/WorkoutTopBar';
import { buildWorkoutStats } from '@/components/workout/workoutStats';
import { useWorkoutDialogs } from '@/components/workout/workoutDialogs';
import { useActiveSessionSync } from '@/hooks/useActiveSessionSync';
import { useHardwareBack } from '@/hooks/useHardwareBack';
import { useRunTracker } from '@/hooks/useRunTracker';
import { SavingOverlay } from '@/components/workout/SavingOverlay';
import { useWorkoutFinish } from '@/hooks/useWorkoutFinish';
import { useStopwatch } from '@/hooks/useStopwatch';
import { usePreferences } from '@/hooks/usePreferences';
import { loadResumableSession, type ResumableSession } from '@/lib/activeSession';
import type { WorkoutType } from '@/lib/activities';
import { splitMetersFor } from '@/lib/splits';
import { layout, palettes, spacing, workout } from '@/theme';
import { ThemeScope } from '@/providers/ThemeProvider';
import type { DistanceUnit } from '@/types/preferences';

const MS_PER_SECOND = 1000;

function WorkoutContent({ resumed, planSessionId }: { resumed: ResumableSession | null; planSessionId: string | null }): ReactElement {
  useKeepAwake();
  const router = useRouter();
  const { confirmDiscard, confirmStop, showGpsHelp } = useWorkoutDialogs();
  const preferences = usePreferences();
  const [distanceUnit] = useState<DistanceUnit>(preferences.distanceUnit);
  const insets = useSafeAreaInsets();
  const { state, elapsedMs, formatted, running, start, pause, resume } = useStopwatch(resumed?.stopwatch);
  const [locked, setLocked] = useState<boolean>(false);
  const [menuView, setMenuView] = useState<'closed' | 'menu' | 'types'>('closed');
  const [type, setType] = useState<WorkoutType>(resumed?.session.type ?? 'run');
  const startedAtRef = useRef<Date>(resumed ? new Date(resumed.session.startedAt) : new Date());
  const [userPlanWorkoutId] = useState<string | null>(() => resumed?.session.userPlanWorkoutId ?? planSessionId);
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
    userPlanWorkoutId,
    stopwatch: state,
    track: tracker.track,
  });
  const { finishing, saving, finishWorkout } = useWorkoutFinish({
    type,
    startedAtRef,
    userPlanWorkoutId,
    elapsedSeconds,
    tracker,
    distanceUnit,
    pause,
    clearSession: clear,
  });

  useEffect(() => {
    if (resumed) return;
    startedAtRef.current = new Date();
    start();
  }, [start, resumed]);

  const stats = buildWorkoutStats(tracker, distanceUnit);

  const leave = (): void => {
    void clear();
    void tracker.stop();
    router.back();
  };

  useHardwareBack((): void => {
    if (!locked && !finishing) confirmDiscard(leave);
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
          disabled={locked}
          onBack={() => {
            confirmDiscard(leave);
          }}
          onMore={() => {
            setMenuView('menu');
          }}
        />

        <WorkoutHeading
          type={type}
          formatted={formatted}
          paused={!running}
          typeDisabled={locked}
          onPressType={() => {
            setMenuView('types');
          }}
        />

        <View style={styles.stats}>
          <StatRow stats={stats} dark />
          <GpsNotice tracker={tracker} />
        </View>

        <View style={styles.controls}>
          <WorkoutControls
            paused={!running}
            locked={locked}
            onTogglePause={togglePause}
            onStop={() => {
              confirmStop(() => {
                finishWorkout();
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
              finishWorkout();
            }}
          />
        </View>
      </SafeAreaView>

      <SavingOverlay visible={saving} />

      <WorkoutMenu
        visible={menuView !== 'closed'}
        view={menuView === 'types' ? 'types' : 'menu'}
        onViewChange={setMenuView}
        type={type}
        onClose={() => {
          setMenuView('closed');
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
  const { resume, session } = useLocalSearchParams<{ resume?: string; session?: string }>();
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
  return <ThemeScope scheme="dark"><WorkoutContent resumed={resumed} planSessionId={session ?? null} /></ThemeScope>;
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
