import {
  aggregateRecord,
  ExerciseType,
  readRecords,
  type ReadRecordsResult,
} from 'react-native-health-connect';
import { brandByPackage } from '@/lib/healthHubLabels';
import { ensureInitialized } from '@/lib/platform/healthConnectClient';
import type { ImportedWorkout } from '@/types/healthHub';

const OWN_PACKAGE = 'com.paceless.app';
const MS_PER_SECOND = 1000;

type SessionRecord = ReadRecordsResult<'ExerciseSession'>['records'][number];
interface TimeRange {
  operator: 'between';
  startTime: string;
  endTime: string;
}

function workoutType(exerciseType: number): ImportedWorkout['type'] | null {
  if (exerciseType === ExerciseType.RUNNING || exerciseType === ExerciseType.RUNNING_TREADMILL) {
    return 'run';
  }
  if (exerciseType === ExerciseType.WALKING) return 'walk';
  return null;
}

async function readAllSessions(since: Date, now: Date): Promise<SessionRecord[]> {
  const sessions: SessionRecord[] = [];
  let pageToken: string | undefined;
  do {
    const page = await readRecords('ExerciseSession', {
      timeRangeFilter: {
        operator: 'between',
        startTime: since.toISOString(),
        endTime: now.toISOString(),
      },
      pageSize: 100,
      ...(pageToken ? { pageToken } : {}),
    });
    sessions.push(...page.records);
    pageToken = page.pageToken;
  } while (pageToken);
  return sessions;
}

async function safely<T>(job: () => Promise<T>): Promise<T | null> {
  try {
    return await job();
  } catch {
    return null;
  }
}

async function distanceMeters(range: TimeRange, origin: string[] | undefined): Promise<number> {
  const result = await safely(() =>
    aggregateRecord({
      recordType: 'Distance',
      timeRangeFilter: range,
      ...(origin ? { dataOriginFilter: origin } : {}),
    }),
  );
  return result?.DISTANCE.inMeters ?? 0;
}

async function heartRate(
  range: TimeRange,
  origin: string[] | undefined,
): Promise<{ avg: number | null; max: number | null }> {
  const result = await safely(() =>
    aggregateRecord({
      recordType: 'HeartRate',
      timeRangeFilter: range,
      ...(origin ? { dataOriginFilter: origin } : {}),
    }),
  );
  if (!result || result.MEASUREMENTS_COUNT <= 0) return { avg: null, max: null };
  return { avg: result.BPM_AVG, max: result.BPM_MAX };
}

async function mapSession(session: SessionRecord): Promise<ImportedWorkout | null> {
  const type = workoutType(session.exerciseType);
  const dataOrigin = session.metadata?.dataOrigin;
  const externalId = session.metadata?.id;
  if (type === null || !externalId || dataOrigin === OWN_PACKAGE) return null;
  const startedAt = new Date(session.startTime);
  const endedAt = new Date(session.endTime);
  const range: TimeRange = {
    operator: 'between',
    startTime: session.startTime,
    endTime: session.endTime,
  };
  const origin = dataOrigin ? [dataOrigin] : undefined;
  const hr = await heartRate(range, origin);
  return {
    externalId,
    type,
    startedAt,
    endedAt,
    durationSeconds: (endedAt.getTime() - startedAt.getTime()) / MS_PER_SECOND,
    distanceMeters: await distanceMeters(range, origin),
    avgHeartRate: hr.avg,
    maxHeartRate: hr.max,
    sourceName: dataOrigin ? (brandByPackage[dataOrigin] ?? null) : null,
  };
}

export async function readHealthConnectWorkouts(since: Date): Promise<ImportedWorkout[]> {
  await ensureInitialized();
  const sessions = await readAllSessions(since, new Date());
  const imported: ImportedWorkout[] = [];
  for (const session of sessions) {
    try {
      const mapped = await mapSession(session);
      if (mapped) imported.push(mapped);
    } catch {
      continue;
    }
  }
  return imported;
}
