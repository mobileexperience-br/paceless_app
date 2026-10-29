import {
  saveWorkoutSample,
  WorkoutActivityType,
  type LocationForSaving,
  type QuantitySampleForSaving,
} from '@kingstinct/react-native-healthkit';
import type { ExportableWorkout } from '@/types/healthHub';
import type { RoutePoint } from '@/lib/geo';

const DISTANCE_TYPE = 'HKQuantityTypeIdentifierDistanceWalkingRunning';
const MIN_ROUTE_POINTS = 2;

function toLocations(route: RoutePoint[]): LocationForSaving[] {
  return route.map((point) => ({
    latitude: point.latitude,
    longitude: point.longitude,
    date: new Date(point.timestamp),
    altitude: 0,
    course: -1,
    speed: -1,
    horizontalAccuracy: 0,
    verticalAccuracy: -1,
  }));
}

function distanceSamples(workout: ExportableWorkout): QuantitySampleForSaving[] {
  if (workout.distanceMeters <= 0) return [];
  return [
    {
      quantityType: DISTANCE_TYPE,
      quantity: workout.distanceMeters,
      unit: 'm',
      startDate: workout.startedAt,
      endDate: workout.endedAt,
    },
  ];
}

export async function writeWorkoutToHealthKit(workout: ExportableWorkout): Promise<boolean> {
  try {
    const proxy = await saveWorkoutSample(
      workout.type === 'run' ? WorkoutActivityType.running : WorkoutActivityType.walking,
      distanceSamples(workout),
      workout.startedAt,
      workout.endedAt,
      { distance: workout.distanceMeters },
      { HKMetadataKeySyncIdentifier: workout.id, HKMetadataKeySyncVersion: 1 },
    );
    if (workout.route && workout.route.length >= MIN_ROUTE_POINTS) {
      await proxy.saveWorkoutRoute(toLocations(workout.route));
    }
    return true;
  } catch {
    return false;
  }
}
