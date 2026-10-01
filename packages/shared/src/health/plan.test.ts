import { describe, expect, it } from 'vitest';

import { bmiCategory, bodyResult, calculateBmi, suggestedGoal } from './body';
import { buildPlan, paceOptions } from './plan';
import type { BodyInput } from './types';

const TODAY = new Date(2026, 9, 1);

// The worked example from spec 1.7.
const hamza: BodyInput = {
  sex: 'male',
  age: 28,
  heightCm: 175.3,
  weightKg: 78,
  activity: 'light',
};

describe('spec worked example (male, 28, 175.3 cm, 78 kg, lightly active, lose/steady/3+snack)', () => {
  const body = bodyResult(hamza);
  const plan = buildPlan({
    body: hamza,
    goal: 'lose',
    pace: 'steady',
    mealsPerDay: '3_snack',
    today: TODAY,
  });

  it('computes the body result', () => {
    expect(body.bmi).toBe(25.4);
    expect(body.category).toBe('overweight');
    expect(body.healthyRange).toEqual({ minKg: 57, maxKg: 70 });
    expect(body.target).toEqual({ targetKg: 70, isStepTarget: false });
    expect(body.changeKg).toBe(-8);
    expect(body.milestoneKg).toBe(4);
    expect(body.suggestedGoal).toBe('lose');
  });

  it('computes the daily plan', () => {
    expect(plan.bmr).toBe(1741);
    expect(plan.tdee).toBe(2393);
    expect(plan.kcal).toBe(1850);
    expect(plan.proteinG).toBe(110);
    expect(plan.fatG).toBe(58);
    expect(plan.carbsG).toBe(222);
    expect(plan.fibreMinG).toBe(30);
    expect(plan.sugarMaxG).toBe(23);
    expect(plan.waterL).toBe(2.7);
    expect(plan.macroPercent).toEqual({ protein: 24, carbs: 48, fat: 28 });
  });

  it('computes the timeline', () => {
    expect(plan.weeksToTarget).toBe(16);
    expect(plan.weeksToMilestone).toBe(8);
    expect(plan.targetDate).toEqual(new Date(2027, 0, 21));
  });

  it('splits meals so every column sums exactly to the day', () => {
    expect(plan.meals.map((m) => m.slot)).toEqual(['breakfast', 'lunch', 'dinner', 'snack']);
    const sum = (key: 'kcal' | 'proteinG' | 'carbsG' | 'fatG' | 'fibreG' | 'sugarMaxG') =>
      plan.meals.reduce((total, m) => total + m[key], 0);
    expect(sum('kcal')).toBe(plan.kcal);
    expect(sum('proteinG')).toBe(plan.proteinG);
    expect(sum('carbsG')).toBe(plan.carbsG);
    expect(sum('fatG')).toBe(plan.fatG);
    expect(sum('fibreG')).toBe(plan.fibreMinG);
    expect(sum('sugarMaxG')).toBe(plan.sugarMaxG);
  });

  it('matches the spec per-meal table for grams', () => {
    expect(plan.meals.map((m) => m.proteinG)).toEqual([28, 38, 33, 11]);
    expect(plan.meals.map((m) => m.carbsG)).toEqual([56, 77, 67, 22]);
    expect(plan.meals.map((m) => m.fatG)).toEqual([15, 20, 17, 6]);
    expect(plan.meals.map((m) => m.fibreG)).toEqual([8, 10, 9, 3]);
    // The spec table shows 460/650 for breakfast/lunch, which doesn't follow its own
    // "round to 5, remainder to the largest meal" rule; the rule gives 465/645.
    expect(plan.meals.map((m) => m.kcal)).toEqual([465, 645, 555, 185]);
  });

  it('disables the faster pace when it breaks the 25% deficit cap', () => {
    const options = paceOptions(hamza, 'lose', TODAY);
    expect(options.map((o) => [o.pace, o.allowed])).toEqual([
      ['gentle', true],
      ['steady', true],
      ['faster', false],
    ]);
    expect(options[1]).toMatchObject({ weeklyKg: -0.5, kcalPerDay: -550, weeks: 16 });
  });
});

