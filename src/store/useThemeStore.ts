import { create } from 'zustand';
import { Theme } from '../shared-types';

interface ThemeStore {
  currentTheme: Theme | null;
  themes: Theme[];
  setCurrentTheme: (theme: Theme | null) => void;
  setThemes: (themes: Theme[]) => void;
  updateCurrentTheme: (updates: Partial<Theme>) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  currentTheme: null,
  themes: [],
  setCurrentTheme: (theme) => set({ currentTheme: theme }),
  setThemes: (themes) => set({ themes }),
  updateCurrentTheme: (updates) =>
    set((state) => ({
      currentTheme: state.currentTheme
        ? { ...state.currentTheme, ...updates }
        : null,
    })),
}));
