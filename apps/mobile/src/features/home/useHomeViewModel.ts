import { defaultSelection, type MenuItem } from '@healthyapp/shared';
import { useMemo } from 'react';

import { useCartStore, usePricedCart } from '@/features/cart/cart.store';
import { getMenu } from '@/features/menu/menu.repository';
import { useMenuFit } from '@/features/menu/useMenuFit';
import { usePlan } from '@/features/profile/profile.store';

export type Greeting = 'morning' | 'afternoon' | 'evening';

export function greetingFor(hour: number): Greeting {
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

export type QuickAddResult = 'added' | 'capped' | 'different_store' | 'failed';

/**
 * Home screen state. "Today" only counts food ordered through the app; ordering isn't live yet,
 * so the tally is zero and the card says the first order starts it (spec 2.1).
 */
export function useHomeViewModel() {
  const { profile, plan } = usePlan();
  const fit = useMenuFit();
  const priced = usePricedCart();
  const add = useCartStore((s) => s.add);

  const { featured, more } = useMemo(() => {
    const menu = getMenu().filter((m) => m.available);
    if (!fit) {
      const [first, ...rest] = menu;
      return { featured: first ?? null, more: rest };
    }
    // Best pick for right now: fits the plan, then most protein.
    const ranked = [...menu].sort((a, b) => {
      const fa = fit(a).fits ? 1 : 0;
      const fb = fit(b).fits ? 1 : 0;
      return fb - fa || b.base.proteinG - a.base.proteinG;
    });
    const [first, ...rest] = ranked;
    return { featured: first ?? null, more: rest };
  }, [fit]);

  const consumed = { kcal: 0, proteinG: 0, sugarG: 0 };

  return {
    greeting: greetingFor(new Date().getHours()),
    firstName: profile ? (profile.name.split(' ')[0] ?? profile.name) : null,
    deliveryAddress: null as string | null,
    plan,
    consumed,
    todayProgress: plan ? consumed.kcal / plan.kcal : 0,
    featured,
    more,
    fits: (item: MenuItem) => fit?.(item).fits ?? false,
    cartCount: priced.itemCount,
    cartTotal: priced.subtotal,
    /** "Add as is" with the default build (spec 2.5). */
    quickAdd: (item: MenuItem): QuickAddResult => {
      const result = add({
        itemId: item.id,
        storeId: item.storeId,
        selection: defaultSelection(item),
        quantity: 1,
      });
      if (result.ok) return result.capped ? 'capped' : 'added';
      return result.reason === 'different_store' ? 'different_store' : 'failed';
    },
  };
}
