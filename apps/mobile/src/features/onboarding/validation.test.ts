import { describe, expect, it } from 'vitest';

import { parseNumber, validateDetails, type DetailsDraft } from './validation';

const valid: DetailsDraft = {
  name: 'Hamza Ali',
  ageText: '28',
  sex: 'male',
  pregnant: null,
  heightUnit: 'ft',
  feetText: '5',
  inchesText: '9',
  heightCmText: '',
  weightUnit: 'kg',
  weightText: '78',
  waistText: '',
  activity: 'light',
};

describe('parseNumber', () => {
  it.each([
    ['78', 78],
    ['78.5', 78.5],
    ['78,5', 78.5],
    [' 78 ', 78],
    ['', null],
    ['7 8', null],
    ['-5', null],
    ['1e3', null],
    ['abc', null],
    ['5.', null],
  ])('%j → %j', (text, expected) => {
    expect(parseNumber(text)).toBe(expected);
  });
});

describe('validateDetails', () => {
  it('builds the body input for a valid draft', () => {
    const r = validateDetails(valid);
    expect(r.errors).toEqual({});
    expect(r.body).toEqual({
      sex: 'male',
      age: 28,
      heightCm: 175.3,
      weightKg: 78,
      activity: 'light',
      waistCm: undefined,
      pregnantOrBreastfeeding: false,
    });
  });

  it('cleans up and checks names', () => {
    expect(validateDetails({ ...valid, name: '  Hamza   Ali ' }).name).toBe('Hamza Ali');
    expect(validateDetails({ ...valid, name: "M. D'Souza-Khan" }).errors.name).toBeUndefined();
    expect(validateDetails({ ...valid, name: 'حمزہ' }).errors.name).toBeUndefined();
    expect(validateDetails({ ...valid, name: 'H' }).errors.name).toBe('name_length');
    expect(validateDetails({ ...valid, name: 'x'.repeat(41) }).errors.name).toBe('name_length');
    expect(validateDetails({ ...valid, name: 'Hamza2' }).errors.name).toBe('name_chars');
    expect(validateDetails({ ...valid, name: '-Hamza' }).errors.name).toBe('name_chars');
  });

  it('checks age bounds and whole years', () => {
    expect(validateDetails({ ...valid, ageText: '12' }).errors.age).toBe('age_range');
    expect(validateDetails({ ...valid, ageText: '91' }).errors.age).toBe('age_range');
    expect(validateDetails({ ...valid, ageText: '28.5' }).errors.age).toBe('age_range');
    expect(validateDetails({ ...valid, ageText: '13' }).errors.age).toBeUndefined();
  });

  it('asks women about pregnancy, and only women', () => {
    expect(validateDetails({ ...valid, sex: 'female' }).errors.pregnant).toBe('required');
    const r = validateDetails({ ...valid, sex: 'female', pregnant: true });
    expect(r.body?.pregnantOrBreastfeeding).toBe(true);
    // A stale "yes" from switching sex must not leak into a man's profile.
    expect(validateDetails({ ...valid, pregnant: true }).body?.pregnantOrBreastfeeding).toBe(false);
  });

  it('handles height in feet/inches and cm', () => {
    expect(validateDetails({ ...valid, inchesText: '' }).body?.heightCm).toBe(152.4);
    expect(validateDetails({ ...valid, inchesText: '12' }).errors.height).toBe('height_range');
    expect(validateDetails({ ...valid, feetText: '3' }).errors.height).toBe('height_range');
    expect(validateDetails({ ...valid, feetText: '5.5' }).errors.height).toBe('height_range');
    const cm = { ...valid, heightUnit: 'cm' as const };
    expect(validateDetails({ ...cm, heightCmText: '175.3' }).body?.heightCm).toBe(175.3);
    expect(validateDetails({ ...cm, heightCmText: '100' }).errors.height).toBe('height_range');
  });

  it('handles weight in kg and lbs', () => {
    expect(validateDetails({ ...valid, weightText: '29' }).errors.weight).toBe('weight_range_kg');
    expect(validateDetails({ ...valid, weightText: '78.46' }).body?.weightKg).toBe(78.5);
    const lbs = { ...valid, weightUnit: 'lbs' as const };
    expect(validateDetails({ ...lbs, weightText: '172' }).body?.weightKg).toBe(78);
    expect(validateDetails({ ...lbs, weightText: '50' }).errors.weight).toBe('weight_range_lbs');
  });

  it('treats waist as optional but checks it when given', () => {
    expect(validateDetails({ ...valid, waistText: '34' }).body?.waistCm).toBe(86.4);
    expect(validateDetails({ ...valid, waistText: '200' }).errors.waist).toBe('waist_range');
  });

  it('requires sex and activity', () => {
    const r = validateDetails({ ...valid, sex: null, activity: null });
    expect(r.errors).toMatchObject({ sex: 'required', activity: 'required' });
    expect(r.body).toBeNull();
  });
});
