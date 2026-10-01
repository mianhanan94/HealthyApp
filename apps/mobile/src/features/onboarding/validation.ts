import {
  feetInchesToCm,
  inchesToCm,
  lbsToKg,
  type ActivityLevel,
  type BodyInput,
  type Sex,
} from '@healthyapp/shared';

import type { HeightUnit, WeightUnit } from '@/features/profile/profile.store';

// Spec 1.3 ranges.
export const AGE = { min: 13, max: 90 } as const;
export const HEIGHT_CM = { min: 122, max: 241 } as const;
export const FEET = { min: 4, max: 7 } as const;
export const WEIGHT_KG = { min: 30, max: 200 } as const;
export const WEIGHT_LBS = { min: 66, max: 441 } as const;
export const WAIST_IN = { min: 20, max: 70 } as const;
export const NAME_LENGTH = { min: 2, max: 40 } as const;

/** Raw form state: text as typed, so half-typed values ("5.") don't get mangled. */
export interface DetailsDraft {
  name: string;
  ageText: string;
  sex: Sex | null;
  /** Asked only for women. */
  pregnant: boolean | null;
  heightUnit: HeightUnit;
  feetText: string;
  inchesText: string;
  heightCmText: string;
  weightUnit: WeightUnit;
  weightText: string;
  waistText: string;
  activity: ActivityLevel | null;
}

export type DetailsField =
  'name' | 'age' | 'sex' | 'pregnant' | 'height' | 'weight' | 'waist' | 'activity';

export type DetailsError =
  | 'name_length'
  | 'name_chars'
  | 'age_range'
  | 'required'
  | 'height_range'
  | 'weight_range_kg'
  | 'weight_range_lbs'
  | 'waist_range';

/** Field order on screen, used to report the first problem. */
export const FIELD_ORDER: DetailsField[] = [
  'name',
  'age',
  'sex',
  'pregnant',
  'height',
  'weight',
  'waist',
  'activity',
];

// Letters in any script, spaces, and the punctuation real names use (M. Ali, D'Souza, Abdul-Hannan).
const NAME_PATTERN = /^[\p{L}][\p{L} .'-]*$/u;

/** Accepts "78", "78.5" and "78,5"; rejects anything else. */
export function parseNumber(text: string): number | null {
  const trimmed = text.trim().replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(trimmed)) return null;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : null;
}

function inRange(value: number | null, range: { min: number; max: number }): value is number {
  return value !== null && value >= range.min && value <= range.max;
}

export function heightCmFromDraft(d: DetailsDraft): number | null {
  if (d.heightUnit === 'cm') {
    const cm = parseNumber(d.heightCmText);
    return inRange(cm, HEIGHT_CM) ? cm : null;
  }
  const feet = parseNumber(d.feetText);
  const inches = d.inchesText.trim() === '' ? 0 : parseNumber(d.inchesText);
  if (feet === null || !Number.isInteger(feet) || inches === null || inches >= 12) return null;
  if (!inRange(feet, FEET)) return null;
  const cm = feetInchesToCm(feet, inches);
  return inRange(cm, HEIGHT_CM) ? cm : null;
}

export function weightKgFromDraft(d: DetailsDraft): number | null {
  const value = parseNumber(d.weightText);
  if (value === null) return null;
  const kg = d.weightUnit === 'kg' ? Math.round(value * 10) / 10 : lbsToKg(value);
  return inRange(kg, WEIGHT_KG) ? kg : null;
}

export interface DetailsResult {
  errors: Partial<Record<DetailsField, DetailsError>>;
  body: BodyInput | null;
  name: string;
}

export function validateDetails(d: DetailsDraft): DetailsResult {
  const errors: Partial<Record<DetailsField, DetailsError>> = {};
  const name = d.name.trim().replace(/\s+/g, ' ');

  if (name.length < NAME_LENGTH.min || name.length > NAME_LENGTH.max) errors.name = 'name_length';
  else if (!NAME_PATTERN.test(name)) errors.name = 'name_chars';

  const age = parseNumber(d.ageText);
  if (age === null || !Number.isInteger(age) || !inRange(age, AGE)) errors.age = 'age_range';

  if (!d.sex) errors.sex = 'required';
  if (d.sex === 'female' && d.pregnant === null) errors.pregnant = 'required';

  const heightCm = heightCmFromDraft(d);
  if (heightCm === null) errors.height = 'height_range';

  const weightKg = weightKgFromDraft(d);
  if (weightKg === null)
    errors.weight = d.weightUnit === 'kg' ? 'weight_range_kg' : 'weight_range_lbs';

  let waistCm: number | undefined;
  if (d.waistText.trim() !== '') {
    const inches = parseNumber(d.waistText);
    if (inRange(inches, WAIST_IN)) waistCm = inchesToCm(inches);
    else errors.waist = 'waist_range';
  }

  if (!d.activity) errors.activity = 'required';

  const valid = Object.keys(errors).length === 0;
  return {
    errors,
    name,
    body:
      valid && d.sex && d.activity && age !== null && heightCm !== null && weightKg !== null
        ? {
            sex: d.sex,
            age,
            heightCm,
            weightKg,
            activity: d.activity,
            waistCm,
            pregnantOrBreastfeeding: d.sex === 'female' ? d.pregnant === true : false,
          }
        : null,
  };
}
