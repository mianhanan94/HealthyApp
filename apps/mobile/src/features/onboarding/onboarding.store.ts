import {
  cmToFeetInches,
  cmToInches,
  DEFAULT_MEALS_PER_DAY,
  DEFAULT_PACE,
  kgToLbs,
  type Goal,
  type MealsPerDay,
  type Pace,
} from '@healthyapp/shared';
import { create } from 'zustand';

import type { Profile } from '@/features/profile/profile.store';

import type { DetailsDraft } from './validation';

const EMPTY_DETAILS: DetailsDraft = {
  name: '',
  ageText: '',
  sex: null,
  pregnant: null,
  heightUnit: 'ft',
  feetText: '',
  inchesText: '',
  heightCmText: '',
  weightUnit: 'kg',
  weightText: '',
  waistText: '',
  activity: null,
};

interface OnboardingState {
  details: DetailsDraft;
  /** Null until the user picks; the goal screen then shows the suggested goal. */
  goal: Goal | null;
  pace: Pace;
  mealsPerDay: MealsPerDay;
  setDetails: (patch: Partial<DetailsDraft>) => void;
  setGoal: (goal: Goal) => void;
  setPace: (pace: Pace) => void;
  setMealsPerDay: (meals: MealsPerDay) => void;
  /** Fresh draft, or prefilled from a saved profile when updating the plan. */
  start: (profile: Profile | null) => void;
}

function detailsFromProfile(p: Profile): DetailsDraft {
  const { feet, inches } = cmToFeetInches(p.body.heightCm);
  return {
    name: p.name,
    ageText: String(p.body.age),
    sex: p.body.sex,
    pregnant: p.body.sex === 'female' ? (p.body.pregnantOrBreastfeeding ?? false) : null,
    heightUnit: p.units.height,
    feetText: String(feet),
    inchesText: String(inches),
    heightCmText: String(p.body.heightCm),
    weightUnit: p.units.weight,
    weightText: String(p.units.weight === 'kg' ? p.body.weightKg : kgToLbs(p.body.weightKg)),
    waistText: p.body.waistCm === undefined ? '' : String(Math.round(cmToInches(p.body.waistCm))),
    activity: p.body.activity,
  };
}

/** In-memory draft for the onboarding steps; only saved to the profile on the last step. */
export const useOnboardingStore = create<OnboardingState>()((set) => ({
  details: EMPTY_DETAILS,
  goal: null,
  pace: DEFAULT_PACE,
  mealsPerDay: DEFAULT_MEALS_PER_DAY,
  setDetails: (patch) => set((s) => ({ details: { ...s.details, ...patch } })),
  setGoal: (goal) => set({ goal }),
  setPace: (pace) => set({ pace }),
  setMealsPerDay: (mealsPerDay) => set({ mealsPerDay }),
  start: (profile) =>
    set(
      profile
        ? {
            details: detailsFromProfile(profile),
            goal: profile.goal,
            pace: profile.pace,
            mealsPerDay: profile.mealsPerDay,
          }
        : {
            details: EMPTY_DETAILS,
            goal: null,
            pace: DEFAULT_PACE,
            mealsPerDay: DEFAULT_MEALS_PER_DAY,
          },
    ),
}));
