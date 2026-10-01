import { describe, expect, it } from 'vitest';

import {
  buildAllergens,
  buildChanges,
  buildNutrition,
  buildPrice,
  defaultSelection,
  selectionKey,
  validateBuild,
} from './build';
import {
  addToCart,
  EMPTY_CART,
  MAX_LINE_QUANTITY,
  priceCart,
  setLineQuantity,
  updateLineSelection,
  type Cart,
} from './cart';
import type { MenuItem } from './types';

const zero = { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0, sugarG: 0 };

const shake: MenuItem = {
  id: 'pb-shake',
  storeId: 'store-a',
  name: 'Peanut Butter Shake',
  category: 'drinks',
  description: '',
  basePrice: 650,
  // Includes the one default scoop of whey.
  base: { kcal: 520, proteinG: 44, carbsG: 55, fatG: 13.5, sugarG: 36 },
  fibreG: 4,
  badge: 'calculated',
  ingredients: [],
  allergens: ['milk', 'peanut'],
  kitchenAlsoHandles: ['wheat'],
  dietTags: ['vegetarian'],
  available: true,
  modifierGroups: [
    {
      id: 'milk',
      name: 'Milk',
      type: 'single',
      options: [
        {
          id: 'lowfat',
          name: 'Low-fat milk',
          delta: zero,
          priceDelta: 0,
          available: true,
          isDefault: true,
        },
        {
          id: 'almond',
          name: 'Almond milk',
          delta: { kcal: -90, proteinG: -8.5, carbsG: -13.5, fatG: -1, sugarG: -15 },
          priceDelta: 120,
          allergens: ['tree_nut'],
          available: true,
        },
        { id: 'oat', name: 'Oat milk', delta: zero, priceDelta: 100, available: false },
      ],
    },
    {
      id: 'whey',
      name: 'Whey',
      type: 'stepper',
      unit: 'scoop',
      min: 0,
      max: 3,
      defaultCount: 1,
      option: {
        id: 'whey-scoop',
        name: 'Whey protein',
        delta: { kcal: 120, proteinG: 24, carbsG: 3, fatG: 1.5, sugarG: 2 },
        priceDelta: 200,
        allergens: ['milk'],
        available: true,
      },
    },
    {
      id: 'addons',
      name: 'Add-ons',
      type: 'multi',
      max: 2,
      options: [
        { id: 'chia', name: 'Chia', delta: { ...zero, kcal: 60 }, priceDelta: 80, available: true },
        {
          id: 'oats',
          name: 'Oats',
          delta: { ...zero, kcal: 75 },
          priceDelta: 60,
          available: true,
          allergens: ['wheat'],
        },
        { id: 'flax', name: 'Flax', delta: { ...zero, kcal: 55 }, priceDelta: 70, available: true },
      ],
    },
    {
      id: 'remove',
      name: 'Remove',
      type: 'remove',
      options: [
        {
          id: 'no-pb',
          name: 'Peanut butter',
          delta: { kcal: -95, proteinG: -4, carbsG: -3, fatG: -8, sugarG: -1.5 },
          priceDelta: 0,
          available: true,
        },
      ],
    },
  ],
};

const find = (id: string) => (id === shake.id ? shake : undefined);
let n = 0;
const newId = () => `line-${++n}`;

