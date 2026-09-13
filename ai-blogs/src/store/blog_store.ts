import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface MenuItem {
  id: number;
  user_topic: string;
  title: string;
  file_path?: string;
  images: string[];
}

interface MenuState {
  menuItems: MenuItem[];
  resetKey: number;

  totalPublishedBlog: number; // NEW
  totalGeneratedBlog: number; // NEW

  addMenuItem: (
    item: Omit<MenuItem, "id" | "images"> & { images?: string[] },
  ) => number;
  deleteMenuItem: (id: number) => void;

  addImages: (id: number, imageUrls: string[]) => void;
  removeImage: (id: number, imageUrl: string) => void;

  updateMenuItem: (id: number, updates: Partial<Omit<MenuItem, "id">>) => void;
  triggerCreateBlogReset: () => void;
  clearStore: () => Promise<void>;

  setTotalPublishedBlog: (count: number) => void; // NEW
  setTotalGeneratedBlog: (count: number) => void; // NEW
}
const getRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export const useMenuStore = create<MenuState>()(
  persist(
    (set, get) => ({
      menuItems: [],
      resetKey: 0,

      totalPublishedBlog: 0,
      totalGeneratedBlog: 0,

      triggerCreateBlogReset: () =>
        set((state) => ({ resetKey: state.resetKey + 1 })),
      clearStore: async () => {
        set({
          menuItems: [],
          resetKey: 0,
          totalPublishedBlog: 0,
          totalGeneratedBlog: 0,
        });
        await AsyncStorage.removeItem("menu-store");
      },
      addMenuItem: (item) => {
        // Keep generating until we get an id that isn't already in use
        const existingIds = new Set(get().menuItems.map((m) => m.id));
        let newId = getRandomNumber(1, 1_000_000);
        while (existingIds.has(newId)) {
          newId = getRandomNumber(1, 1_000_000);
        }

        const newItem: MenuItem = {
          id: newId,
          user_topic: item.user_topic,
          title: item.title,
          file_path: item.file_path,
          images: item.images ?? [],
        };
        set((state) => ({
          menuItems: [...state.menuItems, newItem],
        }));
        return newId;
      },

      deleteMenuItem: (id) =>
        set((state) => ({
          menuItems: state.menuItems.filter((item) => item.id !== id),
        })),

      addImages: (id, imageUrls) =>
        set((state) => ({
          menuItems: state.menuItems.map((item) =>
            item.id === id
              ? { ...item, images: [...item.images, ...imageUrls] }
              : item,
          ),
        })),

      removeImage: (id, imageUrl) =>
        set((state) => ({
          menuItems: state.menuItems.map((item) =>
            item.id === id
              ? {
                  ...item,
                  images: item.images.filter((url) => url !== imageUrl),
                }
              : item,
          ),
        })),

      updateMenuItem: (id, updates) =>
        set((state) => ({
          menuItems: state.menuItems.map((item) =>
            item.id === id ? { ...item, ...updates } : item,
          ),
        })),
      // NEW — two setters below
      setTotalPublishedBlog: (count) => set({ totalPublishedBlog: count }),
      setTotalGeneratedBlog: (count) => set({ totalGeneratedBlog: count }),
    }),
    {
      name: "menu-store", // AsyncStorage key
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        menuItems: state.menuItems,
        totalPublishedBlog: state.totalPublishedBlog,
        totalGeneratedBlog: state.totalGeneratedBlog,
      }), // NEW — don't persist resetKey, it's just a signal
    },
  ),
);