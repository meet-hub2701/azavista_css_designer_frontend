import { create } from 'zustand';

interface ThemeState {
  mode: 'original' | 'platform';
  toggleMode: () => void;
  setMode: (mode: 'original' | 'platform') => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'original',
  toggleMode: () => set((state) => ({ mode: state.mode === 'original' ? 'platform' : 'original' })),
  setMode: (mode) => set({ mode }),
}));
