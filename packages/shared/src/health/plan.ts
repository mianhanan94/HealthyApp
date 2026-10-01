import { allowedGoals, bodyResult, goalTarget, isActiveOrAbove, suggestedGoal } from './body';
import { round, roundTo } from './rounding';
import type { ActivityLevel, BodyInput, Goal, MealSlot, MealsPerDay, Pace } from './types';

const ACTIVITY_MULTIPLIER: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  active: 1.55,
  very_active: 1.725,
  athlete: 1.9,
};

/**
 * Weekly change and daily kcal delta per pace (spec 1.6). Gain values are taken from the spec
 * table as written; they are intentionally gentler than the 7,700 kcal/kg rule.
 */
export const PACES: Record<
  'lose' | 'gain',
  Record<Pace, { weeklyKg: number; kcalPerDay: number }>
> = {
  lose: {
    gentle: { weeklyKg: 0.25, kcalPerDay: 275 },
    steady: { weeklyKg: 0.5, kcalPerDay: 550 },
    faster: { weeklyKg: 0.75, kcalPerDay: 825 },
  },
  gain: {
    gentle: { weeklyKg: 0.25, kcalPerDay: 250 },
    steady: { weeklyKg: 0.35, kcalPerDay: 350 },
    faster: { weeklyKg: 0.5, kcalPerDay: 500 },
  },
};

export const DEFAULT_PACE: Pace = 'steady';
export const DEFAULT_MEALS_PER_DAY: MealsPerDay = '3_snack';

const BUILD_MUSCLE_SURPLUS = 150;
const MAX_DEFICIT_SHARE = 0.25;
const KCAL_FLOOR = { male: 1500, female: 1200 } as const;

/** Per-meal targets used before a user has a plan (guest mode, spec 1.2). */
export const GUEST_MEAL_TARGET = { kcal: 600, proteinG: 30, sugarMaxG: 15 } as const;

const MEAL_SPLITS: Record<MealsPerDay, [MealSlot, number][]> = {
  '2': [
    ['lunch', 45],
    ['dinner', 55],
  ],
  '3': [
    ['breakfast', 30],
    ['lunch', 40],
    ['dinner', 30],
  ],
  '3_snack': [
    ['breakfast', 25],
    ['lunch', 35],
    ['dinner', 30],
    ['snack', 10],
  ],
  '4': [
    ['breakfast', 25],
    ['lunch', 25],
    ['snack', 25],
    ['dinner', 25],
  ],
};

/** Mifflin–St Jeor. */
export function calculateBmr({ sex, weightKg, heightCm, age }: BodyInput): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === 'male' ? base + 5 : base - 161;
}

export function calculateTdee(body: BodyInput): number {
  return calculateBmr(body) * ACTIVITY_MULTIPLIER[body.activity];
}

/** The largest deficit allowed: 25% of maintenance, and never below the sex-specific floor. */
export function maxDeficit(body: BodyInput): number {
  const tdee = calculateTdee(body);
  return Math.max(0, Math.min(tdee * MAX_DEFICIT_SHARE, tdee - KCAL_FLOOR[body.sex]));
}

export interface PaceOption {
  pace: Pace;
  weeklyKg: number;
  /** Signed: negative for a deficit, positive for a surplus. */
  kcalPerDay: number;
  /** False when the deficit is too large for this body ("Too fast for your body"). */
  allowed: boolean;
  weeks: number | null;
  finishDate: Date | null;
}

function addWeeks(date: Date, weeks: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + weeks * 7);
  return result;
}

function weeksToChange(changeKg: number, weeklyKg: number): number {
  return Math.ceil(round(Math.abs(changeKg) / weeklyKg, 6));
}

