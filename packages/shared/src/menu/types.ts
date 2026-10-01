/** Allergens we declare, following the common Codex / EU list relevant to our menu. */
export type Allergen =
  | 'milk'
  | 'egg'
  | 'wheat'
  | 'soy'
  | 'peanut'
  | 'tree_nut'
  | 'sesame'
  | 'fish'
  | 'shellfish'
  | 'mustard';

/** How the nutrition numbers were obtained (spec 0.6). */
export type NutritionBadge = 'verified' | 'calculated' | 'estimated';

export type MealCategory = 'bowls' | 'breakfast' | 'drinks' | 'snacks';

export type DietTag = 'vegetarian' | 'eggless' | 'dairy_free' | 'no_added_sugar';

export interface Nutrition {
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  /** Added + natural sugars, as declared. */
  sugarG: number;
}

export const ZERO_NUTRITION: Nutrition = { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0, sugarG: 0 };

export interface ModifierOption {
  id: string;
  name: string;
  /** Change versus the base recipe (per unit for steppers). */
  delta: Nutrition;
  /** Rupees, per unit for steppers. */
  priceDelta: number;
  /** Allergens this option adds. */
  allergens?: Allergen[];
  /** Out of stock today. */
  available: boolean;
  /** Pre-selected (single / multi). */
  isDefault?: boolean;
}

interface BaseGroup {
  id: string;
  name: string;
}

/** Pick exactly one (milk, base, bread). */
export interface SingleGroup extends BaseGroup {
  type: 'single';
  options: ModifierOption[];
}

/** Pick any, up to `max` (add-ons). */
export interface MultiGroup extends BaseGroup {
  type: 'multi';
  max: number;
  options: ModifierOption[];
}

/** Take things out of the base recipe. Selected options are removed. */
export interface RemoveGroup extends BaseGroup {
  type: 'remove';
  options: ModifierOption[];
}

/** A counted extra (whey scoops, chicken portions). The base recipe includes `defaultCount`. */
export interface StepperGroup extends BaseGroup {
  type: 'stepper';
  unit: string;
  min: number;
  max: number;
  defaultCount: number;
  /** The one option whose delta / price apply per unit above or below `defaultCount`. */
  option: ModifierOption;
}

export type ModifierGroup = SingleGroup | MultiGroup | RemoveGroup | StepperGroup;

export interface MenuItem {
  id: string;
  storeId: string;
  name: string;
  category: MealCategory;
  description: string;
  /** Rupees. */
  basePrice: number;
  base: Nutrition;
  fibreG: number;
  badge: NutritionBadge;
  ingredients: { name: string; grams: number }[];
  allergens: Allergen[];
  /** Cross-contact: handled in the same kitchen. Never claim "allergy safe". */
  kitchenAlsoHandles: Allergen[];
  dietTags: DietTag[];
  modifierGroups: ModifierGroup[];
  available: boolean;
}

/** Option ids for single / multi / remove groups, a count for stepper groups. */
export type BuildSelection = Record<string, string[] | number>;
