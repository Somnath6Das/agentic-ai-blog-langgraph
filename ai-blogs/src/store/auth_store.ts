import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface User {
  id: number;
  name: string | null;
  email: string;
  avatar_url: string | null;
  created_at: string;
}
type AuthStore = {
  user: User | null;
  setAuth: (user: User) => void;
  clearAuth: () => void;
  updateName: (name: string) => void;
  updateAvatar: (avatar_url: string) => void; // add this
};

const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      setAuth: (user) => set({ user }),
      clearAuth: () => set({ user: null }),
      updateName: (name) =>
        set((state) => ({
          user: state.user ? { ...state.user, name } : null,
        })),
      updateAvatar: (avatar_url) =>
        set((state) => ({
          user: state.user ? { ...state.user, avatar_url } : null,
        })),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export default useAuthStore;
