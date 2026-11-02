import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPlan } from './generate.ts';
import { settingsHash } from './hash.ts';
import { anchorMonday } from './schedule.ts';
import { intervalStages } from './tables.ts';
import { parseProfile } from './rows.ts';
import { goals, eligibleLevels, type BuildPlanInput, type GeneratedWorkout, type PlanStep } from './types.ts';

const base: BuildPlanInput = {
  goal: 'complete_5k',
  level: 'beginner',
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

test('todo plano completo tem 8 semanas para os 4 objetivos e os 2 níveis elegíveis', () => {
  for (const goal of goals) {
    for (const level of eligibleLevels) {
      const plan = buildPlan({ ...base, goal, level });
      assert.equal(plan.weeks.length, 8);
      assert.equal(plan.full_weeks, 8);
    }
  }
});

test('plano grátis tem 2 semanas iguais às 2 primeiras do plano completo', () => {
  const full = buildPlan(base);
  const free = buildPlan({ ...base, tier: 'free' });
  assert.equal(free.weeks.length, 2);
  assert.equal(free.full_weeks, 8);
  assert.deepEqual(free.weeks, full.weeks.slice(0, 2));
});

test('iniciante total usa na semana N o estágio N de caminhada e corrida', () => {
  const plan = buildPlan({ ...base, level: 'total_beginner' });
  plan.weeks.forEach((week, index) => {
    const stage = intervalStages[index];
    for (const run of runsOf(week.workouts)) {
      const repeat = repeatStep(run.steps);
      assert.equal(repeat?.times, stage?.reps);
      assert.equal(secondsOf(repeat?.steps[0]), stage?.runSec);
      assert.equal(secondsOf(repeat?.steps[1]), stage?.walkSec);
    }
  });
});

test('iniciante usa estágios 5 a 8 nas semanas 1 a 4 e corrida contínua nas semanas 5 a 8', () => {
  const plan = buildPlan(base);
  plan.weeks.slice(0, 4).forEach((week, index) => {
    const stage = intervalStages[index + 4];
    for (const run of runsOf(week.workouts)) {
      assert.equal(repeatStep(run.steps)?.times, stage?.reps);
    }
  });
  for (const week of plan.weeks.slice(4)) {
    for (const run of runsOf(week.workouts)) {
      assert.equal(repeatStep(run.steps), undefined);
    }
  }
});

test('iniciante encerra a semana 8 com corrida de 5 km e iniciante total não tem distância alvo', () => {
  const beginner = buildPlan(base);
  const lastRuns = runsOf(beginner.weeks[7]?.workouts ?? []);
  assert.equal(lastRuns.at(-1)?.target_distance_meters, 5000);

  const totalBeginner = buildPlan({ ...base, level: 'total_beginner' });
  for (const workout of totalBeginner.weeks.flatMap((week) => week.workouts)) {
    assert.equal(workout.target_distance_meters, null);
  }
});

test('o conteúdo do plano não depende do objetivo', () => {
  const reference = buildPlan({ ...base, goal: 'complete_5k' }).weeks;
  for (const goal of goals) {
    assert.deepEqual(buildPlan({ ...base, goal }).weeks, reference);
  }
});

test('seis dias de treino geram no máximo 3 corridas por semana nos dois níveis', () => {
  for (const level of eligibleLevels) {
    const plan = buildPlan({ ...base, level, trainingDays: [1, 2, 3, 4, 5, 6] });
    for (const week of plan.weeks) {
      assert.ok(runsOf(week.workouts).length <= 3);
      assert.equal(runsOf(week.workouts).length, 3);
    }
  }
});

test('força aparece no máximo 2 vezes por semana, nunca no último dia de corrida', () => {
  const plan = buildPlan({ ...base, trainingDays: [1, 2, 3, 4, 5, 6, 7], strength: 'yes' });
  for (const week of plan.weeks) {
    const runs = runsOf(week.workouts);
    const longDay = Math.max(...runs.map((run) => run.day_of_week));
    const strength = week.workouts.filter((workout) => workout.kind === 'strength');
    assert.ok(strength.length <= 2);
    for (const session of strength) {
      assert.notEqual(session.day_of_week, longDay);
    }
  }
  assert.ok(plan.weeks[0]?.workouts.some((workout) => workout.kind === 'strength'));
});

test('strength no não gera nenhum treino de força', () => {
  const plan = buildPlan({ ...base, trainingDays: [1, 2, 3, 4, 5, 6, 7], strength: 'no' });
  for (const week of plan.weeks) {
    assert.equal(week.workouts.filter((workout) => workout.kind === 'strength').length, 0);
  }
});

test('settingsHash tem o formato v3 e muda quando cada entrada muda', () => {
  const hashes = new Set([
    settingsHash(base),
    settingsHash({ ...base, goal: 'race' }),
    settingsHash({ ...base, level: 'total_beginner' }),
    settingsHash({ ...base, trainingDays: [1, 3, 5] }),
    settingsHash({ ...base, strength: 'yes' }),
    settingsHash({ ...base, tier: 'free' }),
  ]);
  assert.equal(hashes.size, 6);
  assert.equal(settingsHash(base), 'v3|complete_5k|beginner|2,4,6|no|full');
});

test('plano gerado informa generator_version 3', () => {
  assert.equal(buildPlan(base).generator_version, 3);
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

test('ancoragem: início em quinta com [2,4,6] começa na segunda seguinte', () => {
  assert.equal(anchorMonday('2026-10-29', 2), '2026-11-02');
  const plan = buildPlan({ ...base, startDate: '2026-10-29' });
  assert.equal(plan.weeks[0]?.workouts[0]?.scheduled_date, '2026-11-03');
});

test('perfil com nível intermediário é lido, e strength nulo vira no', () => {
  const profile = parseProfile({ goal: 'race', level: 'intermediate', training_days: [1, 3], strength: null });
  assert.equal(profile?.level, 'intermediate');
  assert.equal(profile?.strength, 'no');
});
