import { useMemo, useState } from 'react';

import { getMeals } from './menu.repository';
import type { MealCategory } from './menu.types';

export type CategoryFilter = 'all' | MealCategory;

export const CATEGORY_FILTERS: CategoryFilter[] = ['all', 'bowls', 'breakfast', 'drinks'];

export function useMenuViewModel() {
  const [category, setCategory] = useState<CategoryFilter>('all');
  const allMeals = getMeals();

  const meals = useMemo(
    () => (category === 'all' ? allMeals : allMeals.filter((m) => m.category === category)),
    [allMeals, category],
  );

  return { categories: CATEGORY_FILTERS, category, setCategory, meals };
}
