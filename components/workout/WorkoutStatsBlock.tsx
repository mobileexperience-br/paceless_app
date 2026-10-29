import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatRow } from '@/components/StatRow';
import { GpsNotice } from '@/components/workout/GpsNotice';
import { HeartRateNotice } from '@/components/workout/HeartRateNotice';
import { buildWorkoutStats } from '@/components/workout/workoutStats';
import type { WorkoutHeartRate } from '@/hooks/useWorkoutHeartRate';
import type { RunTracker } from '@/hooks/useRunTracker';
import { spacing } from '@/theme';
import type { DistanceUnit } from '@/types/preferences';

interface WorkoutStatsBlockProps {
  tracker: RunTracker;
  distanceUnit: DistanceUnit;
  heartRate: WorkoutHeartRate;
}

export function WorkoutStatsBlock({ tracker, distanceUnit, heartRate }: WorkoutStatsBlockProps): ReactElement {
  return (
    <View style={styles.stats}>
      <StatRow stats={buildWorkoutStats(tracker, distanceUnit)} dark />
      <GpsNotice tracker={tracker} />
      <HeartRateNotice status={heartRate.status} bpm={heartRate.bpm} zone={heartRate.zone} />
    </View>
  );
}

const styles = StyleSheet.create({
  stats: {
    marginBottom: spacing.huge,
  },
});
