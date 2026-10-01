import { buildNutrition, buildPrice, selectionKey, validateBuild, type BuildIssue } from './build';
import { ZERO_NUTRITION, type BuildSelection, type MenuItem, type Nutrition } from './types';

/** Most of one build per line; protects kitchens and riders from accidental huge orders. */
export const MAX_LINE_QUANTITY = 10;

export interface CartLine {
  id: string;
  itemId: string;
  storeId: string;
  selection: BuildSelection;
  quantity: number;
}

/** A cart holds one store's items (spec 4.1). Prices are never stored: they're re-read. */
export interface Cart {
  storeId: string | null;
  lines: CartLine[];
}

export const EMPTY_CART: Cart = { storeId: null, lines: [] };

export interface AddRequest {
  itemId: string;
  storeId: string;
  selection: BuildSelection;
  quantity: number;
}

export type AddResult =
  | { ok: true; cart: Cart; capped: boolean }
  | { ok: false; reason: 'different_store' | 'invalid_quantity' };

function clampQuantity(quantity: number): number {
  return Math.min(MAX_LINE_QUANTITY, Math.max(0, Math.floor(quantity)));
}

/** Add a build; an identical build already in the cart just gets a higher quantity. */
export function addToCart(cart: Cart, request: AddRequest, newId: () => string): AddResult {
  if (!Number.isFinite(request.quantity) || request.quantity < 1) {
    return { ok: false, reason: 'invalid_quantity' };
  }
  if (cart.storeId !== null && cart.storeId !== request.storeId && cart.lines.length > 0) {
    return { ok: false, reason: 'different_store' };
  }
  const key = selectionKey(request.selection);
  const existing = cart.lines.find(
    (l) => l.itemId === request.itemId && selectionKey(l.selection) === key,
  );
  if (existing) {
    const wanted = existing.quantity + Math.floor(request.quantity);
    const quantity = clampQuantity(wanted);
    return {
      ok: true,
      capped: quantity < wanted,
      cart: {
        storeId: request.storeId,
        lines: cart.lines.map((l) => (l.id === existing.id ? { ...l, quantity } : l)),
      },
    };
  }
  const quantity = clampQuantity(request.quantity);
  return {
    ok: true,
    capped: quantity < Math.floor(request.quantity),
    cart: {
      storeId: request.storeId,
      lines: [
        ...cart.lines,
        {
          id: newId(),
          itemId: request.itemId,
          storeId: request.storeId,
          selection: request.selection,
          quantity,
        },
      ],
    },
  };
}

/** Quantity 0 removes the line. An empty cart forgets its store. */
export function setLineQuantity(cart: Cart, lineId: string, quantity: number): Cart {
  const q = clampQuantity(quantity);
  const lines =
    q === 0
      ? cart.lines.filter((l) => l.id !== lineId)
      : cart.lines.map((l) => (l.id === lineId ? { ...l, quantity: q } : l));
  return { storeId: lines.length ? cart.storeId : null, lines };
}

/** Change a line's build (edit from the cart). Merges into an identical line if one exists. */
export function updateLineSelection(cart: Cart, lineId: string, selection: BuildSelection): Cart {
  const line = cart.lines.find((l) => l.id === lineId);
  if (!line) return cart;
  const key = selectionKey(selection);
  const twin = cart.lines.find(
    (l) => l.id !== lineId && l.itemId === line.itemId && selectionKey(l.selection) === key,
  );
  if (twin) {
    return {
      ...cart,
      lines: cart.lines
        .filter((l) => l.id !== lineId)
        .map((l) =>
          l.id === twin.id ? { ...l, quantity: clampQuantity(l.quantity + line.quantity) } : l,
        ),
    };
  }
  return {
    ...cart,
    lines: cart.lines.map((l) => (l.id === lineId ? { ...l, selection } : l)),
  };
}

export type LineProblem = 'missing_item' | 'build_invalid';

export interface PricedLine {
  line: CartLine;
  item: MenuItem | null;
  unitPrice: number;
  unitNutrition: Nutrition;
  lineTotal: number;
  problem: LineProblem | null;
  issues: BuildIssue[];
}

export interface PricedCart {
  lines: PricedLine[];
  itemCount: number;
  subtotal: number;
  nutrition: Nutrition;
  /** True when every line can be ordered as-is. */
  orderable: boolean;
}

function addNutrition(a: Nutrition, b: Nutrition, times: number): Nutrition {
  return {
    kcal: a.kcal + b.kcal * times,
    proteinG: a.proteinG + b.proteinG * times,
    carbsG: a.carbsG + b.carbsG * times,
    fatG: a.fatG + b.fatG * times,
    sugarG: a.sugarG + b.sugarG * times,
  };
}

/**
 * Join the cart with the current menu. Lines whose meal disappeared or whose options became
 * unavailable are flagged (never silently changed) and left out of the totals.
 */
export function priceCart(cart: Cart, findItem: (id: string) => MenuItem | undefined): PricedCart {
  const lines: PricedLine[] = cart.lines.map((line) => {
    const item = findItem(line.itemId) ?? null;
    if (!item) {
      return {
        line,
        item,
        unitPrice: 0,
        unitNutrition: ZERO_NUTRITION,
        lineTotal: 0,
        problem: 'missing_item',
        issues: [],
      };
    }
    const issues = validateBuild(item, line.selection);
    const unitPrice = buildPrice(item, line.selection);
    return {
      line,
      item,
      unitPrice,
      unitNutrition: buildNutrition(item, line.selection),
      lineTotal: unitPrice * line.quantity,
      problem: issues.length ? 'build_invalid' : null,
      issues,
    };
  });

  const valid = lines.filter((l) => l.problem === null);
  return {
    lines,
    itemCount: valid.reduce((n, l) => n + l.line.quantity, 0),
    subtotal: valid.reduce((sum, l) => sum + l.lineTotal, 0),
    nutrition: valid.reduce((n, l) => addNutrition(n, l.unitNutrition, l.line.quantity), {
      ...ZERO_NUTRITION,
    }),
    orderable: lines.length > 0 && valid.length === lines.length,
  };
}
