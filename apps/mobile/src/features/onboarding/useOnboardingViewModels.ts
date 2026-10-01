import {
  allowedGoals,
  bmiCategory,
  bodyResult,
  buildPlan,
  calculateBmi,
  cmToFeetInches,
  goalTarget,
  healthyWeightRange,
  kgToLbs,
  lbsToKg,
  paceOptions,
  suggestedGoal,
  type Goal,
  type Pace,
} from '@healthyapp/shared';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';

import { useProfileStore, type Profile } from '@/features/profile/profile.store';

import { useOnboardingStore } from './onboarding.store';
import {
  FIELD_ORDER,
  heightCmFromDraft,
  parseNumber,
  validateDetails,
  weightKgFromDraft,
  type DetailsField,
} from './validation';

export const ONBOARDING_STEPS = 4;

/** Begin onboarding: fresh for a new user, prefilled when updating an existing plan. */
export function startOnboarding(profile: Profile | null) {
  useOnboardingStore.getState().start(profile);
  router.push('/onboarding/details');
}

/** Step 1: details form (spec 1.3). Validates on blur, and everything on submit. */
export function useDetailsViewModel() {
  const details = useOnboardingStore((s) => s.details);
  const setDetails = useOnboardingStore((s) => s.setDetails);
  const [touched, setTouched] = useState<Partial<Record<DetailsField, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);

  const result = useMemo(() => validateDetails(details), [details]);
  const errorFor = (field: DetailsField) =>
    touched[field] || submitted ? (result.errors[field] ?? null) : null;

  const preview = useMemo(() => {
    const heightCm = heightCmFromDraft(details);
    const weightKg = weightKgFromDraft(details);
    if (heightCm === null || weightKg === null) return null;
    // Adult BMI labels don't apply to under-18s or in pregnancy (see the result step).
    const age = parseNumber(details.ageText);
    if ((age !== null && age < 18) || (details.sex === 'female' && details.pregnant)) return null;
    const bmi = calculateBmi(weightKg, heightCm);
    return { bmi, category: bmiCategory(bmi), range: healthyWeightRange(heightCm) };
  }, [details]);

  return {
    details,
    setDetails,
    preview,
    errorFor,
    hasErrors: submitted && Object.keys(result.errors).length > 0,
    firstError: FIELD_ORDER.find((f) => result.errors[f]) ?? null,
    touch: (field: DetailsField) => setTouched((t) => ({ ...t, [field]: true })),
    /** Switch units, converting whatever valid value is already there. */
    toggleHeightUnit: () => {
      if (details.heightUnit === 'ft') {
        const cm = heightCmFromDraft(details);
        setDetails({ heightUnit: 'cm', heightCmText: cm === null ? '' : String(cm) });
      } else {
        const cm = parseNumber(details.heightCmText);
        const ftIn = cm === null ? null : cmToFeetInches(cm);
        setDetails({
          heightUnit: 'ft',
          feetText: ftIn ? String(ftIn.feet) : '',
          inchesText: ftIn ? String(ftIn.inches) : '',
        });
      }
    },
    toggleWeightUnit: () => {
      const value = parseNumber(details.weightText);
      if (details.weightUnit === 'kg') {
        setDetails({ weightUnit: 'lbs', weightText: value === null ? '' : String(kgToLbs(value)) });
      } else {
        setDetails({ weightUnit: 'kg', weightText: value === null ? '' : String(lbsToKg(value)) });
      }
    },
    submit: () => {
      setSubmitted(true);
      if (result.body) router.push('/onboarding/result');
    },
  };
}

/** The validated body from the draft; null means the user skipped step 1 (deep link). */
function useDraftBody() {
  const details = useOnboardingStore((s) => s.details);
  return useMemo(() => validateDetails(details), [details]);
}

/** Step 2: body result (spec 1.5). */
export function useResultViewModel() {
  const { body, name } = useDraftBody();
  const result = useMemo(() => (body ? bodyResult(body) : null), [body]);
  return { body, name, result };
}

/** Step 3: goal, pace and meals a day (spec 1.6). */
export function useGoalViewModel() {
  const { body } = useDraftBody();
  const { goal: chosenGoal, pace: chosenPace, mealsPerDay } = useOnboardingStore();
  const { setGoal, setPace, setMealsPerDay } = useOnboardingStore.getState();
  const today = useMemo(() => new Date(), []);

  return useMemo(() => {
    if (!body) return null;
    const goals = allowedGoals(body);
    const suggested = suggestedGoal(body);
    // A goal saved earlier may no longer be safe after the body details changed.
    const goal: Goal = chosenGoal && goals.includes(chosenGoal) ? chosenGoal : suggested;
    const paces = paceOptions(body, goal, today);
    const allowedPaces = paces.filter((p) => p.allowed).map((p) => p.pace);
    const pace: Pace =
      allowedPaces.includes(chosenPace) || allowedPaces.length === 0
        ? chosenPace
        : (allowedPaces[allowedPaces.length - 1] ?? chosenPace);
    return {
      body,
      goals,
      suggested,
      goal,
      paces,
      pace,
      noSafePace: paces.length > 0 && allowedPaces.length === 0,
      target: goalTarget(body, goal),
      mealsPerDay,
      setGoal,
      setPace,
      setMealsPerDay,
      next: () => {
        // Persist the resolved choices so step 4 uses exactly what was shown.
        setGoal(goal);
        setPace(pace);
        router.push('/onboarding/plan');
      },
    };
  }, [body, chosenGoal, chosenPace, mealsPerDay, today, setGoal, setPace, setMealsPerDay]);
}

/** Step 4: the plan (spec 1.7), and saving it. */
export function usePlanViewModel() {
  const { body, name } = useDraftBody();
  const { goal, pace, mealsPerDay, details } = useOnboardingStore();
  const existing = useProfileStore((s) => s.profile);
  const saveProfile = useProfileStore((s) => s.saveProfile);
  const now = useMemo(() => new Date(), []);

  const plan = useMemo(
    () =>
      body
        ? buildPlan({ body, goal: goal ?? suggestedGoal(body), pace, mealsPerDay, today: now })
        : null,
    [body, goal, pace, mealsPerDay, now],
  );

  return {
    body,
    plan,
    isUpdate: existing !== null,
    save: () => {
      if (!body || !plan) return false;
      saveProfile({
        name,
        body,
        goal: plan.goal,
        pace: plan.pace ?? pace,
        mealsPerDay,
        planCreatedAt: now.toISOString(),
        units: { height: details.heightUnit, weight: details.weightUnit },
      });
      return true;
    },
  };
}
