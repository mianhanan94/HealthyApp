import {
  addToCart,
  EMPTY_CART,
  priceCart,
  setLineQuantity,
  updateLineSelection,
  type AddRequest,
  type AddResult,
  type BuildSelection,
  type Cart,
  type PricedCart,
} from '@healthyapp/shared';
import { useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { deviceStorage, localId } from '@/core/storage';
import { findMenuItem } from '@/features/menu/menu.repository';

interface CartState {
  cart: Cart;
  add: (request: AddRequest) => AddResult;
  /** Clear the cart and add this build (the "start a new cart?" answer). */
  replaceWith: (request: AddRequest) => AddResult;
  setQuantity: (lineId: string, quantity: number) => void;
  updateLine: (lineId: string, selection: BuildSelection, quantity: number) => void;
  clear: () => void;
}

const newLineId = () => localId('line');

/** The cart lives on the phone so it survives restarts and offline use. */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: EMPTY_CART,
      add: (request) => {
        const result = addToCart(get().cart, request, newLineId);
        if (result.ok) set({ cart: result.cart });
        return result;
      },
      replaceWith: (request) => {
        const result = addToCart(EMPTY_CART, request, newLineId);
        if (result.ok) set({ cart: result.cart });
        return result;
      },
      setQuantity: (lineId, quantity) =>
        set((s) => ({ cart: setLineQuantity(s.cart, lineId, quantity) })),
      updateLine: (lineId, selection, quantity) =>
        set((s) => {
          const withQuantity = setLineQuantity(s.cart, lineId, quantity);
          return { cart: updateLineSelection(withQuantity, lineId, selection) };
        }),
      clear: () => set({ cart: EMPTY_CART }),
    }),
    { name: 'cart', storage: deviceStorage, version: 1 },
  ),
);

/** The cart joined with today's menu: current prices, nutrition, and lines that need attention. */
export function usePricedCart(): PricedCart {
  const cart = useCartStore((s) => s.cart);
  return useMemo(() => priceCart(cart, findMenuItem), [cart]);
}
