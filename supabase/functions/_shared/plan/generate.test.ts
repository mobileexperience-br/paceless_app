import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPlan } from './generate.ts';
import { settingsHash } from './hash.ts';
import { anchorMonday } from './schedule.ts';
import { rawWeeklyMinutes, weekKind, weeklyMinutes } from './volume.ts';
import { maxWeeklyMinutes, planWeeks, startWeeklyMinutes } from './tables.ts';
import { goals, levels, type BuildPlanInput, type GeneratedWorkout, type PlanStep } from './types.ts';

const base: BuildPlanInput = {
  goal: 'run_5k',
  level: 'sometimes',
  trainingDays: [2, 4, 6],
  strength: 'no',
  tier: 'full',
  startDate: '2026-10-26',
};

function runsOf(workouts: GeneratedWorkout[]): GeneratedWorkout[] {
  return workouts.filter((workout) => workout.kind === 'run');
}

function secondsOf(step: PlanStep | undefined): number | undefined {
  return step?.kind === 'repeat' ? undefined : step?.durationSec;
}

function repeatStep(steps: PlanStep[]): Extract<PlanStep, { kind: 'repeat' }> | undefined {
  return steps.find((step): step is Extract<PlanStep, { kind: 'repeat' }> => step.kind === 'repeat');
}

test('gera o mesmo plano para a mesma entrada', () => {
  assert.deepEqual(buildPlan(base), buildPlan({ ...base }));
});

test('treinos caem só nos dias escolhidos e nunca antes do início', () => {
  const plan = buildPlan({ ...base, trainingDays: [6, 2, 4, 4] });
  for (const week of plan.weeks) {
    for (const workout of week.workouts) {
      assert.ok([2, 4, 6].includes(workout.day_of_week));
      assert.ok(workout.scheduled_date >= base.startDate);
    }
  }
});

test('never_ran com [2,4,6] começa com 3 corridas no estágio 1 e sem treino de ritmo', () => {
  const plan = buildPlan({ ...base, level: 'never_ran' });
  const firstWeek = plan.weeks[0]?.workouts ?? [];
  const runs = runsOf(firstWeek);
  assert.equal(runs.length, 3);
  for (const run of runs) {
    const repeat = repeatStep(run.steps);
    assert.equal(repeat?.times, 8);
    assert.equal(secondsOf(repeat?.steps[0]), 60);
    assert.equal(secondsOf(repeat?.steps[1]), 120);
    assert.notEqual(run.title, 'Treino de ritmo');
    assert.notEqual(run.title, 'Fartlek');
  }
});

test('semana de recuperação tem menos minutos que a anterior e a seguinte volta a crescer', () => {
  const input = { goal: 'start_running' as const, level: 'never_ran' as const };
  const week3 = weeklyMinutes(input, 3);
  assert.ok(weeklyMinutes(input, 4) < week3);
  assert.ok(weeklyMinutes(input, 5) >= week3);
});

test('crescimento entre semanas normais é de no máximo 10% e nunca passa do teto', () => {
  for (const goal of goals) {
    for (const level of levels) {
      const raw = rawWeeklyMinutes(goal, level);
      const total = planWeeks[goal][level];
      const kindAt = (week: number): string => weekKind(goal, week, total);
      for (let week = 2; week <= total; week += 1) {
        const comparable = kindAt(week) === 'normal' && (week === 2 || kindAt(week - 1) === 'normal');
        if (comparable) {
          assert.ok((raw[week - 1] ?? 0) <= (raw[week - 2] ?? 0) * 1.1 + 1e-9);
        }
        assert.ok(weeklyMinutes({ goal, level }, week) <= maxWeeklyMinutes[level]);
      }
      assert.equal(weeklyMinutes({ goal, level }, 1), startWeeklyMinutes[level]);
    }
  }
});

test('plano grátis tem 2 semanas iguais às duas primeiras do plano completo', () => {
  const full = buildPlan({ ...base, goal: 'run_10k', level: 'weekly' });
  const free = buildPlan({ ...base, goal: 'run_10k', level: 'weekly', tier: 'free' });
  assert.equal(free.weeks.length, 2);
  assert.deepEqual(free.weeks, full.weeks.slice(0, 2));
});

test('força aparece no máximo 2 vezes por semana, nunca no dia longo nem no dia de ritmo', () => {
  const plan = buildPlan({ ...base, goal: 'run_10k', level: 'weekly', trainingDays: [1, 2, 3, 4, 5, 6, 7], strength: 'yes' });
  for (const week of plan.weeks) {
    const runs = runsOf(week.workouts);
    const longDay = Math.max(...runs.map((run) => run.day_of_week));
    const keyDays = runs.filter((run) => run.title === 'Treino de ritmo' || run.title === 'Fartlek').map((run) => run.day_of_week);
    const strength = week.workouts.filter((workout) => workout.kind === 'strength');
    assert.ok(strength.length <= 2);
    for (const session of strength) {
      assert.notEqual(session.day_of_week, longDay);
      assert.ok(!keyDays.includes(session.day_of_week));
    }
  }
  const firstWeekRuns = runsOf(plan.weeks[0]?.workouts ?? []);
  assert.ok(plan.weeks[0]?.workouts.some((workout) => workout.kind === 'strength'));
  assert.equal(plan.sessions_per_week, firstWeekRuns.length);
});

test('run_10k tem sessão de prova na última semana com 10000 m', () => {
  const plan = buildPlan({ ...base, goal: 'run_10k', level: 'weekly' });
  const last = plan.weeks.at(-1)?.workouts ?? [];
  assert.ok(last.some((workout) => workout.target_distance_meters === 10000));
});

test('6 dias de treino em never_ran geram só 3 corridas por semana', () => {
  const plan = buildPlan({ ...base, level: 'never_ran', trainingDays: [1, 2, 3, 4, 5, 6] });
  for (const week of plan.weeks) {
    assert.equal(runsOf(week.workouts).length, 3);
  }
});

test('settingsHash muda quando qualquer entrada muda', () => {
  const hashes = new Set([
    settingsHash(base),
    settingsHash({ ...base, goal: 'run_10k' }),
    settingsHash({ ...base, level: 'weekly' }),
    settingsHash({ ...base, trainingDays: [1, 3, 5] }),
    settingsHash({ ...base, strength: 'yes' }),
    settingsHash({ ...base, tier: 'free' }),
  ]);
  assert.equal(hashes.size, 6);
  assert.equal(settingsHash(base), 'v2|run_5k|sometimes|2,4,6|no|full');
});

test('ancoragem: início em quinta com [2,4,6] começa na segunda seguinte', () => {
  assert.equal(anchorMonday('2026-10-29', 2), '2026-11-02');
  const plan = buildPlan({ ...base, startDate: '2026-10-29', level: 'weekly' });
  assert.equal(plan.weeks[0]?.workouts[0]?.scheduled_date, '2026-11-03');
});

test('plano free informa o total de semanas do plano completo', () => {
  const plan = buildPlan({ ...base, goal: 'run_10k', level: 'never_ran', tier: 'free' });
  assert.equal(plan.full_weeks, 12);
  assert.equal(plan.weeks.length, 2);
});
