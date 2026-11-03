import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { errorCodeOf } from './functionErrorCode.ts';

function httpError(context: unknown): { context: unknown } {
  return { context };
}

describe('errorCodeOf', () => {
  it('le o codigo do corpo quando o context e um objeto com json()', async () => {
    const context = { json: () => Promise.resolve({ error: 'level_not_supported' }) };
    assert.equal(await errorCodeOf(httpError(context)), 'level_not_supported');
  });

  it('le o codigo de uma Response real', async () => {
    const context = new Response(JSON.stringify({ error: 'profile_incomplete' }), { status: 422 });
    assert.equal(await errorCodeOf(httpError(context)), 'profile_incomplete');
  });

  it('retorna null quando o context nao tem json()', async () => {
    assert.equal(await errorCodeOf(httpError({ status: 422 })), null);
    assert.equal(await errorCodeOf(httpError(undefined)), null);
  });

  it('retorna null quando json() lanca', async () => {
    const context = {
      json: () => Promise.reject(new SyntaxError('Unexpected end of JSON input')),
    };
    assert.equal(await errorCodeOf(httpError(context)), null);
  });

  it('retorna null para erros sem context ou sem campo error', async () => {
    assert.equal(await errorCodeOf(new Error('network')), null);
    assert.equal(await errorCodeOf(null), null);
    const context = { json: () => Promise.resolve({ message: 'x' }) };
    assert.equal(await errorCodeOf(httpError(context)), null);
  });
});
