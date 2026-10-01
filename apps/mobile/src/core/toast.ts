import { create } from 'zustand';

interface ToastState {
  message: string | null;
  /** Bumped on every show so the same message twice still re-triggers. */
  key: number;
  show: (message: string) => void;
  hide: () => void;
}

export const useToastStore = create<ToastState>()((set) => ({
  message: null,
  key: 0,
  show: (message) => set((s) => ({ message, key: s.key + 1 })),
  hide: () => set({ message: null }),
}));

export const showToast = (message: string) => useToastStore.getState().show(message);
