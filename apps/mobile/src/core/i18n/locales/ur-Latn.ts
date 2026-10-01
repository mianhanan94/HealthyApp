import type { Translations } from './en';

/** Roman Urdu. Must have exactly the same keys as `en` (enforced by the type). */
const urLatn: Translations = {
  home: {
    title: 'HealthyApp',
    subtitle: 'Foundation build. Screens ek ek feature kar ke aayengi.',
    bodyCheck: 'Apna BMI check karein',
    language: 'Zabaan',
  },
  bodyCheck: {
    title: 'Aapka jism',
    height: 'Qad',
    weight: 'Wazan',
    cm: 'cm',
    kg: 'kg',
    bmiLine: 'BMI {{bmi}} · {{category}}',
    healthyRange: 'Aapke qad ke liye sehatmand wazan {{min}}–{{max}} kg hai.',
    errors: {
      height: '{{min}} aur {{max}} cm ke darmiyan qad likhein.',
      weight: '{{min}} aur {{max}} kg ke darmiyan wazan likhein.',
    },
  },
  bmiCategory: {
    underweight: 'Wazan kam',
    healthy: 'Sehatmand',
    overweight: 'Wazan zyada',
    obese: 'Motapa',
  },
  language: {
    en: 'English',
    'ur-Latn': 'Roman Urdu',
  },
};

export default urLatn;
