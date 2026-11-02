import { useEffect, useState } from 'react';
import { loadResumableSession, type ResumableSession } from '@/lib/activeSession';

interface ResumableWorkout {
  ready: boolean;
  resumed: ResumableSession | null;
}

export function useResumableWorkout(resume: string | undefined): ResumableWorkout {
  const [resumed, setResumed] = useState<ResumableSession | null>(null);
  const [ready, setReady] = useState<boolean>(resume !== '1');

  useEffect(() => {
    if (resume !== '1') return;
    void loadResumableSession().then((loaded) => {
      setResumed(loaded);
      setReady(true);
    });
  }, [resume]);

  return { ready, resumed };
}
