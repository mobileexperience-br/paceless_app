import { useEffect, useRef } from 'react';
import { reportPlanSession } from '@/lib/planSessionRpc';

export function usePlanSessionReporter(sessionId: string | null, running: boolean): void {
  const hasRun = useRef<boolean>(false);

  useEffect(() => {
    if (sessionId === null) return;
    if (running) {
      hasRun.current = true;
      void reportPlanSession(sessionId, 'in_progress');
      return;
    }
    if (hasRun.current) void reportPlanSession(sessionId, 'paused');
  }, [sessionId, running]);
}
