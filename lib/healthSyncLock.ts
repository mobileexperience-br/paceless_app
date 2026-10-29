let inFlight: Promise<unknown> | null = null;

export async function withSyncLock<T>(job: () => Promise<T>): Promise<T | null> {
  if (inFlight !== null) return null;
  const run = job().finally(() => {
    inFlight = null;
  });
  inFlight = run;
  return run;
}
