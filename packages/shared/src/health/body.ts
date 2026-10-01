import { round, roundTo } from './rounding';
import type { ActivityLevel, BmiCategory, BodyInput, Goal } from './types';

// WHO Asian cut-offs, as required by the spec (1.5).
const HEALTHY_MIN_BMI = 18.5;
const HEALTHY_MAX_BMI = 22.9;
const OVERWEIGHT_MIN_BMI = 23;
const OBESE_MIN_BMI = 27.5;

const WAIST_TO_HEIGHT_FLAG = 0.5;
const ACTIVE_OR_ABOVE: ActivityLevel[] = ['active', 'very_active', 'athlete'];

export function isActiveOrAbove(activity: ActivityLevel): boolean {
  return ACTIVE_OR_ABOVE.includes(activity);
}

function heightM2(heightCm: number): number {
  const m = heightCm / 100;
  return m * m;
}

export function calculateBmi(weightKg: number, heightCm: number): number {
  return round(weightKg / heightM2(heightCm), 1);
}

export function bmiCategory(bmi: number): BmiCategory {
  if (bmi < HEALTHY_MIN_BMI) return 'underweight';
  if (bmi < OVERWEIGHT_MIN_BMI) return 'healthy';
  if (bmi < OBESE_MIN_BMI) return 'overweight';
  return 'obese';
}

export interface WeightRange {
  minKg: number;
  maxKg: number;
}

export function healthyWeightRange(heightCm: number): WeightRange {
  const m2 = heightM2(heightCm);
  return { minKg: round(HEALTHY_MIN_BMI * m2), maxKg: round(HEALTHY_MAX_BMI * m2) };
}

export interface TargetWeight {
  targetKg: number;
  /** True when the full target is >20% away, so we show a nearer "Step 1" target instead. */
  isStepTarget: boolean;
}

export function targetWeight(weightKg: number, heightCm: number): TargetWeight {
  const category = bmiCategory(calculateBmi(weightKg, heightCm));
  const range = healthyWeightRange(heightCm);

  if (category === 'overweight' || category === 'obese') {
    if ((weightKg - range.maxKg) / weightKg > 0.2) {
      return { targetKg: roundTo(weightKg * 0.9, 0.5), isStepTarget: true };
    }
    return { targetKg: range.maxKg, isStepTarget: false };
  }
  if (category === 'underweight') {
    return { targetKg: range.minKg + 2, isStepTarget: false };
  }
  return { targetKg: weightKg, isStepTarget: false };
}

/** First milestone for overweight/obese users: 5% of current weight, to the nearest 0.5 kg. */
export function firstMilestoneKg(weightKg: number, heightCm: number): number | null {
  const category = bmiCategory(calculateBmi(weightKg, heightCm));
  if (category !== 'overweight' && category !== 'obese') return null;
  return roundTo(weightKg * 0.05, 0.5);
}

export function waistToHeight(waistCm: number, heightCm: number): number {
  return round(waistCm / heightCm, 2);
}

export function isWaistToHeightHigh(ratio: number): boolean {
  return ratio >= WAIST_TO_HEIGHT_FLAG;
}

export interface SafetyFlags {
  /** Under 18: no deficit or surplus, goal is healthy growth. */
  minor: boolean;
  /** Pregnant or breastfeeding: no weight-loss goal, advise seeing a doctor. */
  pregnancy: boolean;
  /** BMI < 16 or ≥ 40: show the plan but recommend a doctor. */
  seeDoctor: boolean;
}

export function safetyFlags(input: BodyInput): SafetyFlags {
  const bmi = calculateBmi(input.weightKg, input.heightCm);
  return {
    minor: input.age < 18,
    pregnancy: input.sex === 'female' && input.pregnantOrBreastfeeding === true,
    seeDoctor: bmi < 16 || bmi >= 40,
  };
}

/**
 * Overweight by BMI, but a healthy waist and an active lifestyle suggest the extra
 * weight is muscle (spec 1.5 C).
 */
export function isLikelyMuscular(input: BodyInput): boolean {
  if (input.waistCm === undefined) return false;
  const category = bmiCategory(calculateBmi(input.weightKg, input.heightCm));
  return (
    category === 'overweight' &&
    !isWaistToHeightHigh(waistToHeight(input.waistCm, input.heightCm)) &&
    isActiveOrAbove(input.activity)
  );
}

/** Goals the user may pick on the goal screen, given their body result. */
export function allowedGoals(input: BodyInput): Goal[] {
  const flags = safetyFlags(input);
  if (flags.minor) return ['healthy_growth'];
  if (flags.pregnancy) return ['maintain'];

  const category = bmiCategory(calculateBmi(input.weightKg, input.heightCm));
  const goals: Goal[] = ['lose', 'maintain', 'gain'];
  if (category === 'healthy' || isLikelyMuscular(input)) goals.push('build_muscle');
  return goals;
}

export function suggestedGoal(input: BodyInput): Goal {
  const flags = safetyFlags(input);
  if (flags.minor) return 'healthy_growth';
  if (flags.pregnancy) return 'maintain';
  if (isLikelyMuscular(input)) return 'build_muscle';

  switch (bmiCategory(calculateBmi(input.weightKg, input.heightCm))) {
    case 'underweight':
      return 'gain';
    case 'healthy':
      return 'maintain';
    default:
      return 'lose';
  }
}

export interface BodyResult {
  bmi: number;
  category: BmiCategory;
  healthyRange: WeightRange;
  target: TargetWeight;
  /** Signed: negative to lose, positive to gain, 0 to stay. */
  changeKg: number;
  milestoneKg: number | null;
  waistToHeight: number | null;
  suggestedGoal: Goal;
  safety: SafetyFlags;
}

export function bodyResult(input: BodyInput): BodyResult {
  const bmi = calculateBmi(input.weightKg, input.heightCm);
  const safety = safetyFlags(input);
  // Minors and pregnant/breastfeeding users get no weight target (spec 1.5 safety overrides).
  const holdWeight = safety.minor || safety.pregnancy;
  const target = holdWeight
    ? { targetKg: input.weightKg, isStepTarget: false }
    : targetWeight(input.weightKg, input.heightCm);
  return {
    bmi,
    category: bmiCategory(bmi),
    healthyRange: healthyWeightRange(input.heightCm),
    target,
    changeKg: round(target.targetKg - input.weightKg, 1),
    milestoneKg: holdWeight ? null : firstMilestoneKg(input.weightKg, input.heightCm),
    waistToHeight:
      input.waistCm === undefined ? null : waistToHeight(input.waistCm, input.heightCm),
    suggestedGoal: suggestedGoal(input),
    safety,
  };
}
