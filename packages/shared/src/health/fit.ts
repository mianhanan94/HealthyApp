import type { Nutrition } from '../menu/types';
import { GUEST_MEAL_TARGET, type MealTarget } from './plan';
import type { MealSlot } from './types';

/** Which meal of the day it is, from the local hour. */
export function mealSlotForHour(hour: number): MealSlot {
  if (hour < 11) return 'breakfast';
  if (hour < 16) return 'lunch';
  if (hour < 19) return 'snack';
  return 'dinner';
}

const FALLBACK: Record<MealSlot, MealSlot[]> = {
  breakfast: ['breakfast', 'lunch', 'dinner'],
  lunch: ['lunch', 'dinner'],
  snack: ['snack', 'dinner', 'lunch'],
  dinner: ['dinner', 'lunch'],
};

export interface MealBudget {
  slot: MealSlot | null;
  kcal: number;
  proteinG: number;
  sugarMaxG: number;
}

/**
 * The per-meal budget to compare a dish against: the plan's target for this time of day, or
 * the nearest meal the plan has (a 2-meal plan has no breakfast). Guests get the spec defaults.
 */
export function mealBudget(meals: MealTarget[] | null, slot: MealSlot): MealBudget {
  if (!meals) return { slot: null, ...GUEST_MEAL_TARGET };
  for (const candidate of FALLBACK[slot]) {
    const target = meals.find((m) => m.slot === candidate);
    if (target) {
      return {
        slot: target.slot,
        kcal: target.kcal,
        proteinG: target.proteinG,
        sugarMaxG: target.sugarMaxG,
      };
    }
  }
  const largest = [...meals].sort((a, b) => b.kcal - a.kcal)[0];
  return largest
    ? {
        slot: largest.slot,
        kcal: largest.kcal,
        proteinG: largest.proteinG,
        sugarMaxG: largest.sugarMaxG,
      }
    : { slot: null, ...GUEST_MEAL_TARGET };
}

export interface PlanFit {
  /** Within the meal's calories and sugar budget. Protein is a goal, not a limit. */
  fits: boolean;
  overKcal: number;
  overSugarG: number;
  proteinShortG: number;
}

export function planFit(n: Nutrition, budget: MealBudget): PlanFit {
  const overKcal = Math.max(0, Math.round(n.kcal - budget.kcal));
  const overSugarG = Math.max(0, Math.round(n.sugarG - budget.sugarMaxG));
  return {
    fits: overKcal === 0 && overSugarG === 0,
    overKcal,
    overSugarG,
    proteinShortG: Math.max(0, Math.round(budget.proteinG - n.proteinG)),
  };
}
