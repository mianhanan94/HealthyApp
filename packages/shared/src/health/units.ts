import { round } from './rounding';

const CM_PER_INCH = 2.54;
const KG_PER_LB = 0.45359237;

export function feetInchesToCm(feet: number, inches: number): number {
  return round((feet * 12 + inches) * CM_PER_INCH, 1);
}

export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = Math.round(cm / CM_PER_INCH);
  return { feet: Math.floor(totalInches / 12), inches: totalInches % 12 };
}

export function inchesToCm(inches: number): number {
  return round(inches * CM_PER_INCH, 1);
}

export function cmToInches(cm: number): number {
  return round(cm / CM_PER_INCH, 1);
}

export function lbsToKg(lbs: number): number {
  return round(lbs * KG_PER_LB, 1);
}

export function kgToLbs(kg: number): number {
  return round(kg / KG_PER_LB, 1);
}
