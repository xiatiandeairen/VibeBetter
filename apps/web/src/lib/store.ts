import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  token: string | null;
  setToken: (token: string | null) => void;
  userName: string;
  setUserName: (name: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      selectedProjectId: '',
      setSelectedProjectId: (id) => set({ selectedProjectId: id }),
      token: null,
      setToken: (token) => set({ token }),
      userName: '',
      setUserName: (name) => set({ userName: name }),
    }),
    { name: 'vibebetter-store' },
  ),
);
