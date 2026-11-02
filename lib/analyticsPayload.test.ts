import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildAnalyticsPayload } from './analyticsPayload.ts';

describe('payload de analytics', () => {
  it('arredonda numeros e mantem so as propriedades permitidas', () => {
    assert.deepEqual(
      buildAnalyticsPayload('workout_completed', {
        session_id: 'a',
        duration: 61.6,
        distance: 1000.4,
        source: 'paceless',
      }),
      { session_id: 'a', duration: 62, distance: 1000, source: 'paceless' },
    );
  });

  it('descarta chaves que nao estao na lista (ex.: e-mail)', () => {
    const payload = buildAnalyticsPayload('workout_started', {
      session_id: 'a',
      workout_type: 'run',
      email: 'x@y.z',
    } as never);
    assert.equal('email' in payload, false);
    assert.deepEqual(payload, { session_id: 'a', workout_type: 'run' });
  });

  it('corta textos em 64 caracteres', () => {
    const payload = buildAnalyticsPayload('workout_started', {
      session_id: 'x'.repeat(100),
      workout_type: 'run',
    });
    assert.equal(payload['session_id'], 'x'.repeat(64));
  });

  it('remove NaN e mantem null', () => {
    const payload = buildAnalyticsPayload('workout_paused', {
      session_id: 'a',
      elapsed_seconds: Number.NaN,
    });
    assert.equal('elapsed_seconds' in payload, false);
    const interrupted = buildAnalyticsPayload('workout_interrupted', {
      session_id: 'a',
      reason_optional: null,
    });
    assert.equal(interrupted['reason_optional'], null);
  });
});
