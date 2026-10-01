export type MealCategory = 'bowls' | 'breakfast' | 'drinks';

/** How the nutrition numbers were obtained (spec 0.6). */
export type NutritionBadge = 'verified' | 'calculated' | 'estimated';

export interface Meal {
  id: string;
  name: string;
  category: MealCategory;
  description: string;
  /** Rupees. */
  price: number;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  sugarG: number;
  badge: NutritionBadge;
  ingredients: string[];
  contains: string;
  kitchenAlsoHandles: string;
}

/** Protein at or above this marks a meal "High protein". */
export const HIGH_PROTEIN_G = 30;