describe('build', () => {
  it('starts from the defaults, which cost nothing extra', () => {
    const sel = defaultSelection(shake);
    expect(sel).toEqual({ milk: ['lowfat'], whey: 1, addons: [], remove: [] });
    expect(validateBuild(shake, sel)).toEqual([]);
    expect(buildPrice(shake, sel)).toBe(650);
    expect(buildNutrition(shake, sel)).toEqual(shake.base);
    expect(buildChanges(shake, sel)).toEqual([]);
  });

  it('adds option deltas, per unit above the default for steppers', () => {
    const sel = { milk: ['almond'], whey: 3, addons: ['chia'], remove: ['no-pb'] };
    // Two scoops above the default; almond milk, chia, no peanut butter.
    expect(buildNutrition(shake, sel)).toEqual({
      kcal: 520 - 90 + 240 + 60 - 95,
      proteinG: 44 - 8.5 + 48 - 4,
      carbsG: 55 - 13.5 + 6 - 3,
      fatG: 13.5 - 1 + 3 - 8,
      sugarG: 36 - 15 + 4 - 1.5,
    });
    expect(buildPrice(shake, sel)).toBe(650 + 120 + 400 + 80);
    expect(buildChanges(shake, sel)).toEqual([
      { kind: 'choose', groupId: 'milk', name: 'Almond milk' },
      { kind: 'count', groupId: 'whey', name: 'Whey protein', count: 3, unit: 'scoop' },
      { kind: 'add', groupId: 'addons', name: 'Chia' },
      { kind: 'remove', groupId: 'remove', name: 'Peanut butter' },
    ]);
  });

  it('lowers nutrition but not price when a stepper goes below its default', () => {
    const sel = { ...defaultSelection(shake), whey: 0 };
    expect(buildNutrition(shake, sel)).toMatchObject({ kcal: 400, proteinG: 20 });
    expect(buildPrice(shake, sel)).toBe(650);
  });

  it('never returns negative nutrition', () => {
    const tiny: MenuItem = {
      ...shake,
      base: { kcal: 50, proteinG: 2, carbsG: 5, fatG: 1, sugarG: 3 },
    };
    const n = buildNutrition(tiny, { milk: ['almond'], whey: 0, addons: [], remove: ['no-pb'] });
    expect(Object.values(n).every((v) => v >= 0)).toBe(true);
  });

  it('reports every kind of invalid build', () => {
    expect(validateBuild(shake, { milk: [], whey: 1, addons: [], remove: [] })).toContainEqual({
      code: 'required',
      groupId: 'milk',
    });
    expect(
      validateBuild(shake, { milk: ['lowfat', 'almond'], whey: 1, addons: [], remove: [] }),
    ).toContainEqual({
      code: 'too_many',
      groupId: 'milk',
    });
    expect(validateBuild(shake, { milk: ['oat'], whey: 1, addons: [], remove: [] })).toContainEqual(
      {
        code: 'option_unavailable',
        groupId: 'milk',
        optionId: 'oat',
      },
    );
    expect(
      validateBuild(shake, { milk: ['nope'], whey: 1, addons: [], remove: [] }),
    ).toContainEqual({
      code: 'unknown_option',
      groupId: 'milk',
      optionId: 'nope',
    });
    expect(
      validateBuild(shake, { milk: ['lowfat'], whey: 4, addons: [], remove: [] }),
    ).toContainEqual({
      code: 'out_of_range',
      groupId: 'whey',
    });
    expect(
      validateBuild(shake, { milk: ['lowfat'], whey: 1.5, addons: [], remove: [] }),
    ).toContainEqual({
      code: 'out_of_range',
      groupId: 'whey',
    });
    expect(
      validateBuild(shake, {
        milk: ['lowfat'],
        whey: 1,
        addons: ['chia', 'oats', 'flax'],
        remove: [],
      }),
    ).toContainEqual({ code: 'too_many', groupId: 'addons' });
    expect(validateBuild({ ...shake, available: false }, defaultSelection(shake))).toContainEqual({
      code: 'item_unavailable',
    });
  });

  it('defaults to the first available option when the default is out of stock', () => {
    const item: MenuItem = {
      ...shake,
      modifierGroups: [
        {
          id: 'milk',
          name: 'Milk',
          type: 'single',
          options: [
            {
              id: 'lowfat',
              name: 'Low-fat',
              delta: zero,
              priceDelta: 0,
              available: false,
              isDefault: true,
            },
            { id: 'whole', name: 'Whole', delta: zero, priceDelta: 0, available: true },
          ],
        },
      ],
    };
    expect(defaultSelection(item)).toEqual({ milk: ['whole'] });
  });

  it('adds allergens from chosen options but never drops them on removal', () => {
    expect(
      buildAllergens(shake, { milk: ['almond'], whey: 0, addons: ['oats'], remove: ['no-pb'] }),
    ).toEqual(['milk', 'peanut', 'tree_nut', 'wheat']);
  });

  it('keys selections independently of order', () => {
    expect(selectionKey({ b: ['y', 'x'], a: 2 })).toBe(selectionKey({ a: 2, b: ['x', 'y'] }));
    expect(selectionKey({ a: 2 })).not.toBe(selectionKey({ a: 3 }));
  });
});

