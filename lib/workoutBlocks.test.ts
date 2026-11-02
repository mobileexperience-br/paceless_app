import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { blockAt, type WorkoutBlock } from './workoutBlocks.ts';

const blocks: WorkoutBlock[] = [
  { kind: 'warmup', label: 'Aquecimento', startSec: 0, endSec: 60 },
  { kind: 'run', label: 'Corrida', startSec: 60, endSec: 120 },
];

describe('execucao guiada por blocos', () => {
  it('sem blocos fica no estado vazio', () => {
    assert.deepEqual(blockAt([], 30), { index: 0, current: null, next: null, remainingSec: 0, done: false });
  });

  it('avanca de bloco e conclui ao fim do ultimo', () => {
    assert.equal(blockAt(blocks, 0).index, 0);
    assert.equal(blockAt(blocks, 0).remainingSec, 60);
    assert.equal(blockAt(blocks, 60).index, 1);
    assert.equal(blockAt(blocks, 120).done, true);
  });

  it('tempo negativo e tratado como zero', () => {
    assert.equal(blockAt(blocks, -5).index, 0);
    assert.equal(blockAt(blocks, -5).remainingSec, 60);
  });
});
