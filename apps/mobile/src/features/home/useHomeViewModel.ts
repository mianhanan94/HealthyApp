import { getMeals } from '@/features/menu/menu.repository';

export type Greeting = 'morning' | 'afternoon' | 'evening';

export function greetingFor(hour: number): Greeting {
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

/**
 * Home screen state. Until sign-in and plans exist, everyone is a guest with no plan and
 * nothing ordered today, so the progress card shows the guest prompt.
 */
export function useHomeViewModel() {
  const [featured, ...more] = getMeals();
  return {
    greeting: greetingFor(new Date().getHours()),
    userName: null as string | null,
    deliveryAddress: null as string | null,
    hasPlan: false,
    todayProgress: 0,
    featured: featured ?? null,
    more,
  };
}
