import { useEffect, useRef } from 'react';
import { track } from '@/lib/analytics';
import type { WorkoutType } from '@/lib/activities';

interface WorkoutAnalyticsOptions {
  sessionId: string;
  type: WorkoutType;
  running: boolean;
  resumed: boolean;
  finishing: boolean;
  elapsedSeconds: number;
}

export function useWorkoutAnalytics({
  sessionId,
  type,
  running,
  resumed,
  finishing,
  elapsedSeconds,
}: WorkoutAnalyticsOptions): void {
  const startedRef = useRef<boolean>(false);
  const wasRunningRef = useRef<boolean>(false);
  const elapsedRef = useRef<number>(elapsedSeconds);

  useEffect(() => {
    elapsedRef.current = elapsedSeconds;
  }, [elapsedSeconds]);

  useEffect(() => {
    if (running && !startedRef.current) {
      startedRef.current = true;
      if (!resumed) track('workout_started', { session_id: sessionId, workout_type: type });
    }
    if (!running && wasRunningRef.current && !finishing) {
      track('workout_paused', { session_id: sessionId, elapsed_seconds: elapsedRef.current });
    }
    wasRunningRef.current = running;
  }, [running, resumed, finishing, sessionId, type]);
}
