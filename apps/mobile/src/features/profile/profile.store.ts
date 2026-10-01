import {
  buildPlan,
  type BodyInput,
  type Goal,
  type MealsPerDay,
  type NutritionPlan,
  type Pace,
} from '@healthyapp/shared';
import { useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { deviceStorage } from '@/core/storage';

export type HeightUnit = 'ft' | 'cm';
export type WeightUnit = 'kg' | 'lbs';

/**
 * What the user told us. The plan itself is never stored: it is recalculated from these inputs,
 * so a fix to the maths reaches everyone. `planCreatedAt` anchors the target date.
 */
export interface Profile {
  name: string;
  body: BodyInput;
  goal: Goal;
  pace: Pace;
  mealsPerDay: MealsPerDay;
  /** ISO date-time. */
  planCreatedAt: string;
  units: { height: HeightUnit; weight: WeightUnit };
}

interface ProfileState {
  profile: Profile | null;
  saveProfile: (profile: Profile) => void;
  /** "Delete my body details" (spec 6.1 privacy). */
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: null,
      saveProfile: (profile) => set({ profile }),
      clearProfile: () => set({ profile: null }),
    }),
    { name: 'profile', storage: deviceStorage, version: 1 },
  ),
);

export function planFromProfile(profile: Profile): NutritionPlan {
  return buildPlan({
    body: profile.body,
    goal: profile.goal,
    pace: profile.pace,
    mealsPerDay: profile.mealsPerDay,
    today: new Date(profile.planCreatedAt),
  });
}

export function usePlan(): { profile: Profile | null; plan: NutritionPlan | null } {
  const profile = useProfileStore((s) => s.profile);
  const plan = useMemo(() => (profile ? planFromProfile(profile) : null), [profile]);
  return { profile, plan };
}

const RECHECK_DAYS = 28;

/** Spec: suggest a gentle body re-check every 4 weeks, never daily. */
export function isRecheckDue(profile: Profile, now: Date = new Date()): boolean {
  const days = (now.getTime() - new Date(profile.planCreatedAt).getTime()) / 86_400_000;
  return days >= RECHECK_DAYS;
}
