import { useEffect, useState } from 'react';

const TICK_MS = 1000;

export function useWallClock(startedAtMs: number): number {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const id = setInterval((): void => {
      setNow(Date.now());
    }, TICK_MS);
    return (): void => {
      clearInterval(id);
    };
  }, []);

  return Math.max(0, now - startedAtMs);
}
