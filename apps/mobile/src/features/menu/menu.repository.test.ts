import {
  buildNutrition,
  defaultSelection,
  validateBuild,
  type MenuItem,
  type Nutrition,
} from '@healthyapp/shared';
import { describe, expect, it } from 'vitest';

import { findMenuItem, getMenu } from './menu.repository';

const atwater = (n: Nutrition) => n.proteinG * 4 + n.carbsG * 4 + n.fatG * 9;

/** Every option of every group, with the selection that turns it on. */
function everyOption(item: MenuItem) {
  return item.modifierGroups.flatMap((g) =>
    g.type === 'stepper' ? [{ id: g.option.id, delta: g.option.delta }] : g.options,
  );
}

describe('sample menu data', () => {
  const menu = getMenu();

  it('has unique ids and one store', () => {
    expect(new Set(menu.map((m) => m.id)).size).toBe(menu.length);
    expect(new Set(menu.map((m) => m.storeId)).size).toBe(1);
  });

  it.each(menu.map((m) => [m.id, m] as const))('%s: calories match its macros', (_, item) => {
    // Within 10% (or 15 kcal for very small items) of 4/4/9.
    const diff = Math.abs(atwater(item.base) - item.base.kcal);
    expect(diff).toBeLessThanOrEqual(Math.max(15, item.base.kcal * 0.1));
    for (const option of everyOption(item)) {
      const optionDiff = Math.abs(atwater(option.delta) - option.delta.kcal);
      expect(optionDiff).toBeLessThanOrEqual(Math.max(15, Math.abs(option.delta.kcal) * 0.15));
    }
  });

  it.each(menu.map((m) => [m.id, m] as const))('%s: default build is valid', (_, item) => {
    const selection = defaultSelection(item);
    expect(validateBuild(item, selection)).toEqual([]);
    expect(buildNutrition(item, selection)).toEqual(item.base);
  });

  it('declares sugar no higher than carbs', () => {
    for (const item of menu) expect(item.base.sugarG).toBeLessThanOrEqual(item.base.carbsG);
  });

  it('keeps stepper defaults inside their bounds', () => {
    for (const item of menu) {
      for (const g of item.modifierGroups) {
        if (g.type === 'stepper') {
          expect(g.defaultCount).toBeGreaterThanOrEqual(g.min);
          expect(g.defaultCount).toBeLessThanOrEqual(g.max);
        }
      }
    }
  });

  it('finds items by id', () => {
    expect(findMenuItem('chicken-bowl')?.name).toBe('Grilled Chicken Bowl');
    expect(findMenuItem('nope')).toBeUndefined();
  });
});