describe('BMI categories (Asian cut-offs)', () => {
  it.each([
    [18.4, 'underweight'],
    [18.5, 'healthy'],
    [22.9, 'healthy'],
    [23, 'overweight'],
    [27.4, 'overweight'],
    [27.5, 'obese'],
  ] as const)('%s → %s', (bmi, category) => {
    expect(bmiCategory(bmi)).toBe(category);
  });
});

describe('target weight', () => {
  it('uses a step target of 90% when the healthy max is more than 20% away', () => {
    const result = bodyResult({ ...hamza, weightKg: 110 });
    expect(result.category).toBe('obese');
    expect(result.target).toEqual({ targetKg: 99, isStepTarget: true });
    expect(result.milestoneKg).toBe(5.5);
  });

  it('targets the bottom of the range plus 2 kg when underweight', () => {
    const result = bodyResult({ ...hamza, weightKg: 52 });
    expect(result.category).toBe('underweight');
    expect(result.target.targetKg).toBe(59);
    expect(result.changeKg).toBe(7);
    expect(result.suggestedGoal).toBe('gain');
  });

  it('keeps current weight when healthy', () => {
    const result = bodyResult({ ...hamza, weightKg: 65 });
    expect(result.target.targetKg).toBe(65);
    expect(result.changeKg).toBe(0);
    expect(result.milestoneKg).toBeNull();
  });
});

describe('waist check', () => {
  it('suggests build muscle for an active overweight user with a healthy waist', () => {
    const body = { ...hamza, activity: 'active' as const, waistCm: 80 };
    expect(bodyResult(body).waistToHeight).toBe(0.46);
    expect(suggestedGoal(body)).toBe('build_muscle');
  });

  it('keeps lose when the waist is high', () => {
    expect(suggestedGoal({ ...hamza, activity: 'active', waistCm: 95 })).toBe('lose');
  });
});

describe('safety overrides', () => {
  it('gives minors healthy growth with no weight target, even if they ask to lose', () => {
    const teen: BodyInput = { ...hamza, age: 16 };
    const result = bodyResult(teen);
    expect(result.safety.minor).toBe(true);
    expect(result.changeKg).toBe(0);
    const plan = buildPlan({ body: teen, goal: 'lose', today: TODAY });
    expect(plan.goal).toBe('healthy_growth');
    expect(plan.kcal % 50).toBe(0);
    expect(plan.weeksToTarget).toBeNull();
  });

  it('never gives a weight-loss plan during pregnancy or breastfeeding', () => {
    const body: BodyInput = {
      sex: 'female',
      age: 30,
      heightCm: 160,
      weightKg: 70,
      activity: 'light',
      pregnantOrBreastfeeding: true,
    };
    expect(buildPlan({ body, goal: 'lose', today: TODAY }).goal).toBe('maintain');
  });

  it('flags a doctor recommendation at extreme BMI', () => {
    expect(bodyResult({ ...hamza, weightKg: 45 }).safety.seeDoctor).toBe(true);
    expect(bodyResult({ ...hamza, weightKg: 125 }).safety.seeDoctor).toBe(true);
    expect(bodyResult(hamza).safety.seeDoctor).toBe(false);
  });

  it('never goes below the kcal floor', () => {
    const small: BodyInput = {
      sex: 'female',
      age: 45,
      heightCm: 150,
      weightKg: 62,
      activity: 'sedentary',
    };
    const plan = buildPlan({ body: small, goal: 'lose', pace: 'faster', today: TODAY });
    expect(calculateBmi(small.weightKg, small.heightCm)).toBe(27.6);
    expect(plan.kcal).toBeGreaterThanOrEqual(1200);
    expect(paceOptions(small, 'lose', TODAY).every((o) => !o.allowed || o.pace === 'gentle')).toBe(
      true,
    );
  });
});