/** Pace rows for the goal screen. Empty for goals without a pace. */
export function paceOptions(body: BodyInput, goal: Goal, today: Date): PaceOption[] {
  if (goal !== 'lose' && goal !== 'gain') return [];
  const changeKg = goalTarget(body, goal).targetKg - body.weightKg;
  // A timeline only makes sense when the target lies in the goal's direction.
  const hasTimeline = goal === 'lose' ? changeKg < 0 : changeKg > 0;
  const deficitLimit = maxDeficit(body);

  return (Object.keys(PACES[goal]) as Pace[]).map((pace) => {
    const { weeklyKg, kcalPerDay } = PACES[goal][pace];
    const weeks = hasTimeline ? weeksToChange(changeKg, weeklyKg) : null;
    return {
      pace,
      weeklyKg: goal === 'lose' ? -weeklyKg : weeklyKg,
      kcalPerDay: goal === 'lose' ? -kcalPerDay : kcalPerDay,
      allowed: goal === 'gain' || kcalPerDay <= deficitLimit,
      weeks,
      finishDate: weeks === null ? null : addWeeks(today, weeks),
    };
  });
}

export interface MealTarget {
  slot: MealSlot;
  percent: number;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fibreG: number;
  sugarMaxG: number;
}

export interface NutritionPlan {
  goal: Goal;
  pace: Pace | null;
  bmr: number;
  tdee: number;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fibreMinG: number;
  sugarMaxG: number;
  waterL: number;
  /** Share of daily kcal, whole percent. */
  macroPercent: { protein: number; carbs: number; fat: number };
  meals: MealTarget[];
  /** Weight the chosen goal aims for (current weight for maintain / build muscle / growth). */
  targetKg: number;
  weeksToTarget: number | null;
  targetDate: Date | null;
  /** First milestone (5% of weight) for weight loss, else null. */
  milestoneKg: number | null;
  weeksToMilestone: number | null;
  /** kg per week for lose/gain, else null. */
  weeklyKg: number | null;
}

export interface PlanInput {
  body: BodyInput;
  goal: Goal;
  /** Required for lose/gain; ignored otherwise. Defaults to steady. */
  pace?: Pace;
  mealsPerDay?: MealsPerDay;
  today: Date;
}

function proteinPerKg(goal: Goal, age: number): number {
  if (goal === 'healthy_growth') return 1.0;
  const byGoal: Record<Exclude<Goal, 'healthy_growth'>, number> = {
    lose: 1.6,
    maintain: 1.2,
    gain: 1.6,
    build_muscle: 2.0,
  };
  const factor = byGoal[goal];
  return age >= 60 ? Math.max(factor, 1.2) : factor;
}

/** Carbs fill whatever kcal protein and fat leave (also used when the user edits a number). */
export function carbsForKcal(kcal: number, proteinG: number, fatG: number): number {
  return Math.max(0, round((kcal - proteinG * 4 - fatG * 9) / 4));
}

function dailyKcal(body: BodyInput, goal: Goal, pace: Pace): number {
  const tdee = calculateTdee(body);
  switch (goal) {
    case 'lose':
      return roundTo(tdee - Math.min(PACES.lose[pace].kcalPerDay, maxDeficit(body)), 50);
    case 'gain':
      return roundTo(tdee + PACES.gain[pace].kcalPerDay, 50);
    case 'build_muscle':
      return roundTo(tdee + BUILD_MUSCLE_SURPLUS, 50);
    default:
      return roundTo(tdee, 50);
  }
}

/**
 * Split a day total across meals: round each meal to `step`, then give the rounding
 * remainder to the largest meal so the meals always sum exactly to the day.
 */
function splitAcrossMeals(total: number, percents: number[], step: number): number[] {
  const parts = percents.map((p) => roundTo((total * p) / 100, step));
  const largest = percents.indexOf(Math.max(...percents));
  const remainder = total - parts.reduce((sum, v) => sum + v, 0);
  parts[largest] = (parts[largest] ?? 0) + remainder;
  return parts;
}

