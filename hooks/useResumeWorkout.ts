import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { useWorkoutDialogs } from '@/components/workout/workoutDialogs';
import { discardActiveSession, loadResumableSession } from '@/lib/activeSession';

export function useResumeWorkout(enabled: boolean): void {
  const router = useRouter();
  const { askResume } = useWorkoutDialogs();
  const checkedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!enabled || checkedRef.current) return;
    checkedRef.current = true;
    const check = async (): Promise<void> => {
      const resumable = await loadResumableSession();
      if (!resumable) return;
      const resume = await askResume();
      if (resume) router.push({ pathname: '/workout/[id]', params: { id: 'atual', resume: '1' } });
      else await discardActiveSession();
    };
    void check();
  }, [enabled, askResume, router]);
}
