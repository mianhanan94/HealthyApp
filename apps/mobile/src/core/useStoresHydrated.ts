import { useSyncExternalStore } from 'react';

import { useCartStore } from '@/features/cart/cart.store';
import { useProfileStore } from '@/features/profile/profile.store';

import { useSettingsStore } from './settings.store';

const STORES = [useSettingsStore, useProfileStore, useCartStore];

const allHydrated = () => STORES.every((s) => s.persist.hasHydrated());

function subscribe(onChange: () => void) {
  const unsubs = STORES.map((s) => s.persist.onFinishHydration(onChange));
  return () => unsubs.forEach((u) => u());
}

/** True once every persisted store has loaded from the device, so screens don't flash guest UI. */
export function useStoresHydrated(): boolean {
  return useSyncExternalStore(subscribe, allHydrated, allHydrated);
}
