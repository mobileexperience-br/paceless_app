import {
  queryWorkoutSamples,
  WorkoutActivityType,
  type WorkoutProxyTyped,
} from '@kingstinct/react-native-healthkit';
import type { ImportedWorkout } from '@/types/healthHub';

const OWN_BUNDLE_ID = 'com.paceless.app';
const DISTANCE_TYPE = 'HKQuantityTypeIdentifierDistanceWalkingRunning';
const HEART_RATE_TYPE = 'HKQuantityTypeIdentifierHeartRate';
const METERS = 'm';

function isWorkoutType(type: WorkoutActivityType): boolean {
  return type === WorkoutActivityType.running || type === WorkoutActivityType.walking;
}

function durationSeconds(workout: WorkoutProxyTyped): number {
  const { quantity, unit } = workout.duration;
  return unit === 'min' ? quantity * 60 : quantity;
}

async function distanceMeters(workout: WorkoutProxyTyped): Promise<number> {
  const statistic = await workout.getStatistic(DISTANCE_TYPE, METERS);
  const sum = statistic?.sumQuantity?.quantity;
  if (sum !== undefined) return sum;
  const total = workout.totalDistance;
  return total?.unit === METERS ? total.quantity : 0;
}

async function mapWorkout(workout: WorkoutProxyTyped): Promise<ImportedWorkout | null> {
  const source = workout.sourceRevision.source;
  if (source.bundleIdentifier === OWN_BUNDLE_ID) return null;
  if (!isWorkoutType(workout.workoutActivityType)) return null;
  const heartRate = await workout.getStatistic(HEART_RATE_TYPE, 'count/min');
  return {
    externalId: workout.uuid,
    type: workout.workoutActivityType === WorkoutActivityType.running ? 'run' : 'walk',
    startedAt: workout.startDate,
    endedAt: workout.endDate,
    durationSeconds: durationSeconds(workout),
    distanceMeters: await distanceMeters(workout),
    avgHeartRate: heartRate?.averageQuantity?.quantity ?? null,
    maxHeartRate: heartRate?.maximumQuantity?.quantity ?? null,
    sourceName: source.name,
  };
}

export async function readHealthKitWorkouts(since: Date): Promise<ImportedWorkout[]> {
  const workouts = await queryWorkoutSamples({
    limit: 0,
    ascending: false,
    filter: {
      date: { startDate: since, endDate: new Date() },
      OR: [
        { workoutActivityType: WorkoutActivityType.running },
        { workoutActivityType: WorkoutActivityType.walking },
      ],
    },
  });
  const imported: ImportedWorkout[] = [];
  for (const workout of workouts) {
    try {
      const mapped = await mapWorkout(workout);
      if (mapped) imported.push(mapped);
    } catch {
      continue;
    }
  }
  return imported;
}