export function buildPlan({
  body,
  goal: requestedGoal,
  pace = DEFAULT_PACE,
  mealsPerDay = DEFAULT_MEALS_PER_DAY,
  today,
}: PlanInput): NutritionPlan {
  // Safety rules win over the user's choice (e.g. no weight loss for minors or in pregnancy).
  const goal = allowedGoals(body).includes(requestedGoal) ? requestedGoal : suggestedGoal(body);
  const result = bodyResult(body);
  const target = goalTarget(body, goal);
  const bmr = calculateBmr(body);
  const tdee = calculateTdee(body);
  const kcal = dailyKcal(body, goal, pace);

  // Protein is sized to the healthy-range target for overweight users, so it isn't inflated by
  // fat mass. This uses the body result target, which doesn't depend on the chosen goal.
  const referenceKg =
    result.category === 'overweight' || result.category === 'obese'
      ? result.target.targetKg
      : body.weightKg;
  const proteinG = roundTo(referenceKg * proteinPerKg(goal, body.age), 5);

  const fatG = round(Math.min(Math.max((kcal * 0.28) / 9, referenceKg * 0.6), (kcal * 0.35) / 9));
  const carbsG = carbsForKcal(kcal, proteinG, fatG);
  const fibreMinG = Math.max(round((14 * kcal) / 1000), body.sex === 'male' ? 30 : 25);
  const sugarMaxG = Math.floor((kcal * 0.05) / 4);
  const waterL = round((35 * body.weightKg) / 1000 + (isActiveOrAbove(body.activity) ? 0.5 : 0), 1);

  const split = MEAL_SPLITS[mealsPerDay];
  const percents = split.map(([, p]) => p);
  const mealKcal = splitAcrossMeals(kcal, percents, 5);
  const mealProtein = splitAcrossMeals(proteinG, percents, 1);
  const mealCarbs = splitAcrossMeals(carbsG, percents, 1);
  const mealFat = splitAcrossMeals(fatG, percents, 1);
  const mealFibre = splitAcrossMeals(fibreMinG, percents, 1);
  const mealSugar = splitAcrossMeals(sugarMaxG, percents, 1);
  const meals: MealTarget[] = split.map(([slot, percent], i) => ({
    slot,
    percent,
    kcal: mealKcal[i] ?? 0,
    proteinG: mealProtein[i] ?? 0,
    carbsG: mealCarbs[i] ?? 0,
    fatG: mealFat[i] ?? 0,
    fibreG: mealFibre[i] ?? 0,
    sugarMaxG: mealSugar[i] ?? 0,
  }));

  // A milestone only helps if it comes before the target (not for a 1 kg change).
  const milestoneKg =
    goal === 'lose' &&
    result.milestoneKg !== null &&
    result.milestoneKg < Math.abs(target.targetKg - body.weightKg)
      ? result.milestoneKg
      : null;
  const hasPace = goal === 'lose' || goal === 'gain';
  const option = hasPace ? paceOptions(body, goal, today).find((o) => o.pace === pace) : undefined;
  const weeklyKg = option ? Math.abs(option.weeklyKg) : null;

  return {
    goal,
    pace: hasPace ? pace : null,
    bmr: round(bmr),
    tdee: round(tdee),
    kcal,
    proteinG,
    carbsG,
    fatG,
    fibreMinG,
    sugarMaxG,
    waterL,
    macroPercent: {
      protein: round(((proteinG * 4) / kcal) * 100),
      carbs: round(((carbsG * 4) / kcal) * 100),
      fat: round(((fatG * 9) / kcal) * 100),
    },
    meals,
    targetKg: target.targetKg,
    weeksToTarget: option?.weeks ?? null,
    targetDate: option?.finishDate ?? null,
    milestoneKg,
    weeklyKg,
    weeksToMilestone:
      weeklyKg !== null && milestoneKg !== null ? weeksToChange(milestoneKg, weeklyKg) : null,
  };
}
