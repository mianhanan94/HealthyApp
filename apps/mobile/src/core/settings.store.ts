import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { DEFAULT_LANGUAGE, type Language } from './i18n';
import { deviceStorage } from './storage';

interface SettingsState {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: DEFAULT_LANGUAGE,
      setLanguage: (language) => set({ language }),
    }),
    { name: 'settings', storage: deviceStorage, version: 1 },
  ),
);
