import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  achievementKey,
  analyticsSessionId,
  isFreshSignup,
  isWeeklyGoalCompleted,
  MAX_SENT_KEYS,
  rememberKey,
  templateVersionLabel,
  weeklyGoalKey,
} from './analyticsRules.ts';
import type { PlanWeekStatus } from '@/types/planWeek';

function weekStatus(overrides: Partial<PlanWeekStatus> = {}): PlanWeekStatus {
  return {
    userPlanId: 'plan-1',
    currentWeek: 2,
    currentAttempt: 1,
    weekStartedOn: '2026-11-02',
    weekEndsOn: '2026-11-08',
    eligible: 3,
    completed: 3,
    minimum: 2,
    adherence: 1,
    closed: false,
    canAdvance: false,
    canRepeat: false,
    isLastWeek: false,
    blockReason: null,
    ...overrides,
  };
}

describe('regras de deduplicacao', () => {
  it('registra a chave uma vez e ignora repeticoes', () => {
    assert.deepEqual(rememberKey([], 'k'), { sent: ['k'], isNew: true });
    assert.deepEqual(rememberKey(['k'], 'k'), { sent: ['k'], isNew: false });
  });

  it('concede a mesma conquista so uma vez', () => {
    const first = rememberKey([], achievementKey('first_workout'));
    const second = rememberKey(first.sent, achievementKey('first_workout'));
    assert.equal(first.isNew, true);
    assert.equal(second.isNew, false);
  });

  it('mantem no maximo 200 chaves e descarta a mais antiga', () => {
    const sent = Array.from({ length: MAX_SENT_KEYS }, (_, index) => `key-${index}`);
    const result = rememberKey(sent, 'nova');
    assert.equal(result.sent.length, MAX_SENT_KEYS);
    assert.equal(result.sent[0], 'key-1');
    assert.equal(result.sent[result.sent.length - 1], 'nova');
  });
});

describe('meta semanal', () => {
  it('so conta como concluida com todas as sessoes elegiveis feitas', () => {
    assert.equal(isWeeklyGoalCompleted(null), false);
    assert.equal(isWeeklyGoalCompleted(weekStatus({ eligible: 0, completed: 0 })), false);
    assert.equal(isWeeklyGoalCompleted(weekStatus({ eligible: 3, completed: 2 })), false);
    assert.equal(isWeeklyGoalCompleted(weekStatus({ eligible: 3, completed: 3 })), true);
  });

  it('a chave muda quando a semana e repetida', () => {
    assert.notEqual(
      weeklyGoalKey(weekStatus({ currentAttempt: 1 })),
      weeklyGoalKey(weekStatus({ currentAttempt: 2 })),
    );
  });
});

describe('cadastro recente', () => {
  it('considera cadastro recente ate 60 segundos', () => {
    assert.equal(isFreshSignup('2026-11-02T10:00:00Z', '2026-11-02T10:00:05Z'), true);
    assert.equal(isFreshSignup('2026-11-02T10:00:00Z', '2026-11-02T12:00:00Z'), false);
  });

  it('recusa datas ausentes ou invalidas', () => {
    assert.equal(isFreshSignup(undefined, '2026-11-02T10:00:00Z'), false);
    assert.equal(isFreshSignup('2026-11-02T10:00:00Z', 'invalida'), false);
  });
});

describe('rotulos de analytics', () => {
  it('formata a versao do template', () => {
    assert.equal(templateVersionLabel(3), 'v3');
    assert.equal(templateVersionLabel(undefined), 'unknown');
    assert.equal(templateVersionLabel(0), 'unknown');
    assert.equal(templateVersionLabel('3'), 'unknown');
  });

  it('usa o id da sessao do plano quando existe', () => {
    assert.equal(analyticsSessionId(null, 'act'), 'act');
    assert.equal(analyticsSessionId('ses', 'act'), 'ses');
  });
});