describe('cart', () => {
  const sel = defaultSelection(shake);
  const add = (cart: Cart, quantity = 1, selection = sel, storeId = 'store-a') =>
    addToCart(cart, { itemId: shake.id, storeId, selection, quantity }, newId);

  it('merges identical builds and keeps different builds apart', () => {
    let r = add(EMPTY_CART, 2);
    if (!r.ok) throw new Error();
    r = add(r.cart, 1, { ...sel, milk: ['lowfat'] });
    if (!r.ok) throw new Error();
    expect(r.cart.lines).toHaveLength(1);
    expect(r.cart.lines[0]?.quantity).toBe(3);
    r = add(r.cart, 1, { ...sel, whey: 2 });
    if (!r.ok) throw new Error();
    expect(r.cart.lines).toHaveLength(2);
  });

  it('caps a line at the maximum quantity and says so', () => {
    const r = add(EMPTY_CART, MAX_LINE_QUANTITY + 5);
    expect(r.ok && r.cart.lines[0]?.quantity).toBe(MAX_LINE_QUANTITY);
    expect(r.ok && r.capped).toBe(true);
  });

  it('rejects zero, negative or non-numeric quantities', () => {
    expect(add(EMPTY_CART, 0)).toEqual({ ok: false, reason: 'invalid_quantity' });
    expect(add(EMPTY_CART, -1)).toEqual({ ok: false, reason: 'invalid_quantity' });
    expect(add(EMPTY_CART, Number.NaN)).toEqual({ ok: false, reason: 'invalid_quantity' });
  });

  it('refuses items from a different store', () => {
    const r = add(EMPTY_CART);
    if (!r.ok) throw new Error();
    expect(add(r.cart, 1, sel, 'store-b')).toEqual({ ok: false, reason: 'different_store' });
  });

  it('removes a line at quantity 0 and forgets the store when empty', () => {
    const r = add(EMPTY_CART);
    if (!r.ok) throw new Error();
    const id = r.cart.lines[0]!.id;
    expect(setLineQuantity(r.cart, id, 0)).toEqual(EMPTY_CART);
  });

  it('merges lines when an edit makes two builds identical', () => {
    let r = add(EMPTY_CART, 2);
    if (!r.ok) throw new Error();
    r = add(r.cart, 3, { ...sel, whey: 2 });
    if (!r.ok) throw new Error();
    const second = r.cart.lines[1]!.id;
    const edited = updateLineSelection(r.cart, second, sel);
    expect(edited.lines).toHaveLength(1);
    expect(edited.lines[0]?.quantity).toBe(5);
  });

  it('prices from the current menu and flags lines that can no longer be ordered', () => {
    let r = add(EMPTY_CART, 2, { ...sel, whey: 2 });
    if (!r.ok) throw new Error();
    r = add(r.cart, 1, { ...sel, milk: ['oat'] });
    if (!r.ok) throw new Error();
    const priced = priceCart(r.cart, find);
    expect(priced.lines[0]?.lineTotal).toBe(2 * 850);
    expect(priced.lines[1]?.problem).toBe('build_invalid');
    expect(priced.subtotal).toBe(1700);
    expect(priced.itemCount).toBe(2);
    expect(priced.nutrition.kcal).toBe(2 * 640);
    expect(priced.orderable).toBe(false);

    const gone = priceCart(r.cart, () => undefined);
    expect(gone.lines.every((l) => l.problem === 'missing_item')).toBe(true);
    expect(gone.subtotal).toBe(0);
    expect(priceCart(EMPTY_CART, find).orderable).toBe(false);
  });
});
