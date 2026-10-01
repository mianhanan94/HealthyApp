import {
  bmiCategory,
  calculateBmi,
  healthyWeightRange,
  type BmiCategory,
} from '@healthyapp/shared';
import { useMemo, useState } from 'react';

// Spec 1.3: height 4′0″–7′11″, weight 30–200 kg.
export const HEIGHT_CM = { min: 122, max: 241 } as const;
export const WEIGHT_KG = { min: 30, max: 200 } as const;

type Field = 'height' | 'weight';

function parseInRange(text: string, range: { min: number; max: number }): number | null {
  const value = Number(text.replace(',', '.'));
  if (text.trim() === '' || !Number.isFinite(value)) return null;
  return value >= range.min && value <= range.max ? value : null;
}

export interface BmiPreview {
  bmi: number;
  category: BmiCategory;
  healthyMinKg: number;
  healthyMaxKg: number;
}

/**
 * ViewModel for the live BMI preview (spec 1.3). Holds raw text input, validates on blur,
 * and derives the preview from the shared health maths. No UI code here.
 */
export function useBodyCheckViewModel() {
  const [heightText, setHeightText] = useState('');
  const [weightText, setWeightText] = useState('');
  const [touched, setTouched] = useState<Record<Field, boolean>>({ height: false, weight: false });

  const heightCm = parseInRange(heightText, HEIGHT_CM);
  const weightKg = parseInRange(weightText, WEIGHT_KG);

  const preview = useMemo<BmiPreview | null>(() => {
    if (heightCm === null || weightKg === null) return null;
    const bmi = calculateBmi(weightKg, heightCm);
    const range = healthyWeightRange(heightCm);
    return {
      bmi,
      category: bmiCategory(bmi),
      healthyMinKg: range.minKg,
      healthyMaxKg: range.maxKg,
    };
  }, [heightCm, weightKg]);

  return {
    heightText,
    weightText,
    setHeightText,
    setWeightText,
    markTouched: (field: Field) => setTouched((t) => ({ ...t, [field]: true })),
    // Errors show only after the user leaves a field (validate on blur, not on keystroke).
    heightInvalid: touched.height && heightCm === null,
    weightInvalid: touched.weight && weightKg === null,
    preview,
  };
}
