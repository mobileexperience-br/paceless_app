import { useEffect, useState, type ReactElement } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Ellipsis } from 'lucide-react-native';
import { StatRow, Text, type Stat } from '@/components';
import { SlideToFinish } from '@/components/workout/SlideToFinish';
import { WorkoutControls } from '@/components/workout/WorkoutControls';
import { useStopwatch } from '@/hooks/useStopwatch';
import { colors, layout, spacing, workout } from '@/theme';

const stats: Stat[] = [
  { value: '—', label: 'Distância (km)' },
  { value: '—', label: 'Ritmo (min/km)' },
  { value: '—', label: 'FC média (bpm)' },
];

export default function WorkoutScreen(): ReactElement {
  const router = useRouter();
  const { formatted, running, start, pause, resume } = useStopwatch();
  const [locked, setLocked] = useState<boolean>(false);

  useEffect(() => {
    start();
  }, [start]);

  const leave = (): void => {
    router.back();
  };

  const togglePause = (): void => {
    if (running) pause();
    else resume();
  };

  const confirmStop = (): void => {
    Alert.alert('Parar treino?', 'O treino em andamento será encerrado.', [
      { text: 'Continuar', style: 'cancel' },
      { text: 'Parar', style: 'destructive', onPress: leave },
    ]);
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            hitSlop={12}
            onPress={leave}
          >
            <ArrowLeft size={workout.topBarIconSize} color={colors.dark.text} strokeWidth={2} />
          </Pressable>
          <View style={styles.grow} />
          <Pressable accessibilityRole="button" accessibilityLabel="Mais opções" hitSlop={12}>
            <Ellipsis size={workout.topBarIconSize} color={colors.dark.text} strokeWidth={2} />
          </Pressable>
        </View>

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

        <StatRow stats={stats} dark style={styles.stats} />

        <View style={styles.controls}>
          <WorkoutControls
            paused={!running}
            locked={locked}
            onTogglePause={togglePause}
            onStop={confirmStop}
            onToggleLock={() => { setLocked((prev) => !prev); }}
          />
        </View>

        <SlideToFinish disabled={locked} onFinish={leave} />
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: workout.topBarHeight,
  },
  grow: {
    flex: 1,
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
