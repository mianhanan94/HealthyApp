import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en';
import urLatn from './locales/ur-Latn';

export const LANGUAGES = ['en', 'ur-Latn'] as const;
export type Language = (typeof LANGUAGES)[number];

/** English is the default regardless of device language (product decision). */
export const DEFAULT_LANGUAGE: Language = 'en';

export const resources = {
  en: { translation: en },
  'ur-Latn': { translation: urLatn },
} as const;

const i18n = createInstance();

// TODO: persist the chosen language once local storage is added.
void i18n.use(initReactI18next).init({
  resources,
  lng: DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: { escapeValue: false },
});

export default i18n;
