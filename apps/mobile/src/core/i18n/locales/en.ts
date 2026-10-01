const en = {
  home: {
    title: 'HealthyApp',
    subtitle: 'Foundation build. Screens arrive feature by feature.',
    bodyCheck: 'Check my BMI',
    language: 'Language',
  },
  bodyCheck: {
    title: 'Your body',
    height: 'Height',
    weight: 'Weight',
    cm: 'cm',
    kg: 'kg',
    bmiLine: 'BMI {{bmi}} · {{category}}',
    healthyRange: 'Healthy for your height is {{min}}–{{max}} kg.',
    errors: {
      height: 'Enter a height between {{min}} and {{max}} cm.',
      weight: 'Enter a weight between {{min}} and {{max}} kg.',
    },
  },
  bmiCategory: {
    underweight: 'Underweight',
    healthy: 'Healthy',
    overweight: 'Overweight',
    obese: 'Obese',
  },
  language: {
    en: 'English',
    'ur-Latn': 'Roman Urdu',
  },
};

export default en;
export type Translations = typeof en;
