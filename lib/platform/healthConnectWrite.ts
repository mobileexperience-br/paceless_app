import {
  ExerciseType,
  insertRecords,
  RecordingMethod,
  type ExerciseSessionRecord,
} from 'react-native-health-connect';
import type { RoutePoint } from '@/lib/geo';
import { ensureInitialized, hasWriteRouteAccess } from '@/lib/platform/healthConnectClient';
import type { ExportableWorkout } from '@/types/healthHub';

type ExerciseRoute = NonNullable<ExerciseSessionRecord['exerciseRoute']>;

const MIN_ROUTE_POINTS = 2;

function toExerciseRoute(route: RoutePoint[]): ExerciseRoute {
  return {
    route: route.map((point) => ({
      time: new Date(point.timestamp).toISOString(),
      latitude: point.latitude,
      longitude: point.longitude,
    })),
  };
}

function sessionTitle(type: ExportableWorkout['type']): string {
  return type === 'run' ? 'Corrida' : 'Caminhada';
}

async function insertSession(workout: ExportableWorkout, includeRoute: boolean): Promise<void> {
  const route = workout.route;
  const exerciseRoute =
    includeRoute && route && route.length >= MIN_ROUTE_POINTS ? toExerciseRoute(route) : null;
  await insertRecords([
    {
      recordType: 'ExerciseSession',
      exerciseType: workout.type === 'run' ? ExerciseType.RUNNING : ExerciseType.WALKING,
      startTime: workout.startedAt.toISOString(),
      endTime: workout.endedAt.toISOString(),
      title: sessionTitle(workout.type),
      metadata: {
        clientRecordId: workout.id,
        clientRecordVersion: 1,
        recordingMethod: RecordingMethod.RECORDING_METHOD_ACTIVELY_RECORDED,
      },
      ...(exerciseRoute ? { exerciseRoute } : {}),
    },
  ]);
}

async function insertDistance(workout: ExportableWorkout): Promise<void> {
  await insertRecords([
    {
      recordType: 'Distance',
      startTime: workout.startedAt.toISOString(),
      endTime: workout.endedAt.toISOString(),
      distance: { value: workout.distanceMeters, unit: 'meters' },
      metadata: {
        clientRecordId: `${workout.id}-distance`,
        clientRecordVersion: 1,
        recordingMethod: RecordingMethod.RECORDING_METHOD_ACTIVELY_RECORDED,
      },
    },
  ]);
}

export async function writeWorkoutToHealthConnect(workout: ExportableWorkout): Promise<boolean> {
  try {
    await ensureInitialized();
    const canWriteRoute = await hasWriteRouteAccess();
    await insertSession(workout, canWriteRoute);
    if (workout.distanceMeters > 0) await insertDistance(workout);
    return true;
  } catch {
    return false;
  }
}
