import { useRef, useState, type RefObject } from 'react';
import { useRouter } from 'expo-router';
import type { RunTracker } from '@/hooks/useRunTracker';
import { paceSecondsPerKm } from '@/lib/geo';
import { useSaveActivity, type NewActivity, type SaveResult } from '@/hooks/useSaveActivity';
import type { WorkoutType } from '@/lib/activities';
import { setWorkoutSummary } from '@/lib/workoutSummary';
import type { DistanceUnit } from '@/types/preferences';
import type { HeartRateSummary } from '@/types/heartRate';

const MIN_SAVE_SECONDS = 10;

export type FinishOutcome = SaveResult | 'tooShort';

interface FinishWorkoutOptions {
  type: WorkoutType;
  startedAtRef: RefObject<Date>;
  userPlanWorkoutId: string | null;
  elapsedSeconds: number;
  tracker: RunTracker;
  distanceUnit: DistanceUnit;
  pause: () => void;
  clearSession: () => Promise<void>;
  heartRate: { finish: () => HeartRateSummary | null };
}

interface FinishWorkout {
  finishing: boolean;
  saving: boolean;
  finish: () => Promise<FinishOutcome>;
}

export function useFinishWorkout({
  type,
  startedAtRef,
  userPlanWorkoutId,
  elapsedSeconds,
  tracker,
  distanceUnit,
  pause,
  clearSession,
  heartRate,
}: FinishWorkoutOptions): FinishWorkout {
  const router = useRouter();
  const { save, saving } = useSaveActivity();
  const [finishing, setFinishing] = useState<boolean>(false);
  const finishingRef = useRef<boolean>(false);

  const finish = async (): Promise<FinishOutcome> => {
    if (finishingRef.current) return 'failed';
    finishingRef.current = true;
    setFinishing(true);
    pause();
    const snapshot = await tracker.stop();
    const hr = heartRate.finish();
    if (elapsedSeconds < MIN_SAVE_SECONDS) {
      await clearSession();
      finishingRef.current = false;
      setFinishing(false);
      return 'tooShort';
    }
    const distanceMeters = Math.round(snapshot.distanceMeters);
    const averagePace =
      snapshot.distanceMeters > 0 ? paceSecondsPerKm(snapshot.distanceMeters, elapsedSeconds) : null;
    const draft: NewActivity = {
      type,
      started_at: startedAtRef.current.toISOString(),
      ended_at: new Date().toISOString(),
      duration_seconds: elapsedSeconds,
      distance_meters: distanceMeters,
      avg_pace_seconds_per_km: averagePace,
      route: snapshot.route.length > 0 ? snapshot.route : null,
      splits: snapshot.splits.length > 0 ? snapshot.splits : null,
      user_plan_workout_id: userPlanWorkoutId,
      avg_heart_rate: hr?.avg ?? null,
      max_heart_rate: hr?.max ?? null,
    };
    const status = await save(draft, hr?.samples ?? []);
    if (status !== 'failed') await clearSession();
    setWorkoutSummary({
      type,
      startedAt: draft.started_at,
      durationSeconds: elapsedSeconds,
      distanceMeters,
      averagePaceSecondsPerKm: averagePace,
      splits: snapshot.splits,
      status,
      distanceUnit,
      draft,
      heartRate: hr,
      discardSession: clearSession,
    });
    router.replace('/workout/summary');
    return status;
  };

  return { finishing, saving, finish };
}
