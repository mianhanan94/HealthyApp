import { describe, expect, it } from 'vitest';

import { allowedGoals, bodyResult, goalTarget, suggestedGoal } from './body';
import { mealBudget, mealSlotForHour, planFit } from './fit';
import { buildPlan, GUEST_MEAL_TARGET, paceOptions } from './plan';
import type { BodyInput } from './types';
import { cmToFeetInches, feetInchesToCm, kgToLbs, lbsToKg } from './units';

const TODAY = new Date(2026, 9, 1);
// 175.3 cm: healthy range 57–70 kg.
const at = (weightKg: number, extra: Partial<BodyInput> = {}): BodyInput => ({
  sex: 'male',
  age: 30,
  heightCm: 175.3,
  weightKg,
  activity: 'light',
  ...extra,
});

describe('allowed goals', () => {
  it('never offers weight loss when underweight', () => {
    expect(allowedGoals(at(52))).toEqual(['gain', 'maintain']);
  });

  it('never offers weight gain when overweight or obese', () => {
    expect(allowedGoals(at(78))).toEqual(['lose', 'maintain']);
    expect(allowedGoals(at(100))).toEqual(['lose', 'maintain']);
  });

  it('offers build muscle to an active overweight user with a healthy waist', () => {
    const body = at(78, { activity: 'active', waistCm: 80 });
    expect(allowedGoals(body)).toEqual(['lose', 'maintain', 'build_muscle']);
    expect(allowedGoals(body)).toContain(suggestedGoal(body));
  });

  it('keeps healthy users away from the edges of the healthy range', () => {
    expect(allowedGoals(at(64))).toEqual(['lose', 'maintain', 'gain', 'build_muscle']);
    // 58 kg is within 2 kg of the 57 kg minimum: no further loss.
    expect(allowedGoals(at(58))).toEqual(['maintain', 'gain', 'build_muscle']);
    // 69 kg is within 2 kg of the 70 kg maximum: no further gain.
    expect(allowedGoals(at(69))).toEqual(['lose', 'maintain', 'build_muscle']);
  });

  it('always suggests a goal that is allowed', () => {
    for (const w of [45, 52, 58, 64, 69, 78, 100, 130]) {
      for (const age of [15, 30, 70]) {
        const body = at(w, { age });
        expect(allowedGoals(body)).toContain(suggestedGoal(body));
      }
    }
  });
});

describe('goal targets', () => {
  it('aims for a modest 5% change inside the healthy range', () => {
    expect(goalTarget(at(64), 'lose')).toEqual({ targetKg: 61, isStepTarget: false });
    expect(goalTarget(at(60), 'lose').targetKg).toBe(59); // floored at min + 2
    expect(goalTarget(at(64), 'gain').targetKg).toBe(67);
    expect(goalTarget(at(66), 'gain').targetKg).toBe(68); // capped at max − 2
  });

  it('holds weight for maintain and build muscle', () => {
    expect(goalTarget(at(64), 'maintain').targetKg).toBe(64);
    expect(goalTarget(at(64), 'build_muscle').targetKg).toBe(64);
  });

  it('gives a healthy user who wants to lose a real timeline', () => {
    const plan = buildPlan({ body: at(64), goal: 'lose', pace: 'gentle', today: TODAY });
    expect(plan.targetKg).toBe(61);
    expect(plan.weeksToTarget).toBe(12);
    expect(paceOptions(at(64), 'lose', TODAY)[0]?.weeks).toBe(12);
  });

  it('drops the milestone when it would come after the target', () => {
    // BMI 23.1: 1 kg to the healthy range, but 5% would be 3.5 kg.
    const plan = buildPlan({ body: at(71), goal: 'lose', today: TODAY });
    expect(plan.targetKg).toBe(70);
    expect(plan.milestoneKg).toBeNull();
    expect(plan.weeksToMilestone).toBeNull();
    expect(plan.weeksToTarget).toBe(2);
    expect(bodyResult(at(71)).milestoneKg).toBeNull();
  });

  it('replaces an unsafe requested goal with the suggested one', () => {
    expect(buildPlan({ body: at(52), goal: 'lose', today: TODAY }).goal).toBe('gain');
    expect(buildPlan({ body: at(100), goal: 'gain', today: TODAY }).goal).toBe('lose');
  });
});

describe('units', () => {
  it('converts height', () => {
    expect(feetInchesToCm(5, 9)).toBe(175.3);
    expect(cmToFeetInches(175.3)).toEqual({ feet: 5, inches: 9 });
    expect(cmToFeetInches(182.5)).toEqual({ feet: 6, inches: 0 });
  });

  it('converts weight both ways without drift', () => {
    expect(lbsToKg(172)).toBe(78);
    expect(kgToLbs(78)).toBe(172);
  });
});

describe('plan fit', () => {
  const plan = buildPlan({ body: at(78), goal: 'lose', mealsPerDay: '3_snack', today: TODAY });

  it('picks the meal for the time of day', () => {
    expect(mealSlotForHour(8)).toBe('breakfast');
    expect(mealSlotForHour(13)).toBe('lunch');
    expect(mealSlotForHour(17)).toBe('snack');
    expect(mealSlotForHour(21)).toBe('dinner');
  });

  it('falls back to the nearest meal the plan has', () => {
    const twoMeals = buildPlan({ body: at(78), goal: 'lose', mealsPerDay: '2', today: TODAY });
    expect(mealBudget(twoMeals.meals, 'breakfast').slot).toBe('lunch');
    expect(mealBudget(twoMeals.meals, 'snack').slot).toBe('dinner');
    expect(mealBudget(plan.meals, 'lunch').kcal).toBe(plan.meals[1]?.kcal);
  });

  it('uses the guest defaults without a plan', () => {
    expect(mealBudget(null, 'lunch')).toEqual({ slot: null, ...GUEST_MEAL_TARGET });
  });

  it('fits on calories and sugar; protein is reported, not required', () => {
    const budget = { slot: 'lunch' as const, kcal: 650, proteinG: 38, sugarMaxG: 6 };
    expect(planFit({ kcal: 620, proteinG: 30, carbsG: 0, fatG: 0, sugarG: 4 }, budget)).toEqual({
      fits: true,
      overKcal: 0,
      overSugarG: 0,
      proteinShortG: 8,
    });
    expect(planFit({ kcal: 760, proteinG: 45, carbsG: 0, fatG: 0, sugarG: 9 }, budget)).toEqual({
      fits: false,
      overKcal: 110,
      overSugarG: 3,
      proteinShortG: 0,
    });
  });
});
