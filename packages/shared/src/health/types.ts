export type Sex = 'male' | 'female';

export type ActivityLevel = 'sedentary' | 'light' | 'active' | 'very_active' | 'athlete';

export type BmiCategory = 'underweight' | 'healthy' | 'overweight' | 'obese';

/** `healthy_growth` is only ever assigned by the under-18 safety rule, never chosen by the user. */
export type Goal = 'lose' | 'maintain' | 'gain' | 'build_muscle' | 'healthy_growth';

export type Pace = 'gentle' | 'steady' | 'faster';

export type MealsPerDay = '2' | '3' | '3_snack' | '4';

export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface BodyInput {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  waistCm?: number;
  activity: ActivityLevel;
  /** Only meaningful when sex is female. */
  pregnantOrBreastfeeding?: boolean;
}
