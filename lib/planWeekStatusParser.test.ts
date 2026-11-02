import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parsePlanWeekStatus } from './planWeekStatusParser.ts';

const payload = {
  user_plan_id: 'plan-1',
  current_week: 2,
  current_attempt: 1,
  week_started_on: '2026-11-02',
  week_ends_on: '2026-11-08',
  eligible: 3,
  completed: 2,
  minimum: 2,
  adherence: 0.67,
  closed: false,
  can_advance: false,
  can_repeat: true,
  is_last_week: false,
  block_reason: null,
};

const expected = {
  userPlanId: 'plan-1',
  currentWeek: 2,
  currentAttempt: 1,
  weekStartedOn: '2026-11-02',
  weekEndsOn: '2026-11-08',
  eligible: 3,
  completed: 2,
  minimum: 2,
  adherence: 0.67,
  closed: false,
  canAdvance: false,
  canRepeat: true,
  isLastWeek: false,
  blockReason: null,
};

describe('parsePlanWeekStatus', () => {
  it('converte o payload completo para camelCase', () => {
    assert.deepEqual(parsePlanWeekStatus(payload), expected);
  });

  it('aderencia ausente vira null e nao 0', () => {
    const { adherence: _adherence, ...withoutAdherence } = payload;
    assert.equal(parsePlanWeekStatus(withoutAdherence)?.adherence, null);
  });

  it('sem can_advance retorna null', () => {
    const { can_advance: _canAdvance, ...withoutCanAdvance } = payload;
    assert.equal(parsePlanWeekStatus(withoutCanAdvance), null);
  });

  it('aceita motivo de bloqueio conhecido e descarta desconhecido', () => {
    assert.equal(parsePlanWeekStatus({ ...payload, block_reason: 'below_minimum' })?.blockReason, 'below_minimum');
    assert.equal(parsePlanWeekStatus({ ...payload, block_reason: 'xyz' })?.blockReason, null);
  });

  it('valores que nao sao objeto retornam null', () => {
    assert.equal(parsePlanWeekStatus(null), null);
    assert.equal(parsePlanWeekStatus('texto'), null);
    assert.equal(parsePlanWeekStatus([]), null);
  });
});
