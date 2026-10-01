import {
  mealBudget,
  mealSlotForHour,
  planFit,
  type MenuItem,
  type PlanFit,
} from '@healthyapp/shared';
import { useMemo } from 'react';

import { usePlan } from '@/features/profile/profile.store';

/**
 * How each dish, as it comes, fits the user's plan for the current meal of the day.
 * Null without a plan: guests don't get "fits" tags.
 */
export function useMenuFit(): ((item: MenuItem) => PlanFit) | null {
  const { plan } = usePlan();
  return useMemo(() => {
    if (!plan) return null;
    const budget = mealBudget(plan.meals, mealSlotForHour(new Date().getHours()));
    return (item: MenuItem) => planFit(item.base, budget);
  }, [plan]);
}
