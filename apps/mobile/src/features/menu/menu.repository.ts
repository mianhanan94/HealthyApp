import type { Meal } from './menu.types';

/**
 * Sample meals from the Lovable prototype. Placeholder until the menu comes from Supabase
 * (per store, per the user's address); only this file changes when it does.
 */
const SAMPLE_MEALS: Meal[] = [
  {
    id: 'chicken-bowl',
    name: 'Grilled Chicken Bowl',
    category: 'bowls',
    description: 'Smoky chicken, brown rice, chickpeas and crisp greens.',
    price: 890,
    kcal: 620,
    proteinG: 42,
    carbsG: 68,
    fatG: 18,
    sugarG: 4,
    badge: 'calculated',
    ingredients: [
      'Grilled chicken',
      'Brown rice',
      'Chickpeas',
      'Cucumber',
      'Greens',
      'Yogurt sauce',
    ],
    contains: 'Milk',
    kitchenAlsoHandles: 'Wheat, soy, peanuts and tree nuts',
  },
  {
    id: 'falafel-bowl',
    name: 'The Falafel Bowl',
    category: 'bowls',
    description: 'Herby falafel, seasonal vegetables and tahini.',
    price: 790,
    kcal: 540,
    proteinG: 21,
    carbsG: 62,
    fatG: 23,
    sugarG: 6,
    badge: 'calculated',
    ingredients: ['Falafel', 'Mixed greens', 'Chickpeas', 'Cucumber', 'Tahini'],
    contains: 'Sesame',
    kitchenAlsoHandles: 'Milk, wheat, soy and nuts',
  },
  {
    id: 'berry-parfait',
    name: 'Berry Yogurt Parfait',
    category: 'breakfast',
    description: 'Creamy yogurt, berries and crunchy granola.',
    price: 590,
    kcal: 340,
    proteinG: 19,
    carbsG: 43,
    fatG: 10,
    sugarG: 13,
    badge: 'estimated',
    ingredients: ['Yogurt', 'Berries', 'Granola'],
    contains: 'Milk, wheat',
    kitchenAlsoHandles: 'Peanuts, tree nuts and sesame',
  },
];

export function getMeals(): Meal[] {
  return SAMPLE_MEALS;
}
