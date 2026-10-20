import { useRef, useState, type RefObject } from 'react';
import { useRouter } from 'expo-router';
import type { RunTracker } from '@/hooks/useRunTracker';
import { paceSecondsPerKm } from '@/lib/geo';
import { useSaveActivity, type NewActivity } from '@/hooks/useSaveActivity';
import type { WorkoutType } from '@/lib/activities';
import { setWorkoutSummary } from '@/lib/workoutSummary';
import type { DistanceUnit } from '@/types/preferences';

const MIN_SAVE_SECONDS = 10;

interface FinishWorkoutOptions {
  type: WorkoutType;
  startedAtRef: RefObject<Date>;
  elapsedSeconds: number;
  tracker: RunTracker;
  distanceUnit: DistanceUnit;
  pause: () => void;
}

interface FinishWorkout {
  finishing: boolean;
  finish: () => Promise<void>;
}

export function useFinishWorkout({
  type,
  startedAtRef,
  elapsedSeconds,
  tracker,
  distanceUnit,
  pause,
}: FinishWorkoutOptions): FinishWorkout {
  const router = useRouter();
  const { save } = useSaveActivity();
  const [finishing, setFinishing] = useState<boolean>(false);
  const finishingRef = useRef<boolean>(false);

  const finish = async (): Promise<void> => {
    if (finishingRef.current) return;
    finishingRef.current = true;
    setFinishing(true);
    pause();
    const snapshot = await tracker.stop();
    if (elapsedSeconds < MIN_SAVE_SECONDS) {
      router.back();
      return;
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
    };
    const status = await save(draft);
    setWorkoutSummary({
      type,
      durationSeconds: elapsedSeconds,
      distanceMeters,
      averagePaceSecondsPerKm: averagePace,
      splits: snapshot.splits,
      status,
      distanceUnit,
    });
    router.replace('/workout/summary');
  };

  return { finishing, finish };
}
