import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { addDays, daysBetween, mondayOf, weekdayName } from './planCalendar.ts';
import { localToday } from './planDates.ts';

describe('planCalendar', () => {
  it('soma dias atravessando mes e ano', () => {
    assert.equal(addDays('2026-12-30', 3), '2027-01-02');
    assert.equal(addDays('2026-03-01', -1), '2026-02-28');
  });

  it('encontra a segunda-feira da semana', () => {
    assert.equal(mondayOf('2026-11-08'), '2026-11-02');
    assert.equal(mondayOf('2026-11-02'), '2026-11-02');
  });

  it('conta dias entre datas', () => {
    assert.equal(daysBetween('2026-11-02', '2026-11-09'), 7);
  });

  it('nomeia o dia da semana em PT-BR', () => {
    assert.equal(weekdayName('2026-11-02'), 'Segunda');
    assert.equal(weekdayName('2026-11-08'), 'Domingo');
  });

  it('vira o dia no fuso do produto (America/Sao_Paulo)', () => {
    assert.equal(localToday(new Date('2026-11-03T02:59:00Z')), '2026-11-02');
    assert.equal(localToday(new Date('2026-11-03T03:00:00Z')), '2026-11-03');
  });
});
