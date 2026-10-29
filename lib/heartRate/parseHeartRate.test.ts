import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { base64ToBytes } from './base64.ts';
import { parseHeartRate, parseHeartRateBytes } from './parseHeartRate.ts';
import { zoneFor } from './heartRateZones.ts';
import { summarize } from './heartRateStats.ts';

describe('parseHeartRateBytes', () => {
  it('reads an 8-bit bpm with contact unsupported', () => {
    assert.deepEqual(parseHeartRateBytes(Uint8Array.from([0x00, 0x48])), {
      bpm: 72,
      contact: 'unsupported',
      energyKj: null,
      rrMs: [],
    });
  });

  it('reads a 16-bit bpm without filtering it', () => {
    assert.equal(parseHeartRateBytes(Uint8Array.from([0x01, 0x2c, 0x01]))?.bpm, 300);
  });

  it('reads contact detected and lost', () => {
    assert.equal(parseHeartRateBytes(Uint8Array.from([0x06, 0x50]))?.contact, 'detected');
    assert.equal(parseHeartRateBytes(Uint8Array.from([0x04, 0x50]))?.contact, 'lost');
  });

  it('reads energy and RR intervals in milliseconds', () => {
    const reading = parseHeartRateBytes(Uint8Array.from([0x18, 0x50, 0x10, 0x00, 0x00, 0x04, 0x00, 0x02]));
    assert.equal(reading?.energyKj, 16);
    assert.deepEqual(reading?.rrMs, [1000, 500]);
  });

  it('ignores a truncated trailing RR value', () => {
    const reading = parseHeartRateBytes(Uint8Array.from([0x10, 0x50, 0x00, 0x04, 0x07]));
    assert.deepEqual(reading?.rrMs, [1000]);
  });

  it('returns null when the packet is too short', () => {
    assert.equal(parseHeartRateBytes(Uint8Array.from([0x00])), null);
    assert.equal(parseHeartRateBytes(Uint8Array.from([0x01, 0x2c])), null);
  });
});

describe('parseHeartRate (base64)', () => {
  it('round trips AEg= to 72 bpm', () => {
    assert.deepEqual(Array.from(base64ToBytes('AEg=') ?? []), [0x00, 0x48]);
    assert.equal(parseHeartRate('AEg=')?.bpm, 72);
  });

  it('returns null for invalid characters', () => {
    assert.equal(parseHeartRate('AE*='), null);
  });
});

describe('zoneFor', () => {
  it('maps the boundaries of each zone', () => {
    assert.equal(zoneFor(59, 100), 1);
    assert.equal(zoneFor(60, 100), 2);
    assert.equal(zoneFor(70, 100), 3);
    assert.equal(zoneFor(80, 100), 4);
    assert.equal(zoneFor(90, 100), 5);
  });
});

describe('summarize', () => {
  it('returns null without samples', () => {
    assert.equal(summarize([], 190), null);
  });

  it('leaves secondsInZone null when max heart rate is unknown', () => {
    const summary = summarize([{ tOffsetS: 0, bpm: 120 }], null);
    assert.equal(summary?.secondsInZone, null);
    assert.equal(summary?.avg, 120);
    assert.equal(summary?.max, 120);
  });
});
