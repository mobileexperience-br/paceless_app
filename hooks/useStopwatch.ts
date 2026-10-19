import { useCallback, useEffect, useState } from 'react';

const TICK_MS = 250;
const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;

interface StopwatchState {
  accumulatedMs: number;
  startedAt: number | null;
}

interface Stopwatch {
  elapsedMs: number;
  formatted: string;
  running: boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
}

const initialState: StopwatchState = { accumulatedMs: 0, startedAt: null };

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function formatElapsed(elapsedMs: number): string {
  const totalSeconds = Math.floor(elapsedMs / MS_PER_SECOND);
  const hours = Math.floor(totalSeconds / SECONDS_PER_HOUR);
  const minutes = Math.floor((totalSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  const seconds = totalSeconds % SECONDS_PER_MINUTE;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function useStopwatch(): Stopwatch {
  const [state, setState] = useState<StopwatchState>(initialState);
  const [now, setNow] = useState<number>(() => Date.now());
  const running = state.startedAt !== null;

  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval((): void => { setNow(Date.now()); }, TICK_MS);
    return (): void => { clearInterval(id); };
  }, [running]);

  const start = useCallback((): void => {
    setState((prev) =>
      prev.startedAt === null ? { ...prev, startedAt: Date.now() } : prev,
    );
  }, []);

  const pause = useCallback((): void => {
    setState((prev) =>
      prev.startedAt === null
        ? prev
        : {
            accumulatedMs: prev.accumulatedMs + (Date.now() - prev.startedAt),
            startedAt: null,
          },
    );
  }, []);

  const reset = useCallback((): void => {
    setState(initialState);
  }, []);

  const elapsedMs =
    state.accumulatedMs + (state.startedAt === null ? 0 : Math.max(0, now - state.startedAt));

  return {
    elapsedMs,
    formatted: formatElapsed(elapsedMs),
    running,
    start,
    pause,
    resume: start,
    reset,
  };
}
