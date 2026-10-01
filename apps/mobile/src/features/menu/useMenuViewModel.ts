import type { MealCategory } from '@healthyapp/shared';
import { useMemo, useState } from 'react';

import { getMenu } from './menu.repository';
import { useMenuFit } from './useMenuFit';

export type CategoryFilter = 'all' | MealCategory;

export const CATEGORY_FILTERS: CategoryFilter[] = ['all', 'bowls', 'breakfast', 'drinks', 'snacks'];

export function useMenuViewModel() {
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [fitsOnly, setFitsOnly] = useState(false);
  const fit = useMenuFit();

  const meals = useMemo(() => {
    const inCategory = getMenu().filter((m) => category === 'all' || m.category === category);
    const filtered = fitsOnly && fit ? inCategory.filter((m) => fit(m).fits) : inCategory;
    // Unavailable dishes go last instead of disappearing, so regulars aren't confused.
    return [...filtered].sort((a, b) => Number(b.available) - Number(a.available));
  }, [category, fitsOnly, fit]);

  return {
    categories: CATEGORY_FILTERS,
    category,
    setCategory,
    /** Only offered with a plan: guests have nothing to fit. */
    canFilterFits: fit !== null,
    fitsOnly: fitsOnly && fit !== null,
    toggleFitsOnly: () => setFitsOnly((v) => !v),
    meals,
    fits: (id: string) => {
      const item = meals.find((m) => m.id === id);
      return item && fit ? fit(item).fits : false;
    },
  };
}
