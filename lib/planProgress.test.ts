import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { planProgress, sessionState, weekDays } from './planProgress.ts';
import type { ActivePlan, PlanSession, PlanWeek, UserPlanWorkoutStatus } from '@/types/training';

const today = '2026-11-02';

function session(date: string, status: UserPlanWorkoutStatus, id = date): PlanSession {
  return { id, date, status, weekNumber: 1, attempt: 1, workout: { position: 0 } } as unknown as PlanSession;
}

describe('estados de sessao', () => {
  it('concluida permanece concluida', () => {
    assert.equal(sessionState('completed', '2026-11-01', today), 'completed');
  });

  it('em andamento e pausada viram in_progress', () => {
    assert.equal(sessionState('in_progress', today, today), 'in_progress');
    assert.equal(sessionState('paused', today, today), 'in_progress');
  });

  it('interrompida e cancelada mantem o proprio estado', () => {
    assert.equal(sessionState('interrupted', today, today), 'interrupted');
    assert.equal(sessionState('cancelled', today, today), 'cancelled');
  });

  it('agendada vira missed, today ou pending conforme a data', () => {
    assert.equal(sessionState('scheduled', '2026-11-01', today), 'missed');
    assert.equal(sessionState('scheduled', today, today), 'today');
    assert.equal(sessionState('scheduled', '2026-11-03', today), 'pending');
  });
});

describe('dias da semana com descanso', () => {
  it('retorna 7 dias e deixa vazios os dias sem sessao', () => {
    const week = {
      weekNumber: 1,
      sessions: [session('2026-11-03', 'scheduled'), session('2026-11-05', 'scheduled')],
    } as unknown as PlanWeek;
    const days = weekDays(week, today);
    assert.equal(days.length, 7);
    assert.equal(days[0]?.date, '2026-11-02');
    assert.equal(days[6]?.date, '2026-11-08');
    assert.equal(days.filter((day) => day.sessions.length === 0).length, 5);
  });
});

describe('progresso do plano', () => {
  it('conta sessoes concluidas sobre o total', () => {
    const weeks = [
      {
        weekNumber: 1,
        sessions: [
          session('2026-11-02', 'completed', 'a'),
          session('2026-11-04', 'interrupted', 'b'),
          session('2026-11-06', 'scheduled', 'c'),
        ],
      },
    ];
    const plan = { weeks } as unknown as ActivePlan;
    assert.deepEqual(planProgress(plan), { done: 1, total: 3 });
  });
});
