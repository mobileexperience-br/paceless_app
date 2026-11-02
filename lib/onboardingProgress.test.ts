import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isEligibleLevel, pendingStep } from './onboardingProgress.ts';
import { trainingDayComboIds } from '@/lib/trainingDayCombos';
import { onboardingStepKeys, type OnboardingAnswers } from '@/types/onboarding';

const completeAnswers: OnboardingAnswers = {
  goal: 'complete_5k',
  level: 'beginner',
  daysPerWeek: 'three',
  trainingDays: trainingDayComboIds[0] as OnboardingAnswers['trainingDays'],
  strength: 'no',
};

describe('elegibilidade do onboarding', () => {
  it('aceita os niveis iniciantes', () => {
    assert.equal(isEligibleLevel('total_beginner'), true);
    assert.equal(isEligibleLevel('beginner'), true);
  });

  it('recusa intermediario e avancado (DP-01)', () => {
    assert.equal(isEligibleLevel('intermediate'), false);
    assert.equal(isEligibleLevel('advanced'), false);
  });

  it('pede a primeira etapa sem respostas e nenhuma com tudo respondido', () => {
    assert.equal(pendingStep({}), onboardingStepKeys[0]);
    assert.equal(pendingStep(completeAnswers), null);
  });
});
