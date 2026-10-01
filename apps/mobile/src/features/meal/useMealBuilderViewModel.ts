import {
  buildAllergens,
  buildChanges,
  buildNutrition,
  buildPrice,
  defaultSelection,
  MAX_LINE_QUANTITY,
  mealBudget,
  mealSlotForHour,
  planFit,
  validateBuild,
  type AddRequest,
  type BuildSelection,
  type MenuItem,
} from '@healthyapp/shared';
import { useMemo, useState } from 'react';

import { useCartStore } from '@/features/cart/cart.store';
import { findMenuItem } from '@/features/menu/menu.repository';
import { usePlan } from '@/features/profile/profile.store';

export type SubmitResult =
  | { status: 'added'; capped: boolean }
  | { status: 'updated' }
  | { status: 'needs_new_cart' }
  | { status: 'invalid' };

function initialSelection(item: MenuItem | undefined, saved: BuildSelection | undefined) {
  if (!item) return {};
  // Start from the defaults so groups added to the recipe since the line was saved get a value.
  return { ...defaultSelection(item), ...saved };
}

/**
 * Customise screen (spec 3.1). `lineId` edits an existing cart line instead of adding a new one.
 */
export function useMealBuilderViewModel(itemId: string, lineId?: string) {
  const item = findMenuItem(itemId);
  const line = useCartStore((s) => s.cart.lines.find((l) => l.id === lineId));
  const { add, replaceWith, updateLine } = useCartStore.getState();
  const { plan } = usePlan();

  const [selection, setSelection] = useState<BuildSelection>(() =>
    initialSelection(item, line?.selection),
  );
  const [quantity, setQuantity] = useState(line?.quantity ?? 1);
  /** The multi group whose limit the user just hit, to explain why nothing happened. */
  const [limitHit, setLimitHit] = useState<string | null>(null);

  const derived = useMemo(() => {
    if (!item) return null;
    const nutrition = buildNutrition(item, selection);
    const budget = mealBudget(plan?.meals ?? null, mealSlotForHour(new Date().getHours()));
    const unitPrice = buildPrice(item, selection);
    return {
      nutrition,
      kcalDelta: nutrition.kcal - item.base.kcal,
      unitPrice,
      totalPrice: unitPrice * quantity,
      allergens: buildAllergens(item, selection),
      changes: buildChanges(item, selection),
      issues: validateBuild(item, selection),
      budget,
      fit: planFit(nutrition, budget),
    };
  }, [item, selection, plan, quantity]);

  const setGroup = (groupId: string, value: string[] | number) => {
    setLimitHit(null);
    setSelection((s) => ({ ...s, [groupId]: value }));
  };

  const ids = (groupId: string): string[] => {
    const value = selection[groupId];
    return Array.isArray(value) ? value : [];
  };

  const request = (): AddRequest | null =>
    item ? { itemId: item.id, storeId: item.storeId, selection, quantity } : null;

  return {
    item,
    isEditing: line !== undefined,
    selection,
    quantity,
    maxQuantity: MAX_LINE_QUANTITY,
    setQuantity: (q: number) => setQuantity(Math.min(MAX_LINE_QUANTITY, Math.max(1, q))),
    limitHit,
    hasPlan: plan !== null,
    ...derived,
    chosen: ids,
    count: (groupId: string, fallback: number) => {
      const value = selection[groupId];
      return typeof value === 'number' ? value : fallback;
    },
    chooseSingle: (groupId: string, optionId: string) => setGroup(groupId, [optionId]),
    toggleMulti: (groupId: string, optionId: string, max: number) => {
      const current = ids(groupId);
      if (current.includes(optionId))
        setGroup(
          groupId,
          current.filter((id) => id !== optionId),
        );
      else if (current.length >= max) setLimitHit(groupId);
      else setGroup(groupId, [...current, optionId]);
    },
    toggleRemove: (groupId: string, optionId: string) => {
      const current = ids(groupId);
      setGroup(
        groupId,
        current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId],
      );
    },
    setCount: (groupId: string, value: number) => setGroup(groupId, value),
    submit: (): SubmitResult => {
      const r = request();
      if (!r || !derived || derived.issues.length > 0) return { status: 'invalid' };
      if (line) {
        updateLine(line.id, r.selection, r.quantity);
        return { status: 'updated' };
      }
      const result = add(r);
      if (result.ok) return { status: 'added', capped: result.capped };
      return result.reason === 'different_store'
        ? { status: 'needs_new_cart' }
        : { status: 'invalid' };
    },
    startNewCart: (): SubmitResult => {
      const r = request();
      if (!r) return { status: 'invalid' };
      const result = replaceWith(r);
      return result.ok ? { status: 'added', capped: result.capped } : { status: 'invalid' };
    },
  };
}
